#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(desktop)]
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalPosition, WebviewWindow, WindowEvent,
};

#[cfg(windows)]
mod background_typing;
#[cfg(windows)]
mod desktop_pointer;
mod updates;

use std::process::Command;

#[tauri::command]
async fn begin_window_drag(window: tauri::WebviewWindow) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::time::Duration;
        use windows_sys::Win32::{
            Foundation::POINT,
            UI::{
                Input::KeyboardAndMouse::{GetAsyncKeyState, VK_LBUTTON},
                WindowsAndMessaging::GetCursorPos,
            },
        };

        let start_pos = window.outer_position().map_err(|e| e.to_string())?;
        let mut start_cursor = POINT { x: 0, y: 0 };
        if unsafe { GetCursorPos(&mut start_cursor) } == 0 {
            return Err("Could not read cursor position".to_string());
        }
        if unsafe { GetAsyncKeyState(i32::from(VK_LBUTTON)) } >= 0 {
            return Ok(());
        }

        tauri::async_runtime::spawn_blocking(move || {
            let mut last = start_cursor;
            while unsafe { GetAsyncKeyState(i32::from(VK_LBUTTON)) } < 0 {
                let mut cur = POINT { x: 0, y: 0 };
                if unsafe { GetCursorPos(&mut cur) } != 0
                    && (cur.x != last.x || cur.y != last.y)
                {
                    let next_x = start_pos.x + (cur.x - start_cursor.x);
                    let next_y = start_pos.y + (cur.y - start_cursor.y);
                    if window
                        .set_position(PhysicalPosition::new(next_x, next_y))
                        .is_err()
                    {
                        break;
                    }
                    last = cur;
                }
                std::thread::sleep(Duration::from_millis(8));
            }
        })
        .await
        .map_err(|e| e.to_string())
    }
    #[cfg(not(windows))]
    {
        window.start_dragging().map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn start_desktop_pointer(window: tauri::WebviewWindow) -> Result<(), String> {
    #[cfg(windows)]
    {
        let (sender, receiver) = std::sync::mpsc::sync_channel(1);
        let pointer_window = window.clone();
        window
            .run_on_main_thread(move || {
                let _ = sender.send(desktop_pointer::start(pointer_window));
            })
            .map_err(|error| error.to_string())?;
        tauri::async_runtime::spawn_blocking(move || receiver.recv())
            .await
            .map_err(|error| error.to_string())?
            .map_err(|error| error.to_string())?
    }
    #[cfg(not(windows))]
    {
        let _ = window;
        Ok(())
    }
}

#[tauri::command]
async fn set_background_typing(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        let window = app
            .get_webview_window("main")
            .ok_or_else(|| "Main window not found".to_string())?;
        let (sender, receiver) = std::sync::mpsc::sync_channel(1);
        let input_window = window.clone();
        window
            .run_on_main_thread(move || {
                let _ = sender.send(background_typing::set(input_window, enabled));
            })
            .map_err(|error| error.to_string())?;
        return tauri::async_runtime::spawn_blocking(move || receiver.recv())
            .await
            .map_err(|error| error.to_string())?
            .map_err(|error| error.to_string())?;
    }
    #[cfg(not(windows))]
    {
        let _ = (app, enabled);
        Err("Background typing is available on Windows".to_string())
    }
}

#[cfg(desktop)]
fn position_popup_beside(
    anchor: &WebviewWindow,
    popup: &WebviewWindow,
    fallback_w: f64,
    fallback_h: f64,
) {
    let Ok(anchor_pos) = anchor.outer_position() else {
        return;
    };
    let Ok(anchor_size) = anchor.outer_size() else {
        return;
    };
    let scale = anchor.scale_factor().unwrap_or(1.0);
    let popup_size = popup.outer_size().ok();
    let popup_w = popup_size
        .map(|s| s.width as i32)
        .filter(|&w| w > 0)
        .unwrap_or_else(|| (fallback_w * scale).round() as i32);
    let popup_h = popup_size
        .map(|s| s.height as i32)
        .filter(|&h| h > 0)
        .unwrap_or_else(|| (fallback_h * scale).round() as i32);
    let gap = (12.0 * scale).round() as i32;
    let mut x = anchor_pos.x + anchor_size.width as i32 + gap;
    let mut y = anchor_pos.y + (8.0 * scale).round() as i32;

    if let Ok(Some(monitor)) = anchor.current_monitor() {
        let mon_pos = monitor.position();
        let mon_size = monitor.size();
        let min_x = mon_pos.x;
        let min_y = mon_pos.y;
        let max_x = mon_pos.x + mon_size.width as i32 - popup_w;
        let max_y = mon_pos.y + mon_size.height as i32 - popup_h;
        if x > max_x {
            let left_x = anchor_pos.x - popup_w - gap;
            x = if left_x >= min_x { left_x } else { max_x };
        }
        x = x.clamp(min_x, max_x.max(min_x));
        y = y.clamp(min_y, max_y.max(min_y));
    }
    let _ = popup.set_position(PhysicalPosition::new(x, y));
}

#[cfg(desktop)]
fn open_settings_window(app: &tauri::AppHandle) -> Result<(), String> {
    let settings = app
        .get_webview_window("settings")
        .ok_or_else(|| "Settings window not found".to_string())?;
    if let Some(main) = app.get_webview_window("main") {
        position_popup_beside(&main, &settings, 276.0, 540.0);
    }
    settings.show().map_err(|e| e.to_string())?;
    settings.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(desktop)]
fn open_wardrobe_window(app: &tauri::AppHandle) -> Result<(), String> {
    let wardrobe = app
        .get_webview_window("wardrobe")
        .ok_or_else(|| "Wardrobe window not found".to_string())?;
    let anchor = app
        .get_webview_window("settings")
        .filter(|w| w.is_visible().unwrap_or(false))
        .or_else(|| app.get_webview_window("main"));
    if let Some(anchor_win) = anchor {
        position_popup_beside(&anchor_win, &wardrobe, 318.0, 584.0);
    }
    wardrobe.show().map_err(|e| e.to_string())?;
    wardrobe.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn toggle_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let settings = app
            .get_webview_window("settings")
            .ok_or_else(|| "Settings window not found".to_string())?;
        if settings.is_visible().unwrap_or(false) {
            settings.hide().map_err(|e| e.to_string())?;
            return Ok(());
        }
        open_settings_window(&app)
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
        Ok(())
    }
}

#[tauri::command]
async fn hide_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(settings) = app.get_webview_window("settings") {
            let _ = settings.hide();
        }
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
    }
    Ok(())
}

#[tauri::command]
async fn toggle_wardrobe_window(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let wardrobe = app
            .get_webview_window("wardrobe")
            .ok_or_else(|| "Wardrobe window not found".to_string())?;
        if wardrobe.is_visible().unwrap_or(false) {
            wardrobe.hide().map_err(|e| e.to_string())?;
            return Ok(());
        }
        open_wardrobe_window(&app)
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
        Ok(())
    }
}

#[tauri::command]
async fn hide_wardrobe_window(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(wardrobe) = app.get_webview_window("wardrobe") {
            let _ = wardrobe.hide();
        }
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
    }
    Ok(())
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("仅支持打开 http 或 https 链接".into());
    }
    #[cfg(windows)]
    let result = Command::new("rundll32")
        .args(["url.dll,FileProtocolHandler", &url])
        .spawn();
    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg(&url).spawn();
    #[cfg(all(unix, not(target_os = "macos")))]
    let result = Command::new("xdg-open").arg(&url).spawn();
    result.map(|_| ()).map_err(|error| error.to_string())
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg(desktop)]
fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn main() {
    let builder = tauri::Builder::default().manage(updates::UpdateState::default());

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "显示打字猫", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "退出打字猫", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &settings, &quit])?;

            let mut tray = TrayIconBuilder::with_id("main-tray")
                .tooltip("打字猫")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => show_main_window(app),
                    "settings" => {
                        show_main_window(app);
                        let _ = open_settings_window(app);
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                });
            if let Some(icon) = app.default_window_icon().cloned() {
                tray = tray.icon(icon);
            }
            tray.build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| match window.label() {
            "main" => {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    if let Some(settings) = window.app_handle().get_webview_window("settings") {
                        let _ = settings.hide();
                    }
                    if let Some(wardrobe) = window.app_handle().get_webview_window("wardrobe") {
                        let _ = wardrobe.hide();
                    }
                    let _ = window.minimize();
                }
            }
            "settings" | "wardrobe" => {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
            _ => {}
        });

    builder
        .invoke_handler(tauri::generate_handler![
            begin_window_drag,
            set_background_typing,
            start_desktop_pointer,
            toggle_settings_window,
            hide_settings_window,
            toggle_wardrobe_window,
            hide_wardrobe_window,
            open_external_url,
            updates::check_for_updates,
            updates::download_update,
            updates::open_update_download_directory,
            quit_app
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Typing Cat");
}

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(desktop)]
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

#[cfg(windows)]
mod background_typing;
#[cfg(windows)]
mod desktop_pointer;

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
async fn set_background_typing(window: tauri::WebviewWindow, enabled: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
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
        let _ = (window, enabled);
        Err("Background typing is available on Windows".to_string())
    }
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
    let builder = tauri::Builder::default();

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }))
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "显示打字猫", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "退出打字猫", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            let mut tray = TrayIconBuilder::with_id("main-tray")
                .tooltip("打字猫")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => show_main_window(app),
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
        .on_window_event(|window, event| {
            if window.label() == "main" {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.minimize();
                }
            }
        });

    builder
        .invoke_handler(tauri::generate_handler![
            set_background_typing,
            start_desktop_pointer
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Typing Cat");
}

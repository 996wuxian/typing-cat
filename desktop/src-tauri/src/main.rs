#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            set_background_typing,
            start_desktop_pointer
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Typing Cat");
}

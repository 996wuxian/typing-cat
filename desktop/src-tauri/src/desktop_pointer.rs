use std::{
    cell::RefCell,
    io,
    mem::size_of,
    sync::atomic::{AtomicBool, Ordering},
    thread::{self, sleep},
    time::Duration,
};
use tauri::{Emitter, WebviewWindow};
use windows_sys::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, POINT, RECT, WPARAM},
    Graphics::Gdi::ClientToScreen,
    UI::{
        Input::{
            GetRawInputData, RegisterRawInputDevices, HRAWINPUT, RAWINPUT, RAWINPUTDEVICE,
            RAWINPUTHEADER, RAWMOUSE, RIDEV_INPUTSINK, RID_INPUT, RIM_TYPEMOUSE,
        },
        Shell::{DefSubclassProc, RemoveWindowSubclass, SetWindowSubclass},
        WindowsAndMessaging::{
            GetClientRect, GetCursorPos, GetSystemMetrics, IsIconic, IsWindow, IsWindowVisible,
            RIM_INPUTSINK, RI_MOUSE_LEFT_BUTTON_DOWN, RI_MOUSE_LEFT_BUTTON_UP,
            RI_MOUSE_RIGHT_BUTTON_DOWN, RI_MOUSE_RIGHT_BUTTON_UP, SM_CXVIRTUALSCREEN,
            SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN, WM_INPUT, WM_NCDESTROY,
        },
    },
};

static STARTED: AtomicBool = AtomicBool::new(false);
const SUBCLASS_ID: usize = 2;
thread_local! {
    static MOUSE_WINDOW: RefCell<Option<WebviewWindow>> = const { RefCell::new(None) };
}

fn button_flags(lparam: LPARAM) -> Option<u16> {
    let mut packet = RAWINPUT::default();
    let mut size = size_of::<RAWINPUT>() as u32;
    let header = size_of::<RAWINPUTHEADER>() as u32;
    let received = unsafe {
        GetRawInputData(
            lparam as HRAWINPUT,
            RID_INPUT,
            (&mut packet as *mut RAWINPUT).cast(),
            &mut size,
            header,
        )
    };
    if received == u32::MAX
        || received < header + size_of::<RAWMOUSE>() as u32
        || packet.header.dwType != RIM_TYPEMOUSE
    {
        return None;
    }
    Some(unsafe { packet.data.mouse.Anonymous.Anonymous.usButtonFlags })
}

unsafe extern "system" fn mouse_proc(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    _id: usize,
    _data: usize,
) -> LRESULT {
    if message == WM_INPUT {
        if let Some(flags) = button_flags(lparam).filter(|&flags| flags & 0x0f != 0) {
            let window = MOUSE_WINDOW.with(|state| state.borrow().clone());
            if let Some(window) = window {
                let background = wparam & 0xff == RIM_INPUTSINK as usize;
                for (flag, side, down) in [
                    (RI_MOUSE_LEFT_BUTTON_DOWN, "left", true),
                    (RI_MOUSE_LEFT_BUTTON_UP, "left", false),
                    (RI_MOUSE_RIGHT_BUTTON_DOWN, "right", true),
                    (RI_MOUSE_RIGHT_BUTTON_UP, "right", false),
                ] {
                    if flags & flag as u16 != 0 && (background || !down) {
                        let _ =
                            window.emit_to(window.label(), "desktop-mouse-button", (side, down));
                    }
                }
            }
        }
    } else if message == WM_NCDESTROY {
        MOUSE_WINDOW.with(|state| state.borrow_mut().take());
        unsafe { RemoveWindowSubclass(hwnd, Some(mouse_proc), SUBCLASS_ID) };
    }
    unsafe { DefSubclassProc(hwnd, message, wparam, lparam) }
}

fn listen_for_mouse(window: WebviewWindow, hwnd: HWND) -> Result<(), String> {
    let mouse = RAWINPUTDEVICE {
        usUsagePage: 1,
        usUsage: 2,
        dwFlags: RIDEV_INPUTSINK,
        hwndTarget: hwnd,
    };
    if unsafe { SetWindowSubclass(hwnd, Some(mouse_proc), SUBCLASS_ID, 0) } == 0 {
        return Err("Could not attach the desktop mouse listener".to_string());
    }
    if unsafe { RegisterRawInputDevices(&mouse, 1, size_of::<RAWINPUTDEVICE>() as u32) } == 0 {
        let error = io::Error::last_os_error();
        unsafe { RemoveWindowSubclass(hwnd, Some(mouse_proc), SUBCLASS_ID) };
        return Err(error.to_string());
    }
    MOUSE_WINDOW.with(|state| *state.borrow_mut() = Some(window));
    Ok(())
}

fn pointer_axis(
    cursor: i32,
    origin: i32,
    size: i32,
    desktop_origin: i32,
    desktop_size: i32,
) -> f64 {
    let half = f64::from(size) * 0.5;
    let center = f64::from(origin) + half;
    let delta = f64::from(cursor) - center;
    let distance = delta.abs();
    let edge = if delta < 0.0 {
        center - f64::from(desktop_origin)
    } else {
        f64::from(desktop_origin) + f64::from(desktop_size) - center
    };
    // Reserve some range beyond the window so movements on the desktop stay visible.
    let range = if distance <= half {
        0.58 * distance / half
    } else {
        0.58 + 0.42 * ((distance - half) / (edge - half).max(1.0)).min(1.0)
    };
    range.copysign(delta)
}

fn position(hwnd: HWND) -> Option<(f64, f64)> {
    let mut cursor = POINT::default();
    let mut origin = POINT::default();
    let mut rect = RECT::default();
    unsafe {
        if GetCursorPos(&mut cursor) == 0
            || GetClientRect(hwnd, &mut rect) == 0
            || ClientToScreen(hwnd, &mut origin) == 0
            || rect.right <= 0
            || rect.bottom <= 0
        {
            return None;
        }
        Some((
            pointer_axis(
                cursor.x,
                origin.x,
                rect.right,
                GetSystemMetrics(SM_XVIRTUALSCREEN),
                GetSystemMetrics(SM_CXVIRTUALSCREEN),
            ),
            -pointer_axis(
                cursor.y,
                origin.y,
                rect.bottom,
                GetSystemMetrics(SM_YVIRTUALSCREEN),
                GetSystemMetrics(SM_CYVIRTUALSCREEN),
            ),
        ))
    }
}

pub fn start(window: WebviewWindow) -> Result<(), String> {
    let address = window.hwnd().map_err(|error| error.to_string())?.0 as usize;
    if STARTED.swap(true, Ordering::AcqRel) {
        return Ok(());
    }
    if let Err(error) = listen_for_mouse(window.clone(), address as HWND) {
        STARTED.store(false, Ordering::Release);
        return Err(error);
    }
    let worker = thread::Builder::new()
        .name("typing-cat-pointer".into())
        .spawn(move || {
            let hwnd = address as HWND;
            let mut last = None;
            while unsafe { IsWindow(hwnd) } != 0 {
                if unsafe { IsWindowVisible(hwnd) != 0 && IsIconic(hwnd) == 0 } {
                    let sample = position(hwnd);
                    if sample != last {
                        if let Some(pointer) = sample {
                            let _ = window.emit_to(window.label(), "desktop-pointer", pointer);
                        }
                        last = sample;
                    }
                } else {
                    last = None;
                }
                sleep(Duration::from_millis(33));
            }
            STARTED.store(false, Ordering::Release);
        });
    if let Err(error) = worker {
        STARTED.store(false, Ordering::Release);
        return Err(error.to_string());
    }
    Ok(())
}

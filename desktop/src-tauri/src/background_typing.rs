use std::{cell::RefCell, io, mem::size_of, ptr::null_mut};
use tauri::{Emitter, WebviewWindow};
use windows_sys::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, WPARAM},
    UI::{
        Input::{
            GetRawInputData, GetRegisteredRawInputDevices, RegisterRawInputDevices, HRAWINPUT,
            RAWINPUT, RAWINPUTDEVICE, RAWINPUTHEADER, RAWKEYBOARD, RIDEV_INPUTSINK, RIDEV_REMOVE,
            RID_INPUT, RIM_TYPEKEYBOARD,
        },
        Shell::{DefSubclassProc, RemoveWindowSubclass, SetWindowSubclass},
        WindowsAndMessaging::{
            RIM_INPUTSINK, RI_KEY_BREAK, RI_KEY_E0, RI_KEY_E1, WM_INPUT, WM_NCDESTROY,
        },
    },
};

const SUBCLASS_ID: usize = 1;
const KEYBOARD_USAGE_PAGE: u16 = 1;
const KEYBOARD_USAGE: u16 = 6;

struct Tracker {
    window: WebviewWindow,
    previous_registration: Option<RAWINPUTDEVICE>,
}

thread_local! {
    static TRACKER: RefCell<Option<Tracker>> = const { RefCell::new(None) };
}

fn previous_keyboard_registration() -> io::Result<Option<RAWINPUTDEVICE>> {
    let mut count = 0;
    let size = size_of::<RAWINPUTDEVICE>() as u32;
    if unsafe { GetRegisteredRawInputDevices(null_mut(), &mut count, size) } == u32::MAX {
        return Err(io::Error::last_os_error());
    }
    if count == 0 {
        return Ok(None);
    }
    let mut devices = vec![RAWINPUTDEVICE::default(); count as usize];
    let used = unsafe { GetRegisteredRawInputDevices(devices.as_mut_ptr(), &mut count, size) };
    if used == u32::MAX {
        return Err(io::Error::last_os_error());
    }
    devices.truncate(used as usize);
    Ok(devices.into_iter().find(|device| {
        device.usUsagePage == KEYBOARD_USAGE_PAGE && device.usUsage == KEYBOARD_USAGE
    }))
}

fn keyboard_registration(flags: u32, target: HWND) -> RAWINPUTDEVICE {
    RAWINPUTDEVICE {
        usUsagePage: KEYBOARD_USAGE_PAGE,
        usUsage: KEYBOARD_USAGE,
        dwFlags: flags,
        hwndTarget: target,
    }
}

fn register(device: RAWINPUTDEVICE) -> io::Result<()> {
    if unsafe { RegisterRawInputDevices(&device, 1, size_of::<RAWINPUTDEVICE>() as u32) } == 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}

fn stop(hwnd: HWND) -> io::Result<()> {
    TRACKER.with(|slot| -> io::Result<()> {
        let mut current = slot.borrow_mut();
        if let Some(state) = current.as_ref() {
            let device = state
                .previous_registration
                .unwrap_or_else(|| keyboard_registration(RIDEV_REMOVE, null_mut()));
            register(device)?;
            current.take();
        }
        Ok(())
    })?;
    unsafe { RemoveWindowSubclass(hwnd, Some(window_proc), SUBCLASS_ID) };
    Ok(())
}

fn physical_key(scan: u16, flags: u16) -> Option<&'static str> {
    if flags & RI_KEY_E1 as u16 != 0 {
        return None;
    }
    if flags & RI_KEY_E0 as u16 != 0 {
        return Some(match scan {
            0x38 => "AltRight",
            0x48 => "ArrowUp",
            0x4b => "ArrowLeft",
            0x4d => "ArrowRight",
            0x50 => "ArrowDown",
            _ => return None,
        });
    }

    // Windows scan codes in physical row order, using the same names as KeyboardEvent.code.
    const ROWS: &[(u16, &[&str])] = &[
        (
            0x02,
            &[
                "Digit1",
                "Digit2",
                "Digit3",
                "Digit4",
                "Digit5",
                "Digit6",
                "Digit7",
                "Digit8",
                "Digit9",
                "Digit0",
                "Minus",
                "Equal",
                "Backspace",
                "Tab",
            ],
        ),
        (
            0x10,
            &[
                "KeyQ",
                "KeyW",
                "KeyE",
                "KeyR",
                "KeyT",
                "KeyY",
                "KeyU",
                "KeyI",
                "KeyO",
                "KeyP",
                "BracketLeft",
                "BracketRight",
                "Enter",
                "ControlLeft",
            ],
        ),
        (
            0x1e,
            &[
                "KeyA",
                "KeyS",
                "KeyD",
                "KeyF",
                "KeyG",
                "KeyH",
                "KeyJ",
                "KeyK",
                "KeyL",
                "Semicolon",
                "Quote",
                "Backquote",
                "ShiftLeft",
            ],
        ),
        (
            0x2c,
            &[
                "KeyZ",
                "KeyX",
                "KeyC",
                "KeyV",
                "KeyB",
                "KeyN",
                "KeyM",
                "Comma",
                "Period",
                "Slash",
                "ShiftRight",
            ],
        ),
        (0x38, &["AltLeft", "Space", "CapsLock"]),
    ];
    ROWS.iter().find_map(|(start, row)| {
        scan.checked_sub(*start)
            .and_then(|index| row.get(index as usize))
            .copied()
    })
}

fn key_event(lparam: LPARAM) -> Option<(&'static str, bool)> {
    let mut packet = RAWINPUT::default();
    let mut size = size_of::<RAWINPUT>() as u32;
    let header_size = size_of::<RAWINPUTHEADER>() as u32;
    let copied = unsafe {
        GetRawInputData(
            lparam as HRAWINPUT,
            RID_INPUT,
            (&mut packet as *mut RAWINPUT).cast(),
            &mut size,
            header_size,
        )
    };
    if copied == u32::MAX
        || copied < header_size + size_of::<RAWKEYBOARD>() as u32
        || packet.header.dwType != RIM_TYPEKEYBOARD
    {
        return None;
    }
    let keyboard = unsafe { packet.data.keyboard };
    let code = physical_key(keyboard.MakeCode, keyboard.Flags)?;
    Some((code, keyboard.Flags & RI_KEY_BREAK as u16 == 0))
}

unsafe extern "system" fn window_proc(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    _id: usize,
    _data: usize,
) -> LRESULT {
    if message == WM_INPUT && wparam & 0xff == RIM_INPUTSINK as usize {
        let window = TRACKER.with(|slot| slot.borrow().as_ref().map(|state| state.window.clone()));
        if let (Some(window), Some(event)) = (window, key_event(lparam)) {
            let _ = window.emit_to(window.label(), "background-typing", event);
        }
    }
    if message == WM_NCDESTROY {
        let _ = stop(hwnd);
    }
    unsafe { DefSubclassProc(hwnd, message, wparam, lparam) }
}

pub fn set(window: WebviewWindow, enabled: bool) -> Result<(), String> {
    let hwnd = window.hwnd().map_err(|error| error.to_string())?.0;
    if !enabled {
        return stop(hwnd).map_err(|error| error.to_string());
    }
    if TRACKER.with(|slot| slot.borrow().is_some()) {
        return Ok(());
    }
    let previous_registration =
        previous_keyboard_registration().map_err(|error| error.to_string())?;
    if unsafe { SetWindowSubclass(hwnd, Some(window_proc), SUBCLASS_ID, 0) } == 0 {
        return Err("Could not attach the input listener to the window".to_string());
    }
    if let Err(error) = register(keyboard_registration(RIDEV_INPUTSINK, hwnd)) {
        unsafe { RemoveWindowSubclass(hwnd, Some(window_proc), SUBCLASS_ID) };
        return Err(error.to_string());
    }
    TRACKER.with(|slot| {
        *slot.borrow_mut() = Some(Tracker {
            window,
            previous_registration,
        });
    });
    Ok(())
}

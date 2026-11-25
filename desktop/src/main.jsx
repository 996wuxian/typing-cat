import { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { IconCheck, IconChevronDown, IconMinus, IconPin, IconPinnedOff, IconPower, IconX } from '@tabler/icons-react';
import { midnightEyeStyles, mountTypingCat } from '../../typing-cat-view.mjs';
import './styles.css';
import './rewards.css';

const nativeWindow = isTauri() ? getCurrentWindow() : null;
const isSettingsWindow = new URLSearchParams(window.location.search).get('window') === 'settings';
const backgroundPreference = 'typing-cat.background-key-animations';
const rewardsPreference = 'typing-cat.rewards-enabled';
const sizePreference = 'typing-cat.window-scale';
const opacityPreference = 'typing-cat.window-opacity';
const eyeStylePreference = 'typing-cat.eye-style';
const eyeStyleOptions = Object.entries(midnightEyeStyles);
const loadingStatus = '正在准备猫咪和键盘…';
const scaleOptions = { min: 50, max: 120, step: 5, initial: 65 };
const opacityOptions = { min: 20, max: 100, step: 5, initial: 100 };
const longPressDelay = 260;
const longPressMoveLimit = 6;

function savedScale() {
  const saved = Number(localStorage.getItem(sizePreference));
  return saved >= scaleOptions.min && saved <= scaleOptions.max && saved % scaleOptions.step === 0
    ? saved : scaleOptions.initial;
}

function savedOpacity() {
  const raw = localStorage.getItem(opacityPreference);
  if (raw === null) return opacityOptions.initial;
  const saved = Number(raw);
  return saved >= opacityOptions.min && saved <= opacityOptions.max && saved % opacityOptions.step === 0
    ? saved : opacityOptions.initial;
}

function resizeWindow(percent) {
  return nativeWindow.setSize(new LogicalSize(Math.round(540 * percent / 100), Math.round(620 * percent / 100)));
}

function savedEyeStyle() {
  const saved = localStorage.getItem(eyeStylePreference);
  return Object.hasOwn(midnightEyeStyles, saved) ? saved : 'xiaohei';
}

function OptionPicker({ label, value, options, labels, onChange }) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const selectedIndex = options.findIndex(([key]) => key === value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    function handleOutsidePointer(event) {
      if (!root.current?.contains(event.target)) close();
    }
    document.addEventListener('pointerdown', handleOutsidePointer);
    window.addEventListener('blur', close);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      window.removeEventListener('blur', close);
    };
  }, [open]);

  function openList(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function selectOption(index) {
    setOpen(false);
    onChange(options[index][0]);
    trigger.current?.focus();
  }

  function handleKeyDown(event) {
    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (open) {
        const direction = key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(index => Math.max(0, Math.min(index + direction, options.length - 1)));
      } else {
        openList();
      }
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      openList(key === 'Home' ? 0 : options.length - 1);
    } else if (open && (key === 'Enter' || key === ' ')) {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (open && key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="scheme-setting" ref={root}>
      <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
      <div className="scheme-picker">
        <button type="button" id={`${id}-trigger`} className="scheme-trigger" role="combobox" ref={trigger}
          aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open}
          aria-controls={`${id}-list`} aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
          onClick={() => open ? setOpen(false) : openList()} onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}>
          <span id={`${id}-value`} className="scheme-value">{labels[value].label}</span>
          <IconChevronDown className="scheme-chevron" aria-hidden="true" size={14} stroke={1.9} />
        </button>
        <ul id={`${id}-list`} className="scheme-options" role="listbox" aria-labelledby={`${id}-label`}
          data-open={open} aria-hidden={!open} onMouseDown={event => event.preventDefault()}>
          {options.map(([optionKey, { label: optionLabel }], index) => (
            <li key={optionKey} id={`${id}-option-${index}`} role="option" className="scheme-option"
              aria-selected={optionKey === value} data-active={index === activeIndex}
              onMouseMove={() => setActiveIndex(index)} onClick={() => selectOption(index)}>
              <span className="scheme-value">{optionLabel}</span>
              {optionKey === value && <IconCheck className="scheme-check" aria-hidden="true" size={15} stroke={2.2} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WindowMenu({ pinned, pinBusy, background, backgroundBusy, rewardsEnabled, error, scale, opacity, eyeStyle,
  standalone = false, onTogglePin, onMinimize, onClose, onScale, onOpacity, onEyeStyle,
  onToggleBackground, onToggleRewards, onQuit }) {
  const [draftScale, setDraftScale] = useState(scale);
  const [scaleBusy, setScaleBusy] = useState(false);
  const [confirmingQuit, setConfirmingQuit] = useState(false);

  useEffect(() => {
    setDraftScale(scale);
  }, [scale]);

  useEffect(() => {
    if (!confirmingQuit) return;
    const reset = () => setConfirmingQuit(false);
    window.addEventListener('blur', reset);
    return () => window.removeEventListener('blur', reset);
  }, [confirmingQuit]);

  async function commitScale(event) {
    const next = Number(event.currentTarget.value);
    if (next === scale || scaleBusy) return;
    setScaleBusy(true);
    try {
      if (!await onScale(next)) setDraftScale(scale);
    } finally {
      setScaleBusy(false);
    }
  }

  return (
    <section className="window-menu" role="dialog" aria-label="设置">
      <header className="menu-header" data-tauri-drag-region>
        <h1 data-tauri-drag-region>设置</h1>
        <div className="window-actions">
          {onQuit && (
            <button type="button" className="quit-icon" aria-pressed={confirmingQuit}
              onClick={() => setConfirmingQuit(open => !open)}
              aria-label="退出应用" title="退出应用">
              <IconPower size={16} stroke={1.85} />
            </button>
          )}
          <button type="button" aria-pressed={pinned} disabled={pinBusy} onClick={onTogglePin}
            aria-label={pinned ? '取消置顶' : '置顶'} title={pinned ? '取消置顶' : '置顶'}>
            {pinned ? <IconPinnedOff size={16} stroke={1.8} /> : <IconPin size={16} stroke={1.8} />}
          </button>
          <button type="button" aria-label="最小化到任务栏" title="最小化到任务栏"
            onClick={onMinimize}><IconMinus size={16} stroke={1.8} /></button>
          <button type="button" className="close"
            aria-label={standalone ? '关闭设置' : '关闭窗口并最小化'}
            title={standalone ? '关闭设置弹窗' : '关闭窗口并最小化到任务栏'}
            onClick={() => { setConfirmingQuit(false); onClose(); }}><IconX size={16} stroke={1.8} /></button>
        </div>
      </header>
      {onQuit && confirmingQuit && (
        <div className="quit-confirm" role="alertdialog" aria-label="确认退出应用">
          <span className="quit-confirm-text">退出打字猫？</span>
          <div className="quit-confirm-actions">
            <button type="button" className="quit-cancel" onClick={() => setConfirmingQuit(false)}>取消</button>
            <button type="button" className="quit-accept" onClick={onQuit}>退出</button>
          </div>
        </div>
      )}
      <div className="menu-group">
        <button type="button" className="switch-row" role="switch" aria-checked={background}
          disabled={backgroundBusy} onClick={onToggleBackground}
          title="让猫咪按下你在其他窗口使用的键">
          <span>后台打字</span>
          <span className="switch-track" aria-hidden="true" />
        </button>
        <button type="button" className="switch-row" role="switch" aria-checked={rewardsEnabled}
          onClick={onToggleRewards} title="开启攒鱼、怒气与喂食玩法">
          <span>攒鱼与怒气</span>
          <span className="switch-track" aria-hidden="true" />
        </button>
        <OptionPicker label="眼睛" value={eyeStyle} options={eyeStyleOptions} labels={midnightEyeStyles}
          onChange={onEyeStyle} />
      </div>
      <div className="menu-sliders">
        <label className="size-setting">
          <span>大小 <output>{draftScale}%</output></span>
          <input type="range" min={scaleOptions.min} max={scaleOptions.max} step={scaleOptions.step}
            value={draftScale} aria-label="窗口大小" aria-valuetext={`${draftScale}%`}
            disabled={scaleBusy} onChange={event => setDraftScale(Number(event.currentTarget.value))}
            onPointerUp={commitScale} onKeyUp={commitScale} onBlur={commitScale} />
        </label>
        <label className="size-setting">
          <span>透明度 <output>{opacity}%</output></span>
          <input type="range" min={opacityOptions.min} max={opacityOptions.max} step={opacityOptions.step}
            value={opacity} aria-label="猫咪透明度" aria-valuetext={`${opacity}%`}
            onChange={event => onOpacity(Number(event.currentTarget.value))} />
        </label>
      </div>
      {error && <p className="menu-error" role="alert">{error}</p>}
    </section>
  );
}

function SettingsApp() {
  const [state, setState] = useState(() => ({
    pinned: false,
    pinBusy: false,
    background: localStorage.getItem(backgroundPreference) === 'on',
    backgroundBusy: false,
    rewardsEnabled: localStorage.getItem(rewardsPreference) !== 'off',
    scale: savedScale(),
    opacity: savedOpacity(),
    eyeStyle: savedEyeStyle(),
    error: '',
  }));

  useEffect(() => {
    const registration = listen('settings-state', ({ payload }) => {
      if (payload && typeof payload === 'object') {
        setState(prev => ({ ...prev, ...payload }));
      }
    });
    registration.then(() => emit('settings-request-state')).catch(console.error);
    function handleKeyDown(event) {
      if (event.defaultPrevented || event.key !== 'Escape' || event.repeat) return;
      invoke('hide_settings_window').catch(console.error);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      registration.then(unlisten => unlisten(), () => {});
    };
  }, []);

  function dispatch(type, value) {
    emit('settings-update', { type, value }).catch(console.error);
  }

  return (
    <div className="settings-shell">
      <WindowMenu
        standalone
        pinned={state.pinned}
        pinBusy={state.pinBusy}
        background={state.background}
        backgroundBusy={state.backgroundBusy}
        rewardsEnabled={state.rewardsEnabled}
        error={state.error}
        scale={state.scale}
        opacity={state.opacity}
        eyeStyle={state.eyeStyle}
        onTogglePin={() => dispatch('togglePin')}
        onMinimize={() => dispatch('minimize')}
        onClose={() => invoke('hide_settings_window').catch(console.error)}
        onToggleBackground={() => dispatch('toggleBackground', !state.background)}
        onToggleRewards={() => dispatch('toggleRewards')}
        onEyeStyle={next => {
          setState(prev => ({ ...prev, eyeStyle: next }));
          dispatch('eyeStyle', next);
        }}
        onScale={async next => {
          setState(prev => ({ ...prev, scale: next }));
          dispatch('scale', next);
          return true;
        }}
        onOpacity={next => {
          setState(prev => ({ ...prev, opacity: next }));
          dispatch('opacity', next);
        }}
        onQuit={() => invoke('quit_app').catch(console.error)}
      />
    </div>
  );
}

function App() {
  const target = useRef(null);
  const sceneControls = useRef(null);
  const lastDesktopPointer = useRef(null);
  const dragPress = useRef(null);
  const [status, setStatus] = useState(loadingStatus);
  const [windowError, setWindowError] = useState('');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const pinnedRef = useRef(pinned);
  const [background, setBackground] = useState(false);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [rewardsEnabled, setRewardsEnabled] = useState(() => localStorage.getItem(rewardsPreference) !== 'off');
  const rewardsEnabledRef = useRef(rewardsEnabled);
  const [scale, setScale] = useState(savedScale);
  const [opacity, setOpacity] = useState(savedOpacity);
  const [eyeStyle, setEyeStyle] = useState(savedEyeStyle);
  const eyeStyleRef = useRef(eyeStyle);
  const reportWindowError = useRef(error => {
    console.error(error);
    setWindowError('窗口操作失败');
  }).current;

  const publishSettingsState = useRef(null);
  publishSettingsState.current = () => {
    if (!nativeWindow) return;
    emit('settings-state', {
      pinned,
      pinBusy,
      background,
      backgroundBusy,
      rewardsEnabled,
      scale,
      opacity,
      eyeStyle,
      error: windowError,
    }).catch(() => {});
  };

  useEffect(() => {
    publishSettingsState.current();
  }, [pinned, pinBusy, background, backgroundBusy, rewardsEnabled, scale, opacity, eyeStyle, windowError]);

  useEffect(() => {
    if (!nativeWindow) return;
    let current = true;
    nativeWindow.isAlwaysOnTop().then(actual => {
      if (current) {
        pinnedRef.current = actual;
        setPinned(actual);
      }
    }).catch(reportWindowError);
    return () => { current = false; };
  }, [reportWindowError]);

  useEffect(() => {
    const abort = new AbortController();
    const stage = target.current;
    mountTypingCat(stage, { signal: abort.signal, scheme: 'midnight',
      eyeStyle: eyeStyleRef.current, rewardsEnabled: rewardsEnabledRef.current, onStatus: setStatus }).then(controls => {
      if (!abort.signal.aborted) {
        sceneControls.current = controls;
        controls.setEyeStyle(eyeStyleRef.current);
        controls.setRewardsEnabled(rewardsEnabledRef.current);
        if (lastDesktopPointer.current) controls.trackDesktopPointer(...lastDesktopPointer.current);
      }
    }).catch(error => {
      if (abort.signal.aborted) return;
      stage.dataset.state = 'error';
      setStatus('3D 模型加载失败，请确认 WebView2 支持 WebGL 2。');
      console.error(error);
    });
    return () => {
      sceneControls.current = null;
      abort.abort();
    };
  }, []);

  async function togglePin() {
    if (!nativeWindow) return;
    setPinBusy(true);
    setWindowError('');
    try {
      const next = !pinnedRef.current;
      await nativeWindow.setAlwaysOnTop(next);
      pinnedRef.current = next;
      setPinned(next);
    } catch (error) {
      reportWindowError(error);
    } finally {
      setPinBusy(false);
    }
  }

  function minimizeMain() {
    if (!nativeWindow) return;
    invoke('hide_settings_window').catch(() => {});
    nativeWindow.minimize().catch(reportWindowError);
  }

  function updateEyeStyle(next) {
    if (next === eyeStyleRef.current || !Object.hasOwn(midnightEyeStyles, next)) return;
    eyeStyleRef.current = next;
    setEyeStyle(next);
    sceneControls.current?.setEyeStyle(next);
    localStorage.setItem(eyeStylePreference, next);
  }

  function updateOpacity(next) {
    const clamped = Math.max(opacityOptions.min, Math.min(opacityOptions.max, Math.round(next / opacityOptions.step) * opacityOptions.step));
    setOpacity(clamped);
    localStorage.setItem(opacityPreference, String(clamped));
  }

  function toggleRewards() {
    const enabled = !rewardsEnabledRef.current;
    rewardsEnabledRef.current = enabled;
    setRewardsEnabled(enabled);
    sceneControls.current?.setRewardsEnabled(enabled);
    localStorage.setItem(rewardsPreference, enabled ? 'on' : 'off');
  }

  async function updateBackground(enabled) {
    setBackgroundBusy(true);
    setWindowError('');
    try {
      await invoke('set_background_typing', { enabled });
      if (!enabled) sceneControls.current?.releaseBackgroundKeys();
      setBackground(enabled);
      localStorage.setItem(backgroundPreference, enabled ? 'on' : 'off');
    } catch (error) {
      console.error(error);
      setWindowError('后台打字切换失败');
    } finally {
      setBackgroundBusy(false);
    }
  }

  async function updateScale(next) {
    setWindowError('');
    try {
      await resizeWindow(next);
      setScale(next);
      localStorage.setItem(sizePreference, String(next));
      return true;
    } catch (error) {
      console.error(error);
      setWindowError('无法调整窗口大小');
      return false;
    }
  }

  const settingsHandler = useRef(null);
  settingsHandler.current = payload => {
    if (!payload || typeof payload !== 'object') return;
    switch (payload.type) {
      case 'togglePin':
        togglePin();
        break;
      case 'minimize':
        minimizeMain();
        break;
      case 'toggleBackground':
        updateBackground(Boolean(payload.value));
        break;
      case 'toggleRewards':
        toggleRewards();
        break;
      case 'eyeStyle':
        updateEyeStyle(payload.value);
        break;
      case 'scale':
        updateScale(Number(payload.value));
        break;
      case 'opacity':
        updateOpacity(Number(payload.value));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!nativeWindow) return;
    const onUpdate = listen('settings-update', ({ payload }) => settingsHandler.current(payload));
    const onRequest = listen('settings-request-state', () => publishSettingsState.current());
    return () => {
      onUpdate.then(unlisten => unlisten(), () => {});
      onRequest.then(unlisten => unlisten(), () => {});
    };
  }, []);

  useEffect(() => {
    if (!nativeWindow) return;
    const initialScale = savedScale();
    if (initialScale !== scaleOptions.initial) resizeWindow(initialScale).catch(reportWindowError);
    const registration = listen('background-typing', ({ payload }) => {
      if (Array.isArray(payload)) sceneControls.current?.playBackgroundKey(...payload);
    });
    registration.catch(reportWindowError);
    if (localStorage.getItem(backgroundPreference) === 'on') {
      updateBackground(true);
    }
    return () => { registration.then(unlisten => unlisten(), () => {}); };
  }, [reportWindowError]);

  useEffect(() => {
    if (!nativeWindow) return;
    let active = true;
    const registration = listen('desktop-pointer', ({ payload }) => {
      if (!Array.isArray(payload) || payload.length !== 2 || !payload.every(Number.isFinite)) return;
      lastDesktopPointer.current = payload;
      sceneControls.current?.trackDesktopPointer(...payload);
    });
    const buttons = listen('desktop-mouse-button', ({ payload }) => {
      if (Array.isArray(payload)) sceneControls.current?.playDesktopMouseButton(...payload);
    });
    Promise.all([registration, buttons]).then(() => {
      if (active) return invoke('start_desktop_pointer');
    }).catch(error => console.error(error));
    return () => {
      active = false;
      registration.then(unlisten => unlisten(), () => {});
      buttons.then(unlisten => unlisten(), () => {});
    };
  }, []);

  useEffect(() => {
    function toggleControls(event) {
      if (event.defaultPrevented || event.key !== 'Escape' || event.repeat) return;
      setWindowError('');
      if (nativeWindow) {
        invoke('toggle_settings_window').catch(reportWindowError);
      } else {
        setControlsOpen(open => !open);
      }
    }
    window.addEventListener('keydown', toggleControls);
    return () => window.removeEventListener('keydown', toggleControls);
  }, [reportWindowError]);

  function clearLongPress() {
    if (dragPress.current) {
      clearTimeout(dragPress.current.timer);
      dragPress.current = null;
    }
    if (target.current) delete target.current.dataset.dragging;
  }

  useEffect(() => {
    if (!nativeWindow) return;
    function handleMove(event) {
      const pending = dragPress.current;
      if (!pending || pending.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > longPressMoveLimit) {
        clearLongPress();
      }
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', clearLongPress);
    window.addEventListener('pointercancel', clearLongPress);
    window.addEventListener('blur', clearLongPress);
    return () => {
      clearLongPress();
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', clearLongPress);
      window.removeEventListener('pointercancel', clearLongPress);
      window.removeEventListener('blur', clearLongPress);
    };
  }, []);

  function startNativeDrag() {
    if (target.current) target.current.dataset.dragging = 'true';
    sceneControls.current?.cancelPointerInteractions();
    invoke('begin_window_drag').catch(reportWindowError).finally(() => {
      if (target.current) delete target.current.dataset.dragging;
    });
  }

  function handleStagePointerDown(event) {
    if (controlsOpen) setControlsOpen(false);
    if (!nativeWindow || event.button !== 0 || event.target.closest('.fish-bank')) return;
    if (event.altKey) {
      clearLongPress();
      event.preventDefault();
      event.stopPropagation();
      startNativeDrag();
      return;
    }
    clearLongPress();
    if (sceneControls.current?.isHeadPoint(event.clientX, event.clientY)) return;
    const { pointerId: id, clientX: x, clientY: y } = event;
    const timer = setTimeout(() => {
      dragPress.current = null;
      if (target.current?.dataset.petting === 'true') return;
      startNativeDrag();
    }, longPressDelay);
    dragPress.current = { id, x, y, timer };
  }

  return (
    <div className="desktop">
      {!nativeWindow && controlsOpen && <WindowMenu pinned={pinned} pinBusy={pinBusy}
        background={background} backgroundBusy={backgroundBusy}
        rewardsEnabled={rewardsEnabled} onToggleRewards={toggleRewards}
        error={windowError} scale={scale} opacity={opacity} eyeStyle={eyeStyle}
        onTogglePin={togglePin} onMinimize={minimizeMain} onClose={() => setControlsOpen(false)}
        onScale={updateScale} onOpacity={updateOpacity} onEyeStyle={updateEyeStyle}
        onToggleBackground={() => updateBackground(!background)} />}
      <main className="stage" data-state="loading" ref={target} style={{ opacity: opacity / 100 }}
        onPointerDownCapture={handleStagePointerDown}>
        <canvas id="scene" aria-label="互动猫咪、键盘和鼠标" />
        <div id="floating" aria-hidden="true" />
        <p id="status" role="status">{status}</p>
      </main>
      {!controlsOpen && windowError && <p className="window-error" role="alert">{windowError}</p>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(isSettingsWindow ? <SettingsApp /> : <App />);

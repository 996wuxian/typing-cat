import { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { IconCheck, IconChevronDown, IconMinus, IconPin, IconPinnedOff, IconX } from '@tabler/icons-react';
import modelUrl from '../../typing-cat.glb?url';
import { mountTypingCat, typingCatSchemes } from '../../typing-cat-view.mjs';
import './styles.css';
import './rewards.css';

const nativeWindow = isTauri() ? getCurrentWindow() : null;
const backgroundPreference = 'typing-cat.background-key-animations';
const rewardsPreference = 'typing-cat.rewards-enabled';
const sizePreference = 'typing-cat.window-scale';
const schemePreference = 'typing-cat.scene-scheme';
const schemeOptions = Object.entries(typingCatSchemes);
const loadingStatus = '正在准备猫咪和键盘…';
const scaleOptions = { min: 50, max: 120, step: 5, initial: 65 };

function savedScale() {
  const saved = Number(localStorage.getItem(sizePreference));
  return saved >= scaleOptions.min && saved <= scaleOptions.max && saved % scaleOptions.step === 0
    ? saved : scaleOptions.initial;
}

function resizeWindow(percent) {
  return nativeWindow.setSize(new LogicalSize(Math.round(540 * percent / 100), Math.round(620 * percent / 100)));
}

function savedScheme() {
  const saved = localStorage.getItem(schemePreference);
  return Object.hasOwn(typingCatSchemes, saved) ? saved : 'classic';
}

function SchemePicker({ scheme, onScheme }) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const selectedIndex = schemeOptions.findIndex(([value]) => value === scheme);
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
    onScheme(schemeOptions[index][0]);
    trigger.current?.focus();
  }

  function handleKeyDown(event) {
    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (open) {
        const direction = key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(index => Math.max(0, Math.min(index + direction, schemeOptions.length - 1)));
      } else {
        openList();
      }
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      openList(key === 'Home' ? 0 : schemeOptions.length - 1);
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
      <label id={`${id}-label`} htmlFor={`${id}-trigger`}>方案</label>
      <div className="scheme-picker">
        <button type="button" id={`${id}-trigger`} className="scheme-trigger" role="combobox" ref={trigger}
          aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open}
          aria-controls={`${id}-list`} aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
          onClick={() => open ? setOpen(false) : openList()} onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}>
          <span id={`${id}-value`} className="scheme-value">{typingCatSchemes[scheme].label}</span>
          <IconChevronDown className="scheme-chevron" aria-hidden="true" size={14} stroke={1.9} />
        </button>
        <ul id={`${id}-list`} className="scheme-options" role="listbox" aria-labelledby={`${id}-label`}
          data-open={open} aria-hidden={!open} onMouseDown={event => event.preventDefault()}>
          {schemeOptions.map(([value, { label }], index) => (
            <li key={value} id={`${id}-option-${index}`} role="option" className="scheme-option"
              aria-selected={value === scheme} data-active={index === activeIndex}
              onMouseMove={() => setActiveIndex(index)} onClick={() => selectOption(index)}>
              <span className="scheme-value">{label}</span>
              {value === scheme && <IconCheck className="scheme-check" aria-hidden="true" size={15} stroke={2.2} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WindowMenu({ background, backgroundBusy, rewardsEnabled, error, scale, scheme, onScale, onScheme,
  onToggleBackground, onToggleRewards, onError }) {
  const [pinned, setPinned] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [draftScale, setDraftScale] = useState(scale);
  const [scaleBusy, setScaleBusy] = useState(false);

  useEffect(() => {
    if (!nativeWindow) return;
    let current = true;
    async function readPin() {
      try {
        const actual = await nativeWindow.isAlwaysOnTop();
        if (current) setPinned(actual);
      } catch (error) {
        if (current) onError(error);
      }
    }
    readPin();
    return () => { current = false; };
  }, [onError]);

  async function togglePin() {
    setPinBusy(true);
    try {
      await nativeWindow.setAlwaysOnTop(!pinned);
      setPinned(!pinned);
    } catch (error) {
      onError(error);
    } finally {
      setPinBusy(false);
    }
  }

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
    <section className="window-menu" role="dialog" aria-label="窗口菜单">
      <header className="menu-header" data-tauri-drag-region>
        <h1 data-tauri-drag-region>打字猫</h1>
        <div className="window-actions">
          <button type="button" aria-pressed={pinned} disabled={pinBusy} onClick={togglePin}
            aria-label={pinned ? '取消置顶' : '置顶'} title={pinned ? '取消置顶' : '置顶'}>
            {pinned ? <IconPinnedOff size={17} stroke={1.7} /> : <IconPin size={17} stroke={1.7} />}
          </button>
          <button type="button" aria-label="最小化" title="最小化"
            onClick={() => nativeWindow.minimize().catch(onError)}><IconMinus size={17} stroke={1.7} /></button>
          <button type="button" className="close" aria-label="关闭窗口并最小化" title="关闭窗口并最小化到任务栏"
            onClick={() => nativeWindow.close().catch(onError)}><IconX size={17} stroke={1.7} /></button>
        </div>
      </header>
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
      <SchemePicker scheme={scheme} onScheme={onScheme} />
      <label className="size-setting">
        <span>大小 <output>{draftScale}%</output></span>
        <input type="range" min={scaleOptions.min} max={scaleOptions.max} step={scaleOptions.step}
          value={draftScale} aria-label="窗口大小" aria-valuetext={`${draftScale}%`}
          disabled={scaleBusy} onChange={event => setDraftScale(Number(event.currentTarget.value))}
          onPointerUp={commitScale} onKeyUp={commitScale} onBlur={commitScale} />
      </label>
      {error && <p className="menu-error" role="alert">{error}</p>}
    </section>
  );
}

function App() {
  const target = useRef(null);
  const sceneControls = useRef(null);
  const lastDesktopPointer = useRef(null);
  const [status, setStatus] = useState(loadingStatus);
  const [windowError, setWindowError] = useState('');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [background, setBackground] = useState(false);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [rewardsEnabled, setRewardsEnabled] = useState(() => localStorage.getItem(rewardsPreference) !== 'off');
  const rewardsEnabledRef = useRef(rewardsEnabled);
  const [scale, setScale] = useState(savedScale);
  const [scheme, setScheme] = useState(savedScheme);
  const reportWindowError = useRef(error => {
    console.error(error);
    setWindowError('窗口操作失败');
  }).current;

  useEffect(() => {
    const abort = new AbortController();
    const stage = target.current;
    mountTypingCat(stage, { assetUrl: modelUrl, signal: abort.signal, scheme,
      rewardsEnabled: rewardsEnabledRef.current, onStatus: setStatus }).then(controls => {
      if (!abort.signal.aborted) {
        sceneControls.current = controls;
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
  }, [scheme]);

  function updateScheme(next) {
    if (next === scheme || !Object.hasOwn(typingCatSchemes, next)) return;
    setStatus(loadingStatus);
    setScheme(next);
    localStorage.setItem(schemePreference, next);
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
    if (!nativeWindow) return;
    function toggleControls(event) {
      if (event.defaultPrevented || event.key !== 'Escape' || event.repeat) return;
      setControlsOpen(open => !open);
      setWindowError('');
    }
    window.addEventListener('keydown', toggleControls);
    return () => window.removeEventListener('keydown', toggleControls);
  }, []);

  function dragWindow(event) {
    if (controlsOpen) setControlsOpen(false);
    if (!nativeWindow || !event.altKey || event.button !== 0 || event.target.closest('.fish-bank')) return;
    event.preventDefault();
    event.stopPropagation();
    nativeWindow.startDragging().catch(reportWindowError);
  }

  return (
    <div className="desktop">
      {controlsOpen && <WindowMenu background={background} backgroundBusy={backgroundBusy}
        rewardsEnabled={rewardsEnabled} onToggleRewards={toggleRewards}
        error={windowError} scale={scale} scheme={scheme} onScale={updateScale} onScheme={updateScheme}
        onToggleBackground={() => updateBackground(!background)} onError={reportWindowError} />}
      <main key={scheme} className="stage" data-state="loading" ref={target} onPointerDownCapture={dragWindow}>
        <canvas id="scene" aria-label="互动猫咪、键盘和鼠标" />
        <div id="floating" aria-hidden="true" />
        <p id="status" role="status">{status}</p>
      </main>
      {!controlsOpen && windowError && <p className="window-error" role="alert">{windowError}</p>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

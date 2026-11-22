import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { IconMinus, IconPin, IconPinnedOff, IconX } from '@tabler/icons-react';
import modelUrl from '../../typing-cat.glb?url';
import { mountTypingCat } from '../../typing-cat-view.mjs';
import './styles.css';

const nativeWindow = isTauri() ? getCurrentWindow() : null;
const backgroundPreference = 'typing-cat.background-key-animations';
const sizePreference = 'typing-cat.window-scale';
const scaleOptions = { min: 50, max: 120, step: 5, initial: 65 };

function savedScale() {
  const saved = Number(localStorage.getItem(sizePreference));
  return saved >= scaleOptions.min && saved <= scaleOptions.max && saved % scaleOptions.step === 0
    ? saved : scaleOptions.initial;
}

function resizeWindow(percent) {
  return nativeWindow.setSize(new LogicalSize(Math.round(540 * percent / 100), Math.round(620 * percent / 100)));
}

function WindowMenu({ background, backgroundBusy, error, scale, onScale, onToggleBackground, onError }) {
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
          <button type="button" className="close" aria-label="关闭应用" title="关闭应用"
            onClick={() => nativeWindow.close().catch(onError)}><IconX size={17} stroke={1.7} /></button>
        </div>
      </header>
      <button type="button" className="switch-row" role="switch" aria-checked={background}
        disabled={backgroundBusy} onClick={onToggleBackground}
        title="让猫咪按下你在其他窗口使用的键">
        <span>后台打字</span>
        <span className="switch-track" aria-hidden="true" />
      </button>
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
  const [status, setStatus] = useState('正在准备猫咪和键盘…');
  const [windowError, setWindowError] = useState('');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [background, setBackground] = useState(false);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [scale, setScale] = useState(savedScale);
  const reportWindowError = useRef(error => {
    console.error(error);
    setWindowError('窗口操作失败');
  }).current;

  useEffect(() => {
    const abort = new AbortController();
    const stage = target.current;
    mountTypingCat(stage, { assetUrl: modelUrl, signal: abort.signal, onStatus: setStatus }).then(controls => {
      if (!abort.signal.aborted) {
        sceneControls.current = controls;
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
      if (event.key !== 'Escape' || event.repeat) return;
      setControlsOpen(open => !open);
      setWindowError('');
    }
    window.addEventListener('keydown', toggleControls);
    return () => window.removeEventListener('keydown', toggleControls);
  }, []);

  function dragWindow(event) {
    if (controlsOpen) setControlsOpen(false);
    if (!nativeWindow || !event.altKey || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    nativeWindow.startDragging().catch(reportWindowError);
  }

  return (
    <div className="desktop">
      {controlsOpen && <WindowMenu background={background} backgroundBusy={backgroundBusy}
        error={windowError} scale={scale} onScale={updateScale}
        onToggleBackground={() => updateBackground(!background)} onError={reportWindowError} />}
      <main className="stage" data-state="loading" ref={target} onPointerDownCapture={dragWindow}>
        <canvas id="scene" aria-label="互动猫咪、键盘和鼠标" />
        <div id="floating" aria-hidden="true" />
        <p id="status" role="status">{status}</p>
      </main>
      {!controlsOpen && windowError && <p className="window-error" role="alert">{windowError}</p>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

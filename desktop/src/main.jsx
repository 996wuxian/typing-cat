import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { IconBrandGithub, IconChevronRight, IconCircleCheck, IconDownload, IconExternalLink, IconHeadphones, IconMinus, IconPin, IconPinnedOff, IconPower, IconRefresh, IconX } from '@tabler/icons-react';
import { midnightEyeStyles, midnightHeadphoneStyles, mountTypingCat } from '../../typing-cat-view.mjs';
import './styles.css';
import './rewards.css';

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '1.1.2';
const APP_AUTHOR = '996wuxian';
const APP_REPOSITORY_LABEL = '996wuxian/typing-cat';
const APP_REPOSITORY_URL = 'https://github.com/996wuxian/typing-cat';
const APP_DOWNLOAD_URL = `${APP_REPOSITORY_URL}/releases`;
const UPDATE_PROGRESS_EVENT = 'typing-cat-update-download-progress';

const nativeWindow = isTauri() ? getCurrentWindow() : null;
const windowKind = new URLSearchParams(window.location.search).get('window');
const isSettingsWindow = windowKind === 'settings';
const isWardrobeWindow = windowKind === 'wardrobe';
const backgroundPreference = 'typing-cat.background-key-animations';
const rewardsPreference = 'typing-cat.rewards-enabled';
const musicPreference = 'typing-cat.music-mode';
const sizePreference = 'typing-cat.window-scale';
const opacityPreference = 'typing-cat.window-opacity';
const eyeStylePreference = 'typing-cat.eye-style';
const headphoneStylePreference = 'typing-cat.headphone-style';
const eyeStyleOptions = Object.entries(midnightEyeStyles);
const headphoneStyleOptions = Object.entries(midnightHeadphoneStyles);
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

function savedHeadphoneStyle() {
  const saved = localStorage.getItem(headphoneStylePreference);
  return Object.hasOwn(midnightHeadphoneStyles, saved) ? saved : 'cream';
}

function EyePreview({ style }) {
  return (
    <svg className="wardrobe-preview-svg" viewBox="0 0 64 36" aria-hidden="true">
      <rect x="2" y="2" width="60" height="32" rx="11" fill="#161615" stroke="#fbf8ee" strokeWidth="1.8" />
      {[-1, 1].map(side => {
        const cx = 32 + side * 13;
        const cy = 18;
        if (style === 'ring') {
          return <ellipse key={side} cx={cx} cy={cy} rx="7.6" ry="8.1" fill="none" stroke="#fbf8ee" strokeWidth="2.1" />;
        }
        if (style === 'lime') {
          return (
            <g key={side}>
              <ellipse cx={cx} cy={cy} rx="8.1" ry="8.4" fill="#daf478" />
              <ellipse cx={cx} cy={cy + .4} rx="3.8" ry="5.5" fill="#161615" />
              <circle cx={cx - 1.3} cy={cy - 1.8} r="1.15" fill="#f7ffdb" />
            </g>
          );
        }
        return (
          <g key={side}>
            <ellipse cx={cx} cy={cy} rx="8.7" ry="8.8" fill="#fbf8ee" />
            <ellipse cx={cx} cy={cy} rx="6.4" ry="6.5" fill="#161615" />
            {style === 'xiaohei' && (
              <>
                <path d={`M${cx + side * 2.1} ${cy - 3.0} L${cx + side * 2.1 + .65} ${cy - 1.2} L${cx + side * 2.1 + 2.3} ${cy - .55} L${cx + side * 2.1 + .65} ${cy + .1} L${cx + side * 2.1} ${cy + 1.8} L${cx + side * 2.1 - .65} ${cy + .1} L${cx + side * 2.1 - 2.3} ${cy - .55} L${cx + side * 2.1 - .65} ${cy - 1.2} Z`} fill="#ffe078" />
                <circle cx={cx - side * 1.9} cy={cy + 2.1} r="1.05" fill="#fbf8ee" />
              </>
            )}
            {style === 'starry' && (
              <>
                <path d={`M${cx - 1.8} ${cy - 3.8} L${cx - 1.15} ${cy - 1.8} L${cx + .85} ${cy - 1.15} L${cx - 1.15} ${cy - .5} L${cx - 1.8} ${cy + 1.5} L${cx - 2.45} ${cy - .5} L${cx - 4.45} ${cy - 1.15} L${cx - 2.45} ${cy - 1.8} Z`} fill="#ffa3be" />
                <path d={`M${cx + 2.3} ${cy - .5} L${cx + 2.8} ${cy + .9} L${cx + 4.2} ${cy + 1.4} L${cx + 2.8} ${cy + 1.9} L${cx + 2.3} ${cy + 3.3} L${cx + 1.8} ${cy + 1.9} L${cx + .4} ${cy + 1.4} L${cx + 1.8} ${cy + .9} Z`} fill="#ffdc70" />
                <circle cx={cx + 2.0} cy={cy - 2.5} r="1.2" fill="#ffffff" />
                <circle cx={cx - 1.1} cy={cy + 2.8} r=".95" fill="#9de8d6" />
              </>
            )}
            {style === 'glossy' && (
              <>
                <circle cx={cx - 2.0} cy={cy - 1.9} r="1.55" fill="#fbf8ee" />
                <circle cx={cx + 1.8} cy={cy + 2.1} r=".8" fill="#fbf8ee" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const previewHeadphoneColors = {
  cream: { band: '#34323b', pad: '#eab752', shell: '#f5efe2', accent: '#eab752', cushion: '#34323b' },
  sony: { band: '#282a30', pad: '#3d4049', shell: '#2d3038', accent: '#d8b87e', cushion: '#1a1b20' },
  max: { band: '#bcc4d0', pad: '#e3e8f0', shell: '#d6dde8', accent: '#9fa9ba', cushion: '#6e7684' },
  marshall: { band: '#24201e', pad: '#d4ac58', shell: '#2a2624', accent: '#d4ac58', cushion: '#181614' },
  sakura: { band: '#f2a4be', pad: '#ffd6e4', shell: '#ffe9f0', accent: '#f48fb2', cushion: '#d07a98' },
  retro: { band: '#aeb7c6', pad: '#eef2f8', shell: '#ff8a3d', accent: '#434752', cushion: '#c95218' },
};

function HeadphonePreview({ style }) {
  const colors = previewHeadphoneColors[style] ?? previewHeadphoneColors.cream;
  const isRetro = style === 'retro';
  return (
    <svg className="wardrobe-preview-svg" viewBox="0 0 72 48" aria-hidden="true">
      {/* Mini black cat upper silhouette so user sees exact ear-level fit */}
      <path
        d="M12 45 C12 31 15 16 20 10 C23 7 26 14 29 19 C33 18 39 18 43 19 C46 14 49 7 52 10 C57 16 60 31 60 45 Z"
        fill="#1e1e20"
        stroke="#e9edf4"
        strokeWidth="1.6"
      />
      <path d="M12.5 28 C14 14.5 24 12 36 12 C48 12 58 14.5 59.5 28" fill="none" stroke="#ffffff" strokeWidth={isRetro ? 5.0 : 6.4} strokeLinecap="round" />
      <path d="M12.5 28 C14 14.5 24 12 36 12 C48 12 58 14.5 59.5 28" fill="none" stroke={colors.band} strokeWidth={isRetro ? 2.8 : 4.2} strokeLinecap="round" />
      <path d="M23.5 14.2 C29 12 43 12 48.5 14.2" fill="none" stroke={colors.pad} strokeWidth={isRetro ? 1.2 : 2.5} strokeLinecap="round" />
      {[-1, 1].map(side => {
        const x = 36 + side * 23.5;
        return (
          <g key={side} transform={`translate(${x} 28) rotate(${-side * 14})`}>
            {style === 'marshall' ? (
              <>
                <rect x="-5.5" y="-8.2" width="11" height="16.4" rx="3" fill={colors.shell} stroke="#ffffff" strokeWidth="2.2" paintOrder="stroke fill" />
                <rect x={side > 0 ? -1.4 : -4.4} y="-5.2" width="5.8" height="10.4" rx="1.6" fill={colors.accent} />
              </>
            ) : isRetro ? (
              <>
                <ellipse cx="0" cy="0" rx="5.8" ry="8.4" fill={colors.shell} stroke="#ffffff" strokeWidth="2.2" paintOrder="stroke fill" />
                <ellipse cx={side * 1.4} cy="0" rx="2.5" ry="4.2" fill={colors.accent} />
                <ellipse cx={side * 1.6} cy="0" rx="1.4" ry="2.5" fill={colors.band} />
              </>
            ) : (
              <>
                <ellipse cx="0" cy="0" rx="5.6" ry="8.8" fill={colors.shell} stroke="#ffffff" strokeWidth="2.2" paintOrder="stroke fill" />
                {style === 'sony' ? (
                  <ellipse cx={side * .9} cy="0" rx="2.9" ry="5.1" fill="none" stroke={colors.accent} strokeWidth="1.2" />
                ) : (
                  <ellipse cx={side * .9} cy="0" rx="2.9" ry="5.2" fill={colors.accent} />
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function WardrobePanel({ eyeStyle, headphoneStyle, musicMode, onEyeStyle, onHeadphoneStyle, onToggleMusic, onClose }) {
  return (
    <section className="window-menu wardrobe-menu" role="dialog" aria-label="装扮">
      <header className="menu-header" data-tauri-drag-region>
        <h1 data-tauri-drag-region>装扮</h1>
        <div className="window-actions">
          <button type="button" className="close" aria-label="关闭装扮" title="关闭装扮弹窗" onClick={onClose}>
            <IconX size={16} stroke={1.8} />
          </button>
        </div>
      </header>
      <div className="wardrobe-section">
        <div className="wardrobe-section-head">
          <h2>眼睛</h2>
          <span className="wardrobe-current">{midnightEyeStyles[eyeStyle]?.label}</span>
        </div>
        <div className="wardrobe-grid" role="radiogroup" aria-label="眼睛样式">
          {eyeStyleOptions.map(([key, { label }]) => (
            <button key={key} type="button" role="radio" aria-checked={eyeStyle === key}
              className="wardrobe-card" onClick={() => onEyeStyle(key)}>
              <EyePreview style={key} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="wardrobe-section">
        <div className="wardrobe-section-head">
          <h2>耳机</h2>
          <button type="button" className="wardrobe-music-pill" data-active={musicMode}
            onClick={onToggleMusic} title={musicMode ? '点击关闭听歌模式' : '点击开启听歌模式并佩戴耳机'}>
            <IconHeadphones size={12} stroke={2} />
            <span>{musicMode ? '听歌佩戴中' : '点此开启听歌'}</span>
          </button>
        </div>
        <div className="wardrobe-grid" role="radiogroup" aria-label="耳机样式">
          {headphoneStyleOptions.map(([key, { label }]) => (
            <button key={key} type="button" role="radio" aria-checked={headphoneStyle === key}
              className="wardrobe-card" onClick={() => onHeadphoneStyle(key)}>
              <HeadphonePreview style={key} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDownloadSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function openExternalUrl(url) {
  if (nativeWindow) {
    return invoke('open_external_url', { url });
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return Promise.resolve();
}

function AboutAndUpdates() {
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState(null);
  const [downloaded, setDownloaded] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const busyRef = useRef(false);

  useEffect(() => {
    if (!nativeWindow) return;
    let active = true;
    const registration = listen(UPDATE_PROGRESS_EVENT, ({ payload }) => {
      if (active && payload) setProgress(payload);
    });
    return () => {
      active = false;
      registration.then(unlisten => unlisten(), () => {});
    };
  }, []);

  async function checkUpdates() {
    if (busyRef.current) return;
    if (!nativeWindow) {
      setError('请在桌面应用中检查更新，或前往 GitHub 查看。');
      setStatus('error');
      return;
    }
    busyRef.current = true;
    setStatus('checking');
    setInfo(null);
    setDownloaded(null);
    setProgress(null);
    setError('');
    try {
      const result = await invoke('check_for_updates');
      setInfo(result);
      setStatus(result.hasUpdate ? 'available' : 'current');
    } catch (err) {
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : '无法检查更新，请前往 GitHub 查看。');
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }

  async function startDownload() {
    if (busyRef.current || !info?.hasUpdate || !info.assetName) return;
    busyRef.current = true;
    setStatus('downloading');
    setProgress({ downloadedBytes: 0, totalBytes: info.assetSize ?? 0 });
    setError('');
    try {
      const result = await invoke('download_update');
      setDownloaded(result);
      setStatus('downloaded');
    } catch (err) {
      setError(typeof err === 'string' ? err : err instanceof Error ? err.message : '安装包下载失败，请前往 GitHub 下载。');
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }

  const busy = status === 'checking' || status === 'downloading';
  const percent = progress && progress.totalBytes > 0
    ? Math.min(99, Math.floor((progress.downloadedBytes / progress.totalBytes) * 100))
    : 0;

  return (
    <div className="menu-about">
      <div className="update-row">
        <div className="update-version">
          <span className="about-label">当前版本</span>
          <strong className="about-version-tag">v{APP_VERSION}</strong>
        </div>
        <button type="button" className="update-check-btn" disabled={busy} onClick={checkUpdates}>
          <IconRefresh size={13} stroke={2} className={status === 'checking' ? 'is-spinning' : undefined} />
          <span>{status === 'checking' ? '检查中…' : '检查更新'}</span>
        </button>
      </div>

      {status === 'current' && (
        <div className="update-status is-current" role="status" aria-live="polite">
          <IconCircleCheck size={14} stroke={2} />
          <span>当前已是最新版本</span>
        </div>
      )}

      {info?.hasUpdate && status !== 'downloaded' && (
        <div className="update-card" role="status" aria-live="polite">
          <div className="update-card-head">
            <span>发现新版本 v{info.latestVersion}</span>
            {info.assetSize && <small>{formatDownloadSize(info.assetSize)}</small>}
          </div>
          {status === 'downloading' ? (
            <div className="update-progress">
              <div className="update-progress-meta"><span>正在下载…</span><span>{percent}%</span></div>
              <progress max={100} value={percent} aria-label="安装包下载进度" />
            </div>
          ) : (
            <div className="update-actions">
              {info.assetName && (
                <button type="button" className="update-primary-btn" disabled={busy} onClick={startDownload}>
                  <IconDownload size={13} stroke={2} />
                  <span>{status === 'error' ? '重试下载' : '下载新版本'}</span>
                </button>
              )}
              <button type="button" className="update-link-btn"
                onClick={() => openExternalUrl(info.releaseUrl || APP_DOWNLOAD_URL).catch(() => setError('无法打开浏览器'))}>
                <span>发布页</span>
                <IconExternalLink size={12} stroke={1.9} />
              </button>
            </div>
          )}
        </div>
      )}

      {downloaded && status === 'downloaded' && (
        <div className="update-card is-done" role="status">
          <div className="update-card-head">
            <span><IconCircleCheck size={14} stroke={2} /> 安装包已下载</span>
          </div>
          <span className="update-filename" title={downloaded.filePath}>{downloaded.fileName}</span>
          <div className="update-actions">
            <button type="button" className="update-primary-btn"
              onClick={() => invoke('open_update_download_directory').catch(err => setError(String(err)))}>
              打开下载文件夹
            </button>
          </div>
        </div>
      )}

      {error && <p className="update-error" role="alert">{error}</p>}

      <dl className="about-meta">
        <div>
          <dt>作者</dt>
          <dd>{APP_AUTHOR}</dd>
        </div>
        <div>
          <dt>仓库</dt>
          <dd>
            <button type="button" className="about-link" title={APP_REPOSITORY_URL}
              onClick={() => openExternalUrl(APP_REPOSITORY_URL).catch(() => setError('无法打开仓库链接'))}>
              <IconBrandGithub size={13} stroke={1.9} />
              <span>{APP_REPOSITORY_LABEL}</span>
              <IconExternalLink size={11} stroke={1.9} />
            </button>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function WindowMenu({ pinned, pinBusy, background, backgroundBusy, rewardsEnabled, musicMode, error, scale, opacity,
  eyeStyle, headphoneStyle, standalone = false, onTogglePin, onMinimize, onClose, onScale, onOpacity,
  onToggleBackground, onToggleRewards, onToggleMusic, onOpenWardrobe, onQuit }) {
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
        <button type="button" className="switch-row" role="switch" aria-checked={musicMode}
          onClick={onToggleMusic} title="给猫咪戴上耳机听歌晃头，怒气会逐渐减少">
          <span>听歌模式</span>
          <span className="switch-track" aria-hidden="true" />
        </button>
        <button type="button" className="switch-row nav-row" onClick={onOpenWardrobe}
          title="打开装扮弹窗，自定义眼睛和耳机样式">
          <span>装扮</span>
          <span className="nav-summary">
            <span>{midnightEyeStyles[eyeStyle]?.label} · {midnightHeadphoneStyles[headphoneStyle]?.label}</span>
            <IconChevronRight size={15} stroke={1.9} aria-hidden="true" />
          </span>
        </button>
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
      <AboutAndUpdates />
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
    musicMode: localStorage.getItem(musicPreference) === 'on',
    scale: savedScale(),
    opacity: savedOpacity(),
    eyeStyle: savedEyeStyle(),
    headphoneStyle: savedHeadphoneStyle(),
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
        musicMode={state.musicMode}
        error={state.error}
        scale={state.scale}
        opacity={state.opacity}
        eyeStyle={state.eyeStyle}
        headphoneStyle={state.headphoneStyle}
        onTogglePin={() => dispatch('togglePin')}
        onMinimize={() => dispatch('minimize')}
        onClose={() => invoke('hide_settings_window').catch(console.error)}
        onToggleBackground={() => dispatch('toggleBackground', !state.background)}
        onToggleRewards={() => dispatch('toggleRewards')}
        onToggleMusic={() => dispatch('toggleMusic')}
        onOpenWardrobe={() => invoke('toggle_wardrobe_window').catch(console.error)}
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

function WardrobeApp() {
  const [state, setState] = useState(() => ({
    eyeStyle: savedEyeStyle(),
    headphoneStyle: savedHeadphoneStyle(),
    musicMode: localStorage.getItem(musicPreference) === 'on',
  }));

  useEffect(() => {
    const registration = listen('settings-state', ({ payload }) => {
      if (payload && typeof payload === 'object') {
        setState(prev => ({
          ...prev,
          ...(payload.eyeStyle ? { eyeStyle: payload.eyeStyle } : {}),
          ...(payload.headphoneStyle ? { headphoneStyle: payload.headphoneStyle } : {}),
          ...(typeof payload.musicMode === 'boolean' ? { musicMode: payload.musicMode } : {}),
        }));
      }
    });
    registration.then(() => emit('settings-request-state')).catch(console.error);
    function handleKeyDown(event) {
      if (event.defaultPrevented || event.key !== 'Escape' || event.repeat) return;
      invoke('hide_wardrobe_window').catch(console.error);
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
      <WardrobePanel
        eyeStyle={state.eyeStyle}
        headphoneStyle={state.headphoneStyle}
        musicMode={state.musicMode}
        onEyeStyle={next => {
          setState(prev => ({ ...prev, eyeStyle: next }));
          dispatch('eyeStyle', next);
        }}
        onHeadphoneStyle={next => {
          setState(prev => ({ ...prev, headphoneStyle: next }));
          dispatch('headphoneStyle', next);
        }}
        onToggleMusic={() => {
          setState(prev => ({ ...prev, musicMode: !prev.musicMode }));
          dispatch('toggleMusic');
        }}
        onClose={() => invoke('hide_wardrobe_window').catch(console.error)}
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
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const pinnedRef = useRef(pinned);
  const [background, setBackground] = useState(false);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [rewardsEnabled, setRewardsEnabled] = useState(() => localStorage.getItem(rewardsPreference) !== 'off');
  const rewardsEnabledRef = useRef(rewardsEnabled);
  const [musicMode, setMusicMode] = useState(() => localStorage.getItem(musicPreference) === 'on');
  const musicModeRef = useRef(musicMode);
  const [scale, setScale] = useState(savedScale);
  const [opacity, setOpacity] = useState(savedOpacity);
  const [eyeStyle, setEyeStyle] = useState(savedEyeStyle);
  const eyeStyleRef = useRef(eyeStyle);
  const [headphoneStyle, setHeadphoneStyle] = useState(savedHeadphoneStyle);
  const headphoneStyleRef = useRef(headphoneStyle);
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
      musicMode,
      scale,
      opacity,
      eyeStyle,
      headphoneStyle,
      error: windowError,
    }).catch(() => {});
  };

  useEffect(() => {
    publishSettingsState.current();
  }, [pinned, pinBusy, background, backgroundBusy, rewardsEnabled, musicMode, scale, opacity, eyeStyle, headphoneStyle, windowError]);

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
      eyeStyle: eyeStyleRef.current, headphoneStyle: headphoneStyleRef.current,
      rewardsEnabled: rewardsEnabledRef.current,
      musicMode: musicModeRef.current, onStatus: setStatus }).then(controls => {
      if (!abort.signal.aborted) {
        sceneControls.current = controls;
        controls.setEyeStyle(eyeStyleRef.current);
        controls.setHeadphoneStyle(headphoneStyleRef.current);
        controls.setRewardsEnabled(rewardsEnabledRef.current);
        controls.setMusicMode(musicModeRef.current);
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
    invoke('hide_wardrobe_window').catch(() => {});
    nativeWindow.minimize().catch(reportWindowError);
  }

  function updateEyeStyle(next) {
    if (next === eyeStyleRef.current || !Object.hasOwn(midnightEyeStyles, next)) return;
    eyeStyleRef.current = next;
    setEyeStyle(next);
    sceneControls.current?.setEyeStyle(next);
    localStorage.setItem(eyeStylePreference, next);
  }

  function updateHeadphoneStyle(next) {
    if (next === headphoneStyleRef.current || !Object.hasOwn(midnightHeadphoneStyles, next)) return;
    headphoneStyleRef.current = next;
    setHeadphoneStyle(next);
    sceneControls.current?.setHeadphoneStyle(next);
    localStorage.setItem(headphoneStylePreference, next);
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

  function toggleMusicMode() {
    const enabled = !musicModeRef.current;
    musicModeRef.current = enabled;
    setMusicMode(enabled);
    sceneControls.current?.setMusicMode(enabled);
    localStorage.setItem(musicPreference, enabled ? 'on' : 'off');
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
      case 'toggleMusic':
        toggleMusicMode();
        break;
      case 'eyeStyle':
        updateEyeStyle(payload.value);
        break;
      case 'headphoneStyle':
        updateHeadphoneStyle(payload.value);
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
      {!nativeWindow && controlsOpen && !wardrobeOpen && <WindowMenu pinned={pinned} pinBusy={pinBusy}
        background={background} backgroundBusy={backgroundBusy}
        rewardsEnabled={rewardsEnabled} onToggleRewards={toggleRewards}
        musicMode={musicMode} onToggleMusic={toggleMusicMode}
        error={windowError} scale={scale} opacity={opacity}
        eyeStyle={eyeStyle} headphoneStyle={headphoneStyle}
        onTogglePin={togglePin} onMinimize={minimizeMain} onClose={() => setControlsOpen(false)}
        onScale={updateScale} onOpacity={updateOpacity}
        onOpenWardrobe={() => setWardrobeOpen(true)}
        onToggleBackground={() => updateBackground(!background)} />}
      {!nativeWindow && wardrobeOpen && <WardrobePanel
        eyeStyle={eyeStyle} headphoneStyle={headphoneStyle} musicMode={musicMode}
        onEyeStyle={updateEyeStyle} onHeadphoneStyle={updateHeadphoneStyle}
        onToggleMusic={toggleMusicMode} onClose={() => setWardrobeOpen(false)} />}
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

createRoot(document.getElementById('root')).render(
  isSettingsWindow ? <SettingsApp /> : isWardrobeWindow ? <WardrobeApp /> : <App />
);

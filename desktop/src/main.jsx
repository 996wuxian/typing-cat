import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { IconBrandGithub, IconChevronRight, IconCircleCheck, IconDownload, IconExternalLink, IconHeadphones, IconMinus, IconPin, IconPinnedOff, IconPower, IconRefresh, IconX } from '@tabler/icons-react';
import { getEyeStylesForCoat, isDogCoat, isEyeStyleAllowed, midnightCatCoats, midnightDogCoats, midnightEyeStyles, midnightHeadphoneStyles, midnightKeyboardStyles, midnightPetCoats, mountTypingCat } from '../../typing-cat-view.mjs';
import './styles.css';
import './rewards.css';

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '1.1.4';
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
const catCoatPreference = 'typing-cat.cat-coat';
const eyeStylePreference = 'typing-cat.eye-style';
const headphoneStylePreference = 'typing-cat.headphone-style';
const keyboardStylePreference = 'typing-cat.keyboard-style';
const catCoatOptions = Object.entries(midnightCatCoats);
const dogCoatOptions = Object.entries(midnightDogCoats);
const headphoneStyleOptions = Object.entries(midnightHeadphoneStyles);
const keyboardStyleOptions = Object.entries(midnightKeyboardStyles);
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

function savedCatCoat() {
  const saved = localStorage.getItem(catCoatPreference);
  return Object.hasOwn(midnightPetCoats, saved) ? saved : 'black';
}

function savedEyeStyle(coat = savedCatCoat()) {
  const saved = localStorage.getItem(eyeStylePreference);
  return isEyeStyleAllowed(saved, coat) ? saved : 'xiaohei';
}

function savedHeadphoneStyle() {
  const saved = localStorage.getItem(headphoneStylePreference);
  return Object.hasOwn(midnightHeadphoneStyles, saved) ? saved : 'cream';
}

function savedKeyboardStyle() {
  const saved = localStorage.getItem(keyboardStylePreference);
  return Object.hasOwn(midnightKeyboardStyles, saved) ? saved : 'cream';
}

function CatCoatPreview({ coat }) {
  const clipId = `coat-clip-${coat}`;
  const headPath = 'M36 44 C26 44 18 43 14 39 C7 34 6 24 11 16 C13 9 16 3 20 2 C23 1 26 7 29 11 C33 10.5 39 10.5 43 11 C46 7 49 1 52 2 C56 3 59 9 61 16 C66 24 65 34 58 39 C54 43 46 44 36 44 Z';
  const baseFill = {
    black: '#161615',
    siamese: '#f2e6d3',
    tabby: '#b0a69a',
    ragdoll: '#f8f4ee',
    orange: '#f3b165',
    calico: '#f8f4ed',
  }[coat] ?? '#161615';
  const rim = coat === 'black' ? '#e6ebf3' : '#584b44';
  const eyeRim = coat === 'black' || coat === 'siamese' ? 'none' : '#4a3d36';
  const nose = coat === 'black' || coat === 'siamese' ? '#3a2a23' : '#de929e';

  return (
    <svg className="wardrobe-preview-svg" viewBox="0 0 72 48" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={headPath} />
        </clipPath>
        {coat === 'siamese' && (
          <radialGradient id="siamese-mask-grad" cx="50%" cy="54%" r="50%">
            <stop offset="0%" stopColor="#3f2b22" />
            <stop offset="48%" stopColor="#4d362c" stopOpacity="0.86" />
            <stop offset="80%" stopColor="#6b4e3f" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#6b4e3f" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      <path d={headPath} fill={baseFill} stroke={rim} strokeWidth="1.6" />
      <g clipPath={`url(#${clipId})`}>
        {coat === 'siamese' && (
          <>
            <ellipse cx="18" cy="9" rx="9.5" ry="11.5" fill="#422e25" transform="rotate(-14 18 9)" />
            <ellipse cx="54" cy="9" rx="9.5" ry="11.5" fill="#422e25" transform="rotate(14 54 9)" />
            <ellipse cx="36" cy="30" rx="16.5" ry="11.5" fill="url(#siamese-mask-grad)" />
          </>
        )}
        {coat === 'tabby' && (
          <>
            <ellipse cx="19" cy="5" rx="6.5" ry="6.5" fill="#443b35" />
            <ellipse cx="53" cy="5" rx="6.5" ry="6.5" fill="#443b35" />
            <ellipse cx="19" cy="10" rx="3.5" ry="5.5" fill="#e0b2ae" transform="rotate(-12 19 10)" />
            <ellipse cx="53" cy="10" rx="3.5" ry="5.5" fill="#e0b2ae" transform="rotate(12 53 10)" />
            <ellipse cx="36" cy="39" rx="14" ry="8" fill="#f9f5ee" />
            <path d="M34.5 9 L36 18 L37.5 9 Z M28.5 9 L31.2 16.5 L31.6 9 Z M43.5 9 L40.8 16.5 L40.4 9 Z" fill="#443b35" />
            <path d="M8 26 L16.5 28 L8 28.8 Z M64 26 L55.5 28 L64 28.8 Z" fill="#443b35" />
          </>
        )}
        {coat === 'ragdoll' && (
          <>
            <polygon points="32,8 18,0 7,20 7,33 19,33 28,19" fill="#846e60" />
            <polygon points="40,8 54,0 65,20 65,33 53,33 44,19" fill="#846e60" />
            <polygon points="36,13 24,36 48,36" fill="#f8f4ee" />
            <ellipse cx="19" cy="10" rx="3.2" ry="5" fill="#e0bab8" transform="rotate(-12 19 10)" />
            <ellipse cx="53" cy="10" rx="3.2" ry="5" fill="#e0bab8" transform="rotate(12 53 10)" />
          </>
        )}
        {coat === 'orange' && (
          <>
            <ellipse cx="19" cy="5" rx="6.5" ry="6.5" fill="#de8a3e" />
            <ellipse cx="53" cy="5" rx="6.5" ry="6.5" fill="#de8a3e" />
            <ellipse cx="19" cy="10" rx="3.5" ry="5.5" fill="#f8c6ba" transform="rotate(-12 19 10)" />
            <ellipse cx="53" cy="10" rx="3.5" ry="5.5" fill="#f8c6ba" transform="rotate(12 53 10)" />
            <ellipse cx="36" cy="39.5" rx="19" ry="9" fill="#fff8ed" />
            <path d="M34.5 9 L36 18 L37.5 9 Z M28.5 9 L31.2 16.5 L31.6 9 Z M43.5 9 L40.8 16.5 L40.4 9 Z" fill="#ce742c" />
            <path d="M8 26 L16.5 28 L8 28.8 Z M64 26 L55.5 28 L64 28.8 Z" fill="#ce742c" />
          </>
        )}
        {coat === 'calico' && (
          <>
            <ellipse cx="19" cy="15" rx="15" ry="16" fill="#e68a42" transform="rotate(-10 19 15)" />
            <ellipse cx="54" cy="16" rx="14" ry="16" fill="#2c2a2c" transform="rotate(10 54 16)" />
            <ellipse cx="19" cy="10" rx="3.3" ry="5.2" fill="#f4b8ae" transform="rotate(-12 19 10)" />
            <ellipse cx="53" cy="10" rx="3.3" ry="5.2" fill="#d6a2a6" transform="rotate(12 53 10)" />
          </>
        )}
      </g>
      {[-1, 1].map(side => {
        const cx = 36 + side * 10.5;
        return (
          <g key={side}>
            <circle cx={cx} cy="27" r="5.6" fill="#fbf8ee" stroke={eyeRim} strokeWidth="1" />
            <circle cx={cx} cy="27" r="4.0" fill="#161615" />
            <circle cx={cx + side * 1.4} cy="25.8" r="1.15" fill="#ffe078" />
          </g>
        );
      })}
      <ellipse cx="36" cy="34.5" rx="2.0" ry="1.0" fill={nose} />
    </svg>
  );
}

function DogCoatPreview({ coat }) {
  const clipId = `dog-coat-clip-${coat}`;
  const isCorgi = coat === 'corgi';
  const isHusky = coat === 'husky';
  const isSamoyed = coat === 'samoyed';
  const isRound = coat === 'golden' || coat === 'border';
  const headPath = isCorgi
    ? 'M36 44 C26 44 17 42 13 37 C7 32 7 23 11 16 C4 8 5 1 13 1 C21 0 27 8 30 13 C33 12.5 39 12.5 42 13 C45 8 51 0 59 1 C67 1 68 8 61 16 C65 23 65 32 59 37 C55 42 46 44 36 44 Z'
    : isHusky
      ? 'M36 44 C26 44 17 42 13 36 C7 31 7 22 12 15 C13 8 16 1 21 1 C26 0 29 8 31 13 C34 12.5 38 12.5 41 13 C43 8 46 0 51 1 C56 1 59 8 60 15 C65 22 65 31 59 36 C55 42 46 44 36 44 Z'
      : isSamoyed
        ? 'M36 45 C26 45 17 43 12 38 C7 36 5 31 8 27 C4 23 6 16 11 13 C12 8 15 3 20 3 C25 3 28 9 30 13 C33 11.5 39 11.5 42 13 C44 9 47 3 52 3 C57 3 60 8 61 13 C66 16 68 23 64 27 C67 31 65 36 60 38 C55 43 46 45 36 45 Z'
        : isRound
          ? 'M36 44 C26 44 17 42 13 37 C7 31 7 21 11 14 C15 7 24 5 36 5 C48 5 57 7 61 14 C65 21 65 31 59 37 C55 42 46 44 36 44 Z'
          : 'M36 44 C24 44 15 42 10 36 C5 31 6 22 11 15 C11 9 13 4 19 4 C24 4 27 9 30 13 C33 12.5 39 12.5 42 13 C45 9 48 4 53 4 C59 4 61 9 61 15 C66 22 67 31 62 36 C57 42 48 44 36 44 Z';
  const baseFill = {
    husky: '#fbfaf7',
    shiba: '#df8b3c',
    corgi: '#e2913c',
    golden: '#f0be6a',
    samoyed: '#ffffff',
    border: '#ffffff',
  }[coat] ?? '#fbfaf7';
  const rim = {
    husky: '#363c48',
    shiba: '#6f401c',
    corgi: '#734522',
    golden: '#825724',
    samoyed: '#76757a',
    border: '#2d313a',
  }[coat] ?? '#4a3d36';

  return (
    <svg className="wardrobe-preview-svg" viewBox="0 0 72 48" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={headPath} />
        </clipPath>
      </defs>
      {coat === 'golden' && (
        <>
          <path d="M18 9 C9 6 3 13 3 27 C3 39 9 43 15 39 C18 36 17 24 18 9 Z" fill="#cf8b32" stroke={rim} strokeWidth="1.5" />
          <path d="M54 9 C63 6 69 13 69 27 C69 39 63 43 57 39 C54 36 55 24 54 9 Z" fill="#cf8b32" stroke={rim} strokeWidth="1.5" />
        </>
      )}
      {coat === 'border' && (
        <>
          <path d="M24 10 C22 3 17 0 12 2 C9 4 10 11 12 16 Z" fill="#20232a" stroke={rim} strokeWidth="1.5" />
          <path d="M18 4 C12 2 6 5 4 12 C3 15 7 17 11 14 Z" fill="#20232a" stroke={rim} strokeWidth="1.4" />
          <path d="M48 10 C50 3 55 0 60 2 C63 4 62 11 60 16 Z" fill="#20232a" stroke={rim} strokeWidth="1.5" />
          <path d="M54 4 C60 2 66 5 68 12 C69 15 65 17 61 14 Z" fill="#20232a" stroke={rim} strokeWidth="1.4" />
        </>
      )}
      <path d={headPath} fill={baseFill} stroke={rim} strokeWidth="1.6" />
      <g clipPath={`url(#${clipId})`}>
        {coat === 'husky' && (
          <>
            <path d="M4 0 L68 0 L68 27 C61 24 58 16 50 14 C44 13 39 15 36 19 C33 15 28 13 22 14 C14 16 11 24 4 27 Z" fill="#383f4d" />
            <ellipse cx="23" cy="8.5" rx="2.7" ry="5.4" fill="#e2b9bf" transform="rotate(-10 23 8.5)" />
            <ellipse cx="49" cy="8.5" rx="2.7" ry="5.4" fill="#e2b9bf" transform="rotate(10 49 8.5)" />
            <ellipse cx="28.5" cy="14" rx="3.2" ry="1.8" fill="#fbfaf7" transform="rotate(16 28.5 14)" />
            <ellipse cx="43.5" cy="14" rx="3.2" ry="1.8" fill="#fbfaf7" transform="rotate(-16 43.5 14)" />
            <path d="M36 8 Q34 14 36 18 Q38 14 36 8 Z" fill="#fbfaf7" />
          </>
        )}
        {coat === 'shiba' && (
          <>
            <ellipse cx="18" cy="8" rx="6.5" ry="6.5" fill="#bd6420" />
            <ellipse cx="54" cy="8" rx="6.5" ry="6.5" fill="#bd6420" />
            <ellipse cx="19" cy="10.5" rx="3.2" ry="4.5" fill="#fff1e0" transform="rotate(-14 19 10.5)" />
            <ellipse cx="53" cy="10.5" rx="3.2" ry="4.5" fill="#fff1e0" transform="rotate(14 53 10.5)" />
            <path d="M4 46 L4 24 C10 21 18 22 24 28 C29 32 33 28 36 24 C39 28 43 32 48 28 C54 22 62 21 68 24 L68 46 Z" fill="#fff9ee" />
            <ellipse cx="27.5" cy="16.5" rx="2.8" ry="1.65" fill="#fff9ee" transform="rotate(-12 27.5 16.5)" />
            <ellipse cx="44.5" cy="16.5" rx="2.8" ry="1.65" fill="#fff9ee" transform="rotate(12 44.5 16.5)" />
          </>
        )}
        {coat === 'corgi' && (
          <>
            <ellipse cx="15" cy="8" rx="8" ry="9" fill="#c67326" transform="rotate(-18 15 8)" />
            <ellipse cx="57" cy="8" rx="8" ry="9" fill="#c67326" transform="rotate(18 57 8)" />
            <ellipse cx="16" cy="9.5" rx="4.6" ry="7.4" fill="#f5b8b8" transform="rotate(-20 16 9.5)" />
            <ellipse cx="56" cy="9.5" rx="4.6" ry="7.4" fill="#f5b8b8" transform="rotate(20 56 9.5)" />
            <path d="M36 9 C32 14 31 21 30 27 C23 27 14 27 6 33 L6 46 L66 46 L66 33 C58 27 49 27 42 27 C41 21 40 14 36 9 Z" fill="#ffffff" />
          </>
        )}
        {coat === 'golden' && (
          <>
            <ellipse cx="36" cy="13" rx="18" ry="8" fill="#d9953a" opacity="0.34" />
            <ellipse cx="36" cy="35" rx="16" ry="9.5" fill="#fff6df" opacity="0.88" />
          </>
        )}
        {coat === 'samoyed' && (
          <>
            <ellipse cx="20" cy="10" rx="3.2" ry="4.8" fill="#f5c2c8" transform="rotate(-12 20 10)" />
            <ellipse cx="52" cy="10" rx="3.2" ry="4.8" fill="#f5c2c8" transform="rotate(12 52 10)" />
          </>
        )}
        {coat === 'border' && (
          <>
            <path d="M33.5 4 L5 4 L5 33 C14 33 21 30 26 26 C30 22 31.5 14 33.5 4 Z" fill="#20232a" />
            <path d="M38.5 4 L67 4 L67 33 C58 33 51 30 46 26 C42 22 40.5 14 38.5 4 Z" fill="#20232a" />
          </>
        )}
      </g>
      {/* Smaller, higher-set dog eyes */}
      {[-1, 1].map(side => {
        const cx = 36 + side * 9.2;
        return (
          <g key={side}>
            <circle cx={cx} cy="23.5" r="4.3" fill="#fbf8ee" stroke={rim} strokeWidth="1" />
            <circle cx={cx} cy="23.5" r="3.1" fill={coat === 'husky' ? '#5aa8f7' : '#161615'} />
            {coat === 'husky' && <circle cx={cx} cy="23.5" r="1.65" fill="#161615" />}
            <circle cx={cx + side * .95} cy="22.4" r=".9" fill="#ffffff" />
          </g>
        );
      })}
      {/* Prominent glossy dog nose + clean smile & pink tongue */}
      <ellipse cx="36" cy="30.8" rx="3.9" ry="2.6" fill={coat === 'golden' ? '#3a2419' : '#201e22'} />
      <ellipse cx="34.8" cy="29.9" rx="1.05" ry=".5" fill="#ffffff70" />
      {(coat === 'golden' || coat === 'samoyed' || coat === 'husky' || coat === 'corgi') && (
        <path d="M33.4 35.6 C33.2 40.2 38.8 40.2 38.6 35.6 Z" fill="#ff88a6" stroke="#b84b6b" strokeWidth="0.7" />
      )}
      <path d={coat === 'samoyed'
        ? 'M36 33.2 L36 35.4 M29.5 34.0 Q32.8 37.8 36 35.4 Q39.2 37.8 42.5 34.0'
        : 'M36 33.2 L36 35.4 M30.6 34.7 Q33.3 37.4 36 35.4 Q38.7 37.4 41.4 34.7'}
        fill="none" stroke={coat === 'samoyed' ? '#242327' : rim} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function EyePreview({ style, coat = 'black' }) {
  const bg = {
    black: '#161615',
    siamese: '#4b352b',
    tabby: '#b0a69a',
    ragdoll: '#f8f4ee',
    orange: '#f3b165',
    calico: '#f8f4ed',
    husky: '#fbfaf7',
    shiba: '#e69b50',
    corgi: '#e9a354',
    golden: '#f1c476',
    samoyed: '#fbfaf7',
    border: '#262930',
  }[coat] ?? '#161615';
  const rim = coat === 'black' || coat === 'border' ? '#fbf8ee' : '#584b44';
  const eyeRim = coat === 'black' || coat === 'siamese' || coat === 'border' ? 'none' : '#4a3d36';
  const gradId = `eye-grad-${style}`;
  return (
    <svg className="wardrobe-preview-svg" viewBox="0 0 64 36" aria-hidden="true">
      <defs>
        {style === 'amber' && (
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc8622" />
            <stop offset="52%" stopColor="#f7b640" />
            <stop offset="100%" stopColor="#ffe68c" />
          </linearGradient>
        )}
        {style === 'sapphire' && (
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3274e0" />
            <stop offset="52%" stopColor="#68b2fc" />
            <stop offset="100%" stopColor="#bde9ff" />
          </linearGradient>
        )}
      </defs>
      <rect x="2" y="2" width="60" height="32" rx="11" fill={bg} stroke={rim} strokeWidth="1.6" />
      {[-1, 1].map(side => {
        const cx = 32 + side * 13;
        const cy = 18;
        if (style === 'ring') {
          return <ellipse key={side} cx={cx} cy={cy} rx="7.6" ry="8.1" fill="none" stroke="#fbf8ee" strokeWidth="2.1" />;
        }
        if (style === 'lime') {
          return (
            <g key={side}>
              <ellipse cx={cx} cy={cy} rx="8.1" ry="8.4" fill="#daf478" stroke={eyeRim} strokeWidth="1.2" />
              <ellipse cx={cx} cy={cy + .4} rx="3.8" ry="5.5" fill="#161615" />
              <circle cx={cx - 1.3} cy={cy - 1.8} r="1.15" fill="#f7ffdb" />
            </g>
          );
        }
        if (style === 'amber' || style === 'sapphire') {
          const shine = style === 'amber' ? '#fffcef' : '#f4fcff';
          const glow = style === 'amber' ? '#fff0ad88' : '#dcf4ff99';
          return (
            <g key={side}>
              <ellipse cx={cx} cy={cy} rx="8.3" ry="8.5" fill={`url(#${gradId})`} stroke={eyeRim} strokeWidth="1.2" />
              <ellipse cx={cx} cy={cy + 3.6} rx="5.5" ry="3.2" fill={glow} />
              <ellipse cx={cx} cy={cy + .2} rx="4.1" ry="5.4" fill="#161615" />
              <circle cx={cx - 1.5} cy={cy - 2.1} r="1.4" fill={shine} />
              <circle cx={cx + 1.7} cy={cy + 2.2} r=".85" fill={shine} />
            </g>
          );
        }
        return (
          <g key={side}>
            <ellipse cx={cx} cy={cy} rx="8.7" ry="8.8" fill="#fbf8ee" stroke={eyeRim} strokeWidth="1.2" />
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

function KeyboardPreview({ style }) {
  const theme = midnightKeyboardStyles[style] ?? midnightKeyboardStyles.cream;
  const row0 = theme.rows[0][0];
  const row1 = theme.rows[1][0];
  const accentA = theme.accents?.Tab ?? theme.activeColor;
  const accentB = theme.accents?.Enter ?? theme.accents?.ArrowRight ?? accentA;
  return (
    <svg className="wardrobe-preview-svg" viewBox="0 0 72 44" aria-hidden="true">
      <rect x="4" y="9" width="64" height="27" rx="5.5" fill={theme.plateColor} />
      <rect x="7" y="12" width="58" height="21" rx="3.2" fill={theme.insertColor} />
      {/* Top row */}
      <rect x="9" y="14" width="8.5" height="4.8" rx="1.3" fill={accentA} />
      {[19, 26.5, 34, 41.5, 49].map(x => (
        <rect key={x} x={x} y="14" width="6.2" height="4.8" rx="1.3" fill={row0} />
      ))}
      <rect x="56.5" y="14" width="6.5" height="4.8" rx="1.3" fill={row0} />
      {/* Middle row */}
      <rect x="9" y="20.2" width="6.5" height="4.8" rx="1.3" fill={row1} />
      {[16.8, 24.3, 31.8, 39.3, 46.8].map(x => (
        <rect key={x} x={x} y="20.2" width="6.2" height="4.8" rx="1.3" fill={row1} />
      ))}
      <rect x="54.3" y="20.2" width="8.7" height="4.8" rx="1.3" fill={accentB} />
      {/* Bottom row with spacebar */}
      <rect x="9" y="26.4" width="8.5" height="4.8" rx="1.3" fill={row0} />
      <rect x="19" y="26.4" width="28.5" height="4.8" rx="1.3" fill={theme.accents?.Space ?? row1} />
      <rect x="49" y="26.4" width="6.2" height="4.8" rx="1.3" fill={row0} />
      <rect x="56.5" y="26.4" width="6.5" height="4.8" rx="1.3" fill={accentA} />
    </svg>
  );
}

function WardrobePanel({ catCoat, eyeStyle, headphoneStyle, keyboardStyle, musicMode,
  onCatCoat, onEyeStyle, onHeadphoneStyle, onKeyboardStyle, onToggleMusic, onClose }) {
  const [speciesTab, setSpeciesTab] = useState(() => (isDogCoat(catCoat) ? 'dog' : 'cat'));
  useEffect(() => {
    setSpeciesTab(isDogCoat(catCoat) ? 'dog' : 'cat');
  }, [catCoat]);
  const visibleEyeStyles = getEyeStylesForCoat(catCoat);
  const showingDogs = speciesTab === 'dog';
  const petOptions = showingDogs ? dogCoatOptions : catCoatOptions;
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
      <div className="wardrobe-body">
        <div className="wardrobe-section">
          <div className="wardrobe-section-head">
            <div className="wardrobe-species-tabs" role="tablist" aria-label="宠物类型">
              <button type="button" role="tab" aria-selected={!showingDogs}
                className="wardrobe-species-tab" onClick={() => setSpeciesTab('cat')}>猫咪</button>
              <button type="button" role="tab" aria-selected={showingDogs}
                className="wardrobe-species-tab" onClick={() => setSpeciesTab('dog')}>狗狗</button>
            </div>
            <span className="wardrobe-current">{midnightPetCoats[catCoat]?.label}</span>
          </div>
          <div className="wardrobe-grid" role="radiogroup" aria-label={showingDogs ? '狗狗品种' : '猫咪品种'}>
            {petOptions.map(([key, { label }]) => (
              <button key={key} type="button" role="radio" aria-checked={catCoat === key}
                className="wardrobe-card" onClick={() => onCatCoat(key)}>
                {showingDogs ? <DogCoatPreview coat={key} /> : <CatCoatPreview coat={key} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="wardrobe-section">
          <div className="wardrobe-section-head">
            <h2>眼睛</h2>
            <span className="wardrobe-current">{midnightEyeStyles[eyeStyle]?.label}</span>
          </div>
          <div className="wardrobe-grid" role="radiogroup" aria-label="眼睛样式">
            {visibleEyeStyles.map(([key, { label }]) => (
              <button key={key} type="button" role="radio" aria-checked={eyeStyle === key}
                className="wardrobe-card" onClick={() => onEyeStyle(key)}>
                <EyePreview style={key} coat={catCoat} />
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
        <div className="wardrobe-section">
          <div className="wardrobe-section-head">
            <h2>键盘与鼠标</h2>
            <span className="wardrobe-current">{midnightKeyboardStyles[keyboardStyle]?.label}</span>
          </div>
          <div className="wardrobe-grid" role="radiogroup" aria-label="键盘与鼠标样式">
            {keyboardStyleOptions.map(([key, { label }]) => (
              <button key={key} type="button" role="radio" aria-checked={keyboardStyle === key}
                className="wardrobe-card" onClick={() => onKeyboardStyle(key)}>
                <KeyboardPreview style={key} />
                <span>{label}</span>
              </button>
            ))}
          </div>
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
  catCoat, eyeStyle, headphoneStyle, standalone = false, onTogglePin, onMinimize, onClose, onScale, onOpacity,
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
          onClick={onToggleRewards}
          title={isDogCoat(catCoat) ? '开启攒骨头、怒气与喂食玩法' : '开启攒鱼、怒气与喂食玩法'}>
          <span>{isDogCoat(catCoat) ? '攒骨头与怒气' : '攒鱼与怒气'}</span>
          <span className="switch-track" aria-hidden="true" />
        </button>
        <button type="button" className="switch-row" role="switch" aria-checked={musicMode}
          onClick={onToggleMusic} title="给猫咪戴上耳机听歌晃头，怒气会逐渐减少">
          <span>听歌模式</span>
          <span className="switch-track" aria-hidden="true" />
        </button>
        <button type="button" className="switch-row nav-row" onClick={onOpenWardrobe}
          title="打开装扮弹窗，自定义猫咪/狗狗、眼睛、耳机与键鼠样式">
          <span>装扮</span>
          <span className="nav-summary">
            <span>{midnightPetCoats[catCoat]?.label} · {midnightEyeStyles[eyeStyle]?.label}</span>
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
    catCoat: savedCatCoat(),
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
        catCoat={state.catCoat}
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
    catCoat: savedCatCoat(),
    eyeStyle: savedEyeStyle(),
    headphoneStyle: savedHeadphoneStyle(),
    keyboardStyle: savedKeyboardStyle(),
    musicMode: localStorage.getItem(musicPreference) === 'on',
  }));

  useEffect(() => {
    const registration = listen('settings-state', ({ payload }) => {
      if (payload && typeof payload === 'object') {
        setState(prev => ({
          ...prev,
          ...(payload.catCoat ? { catCoat: payload.catCoat } : {}),
          ...(payload.eyeStyle ? { eyeStyle: payload.eyeStyle } : {}),
          ...(payload.headphoneStyle ? { headphoneStyle: payload.headphoneStyle } : {}),
          ...(payload.keyboardStyle ? { keyboardStyle: payload.keyboardStyle } : {}),
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
        catCoat={state.catCoat}
        eyeStyle={state.eyeStyle}
        headphoneStyle={state.headphoneStyle}
        keyboardStyle={state.keyboardStyle}
        musicMode={state.musicMode}
        onCatCoat={next => {
          setState(prev => ({
            ...prev,
            catCoat: next,
            eyeStyle: isEyeStyleAllowed(prev.eyeStyle, next) ? prev.eyeStyle : 'xiaohei',
          }));
          dispatch('catCoat', next);
        }}
        onEyeStyle={next => {
          setState(prev => ({ ...prev, eyeStyle: next }));
          dispatch('eyeStyle', next);
        }}
        onHeadphoneStyle={next => {
          setState(prev => ({ ...prev, headphoneStyle: next }));
          dispatch('headphoneStyle', next);
        }}
        onKeyboardStyle={next => {
          setState(prev => ({ ...prev, keyboardStyle: next }));
          dispatch('keyboardStyle', next);
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
  const draggingRef = useRef(false);
  const previewDragRef = useRef(null);
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
  const [catCoat, setCatCoat] = useState(savedCatCoat);
  const catCoatRef = useRef(catCoat);
  const [eyeStyle, setEyeStyle] = useState(savedEyeStyle);
  const eyeStyleRef = useRef(eyeStyle);
  const [headphoneStyle, setHeadphoneStyle] = useState(savedHeadphoneStyle);
  const headphoneStyleRef = useRef(headphoneStyle);
  const [keyboardStyle, setKeyboardStyle] = useState(savedKeyboardStyle);
  const keyboardStyleRef = useRef(keyboardStyle);
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
      catCoat,
      eyeStyle,
      headphoneStyle,
      keyboardStyle,
      error: windowError,
    }).catch(() => {});
  };

  useEffect(() => {
    publishSettingsState.current();
  }, [pinned, pinBusy, background, backgroundBusy, rewardsEnabled, musicMode, scale, opacity, catCoat, eyeStyle, headphoneStyle, keyboardStyle, windowError]);

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
      catCoat: catCoatRef.current, eyeStyle: eyeStyleRef.current,
      headphoneStyle: headphoneStyleRef.current, keyboardStyle: keyboardStyleRef.current,
      rewardsEnabled: rewardsEnabledRef.current,
      musicMode: musicModeRef.current, onStatus: setStatus }).then(controls => {
      if (!abort.signal.aborted) {
        sceneControls.current = controls;
        controls.setCatCoat(catCoatRef.current);
        controls.setEyeStyle(eyeStyleRef.current);
        controls.setHeadphoneStyle(headphoneStyleRef.current);
        controls.setKeyboardStyle(keyboardStyleRef.current);
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

  function updateCatCoat(next) {
    if (next === catCoatRef.current || !Object.hasOwn(midnightPetCoats, next)) return;
    catCoatRef.current = next;
    setCatCoat(next);
    sceneControls.current?.setCatCoat(next);
    localStorage.setItem(catCoatPreference, next);
    if (!isEyeStyleAllowed(eyeStyleRef.current, next)) {
      eyeStyleRef.current = 'xiaohei';
      setEyeStyle('xiaohei');
      sceneControls.current?.setEyeStyle('xiaohei');
      localStorage.setItem(eyeStylePreference, 'xiaohei');
    }
  }

  function updateEyeStyle(next) {
    if (next === eyeStyleRef.current || !isEyeStyleAllowed(next, catCoatRef.current)) return;
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

  function updateKeyboardStyle(next) {
    if (next === keyboardStyleRef.current || !Object.hasOwn(midnightKeyboardStyles, next)) return;
    keyboardStyleRef.current = next;
    setKeyboardStyle(next);
    sceneControls.current?.setKeyboardStyle(next);
    localStorage.setItem(keyboardStylePreference, next);
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
      case 'catCoat':
        updateCatCoat(payload.value);
        break;
      case 'eyeStyle':
        updateEyeStyle(payload.value);
        break;
      case 'headphoneStyle':
        updateHeadphoneStyle(payload.value);
        break;
      case 'keyboardStyle':
        updateKeyboardStyle(payload.value);
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
    const dragMotion = listen('window-drag-motion', ({ payload }) => {
      if (Array.isArray(payload) && payload.length === 2) {
        sceneControls.current?.pushCarryMotion(payload[0], payload[1]);
      }
    });
    Promise.all([registration, buttons, dragMotion]).then(() => {
      if (active) return invoke('start_desktop_pointer');
    }).catch(error => console.error(error));
    return () => {
      active = false;
      registration.then(unlisten => unlisten(), () => {});
      buttons.then(unlisten => unlisten(), () => {});
      dragMotion.then(unlisten => unlisten(), () => {});
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
    if (previewDragRef.current) {
      previewDragRef.current = null;
      draggingRef.current = false;
      sceneControls.current?.setCarried(false);
    }
    if (!draggingRef.current && target.current) delete target.current.dataset.dragging;
  }

  useEffect(() => {
    function handleMove(event) {
      const preview = previewDragRef.current;
      if (preview && preview.id === event.pointerId) {
        sceneControls.current?.pushCarryMotion(event.clientX - preview.x, event.clientY - preview.y);
        preview.x = event.clientX;
        preview.y = event.clientY;
        return;
      }
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

  function startNativeDrag(pointerId, clientX, clientY) {
    if (draggingRef.current) return;
    draggingRef.current = true;
    if (target.current) target.current.dataset.dragging = 'true';
    sceneControls.current?.cancelPointerInteractions();
    sceneControls.current?.setCarried(true);
    if (!nativeWindow) {
      previewDragRef.current = { id: pointerId, x: clientX, y: clientY };
      return;
    }
    invoke('begin_window_drag').catch(reportWindowError).finally(() => {
      draggingRef.current = false;
      sceneControls.current?.setCarried(false);
      if (target.current) delete target.current.dataset.dragging;
    });
  }

  function handleStagePointerDown(event) {
    if (controlsOpen) setControlsOpen(false);
    if (event.button !== 0 || event.target.closest('.fish-bank')) return;
    if (event.altKey) {
      clearLongPress();
      event.preventDefault();
      event.stopPropagation();
      startNativeDrag(event.pointerId, event.clientX, event.clientY);
      return;
    }
    clearLongPress();
    if (sceneControls.current?.isHeadPoint(event.clientX, event.clientY)) return;
    const { pointerId: id, clientX: x, clientY: y } = event;
    const timer = setTimeout(() => {
      dragPress.current = null;
      if (target.current?.dataset.petting === 'true') return;
      startNativeDrag(id, x, y);
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
        catCoat={catCoat} eyeStyle={eyeStyle} headphoneStyle={headphoneStyle}
        onTogglePin={togglePin} onMinimize={minimizeMain} onClose={() => setControlsOpen(false)}
        onScale={updateScale} onOpacity={updateOpacity}
        onOpenWardrobe={() => setWardrobeOpen(true)}
        onToggleBackground={() => updateBackground(!background)} />}
      {!nativeWindow && wardrobeOpen && <WardrobePanel
        catCoat={catCoat} eyeStyle={eyeStyle} headphoneStyle={headphoneStyle} keyboardStyle={keyboardStyle}
        musicMode={musicMode} onCatCoat={updateCatCoat} onEyeStyle={updateEyeStyle}
        onHeadphoneStyle={updateHeadphoneStyle} onKeyboardStyle={updateKeyboardStyle}
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

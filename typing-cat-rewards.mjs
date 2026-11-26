const storageKey = 'typing-cat.rewards';
const keysPerFish = 500;
const maxAnger = 100;
const showAngerAt = 30;
const angerPerFish = 42;
const paceWindow = 2.5;
const maxAngerPerSecond = 1.1;
const fishIcon = '<canvas class="fish-icon" width="102" height="66" aria-hidden="true"></canvas>';

function drawFishIcon(canvas) {
  const paint = canvas.getContext('2d');
  if (!paint) return;
  paint.setTransform(1, 0, 0, 1, 0, 0);
  paint.clearRect(0, 0, canvas.width, canvas.height);
  paint.scale(3, 3);
  paint.beginPath();
  paint.moveTo(2.7, 11.6);
  paint.bezierCurveTo(2.8, 6.7, 7.3, 3.4, 13, 3.7);
  paint.quadraticCurveTo(15.5, 1.8, 19, 2.7);
  paint.quadraticCurveTo(18.1, 4.1, 18.8, 5.5);
  paint.quadraticCurveTo(21.4, 6.9, 22.8, 9.2);
  paint.quadraticCurveTo(26.6, 5.4, 31.4, 4.8);
  paint.quadraticCurveTo(29.1, 9.6, 29.2, 11.2);
  paint.quadraticCurveTo(29.1, 13, 31.4, 17.9);
  paint.quadraticCurveTo(26.7, 16.9, 22.7, 13.4);
  paint.bezierCurveTo(20.3, 17.9, 16.4, 20.4, 11, 19.8);
  paint.bezierCurveTo(6.1, 19.3, 2.7, 15.9, 2.7, 11.6);
  paint.closePath();
  paint.fillStyle = '#171719';
  paint.fill();
  paint.strokeStyle = '#fff';
  paint.lineWidth = 1.65;
  paint.lineJoin = 'round';
  paint.stroke();

  paint.beginPath();
  paint.moveTo(11, 8.1);
  paint.quadraticCurveTo(14, 11.5, 11, 15.4);
  paint.strokeStyle = '#81827b';
  paint.lineWidth = .8;
  paint.lineCap = 'round';
  paint.stroke();
  paint.beginPath();
  paint.arc(7.4, 10.4, 1.25, 0, Math.PI * 2);
  paint.fillStyle = '#dff375';
  paint.fill();
}

function drawBoneIcon(canvas) {
  const paint = canvas.getContext('2d');
  if (!paint) return;
  paint.setTransform(1, 0, 0, 1, 0, 0);
  paint.clearRect(0, 0, canvas.width, canvas.height);
  paint.scale(3, 3);
  paint.beginPath();
  // Smooth continuous cartoon bone outline
  paint.moveTo(11.2, 8.6);
  paint.quadraticCurveTo(17, 9.2, 22.8, 8.6);
  paint.bezierCurveTo(23.6, 5.3, 27.9, 4.4, 29.6, 7.1);
  paint.bezierCurveTo(30.6, 8.8, 29.8, 10.7, 28.4, 11.3);
  paint.bezierCurveTo(29.8, 11.9, 30.6, 13.8, 29.6, 15.5);
  paint.bezierCurveTo(27.9, 18.2, 23.6, 17.3, 22.8, 14.0);
  paint.quadraticCurveTo(17, 13.4, 11.2, 14.0);
  paint.bezierCurveTo(10.4, 17.3, 6.1, 18.2, 4.4, 15.5);
  paint.bezierCurveTo(3.4, 13.8, 4.2, 11.9, 5.6, 11.3);
  paint.bezierCurveTo(4.2, 10.7, 3.4, 8.8, 4.4, 7.1);
  paint.bezierCurveTo(6.1, 4.4, 10.4, 5.3, 11.2, 8.6);
  paint.closePath();

  // Crisp sticker white outer halo + dark outline + warm ivory bone fill
  paint.lineJoin = 'round';
  paint.lineCap = 'round';
  paint.strokeStyle = '#ffffff';
  paint.lineWidth = 3.1;
  paint.stroke();
  paint.strokeStyle = '#332720';
  paint.lineWidth = 1.65;
  paint.stroke();

  const grad = paint.createLinearGradient(0, 6, 0, 17);
  grad.addColorStop(0, '#fffdf7');
  grad.addColorStop(.68, '#f9f0df');
  grad.addColorStop(1, '#e8d9c0');
  paint.fillStyle = grad;
  paint.fill();

  // Subtle bone shaft shine
  paint.beginPath();
  paint.moveTo(12.2, 10.2);
  paint.quadraticCurveTo(17, 10.6, 21.8, 10.2);
  paint.strokeStyle = '#ffffffcc';
  paint.lineWidth = .95;
  paint.stroke();
}

function drawTreatIcon(canvas, isDog) {
  if (isDog) drawBoneIcon(canvas);
  else drawFishIcon(canvas);
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const integer = (value, max) => Number.isSafeInteger(value) ? Math.max(0, Math.min(value, max)) : 0;
    return {
      fish: integer(saved?.fish, Number.MAX_SAFE_INTEGER),
      progress: integer(saved?.progress, keysPerFish - 1),
      anger: Number.isFinite(saved?.anger) ? Math.max(0, Math.min(saved.anger, maxAnger)) : 0,
    };
  } catch {
    return { fish: 0, progress: 0, anger: 0 };
  }
}

export function createCatRewards(stage, { enabled = true, isDog: initialIsDog = false, canFeedAt, onFeed }) {
  const state = readState();
  let isDog = Boolean(initialIsDog);
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hud = document.createElement('div');
  hud.className = 'reward-hud';
  hud.hidden = !enabled;
  hud.innerHTML = `
    <div class="reward-drawer" data-open="false">
      <div class="reward-reveal">
        <div class="reward-row">
          <button type="button" class="fish-bank">
            ${fishIcon}<span class="fish-count"></span>
          </button>
          <div class="reward-panel">
            <span class="reward-progress-label">攒鱼</span>
            <div class="reward-track" role="progressbar" aria-label="攒鱼进度" aria-valuemin="0">
              <span class="reward-fill"></span><span class="reward-sparks" aria-hidden="true"></span>
            </div>
          </div>
          <div class="fish-drop-hint" hidden aria-hidden="true">拖鱼喂猫</div>
        </div>
      </div>
    </div>
    <div class="reward-anger" role="meter" aria-label="罢工" aria-valuemin="0" aria-valuemax="100" hidden>
      <span class="reward-anger-glyph" aria-hidden="true">罢工</span><span class="reward-anger-count"></span>
    </div>
    <div class="fish-ghost" hidden aria-hidden="true">${fishIcon}</div>
    <span class="reward-announcement" role="status"></span>`;
  const drawer = hud.querySelector('.reward-drawer');
  const bank = hud.querySelector('.fish-bank');
  const count = hud.querySelector('.fish-count');
  const progressLabel = hud.querySelector('.reward-progress-label');
  const progress = hud.querySelector('.reward-track');
  const anger = hud.querySelector('.reward-anger');
  const angerGlyph = hud.querySelector('.reward-anger-glyph');
  const angerCount = hud.querySelector('.reward-anger-count');
  const sparks = hud.querySelector('.reward-sparks');
  const hint = hud.querySelector('.fish-drop-hint');
  const ghost = hud.querySelector('.fish-ghost');
  const announcement = hud.querySelector('.reward-announcement');
  const treatIcons = [...hud.querySelectorAll('.fish-icon')];
  treatIcons.forEach(canvas => drawTreatIcon(canvas, isDog));
  progress.setAttribute('aria-valuemax', keysPerFish);
  stage.append(hud);

  let drag = null;
  let hovered = false;
  let bankFocused = false;
  let suppressed = false;
  let closeTimer;
  let saveTimer;
  let fullTimer;
  const keyTimes = [];

  function angerGain(time) {
    const elapsed = time - (keyTimes.at(-1) ?? -Infinity);
    while (keyTimes.length && time - keyTimes[0] > paceWindow) keyTimes.shift();
    keyTimes.push(time);
    if (keyTimes.length > 30) keyTimes.shift();
    const keysPerSecond = (keyTimes.length - 1) / paceWindow;
    const speed = Math.max(0, Math.min(1, (keysPerSecond - 3) / 8));
    const intensity = speed * speed * (3 - 2 * speed);
    return Math.max(0, Math.min(.035 + .105 * intensity, maxAngerPerSecond * elapsed));
  }

  function save() {
    if (saveTimer === undefined) return;
    clearTimeout(saveTimer);
    saveTimer = undefined;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Keep the current session playable if storage is unavailable.
    }
  }

  function saveSoon() {
    saveTimer ??= setTimeout(save, 220);
  }

  function render() {
    const value = fullTimer === undefined ? state.progress : keysPerFish;
    const striking = state.anger >= maxAnger;
    const treatName = isDog ? '骨头' : '鱼';
    const treatUnit = isDog ? '根' : '条';
    const petName = isDog ? '狗狗' : '猫咪';
    count.textContent = state.fish.toLocaleString();
    progressLabel.textContent = isDog ? '攒骨头' : '攒鱼';
    hint.textContent = isDog ? '拖骨头喂狗' : '拖鱼喂猫';
    bank.title = !state.fish
      ? `打字攒${treatName}`
      : state.anger
        ? `拖一${treatUnit}${treatName}喂${isDog ? '狗' : '猫'}，或按回车喂食`
        : `${petName}现在心情很好`;
    bank.setAttribute('aria-label', `${treatName}库存 ${state.fish} ${treatUnit}，${bank.title}`);
    bank.setAttribute('aria-disabled', String(!state.fish || !state.anger));
    hint.hidden = !striking || !state.fish;
    progress.setAttribute('aria-label', `攒${treatName}进度`);
    progress.setAttribute('aria-valuenow', value);
    progress.style.setProperty('--reward-amount', value / keysPerFish);
    const percent = Math.floor(state.anger);
    const strikeText = isDog ? '想啃骨头' : '想吃鱼';
    anger.hidden = state.anger < showAngerAt;
    anger.dataset.striking = String(striking);
    angerGlyph.textContent = striking ? '罢工' : '怒';
    angerCount.textContent = striking ? strikeText : `${percent}%`;
    anger.setAttribute('aria-label', striking ? '罢工' : '怒气');
    anger.setAttribute('aria-valuenow', percent);
    anger.setAttribute('aria-valuetext', striking ? strikeText : `${percent}%`);
  }

  function updateDrawer() {
    if (enabled && !suppressed && (hovered || bankFocused || drag)) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
      drawer.dataset.open = 'true';
    } else if (drawer.dataset.open === 'true' && closeTimer === undefined) {
      closeTimer = setTimeout(() => {
        closeTimer = undefined;
        drawer.dataset.open = 'false';
      }, 230);
    }
  }

  function checkHover(event) {
    if (!enabled || suppressed || event.pointerType === 'touch') return;
    const { clientX: x, clientY: y } = event;
    hovered = canFeedAt(x, y);
    if (!hovered && drawer.dataset.open === 'true') {
      const { left, right, top, bottom } = drawer.getBoundingClientRect();
      hovered = x >= left && x <= right && y >= top && y <= bottom + 18;
    }
    updateDrawer();
  }

  function burst(fraction, full) {
    if (reduceMotion.matches || drawer.dataset.open !== 'true') return;
    for (let i = 0; i < (full ? 11 : 2); i++) {
      if (sparks.childElementCount >= 32) sparks.firstElementChild.remove();
      const spark = document.createElement('i');
      spark.style.left = `${fraction * 100}%`;
      spark.style.backgroundColor = ['#f4d89d', '#fff5d8', '#d7a85f'][i % 3];
      if (full) spark.style.setProperty('--spark-size', '3px');
      sparks.append(spark);
      const angle = (Math.random() * 1.24 - 1.12) * Math.PI;
      const distance = (full ? 16 : 6) + Math.random() * (full ? 24 : 9);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const motion = spark.animate([
        { transform: 'translate(-50%, -50%) scale(.85)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(.15)`, opacity: 0 },
      ], { duration: full ? 560 : 360, easing: 'cubic-bezier(.14,.68,.46,1)' });
      motion.finished.then(() => spark.remove(), () => spark.remove());
    }
  }

  function feed() {
    if (!enabled || !state.fish || !state.anger) return;
    state.fish--;
    state.anger = Math.max(0, state.anger - angerPerFish);
    keyTimes.length = 0;
    saveSoon();
    render();
    announcement.textContent = isDog
      ? `喂了一根骨头，怒气降到 ${Math.floor(state.anger)}%。`
      : `喂了一条鱼，怒气降到 ${Math.floor(state.anger)}%。`;
    onFeed();
  }

  function cancelDrag() {
    if (!drag) return;
    const { id } = drag;
    drag = null;
    ghost.hidden = true;
    if (bank.hasPointerCapture(id)) bank.releasePointerCapture(id);
    updateDrawer();
  }

  stage.addEventListener('pointerenter', checkHover, events);
  stage.addEventListener('pointermove', checkHover, { ...events, capture: true });
  stage.addEventListener('pointerleave', () => {
    hovered = false;
    updateDrawer();
  }, events);
  bank.addEventListener('focus', () => {
    bankFocused = true;
    updateDrawer();
  }, events);
  bank.addEventListener('blur', () => {
    bankFocused = false;
    updateDrawer();
  }, events);
  bank.addEventListener('pointerdown', event => {
    event.stopPropagation();
    if (event.button !== 0) return;
    event.preventDefault();
    if (!enabled || drag || !state.fish || !state.anger) return;
    bank.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    updateDrawer();
  }, events);
  bank.addEventListener('pointermove', event => {
    event.stopPropagation();
    if (drag?.id !== event.pointerId) return;
    if (ghost.hidden && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 4) return;
    const { left, top } = hud.getBoundingClientRect();
    ghost.hidden = false;
    ghost.style.left = `${event.clientX - left}px`;
    ghost.style.top = `${event.clientY - top}px`;
    ghost.dataset.target = canFeedAt(event.clientX, event.clientY);
  }, events);
  bank.addEventListener('pointerup', event => {
    if (drag?.id !== event.pointerId) return;
    event.stopPropagation();
    const accepted = !ghost.hidden && canFeedAt(event.clientX, event.clientY);
    cancelDrag();
    if (accepted) feed();
  }, events);
  bank.addEventListener('lostpointercapture', cancelDrag, events);
  bank.addEventListener('pointercancel', cancelDrag, events);
  bank.addEventListener('click', event => {
    if (event.detail === 0) feed();
  }, events);
  window.addEventListener('blur', () => {
    hovered = false;
    bankFocused = false;
    cancelDrag();
    updateDrawer();
  }, events);
  window.addEventListener('pagehide', save, events);

  render();
  return {
    get enabled() { return enabled; },
    get anger() { return enabled ? state.anger : 0; },
    get striking() { return enabled && state.anger >= maxAnger; },
    get dragging() { return drag !== null; },
    setEnabled(active) {
      if (enabled === active) return;
      enabled = active;
      hud.hidden = !enabled || suppressed;
      if (!enabled) {
        hovered = false;
        bankFocused = false;
        cancelDrag();
        clearTimeout(closeTimer);
        closeTimer = undefined;
        drawer.dataset.open = 'false';
        keyTimes.length = 0;
        clearTimeout(fullTimer);
        fullTimer = undefined;
        save();
      }
      render();
    },
    setPetMode(dog) {
      const next = Boolean(dog);
      if (isDog === next) return;
      isDog = next;
      treatIcons.forEach(canvas => drawTreatIcon(canvas, isDog));
      render();
    },
    setSuppressed(active) {
      const next = Boolean(active);
      if (suppressed === next) return;
      suppressed = next;
      hud.hidden = !enabled || suppressed;
      if (suppressed) {
        hovered = false;
        bankFocused = false;
        cancelDrag();
        clearTimeout(closeTimer);
        closeTimer = undefined;
        drawer.dataset.open = 'false';
      }
    },
    positionAnger(x, y) {
      anger.style.left = `${x}px`;
      anger.style.top = `${y}px`;
    },
    positionDrawer(x, y) {
      drawer.style.left = `${x}px`;
      drawer.style.top = `${y}px`;
    },
    coolDown(seconds) {
      if (!enabled || state.anger <= 0 || seconds <= 0) return false;
      const wasStriking = state.anger >= maxAnger;
      const prevPercent = Math.floor(state.anger);
      const wasVisible = state.anger >= showAngerAt;
      state.anger = Math.max(0, state.anger - 4.5 * seconds);
      const calmDown = wasStriking && state.anger < maxAnger;
      if (calmDown || Math.floor(state.anger) !== prevPercent || (wasVisible && state.anger < showAngerAt)) {
        render();
        saveSoon();
      }
      return calmDown;
    },
    recordKey(time) {
      if (!enabled) return;
      state.progress++;
      const full = state.progress === keysPerFish;
      const wasStriking = state.anger >= maxAnger;
      state.anger = Math.min(maxAnger, state.anger + angerGain(time));
      const startedStrike = !wasStriking && state.anger >= maxAnger;
      if (full) {
        state.progress = 0;
        state.fish = Math.min(Number.MAX_SAFE_INTEGER, state.fish + 1);
        clearTimeout(fullTimer);
        fullTimer = setTimeout(() => {
          fullTimer = undefined;
          render();
        }, 210);
        if (!reduceMotion.matches) {
          bank.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 390);
        }
      }
      if (startedStrike) {
        announcement.textContent = isDog
          ? '狗狗罢工了，喂一根骨头可以让它消气。'
          : '猫咪罢工了，喂一条鱼可以让它消气。';
      } else if (full) {
        announcement.textContent = isDog
          ? `收获一根骨头，库存 ${state.fish} 根。`
          : `收获一条鱼，库存 ${state.fish} 条。`;
      }
      render();
      if (full || fullTimer === undefined) burst(full ? 1 : state.progress / keysPerFish, full);
      saveSoon();
    },
    dispose() {
      cancelDrag();
      controller.abort();
      clearTimeout(closeTimer);
      clearTimeout(fullTimer);
      save();
      hud.remove();
    },
  };
}

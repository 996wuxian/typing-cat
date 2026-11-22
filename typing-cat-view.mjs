import {
  ACESFilmicToneMapping, BoxGeometry, BufferGeometry, CanvasTexture, Color,
  CylinderGeometry, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera,
  PlaneGeometry, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { loadSeatedCat } from './seated-cat.mjs';
import { createTypingPaws } from './typing-paws.mjs';
import { keyIconElement, keyIcons, paintKeyIcon } from './typing-key-icons.mjs';
import { createMeowPlayer } from './cat-meow.mjs';

function letters(value) {
  return Array.from(value, name => [`Key${name}`, name]);
}

const rows = [
  [['Backquote', '`'], ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => [`Digit${n}`, n]),
    ['Minus', '−'], ['Equal', '='], ['Backspace', '⌫', 1.5]],
  [['Tab', 'Tab', 1.35], ...letters('QWERTYUIOP'), ['BracketLeft', '['], ['BracketRight', ']']],
  [['CapsLock', 'Caps', 1.5], ...letters('ASDFGHJKL'), ['Semicolon', ';'], ['Quote', "'"], ['Enter', '↵', 1.75]],
  [['ShiftLeft', 'Shift', 1.75], ...letters('ZXCVBNM'), ['Comma', ','], ['Period', '.'], ['Slash', '/'], ['ShiftRight', 'Shift', 2.5]],
  [['ControlLeft', 'Ctrl', 1.35], ['AltLeft', 'Alt', 1.4], ['Space', '', 6],
    ['AltRight', 'Alt', 1.4], ['ArrowLeft', '←'], ['ArrowUp', '↑'], ['ArrowDown', '↓'], ['ArrowRight', '→']],
];

const clock = () => performance.now() / 1000;
const capHeight = .018;
const capTravel = .008;
const capY = .064;
const keyboardX = .014;
const mouseHomeX = .320;
const mouseHomeZ = .264;
const mouseButtonTravel = .005;
const keyFloatHeights = [-14, -7, 0, 7, 14];

function makeLabel(text, width, color, code) {
  const canvas = document.createElement('canvas');
  const long = String(text).length > 1;
  canvas.width = 192;
  canvas.height = 92;
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${long ? 42 : 53}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  if (keyIcons[code]) {
    ctx.strokeStyle = color;
    paintKeyIcon(ctx, code, 96, 46, 70);
  } else {
    ctx.fillText(String(text), 96, 46, 176);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const label = new Mesh(new PlaneGeometry(width * .85, .020),
    new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
  label.rotation.set(-Math.PI / 2, 0, Math.PI);
  label.position.y = capHeight / 2 + .0012;
  return label;
}

function createKeyboard() {
  const board = new Group();
  const keys = new Map();
  const shapes = new Map();
  const keyColors = [
    ['#eef0f2', '#252b33'],
    ['#d8dce0', '#252b33'],
    ['#aeb4bc', '#252b33'],
    ['#646c78', '#f1f3f5'],
    ['#373d47', '#f1f3f5'],
  ];
  const plate = new Mesh(new RoundedBoxGeometry(.53, .054, .163, 2, .014),
    new MeshStandardMaterial({ color: '#24272d', roughness: .52 }));
  plate.position.set(keyboardX, .027, .353);
  const insert = new Mesh(new RoundedBoxGeometry(.514, .009, .148, 2, .004),
    new MeshStandardMaterial({ color: '#17191e', roughness: .63 }));
  insert.position.set(keyboardX, .054, .353);
  board.add(plate, insert);

  const unit = .036;
  rows.forEach((row, rowIndex) => {
    const total = row.reduce((sum, [, , size = 1]) => sum + size, 0);
    // The layout and legends both face the cat.
    let column = keyboardX + total * unit / 2;
    const z = .301 + (rows.length - 1 - rowIndex) * .026;
    for (const [code, label, size = 1] of row) {
      const width = unit * size - .0024;
      if (!shapes.has(size)) {
        shapes.set(size, new RoundedBoxGeometry(width, capHeight, .024, 2, .0038));
      }
      const [keyColor, labelColor] = keyColors[rowIndex];
      const tint = new Color(keyColor);
      const cap = new Mesh(shapes.get(size), new MeshStandardMaterial({ color: tint, roughness: .59 }));
      cap.position.set(column - size * unit / 2, capY, z);
      if (label !== '') cap.add(makeLabel(label, width, labelColor, code));
      cap.userData.keyCode = code;
      keys.set(code, { cap, label: code === 'Space' ? '空格' : label, tint, started: -Infinity, releaseAt: -Infinity });
      board.add(cap);
      column -= size * unit;
    }
  });
  return { board, keys };
}

// Cross-sections from palm end to nose, given as z, half width, side height and crown height.
const mouseProfile = [
  [-.059, .001, .010, .011],
  [-.055, .017, .014, .026],
  [-.042, .031, .018, .045],
  [-.022, .038, .021, .059],
  [-.004, .039, .020, .059],
  [ .017, .034, .018, .051],
  [ .038, .031, .016, .039],
  [ .053, .025, .013, .031],
  [ .060, .013, .010, .023],
  [ .063, .001, .008, .010],
];

function mouseSection(z) {
  const index = mouseProfile.findIndex(([position], i) => i > 0 && z <= position);
  const i = index === -1 ? mouseProfile.length - 1 : index;
  const a = mouseProfile[i - 1];
  const b = mouseProfile[i];
  const previous = mouseProfile[Math.max(0, i - 2)];
  const next = mouseProfile[Math.min(mouseProfile.length - 1, i + 1)];
  const length = b[0] - a[0];
  const t = MathUtils.clamp((z - a[0]) / length, 0, 1);
  const t2 = t * t;
  const t3 = t2 * t;
  return [1, 2, 3].map(column => {
    const m0 = length * (b[column] - previous[column]) / (b[0] - previous[0]);
    const m1 = length * (next[column] - a[column]) / (next[0] - a[0]);
    return (2 * t3 - 3 * t2 + 1) * a[column] + (t3 - 2 * t2 + t) * m0 +
      (-2 * t3 + 3 * t2) * b[column] + (t3 - t2) * m1;
  });
}

function mouseSurfaceGeometry(start, end, columns, sample) {
  const rows = 48;
  const vertices = [];
  const indices = [];
  const stride = columns + 1;
  for (let row = 0; row <= rows; row++) {
    const z = MathUtils.lerp(start, end, row / rows);
    const section = mouseSection(z);
    for (let column = 0; column <= columns; column++) {
      const [x, y] = sample(column / columns, z, section);
      vertices.push(x, y, z);
      if (row === rows || column === columns) continue;
      const a = row * stride + column;
      indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function mouseCrown(x, [halfWidth, sideY, centerY]) {
  const across = MathUtils.clamp(Math.abs(x) / halfWidth, 0, 1);
  return sideY + (centerY - sideY) * Math.sqrt(1 - across ** 2.25);
}

function createMouse() {
  const body = new Group();
  const rear = mouseProfile[0][0];
  const nose = mouseProfile.at(-1)[0];
  const seam = -.003;
  const ivory = new MeshStandardMaterial({ color: '#e2e4e8', roughness: .48 });
  const trim = new MeshStandardMaterial({ color: '#525862', roughness: .69 });
  const recess = new MeshStandardMaterial({ color: '#5c636d', roughness: .74 });

  function cover(from, to, material, inset = 0, widthScale = 1) {
    const geometry = mouseSurfaceGeometry(from, to, 20, (u, z, section) => {
      const x = (u * 2 - 1) * section[0] * widthScale;
      return [x, mouseCrown(x, section) - inset];
    });
    body.add(new Mesh(geometry, material));
  }
  cover(rear, seam, ivory);
  cover(seam, nose, recess, .0065, .95);

  for (const side of [-1, 1]) {
    const skirt = mouseSurfaceGeometry(rear, nose, 3, (u, z, [width, height]) => {
      const fraction = side > 0 ? 1 - u : u;
      return [side * width * MathUtils.lerp(.96, 1, fraction), MathUtils.lerp(.005, height, fraction)];
    });
    const edge = mouseSurfaceGeometry(rear, nose, 2, (u, z, [width]) => {
      const fraction = side > 0 ? 1 - u : u;
      return [side * width * MathUtils.lerp(.92, .968, fraction), MathUtils.lerp(.001, .006, fraction)];
    });
    body.add(new Mesh(skirt, ivory), new Mesh(edge, trim));
  }

  const buttons = new Map();
  for (const [side, sign] of [['left', -1], ['right', 1]]) {
    const tint = new Color('#e2e4e8');
    const panel = mouseSurfaceGeometry(seam + .0014, nose, 14, (u, z, section) => {
      const width = section[0];
      const wheelSlot = MathUtils.smoothstep(z, .005, .013) *
        (1 - MathUtils.smoothstep(z, .030, .039));
      const inner = Math.min(width * .65, .0008 + .0057 * wheelSlot);
      const x = sign * MathUtils.lerp(inner, width, sign < 0 ? 1 - u : u);
      return [x, mouseCrown(x, section)];
    });
    const mesh = new Mesh(panel, new MeshStandardMaterial({ color: tint, roughness: .48 }));
    mesh.userData.mouseButton = side;
    buttons.set(side, { mesh, tint, started: -Infinity, releaseAt: -Infinity });
    body.add(mesh);
  }

  const wheel = new Group();
  const rubber = new MeshStandardMaterial({ color: '#343740', roughness: .9 });
  const ribs = new MeshStandardMaterial({ color: '#585d68', roughness: .92 });
  const roller = new Mesh(new CylinderGeometry(.009, .009, .010, 24), rubber);
  roller.rotation.z = Math.PI / 2;
  wheel.add(roller);
  const tread = new BoxGeometry(.010, .0011, .0014);
  for (let i = 0; i < 16; i++) {
    const angle = i * Math.PI / 8;
    const rib = new Mesh(tread, ribs);
    rib.position.set(0, .009 * Math.cos(angle), .009 * Math.sin(angle));
    rib.rotation.x = angle;
    wheel.add(rib);
  }
  wheel.position.set(0, .048, .021);
  body.add(wheel);
  body.scale.y = 1.42;
  body.position.set(mouseHomeX, 0, mouseHomeZ);
  return { body, buttons };
}

function makeShadow(width, depth, x, z, opacity) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 63);
  gradient.addColorStop(0, `rgba(28,31,38,${opacity})`);
  gradient.addColorStop(1, 'rgba(28,31,38,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const shadow = new Mesh(new PlaneGeometry(width, depth),
    new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(x, -.002, z);
  return shadow;
}

async function loadModel(stage, assetUrl) {
  if (assetUrl) return loadSeatedCat(assetUrl);
  const packed = stage.parentNode.querySelector('#model-data');
  const bytes = Uint8Array.from(atob(packed.textContent.trim()), char => char.charCodeAt(0));
  packed.remove();
  const url = URL.createObjectURL(new Blob([bytes], { type: 'model/gltf-binary' }));
  try {
    return await loadSeatedCat(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function mountTypingCat(stage, { assetUrl, signal, onStatus } = {}) {
  const status = stage.querySelector('#status');
  const floatingLayer = stage.querySelector('#floating');
  const events = { signal };
  const renderer = new WebGLRenderer({
    canvas: stage.querySelector('#scene'), antialias: true, alpha: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, .03, 20);
  const keyLight = new DirectionalLight('#ffeddb', 3);
  keyLight.position.set(1.3, 3, 3.8);
  const rimLight = new DirectionalLight('#e4eaff', 1.65);
  rimLight.position.set(-2.6, 1.7, -2);
  scene.add(keyLight, rimLight, new HemisphereLight('#fff9f0', '#9a9fa9', 2.05));
  const disposeScene = () => {
    scene.traverse(object => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) {
          if (value?.isTexture) value.dispose();
        }
        material.dispose();
      }
    });
  };
  const resizeObserver = new ResizeObserver(sizeToStage);
  const cleanup = () => {
    resizeObserver.disconnect();
    renderer.setAnimationLoop(null);
    disposeScene();
    renderer.dispose();
    floatingLayer.replaceChildren();
  };
  signal?.addEventListener('abort', cleanup, { once: true });
  let cat;
  try {
    cat = await loadModel(stage, assetUrl);
  } catch (error) {
    if (!signal?.aborted) cleanup();
    throw error;
  }
  if (signal?.aborted) {
    scene.add(cat.model);
    disposeScene();
    return;
  }
  const paws = createTypingPaws(cat.model);
  const { board, keys } = createKeyboard();
  const mouse = createMouse();
  const mouseShadow = makeShadow(.16, .17, mouseHomeX, mouseHomeZ, .28);
  scene.add(makeShadow(.67, .67, 0, -.05, .42), makeShadow(.68, .25, keyboardX, .36, .30),
    mouseShadow, cat.model, board, mouse.body);

  let viewWidth = 0;
  let viewHeight = 0;
  function sizeToStage() {
    const { clientWidth: width, clientHeight: height } = stage;
    if (width === viewWidth && height === viewHeight) return;
    viewWidth = width;
    viewHeight = height;
    camera.aspect = width / Math.max(1, height);
    const distance = Math.max(1.12, .83 / camera.aspect);
    camera.position.set(.045, .423 + 1.12 * distance, .13 + 2.20 * distance);
    camera.lookAt(.045, .423, .13);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resizeObserver.observe(stage);
  sizeToStage();

  const pointer = new Vector2();
  const desktopPointer = new Vector2();
  let hasDesktopPointer = false;
  const mouseOffset = new Vector2();
  const raycast = new Raycaster();
  const hitTargets = [...keys.values()].map(key => key.cap)
    .concat([...mouse.buttons.values()].map(button => button.mesh));
  const activeColor = new Color('#a4b1cc');
  const floaters = [];
  const keyRow = document.createElement('div');
  keyRow.className = 'key-row';
  floatingLayer.append(keyRow);
  let lastKeyRowWidth = 0;
  const projected = new Vector3();
  const head = cat.model.getObjectByName('Head');
  const headCenter = new Vector3();
  const headEdge = new Vector3();
  const meow = createMeowPlayer(signal);
  const petEffects = [];
  const angerMark = document.createElement('div');
  angerMark.className = 'anger-mark';
  angerMark.textContent = '💢';
  floatingLayer.append(angerMark);
  const silenceMark = document.createElement('div');
  silenceMark.className = 'typing-silence';
  silenceMark.textContent = '…';
  const tears = [-.070, .094].map(x => {
    const stream = document.createElement('div');
    stream.className = 'typing-tear';
    return { stream, x };
  });
  floatingLayer.append(silenceMark, ...tears.map(tear => tear.stream));
  const recentKeys = [];
  let tenseUntil = -Infinity;
  let tension = 0;
  let streak = { kind: null, count: 0, last: -Infinity };
  let typingMood = null;
  let moodStarted = -Infinity;
  let moodUntil = -Infinity;
  let moodBlend = 0;
  let pet = null;
  let petBlend = 0;
  let lastInput = -Infinity;
  let lastMouseMove = -Infinity;
  let nextSpaceSide = 'left';
  const heldKeys = new Map();
  const activeHeldKey = { left: null, right: null };
  const mousePresses = new Map();

  function mouseInUse(time) {
    return mousePresses.size > 0 || (!pet && time - lastMouseMove < .24);
  }

  function reserveMousePaw(time) {
    if (!activeHeldKey.right) return;
    for (const held of heldKeys.values()) {
      if (held.side === 'right') held.side = 'left';
    }
    const next = [...heldKeys.values()].at(-1);
    activeHeldKey.right = null;
    activeHeldKey.left = next.code;
    paws.release('right', time);
    paws.tap(next.point, time, 'left', true);
  }

  function trimKeyRow() {
    while (floaters.length > 1 && keyRow.clientWidth > 0 && keyRow.scrollWidth > keyRow.clientWidth) {
      floaters.shift().chip.remove();
    }
  }

  function showKey(label, time, code) {
    const chip = document.createElement('span');
    chip.className = 'key-chip';
    if (code === 'Space') chip.classList.add('key-chip-space');
    if (keyIcons[code]) chip.append(keyIconElement(code));
    else chip.textContent = label;
    const previousHeight = floaters.at(-1)?.heightIndex ?? -1;
    let heightIndex = Math.floor(Math.random() * (keyFloatHeights.length - (previousHeight < 0 ? 0 : 1)));
    if (previousHeight >= 0 && heightIndex >= previousHeight) heightIndex++;
    const tilt = (Math.random() - .5) * 7;
    keyRow.append(chip);
    floaters.push({ chip, time, heightIndex, tilt });
    if (floaters.length > 16) floaters.shift().chip.remove();
    trimKeyRow();
  }

  function recordStreak(code, time) {
    const kind = code === 'Period' ? 'speechless' : code === 'Backspace' ? 'crying' : null;
    const count = kind && kind === streak.kind && time - streak.last <= .95 ? streak.count + 1 : 1;
    streak = { kind, count, last: time };
    if (!kind || count < 3) return;
    if (typingMood !== kind || time >= moodUntil) moodStarted = time;
    typingMood = kind;
    moodUntil = time + 1.65;
    tenseUntil = -Infinity;
  }

  function pressKey(code, time, source = null) {
    const keyCode = code === 'Delete' ? 'Backspace' : code;
    const key = keys.get(keyCode);
    if (!key) return false;
    if (heldKeys.has(code)) return true;
    key.started = time;
    key.releaseAt = source ? Infinity : time + .182;
    const { x, z } = key.cap.position;
    const point = new Vector3(x, capY + capHeight * .5 - capTravel, z);
    let side = x < .018 ? 'left' : 'right';
    const usingMouse = mouseInUse(time);
    if (code === 'Space') {
      side = usingMouse ? 'left' : nextSpaceSide;
      point.x = x + (side === 'left' ? -.066 : .066);
      if (!usingMouse) nextSpaceSide = side === 'left' ? 'right' : 'left';
    }
    if (usingMouse) {
      reserveMousePaw(time);
      side = 'left';
    }
    if (source) {
      heldKeys.set(code, { code, keyCode, point, side, source });
      activeHeldKey[side] = code;
    }
    if (source || !activeHeldKey[side]) paws.tap(point, time, side, Boolean(source));
    cat.setPointer(point.x * 1.6, -.56);
    showKey(key.label, time, keyCode);
    recordStreak(keyCode, time);
    if (source) {
      recentKeys.push(time);
      while (recentKeys.length && time - recentKeys[0] > .72) recentKeys.shift();
      if (recentKeys.length >= 6 && time >= moodUntil) tenseUntil = time + .95;
    }
    lastInput = time;
    return true;
  }

  function releaseKey(code, time) {
    const held = heldKeys.get(code);
    if (!held) return;
    heldKeys.delete(code);
    if (![...heldKeys.values()].some(other => other.keyCode === held.keyCode)) {
      const key = keys.get(held.keyCode);
      key.releaseAt = Math.max(time, key.started + .145);
    }
    if (activeHeldKey[held.side] !== code) return;
    const next = [...heldKeys.values()].findLast(other => other.side === held.side);
    activeHeldKey[held.side] = next?.code ?? null;
    if (next) paws.tap(next.point, time, next.side, true);
    else paws.release(held.side, time);
  }

  function releaseSource(source) {
    const time = clock();
    for (const held of heldKeys.values()) {
      if (held.source === source) releaseKey(held.code, time);
    }
  }

  function mouseSurface(side) {
    const x = side === 'left' ? -.012 : side === 'right' ? .012 : 0;
    const z = side ? .014 : .004;
    const buttonY = mouse.buttons.get(side)?.mesh.position.y ?? 0;
    const height = (mouseCrown(x, mouseSection(z)) + buttonY) * mouse.body.scale.y;
    return new Vector3(mouse.body.position.x + x, height + .001, mouse.body.position.z + z);
  }

  function pressMouse(side, token) {
    const button = mouse.buttons.get(side);
    if (!button || mousePresses.has(token)) return;
    mousePresses.set(token, side);
    if (button.releaseAt === Infinity) return;
    const time = clock();
    button.started = lastInput = lastMouseMove = time;
    button.releaseAt = Infinity;
    reserveMousePaw(time);
    showKey(side === 'left' ? '左键' : '右键', time);
  }

  function releaseMouse(token) {
    const side = mousePresses.get(token);
    if (!side) return;
    mousePresses.delete(token);
    if ([...mousePresses.values()].includes(side)) return;
    const button = mouse.buttons.get(side);
    lastInput = lastMouseMove = clock();
    button.releaseAt = Math.max(lastInput, button.started + .12);
  }

  function releaseWindowMouse() {
    releaseMouse('window:0');
    releaseMouse('window:2');
  }

  window.addEventListener('keydown', event => {
    if (event.defaultPrevented ||
        (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, [contenteditable]'))) return;
    if ((event.ctrlKey && event.code !== 'ControlLeft') ||
        (event.altKey && !event.code.startsWith('Alt')) || event.metaKey) return;
    if (event.repeat && !heldKeys.has(event.code)) return;
    if (pressKey(event.code, clock(), 'foreground')) event.preventDefault();
  }, events);
  window.addEventListener('keyup', event => releaseKey(event.code, clock()), events);
  window.addEventListener('blur', () => {
    releaseSource('foreground');
    releaseWindowMouse();
    stopPetting();
  }, events);
  window.addEventListener('pointerup', event => {
    releaseMouse(`window:${event.button}`);
    if (pet?.id === event.pointerId) stopPetting();
  }, events);
  window.addEventListener('pointercancel', event => {
    releaseWindowMouse();
    if (pet?.id === event.pointerId) stopPetting();
  }, events);

  function readPointer(event) {
    const box = stage.getBoundingClientRect();
    pointer.set(2 * (event.clientX - box.left) / box.width - 1,
      1 - 2 * (event.clientY - box.top) / box.height);
  }

  function followPointer(x, y) {
    if (pet) return;
    cat.setPointer(x, y);
    lastInput = lastMouseMove = clock();
    mouseOffset.set(.012 * MathUtils.clamp(x, -1, 1),
      -.023 * MathUtils.clamp(y, -1, 1));
  }

  function overHead() {
    camera.updateMatrixWorld();
    head.localToWorld(headCenter.set(.015, .13, .133)).project(camera);
    head.localToWorld(headEdge.set(.174, .13, .133)).project(camera);
    const radiusX = Math.abs(headEdge.x - headCenter.x);
    head.localToWorld(headEdge.set(.015, .255, .133)).project(camera);
    const radiusY = Math.abs(headEdge.y - headCenter.y);
    return Math.hypot((pointer.x - headCenter.x) / radiusX, (pointer.y - headCenter.y) / radiusY) <= 1;
  }

  function stopPetting() {
    if (!pet) return;
    const id = pet.id;
    pet = null;
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    delete stage.dataset.petting;
    lastInput = clock();
  }

  function showPetEffect(time, isHeart) {
    const effect = document.createElement('div');
    effect.className = isHeart ? 'pet-effect pet-heart' : 'pet-effect pet-meow';
    effect.textContent = isHeart ? '♥' : '喵';
    floatingLayer.append(effect);
    petEffects.push({ effect, time, isHeart, lifetime: isHeart ? 1.15 : 1.05 });
  }

  function animateReaction(time, seconds) {
    const petting = Boolean(pet);
    const moodActive = !petting && time < moodUntil;
    moodBlend = MathUtils.damp(moodBlend, moodActive ? 1 : 0, moodActive ? 12 : 7, seconds);
    tension = MathUtils.damp(tension, !petting && !moodActive && time < tenseUntil ? 1 : 0, 9, seconds);
    petBlend = MathUtils.damp(petBlend, petting ? 1 : 0, 7, seconds);
    if (petting) {
      const elapsed = time - pet.started;
      if (time >= pet.nextHeart) {
        showPetEffect(time, true);
        pet.nextHeart = time + .92;
      }
      if (time >= pet.nextMeow) {
        const duration = meow.play();
        if (duration) showPetEffect(time, false);
        pet.nextMeow = time + (duration ? Math.max(2.35, duration + .55) : .16);
      }
      const phase = Math.floor(elapsed / 1.28) % 3;
      const sway = Math.sin(elapsed * 4.8 + pet.offsetX * 1.8);
      const swipe = MathUtils.clamp(pet.offsetX * 1.5, -.65, .65);
      const tilt = phase === 0 ? .15 * sway : phase === 1 ? .09 * swipe : -.20 - .07 * sway;
      const nod = phase === 1 ? .20 + .12 * sway : .08 + .045 * sway;
      cat.setPointer(0, 0);
      cat.setReaction({
        squint: petBlend,
        blush: .92 * petBlend,
        mouth: meow.mouthAmount(),
        yaw: (.15 * swipe + (phase === 0 ? .15 * sway : 0)) * petBlend,
        pitch: (nod - pet.offsetY * .10) * petBlend,
        roll: tilt * petBlend,
      });
      return;
    }
    if (moodBlend > .01) {
      const crying = typingMood === 'crying';
      const sobbing = Math.sin((time - moodStarted) * 12);
      cat.setReaction({
        squint: (crying ? .79 : .54) * moodBlend,
        yaw: (crying ? .03 * sobbing : -.08) * moodBlend,
        pitch: (crying ? .16 + .06 * sobbing : -.055) * moodBlend,
        roll: (crying ? -.06 + .025 * sobbing : -.107) * moodBlend,
      });
      return;
    }
    cat.setReaction({
      tension,
      squint: petBlend,
      blush: .92 * petBlend,
      mouth: meow.mouthAmount(),
      yaw: .055 * Math.sin(time * 22) * tension,
      pitch: .075 * tension,
      roll: .037 * Math.sin(time * 17) * tension,
    });
  }

  stage.addEventListener('pointermove', event => {
    if (pet?.id === event.pointerId) {
      readPointer(event);
      pet.offsetX = MathUtils.clamp(pointer.x - pet.startX, -1, 1);
      pet.offsetY = MathUtils.clamp(pointer.y - pet.startY, -1, 1);
      lastInput = clock();
      return;
    }
    if (hasDesktopPointer) return;
    readPointer(event);
    followPointer(pointer.x, pointer.y);
  }, events);
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.button !== 2) return;
    readPointer(event);
    if (event.button === 0 && !pet && overHead()) {
      const time = clock();
      pet = {
        id: event.pointerId, started: time, startX: pointer.x, startY: pointer.y, offsetX: 0, offsetY: 0,
        nextHeart: time + .32, nextMeow: time + .48,
      };
      meow.unlock();
      stage.setPointerCapture(event.pointerId);
      stage.dataset.petting = 'true';
      lastInput = time;
      tenseUntil = -Infinity;
      moodUntil = -Infinity;
      streak = { kind: null, count: 0, last: -Infinity };
      return;
    }
    if (!hasDesktopPointer) cat.setPointer(pointer.x, pointer.y);
    const time = clock();
    if (event.button === 2) {
      pressMouse('right', 'window:2');
      return;
    }
    raycast.setFromCamera(pointer, camera);
    const hit = raycast.intersectObjects(hitTargets, false)[0]?.object.userData;
    if (hit?.keyCode && pressKey(hit.keyCode, time)) return;
    pressMouse(hit?.mouseButton ?? 'left', 'window:0');
  }, events);
  stage.addEventListener('contextmenu', event => event.preventDefault(), events);
  stage.addEventListener('lostpointercapture', event => {
    if (pet?.id === event.pointerId) stopPetting();
  }, events);
  stage.addEventListener('pointerleave', () => {
    if (hasDesktopPointer) return;
    cat.setPointer(0, 0);
    mouseOffset.set(0, 0);
  }, events);

  function renderFrame(time, seconds) {
    const settle = 1 - Math.exp(-17 * seconds);
    mouse.body.position.x = MathUtils.lerp(mouse.body.position.x, mouseHomeX + mouseOffset.x, settle);
    mouse.body.position.z = MathUtils.lerp(mouse.body.position.z, mouseHomeZ + mouseOffset.y, settle);
    mouseShadow.position.x = mouse.body.position.x;
    mouseShadow.position.z = mouse.body.position.z;
    let pressedSide = null;
    let newestPress = -Infinity;
    for (const [side, button] of mouse.buttons) {
      const age = time - button.started;
      const releaseAge = time - button.releaseAt;
      const down = MathUtils.smoothstep(age, 0, .07) * (1 - MathUtils.smoothstep(releaseAge, 0, .08));
      button.mesh.position.y = -mouseButtonTravel * down;
      button.mesh.material.color.copy(button.tint).lerp(activeColor, 1 - MathUtils.smoothstep(releaseAge, .018, .238));
      if (releaseAge < 0 && button.started > newestPress) {
        pressedSide = side;
        newestPress = button.started;
      }
    }

    if (pressedSide || mouseInUse(time)) {
      reserveMousePaw(time);
      paws.followMouse(mouseSurface(pressedSide), time, Boolean(pressedSide));
    }
    if (!pet && time - lastInput > .58) cat.setPointer(desktopPointer.x, desktopPointer.y);
    animateReaction(time, seconds);
    cat.update(seconds);
    paws.update(time, seconds);
    const resting = pet || heldKeys.size || mousePresses.size ? 0 : MathUtils.smoothstep(time - lastInput, 1.8, 3);
    cat.model.scale.y = 1 + resting * .0032 * Math.sin(time * 2.4);
    for (const key of keys.values()) {
      const age = time - key.started;
      const releaseAge = time - key.releaseAt;
      const down = MathUtils.smoothstep(age, .053, .092) * (1 - MathUtils.smoothstep(releaseAge, 0, .085));
      key.cap.position.y = capY - capTravel * down;
      key.cap.material.color.copy(key.tint).lerp(activeColor, 1 - MathUtils.smoothstep(releaseAge, .018, .238));
    }

    camera.updateMatrixWorld();
    angerMark.style.opacity = tension * (1 - moodBlend);
    if (tension > .02) {
      head.localToWorld(projected.set(.196, .238, .130)).project(camera);
      angerMark.style.left = `${MathUtils.clamp((projected.x * .5 + .5) * viewWidth, 14, viewWidth - 14)}px`;
      angerMark.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 14, viewHeight - 14)}px`;
      angerMark.style.transform = `translate(-50%, -50%) rotate(${8 * Math.sin(time * 20)}deg) scale(${.72 + tension * .36})`;
    }
    const speechless = typingMood === 'speechless' ? moodBlend : 0;
    silenceMark.style.opacity = speechless;
    if (speechless > .02) {
      head.localToWorld(projected.set(.192, .229, .133)).project(camera);
      silenceMark.style.left = `${MathUtils.clamp((projected.x * .5 + .5) * viewWidth, 18, viewWidth - 18)}px`;
      silenceMark.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 12, viewHeight - 12)}px`;
    }
    const crying = typingMood === 'crying' ? moodBlend : 0;
    tears.forEach(({ stream, x }, index) => {
      stream.style.opacity = crying;
      if (crying <= .02) {
        return;
      }
      head.localToWorld(projected.set(x, .092, .153)).project(camera);
      const flow = (time - moodStarted) * 3 + index * .39;
      const length = (.55 + .45 * crying) * (1 + .07 * Math.sin(flow * 2 * Math.PI));
      const lean = (index === 0 ? 7 : -7) + 2 * Math.sin(flow * 2 * Math.PI);
      stream.style.left = `${(projected.x * .5 + .5) * viewWidth}px`;
      stream.style.top = `${(.5 - projected.y * .5) * viewHeight}px`;
      stream.style.transform = `translateX(-50%) rotate(${lean}deg) scaleY(${length})`;
      stream.style.setProperty('--tear-flow', `${Math.floor((flow % 1) * 28)}px`);
    });
    while (floaters.length && time - floaters[0].time >= .88) floaters.shift().chip.remove();
    if (floaters.length) {
      cat.model.localToWorld(projected.set(.015, .265, .252)).project(camera);
      keyRow.style.top = `${(.5 - projected.y * .5) * viewHeight}px`;
      if (lastKeyRowWidth !== viewWidth) {
        lastKeyRowWidth = viewWidth;
        trimKeyRow();
      }
    }
    for (const floater of floaters) {
      const age = time - floater.time;
      const fade = MathUtils.smoothstep(age, .32, .88);
      floater.chip.style.opacity = 1 - fade;
      floater.chip.style.transform = `translateY(${keyFloatHeights[floater.heightIndex] - 5 * fade}px) rotate(${floater.tilt}deg)`;
    }
    for (let index = petEffects.length - 1; index >= 0; index--) {
      const item = petEffects[index];
      const progress = (time - item.time) / item.lifetime;
      if (progress >= 1) {
        item.effect.remove();
        petEffects.splice(index, 1);
        continue;
      }
      if (item.isHeart) {
        head.localToWorld(projected.set(.172 + .077 * progress, .224 + .115 * progress, .137));
      } else {
        head.localToWorld(projected.set(.036 + .20 * progress, .047 + .05 * progress, .217));
      }
      projected.project(camera);
      item.effect.style.left = `${MathUtils.clamp((projected.x * .5 + .5) * viewWidth, 17, viewWidth - 17)}px`;
      item.effect.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 16, viewHeight - 16)}px`;
      item.effect.style.opacity = (1 - MathUtils.smoothstep(progress, .66, 1)) * MathUtils.smoothstep(progress, 0, .12);
      item.effect.style.transform = `translate(-50%, -50%) scale(${.70 + Math.min(progress * 2.5, .48)})`;
    }
    renderer.render(scene, camera);
  }

  let previous = clock();
  renderFrame(previous, 0);
  stage.dataset.state = 'ready';
  const readyMessage = '按键盘或点屏幕键帽，鼠标左右键也可以试试。';
  if (onStatus) onStatus(readyMessage);
  else status.textContent = readyMessage;
  renderer.setAnimationLoop(milliseconds => {
    const now = milliseconds / 1000;
    renderFrame(now, MathUtils.clamp(now - previous, 0, .05));
    previous = now;
  });
  return {
    playDesktopMouseButton(side, down) {
      if (!mouse.buttons.has(side)) return;
      if (down === true) pressMouse(side, `desktop:${side}`);
      if (down === false) {
        releaseMouse(`desktop:${side}`);
        releaseMouse(side === 'left' ? 'window:0' : 'window:2');
      }
    },
    trackDesktopPointer(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      hasDesktopPointer = true;
      desktopPointer.set(x, y);
      followPointer(x, y);
    },
    playBackgroundKey(code, down) {
      if (typeof code !== 'string') return;
      if (down === true) pressKey(code, clock(), 'background');
      if (down === false) releaseKey(code, clock());
    },
    releaseBackgroundKeys() {
      releaseSource('background');
    },
  };
}

if (document.querySelector('#model-data')) {
  const stage = document.querySelector('main');
  mountTypingCat(stage).catch(error => {
    stage.dataset.state = 'error';
    stage.querySelector('#status').textContent = '加载失败，请使用支持 WebGL 2 的浏览器打开。';
    console.error(error);
  });
}

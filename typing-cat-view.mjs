import {
  ACESFilmicToneMapping, BoxGeometry, BufferGeometry, CanvasTexture, Color,
  CylinderGeometry, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera,
  PlaneGeometry, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { loadSeatedCat } from './seated-cat.mjs';
import { createTypingPaws } from './typing-paws.mjs';

function letters(value) {
  return Array.from(value, name => [`Key${name}`, name]);
}

const rows = [
  [['Backquote', '`'], ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => [`Digit${n}`, n]),
    ['Minus', '−'], ['Equal', '='], ['Backspace', '⌫', 1.5]],
  [['Tab', 'Tab', 1.35], ...letters('QWERTYUIOP'), ['BracketLeft', '['], ['BracketRight', ']']],
  [['CapsLock', 'Caps', 1.5], ...letters('ASDFGHJKL'), ['Semicolon', ';'], ['Quote', "'"], ['Enter', '↵', 1.75]],
  [['ShiftLeft', '⇧', 1.75], ...letters('ZXCVBNM'), ['Comma', ','], ['Period', '.'], ['Slash', '/'], ['ShiftRight', '⇧', 2.5]],
  [['ControlLeft', 'Ctrl', 1.35], ['AltLeft', 'Alt', 1.4], ['Space', '', 6],
    ['AltRight', 'Alt', 1.4], ['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→']],
];

const clock = () => performance.now() / 1000;
const capHeight = .018;
const capTravel = .008;
const capY = .064;
const keyboardX = .014;
const mouseHomeX = .320;
const mouseHomeZ = .264;
const mouseButtonTravel = .005;

function makeLabel(text, width, color) {
  const canvas = document.createElement('canvas');
  const long = String(text).length > 1;
  canvas.width = 192;
  canvas.height = 92;
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${long ? 42 : 53}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(String(text), 96, 46, 176);
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
      if (label !== '') cap.add(makeLabel(label, width, labelColor));
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
  const projected = new Vector3();
  let lastInput = -Infinity;
  let lastKeyboard = -Infinity;
  let lastMouseMove = -Infinity;
  let nextSpaceSide = 'left';
  const heldKeys = new Map();
  const activeHeldKey = { left: null, right: null };
  const mousePresses = new Map();

  function showKey(label, time, point) {
    const chip = document.createElement('span');
    chip.textContent = label;
    floatingLayer.append(chip);
    floaters.push({ chip, time, point: point.clone() });
    if (floaters.length > 16) floaters.shift().chip.remove();
  }

  function pressKey(code, time, source = null) {
    const key = keys.get(code);
    if (!key) return false;
    if (heldKeys.has(code)) return true;
    key.started = time;
    key.releaseAt = source ? Infinity : time + .182;
    const { x, z } = key.cap.position;
    const point = new Vector3(x, capY + capHeight * .5 - capTravel, z);
    let side = x < .018 ? 'left' : 'right';
    if (code === 'Space') {
      side = nextSpaceSide;
      point.x = x + (side === 'left' ? -.066 : .066);
      nextSpaceSide = nextSpaceSide === 'left' ? 'right' : 'left';
    }
    if (source) {
      heldKeys.set(code, { code, point, side, source });
      activeHeldKey[side] = code;
    }
    if (source || !activeHeldKey[side]) paws.tap(point, time, side, Boolean(source));
    cat.setPointer(point.x * 1.6, -.56);
    showKey(key.label, time, point);
    lastInput = lastKeyboard = time;
    return true;
  }

  function releaseKey(code, time) {
    const held = heldKeys.get(code);
    if (!held) return;
    heldKeys.delete(code);
    const key = keys.get(code);
    key.releaseAt = Math.max(time, key.started + .145);
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
    const point = mouseSurface(side);
    showKey(side === 'left' ? '左键' : '右键', time, point);
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
  }, events);
  window.addEventListener('pointerup', event => releaseMouse(`window:${event.button}`), events);
  window.addEventListener('pointercancel', releaseWindowMouse, events);

  function readPointer(event) {
    const box = stage.getBoundingClientRect();
    pointer.set(2 * (event.clientX - box.left) / box.width - 1,
      1 - 2 * (event.clientY - box.top) / box.height);
  }

  function followPointer(x, y) {
    cat.setPointer(x, y);
    lastInput = lastMouseMove = clock();
    mouseOffset.set(.012 * MathUtils.clamp(x, -1, 1),
      -.023 * MathUtils.clamp(y, -1, 1));
  }

  stage.addEventListener('pointermove', event => {
    if (hasDesktopPointer) return;
    readPointer(event);
    followPointer(pointer.x, pointer.y);
  }, events);
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.button !== 2) return;
    readPointer(event);
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

    if (pressedSide || (time - lastMouseMove < .22 && time - lastKeyboard > .14)) {
      paws.followMouse(mouseSurface(pressedSide), time, Boolean(pressedSide));
    }
    if (time - lastInput > .58) cat.setPointer(desktopPointer.x, desktopPointer.y);
    cat.update(seconds);
    paws.update(time, seconds);
    const resting = heldKeys.size || mousePresses.size ? 0 : MathUtils.smoothstep(time - lastInput, 1.8, 3);
    cat.model.scale.y = 1 + resting * .0032 * Math.sin(time * 2.4);
    for (const key of keys.values()) {
      const age = time - key.started;
      const releaseAge = time - key.releaseAt;
      const down = MathUtils.smoothstep(age, .053, .092) * (1 - MathUtils.smoothstep(releaseAge, 0, .085));
      key.cap.position.y = capY - capTravel * down;
      key.cap.material.color.copy(key.tint).lerp(activeColor, 1 - MathUtils.smoothstep(releaseAge, .018, .238));
    }

    camera.updateMatrixWorld();
    while (floaters.length && time - floaters[0].time > .70) floaters.shift().chip.remove();
    for (const floater of floaters) {
      const age = time - floater.time;
      projected.copy(floater.point);
      projected.y += .12 + .22 * age;
      projected.project(camera);
      floater.chip.style.left = `${(projected.x * .5 + .5) * viewWidth}px`;
      floater.chip.style.top = `${(.5 - projected.y * .5) * viewHeight}px`;
      floater.chip.style.opacity = 1 - MathUtils.smoothstep(age, .18, .70);
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

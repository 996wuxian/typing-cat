import {
  ACESFilmicToneMapping, BoxGeometry, BufferGeometry, CanvasTexture, Color,
  CylinderGeometry, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera,
  PlaneGeometry, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createMidnightCat, midnightCatCoats, midnightEyeStyles, midnightHeadphoneStyles } from './midnight-cat.mjs';
export { midnightCatCoats, midnightEyeStyles, midnightHeadphoneStyles };
import { createTypingPaws } from './typing-paws.mjs';
import { keyIconElement, keyIcons, paintKeyIcon } from './typing-key-icons.mjs';
import { createMeowPlayer } from './cat-meow.mjs';
import { createCatRewards } from './typing-cat-rewards.mjs';

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
const keyboardZ = .353;
const mouseHomeX = .320;
const mouseHomeZ = .264;
const mouseButtonTravel = .005;
const keyFloatHeights = [-14, -7, 0, 7, 14];
const keyFloatLifetime = 1.02;
const keyOverflowFade = .22;
const keyChipGap = 6;
const keyRowInset = 12;
const napDelay = 10;
const napLetterLifetime = 1.6;
const napLetterSpacing = .43;
const napLetterCycle = 2.4;
const angerMarkThreshold = 80;
const angerBurstLifetime = .96;
const angerBurstSpacing = .52;
const angerBurstCycle = 1.04;
const defaultFloatingKeyAnchor = [.015, .265, .252];

export const midnightKeyboardStyles = {
  cream: {
    label: '奶白复古',
    plateColor: '#363440',
    insertColor: '#24232b',
    rows: [
      ['#eae7df', '#34323b'], ['#faf5e9', '#34323b'], ['#eae7df', '#34323b'],
      ['#faf5e9', '#34323b'], ['#eae7df', '#34323b'],
    ],
    accents: { Tab: '#eeb751', ArrowRight: '#eeb751' },
    activeColor: '#e6b95c',
    mouse: { shell: '#f2eee6', trim: '#525862', recess: '#5c636d', wheel: '#817252', tread: '#a99a75' },
  },
  obsidian: {
    label: '暗夜黑金',
    plateColor: '#1b1d24',
    insertColor: '#111318',
    rows: [
      ['#2d303a', '#f2ece1'], ['#252831', '#f2ece1'], ['#2b2e38', '#f2ece1'],
      ['#252831', '#f2ece1'], ['#20232b', '#f2ece1'],
    ],
    accents: { Tab: '#e4b358', Enter: '#e4b358', ArrowRight: '#e4b358' },
    accentLabel: { Tab: '#221d16', Enter: '#221d16', ArrowRight: '#221d16' },
    activeColor: '#e9bd67',
    mouse: { shell: '#262932', trim: '#14161c', recess: '#181a21', wheel: '#cfa048', tread: '#e8c16f' },
  },
  sakura: {
    label: '樱粉甜心',
    plateColor: '#e7b9c8',
    insertColor: '#cf9cae',
    rows: [
      ['#fbd6e2', '#6b3a4c'], ['#fff7fa', '#6b3a4c'], ['#fde4ec', '#6b3a4c'],
      ['#fff7fa', '#6b3a4c'], ['#fbd6e2', '#6b3a4c'],
    ],
    accents: { Tab: '#f087ab', Enter: '#f087ab', Space: '#fde4ec', ArrowRight: '#f087ab' },
    accentLabel: { Tab: '#fffafc', Enter: '#fffafc', ArrowRight: '#fffafc' },
    activeColor: '#f295b5',
    mouse: { shell: '#fde6ee', trim: '#c98da2', recess: '#d7a1b4', wheel: '#e57ea1', tread: '#f7aec7' },
  },
  matcha: {
    label: '抹茶奶绿',
    plateColor: '#4c5c4a',
    insertColor: '#374436',
    rows: [
      ['#d6e5ca', '#30402f'], ['#f6f4ea', '#30402f'], ['#e3edd8', '#30402f'],
      ['#f6f4ea', '#30402f'], ['#d6e5ca', '#30402f'],
    ],
    accents: { Tab: '#84ad71', Enter: '#84ad71', ArrowRight: '#84ad71' },
    accentLabel: { Tab: '#f7fbf2', Enter: '#f7fbf2', ArrowRight: '#f7fbf2' },
    activeColor: '#98c284',
    mouse: { shell: '#e6efdd', trim: '#566954', recess: '#6b7e68', wheel: '#749c62', tread: '#9fc48d' },
  },
  retro: {
    label: '经典灰白',
    plateColor: '#9e978b',
    insertColor: '#767065',
    rows: [
      ['#d7d1c5', '#343230'], ['#efeae0', '#343230'], ['#eae5da', '#343230'],
      ['#efeae0', '#343230'], ['#d7d1c5', '#343230'],
    ],
    accents: { Backquote: '#d46555', Tab: '#639a96', Enter: '#d46555', ArrowRight: '#639a96' },
    accentLabel: { Backquote: '#fff8f5', Tab: '#f4fbfa', Enter: '#fff8f5', ArrowRight: '#f4fbfa' },
    activeColor: '#d97868',
    mouse: { shell: '#e5dfd3', trim: '#7c766b', recess: '#8f887c', wheel: '#c95d4d', tread: '#de8374' },
  },
  sky: {
    label: '海盐晴蓝',
    plateColor: '#506480',
    insertColor: '#3a4a61',
    rows: [
      ['#cde0f6', '#2b3b54'], ['#f6faff', '#2b3b54'], ['#dcebfa', '#2b3b54'],
      ['#f6faff', '#2b3b54'], ['#cde0f6', '#2b3b54'],
    ],
    accents: { Tab: '#6f9ce6', Enter: '#6f9ce6', ArrowRight: '#6f9ce6' },
    accentLabel: { Tab: '#f6faff', Enter: '#f6faff', ArrowRight: '#f6faff' },
    activeColor: '#7ca8ef',
    mouse: { shell: '#e3effc', trim: '#576d8c', recess: '#6c83a3', wheel: '#6492de', tread: '#93b8f0' },
  },
};

export const typingCatSchemes = {
  midnight: {
    label: '夜猫 · 奶白键盘',
    createCat: createMidnightCat,
    keyboard: {
      z: .403, plateColor: '#363440', insertColor: '#24232b',
      plateHeight: .043, bezelRadius: .018, keyRadius: .0055, widthScale: .86, depthScale: .84, yaw: -.052,
      colors: Array.from({ length: rows.length }, (_, row) => [row % 2 ? '#faf5e9' : '#eae7df', '#34323b']),
      accents: new Map([['Tab', '#eeb751'], ['ArrowRight', '#eeb751']]),
    },
    mouse: {
      x: -.285, scale: [.88, 1.08, .88], shell: '#f2eee6', wheel: '#817252', tread: '#a99a75',
      profile: [
        [-.059, .001, .010, .011], [-.053, .019, .011, .024], [-.038, .030, .015, .037],
        [-.021, .034, .017, .044], [.002, .035, .018, .046], [.023, .034, .016, .043],
        [.042, .030, .014, .036], [.056, .019, .011, .025], [.063, .001, .008, .010],
      ],
    },
    activeColor: '#e6b95c',
    cameraX: -.018,
    cameraY: .237,
    cameraZoom: 1.40,
    cameraElevation: 1.22,
    floatingKeyAnchor: [-.008, .196, .222],
    drawerAnchorY: .340,
  },
};

function makeLabel(text, width, color, code) {
  const canvas = document.createElement('canvas');
  const long = String(text).length > 1;
  canvas.width = 192;
  canvas.height = 92;
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${long ? 42 : 53}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  if (keyIcons[code]) {
    ctx.strokeStyle = '#ffffff';
    paintKeyIcon(ctx, code, 96, 46, 70);
  } else {
    ctx.fillText(String(text), 96, 46, 176);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const label = new Mesh(new PlaneGeometry(width * .85, .020),
    new MeshBasicMaterial({ color, map: texture, transparent: true, depthWrite: false, toneMapped: false }));
  label.rotation.set(-Math.PI / 2, 0, Math.PI);
  label.position.y = capHeight / 2 + .0012;
  return label;
}

function createKeyboard({ plateColor = '#24272d', insertColor = '#17191e', plateHeight = .054,
  bezelRadius = .014, keyRadius = .0038, widthScale = 1, depthScale = 1, yaw = 0, z = keyboardZ,
  colors, accents } = {}) {
  const board = new Group();
  board.position.set(keyboardX, 0, z);
  board.scale.set(widthScale, 1, depthScale);
  board.rotation.y = yaw;
  const keys = new Map();
  const shapes = new Map();
  const keyColors = colors ?? [
    ['#eef0f2', '#252b33'],
    ['#d8dce0', '#252b33'],
    ['#aeb4bc', '#252b33'],
    ['#646c78', '#f1f3f5'],
    ['#373d47', '#f1f3f5'],
  ];
  const plate = new Mesh(new RoundedBoxGeometry(.53, plateHeight, .163, 2, bezelRadius),
    new MeshStandardMaterial({ color: plateColor, roughness: .52 }));
  plate.position.y = .054 - plateHeight * .5;
  const insert = new Mesh(new RoundedBoxGeometry(.514, .009, .148, 2, .004),
    new MeshStandardMaterial({ color: insertColor, roughness: .63 }));
  insert.position.y = .054;
  board.add(plate, insert);

  const unit = .036;
  rows.forEach((row, rowIndex) => {
    const total = row.reduce((sum, [, , size = 1]) => sum + size, 0);
    // The layout and legends both face the cat.
    let column = total * unit / 2;
    const z = ((rows.length - 1) / 2 - rowIndex) * .026;
    for (const [code, label, size = 1] of row) {
      const width = unit * size - .0024;
      if (!shapes.has(size)) {
        shapes.set(size, new RoundedBoxGeometry(width, capHeight, .024, 2, keyRadius));
      }
      const [keyColor, labelColor] = keyColors[rowIndex];
      const tint = new Color(accents?.get(code) ?? keyColor);
      const cap = new Mesh(shapes.get(size), new MeshStandardMaterial({ color: tint, roughness: .59 }));
      cap.position.set(column - size * unit / 2, capY, z);
      const labelMesh = label !== '' ? makeLabel(label, width, labelColor, code) : null;
      if (labelMesh) cap.add(labelMesh);
      cap.userData.keyCode = code;
      keys.set(code, {
        cap, labelMesh, rowIndex, label: code === 'Space' ? '空格' : label,
        tint, started: -Infinity, releaseAt: -Infinity,
      });
      board.add(cap);
      column -= size * unit;
    }
  });
  function applyStyle(styleKey) {
    const theme = midnightKeyboardStyles[styleKey] ?? midnightKeyboardStyles.cream;
    plate.material.color.set(theme.plateColor);
    insert.material.color.set(theme.insertColor);
    for (const [code, key] of keys) {
      const [rowCap, rowLabel] = theme.rows[key.rowIndex];
      key.tint.set(theme.accents?.[code] ?? rowCap);
      key.cap.material.color.copy(key.tint);
      if (key.labelMesh) {
        key.labelMesh.material.color.set(theme.accentLabel?.[code] ?? rowLabel);
      }
    }
    return theme.activeColor;
  }
  return { board, keys, applyStyle };
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

function mouseSection(z, profile) {
  const index = profile.findIndex(([position], i) => i > 0 && z <= position);
  const i = index === -1 ? profile.length - 1 : index;
  const a = profile[i - 1];
  const b = profile[i];
  const previous = profile[Math.max(0, i - 2)];
  const next = profile[Math.min(profile.length - 1, i + 1)];
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

function mouseSurfaceGeometry(start, end, columns, sectionAt, sample) {
  const rows = 48;
  const vertices = [];
  const indices = [];
  const stride = columns + 1;
  for (let row = 0; row <= rows; row++) {
    const z = MathUtils.lerp(start, end, row / rows);
    const section = sectionAt(z);
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

function createMouse({ x = mouseHomeX, scale = [1, 1.42, 1], shell = '#e2e4e8',
  wheel: wheelColor = '#343740', tread: treadColor = '#585d68', profile = mouseProfile } = {}) {
  const body = new Group();
  const rear = profile[0][0];
  const nose = profile.at(-1)[0];
  const sectionAt = z => mouseSection(z, profile);
  const seam = -.003;
  const ivory = new MeshStandardMaterial({ color: shell, roughness: .48 });
  const trim = new MeshStandardMaterial({ color: '#525862', roughness: .69 });
  const recess = new MeshStandardMaterial({ color: '#5c636d', roughness: .74 });

  function cover(from, to, material, inset = 0, widthScale = 1) {
    const geometry = mouseSurfaceGeometry(from, to, 20, sectionAt, (u, z, section) => {
      const x = (u * 2 - 1) * section[0] * widthScale;
      return [x, mouseCrown(x, section) - inset];
    });
    body.add(new Mesh(geometry, material));
  }
  cover(rear, seam, ivory);
  cover(seam, nose, recess, .0065, .95);

  for (const side of [-1, 1]) {
    const skirt = mouseSurfaceGeometry(rear, nose, 3, sectionAt, (u, z, [width, height]) => {
      const fraction = side > 0 ? 1 - u : u;
      return [side * width * MathUtils.lerp(.96, 1, fraction), MathUtils.lerp(.005, height, fraction)];
    });
    const edge = mouseSurfaceGeometry(rear, nose, 2, sectionAt, (u, z, [width]) => {
      const fraction = side > 0 ? 1 - u : u;
      return [side * width * MathUtils.lerp(.92, .968, fraction), MathUtils.lerp(.001, .006, fraction)];
    });
    body.add(new Mesh(skirt, ivory), new Mesh(edge, trim));
  }

  const buttons = new Map();
  for (const [side, sign] of [['left', -1], ['right', 1]]) {
    const tint = new Color(shell);
    const panel = mouseSurfaceGeometry(seam + .0014, nose, 14, sectionAt, (u, z, section) => {
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
  const rubber = new MeshStandardMaterial({ color: wheelColor, roughness: .9 });
  const ribs = new MeshStandardMaterial({ color: treadColor, roughness: .92 });
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
  wheel.position.set(0, sectionAt(.021)[2] - .001, .021);
  body.add(wheel);
  body.scale.fromArray(scale);
  body.position.set(x, 0, mouseHomeZ);
  function applyStyle(theme) {
    if (!theme) return;
    ivory.color.set(theme.shell);
    trim.color.set(theme.trim);
    recess.color.set(theme.recess);
    rubber.color.set(theme.wheel);
    ribs.color.set(theme.tread);
    for (const button of buttons.values()) {
      button.tint.set(theme.shell);
      button.mesh.material.color.copy(button.tint);
    }
  }
  return { body, buttons, sectionAt, applyStyle };
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

export async function mountTypingCat(stage, { signal, onStatus, scheme = 'midnight',
  catCoat = 'black', eyeStyle = 'xiaohei', headphoneStyle = 'cream', keyboardStyle = 'cream',
  rewardsEnabled = true, musicMode: initialMusicMode = false } = {}) {
  const preset = typingCatSchemes[scheme] ?? typingCatSchemes.midnight;
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
  camera.zoom = preset.cameraZoom ?? 1;
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
  let cat;
  let rewards;
  const cleanup = () => {
    resizeObserver.disconnect();
    renderer.setAnimationLoop(null);
    disposeScene();
    renderer.dispose();
    cat?.dispose?.();
    rewards?.dispose();
    floatingLayer.replaceChildren();
  };
  signal?.addEventListener('abort', cleanup, { once: true });
  try {
    cat = preset.createCat(floatingLayer, { catCoat, eyeStyle, headphoneStyle });
  } catch (error) {
    if (!signal?.aborted) cleanup();
    throw error;
  }
  if (signal?.aborted) {
    cat.dispose?.();
    scene.add(cat.model);
    disposeScene();
    return;
  }
  const { board, keys, applyStyle: applyKeyboardStyle } = createKeyboard(preset.keyboard);
  const mouse = createMouse(preset.mouse);
  const mouseX = mouse.body.position.x;
  const mousePaw = mouseX < 0 ? 'left' : 'right';
  const keyboardPaw = mousePaw === 'right' ? 'left' : 'right';
  const paws = createTypingPaws(cat.model, mousePaw, cat.pawContact);
  const keyboardShadow = makeShadow(.68 * board.scale.x, .25 * board.scale.z,
    board.position.x, board.position.z + .007, .30);
  keyboardShadow.rotation.z = board.rotation.y;
  const mouseShadow = makeShadow(.16, .17, mouseX, mouseHomeZ, .28);
  scene.add(makeShadow(.67, .67, 0, -.05, .42),
    keyboardShadow, mouseShadow, cat.model, board, mouse.body);

  let viewWidth = 0;
  let viewHeight = 0;
  function sizeToStage() {
    const { clientWidth: width, clientHeight: height } = stage;
    if (width === viewWidth && height === viewHeight) return;
    viewWidth = width;
    viewHeight = height;
    camera.aspect = width / Math.max(1, height);
    const distance = Math.max(1.12, .83 / camera.aspect);
    const centerX = preset.cameraX ?? .045;
    const centerY = preset.cameraY ?? .423;
    camera.position.set(centerX, centerY + (preset.cameraElevation ?? 1.12) * distance, .13 + 2.20 * distance);
    camera.lookAt(centerX, centerY, .13);
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
  const activeColor = new Color(applyKeyboardStyle(keyboardStyle) ?? preset.activeColor ?? '#a4b1cc');
  mouse.applyStyle(midnightKeyboardStyles[keyboardStyle]?.mouse);
  const floaters = [];
  const keyRow = document.createElement('div');
  keyRow.className = 'key-row';
  floatingLayer.append(keyRow);
  const projected = new Vector3();
  const head = cat.model.getObjectByName('Head');
  const projectHead = (x, y, z, target = projected) => cat.projectHead
    ? cat.projectHead(x, y, target)
    : head.localToWorld(target.set(x, y, z)).project(camera);
  const headCenter = new Vector3();
  const headEdge = new Vector3();
  const feedPoint = new Vector2();
  const meow = createMeowPlayer(signal);
  const petEffects = [];
  let petHeartCount = 0;
  const heartSvg = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17.4C9.6 17.1 2.2 12.1 2.2 7.1C2.2 4.3 4.3 2.4 6.8 2.4C8.4 2.4 9.5 3.3 10 4.6C10.5 3.3 11.6 2.4 13.2 2.4C15.7 2.4 17.8 4.3 17.8 7.1C17.8 12.1 10.4 17.1 10 17.4Z"/><circle cx="6.2" cy="6.1" r="1.15" class="pet-heart-shine"/></svg>';
  const napLabel = document.createElement('div');
  napLabel.className = 'nap-label';
  napLabel.hidden = true;
  const napLetters = ['z', 'z', 'Z'].map(text => {
    const letter = document.createElement('span');
    letter.className = 'nap-letter';
    letter.textContent = text;
    return letter;
  });
  napLabel.append(...napLetters);
  floatingLayer.append(napLabel);
  const angerMark = document.createElement('div');
  angerMark.className = 'anger-mark';
  angerMark.hidden = true;
  const angerBursts = [0, 1].map(() => {
    const burst = document.createElement('span');
    burst.className = 'anger-burst';
    burst.textContent = '💢';
    return burst;
  });
  angerMark.append(...angerBursts);
  floatingLayer.append(angerMark);
  const silenceMark = document.createElement('div');
  silenceMark.className = 'typing-silence';
  silenceMark.textContent = '…';
  floatingLayer.append(silenceMark);
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
  let musicMode = Boolean(initialMusicMode);
  let nextMusicNote = 0;
  if (musicMode) cat.setMusicMode?.(true);
  rewards = createCatRewards(stage, { enabled: rewardsEnabled, canFeedAt, onFeed: feedCat });
  let angerMarkBlend = Number(rewards.anger > angerMarkThreshold);
  let angerElapsed = 0;
  let napBlend = Number(rewards.striking);
  let strikeBlend = napBlend;
  let napElapsed = 0;
  let fedAt = -Infinity;
  let lastInput = clock();
  let lastKeyAt = -Infinity;
  let typingBlend = 0;
  let keyBounce = 0;
  let lastMouseMove = -Infinity;
  let nextSpaceSide = 'left';
  const heldKeys = new Map();
  const activeHeldKey = { left: null, right: null };
  const mousePresses = new Map();

  function mouseInUse(time) {
    return mousePresses.size > 0 || (!pet && time - lastMouseMove < .24);
  }

  function reserveMousePaw(time) {
    if (rewards.striking || !activeHeldKey[mousePaw]) return;
    for (const held of heldKeys.values()) {
      if (held.side === mousePaw) held.side = keyboardPaw;
    }
    const next = [...heldKeys.values()].at(-1);
    activeHeldKey[mousePaw] = null;
    activeHeldKey[keyboardPaw] = next.code;
    paws.release(mousePaw, time);
    paws.tap(next.point, time, keyboardPaw, true);
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
    floaters.push({ chip, time, heightIndex, tilt, width: chip.offsetWidth, evictedAt: Infinity });
  }

  function updateKeyFloaters(time, seconds) {
    for (let index = floaters.length - 1; index >= 0; index--) {
      const floater = floaters[index];
      if (time - floater.time >= keyFloatLifetime || time - floater.evictedAt >= keyOverflowFade) {
        floater.chip.remove();
        floaters.splice(index, 1);
      }
    }
    if (!floaters.length) return;

    cat.model.localToWorld(projected.fromArray(preset.floatingKeyAnchor ?? defaultFloatingKeyAnchor)).project(camera);
    keyRow.style.top = `${(.5 - projected.y * .5) * viewHeight}px`;

    const row = floaters.filter(floater => floater.evictedAt === Infinity);
    const availableWidth = viewWidth - 2 * keyRowInset;
    let rowWidth = row.reduce((total, floater) => total + floater.width, Math.max(0, row.length - 1) * keyChipGap);
    while (row.length > 1 && (row.length > 16 || rowWidth > availableWidth)) {
      const floater = row.shift();
      floater.evictedAt = time;
      rowWidth -= floater.width + keyChipGap;
    }

    let left = -rowWidth / 2;
    for (const floater of floaters) {
      if (floater.evictedAt === Infinity) {
        const x = left + floater.width / 2;
        floater.x = MathUtils.damp(floater.x ?? x, x, 16, seconds);
        left += floater.width + keyChipGap;
      }
      if (floater.x === undefined) continue;

      const age = time - floater.time;
      const enter = MathUtils.smoothstep(age, 0, .18);
      const fade = MathUtils.smoothstep(age, .46, keyFloatLifetime);
      const overflow = MathUtils.smoothstep(time - floater.evictedAt, 0, keyOverflowFade);
      const opacity = enter * (1 - fade) * (1 - overflow);
      const rise = 19 * MathUtils.clamp(age / keyFloatLifetime, 0, 1);
      const x = floater.x + 7 * (1 - enter) - 4 * fade;
      const y = keyFloatHeights[floater.heightIndex] + 10 * (1 - enter) - rise - 8 * overflow;
      const scale = .81 + .19 * enter - .13 * Math.max(fade, overflow);
      floater.chip.style.opacity = opacity;
      floater.chip.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${floater.tilt}deg) scale(${scale})`;
    }
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
    rewards.recordKey(time);
    key.started = time;
    key.releaseAt = source ? Infinity : time + .182;
    const { x, z } = key.cap.position;
    const point = new Vector3(x, capY + capHeight * .5 - capTravel, z);
    const useTail = code === 'Space' && Boolean(cat.tapTail);
    let side = useTail ? 'tail' : x < .018 - keyboardX ? 'left' : 'right';
    const usingMouse = !rewards.striking && mouseInUse(time);
    if (code === 'Space' && !useTail) {
      side = usingMouse ? keyboardPaw : nextSpaceSide;
      point.x = x + (side === 'left' ? -.066 : .066);
      if (!usingMouse) nextSpaceSide = side === 'left' ? 'right' : 'left';
    }
    if (usingMouse && !useTail) {
      reserveMousePaw(time);
      side = keyboardPaw;
    }
    board.localToWorld(point);
    if (source) {
      heldKeys.set(code, { code, keyCode, point, side, source });
      if (!useTail) activeHeldKey[side] = code;
    }
    showKey(key.label, time, keyCode);
    if (!rewards.striking) {
      if (useTail) cat.tapTail(point, time, Boolean(source));
      else if (source || !activeHeldKey[side]) paws.tap(point, time, side, Boolean(source));
      cat.onKeyTap?.(side, code === 'Space');
      keyBounce = Math.min(1.2, keyBounce + (code === 'Space' ? .9 : .55));
      cat.setPointer(MathUtils.clamp(point.x * 2.3, -1, 1), -.92);
      lastKeyAt = time;
      recordStreak(keyCode, time);
      if (source) {
        recentKeys.push(time);
        while (recentKeys.length && time - recentKeys[0] > .72) recentKeys.shift();
        if (recentKeys.length >= 6) tenseUntil = time + .55;
      }
    }
    lastInput = time;
    return true;
  }

  function releaseKey(code, time) {
    const held = heldKeys.get(code);
    if (!held) return;
    heldKeys.delete(code);
    lastInput = time;
    if (![...heldKeys.values()].some(other => other.keyCode === held.keyCode)) {
      const key = keys.get(held.keyCode);
      key.releaseAt = Math.max(time, key.started + .145);
    }
    if (held.side === 'tail') {
      cat.releaseTail?.(time);
      return;
    }
    if (activeHeldKey[held.side] !== code) return;
    const next = [...heldKeys.values()].findLast(other => other.side === held.side);
    activeHeldKey[held.side] = next?.code ?? null;
    if (next && !rewards.striking) paws.tap(next.point, time, next.side, true);
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
    const point = mouse.body.localToWorld(new Vector3(x, mouseCrown(x, mouse.sectionAt(z)) + buttonY, z));
    point.y += .001;
    return point;
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
    if (pet || rewards.dragging) return;
    if (!heldKeys.size) lastKeyAt = -Infinity;
    cat.setPointer(x, y);
    lastInput = lastMouseMove = clock();
    mouseOffset.set(.012 * MathUtils.clamp(x, -1, 1),
      -.023 * MathUtils.clamp(y, -1, 1));
  }

  function overHead(point = pointer) {
    if (cat.containsHeadPoint) {
      return cat.containsHeadPoint((point.x * .5 + .5) * viewWidth, (.5 - point.y * .5) * viewHeight);
    }
    camera.updateMatrixWorld();
    projectHead(.015, .13, .133, headCenter);
    projectHead(.174, .13, .133, headEdge);
    const radiusX = Math.abs(headEdge.x - headCenter.x);
    projectHead(.015, .255, .133, headEdge);
    const radiusY = Math.abs(headEdge.y - headCenter.y);
    return Math.hypot((point.x - headCenter.x) / radiusX, (point.y - headCenter.y) / radiusY) <= 1;
  }

  function canFeedAt(clientX, clientY) {
    const { left, top, width, height } = stage.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    if (!width || !height || x < 0 || y < 0 || x > width || y > height) return false;
    if (cat.containsScreenPoint) return cat.containsScreenPoint(x, y);
    feedPoint.set(2 * x / width - 1, 1 - 2 * y / height);
    if (overHead(feedPoint)) return true;

    cat.model.localToWorld(headCenter.set(0, .35, .17)).project(camera);
    cat.model.localToWorld(headEdge.set(.205, .35, .17)).project(camera);
    const radiusX = Math.abs(headEdge.x - headCenter.x);
    cat.model.localToWorld(headEdge.set(0, .61, .17)).project(camera);
    const radiusY = Math.abs(headEdge.y - headCenter.y);
    return Math.hypot((feedPoint.x - headCenter.x) / radiusX, (feedPoint.y - headCenter.y) / radiusY) <= 1;
  }

  function resumeHeldPaws(time) {
    for (const code of Object.values(activeHeldKey)) {
      const held = heldKeys.get(code);
      if (held) paws.tap(held.point, time, held.side, true);
    }
    const heldSpace = heldKeys.get('Space');
    if (heldSpace?.side === 'tail') cat.tapTail?.(heldSpace.point, time, true);
  }

  function feedCat() {
    fedAt = lastInput = clock();
    tenseUntil = moodUntil = -Infinity;
    streak = { kind: null, count: 0, last: -Infinity };
    recentKeys.length = 0;
    resumeHeldPaws(fedAt);
    showPetEffect(fedAt, true);
    showPetEffect(fedAt + .18, true);
  }

  function stopPetting() {
    if (!pet) return;
    const id = pet.id;
    pet = null;
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    delete stage.dataset.petting;
    lastInput = clock();
  }

  function showPetEffect(time, kind) {
    const mode = kind === true ? 'heart' : kind === false ? 'meow' : kind;
    const effect = document.createElement('div');
    effect.className = mode === 'heart'
      ? 'pet-effect pet-heart'
      : mode === 'anger'
        ? 'pet-effect pet-anger'
        : mode === 'note'
          ? 'pet-effect pet-note'
          : 'pet-effect pet-meow';
    if (mode === 'heart') effect.innerHTML = heartSvg;
    else if (mode === 'anger') effect.textContent = '💢';
    else if (mode === 'note') effect.textContent = petHeartCount % 2 === 0 ? '♪' : '♫';
    else effect.textContent = '喵';
    floatingLayer.append(effect);
    const burst = mode === 'heart' || mode === 'anger' || mode === 'note';
    const side = burst ? (petHeartCount++ % 2 === 0 ? 1 : -1) : 1;
    petEffects.push({
      effect,
      time,
      mode,
      lifetime: mode === 'heart' ? .98 : mode === 'anger' ? .92 : mode === 'note' ? 1.18 : 1.05,
      side,
      spreadX: mode === 'note' ? side * (6 + Math.random() * 6) : burst ? side * (4 + Math.random() * 4) : 0,
      tilt: mode === 'note' ? side * (8 + Math.random() * 7) : burst ? side * (5 + Math.random() * 5) : 0,
      scale: mode === 'heart' ? .88 + Math.random() * .16 : mode === 'note' ? .88 + Math.random() * .20 : mode === 'anger' ? .92 + Math.random() * .14 : 1,
    });
  }

  function updateNapLetters(seconds) {
    const opacity = MathUtils.smoothstep(napBlend, .10, .92);
    if (!opacity) {
      if (!napLabel.hidden) napLabel.hidden = true;
      napElapsed = 0;
      return;
    }

    napElapsed += seconds;
    napLabel.hidden = false;
    napLabel.style.opacity = opacity;
    projectHead(.157, .196, .130);
    const anchorX = (.5 + projected.x * .5) * viewWidth;
    const anchorY = (.5 - projected.y * .5) * viewHeight;
    napLabel.style.left = `${MathUtils.clamp(anchorX, 8, viewWidth - 44)}px`;
    napLabel.style.top = `${MathUtils.clamp(anchorY, 54, viewHeight - 12)}px`;

    napLetters.forEach((letter, index) => {
      const age = (napElapsed - index * napLetterSpacing) % napLetterCycle;
      const progress = MathUtils.clamp(age / napLetterLifetime, 0, 1);
      const drift = 5 + 25 * progress + 3 * Math.sin(Math.PI * progress);
      const rise = 42 * progress;
      const scale = .62 + .43 * progress + .09 * index;
      letter.style.opacity = MathUtils.smoothstep(age, 0, .28) * (1 - MathUtils.smoothstep(age, .86, napLetterLifetime));
      letter.style.transform = `translate(-50%, -50%) translate(${drift}px, ${-rise}px) rotate(${-10 + 12 * progress}deg) scale(${scale})`;
    });
  }

  function animateReaction(time, seconds, breath) {
    const petting = Boolean(pet);
    const striking = rewards.striking;
    const moodActive = !petting && !striking && time < moodUntil;
    moodBlend = MathUtils.damp(moodBlend, moodActive ? 1 : 0, moodActive ? 12 : 7, seconds);
    tension = MathUtils.damp(tension, !petting && !striking && !moodActive && time < tenseUntil ? 1 : 0, 9, seconds);
    petBlend = MathUtils.damp(petBlend, petting ? 1 : 0, 7, seconds);
    if (petting) {
      const elapsed = time - pet.started;
      if (time >= pet.nextHeart) {
        showPetEffect(time, true);
        pet.nextHeart = time + .52;
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
    if (moodBlend > .01 && !striking) {
      const crying = typingMood === 'crying';
      const sobbing = Math.sin((time - moodStarted) * 12);
      cat.setReaction({
        crying: crying ? moodBlend : 0,
        sob: crying ? (.29 + .14 * sobbing) * moodBlend : 0,
        squint: (crying ? .79 : .54) * moodBlend,
        yaw: (crying ? .03 * sobbing : -.08) * moodBlend,
        pitch: (crying ? .16 + .06 * sobbing : -.055) * moodBlend,
        roll: (crying ? -.06 + .025 * sobbing : -.107) * moodBlend,
      });
      return;
    }
    const fedAge = time - fedAt;
    const feeding = MathUtils.smoothstep(fedAge, 0, .14) * (1 - MathUtils.smoothstep(fedAge, .75, 1.25));
    if (musicMode && !striking) {
      const beat = time * 5.8;
      const sway = Math.sin(beat);
      const bob = Math.abs(Math.sin(beat));
      const musicBlink = Math.pow(Math.max(0, Math.sin(time * .92)), 30);
      cat.setReaction({
        tension: 0,
        doze: 0,
        happy: 1,
        squint: Math.max(musicBlink, .64 * feeding),
        blush: Math.max(.62, .76 * feeding),
        mouth: Math.max(meow.mouthAmount(), (.33 + .21 * Math.sin(time * 24)) * feeding),
        yaw: .10 * sway,
        pitch: .18 * typingBlend + .02 + .10 * bob + .04 * keyBounce,
        roll: .19 * sway,
      });
      return;
    }
    const irritation = .34 * MathUtils.smoothstep(rewards.anger, 56, 99) * (1 - napBlend) * (1 - feeding);
    cat.setReaction({
      tension: striking ? 0 : Math.max(tension, irritation),
      doze: napBlend,
      happy: 0,
      squint: Math.max(petBlend, napBlend, .64 * feeding),
      blush: Math.max(.92 * petBlend, .76 * feeding),
      mouth: Math.max(meow.mouthAmount(), (.33 + .21 * Math.sin(time * 24)) * feeding),
      yaw: .055 * Math.sin(time * 22) * tension,
      pitch: .26 * typingBlend + .18 * tension + .045 * keyBounce + (.21 + .028 * breath) * napBlend + .15 * strikeBlend,
      roll: .037 * Math.sin(time * 17) * tension - .15 * napBlend,
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
    if (event.button === 0 && rewards.striking && canFeedAt(event.clientX, event.clientY)) {
      const time = clock();
      showPetEffect(time, 'anger');
      cat.flickTail?.();
      return;
    }
    if (event.button === 0 && !pet && overHead()) {
      const time = clock();
      pet = {
        id: event.pointerId, started: time, startX: pointer.x, startY: pointer.y, offsetX: 0, offsetY: 0,
        nextHeart: time + .16, nextMeow: time + .48,
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
    mouse.body.position.x = MathUtils.lerp(mouse.body.position.x, mouseX + mouseOffset.x, settle);
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

    if (musicMode && rewards.coolDown(seconds)) {
      lastInput = time;
      resumeHeldPaws(time);
    }
    const striking = rewards.striking;
    if (!striking && !rewards.dragging && (pressedSide || mouseInUse(time))) {
      reserveMousePaw(time);
      paws.followMouse(mouseSurface(pressedSide), time, Boolean(pressedSide));
    }
    const idleTime = time - lastInput;
    const busy = Boolean(pet || heldKeys.size || mousePresses.size);
    const napping = striking || (!busy && !musicMode && idleTime >= napDelay);
    if (musicMode && !pet && !striking && time >= nextMusicNote) {
      showPetEffect(time, 'note');
      nextMusicNote = time + .86;
    }
    const typingActive = !pet && !striking && (heldKeys.size > 0 || time - lastKeyAt < .62);
    typingBlend = MathUtils.damp(typingBlend, Number(typingActive), typingActive ? 14 : 7, seconds);
    keyBounce = MathUtils.damp(keyBounce, 0, 14, seconds);
    napBlend = MathUtils.damp(napBlend, napping ? 1 : 0, napping ? 3 : 16, seconds);
    strikeBlend = MathUtils.damp(strikeBlend, Number(striking), striking ? 4.5 : 9, seconds);
    const breath = Math.sin(time * 2.1);
    const crouchBlend = Math.max(strikeBlend, napBlend);
    if (!pet && !typingActive && idleTime > .58) cat.setPointer(desktopPointer.x, desktopPointer.y);
    animateReaction(time, seconds, breath);
    cat.setCrouch?.(crouchBlend);
    cat.update(seconds);
    paws.update(time, seconds, striking || napping);
    const resting = busy ? 0 : MathUtils.smoothstep(idleTime, 1.8, 3);
    const bodyHeight = cat.setCrouch ? 1 : 1 - .34 * crouchBlend - .022 * keyBounce;
    cat.model.scale.y = bodyHeight + (.0032 * resting + .004 * napBlend) * breath;
    for (const key of keys.values()) {
      const age = time - key.started;
      const releaseAge = time - key.releaseAt;
      const down = MathUtils.smoothstep(age, .053, .092) * (1 - MathUtils.smoothstep(releaseAge, 0, .085));
      key.cap.position.y = capY - capTravel * down;
      key.cap.material.color.copy(key.tint).lerp(activeColor, 1 - MathUtils.smoothstep(releaseAge, .018, .238));
    }

    camera.updateMatrixWorld();
    cat.draw?.(camera, viewWidth, viewHeight, renderer.getPixelRatio());
    updateNapLetters(seconds);
    if (rewards.enabled) {
      projectHead(0, preset.drawerAnchorY ?? .275, .130);
      const margin = Math.min(98, viewWidth / 2);
      rewards.positionDrawer(
        MathUtils.clamp((projected.x * .5 + .5) * viewWidth, margin, viewWidth - margin),
        MathUtils.clamp((.5 - projected.y * .5) * viewHeight - 4, 34, viewHeight - 12),
      );
    }
    projectHead(-.212, .162, .130);
    rewards.positionAnger(
      MathUtils.clamp((projected.x * .5 + .5) * viewWidth, 28, viewWidth - 28),
      MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 24, viewHeight - 24),
    );
    const speechless = typingMood === 'speechless' ? moodBlend : 0;
    const showAngerMark = rewards.enabled && !striking && !musicMode && (time < tenseUntil || rewards.anger > angerMarkThreshold);
    angerMarkBlend = MathUtils.damp(angerMarkBlend, Number(showAngerMark), showAngerMark ? 13 : 12, seconds);
    if (angerMarkBlend <= .02) {
      if (!angerMark.hidden) angerMark.hidden = true;
      angerMark.style.opacity = 0;
      angerElapsed = 0;
    } else {
      angerElapsed += seconds;
      angerMark.hidden = false;
      angerMark.style.opacity = angerMarkBlend;
      projectHead(.196, .238, .130);
      const separation = 38 * Math.max(napBlend, speechless);
      angerMark.style.left = `${MathUtils.clamp((projected.x * .5 + .5) * viewWidth + separation, 14, viewWidth - 14)}px`;
      angerMark.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 34, viewHeight - 14)}px`;
      angerBursts.forEach((burst, index) => {
        const age = (angerElapsed - index * angerBurstSpacing) % angerBurstCycle;
        const progress = MathUtils.clamp(age / angerBurstLifetime, 0, 1);
        const enter = MathUtils.smoothstep(age, 0, .14);
        const fade = MathUtils.smoothstep(age, .34, angerBurstLifetime);
        const rise = 27 * progress;
        const sway = 2.5 * Math.sin(Math.PI * progress) * (index === 0 ? 1 : -1);
        const tilt = 6 * Math.sin(age * 16) + (index === 0 ? -4 : 4);
        const scale = .78 + .24 * enter - .08 * progress;
        burst.style.opacity = enter * (1 - fade);
        burst.style.transform = `translate(-50%, -50%) translate(${sway}px, ${-rise}px) rotate(${tilt}deg) scale(${scale})`;
      });
    }
    silenceMark.style.opacity = speechless;
    if (speechless > .02) {
      projectHead(.192, .229, .133);
      silenceMark.style.left = `${MathUtils.clamp((projected.x * .5 + .5) * viewWidth, 18, viewWidth - 18)}px`;
      silenceMark.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 12, viewHeight - 12)}px`;
    }
    updateKeyFloaters(time, seconds);
    for (let index = petEffects.length - 1; index >= 0; index--) {
      const item = petEffects[index];
      const progress = (time - item.time) / item.lifetime;
      if (progress < 0) {
        item.effect.style.opacity = 0;
        continue;
      }
      if (progress >= 1) {
        item.effect.remove();
        petEffects.splice(index, 1);
        continue;
      }
      if (item.mode === 'heart' || item.mode === 'anger' || item.mode === 'note') {
        const anchorX = item.mode === 'note' ? item.side * .19 : item.mode === 'anger' ? .196 : .182;
        const anchorY = item.mode === 'note' ? .218 : item.mode === 'anger' ? .236 : .228;
        projectHead(anchorX, anchorY, .134);
        const enter = MathUtils.smoothstep(progress, 0, .15);
        const fade = MathUtils.smoothstep(progress, .36, 1);
        const rise = (item.mode === 'note' ? 36 : item.mode === 'anger' ? 28 : 30) * progress;
        const sway = item.spreadX * (.4 + .6 * progress) + (item.mode === 'note' ? 4.5 : 2.8) * Math.sin(Math.PI * progress) * item.side;
        const tilt = item.tilt + (item.mode === 'note' ? 8 : 6) * Math.sin(progress * Math.PI * 2);
        const scale = (.74 + .28 * enter - .10 * progress) * item.scale;
        item.effect.style.left = `${MathUtils.clamp((.5 + projected.x * .5) * viewWidth, 14, viewWidth - 14)}px`;
        item.effect.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 26, viewHeight - 14)}px`;
        item.effect.style.opacity = enter * (1 - fade);
        item.effect.style.transform = `translate(-50%, -50%) translate(${sway}px, ${-rise}px) rotate(${tilt}deg) scale(${scale})`;
      } else {
        projectHead(.036 + .20 * progress, .047 + .05 * progress, .217);
        item.effect.style.left = `${MathUtils.clamp((projected.x * .5 + .5) * viewWidth, 17, viewWidth - 17)}px`;
        item.effect.style.top = `${MathUtils.clamp((.5 - projected.y * .5) * viewHeight, 16, viewHeight - 16)}px`;
        item.effect.style.opacity = (1 - MathUtils.smoothstep(progress, .66, 1)) * MathUtils.smoothstep(progress, 0, .12);
        item.effect.style.transform = `translate(-50%, -50%) scale(${.70 + Math.min(progress * 2.5, .48)})`;
      }
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
    isHeadPoint(clientX, clientY) {
      const box = stage.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      feedPoint.set(2 * (clientX - box.left) / box.width - 1, 1 - 2 * (clientY - box.top) / box.height);
      return overHead(feedPoint);
    },
    cancelPointerInteractions() {
      stopPetting();
      releaseWindowMouse();
    },
    setCatCoat(coat) {
      cat.setCatCoat?.(coat);
    },
    setEyeStyle(style) {
      cat.setEyeStyle?.(style);
    },
    setHeadphoneStyle(style) {
      cat.setHeadphoneStyle?.(style);
    },
    setKeyboardStyle(style) {
      if (Object.hasOwn(midnightKeyboardStyles, style)) {
        activeColor.set(applyKeyboardStyle(style));
        mouse.applyStyle(midnightKeyboardStyles[style].mouse);
      }
    },
    setMusicMode(enabled) {
      musicMode = Boolean(enabled);
      cat.setMusicMode?.(musicMode);
      if (musicMode) {
        const time = clock();
        lastInput = time;
        nextMusicNote = time + .24;
      }
    },
    setRewardsEnabled(enabled) {
      const wasStriking = rewards.striking;
      rewards.setEnabled(enabled);
      if (!enabled) {
        angerMarkBlend = 0;
        angerElapsed = 0;
        angerMark.hidden = true;
        angerMark.style.opacity = 0;
        if (wasStriking) {
          lastInput = clock();
          resumeHeldPaws(lastInput);
        }
      }
    },
    playDesktopMouseButton(side, down) {
      if (!mouse.buttons.has(side)) return;
      if (down === true && !rewards.dragging) pressMouse(side, `desktop:${side}`);
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

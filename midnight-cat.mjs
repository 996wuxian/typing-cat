import { Bone, Group, MathUtils, Vector2, Vector3 } from 'three';

const black = '#161615';
const ivory = '#fbf8ee';
const silhouetteWidth = 4.6;
const tailWidth = 14.5;
const headRestY = -149;
const bodyCenterX = -.028;

export const midnightCatCoats = {
  black: { label: '小黑猫' },
  siamese: { label: '暹罗猫' },
  tabby: { label: '狸花猫' },
  ragdoll: { label: '布偶猫' },
  orange: { label: '大橘猫' },
  calico: { label: '三花猫' },
};
export const midnightDogCoats = {
  husky: { label: '哈士奇' },
  shiba: { label: '柴犬' },
  corgi: { label: '柯基' },
  golden: { label: '金毛' },
  samoyed: { label: '萨摩耶' },
  border: { label: '边牧' },
};
export const midnightPetCoats = {
  ...midnightCatCoats,
  ...midnightDogCoats,
};

export function isDogCoat(coat = 'black') {
  return Object.hasOwn(midnightDogCoats, coat);
}
export const midnightEyeStyles = {
  xiaohei: { label: '星瞳' },
  starry: { label: '闪亮星星眼' },
  glossy: { label: '纯净大黑瞳' },
  lime: { label: '青柠猫瞳' },
  sapphire: { label: '海蓝猫瞳', excludeCoats: ['black'] },
  amber: { label: '琥珀金瞳' },
  ring: { label: '极简白圈', coats: ['black'] },
};

export function isEyeStyleAllowed(style, coat = 'black') {
  const entry = midnightEyeStyles[style];
  if (!entry) return false;
  if (entry.coats && !entry.coats.includes(coat)) return false;
  if (entry.excludeCoats && entry.excludeCoats.includes(coat)) return false;
  return true;
}

export function getEyeStylesForCoat(coat = 'black') {
  return Object.entries(midnightEyeStyles).filter(([key]) => isEyeStyleAllowed(key, coat));
}
export const midnightHeadphoneStyles = {
  cream: { label: '奶白复古' },
  sony: { label: '曜石降噪' },
  max: { label: '银月头戴' },
  marshall: { label: '摇滚经典' },
  sakura: { label: '樱粉甜心' },
  retro: { label: '复古橙绵' },
};

const catCoatPalettes = {
  black: {
    body: black, head: black, tail: black, arm: black, paw: black,
    rim: null, nose: '#34322f', whisker: '#ece7db', whiskerHalo: '#161615', lid: ivory, ring: ivory,
    eyeRim: null, haunch: '#575450', armEdge: ['#3c3b38', '#64615d'],
  },
  siamese: {
    body: '#f2e6d3', head: '#f2e6d3', tail: '#483228', arm: '#f2e6d3', paw: '#442f25',
    rim: '#5c463a', nose: '#38261f', whisker: '#453229', whiskerHalo: ivory, lid: '#443026', ring: '#443026',
    eyeRim: '#4a352b', haunch: '#b79e85', armEdge: ['#9d806a', '#3a271f'],
  },
  tabby: {
    body: '#b0a69a', head: '#b0a69a', tail: '#a89e92', arm: '#b0a69a', paw: '#f9f5ee',
    rim: '#4c433c', nose: '#d48c90', whisker: '#433a34', whiskerHalo: ivory, lid: '#3f3631', ring: '#3f3631',
    eyeRim: '#483f39', haunch: '#5b5149', armEdge: ['#73685e', '#94887c'],
  },
  ragdoll: {
    body: '#f8f4ee', head: '#f8f4ee', tail: '#826e62', arm: '#f8f4ee', paw: '#fcfaf7',
    rim: '#6c5e56', nose: '#de96a2', whisker: '#594c45', whiskerHalo: ivory, lid: '#4c3f38', ring: '#4c3f38',
    eyeRim: '#5a4c45', haunch: '#a6968c', armEdge: ['#c9beb6', '#9e9087'],
  },
  orange: {
    body: '#f3b165', head: '#f3b165', tail: '#f0aa5c', arm: '#f3b165', paw: '#fff8ed',
    rim: '#805230', nose: '#ea9498', whisker: '#6c4526', whiskerHalo: ivory, lid: '#643d20', ring: '#643d20',
    eyeRim: '#754b2b', haunch: '#c46c2a', armEdge: ['#cc7530', '#e09a56'],
  },
  calico: {
    body: '#f8f4ed', head: '#f8f4ed', tail: '#f6f2eb', arm: '#f8f4ed', paw: '#fcfaf6',
    rim: '#4c423c', nose: '#de929c', whisker: '#473d38', whiskerHalo: ivory, lid: '#3b322e', ring: '#3b322e',
    eyeRim: '#453b36', haunch: '#8e837c', armEdge: ['#bdb3ab', '#8b8078'],
  },
  husky: {
    body: '#fbfaf7', head: '#fbfaf7', tail: '#3c4350', arm: '#fbfaf7', paw: '#ffffff',
    rim: '#363c48', nose: '#242329', whisker: '#3c424f', whiskerHalo: ivory, lid: '#2d333e', ring: '#2d333e',
    eyeRim: '#323845', haunch: '#8b92a0', armEdge: ['#c6cbd4', '#979fac'],
    species: 'dog', earKind: 'husky', muzzle: '#ffffff', muzzleShade: '#e5e8ef', chestFluff: '#ffffff',
  },
  shiba: {
    body: '#df8b3c', head: '#df8b3c', tail: '#da8334', arm: '#df8b3c', paw: '#fff9ee',
    rim: '#6f401c', nose: '#291f1c', whisker: '#5c3b21', whiskerHalo: ivory, lid: '#4a2d18', ring: '#4a2d18',
    eyeRim: '#5c3b21', haunch: '#b36120', armEdge: ['#bc6d28', '#d59c62'],
    species: 'dog', earKind: 'shiba', muzzle: '#fff9ee', muzzleShade: '#ebd8be', chestFluff: '#fff9ee',
  },
  corgi: {
    body: '#e2913c', head: '#e2913c', tail: '#de8a34', arm: '#e2913c', paw: '#ffffff',
    rim: '#734522', nose: '#2a211f', whisker: '#5f3e24', whiskerHalo: ivory, lid: '#4c301b', ring: '#4c301b',
    eyeRim: '#5f3e24', haunch: '#b56822', armEdge: ['#c27630', '#dab07c'],
    species: 'dog', earKind: 'corgi', stubbyTail: true, muzzle: '#ffffff', muzzleShade: '#ecdcc6', chestFluff: '#ffffff',
  },
  golden: {
    body: '#f0be6a', head: '#f0be6a', tail: '#eab55e', arm: '#f0be6a', paw: '#fff6df',
    rim: '#825724', nose: '#3a2419', whisker: '#6c4d26', whiskerHalo: ivory, lid: '#52371a', ring: '#52371a',
    eyeRim: '#664520', haunch: '#c78c3a', armEdge: ['#cc984a', '#dfc08a'],
    species: 'dog', earKind: 'floppy', muzzle: '#fff6df', muzzleShade: '#e6ca99', chestFluff: '#fff6df',
  },
  samoyed: {
    body: '#ffffff', head: '#ffffff', tail: '#ffffff', arm: '#ffffff', paw: '#ffffff',
    rim: '#76757a', nose: '#1f1e22', whisker: '#595551', whiskerHalo: ivory, lid: '#242327', ring: '#242327',
    eyeRim: '#4a494e', haunch: '#d5d2d8', armEdge: ['#d8d6dc', '#bab8c0'],
    species: 'dog', earKind: 'samoyed', muzzle: '#ffffff', muzzleShade: '#ebe9ef', chestFluff: '#ffffff',
  },
  border: {
    body: '#22252c', head: '#ffffff', tail: '#22252c', arm: '#ffffff', paw: '#ffffff',
    rim: '#2d313a', nose: '#1f1e22', whisker: '#353942', whiskerHalo: ivory, lid: '#272b34', ring: '#272b34',
    eyeRim: '#323640', haunch: '#575c68', armEdge: ['#c8ccd4', '#9aa0ac'],
    species: 'dog', earKind: 'tipped', muzzle: '#ffffff', muzzleShade: '#e3e6ed', chestFluff: '#ffffff',
  },
};
const flameTongues = [
  { x: -50, y: -20, height: 112, width: 31, lean: -37, phase: .5 },
  { x: -36, y: -31, height: 170, width: 39, lean: -30, phase: 2 },
  { x: 7, y: -36, height: 174, width: 44, lean: 18, phase: 4.1 },
  { x: 40, y: -32, height: 153, width: 38, lean: 34, phase: 5.4 },
  { x: 54, y: -19, height: 103, width: 30, lean: 38, phase: 3.2 },
];

function fillShape(paint, color) {
  paint.fillStyle = color;
  paint.fill();
}

function ellipse(paint, x, y, rx, ry, color, angle = 0) {
  paint.beginPath();
  paint.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  fillShape(paint, color);
}

function stroke(paint, color, width, path) {
  paint.strokeStyle = color;
  paint.lineWidth = width;
  paint.lineCap = 'round';
  paint.lineJoin = 'round';
  if (path) paint.stroke(path);
  else paint.stroke();
}

function addJoint(parent, name, x, y, z) {
  const bone = new Bone();
  bone.name = name;
  bone.position.set(x, y, z);
  parent.add(bone);
  return bone;
}

function drawFlameLayer(paint, tongues, widthScale, heightScale, color) {
  paint.beginPath();
  for (const tongue of tongues) {
    const { x, y } = tongue;
    const width = tongue.width * widthScale;
    const height = tongue.height * heightScale;
    const lean = tongue.lean * heightScale;
    paint.moveTo(x - .72 * width, y);
    paint.bezierCurveTo(x - width, y - .18 * height, x - .92 * width, y - .38 * height,
      x + .12 * lean - .46 * width, y - .51 * height);
    paint.bezierCurveTo(x + .32 * lean - .12 * width, y - .63 * height,
      x + .95 * lean - .32 * width, y - .85 * height, x + lean, y - height);
    paint.bezierCurveTo(x + .93 * lean + .06 * width, y - .8 * height,
      x + .47 * lean + .23 * width, y - .65 * height, x + .36 * lean + .47 * width, y - .49 * height);
    paint.bezierCurveTo(x + .20 * lean + .89 * width, y - .34 * height,
      x + .98 * width, y - .16 * height, x + .72 * width, y);
    paint.closePath();
  }
  fillShape(paint, color);
}

function drawFire(paint, amount, time) {
  const opacity = MathUtils.smoothstep(amount, .025, .88);
  const heightScale = .72 + .28 * amount;
  const tongues = flameTongues.map(tongue => ({
    ...tongue,
    height: tongue.height + 7 * Math.sin(time * 8 + tongue.phase) + 4 * Math.sin(time * 15 + tongue.phase),
    lean: tongue.lean + 7 * Math.sin(time * 5.5 + tongue.phase),
  }));

  paint.save();
  paint.translate(0, -103);
  paint.scale(1, .85);
  paint.globalAlpha = opacity * .58;
  const glow = paint.createRadialGradient(0, 0, 23, 0, 0, 111);
  glow.addColorStop(0, '#ffab54');
  glow.addColorStop(.61, '#ff691d71');
  glow.addColorStop(1, '#ff521700');
  ellipse(paint, 0, 0, 111, 111, glow);
  paint.restore();

  paint.save();
  paint.globalAlpha = opacity;
  const outer = paint.createLinearGradient(0, -216, 0, -17);
  outer.addColorStop(0, '#ffba4c');
  outer.addColorStop(.39, '#ff892e');
  outer.addColorStop(.84, '#f35a24');
  outer.addColorStop(1, '#e8441800');
  drawFlameLayer(paint, tongues, 1, heightScale, outer);

  const inner = paint.createLinearGradient(0, -166, 0, -17);
  inner.addColorStop(0, '#fff4c5');
  inner.addColorStop(.51, '#ffd572');
  inner.addColorStop(.84, '#ffad3e');
  inner.addColorStop(1, '#ff852200');
  drawFlameLayer(paint, tongues, .68, heightScale * .74, inner);

  for (let index = 0; index < 8; index++) {
    const side = index % 2 === 0 ? -1 : 1;
    const tier = Math.floor(index / 2);
    const travel = (time * (.56 + .035 * index) + index * .27) % 1;
    const x = side * (68 + 5 * tier + travel * 15) + 4 * Math.sin(time * 4.8 + index);
    const y = -60 - tier * 21 - travel * (32 + tier * 5);
    const radius = 1.3 + .25 * tier;
    paint.globalAlpha = opacity * MathUtils.smoothstep(travel, 0, .19)
      * (1 - MathUtils.smoothstep(travel, .54, 1));
    ellipse(paint, x, y, radius, radius * 1.6, index % 3 === 0 ? '#fff2ba' : '#ffac50', side * .33);
  }
  paint.restore();
}

const standingBodyStart = [-25, -130];
const standingBodySegs = [
  [-35, -116, -54, -88, -55, -58],
  [-58, -39, -54, -22, -45, -13],
  [-53, -5, -50, 3, -40, 3],
  [-35, 3, -31, 1, -28, -4],
  [-13, -1, 13, -1, 28, -4],
  [31, 1, 35, 3, 40, 3],
  [50, 3, 53, -5, 45, -13],
  [55, -25, 58, -39, 54, -60],
  [50, -86, 36, -116, 26, -130],
];
const dogStandingBodyStart = [-32, -125];
const dogStandingBodySegs = [
  [-45, -112, -56, -86, -54, -56],
  [-53, -34, -50, -19, -44, -10],
  [-52, -2, -49, 4, -39, 4],
  [-34, 4, -30, 1, -27, -4],
  [-13, -1, 13, -1, 27, -4],
  [30, 1, 34, 4, 39, 4],
  [49, 4, 52, -2, 44, -10],
  [50, -19, 53, -34, 54, -56],
  [56, -86, 45, -112, 32, -125],
];
const lyingBodyStart = [-30, -42];
const lyingBodySegs = [
  [-44, -36, -55, -24, -54, -9],
  [-53, -1, -48, 4, -40, 4],
  [-33, 4, -24, 4, -14, 4],
  [-2, 4, 12, 4, 24, 4],
  [34, 4, 42, 5, 48, 4],
  [58, 4, 66, 1, 68, -8],
  [71, -19, 69, -36, 58, -47],
  [46, -59, 28, -66, 8, -64],
  [-8, -62, -21, -52, -30, -42],
];

const carriedBodyStart = [-21, -133];

function buildCarriedBodySegs(kickLx, kickLy, kickRx, kickRy) {
  return [
    [-30, -110, -38, -80, -39, -46],
    [-41, -18, -39, 1, -34 + kickLx * .4, 14 + kickLy * .3],
    [-35 + kickLx, 25 + kickLy * .7, -32 + kickLx, 38 + kickLy, -22 + kickLx, 38 + kickLy],
    [-13 + kickLx * .8, 38 + kickLy, -11 + kickLx * .4, 26 + kickLy * .5, -12, 12],
    [-5, 16, 5, 16, 12, 12],
    [11 + kickRx * .4, 26 + kickRy * .5, 13 + kickRx * .8, 38 + kickRy, 22 + kickRx, 38 + kickRy],
    [32 + kickRx, 38 + kickRy, 35 + kickRx, 25 + kickRy * .7, 34 + kickRx * .4, 14 + kickRy * .3],
    [39, 1, 41, -18, 39, -46],
    [38, -80, 30, -110, 21, -133],
  ];
}

function createBodyPath(sleep, carry = 0, kickLx = 0, kickLy = 0, kickRx = 0, kickRy = 0, isDog = false, stepL = 0, stepR = 0) {
  const path = new Path2D();
  const standStart = isDog ? dogStandingBodyStart : standingBodyStart;
  const standSegs = isDog ? dogStandingBodySegs : standingBodySegs;
  const baseStartX = MathUtils.lerp(standStart[0], lyingBodyStart[0], sleep);
  const baseStartY = MathUtils.lerp(standStart[1], lyingBodyStart[1], sleep);
  path.moveTo(
    MathUtils.lerp(baseStartX, carriedBodyStart[0], carry),
    MathUtils.lerp(baseStartY, carriedBodyStart[1], carry),
  );
  const carriedSegs = carry > .002 ? buildCarriedBodySegs(kickLx, kickLy, kickRx, kickRy) : null;
  for (let i = 0; i < standSegs.length; i++) {
    const a = standSegs[i];
    const b = lyingBodySegs[i];
    let x1 = MathUtils.lerp(a[0], b[0], sleep);
    let y1 = MathUtils.lerp(a[1], b[1], sleep);
    let x2 = MathUtils.lerp(a[2], b[2], sleep);
    let y2 = MathUtils.lerp(a[3], b[3], sleep);
    let x3 = MathUtils.lerp(a[4], b[4], sleep);
    let y3 = MathUtils.lerp(a[5], b[5], sleep);
    if (stepL > .01 && (i === 2 || i === 3)) {
      if (i === 2) { y1 -= stepL * .5; y2 -= stepL; y3 -= stepL; }
      else { y1 -= stepL; y2 -= stepL * .55; }
    } else if (stepR > .01 && (i === 5 || i === 6)) {
      if (i === 5) { y1 -= stepR * .55; y2 -= stepR; y3 -= stepR; }
      else { y1 -= stepR; y2 -= stepR * .5; }
    }
    if (carriedSegs) {
      const c = carriedSegs[i];
      x1 = MathUtils.lerp(x1, c[0], carry);
      y1 = MathUtils.lerp(y1, c[1], carry);
      x2 = MathUtils.lerp(x2, c[2], carry);
      y2 = MathUtils.lerp(y2, c[3], carry);
      x3 = MathUtils.lerp(x3, c[4], carry);
      y3 = MathUtils.lerp(y3, c[5], carry);
    }
    path.bezierCurveTo(x1, y1, x2, y2, x3, y3);
  }
  path.closePath();
  return path;
}

const bodyShape = createBodyPath(0);
const dogBodyShape = createBodyPath(0, 0, 0, 0, 0, 0, true);

const headShape = new Path2D();
headShape.moveTo(0, 34);
headShape.bezierCurveTo(-14, 34, -28, 33, -36, 27);
headShape.bezierCurveTo(-49, 20, -52, 2, -44, -15);
headShape.bezierCurveTo(-41, -30, -37, -52, -30, -57);
headShape.bezierCurveTo(-24, -61, -18, -48, -12, -38);
headShape.bezierCurveTo(-5, -39, 5, -39, 12, -38);
headShape.bezierCurveTo(18, -48, 24, -61, 30, -57);
headShape.bezierCurveTo(37, -52, 41, -30, 44, -15);
headShape.bezierCurveTo(52, 2, 49, 20, 36, 27);
headShape.bezierCurveTo(28, 33, 14, 34, 0, 34);
headShape.closePath();

// Husky: smooth plump dog cheeks + tall sturdy rounded-tip wolf ears
const dogHuskyHeadShape = new Path2D();
dogHuskyHeadShape.moveTo(0, 35);
dogHuskyHeadShape.bezierCurveTo(-18, 35, -35, 31, -44, 21);
dogHuskyHeadShape.bezierCurveTo(-51, 12, -51, -4, -44, -19);
dogHuskyHeadShape.bezierCurveTo(-42, -37, -37, -59, -28, -63);
dogHuskyHeadShape.bezierCurveTo(-20, -66, -14, -50, -10, -40);
dogHuskyHeadShape.bezierCurveTo(-4, -41.5, 4, -41.5, 10, -40);
dogHuskyHeadShape.bezierCurveTo(14, -50, 20, -66, 28, -63);
dogHuskyHeadShape.bezierCurveTo(37, -59, 42, -37, 44, -19);
dogHuskyHeadShape.bezierCurveTo(51, -4, 51, 12, 44, 21);
dogHuskyHeadShape.bezierCurveTo(35, 31, 18, 35, 0, 35);
dogHuskyHeadShape.closePath();

// Shiba: iconic squishy wide mochi cheeks + compact thick tilted Shiba triangle ears
const dogShibaHeadShape = new Path2D();
dogShibaHeadShape.moveTo(0, 35);
dogShibaHeadShape.bezierCurveTo(-22, 35, -40, 32, -49, 22);
dogShibaHeadShape.bezierCurveTo(-56, 13, -55, -2, -46, -16);
dogShibaHeadShape.bezierCurveTo(-47, -30, -45, -49, -35, -53);
dogShibaHeadShape.bezierCurveTo(-26, -56, -19, -45, -14, -39);
dogShibaHeadShape.bezierCurveTo(-6, -41.5, 6, -41.5, 14, -39);
dogShibaHeadShape.bezierCurveTo(19, -45, 26, -56, 35, -53);
dogShibaHeadShape.bezierCurveTo(45, -49, 47, -30, 46, -16);
dogShibaHeadShape.bezierCurveTo(55, -2, 56, 13, 49, 22);
dogShibaHeadShape.bezierCurveTo(40, 32, 22, 35, 0, 35);
dogShibaHeadShape.closePath();

// Corgi: HUGE wide rounded-oval Pembroke Corgi ears + cheerful fox-like cheeks
const dogCorgiHeadShape = new Path2D();
dogCorgiHeadShape.moveTo(0, 35);
dogCorgiHeadShape.bezierCurveTo(-17, 35, -32, 31, -41, 22);
dogCorgiHeadShape.bezierCurveTo(-49, 12, -49, -3, -43, -17);
dogCorgiHeadShape.bezierCurveTo(-55, -33, -59, -63, -44, -71);
dogCorgiHeadShape.bezierCurveTo(-29, -77, -16, -55, -10, -39);
dogCorgiHeadShape.bezierCurveTo(-4, -40.5, 4, -40.5, 10, -39);
dogCorgiHeadShape.bezierCurveTo(16, -55, 29, -77, 44, -71);
dogCorgiHeadShape.bezierCurveTo(59, -63, 55, -33, 43, -17);
dogCorgiHeadShape.bezierCurveTo(49, -3, 49, 12, 41, 22);
dogCorgiHeadShape.bezierCurveTo(32, 31, 17, 35, 0, 35);
dogCorgiHeadShape.closePath();

// Samoyed: fluffy cloud-mane cheek tufts + compact rounded snow-white spitz ears
const dogSamoyedHeadShape = new Path2D();
dogSamoyedHeadShape.moveTo(0, 37);
dogSamoyedHeadShape.bezierCurveTo(-19, 37, -35, 34, -44, 26);
dogSamoyedHeadShape.bezierCurveTo(-53, 24, -58, 16, -53, 9);
dogSamoyedHeadShape.bezierCurveTo(-59, 2, -57, -10, -47, -18);
dogSamoyedHeadShape.bezierCurveTo(-46, -34, -41, -52, -31, -54);
dogSamoyedHeadShape.bezierCurveTo(-22, -56, -16, -45, -11, -39);
dogSamoyedHeadShape.bezierCurveTo(-5, -43, 5, -43, 11, -39);
dogSamoyedHeadShape.bezierCurveTo(16, -45, 22, -56, 31, -54);
dogSamoyedHeadShape.bezierCurveTo(41, -52, 46, -34, 47, -18);
dogSamoyedHeadShape.bezierCurveTo(57, -10, 59, 2, 53, 9);
dogSamoyedHeadShape.bezierCurveTo(58, 16, 53, 24, 44, 26);
dogSamoyedHeadShape.bezierCurveTo(35, 34, 19, 37, 0, 37);
dogSamoyedHeadShape.closePath();

// Golden: soft domed retriever skull with fuller gentle retriever jowls
const dogGoldenHeadShape = new Path2D();
dogGoldenHeadShape.moveTo(0, 37);
dogGoldenHeadShape.bezierCurveTo(-20, 37, -34, 34, -41, 25);
dogGoldenHeadShape.bezierCurveTo(-48, 16, -48, -3, -43, -19);
dogGoldenHeadShape.bezierCurveTo(-38, -36, -22, -45, 0, -45);
dogGoldenHeadShape.bezierCurveTo(22, -45, 38, -36, 43, -19);
dogGoldenHeadShape.bezierCurveTo(48, -3, 48, 16, 41, 25);
dogGoldenHeadShape.bezierCurveTo(34, 34, 20, 37, 0, 37);
dogGoldenHeadShape.closePath();

// Border Collie: sleek agile collie head with subtle cheek ruff
const dogBorderHeadShape = new Path2D();
dogBorderHeadShape.moveTo(0, 36);
dogBorderHeadShape.bezierCurveTo(-17, 36, -32, 32, -40, 23);
dogBorderHeadShape.bezierCurveTo(-49, 17, -50, 2, -44, -15);
dogBorderHeadShape.bezierCurveTo(-40, -33, -24, -43, 0, -43);
dogBorderHeadShape.bezierCurveTo(24, -43, 40, -33, 44, -15);
dogBorderHeadShape.bezierCurveTo(50, 2, 49, 17, 40, 23);
dogBorderHeadShape.bezierCurveTo(32, 32, 17, 36, 0, 36);
dogBorderHeadShape.closePath();

function getHeadShape(coatKey) {
  const earKind = catCoatPalettes[coatKey]?.earKind;
  if (earKind === 'husky') return dogHuskyHeadShape;
  if (earKind === 'shiba') return dogShibaHeadShape;
  if (earKind === 'corgi') return dogCorgiHeadShape;
  if (earKind === 'samoyed') return dogSamoyedHeadShape;
  if (earKind === 'floppy') return dogGoldenHeadShape;
  if (earKind === 'tipped') return dogBorderHeadShape;
  return headShape;
}

function drawDogEarFlaps(paint, coatKey, mode, bounce = 0) {
  const coat = catCoatPalettes[coatKey];
  if (!coat || (coat.earKind !== 'floppy' && coat.earKind !== 'tipped')) return;
  for (const side of [-1, 1]) {
    paint.save();
    if (coat.earKind === 'floppy') {
      // Wide, velvety triangular-rounded Golden Retriever drooping ears
      paint.translate(side * 29, -35);
      paint.rotate(side * (.05 + bounce * .07));
      paint.beginPath();
      paint.moveTo(-side * 2, 2);
      paint.bezierCurveTo(side * 12, -6, side * 25, 2, side * 28, 22);
      paint.bezierCurveTo(side * 31, 41, side * 23, 58, side * 12, 56);
      paint.bezierCurveTo(side * 4, 54, side * 2, 38, side * 3, 22);
      paint.bezierCurveTo(side * 3, 12, 0, 5, -side * 2, 2);
      paint.closePath();
      if (mode === 'outline') {
        stroke(paint, ivory, silhouetteWidth);
        if (coat.rim) stroke(paint, coat.rim, 2.0);
      } else {
        const earGrad = paint.createLinearGradient(0, -2, 0, 56);
        earGrad.addColorStop(0, '#dfa046');
        earGrad.addColorStop(.55, '#cf8b32');
        earGrad.addColorStop(1, '#bb7622');
        fillShape(paint, earGrad);
        // Soft feathery sheen curve along outer ear
        paint.beginPath();
        paint.moveTo(side * 13, 6);
        paint.quadraticCurveTo(side * 22, 24, side * 17, 46);
        paint.globalAlpha = .28;
        stroke(paint, '#fff3d6', 2.0);
        paint.globalAlpha = 1;
        if (coat.rim) {
          paint.globalAlpha = .52;
          stroke(paint, coat.rim, 1.5);
          paint.globalAlpha = 1;
        }
      }
    } else {
      // Classic alert Border Collie tall perked base + crisp folded-over ear tip
      paint.translate(side * 18, -36);
      paint.rotate(side * bounce * .06);
      // 1. Perked upright ear base
      paint.beginPath();
      paint.moveTo(-side * 6, 4);
      paint.bezierCurveTo(-side * 2, -14, side * 7, -27, side * 17, -24);
      paint.bezierCurveTo(side * 25, -21, side * 26, -6, side * 22, 8);
      paint.closePath();
      if (mode === 'outline') {
        stroke(paint, ivory, silhouetteWidth);
        if (coat.rim) stroke(paint, coat.rim, 2.0);
      } else {
        fillShape(paint, '#20232a');
        ellipse(paint, side * 12, -8, 4.6, 7.2, '#b8a2a8', side * .16);
      }
      // 2. Crisp folded-over triangular Collie ear tip draping outward
      paint.beginPath();
      paint.moveTo(side * 5, -18);
      paint.bezierCurveTo(side * 15, -26, side * 28, -22, side * 34, -8);
      paint.bezierCurveTo(side * 36, -2, side * 31, 4, side * 25, 1);
      paint.bezierCurveTo(side * 19, -2, side * 12, -10, side * 5, -18);
      paint.closePath();
      if (mode === 'outline') {
        stroke(paint, ivory, silhouetteWidth);
        if (coat.rim) stroke(paint, coat.rim, 2.0);
      } else {
        fillShape(paint, '#20232a');
        paint.beginPath();
        paint.moveTo(side * 8, -17);
        paint.quadraticCurveTo(side * 21, -21, side * 30, -8);
        paint.globalAlpha = .40;
        stroke(paint, '#727b90', 1.45);
        paint.globalAlpha = 1;
      }
    }
    paint.restore();
  }
}

const tailLengths = [20, 20, 19, 18, 17];
const stubbyTailLengths = [10, 9];
const tailRestRel = [.06, -.44, -.56, -.14, .20];
const dogTailRestRel = [-.18, -.54, -.64, -.52, -.34];
const tailSleepRel = [.26, .08, -.52, -.78, -.68];
const tailCarryRel = [.74, .26, -.54, -.76, -.64];
const tailWindRel = [-.10, -.50, -.58, -.20, .14];
const tailHitInit = [.41, .73, .83, .71, .39];
const tailMoods = [
  { side: 1, rel: [.06, -.44, -.56, -.14, .20], min: 2.8, max: 4.6 },
  { side: 1, rel: [-.04, -.56, -.76, -.82, -.78], min: 2.2, max: 3.8 },
  { side: 1, rel: [.28, -.32, -.46, -.36, -.12], min: 2.2, max: 3.6 },
  { side: -1, rel: [-.02, -.48, -.60, -.26, .14], min: 2.8, max: 4.4 },
  { side: -1, rel: [-.04, -.54, -.72, -.76, -.68], min: 2.2, max: 3.8 },
];
const tailKDown = [1650, 1480, 1280, 1120, 980];
const tailDDown = [52, 48, 43, 39, 36];
const tailKUp = [540, 450, 385, 335, 295];
const tailDUp = [26, 23, 21, 19, 17];
const tailWindTime = .020;
const tailHold = .18;
const tailMinimumHold = .135;
const tailImpactDuration = .46;
const tailRayAngles = [-2.42, -1.86, -1.28, -.72];
const tailPuffs = [
  [-1.05, .85, 4.2],
  [1.05, .80, 3.8],
  [-.42, 1.35, 3.1],
  [.48, 1.25, 2.7],
];
const tailSparkles = [
  [-18, -10, 5.0, -.18],
  [19, -13, 4.2, .22],
];

function computeTailChain(relAngles, rootX = 45, rootY = -34, mirror = 1, lengths = tailLengths) {
  const pts = [[rootX, rootY]];
  let x = rootX;
  let y = rootY;
  let angle = 0;
  for (let i = 0; i < lengths.length; i++) {
    angle += relAngles[i];
    x += lengths[i] * Math.cos(angle) * mirror;
    y += lengths[i] * Math.sin(angle);
    pts.push([x, y]);
  }
  return pts;
}

function solveTailHit(targetX, targetY) {
  const rel = [...tailHitInit];
  for (let iter = 0; iter < 12; iter++) {
    let pts = computeTailChain(rel);
    const tip = pts[pts.length - 1];
    if (Math.hypot(targetX - tip[0], targetY - tip[1]) < .3) break;
    for (let j = 0; j < rel.length; j++) {
      const [px, py] = pts[j];
      const curTip = pts[pts.length - 1];
      const curAngle = Math.atan2(curTip[1] - py, curTip[0] - px);
      const tgtAngle = Math.atan2(targetY - py, targetX - px);
      const delta = Math.atan2(Math.sin(tgtAngle - curAngle), Math.cos(tgtAngle - curAngle));
      const weight = j === 0 ? .14 : j === 1 ? .24 : .28;
      rel[j] += delta * weight;
      pts = computeTailChain(rel);
    }
  }
  return rel;
}

function sampleTailSpline(pts, stepsPerSeg = 7) {
  const samples = [];
  let sx = pts[0][0];
  let sy = pts[0][1];
  for (let i = 1; i < pts.length - 1; i++) {
    const cx = pts[i][0];
    const cy = pts[i][1];
    const ex = i === pts.length - 2 ? pts[i + 1][0] : (cx + pts[i + 1][0]) * .5;
    const ey = i === pts.length - 2 ? pts[i + 1][1] : (cy + pts[i + 1][1]) * .5;
    for (let k = i === 1 ? 0 : 1; k <= stepsPerSeg; k++) {
      const t = k / stepsPerSeg;
      const mt = 1 - t;
      samples.push([
        mt * mt * sx + 2 * mt * t * cx + t * t * ex,
        mt * mt * sy + 2 * mt * t * cy + t * t * ey,
      ]);
    }
    sx = ex;
    sy = ey;
  }
  return samples;
}

function buildTailPath(samples, radius) {
  const n = samples.length;
  const left = [];
  const right = [];
  for (let i = 0; i < n; i++) {
    const prev = samples[Math.max(0, i - 1)];
    const next = samples[Math.min(n - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * radius;
    const ny = (dx / len) * radius;
    left.push([samples[i][0] + nx, samples[i][1] + ny]);
    right.push([samples[i][0] - nx, samples[i][1] - ny]);
  }
  const path = new Path2D();
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) path.lineTo(left[i][0], left[i][1]);
  const tip = samples[n - 1];
  const tipPrev = samples[n - 2];
  const tipAng = Math.atan2(tip[1] - tipPrev[1], tip[0] - tipPrev[0]);
  path.arc(tip[0], tip[1], radius, tipAng + Math.PI * .5, tipAng - Math.PI * .5, true);
  for (let i = n - 2; i >= 0; i--) path.lineTo(right[i][0], right[i][1]);
  const root = samples[0];
  const rootNext = samples[1];
  const rootAng = Math.atan2(rootNext[1] - root[1], rootNext[0] - root[0]);
  path.arc(root[0], root[1], radius, rootAng - Math.PI * .5, rootAng + Math.PI * .5, true);
  path.closePath();
  return path;
}

function buildFluffyDogTailPath(samples, baseRadius, stubby = false) {
  const n = samples.length;
  const left = [];
  const right = [];
  const radii = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const prev = samples[Math.max(0, i - 1)];
    const next = samples[Math.min(n - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const bell = Math.sin(t * Math.PI);
    const taper = stubby
      ? (.58 + .54 * bell)
      : (.16 + .44 * (1 - t) * (1 - t) + .96 * Math.pow(Math.max(0, bell), .92) * (1 - .28 * t));
    const r = baseRadius * taper;
    radii.push(r);
    left.push([samples[i][0] + nx * r, samples[i][1] + ny * r]);
    right.push([samples[i][0] - nx * r, samples[i][1] - ny * r]);
  }
  const path = new Path2D();
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) path.lineTo(left[i][0], left[i][1]);
  const tip = samples[n - 1];
  const tipPrev = samples[n - 2];
  const tipAng = Math.atan2(tip[1] - tipPrev[1], tip[0] - tipPrev[0]);
  const tipR = radii[n - 1];
  if (stubby) {
    path.arc(tip[0], tip[1], tipR, tipAng + Math.PI * .5, tipAng - Math.PI * .5, true);
  } else {
    const apexX = tip[0] + Math.cos(tipAng) * (tipR * 2.8);
    const apexY = tip[1] + Math.sin(tipAng) * (tipR * 2.8);
    path.quadraticCurveTo(apexX, apexY, right[n - 1][0], right[n - 1][1]);
  }
  for (let i = n - 2; i >= 0; i--) path.lineTo(right[i][0], right[i][1]);
  const root = samples[0];
  const rootNext = samples[1];
  const rootAng = Math.atan2(rootNext[1] - root[1], rootNext[0] - root[0]);
  path.arc(root[0], root[1], radii[0], rootAng - Math.PI * .5, rootAng + Math.PI * .5, true);
  path.closePath();
  return path;
}

function drawTailChain(paint, pts, color, width) {
  paint.beginPath();
  paint.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const endX = i === pts.length - 2 ? pts[i + 1][0] : (pts[i][0] + pts[i + 1][0]) * .5;
    const endY = i === pts.length - 2 ? pts[i + 1][1] : (pts[i][1] + pts[i + 1][1]) * .5;
    paint.quadraticCurveTo(pts[i][0], pts[i][1], endX, endY);
  }
  stroke(paint, color, width);
}

function drawSparkle(paint, x, y, radius, angle, color) {
  const inner = radius * .28;
  paint.save();
  paint.translate(x, y);
  paint.rotate(angle);
  paint.beginPath();
  paint.moveTo(0, -radius);
  paint.lineTo(inner, -inner);
  paint.lineTo(radius, 0);
  paint.lineTo(inner, inner);
  paint.lineTo(0, radius);
  paint.lineTo(-inner, inner);
  paint.lineTo(-radius, 0);
  paint.lineTo(-inner, -inner);
  paint.closePath();
  fillShape(paint, color);
  paint.restore();
}

function drawTailImpacts(paint, impacts, now) {
  for (let i = impacts.length - 1; i >= 0; i--) {
    const item = impacts[i];
    const age = (now - item.started) / tailImpactDuration;
    if (age >= 1) {
      impacts.splice(i, 1);
      continue;
    }
    if (age <= 0) continue;
    const { x, y, drift } = item;
    const ease = 1 - (1 - age) * (1 - age);

    paint.save();
    // 1. Subtle impact ripple directly on the Spacebar surface
    if (age < .48) {
      const rp = age / .48;
      const rease = 1 - (1 - rp) * (1 - rp);
      paint.globalAlpha = (1 - rp) * .72;
      paint.beginPath();
      paint.ellipse(x, y + 1, 9 + 20 * rease, 2.4 + 4.4 * rease, 0, 0, Math.PI * 2);
      stroke(paint, ivory, 1.8 * (1 - rp * .45));
    }

    // 2. Crisp tapered comic impact rays shooting outward & upward
    if (age < .62) {
      const sp = age / .62;
      const sease = 1 - (1 - sp) ** 3;
      paint.globalAlpha = (1 - sp * sp) * .95;
      for (const a of tailRayAngles) {
        const r0 = 7 + 18 * sease;
        const r1 = 14 + 24 * sease - 8 * sp;
        if (r1 <= r0) continue;
        paint.beginPath();
        paint.moveTo(x + Math.cos(a) * r0, y - 4 + Math.sin(a) * r0);
        paint.lineTo(x + Math.cos(a) * r1, y - 4 + Math.sin(a) * r1);
        stroke(paint, '#ffd66b', 2.2 * (1 - sp * .55));
      }
    }

    // 3. Soft cream air puffs floating gently upward & outward
    for (const [dxScale, liftScale, baseRadius] of tailPuffs) {
      const r = baseRadius * (1 - .62 * age);
      if (r <= .4) continue;
      const px = x + dxScale * (11 + 17 * ease) + drift * age;
      const py = y - 4 - liftScale * (16 * ease + 11 * age);
      paint.globalAlpha = (1 - MathUtils.smoothstep(age, .35, 1)) * .92;
      paint.beginPath();
      paint.arc(px, py, r, 0, Math.PI * 2);
      fillShape(paint, ivory);
      paint.globalAlpha *= .35;
      stroke(paint, '#34323b', .85);
    }

    // 4. Tiny warm-gold 4-point sparkles drifting upward
    for (const [sx, sy, baseRadius, spin] of tailSparkles) {
      const r = baseRadius * Math.sin(Math.PI * Math.min(1, age * 1.12));
      if (r <= .5) continue;
      const cx = x + sx * (.65 + .55 * ease) + drift * age;
      const cy = y + sy - 20 * ease;
      paint.globalAlpha = (1 - MathUtils.smoothstep(age, .55, 1)) * .96;
      drawSparkle(paint, cx, cy, r, spin * age * 4, '#ffd45e');
    }
    paint.restore();
  }
}

function drawFootShadow(paint, x, y) {
  paint.save();
  paint.translate(x, y + 2);
  paint.scale(1, .37);
  const shadow = paint.createRadialGradient(0, 0, 1, 0, 0, 16);
  shadow.addColorStop(0, '#12131958');
  shadow.addColorStop(1, '#12131900');
  ellipse(paint, 0, 0, 16, 16, shadow);
  paint.restore();
}

function resolveFaceGaze(gaze, tension, closed) {
  const open = 1 - closed;
  const angry = tension * open;
  const x = gaze.x * open * (1 - .35 * angry);
  const y = (MathUtils.lerp(gaze.y, Math.max(gaze.y, 8.5), angry) + 6.5 * angry) * open;
  return { x, y, angry };
}

function drawEye(paint, side, eyeOffset, gaze, face, eyeStyle, elapsed, coat) {
  const isDog = coat.species === 'dog';
  const carrySquint = face.carrySquint ?? 0;
  const carry = face.carry ?? 0;
  const eating = face.eating ?? 0;
  const eager = face.eager ?? 0;
  const closed = Math.max(face.closed, face.crying, carrySquint);
  const lid = MathUtils.smoothstep(closed, .62, .94);
  const { x, y, angry } = eyeOffset;
  const bigBlack = eyeStyle === 'xiaohei' || eyeStyle === 'starry' || eyeStyle === 'glossy';
  const jewelIris = eyeStyle === 'amber' || eyeStyle === 'sapphire';
  const rx = bigBlack ? 12.5 : jewelIris ? 11.8 : eyeStyle === 'lime' ? 11.4 : 10.7;
  const ry = bigBlack ? 12.7 : jewelIris ? 12.1 : eyeStyle === 'lime' ? 11.8 : 11.5;
  paint.save();
  if (isDog) {
    paint.translate(side * (16.8 - .9 * angry) + x * .84, y * .78 - 7.5);
    paint.scale(.79, .80);
  } else {
    paint.translate(side * ((bigBlack ? 18.8 : 18.2) - 1.1 * angry) + x, y);
  }

  if (lid < 1) {
    const delightBoost = Math.max(eager, eating * (1 - lid));
    const rw = rx * (1 + (bigBlack ? .04 : .06) * angry + .05 * carry + .045 * delightBoost);
    const rh = ry * (1 - .86 * closed) * (1 - (bigBlack ? .06 : .08) * angry) * (1 + .06 * carry + .055 * delightBoost);
    const tremorX = .55 * Math.sin(elapsed * 29 + side * 1.4) * carry;
    const tremorY = .40 * Math.cos(elapsed * 23 - side) * carry;
    const pupilScale = 1 - .20 * carry;
    paint.save();
    paint.globalAlpha = 1 - lid;
    if (angry > .01) {
      const tilt = -side * .56 * Math.sqrt(angry);
      const browY = MathUtils.lerp(-rh - 4, bigBlack ? .4 : (eyeStyle === 'lime' || jewelIris) ? .2 : .8, angry);
      paint.rotate(tilt);
      paint.beginPath();
      paint.rect(-rw - 8, browY, (rw + 8) * 2, rh * 2 + 16);
      paint.clip();
      paint.rotate(-tilt);
    }
    const happyLift = face.happy > .02 && face.crying <= .02 && carry <= .02 ? face.happy : 0;
    const happyCheekY = happyLift ? MathUtils.lerp(rh + 9, 13.8, happyLift) : 0;
    if (happyLift) {
      paint.beginPath();
      paint.rect(-rw - 10, -rh - 10, (rw + 10) * 2, (rh + 10) * 2);
      paint.ellipse(0, happyCheekY, rw + 2.4, 8.1, 0, 0, Math.PI * 2);
      paint.clip('evenodd');
    }

    if (eyeStyle === 'ring') {
      paint.beginPath();
      paint.ellipse(tremorX * .6, tremorY * .6, rw, rh, 0, 0, Math.PI * 2);
      stroke(paint, coat.ring, 2.7 + .6 * angry);
    } else if (eyeStyle === 'lime') {
      paint.beginPath();
      paint.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      if (coat.eyeRim) stroke(paint, coat.eyeRim, 2.2);
      fillShape(paint, '#daf478');
      paint.clip();
      const open = 1 - closed;
      const pupilX = MathUtils.clamp(gaze.x * .44 * open + tremorX, -4.4, 4.4);
      const pupilY = MathUtils.clamp(MathUtils.lerp(gaze.y * .36 + .7, 1.3, angry) * open + tremorY, -3.6, 3.8);
      ellipse(paint, pupilX, pupilY, (5.4 - 1.5 * angry) * pupilScale,
        (7.8 - .7 * angry) * (1 - .72 * closed) * pupilScale, black);
      if (closed < .55) {
        ellipse(paint, pupilX - 1.7, pupilY - 2.6, 1.4, 1.4, '#f7ffdb');
      }
    } else if (jewelIris) {
      const isAmber = eyeStyle === 'amber';
      paint.beginPath();
      paint.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      if (coat.eyeRim) stroke(paint, coat.eyeRim, 2.2);
      const irisGrad = paint.createLinearGradient(0, -rh, 0, rh);
      if (isAmber) {
        irisGrad.addColorStop(0, '#dc8622');
        irisGrad.addColorStop(.52, '#f7b640');
        irisGrad.addColorStop(1, '#ffe68c');
      } else {
        irisGrad.addColorStop(0, '#3274e0');
        irisGrad.addColorStop(.52, '#68b2fc');
        irisGrad.addColorStop(1, '#bde9ff');
      }
      fillShape(paint, irisGrad);
      paint.clip();
      ellipse(paint, 0, rh * .48, rw * .72, rh * .42, isAmber ? '#fff0ad88' : '#dcf4ff99');
      const open = 1 - closed;
      const pupilX = MathUtils.clamp(gaze.x * .40 * open + tremorX, -4.0, 4.0);
      const pupilY = MathUtils.clamp(MathUtils.lerp(gaze.y * .34 + .4, 1.1, angry) * open + tremorY, -3.4, 3.6);
      ellipse(paint, pupilX, pupilY, (5.8 - 1.3 * angry) * pupilScale,
        (7.6 - .7 * angry) * (1 - .74 * closed) * pupilScale, black);
      if (closed < .55) {
        const shine = isAmber ? '#fffcef' : '#f4fcff';
        ellipse(paint, pupilX - 2.0, pupilY - 3.0, 1.85, 1.85, shine);
        ellipse(paint, pupilX + 2.4, pupilY + 3.0, 1.05, 1.05, shine);
      }
    } else {
      paint.beginPath();
      paint.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      if (coat.eyeRim) stroke(paint, coat.eyeRim, 2.2);
      fillShape(paint, ivory);
      paint.clip();
      const open = 1 - closed;
      const pupilX = MathUtils.clamp(gaze.x * .28 * open + tremorX, -3.1, 3.1);
      const pupilY = MathUtils.clamp(MathUtils.lerp(gaze.y * .25, .9, angry) * open + tremorY, -2.7, 2.9);
      const pupilRx = (9.0 - .9 * angry) * pupilScale;
      const pupilRy = (9.2 - .8 * angry) * (1 - .78 * closed) * pupilScale;
      ellipse(paint, pupilX, pupilY, pupilRx, pupilRy, black);
      if (closed < .55) {
        const twinkleAmp = .1 + .08 * face.happy;
        const twinkle = 1 + twinkleAmp * Math.sin(elapsed * (4.2 + 2.4 * face.happy) + side);
        if (eyeStyle === 'xiaohei') {
          drawSparkle(paint, pupilX + side * 3.0 * pupilScale, pupilY - 1.2 * pupilScale, 2.7 * twinkle * pupilScale, 0, '#ffe078');
          ellipse(paint, pupilX - side * 2.5 * pupilScale, pupilY + 2.7 * pupilScale, 1.15 * pupilScale, 1.15 * pupilScale, ivory);
        } else if (eyeStyle === 'starry') {
          const twinkleAlt = 1 + twinkleAmp * Math.cos(elapsed * (4.6 + 2.4 * face.happy) - side);
          drawSparkle(paint, pupilX - 2.5 * pupilScale, pupilY - 1.7 * pupilScale, 3.5 * twinkle * pupilScale, 0, '#ffa3be');
          drawSparkle(paint, pupilX + 3.3 * pupilScale, pupilY + 1.8 * pupilScale, 2.7 * twinkleAlt * pupilScale, 0, '#ffdc70');
          ellipse(paint, pupilX + 2.7 * pupilScale, pupilY - 3.5 * pupilScale, 1.65 * pupilScale, 1.65 * pupilScale, '#ffffff');
          ellipse(paint, pupilX - 1.5 * pupilScale, pupilY + 3.7 * pupilScale, 1.25 * pupilScale, 1.25 * pupilScale, '#9de8d6');
        } else {
          ellipse(paint, pupilX - 2.6 * pupilScale, pupilY - 2.5 * pupilScale, 1.9 * pupilScale, 1.9 * pupilScale, ivory);
          ellipse(paint, pupilX + 2.4 * pupilScale, pupilY + 2.8 * pupilScale, .95 * pupilScale, .95 * pupilScale, ivory);
        }
      }
    }
    if (delightBoost > .12 && closed < .52) {
      const starPulse = .85 + .22 * Math.sin(elapsed * 12 + side * 1.3);
      paint.save();
      paint.globalAlpha = (1 - lid) * MathUtils.smoothstep(delightBoost, .12, .55);
      drawSparkle(paint, side * 2.8, -2.6, 4.3 * starPulse, elapsed * .6 * side, '#ffe278');
      drawSparkle(paint, -side * 3.4, 2.8, 2.3 * starPulse, -elapsed * .5 * side, '#ffffff');
      paint.restore();
    }
    paint.restore();
    if (happyLift && coat.eyeRim && eyeStyle !== 'ring') {
      paint.save();
      paint.globalAlpha = (1 - lid) * MathUtils.smoothstep(happyLift, .12, .55);
      paint.beginPath();
      paint.ellipse(0, 0, rw + .8, rh + .8, 0, 0, Math.PI * 2);
      paint.clip();
      paint.beginPath();
      paint.ellipse(0, happyCheekY, rw + 2.4, 8.1, 0, 0, Math.PI * 2);
      stroke(paint, coat.eyeRim, 1.45);
      paint.restore();
    }
  }

  if (lid > 0) {
    paint.globalAlpha = lid;
    paint.beginPath();
    if (carrySquint > .32) {
      paint.moveTo(side * 8.4, -5.6);
      paint.lineTo(-side * 7.0, .6);
      paint.lineTo(side * 8.4, 6.6);
      stroke(paint, coat.lid, 2.25);
    } else if (eating > .22 && face.crying <= .02) {
      // Blissful curved ^ ^ yummy-eating smiling eyes + joyful cheek crinkle
      const bounce = .7 * Math.sin(elapsed * 13);
      paint.moveTo(-10.8, 3.2 + bounce * .4);
      paint.quadraticCurveTo(0, -8.4 - bounce * .5, 10.8, 3.2 + bounce * .4);
      stroke(paint, coat.lid, 2.35);
      // Tiny joyful sparkle near outer corner while savoring food
      const spAlpha = lid * MathUtils.smoothstep(eating, .22, .65);
      if (spAlpha > .05) {
        const spScale = .78 + .28 * Math.sin(elapsed * 9 + side * 1.6);
        paint.save();
        paint.globalAlpha = spAlpha;
        drawSparkle(paint, side * 12.6, -5.4, 3.2 * spScale, .2 * side, '#ffdc68');
        paint.restore();
      }
    } else if (face.happy > .35 && face.crying <= .02) {
      paint.moveTo(-10.2, 2.4);
      paint.quadraticCurveTo(0, -6.2, 10.2, 2.4);
      stroke(paint, coat.lid, 2.0);
    } else {
      paint.moveTo(-10.7, .8);
      paint.quadraticCurveTo(0, MathUtils.lerp(7, -3, face.crying), 10.7, .8 + side * face.crying);
      stroke(paint, coat.lid, 1.9);
    }
  }
  if (carry > .04) {
    paint.globalAlpha = .86 * carry;
    paint.beginPath();
    paint.moveTo(side * 10.6, -11.4 + 2.2 * carrySquint);
    paint.quadraticCurveTo(side * 2.5, -14.8 + 1.8 * carrySquint, -side * 5.8, -16.2 + 1.6 * carrySquint);
    stroke(paint, coat.lid, 1.85);
  }
  if (face.crying > .01) {
    paint.globalAlpha = .75 * face.crying;
    paint.beginPath();
    paint.moveTo(side * 7.5, -8.6);
    paint.quadraticCurveTo(0, -6.8, -side * 5.9, -4.6);
    stroke(paint, '#c3b6b7', 1.25);
  }
  paint.restore();
}

const whiskerCurves = [
  [27.5, 11.8, 39.5, 6.8, 51.0, 10.2],
  [28.5, 16.0, 41.0, 13.2, 52.5, 17.6],
  [27.0, 20.2, 39.0, 19.4, 49.5, 25.0],
];

function drawWhiskers(paint, color, width, twitch, shiftX, shiftY) {
  paint.beginPath();
  for (const side of [-1, 1]) {
    for (let i = 0; i < whiskerCurves.length; i++) {
      const [x0, y0, cx, cy, x1, y1] = whiskerCurves[i];
      const lift = (i - 1) * twitch * .7;
      const sx = shiftX * .22;
      const sy = shiftY * .32;
      paint.moveTo(side * x0 + sx, y0 + sy);
      paint.quadraticCurveTo(side * cx + sx, cy + sy + lift * .5, side * x1 + sx, y1 + sy + lift);
    }
  }
  stroke(paint, color, width);
}

function positionHead(paint, face) {
  paint.translate(face.x, face.y);
  paint.rotate(face.angle);
}

const headphonePalettes = {
  cream: { band: '#34323b', pad: '#eab752', shell: '#f5efe2', accent: '#eab752', cushion: '#34323b', shine: '#fff7de' },
  sony: { band: '#282a30', pad: '#3d4049', shell: '#2d3038', accent: '#d8b87e', cushion: '#1a1b20', shine: '#606674' },
  max: { band: '#bcc4d0', pad: '#e3e8f0', shell: '#d6dde8', accent: '#9fa9ba', cushion: '#6e7684', shine: '#ffffff' },
  marshall: { band: '#24201e', pad: '#d4ac58', shell: '#2a2624', accent: '#d4ac58', cushion: '#181614', shine: '#f4d996' },
  sakura: { band: '#f2a4be', pad: '#ffd6e4', shell: '#ffe9f0', accent: '#f48fb2', cushion: '#d07a98', shine: '#ffffff' },
  retro: { band: '#aeb7c6', pad: '#eef2f8', shell: '#ff8a3d', accent: '#f06824', cushion: '#c95218', shine: '#ffd1a1' },
};

function drawRoundedRect(paint, x, y, w, h, r) {
  paint.beginPath();
  paint.roundRect(x - w * .5, y - h * .5, w, h, r);
}

function drawHeadphones(paint, amount, elapsed, style) {
  if (amount <= .01) return;
  const pulse = 1 + .042 * Math.pow(Math.abs(Math.sin(elapsed * 5.8)), 1.6) * amount;
  paint.save();
  paint.globalAlpha = MathUtils.smoothstep(amount, 0, .45);
  paint.translate(0, -10 * (1 - amount));
  paint.scale(.92 + .08 * amount, .92 + .08 * amount);

  const colors = headphonePalettes[style] ?? headphonePalettes.cream;
  const isRetro = style === 'retro';
  // Over-head padded band arching cleanly between the cat's ears
  const bandPath = new Path2D();
  bandPath.moveTo(-45, -22);
  bandPath.bezierCurveTo(-43, -44, -20, -48, 0, -48);
  bandPath.bezierCurveTo(20, -48, 43, -44, 45, -22);
  stroke(paint, ivory, isRetro ? 7.4 : 9.6, bandPath);
  stroke(paint, colors.band, isRetro ? 4.2 : 6.2, bandPath);

  const padPath = new Path2D();
  padPath.moveTo(-23, -43.8);
  padPath.bezierCurveTo(-12, -48.0, 12, -48.0, 23, -43.8);
  stroke(paint, colors.pad, isRetro ? 1.8 : 3.8, padPath);

  // Earcups hugging outward along the cat's ear/temple contour
  for (const side of [-1, 1]) {
    paint.save();
    paint.translate(side * 45, -22);
    paint.scale(pulse, pulse);
    paint.rotate(-side * .24);
    if (style === 'marshall') {
      drawRoundedRect(paint, 0, 0, 16.8, 23.6, 4.4);
      stroke(paint, ivory, 4.0);
      drawRoundedRect(paint, -side * 3.0, .6, 10.0, 20.6, 3.0);
      fillShape(paint, colors.cushion);
      drawRoundedRect(paint, side * .4, 0, 15.6, 22.0, 4.0);
      fillShape(paint, colors.shell);
      drawRoundedRect(paint, side * 1.8, -.3, 9.0, 14.8, 2.4);
      fillShape(paint, colors.accent);
      ellipse(paint, side * 1.2, -3.5, 1.2, 2.4, colors.shine);
    } else if (isRetro) {
      paint.beginPath();
      paint.ellipse(0, 0, 8.8, 12.6, 0, 0, Math.PI * 2);
      stroke(paint, ivory, 4.0);
      ellipse(paint, -side * 2.6, .3, 5.6, 11.4, colors.cushion);
      ellipse(paint, side * .4, 0, 8.2, 12.0, colors.shell);
      ellipse(paint, side * 2.6, 0, 3.8, 6.2, '#434752');
      ellipse(paint, side * 2.9, 0, 2.2, 3.8, colors.band);
      ellipse(paint, side * .2, -4.2, 1.5, 2.4, colors.shine);
    } else {
      paint.beginPath();
      paint.ellipse(0, 0, 8.4, 13.0, 0, 0, Math.PI * 2);
      stroke(paint, ivory, 4.0);
      ellipse(paint, -side * 3.4, .4, 5.0, 11.4, colors.cushion);
      ellipse(paint, side * .5, 0, 7.8, 12.2, colors.shell);
      if (style === 'sony') {
        paint.beginPath();
        paint.ellipse(side * 1.6, -.3, 4.4, 7.6, 0, 0, Math.PI * 2);
        stroke(paint, colors.accent, 1.5);
        ellipse(paint, side * 1.6, -4.6, 1.1, 1.1, colors.accent);
      } else {
        ellipse(paint, side * 1.8, -.3, 4.3, 7.8, colors.accent);
        ellipse(paint, side * 1.0, -3.0, 1.2, 2.3, colors.shine);
      }
    }
    paint.restore();
  }
  paint.restore();
}

function drawTaperStripe(paint, x0, y0, cx, cy, x1, y1, w0, color) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * w0;
  const ny = (dx / len) * w0;
  paint.beginPath();
  paint.moveTo(x0 + nx, y0 + ny);
  paint.quadraticCurveTo(cx + nx * .48, cy + ny * .48, x1, y1);
  paint.quadraticCurveTo(cx - nx * .48, cy - ny * .48, x0 - nx, y0 - ny);
  paint.closePath();
  fillShape(paint, color);
}

function drawTailMarkings(paint, pts, coatKey, width = tailWidth, dogTailPath = null) {
  if (coatKey !== 'tabby' && coatKey !== 'orange' && coatKey !== 'calico'
    && coatKey !== 'husky' && coatKey !== 'shiba' && coatKey !== 'corgi'
    && coatKey !== 'golden' && coatKey !== 'border') return;
  const samples = sampleTailSpline(pts);
  if (samples.length < 2) return;
  const clipPath = dogTailPath ?? buildTailPath(samples, width * .5);
  paint.save();
  paint.clip(clipPath);
  const last = samples.length - 1;
  if (coatKey === 'tabby' || coatKey === 'orange') {
    const stripe = coatKey === 'tabby' ? '#443b35' : '#ce742c';
    const tipColor = coatKey === 'tabby' ? '#403732' : '#fff7eb';
    for (const frac of [.16, .32, .48, .64, .79]) {
      const idx = Math.round(frac * last);
      const prev = samples[Math.max(0, idx - 1)];
      const next = samples[Math.min(last, idx + 1)];
      const [cx, cy] = samples[idx];
      const angle = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
      ellipse(paint, cx, cy, 2.7, 13.5, stripe, angle);
    }
    const tipStart = Math.round(.86 * last);
    for (let i = tipStart; i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1], 10.5, 10.5, tipColor);
    }
  } else if (coatKey === 'calico') {
    for (let i = Math.round(.18 * last); i <= Math.round(.54 * last); i++) {
      ellipse(paint, samples[i][0], samples[i][1], 11.5, 11.5, '#e68a42');
    }
    for (let i = Math.round(.67 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1], 11.5, 11.5, '#2c2a2c');
    }
  } else if (coatKey === 'husky') {
    for (let i = Math.round(.45 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1] + 5.5, 15, 14, '#faf9f6');
    }
    for (let i = Math.round(.76 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1], 15, 15, '#faf9f6');
    }
  } else if (coatKey === 'shiba' || coatKey === 'corgi') {
    const tipColor = coatKey === 'shiba' ? '#fff8ec' : '#fffaf2';
    for (let i = Math.round(.54 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1], 14, 14, tipColor);
    }
  } else if (coatKey === 'golden') {
    paint.globalAlpha = .62;
    for (let i = Math.round(.30 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1] + 4.5, 13.5, 13.5, '#fff3d8');
    }
  } else if (coatKey === 'border') {
    for (let i = Math.round(.72 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1], 14, 14, '#faf9f6');
    }
  }
  paint.restore();
}

function drawBodyMarkings(paint, bodyPath, coatKey, crouch, carry = 0, kickLx = 0, kickLy = 0, kickRx = 0, kickRy = 0) {
  if (coatKey === 'black') return;
  paint.save();
  paint.clip(bodyPath);
  if (coatKey === 'siamese') {
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-40, -34, crouch), -22 + kickLx, carry),
      MathUtils.lerp(MathUtils.lerp(-1, 3, crouch), 31 + kickLy, carry),
      MathUtils.lerp(14, 12.5, carry), MathUtils.lerp(10, 13, carry), '#4a342a');
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(40, 48, crouch), 22 + kickRx, carry),
      MathUtils.lerp(MathUtils.lerp(-1, 2, crouch), 31 + kickRy, carry),
      MathUtils.lerp(14, 12.5, carry), MathUtils.lerp(10, 13, carry), '#4a342a');
    paint.globalAlpha = .52;
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, 14, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-56, -34, crouch), -36, carry),
      MathUtils.lerp(36, 26, carry), MathUtils.lerp(MathUtils.lerp(44, 26, crouch), 50, carry), '#dec8ad');
  } else if (coatKey === 'tabby' || coatKey === 'orange') {
    const cream = coatKey === 'tabby' ? '#f9f5ee' : '#fff8ed';
    const stripe = coatKey === 'tabby' ? '#443b35' : '#ce742c';
    // Natural chest bib + soft pear belly + cute white foot socks
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, -14, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-106, -12, crouch), -96, carry),
      MathUtils.lerp(22, 16, carry), MathUtils.lerp(MathUtils.lerp(24, 16, crouch), 28, carry), cream);
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, 8, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-48, 0, crouch), -26, carry),
      MathUtils.lerp(25, 20, carry), MathUtils.lerp(MathUtils.lerp(42, 16, crouch), 44, carry), cream);
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-41, -36, crouch), -22 + kickLx, carry),
      MathUtils.lerp(0, 33 + kickLy, carry),
      MathUtils.lerp(12, 12, carry), MathUtils.lerp(7.5, 10, carry), cream);
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(41, 46, crouch), 22 + kickRx, carry),
      MathUtils.lerp(0, 33 + kickRy, carry),
      MathUtils.lerp(12, 12, carry), MathUtils.lerp(7.5, 10, carry), cream);
    if (crouch < .65) {
      paint.globalAlpha = 1 - MathUtils.smoothstep(crouch, .2, .65);
      const flankX = MathUtils.lerp(58, 43, carry);
      const midX = MathUtils.lerp(42, 31, carry);
      const reachScale = MathUtils.lerp(1, .74, carry);
      const yShift = 10 * carry;
      for (const side of [-1, 1]) {
        for (const [y0, y1, reach] of [[-96, -88, 28], [-74, -67, 30], [-52, -46, 26]]) {
          drawTaperStripe(paint, side * flankX, y0 + yShift, side * midX, (y0 + y1) * .5 + yShift,
            side * reach * reachScale, y1 + yShift, 3.2, stripe);
        }
      }
    }
    if (crouch > .25) {
      paint.globalAlpha = MathUtils.smoothstep(crouch, .25, .75) * (1 - carry);
      for (const xx of [-6, 14, 34]) {
        drawTaperStripe(paint, xx, -66, xx + 4, -46, xx + 2, -26, 3.4, stripe);
      }
    }
  } else if (coatKey === 'ragdoll') {
    paint.globalAlpha = .54;
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-48, 14, crouch), -34, carry),
      MathUtils.lerp(MathUtils.lerp(-54, -46, crouch), -36, carry),
      MathUtils.lerp(MathUtils.lerp(18, 34, crouch), 14, carry),
      MathUtils.lerp(MathUtils.lerp(30, 18, crouch), 36, carry), '#a8968a');
    if (crouch < .7) {
      paint.globalAlpha = .54 * (1 - MathUtils.smoothstep(crouch, .2, .7));
      ellipse(paint, MathUtils.lerp(48, 34, carry), MathUtils.lerp(-54, -36, carry),
        MathUtils.lerp(18, 14, carry), MathUtils.lerp(30, 36, carry), '#a8968a');
      paint.globalAlpha = 1;
      ellipse(paint, 0, MathUtils.lerp(-96, -92, carry), MathUtils.lerp(32, 22, carry), MathUtils.lerp(16, 18, carry), '#fffdf9');
    }
  } else if (coatKey === 'calico') {
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-38, -2, crouch), -28, carry),
      MathUtils.lerp(MathUtils.lerp(-74, -48, crouch), -56, carry),
      MathUtils.lerp(28, 22, carry), MathUtils.lerp(MathUtils.lerp(34, 24, crouch), 38, carry), '#e68a42');
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(40, 42, crouch), 28, carry),
      MathUtils.lerp(MathUtils.lerp(-48, -32, crouch), -24, carry),
      MathUtils.lerp(26, 21, carry), MathUtils.lerp(MathUtils.lerp(32, 24, crouch), 36, carry), '#2c2a2c');
    if (crouch < .6) {
      paint.globalAlpha = 1 - MathUtils.smoothstep(crouch, .2, .6);
      ellipse(paint, MathUtils.lerp(36, 26, carry), MathUtils.lerp(-98, -86, carry),
        MathUtils.lerp(22, 16, carry), MathUtils.lerp(22, 20, carry), '#e68a42');
    }
  } else if (coatKey === 'husky') {
    // Charcoal-grey back saddle wrapping over shoulders & flanks, crisp snowy chest & belly
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-46, 18, crouch), -34, carry),
      MathUtils.lerp(MathUtils.lerp(-66, -48, crouch), -54, carry),
      MathUtils.lerp(MathUtils.lerp(21, 46, crouch), 16, carry),
      MathUtils.lerp(MathUtils.lerp(48, 24, crouch), 54, carry), '#3c4350');
    if (crouch < .72) {
      paint.globalAlpha = 1 - MathUtils.smoothstep(crouch, .22, .72);
      ellipse(paint, MathUtils.lerp(46, 34, carry), MathUtils.lerp(-66, -54, carry),
        MathUtils.lerp(21, 16, carry), MathUtils.lerp(48, 54, carry), '#3c4350');
      paint.globalAlpha = 1;
    }
    ellipse(paint, 0, MathUtils.lerp(-50, -34, carry),
      MathUtils.lerp(30, 23, carry), MathUtils.lerp(56, 62, carry), '#fbfaf7');
  } else if (coatKey === 'shiba' || coatKey === 'corgi') {
    const cream = coatKey === 'shiba' ? '#fff8ec' : '#fffaf2';
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, -14, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-104, -14, crouch), -96, carry),
      MathUtils.lerp(coatKey === 'corgi' ? 32 : 26, coatKey === 'corgi' ? 24 : 19, carry),
      MathUtils.lerp(MathUtils.lerp(28, 18, crouch), 30, carry), cream);
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, 8, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-46, 0, crouch), -28, carry),
      MathUtils.lerp(27, 22, carry), MathUtils.lerp(MathUtils.lerp(44, 18, crouch), 46, carry), cream);
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-41, -36, crouch), -22 + kickLx, carry),
      MathUtils.lerp(0, 33 + kickLy, carry),
      MathUtils.lerp(13, 12.5, carry), MathUtils.lerp(8, 11, carry), cream);
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(41, 46, crouch), 22 + kickRx, carry),
      MathUtils.lerp(0, 33 + kickRy, carry),
      MathUtils.lerp(13, 12.5, carry), MathUtils.lerp(8, 11, carry), cream);
  } else if (coatKey === 'golden') {
    paint.globalAlpha = .72;
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, -12, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-94, -18, crouch), -88, carry),
      MathUtils.lerp(29, 21, carry), MathUtils.lerp(26, 28, carry), '#fff3d8');
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, 8, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-42, 0, crouch), -24, carry),
      MathUtils.lerp(25, 20, carry), MathUtils.lerp(36, 40, carry), '#fff3d8');
    paint.globalAlpha = 1;
  } else if (coatKey === 'samoyed') {
    paint.globalAlpha = .52;
    ellipse(paint, 0, MathUtils.lerp(-88, -82, carry),
      MathUtils.lerp(30, 22, carry), MathUtils.lerp(22, 24, carry), '#efeae2');
    paint.globalAlpha = 1;
  } else if (coatKey === 'border') {
    // Classic Border Collie snow-white chest scarf, belly & neat socks on black body
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, -14, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-104, -14, crouch), -96, carry),
      MathUtils.lerp(31, 23, carry), MathUtils.lerp(28, 30, carry), '#faf9f6');
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(0, 8, crouch), 0, carry),
      MathUtils.lerp(MathUtils.lerp(-46, 0, crouch), -26, carry),
      MathUtils.lerp(25, 20, carry), MathUtils.lerp(MathUtils.lerp(42, 16, crouch), 44, carry), '#faf9f6');
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(-41, -36, crouch), -22 + kickLx, carry),
      MathUtils.lerp(0, 33 + kickLy, carry),
      MathUtils.lerp(13, 12.5, carry), MathUtils.lerp(8.5, 11, carry), '#faf9f6');
    ellipse(paint,
      MathUtils.lerp(MathUtils.lerp(41, 46, crouch), 22 + kickRx, carry),
      MathUtils.lerp(0, 33 + kickRy, carry),
      MathUtils.lerp(13, 12.5, carry), MathUtils.lerp(8.5, 11, carry), '#faf9f6');
  }
  paint.restore();
}

function drawHeadMarkings(paint, coatKey, featureX, featureY, activeHeadShape) {
  if (coatKey === 'black') return;
  paint.save();
  paint.clip(activeHeadShape);
  const sx = featureX * .35;
  const sy = featureY * .35;
  if (coatKey === 'siamese') {
    ellipse(paint, -29, -46, 17, 21, '#422e25', -.25);
    ellipse(paint, 29, -46, 17, 21, '#422e25', .25);
    const mask = paint.createRadialGradient(sx, 7 + sy, 4, sx, 6 + sy, 29);
    mask.addColorStop(0, '#3f2b22');
    mask.addColorStop(.42, '#4d362ce0');
    mask.addColorStop(.74, '#6b4e3f6e');
    mask.addColorStop(1, '#6b4e3f00');
    ellipse(paint, sx, 6 + sy, 29, 21, mask);
  } else if (coatKey === 'tabby' || coatKey === 'orange') {
    const isTabby = coatKey === 'tabby';
    const stripe = isTabby ? '#443b35' : '#ce742c';
    const earTip = isTabby ? '#443b35' : '#de8a3e';
    const earIn = isTabby ? '#e0b2ae' : '#f8c6ba';
    const cream = isTabby ? '#f9f5ee' : '#fff8ed';
    for (const side of [-1, 1]) {
      ellipse(paint, side * 30, -51, 12, 12, earTip, side * .2);
      ellipse(paint, side * 28, -41, 6.2, 9.5, earIn, side * .22);
    }
    if (isTabby) {
      ellipse(paint, sx, 23 + sy, 25, 14, cream);
      ellipse(paint, -11 + sx * .8, 19 + sy, 11, 8, cream);
      ellipse(paint, 11 + sx * .8, 19 + sy, 11, 8, cream);
    } else {
      ellipse(paint, sx, 24 + sy, 34, 16, cream);
      ellipse(paint, -16 + sx * .8, 19 + sy, 15, 11, cream);
      ellipse(paint, 16 + sx * .8, 19 + sy, 15, 11, cream);
    }
    // Soft tapered teardrop forehead tufts + delicate curved temple tabby ticks
    drawTaperStripe(paint, sx * .4, -40, sx * .4, -30, sx * .4, -20 + sy * .25, 2.8, stripe);
    for (const side of [-1, 1]) {
      drawTaperStripe(paint, side * 10 + sx * .4, -40, side * 9 + sx * .4, -31, side * 6.5 + sx * .4, -23 + sy * .25, 2.5, stripe);
      drawTaperStripe(paint, side * 49, -4 + sy * .35, side * 42, -3 + sy * .35, side * 35 + sx * .25, -1 + sy * .35, 2.1, stripe);
      drawTaperStripe(paint, side * 49, 4 + sy * .35, side * 42, 5 + sy * .35, side * 36 + sx * .25, 6.5 + sy * .35, 1.8, stripe);
    }
  } else if (coatKey === 'ragdoll') {
    for (const side of [-1, 1]) {
      paint.beginPath();
      paint.moveTo(side * 8, -44);
      paint.lineTo(side * 32, -62);
      paint.lineTo(side * 50, -24);
      paint.lineTo(side * 50, 14);
      paint.lineTo(side * 30, 14);
      paint.lineTo(side * 14, -18);
      paint.closePath();
      fillShape(paint, '#846e60');
      ellipse(paint, side * 30, -47, 13, 17, '#68554a', side * .2);
      ellipse(paint, side * 28, -41, 5.5, 9, '#e0bab8', side * .2);
    }
    paint.beginPath();
    paint.moveTo(sx * .5, -34);
    paint.lineTo(-22 + sx * .5, 18 + sy * .4);
    paint.lineTo(22 + sx * .5, 18 + sy * .4);
    paint.closePath();
    fillShape(paint, '#f8f4ee');
  } else if (coatKey === 'calico') {
    ellipse(paint, -28, -32, 26, 28, '#e68a42', -.2);
    ellipse(paint, 29, -30, 25, 29, '#2c2a2c', .2);
    ellipse(paint, -27, -41, 6, 9.5, '#f4b8ae', -.2);
    ellipse(paint, 27, -41, 6, 9.5, '#d6a2a6', .2);
  } else if (coatKey === 'husky') {
    // Classic Husky charcoal wolf cap with clean forehead V-peak & twin white brow arches
    paint.beginPath();
    paint.moveTo(-54, -70);
    paint.lineTo(54, -70);
    paint.lineTo(54, 4);
    paint.bezierCurveTo(45, -2, 39, -18, 28, -23);
    paint.bezierCurveTo(17, -27, 7, -21, sx * .5, -13 + sy * .3);
    paint.bezierCurveTo(-7, -21, -17, -27, -28, -23);
    paint.bezierCurveTo(-39, -18, -45, -2, -54, 4);
    paint.closePath();
    fillShape(paint, '#383f4d');
    for (const side of [-1, 1]) {
      ellipse(paint, side * 27, -46, 5.8, 10.5, '#e2b9bf', side * .18);
      ellipse(paint, side * 14.5 + sx * .5, -24.5 + sy * .25, 6.0, 3.3, '#fbfaf7', -side * .28);
    }
    paint.beginPath();
    paint.moveTo(sx * .4, -37);
    paint.quadraticCurveTo(sx * .4 - 3.6, -25, sx * .4, -14 + sy * .25);
    paint.quadraticCurveTo(sx * .4 + 3.6, -25, sx * .4, -37);
    paint.closePath();
    fillShape(paint, '#fbfaf7');
  } else if (coatKey === 'shiba') {
    // Rich toasted Shiba ear rims + soft cream inner ear fluff
    for (const side of [-1, 1]) {
      ellipse(paint, side * 35, -47, 13, 13, '#bd6420', side * .22);
      ellipse(paint, side * 32, -41, 6.2, 8.6, '#fff1e0', side * .24);
    }
    // Iconic Shiba heart/M-shaped cream urajiro mask curving UP around outer cheeks & dipping to nose bridge!
    paint.beginPath();
    paint.moveTo(-58, 42);
    paint.lineTo(-58, -4);
    paint.bezierCurveTo(-48, -10, -35, -8, -24, 3);
    paint.bezierCurveTo(-14, 11, -5, 4, sx * .5, -3 + sy * .35);
    paint.bezierCurveTo(5, 4, 14, 11, 24, 3);
    paint.bezierCurveTo(35, -8, 48, -10, 58, -4);
    paint.lineTo(58, 42);
    paint.closePath();
    fillShape(paint, '#fff9ee');
    // Signature bold cream-white Shiba bean eyebrows (豆豆眉)
    for (const side of [-1, 1]) {
      ellipse(paint, side * 14.5 + sx * .55, -22.5 + sy * .3, 5.2, 3.1, '#fff9ee', side * .22);
    }
  } else if (coatKey === 'corgi') {
    // Huge Pembroke Corgi ears with deeper golden rims & big soft pink inner ears
    for (const side of [-1, 1]) {
      ellipse(paint, side * 41, -56, 15, 19, '#c67326', side * .28);
      ellipse(paint, side * 38, -50, 9.6, 15.2, '#f5b8b8', side * .30);
    }
    // Classic Pembroke Welsh Corgi teardrop forehead blaze flaring into snow-white cheeks & muzzle
    paint.beginPath();
    paint.moveTo(sx * .4, -36);
    paint.bezierCurveTo(-8 + sx * .4, -26, -9.5 + sx * .5, -11, -12 + sx * .65, 2 + sy * .4);
    paint.bezierCurveTo(-24, 2, -40, 2, -54, 12);
    paint.lineTo(-54, 42);
    paint.lineTo(54, 42);
    paint.lineTo(54, 12);
    paint.bezierCurveTo(40, 2, 24, 2, 12 + sx * .65, 2 + sy * .4);
    paint.bezierCurveTo(9.5 + sx * .5, -11, 8 + sx * .4, -26, sx * .4, -36);
    paint.closePath();
    fillShape(paint, '#ffffff');
  } else if (coatKey === 'golden') {
    // Warm honey-caramel brow warmth + creamy butter retriever muzzle & gentle forehead sheen
    paint.globalAlpha = .34;
    ellipse(paint, 0, -25, 34, 17, '#d9953a');
    paint.globalAlpha = .86;
    ellipse(paint, sx * .8, 19 + sy * .65, 29, 16.5, '#fff6df');
    ellipse(paint, sx * .5, -8 + sy * .4, 11, 14, '#fff6df');
    paint.globalAlpha = 1;
  } else if (coatKey === 'samoyed') {
    // Soft peachy inner ears with tiny snow-white fur tufts overlapping ear bases
    for (const side of [-1, 1]) {
      ellipse(paint, side * 30, -42, 6.0, 8.8, '#f5c2c8', side * .22);
      ellipse(paint, side * 26, -34, 5.5, 3.8, '#ffffff', -side * .2);
    }
    paint.globalAlpha = .36;
    ellipse(paint, sx * .6, 30 + sy * .5, 36, 9, '#eae8ee');
    paint.globalAlpha = 1;
  } else if (coatKey === 'border') {
    // Classic graceful curved Border Collie black mask with crisp hourglass snow-white blaze
    for (const side of [-1, 1]) {
      paint.beginPath();
      paint.moveTo(side * 4.5 + sx * .35, -45);
      paint.lineTo(side * 56, -45);
      paint.lineTo(side * 56, 18);
      paint.bezierCurveTo(side * 42, 18, side * 30, 12, side * 22 + sx * .5, 4 + sy * .35);
      paint.bezierCurveTo(side * 12 + sx * .5, -4, side * 9 + sx * .4, -18, side * 6.5 + sx * .4, -30);
      paint.quadraticCurveTo(side * 5.2 + sx * .35, -38, side * 4.5 + sx * .35, -45);
      paint.closePath();
      fillShape(paint, '#20232a');
    }
  }
  paint.restore();
}

function drawCarrySweatDrop(paint, amount, elapsed) {
  if (amount <= .06) return;
  const cycle = (elapsed * .74) % 1;
  const fade = MathUtils.smoothstep(cycle, 0, .16) * (1 - MathUtils.smoothstep(cycle, .76, 1));
  const alpha = amount * fade;
  if (alpha <= .02) return;
  const x = 33.5;
  const y = -25 + cycle * 9.5;
  const s = .88 + .14 * Math.sin(cycle * Math.PI);
  paint.save();
  paint.globalAlpha = alpha;
  paint.translate(x, y);
  paint.scale(s, s);
  paint.beginPath();
  paint.moveTo(0, -7.2);
  paint.bezierCurveTo(3.6, -2.2, 5.0, 1.4, 4.4, 4.0);
  paint.bezierCurveTo(3.8, 6.8, -3.8, 6.8, -4.4, 4.0);
  paint.bezierCurveTo(-5.0, 1.4, -3.6, -2.2, 0, -7.2);
  paint.closePath();
  stroke(paint, ivory, 2.8);
  fillShape(paint, '#74ceff');
  stroke(paint, '#2e658f', 1.15);
  ellipse(paint, -1.4, 1.8, 1.1, 1.8, '#e8f8ff', -.25);
  paint.restore();
}

function drawCarryStruggleLines(paint, amount, elapsed) {
  if (amount <= .08) return;
  const pulse = .55 + .45 * Math.sin(elapsed * 16);
  paint.save();
  paint.globalAlpha = amount * (.62 + .34 * pulse);
  for (const side of [-1, 1]) {
    const jitter = Math.sin(elapsed * 14 + side * 1.6) * 2.0;
    // Upper arc near front paddling paws
    paint.beginPath();
    paint.arc(side * 44, -44 + jitter, 9.0, side < 0 ? Math.PI * .78 : -Math.PI * .22,
      side < 0 ? Math.PI * 1.22 : Math.PI * .22);
    stroke(paint, '#343a4888', 3.4);
    stroke(paint, ivory, 1.75);

    // Lower arc near dangling kicking hind feet
    paint.beginPath();
    paint.arc(side * 37, 27 - jitter, 8.2, side < 0 ? Math.PI * .74 : -Math.PI * .26,
      side < 0 ? Math.PI * 1.18 : Math.PI * .18);
    stroke(paint, '#343a4888', 3.2);
    stroke(paint, ivory, 1.65);
  }
  paint.restore();
}

function drawDogChestFluff(paint, coat, crouch, carry) {
  const show = (1 - MathUtils.smoothstep(crouch, .18, .65)) * (1 - .45 * carry);
  if (show <= .02) return;
  const y = MathUtils.lerp(-116, -110, carry);
  const w = MathUtils.lerp(1, .76, carry);
  paint.save();
  paint.globalAlpha = show;
  paint.beginPath();
  paint.moveTo(-24 * w, y - 6);
  paint.quadraticCurveTo(-20 * w, y + 12, -11 * w, y + 10);
  paint.quadraticCurveTo(-5 * w, y + 22, 0, y + 19);
  paint.quadraticCurveTo(5 * w, y + 22, 11 * w, y + 10);
  paint.quadraticCurveTo(20 * w, y + 12, 24 * w, y - 6);
  paint.closePath();
  fillShape(paint, coat.chestFluff ?? '#ffffff');
  paint.globalAlpha = show * .35;
  paint.beginPath();
  paint.moveTo(-18 * w, y + 6);
  paint.quadraticCurveTo(-11 * w, y + 12, -7 * w, y + 9);
  paint.quadraticCurveTo(0, y + 21, 7 * w, y + 9);
  paint.quadraticCurveTo(11 * w, y + 12, 18 * w, y + 6);
  stroke(paint, coat.rim ?? '#7a7570', 1.35);
  paint.restore();
}

function drawDogNoseAndMouth(paint, coat, featureX, featureY, reaction, face, eyeOffset, elapsed, dogTongue) {
  const mx = featureX * .88;
  const nx = featureX * .92;
  const ny = 8.0 + featureY * .75;
  const my = 16.5 + featureY * .72;

  // 1. Clean glossy rounded-heart dog nose (no muddy pasted-on oval muzzle!)
  paint.beginPath();
  paint.moveTo(nx, ny - 3.9);
  paint.bezierCurveTo(nx + 6.6, ny - 4.0, nx + 6.8, ny + 1.0, nx + 2.9, ny + 3.5);
  paint.quadraticCurveTo(nx, ny + 4.9, nx - 2.9, ny + 3.5);
  paint.bezierCurveTo(nx - 6.8, ny + 1.0, nx - 6.6, ny - 4.0, nx, ny - 3.9);
  paint.closePath();
  fillShape(paint, coat.nose);
  ellipse(paint, nx - 1.8, ny - 1.6, 1.8, .95, '#ffffff6c', -.22);

  // 2. Expressive clean dog mouth & cute peeking pink tongue
  if (reaction.mouth > .04) {
    ellipse(paint, mx, my + 2.4, 4.6, 1.6 + 4.2 * reaction.mouth, '#e089a2');
  } else if ((face.carry ?? 0) > .05) {
    const carry = face.carry;
    const squint = face.carrySquint ?? 0;
    const wobble = Math.sin(elapsed * 18) * .65 * carry;
    paint.globalAlpha = MathUtils.smoothstep(carry, .05, .38);
    if (squint > .34) {
      paint.beginPath();
      paint.moveTo(mx - 6.0, my + 1.5 + wobble * .4);
      paint.quadraticCurveTo(mx - 3.0, my - 1.9 - wobble * .5, mx, my + 1.1 + wobble * .3);
      paint.quadraticCurveTo(mx + 3.0, my - 1.9 + wobble * .5, mx + 6.0, my + 1.5 - wobble * .4);
      stroke(paint, coat.lid, 1.85);
    } else {
      const openH = 2.4 + 1.4 * Math.abs(Math.sin(elapsed * 6.8)) + .6 * Math.abs(wobble);
      ellipse(paint, mx, my + 1.8, 4.0, openH, '#e08da6');
      paint.beginPath();
      paint.ellipse(mx, my + 1.8, 4.0, openH, 0, 0, Math.PI * 2);
      stroke(paint, '#7c3f53', .95);
    }
    paint.globalAlpha = 1;
    return;
  } else if (face.crying > .01) {
    paint.globalAlpha = .85 * face.crying;
    paint.beginPath();
    paint.moveTo(mx - 5.4, my + 2.6);
    paint.quadraticCurveTo(mx, my - 1.4, mx + 5.4, my + 2.6);
    stroke(paint, coat.lid, 1.6);
    paint.globalAlpha = 1;
    return;
  } else if (eyeOffset.angry > .05) {
    const pout = eyeOffset.angry;
    paint.globalAlpha = MathUtils.smoothstep(pout, .05, .45);
    paint.beginPath();
    paint.moveTo(mx - 5.0, my + 2.0 * pout);
    paint.quadraticCurveTo(mx, my - 1.6 * pout, mx + 5.0, my + 2.0 * pout);
    stroke(paint, coat.lid, 1.85);
    paint.globalAlpha = 1;
    return;
  }

  // Cute clean pink tongue peeking neatly from the center of the ω dog smile
  if (dogTongue > .05) {
    const pant = 1 + .12 * Math.sin(elapsed * 13);
    const th = 7.8 * dogTongue * pant;
    paint.save();
    paint.globalAlpha = MathUtils.smoothstep(dogTongue, .05, .28);
    paint.beginPath();
    paint.moveTo(mx - 4.2, my + .8);
    paint.bezierCurveTo(mx - 4.6, my + th + 2.6, mx + 4.6, my + th + 2.6, mx + 4.2, my + .8);
    paint.closePath();
    fillShape(paint, '#ff88a6');
    stroke(paint, '#b84c6b', 1.1);
    paint.beginPath();
    paint.moveTo(mx, my + 1.8);
    paint.lineTo(mx, my + th * .72);
    stroke(paint, '#d65e7e', .95);
    paint.restore();
  }

  // Clean crisp dog philtrum + wide friendly ω smile (extra sweet upturned smile for Samoyed!)
  const samoyedSmile = coat.earKind === 'samoyed';
  const smileW = samoyedSmile ? 11.8 : 9.8;
  const smileLift = samoyedSmile ? -2.6 : -1.1;
  paint.beginPath();
  paint.moveTo(mx, ny + 4.1);
  paint.lineTo(mx, my + .1);
  paint.moveTo(mx - smileW, my + smileLift);
  paint.quadraticCurveTo(mx - smileW * .52, my + 3.9, mx, my + .1);
  paint.quadraticCurveTo(mx + smileW * .52, my + 3.9, mx + smileW, my + smileLift);
  stroke(paint, coat.lid, samoyedSmile ? 1.85 : 1.7);
}

function drawHead(paint, gaze, reaction, face, twitch, eyeStyle, elapsed, musicBlend = 0, headphoneStyle = 'cream', coatKey = 'black', earBounce = 0, dogTongue = 0) {
  const coat = catCoatPalettes[coatKey] ?? catCoatPalettes.black;
  const isDog = coat.species === 'dog';
  const activeHeadShape = getHeadShape(coatKey);
  paint.save();
  positionHead(paint, face);
  const closed = Math.max(face.closed, face.crying, face.carrySquint ?? 0);
  const eyeOffset = resolveFaceGaze(gaze, reaction.tension, closed);
  const featureX = eyeOffset.x * .82;
  const featureY = eyeOffset.y * .82;
  paint.fillStyle = coat.head;
  paint.fill(activeHeadShape);
  drawHeadMarkings(paint, coatKey, featureX, featureY, activeHeadShape);
  if (isDog) drawDogEarFlaps(paint, coatKey, 'fill', earBounce);

  for (const side of [-1, 1]) {
    drawEye(paint, side, eyeOffset, gaze, face, eyeStyle, elapsed, coat);
    if (reaction.blush > .01) {
      paint.globalAlpha = reaction.blush * .72;
      ellipse(paint, side * (isDog ? 28 : 29) + featureX * .7, (isDog ? 4.5 : 14.5) + featureY * .65,
        isDog ? 5.6 : 6.2, isDog ? 2.6 : 2.9, '#ed89a5', side * .08);
      paint.globalAlpha = 1;
    }
  }

  if (isDog) {
    drawDogNoseAndMouth(paint, coat, featureX, featureY, reaction, face, eyeOffset, elapsed, dogTongue);
  } else {
    ellipse(paint, .8 + featureX, 13.8 + featureY, 2.8, 1.35, coat.nose, -.1);
    if (reaction.mouth > .04) {
      ellipse(paint, featureX * .85, 22 + featureY * .65, 4.1, 1 + 4.5 * reaction.mouth, '#d392a6');
    } else if ((face.carry ?? 0) > .05) {
      const carry = face.carry;
      const squint = face.carrySquint ?? 0;
      const mx = featureX * .85;
      const my = 21.6 + featureY * .62;
      const wobble = Math.sin(elapsed * 18) * .65 * carry;
      paint.globalAlpha = MathUtils.smoothstep(carry, .05, .38);
      if (squint > .34) {
        // Cute flustered wavy mouth while squeezing eyes
        paint.beginPath();
        paint.moveTo(mx - 5.2, my + 1.0 + wobble * .4);
        paint.quadraticCurveTo(mx - 2.6, my - 2.2 - wobble * .5, mx, my + .8 + wobble * .3);
        paint.quadraticCurveTo(mx + 2.6, my - 2.2 + wobble * .5, mx + 5.2, my + 1.0 - wobble * .4);
        stroke(paint, coatKey === 'siamese' ? ivory : coat.lid, 1.75);
      } else {
        // Startled small open "o" mouth
        const openH = 2.0 + 1.35 * Math.abs(Math.sin(elapsed * 6.8)) + .65 * Math.abs(wobble);
        ellipse(paint, mx, my + .4, 3.6, openH, '#e08da6');
        paint.beginPath();
        paint.ellipse(mx, my + .4, 3.6, openH, 0, 0, Math.PI * 2);
        stroke(paint, '#7c3f53', .95);
      }
    } else if (face.crying > .01) {
      paint.globalAlpha = .85 * face.crying;
      paint.beginPath();
      paint.moveTo(-4 + featureX * .85, 22 + featureY * .65);
      paint.quadraticCurveTo(featureX * .85, 18.5 + featureY * .65, 4 + featureX * .85, 22 + featureY * .65);
      stroke(paint, coat.lid, 1.35);
    } else if (eyeOffset.angry > .05) {
      const mx = featureX * .88;
      const my = 20.8 + featureY * .62;
      const pout = eyeOffset.angry;
      paint.globalAlpha = MathUtils.smoothstep(pout, .05, .45);
      paint.beginPath();
      paint.moveTo(mx - 3.6, my + 1.1 * pout);
      paint.quadraticCurveTo(mx, my - 1.3 * pout, mx + 3.6, my + 1.1 * pout);
      stroke(paint, coat.lid, 1.8);
    }
    paint.globalAlpha = 1;
    drawWhiskers(paint, coat.whisker, 1.05, twitch, featureX, featureY);
  }
  paint.globalAlpha = 1;
  drawCarrySweatDrop(paint, face.carry ?? 0, elapsed);
  drawHeadphones(paint, musicBlend, elapsed, headphoneStyle);
  paint.restore();
}

function drawArm(paint, side, endX, endY, bodyHeight, crouch = 0, mode = 'over', coatKey = 'black', carry = 0) {
  const coat = catCoatPalettes[coatKey] ?? catCoatPalettes.black;
  const stand = (1 - crouch) * (1 - carry);
  const outward = side * endX;
  const splay = MathUtils.smoothstep(outward, 33, 82) * stand;
  const crossing = MathUtils.smoothstep(-outward, 13, 104) * stand;
  const reach = Math.max(splay, crossing);
  const standRootX = side * (29 + 7 * splay - 15 * crossing);
  const standRootY = (-72 + 8 * splay + 26 * crossing) * bodyHeight;
  const baseRootX = MathUtils.lerp(standRootX, side < 0 ? -26 : -14, crouch);
  const baseRootY = MathUtils.lerp(standRootY, -18, crouch);
  const rootX = MathUtils.lerp(baseRootX, side * 18.5, carry);
  const rootY = MathUtils.lerp(baseRootY, -86, carry);
  const dx = endX - rootX;
  const dy = endY - rootY;
  const length = Math.hypot(dx, dy);
  const stretch = Math.max(reach, MathUtils.smoothstep(length, 46, 74)) * (1 - .55 * carry);
  const shoulderHalfWidth = MathUtils.lerp(8.6 + 1.9 * stretch, 7.6, carry);
  const forearmHalfWidth = MathUtils.lerp(7.1 + 1.8 * stretch, 6.8, carry);
  const wristHalfWidth = MathUtils.lerp(6.2 + 1.5 * stretch, 6.0, carry);
  const wrist = length * .79;
  const tip = length + 9.2;
  const padSlope = MathUtils.clamp(-dx / Math.max(1, dy), -.52, .52) * (1 - stretch);
  const padX = y => (y - length) * padSlope;
  const bow = -side * 5 * splay;
  const upperCurve = padX(length * .61) * .25 + bow;
  const lowerCurve = padX(length * .61) + bow * .55;
  const wristX = padX(wrist);
  const tipX = padX(tip);
  paint.save();
  paint.translate(rootX, rootY);
  paint.rotate(Math.atan2(-dx, dy));

  const traceArmContour = closedCap => {
    paint.beginPath();
    paint.moveTo(-shoulderHalfWidth, 0);
    paint.bezierCurveTo(upperCurve - shoulderHalfWidth, length * .32,
      lowerCurve - forearmHalfWidth, length * .61, wristX - wristHalfWidth, wrist);
    paint.bezierCurveTo(padX(length * .91) - wristHalfWidth, length * .91,
      padX(length - 3.7) - 9.4, length - 3.7, padX(length + .8) - 9.4, length + .8);
    paint.bezierCurveTo(padX(length + 7) - 9.4, length + 7, tipX - 6.0, tip, tipX, tip);
    paint.bezierCurveTo(tipX + 6.0, tip, padX(length + 7) + 9.4, length + 7,
      padX(length + .8) + 9.4, length + .8);
    paint.bezierCurveTo(padX(length - 3.7) + 9.4, length - 3.7,
      padX(length * .91) + wristHalfWidth, length * .91, wristX + wristHalfWidth, wrist);
    paint.bezierCurveTo(lowerCurve + forearmHalfWidth, length * .61,
      upperCurve + shoulderHalfWidth, length * .32, shoulderHalfWidth, 0);
    if (closedCap) {
      paint.bezierCurveTo(shoulderHalfWidth, -shoulderHalfWidth * .55,
        -shoulderHalfWidth, -shoulderHalfWidth * .55, -shoulderHalfWidth, 0);
      paint.closePath();
    }
  };

  if (mode === 'outline') {
    traceArmContour(true);
    stroke(paint, ivory, silhouetteWidth);
    if (coat.rim) stroke(paint, coat.rim, 2.0);
  } else if (mode === 'under') {
    traceArmContour(true);
    if (coat.arm !== coat.paw) {
      const armGrad = paint.createLinearGradient(0, 0, 0, tip);
      armGrad.addColorStop(0, coat.arm);
      armGrad.addColorStop(.52, coat.arm);
      armGrad.addColorStop(.82, coat.paw);
      armGrad.addColorStop(1, coat.paw);
      fillShape(paint, armGrad);
    } else {
      fillShape(paint, coat.arm);
    }
  } else {
    traceArmContour(true);
    const fadeEnd = MathUtils.lerp(.30, .06, crouch);
    const armGrad = paint.createLinearGradient(0, -shoulderHalfWidth * .35, 0, tip);
    armGrad.addColorStop(0, `${coat.arm}00`);
    armGrad.addColorStop(fadeEnd, coat.arm);
    if (coat.arm !== coat.paw) {
      armGrad.addColorStop(Math.max(fadeEnd + .18, .54), coat.arm);
      armGrad.addColorStop(.83, coat.paw);
      armGrad.addColorStop(1, coat.paw);
    } else {
      armGrad.addColorStop(1, coat.arm);
    }
    fillShape(paint, armGrad);

    const innerEdge = (1 - .78 * splay);
    if (innerEdge > .02) {
      traceArmContour(false);
      const edge = paint.createLinearGradient(0, 0, 0, tip);
      edge.addColorStop(0, `${coat.armEdge[0]}00`);
      edge.addColorStop(MathUtils.lerp(.16, .04, crouch), `${coat.armEdge[0]}00`);
      edge.addColorStop(.42, coat.armEdge[0]);
      edge.addColorStop(.85, coat.armEdge[1]);
      edge.addColorStop(1, `${coat.armEdge[1]}00`);
      paint.globalAlpha *= innerEdge;
      stroke(paint, edge, 1.3);
    }
    if (coat.species === 'dog') {
      // Cute subtle dog paw toe-separation creases
      paint.globalAlpha = .42;
      paint.beginPath();
      for (const tx of [-3.3, 3.3]) {
        paint.moveTo(tipX + tx, tip - 5.2);
        paint.lineTo(tipX + tx * 1.05, tip - 1.0);
      }
      stroke(paint, coat.rim ?? coat.armEdge[1], 1.15);
    }
  }
  paint.restore();
}

export function createMidnightCat(floatingLayer, {
  catCoat: initialCatCoat = 'black',
  eyeStyle: initialEyeStyle = 'xiaohei',
  headphoneStyle: initialHeadphoneStyle = 'cream',
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'midnight-cat';
  canvas.setAttribute('aria-hidden', 'true');
  const paint = canvas.getContext('2d');
  if (!paint) throw new Error('Could not create the 2D cat canvas.');
  floatingLayer.before(canvas);
  let swapCanvas = null;
  let swapPaint = null;
  let catCoat = Object.hasOwn(midnightPetCoats, initialCatCoat) ? initialCatCoat : 'black';
  let eyeStyle = isEyeStyleAllowed(initialEyeStyle, catCoat) ? initialEyeStyle : 'xiaohei';
  let headphoneStyle = Object.hasOwn(midnightHeadphoneStyles, initialHeadphoneStyle) ? initialHeadphoneStyle : 'cream';
  let dogTongue = 0;

  const model = new Group();
  const paws = [-1, 1].map(side => {
    const suffix = side === -1 ? 'R' : 'L';
    const shoulder = addJoint(model, `ForeShoulder_${suffix}`, bodyCenterX + .110 * side, .380, .141);
    const elbow = addJoint(shoulder, `ForeElbow_${suffix}`, .043 * side, -.185, -.190);
    return { side, wrist: addJoint(elbow, `ForePaw_${suffix}`, -.080 * side, -.055, .270) };
  });
  const pad = new Vector3(0, -.050, .043);
  const pointer = new Vector2();
  const gaze = new Vector2();
  const reaction = { tension: 0, squint: 0, yaw: 0, pitch: 0, roll: 0, blush: 0, mouth: 0, crying: 0, doze: 0, happy: 0, carry: 0, carrySquint: 0, eating: 0, eager: 0 };
  const face = { x: 0, y: headRestY, angle: 0, closed: 0, crying: 0, happy: 0, carry: 0, carrySquint: 0, eating: 0, eager: 0 };
  const anchor = new Vector3();
  const ground = new Vector2();
  let scale = 1;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let elapsed = 0;
  let fire = 0;
  let crouch = 0;
  let carried = false;
  let carryBlend = 0;
  let carryElapsed = 0;
  let carrySwing = 0;
  let carrySwingVel = 0;
  let carryBobY = 0;
  let carryBobVel = 0;
  let carryMotionEnergy = 0;
  let musicMode = false;
  let musicBlend = 0;
  let bobPos = 0;
  let bobVel = 0;
  let tapEnergy = 0;
  let leanTarget = 0;
  let tapLean = 0;
  let tailWag = 0;
  let tailFlick = 0;
  const tailTarget = new Vector3();
  let hasTailTarget = false;
  let tailTargetX = 31;
  let tailTargetY = 18.5;
  let tailHitRel = solveTailHit(tailTargetX, tailTargetY);
  const tailAngles = [...tailRestRel];
  const tailVels = tailRestRel.map(() => 0);
  let tailMoodIndex = 0;
  let nextTailMood = 2.6;
  let tailMirror = 1;
  let tailRootY = -34;
  let tailMotion = null;
  let sleepTailFlickAt = 3.6;
  let sleepTailFlickEnd = -Infinity;
  let sleepTailFlickDir = 1;
  const tailImpacts = [];
  let petSwap = null;
  const walkPuffs = [];

  function spawnWalkPuff(x, y, dir, depthScale) {
    while (walkPuffs.length >= 10) walkPuffs.shift();
    walkPuffs.push({
      x,
      y,
      vx: -dir * (10 + Math.random() * 10) + (Math.random() - .5) * 6,
      vy: -(6 + Math.random() * 8),
      radius: (4.2 + Math.random() * 2.2) * depthScale,
      started: elapsed,
      duration: .34,
    });
  }

  function drawWalkPuffs() {
    for (let i = walkPuffs.length - 1; i >= 0; i--) {
      const p = walkPuffs[i];
      const age = (elapsed - p.started) / p.duration;
      if (age >= 1) {
        walkPuffs.splice(i, 1);
        continue;
      }
      if (age < 0) continue;
      const ease = 1 - (1 - age) * (1 - age);
      const r = p.radius * (.65 + .65 * ease);
      paint.save();
      paint.globalAlpha = (1 - MathUtils.smoothstep(age, .25, 1)) * .75;
      ellipse(paint, p.x + p.vx * age, p.y + p.vy * ease, r, r * .72, ivory);
      paint.globalAlpha *= .32;
      paint.beginPath();
      paint.ellipse(p.x + p.vx * age, p.y + p.vy * ease, r, r * .72, 0, 0, Math.PI * 2);
      stroke(paint, '#6d7384', .9);
      paint.restore();
    }
  }

  function projectScreen(object, x, y, z, camera) {
    object.localToWorld(anchor.set(x, y, z)).project(camera);
    anchor.x = (anchor.x * .5 + .5) * viewportWidth;
    anchor.y = (.5 - anchor.y * .5) * viewportHeight;
    return anchor;
  }

  function projectWorld(point, camera) {
    anchor.copy(point).project(camera);
    anchor.x = (anchor.x * .5 + .5) * viewportWidth;
    anchor.y = (.5 - anchor.y * .5) * viewportHeight;
    return anchor;
  }

  function containsHeadPoint(x, y) {
    const liftY = (-22 + carryBobY) * carryBlend;
    paint.save();
    paint.resetTransform();
    positionHead(paint, face);
    const hit = paint.isPointInPath(getHeadShape(catCoat), (x - ground.x) / scale, (y - ground.y) / scale - liftY);
    paint.restore();
    return hit;
  }

  return {
    model,
    pawContact: { pad, outerToes: new Vector3(.020, -.047, .052) },
    isDog() {
      return isDogCoat(catCoat);
    },
    isSwapping() {
      return Boolean(petSwap);
    },
    canTapTail() {
      return !isDogCoat(catCoat);
    },
    setPointer(x, y) {
      pointer.set(MathUtils.clamp(x, -1, 1), MathUtils.clamp(y, -1, 1));
    },
    setCrouch(amount) {
      crouch = amount;
      if (amount > .05) tailMotion = null;
    },
    setCarried(active) {
      const next = Boolean(active);
      if (next === carried) return;
      carried = next;
      if (carried) {
        petSwap = null;
        carryElapsed = 0;
        tailMotion = null;
        carryBobVel = -54;
        carrySwingVel += (Math.random() < .5 ? -1 : 1) * .95;
      } else {
        bobVel += 26;
      }
    },
    pushCarryMotion(dx, dy) {
      if (!carried) return;
      carrySwingVel += MathUtils.clamp(dx * .048, -2.2, 2.2);
      carryBobVel += MathUtils.clamp(-dy * .78, -32, 32);
      carryMotionEnergy = Math.min(1, carryMotionEnergy + Math.hypot(dx, dy) * .022);
    },
    setCatCoat(coat) {
      if (!Object.hasOwn(midnightPetCoats, coat)) return;
      if (coat === catCoat) return;
      const prevCoat = catCoat;
      const prevEye = eyeStyle;
      let fromStartDepth = 0;
      if (petSwap) {
        const tIn = MathUtils.clamp((petSwap.elapsed - petSwap.enterDelay) / petSwap.enterDuration, 0, 1);
        const easedIn = 1 - Math.pow(1 - tIn, 3);
        fromStartDepth = MathUtils.clamp(1 - easedIn, 0, .72);
      }
      catCoat = coat;
      if (isDogCoat(catCoat)) tailMotion = null;
      if (!isEyeStyleAllowed(eyeStyle, catCoat)) eyeStyle = 'xiaohei';
      if (carryBlend < .15 && !carried) {
        petSwap = {
          fromCoat: prevCoat,
          fromEye: prevEye,
          toCoat: catCoat,
          toEye: eyeStyle,
          elapsed: 0,
          fromStartDepth,
          exitDuration: .44,
          enterDelay: .34,
          enterDuration: .58,
          outSteps: 0,
          inSteps: 0,
        };
      }
    },
    setEyeStyle(style) {
      if (isEyeStyleAllowed(style, catCoat)) {
        eyeStyle = style;
        if (petSwap) petSwap.toEye = eyeStyle;
      }
    },
    setHeadphoneStyle(style) {
      if (Object.hasOwn(midnightHeadphoneStyles, style)) headphoneStyle = style;
    },
    setMusicMode(enabled) {
      musicMode = Boolean(enabled);
    },
    onKeyTap(side, heavy = false) {
      bobVel += heavy ? 32 : 28;
      tapEnergy = Math.min(1, tapEnergy + (heavy ? .85 : .55));
      leanTarget = (side === 'left' ? -1 : side === 'right' ? 1 : .65) * (heavy ? 1.25 : 1);
      if (!heavy) tailFlick = MathUtils.clamp(tailFlick + (side === 'left' ? -.13 : .13), -.22, .22);
    },
    flickTail() {
      sleepTailFlickEnd = elapsed + .82;
      sleepTailFlickAt = sleepTailFlickEnd + 3.4 + Math.random() * 2.6;
      sleepTailFlickDir = -sleepTailFlickDir;
      tailFlick = .22 * sleepTailFlickDir;
    },
    tapTail(surface, time, held = false) {
      tailTarget.copy(surface);
      hasTailTarget = true;
      if (tailMoods[tailMoodIndex].side < 0) {
        tailMoodIndex = 0;
        nextTailMood = elapsed + 3.2;
      }
      tailMotion = {
        started: elapsed,
        releaseAt: held ? Infinity : elapsed + tailHold,
        impacted: false,
      };
    },
    releaseTail() {
      if (tailMotion?.releaseAt === Infinity) {
        tailMotion.releaseAt = Math.max(elapsed, tailMotion.started + tailMinimumHold);
      }
    },
    setReaction({ tension = 0, squint = 0, yaw = 0, pitch = 0, roll = 0, blush = 0, mouth = 0,
      crying = 0, doze = 0, happy = 0, carry = 0, carrySquint = 0, eating = 0, eager = 0 } = {}) {
      Object.assign(reaction, { tension, squint, yaw, pitch, roll, blush, mouth, crying, doze, happy, carry, carrySquint, eating, eager });
    },
    update(seconds) {
      elapsed += seconds;
      if (petSwap) {
        petSwap.elapsed += seconds;
        const total = petSwap.enterDelay + petSwap.enterDuration;
        if (petSwap.elapsed < petSwap.exitDuration) {
          const tOut = petSwap.elapsed / petSwap.exitDuration;
          const stepIndex = Math.floor(tOut * 3.5);
          if (stepIndex > petSwap.outSteps && tOut < .78) {
            petSwap.outSteps = stepIndex;
            const d = MathUtils.lerp(petSwap.fromStartDepth, 1, Math.pow(tOut, 1.45));
            const s = 1 - .56 * d;
            const side = stepIndex % 2 === 0 ? -1 : 1;
            spawnWalkPuff(-34 * d + side * 22 * s, -54 * d + 2, -1, s);
          }
        }
        if (petSwap.elapsed >= petSwap.enterDelay && petSwap.elapsed < total) {
          const tIn = (petSwap.elapsed - petSwap.enterDelay) / petSwap.enterDuration;
          const stepIndex = Math.floor(tIn * 4.0);
          if (stepIndex > petSwap.inSteps && tIn > .12 && tIn < .94) {
            petSwap.inSteps = stepIndex;
            const d = Math.pow(1 - tIn, 2.4);
            const s = 1 - .56 * d;
            const side = stepIndex % 2 === 0 ? -1 : 1;
            spawnWalkPuff(30 * d + side * 22 * s, -54 * d + 2, 1, s);
          }
        }
        if (petSwap.elapsed >= total) {
          petSwap = null;
          bobVel += 28;
        }
      }
      carryBlend = MathUtils.damp(carryBlend, carried ? 1 : 0, carried ? 11 : 12, seconds);
      if (carried) carryElapsed += seconds;
      carrySwingVel += (-34 * carrySwing - 6.2 * carrySwingVel) * seconds;
      carrySwing = MathUtils.clamp(carrySwing + carrySwingVel * seconds, -.36, .36);
      carryBobVel += (-140 * carryBobY - 14 * carryBobVel) * seconds;
      carryBobY = MathUtils.clamp(carryBobY + carryBobVel * seconds, -14, 14);
      carryMotionEnergy = MathUtils.damp(carryMotionEnergy, 0, 3.0, seconds);
      if (!carried && carryBlend < .02) {
        carrySwing = MathUtils.damp(carrySwing, 0, 14, seconds);
        carrySwingVel = MathUtils.damp(carrySwingVel, 0, 14, seconds);
      }
      fire = MathUtils.damp(fire, reaction.tension * (1 - carryBlend), reaction.tension > fire ? 10 : 6, seconds);
      musicBlend = MathUtils.damp(musicBlend, musicMode ? 1 : 0, musicMode ? 9 : 11, seconds);
      bobVel += (-180 * bobPos - 17 * bobVel) * seconds;
      bobPos = MathUtils.clamp(bobPos + bobVel * seconds, -1, 2);
      tapEnergy = MathUtils.damp(tapEnergy, 0, 6.5, seconds);
      tapLean = MathUtils.damp(tapLean, leanTarget * tapEnergy, 16, seconds);
      tailFlick = MathUtils.damp(tailFlick, 0, 11, seconds);
      const isDog = isDogCoat(catCoat);
      const dogHappyBoost = isDog ? (1.5 + 2.8 * Math.max(reaction.happy, reaction.blush, reaction.eating, reaction.eager) + 3.2 * tapEnergy) : 0;
      tailWag += seconds * (2.3 + dogHappyBoost + 4.8 * tapEnergy + 3.2 * reaction.tension + 2.8 * musicBlend * (1 - crouch) + 3.8 * reaction.eating + 4.2 * carryBlend);
      const wantTongue = isDog && !carried && carryBlend < .12 && reaction.doze < .25 && reaction.tension < .25 && reaction.crying < .15
        ? Math.max(
          reaction.happy * .96,
          MathUtils.smoothstep(reaction.blush, .45, .92) * 1.0,
          MathUtils.smoothstep(tapEnergy, .20, .82) * .78,
          (catCoat === 'samoyed' || catCoat === 'golden' || catCoat === 'husky' || catCoat === 'corgi')
            ? .62 * (1 - crouch)
            : .32 * (1 - crouch),
        )
        : 0;
      dogTongue = MathUtils.damp(dogTongue, wantTongue, wantTongue > dogTongue ? 11 : 14, seconds);
      const pointerX = pointer.x * (1 - reaction.doze) * (1 - .7 * reaction.happy) * (1 - .75 * carryBlend);
      const pointerY = pointer.y * (1 - reaction.doze) * (1 - .7 * reaction.happy) * (1 - .75 * carryBlend);
      const tensionDown = reaction.tension * (1 - reaction.doze) * (1 - carryBlend);
      const effectiveCrouch = crouch * (1 - carryBlend);
      const stand = 1 - effectiveCrouch;
      const napBreath = Math.sin(elapsed * 2.1) * reaction.doze * (1 - carryBlend);
      const carryGazeX = Math.sin(carryElapsed * 3.1) * 3.2 * carryBlend - carrySwing * 14 * carryBlend;
      const carryGazeY = (2.6 + Math.sin(carryElapsed * 4.7) * 1.4) * carryBlend;
      gaze.x = MathUtils.damp(gaze.x, pointerX * 8.5 + carryGazeX, 15, seconds);
      gaze.y = MathUtils.damp(gaze.y, pointerY * -8.5 + carryGazeY, 15, seconds);
      face.x = MathUtils.damp(face.x,
        (pointerX * 9.5 + tapLean * 4.2 + reaction.yaw * 16) * stand - 36 * effectiveCrouch, 11, seconds);
      face.y = MathUtils.damp(face.y,
        MathUtils.lerp(headRestY - pointerY * 6.5 + reaction.pitch * 24 + tensionDown * 8 + bobPos * 4.5 - 3 * carryBlend,
          -28 + 1.8 * napBreath, effectiveCrouch), 11, seconds);
      face.angle = MathUtils.damp(face.angle,
        (pointerX * .095 - pointerX * pointerY * .03 + tapLean * .068 + reaction.roll * .85) * stand
          + (-.24 - .018 * napBreath) * effectiveCrouch + carrySwing * .34 * carryBlend, 11, seconds);
      face.closed = MathUtils.damp(face.closed, reaction.squint, 13, seconds);
      face.crying = MathUtils.damp(face.crying, reaction.crying, 12, seconds);
      face.happy = MathUtils.damp(face.happy, reaction.happy, 11, seconds);
      face.eating = MathUtils.damp(face.eating, reaction.eating, 13, seconds);
      face.eager = MathUtils.damp(face.eager, reaction.eager, 13, seconds);
      face.carry = MathUtils.damp(face.carry, Math.max(reaction.carry, carryBlend), 13, seconds);
      const targetCarrySquint = Math.max(reaction.carrySquint,
        carryBlend * MathUtils.smoothstep(carryMotionEnergy, .48, .88));
      face.carrySquint = MathUtils.damp(face.carrySquint, targetCarrySquint, 14, seconds);

      if (!tailMotion && effectiveCrouch < .1 && carryBlend < .1 && elapsed >= nextTailMood) {
        let next = Math.floor(Math.random() * (tailMoods.length - 1));
        if (next >= tailMoodIndex) next++;
        tailMoodIndex = next;
        const mood = tailMoods[tailMoodIndex];
        nextTailMood = elapsed + mood.min + Math.random() * (mood.max - mood.min);
      }
      const activeMood = effectiveCrouch > .25
        ? { side: 1, rel: tailSleepRel }
        : isDog
          ? { side: tailMoods[tailMoodIndex].side, rel: dogTailRestRel }
          : tailMoods[tailMoodIndex];
      const desiredSide = tailMotion || carryBlend > .2 ? 1 : activeMood.side;
      tailMirror = MathUtils.damp(tailMirror, desiredSide, tailMotion || carryBlend > .2 ? 14 : 5.5, seconds);
      const baseTailRootY = MathUtils.lerp(desiredSide < 0 ? -44 : -34, -14, effectiveCrouch);
      tailRootY = MathUtils.damp(tailRootY, MathUtils.lerp(baseTailRootY, -22, carryBlend), 10, seconds);
      const moodRel = activeMood.rel;

      if (effectiveCrouch > .45 && !tailMotion) {
        if (elapsed >= sleepTailFlickAt) {
          sleepTailFlickEnd = elapsed + 1.05;
          sleepTailFlickAt = sleepTailFlickEnd + 3.2 + Math.random() * 2.8;
          sleepTailFlickDir = -sleepTailFlickDir;
        }
      } else if (effectiveCrouch <= .2) {
        sleepTailFlickAt = elapsed + 2.8 + Math.random() * 2.2;
        sleepTailFlickEnd = -Infinity;
      }
      const sleepFlickRemaining = sleepTailFlickEnd - elapsed;
      const sleepFlickPhase = sleepFlickRemaining > 0 ? 1 - sleepFlickRemaining / 1.05 : -1;
      const sleepFlickWave = sleepFlickPhase >= 0 && sleepFlickPhase <= 1
        ? Math.sin(Math.PI * sleepFlickPhase) * Math.sin(sleepFlickPhase * Math.PI * 2.2) * sleepTailFlickDir * effectiveCrouch
        : 0;

      const dogWagExtra = isDog ? (.065 + .085 * Math.max(reaction.happy, reaction.blush)) : 0;
      const wagAmp = (.052 + dogWagExtra + .062 * tapEnergy + .05 * reaction.tension + .065 * musicBlend) * (1 - .68 * effectiveCrouch)
        + (.095 + .075 * carryMotionEnergy) * carryBlend;
      const steps = Math.max(1, Math.ceil(seconds / .008));
      const dt = seconds / steps;
      const stepStart = elapsed - seconds;
      for (let s = 1; s <= steps; s++) {
        const now = stepStart + s * dt;
        const motion = tailMotion;
        const activeAge = motion ? now - motion.started : Infinity;
        const activeRelease = motion ? motion.releaseAt - motion.started : -Infinity;
        for (let j = 0; j < tailAngles.length; j++) {
          let target;
          let k;
          let damp;
          const restAngle = MathUtils.lerp(moodRel[j], tailCarryRel[j], carryBlend);
          if (motion) {
            const tj = Math.max(0, activeAge - j * .011);
            if (tj < tailWindTime) {
              target = tailWindRel[j];
              k = tailKDown[j];
              damp = tailDDown[j];
            } else if (tj < activeRelease) {
              target = tailHitRel[j];
              k = tailKDown[j];
              damp = tailDDown[j];
            } else {
              target = restAngle + wagAmp * (.26 + .16 * j) * Math.sin(tailWag - j * .55);
              k = tailKUp[j];
              damp = tailDUp[j];
            }
          } else {
            const sleepKick = sleepFlickWave * (j === 0 ? .10 : j === 1 ? .18 : .30);
            const carryLag = carrySwing * (.14 + .09 * j) * carryBlend;
            target = restAngle + wagAmp * (.26 + .16 * j) * Math.sin(tailWag - j * .55)
              + (j === 0 ? tailFlick : tailFlick * .45) + sleepKick + carryLag;
            k = tailKUp[j];
            damp = tailDUp[j];
          }
          tailVels[j] += (k * (target - tailAngles[j]) - damp * tailVels[j]) * dt;
          tailAngles[j] += tailVels[j] * dt;
        }
        if (motion && !motion.impacted && activeAge > .035) {
          const tip = computeTailChain(tailAngles)[tailLengths.length];
          if (Math.hypot(tip[0] - tailTargetX, tip[1] - tailTargetY) < 9.5 || activeAge >= .115) {
            motion.impacted = true;
            bobVel += 22;
            while (tailImpacts.length >= 6) tailImpacts.shift();
            tailImpacts.push({ x: tailTargetX, y: tailTargetY, started: now, drift: (Math.random() - .5) * 6 });
          }
        }
        if (motion && now > motion.releaseAt + .36) {
          tailMotion = null;
        }
      }
    },
    draw(camera, width, height, pixelRatio) {
      if (!width || !height) return;
      const pixelWidth = Math.round(width * pixelRatio);
      const pixelHeight = Math.round(height * pixelRatio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      viewportWidth = width;
      viewportHeight = height;
      const base = projectScreen(model, bodyCenterX, .057, .258, camera);
      ground.set(base.x, base.y);
      scale = (projectScreen(model, bodyCenterX + .312, .057, .258, camera).x - ground.x) / 110;
      paint.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      paint.clearRect(0, 0, width, height);
      paint.translate(ground.x, ground.y);
      paint.scale(scale, scale);
      const effectiveCrouch = crouch * (1 - carryBlend);
      const grooveBounce = musicBlend * (1 - effectiveCrouch) * (1 - carryBlend) * .026 * Math.abs(Math.sin(elapsed * 5.8));
      const squash = bobPos * .036 * (1 - effectiveCrouch) * (1 - carryBlend) + grooveBounce;
      const napBreath = Math.sin(elapsed * 2.1) * reaction.doze * (1 - carryBlend);
      const carryStretch = MathUtils.clamp(-carryBobY * .0035, -.035, .04) * carryBlend;
      const baseBodyWidth = (1 + squash * .75 - .014 * napBreath * effectiveCrouch) * (1 - carryStretch * .45);
      const baseBodyHeight = (1 - squash + .038 * napBreath * effectiveCrouch) * (1 + carryStretch);

      const strugglePulse = Math.pow(.5 + .5 * Math.sin(carryElapsed * 2.5 - .6), 2.6);
      const struggleAmp = MathUtils.clamp(.38 + .62 * strugglePulse + .45 * carryMotionEnergy, 0, 1.15);
      const kickPhaseL = carryElapsed * 8.4;
      const kickPhaseR = kickPhaseL + Math.PI;
      const kickLy = (-2.2 - 5.8 * Math.max(0, Math.sin(kickPhaseL))) * struggleAmp * carryBlend;
      const kickRy = (-2.2 - 5.8 * Math.max(0, Math.sin(kickPhaseR))) * struggleAmp * carryBlend;
      const kickLx = (-1.6 - 3.0 * Math.sin(kickPhaseL)) * struggleAmp * carryBlend;
      const kickRx = (1.6 + 3.0 * Math.sin(kickPhaseR)) * struggleAmp * carryBlend;

      const carryLiftY = (-22 + carryBobY) * carryBlend;
      const scruffPivotY = -162;
      const carrySquirmAngle = Math.sin(carryElapsed * 8.4) * .026 * struggleAmp;
      const carryAngle = (carrySwing + carrySquirmAngle) * carryBlend;

      const baseArmTargets = paws.map(({ side, wrist }) => {
        const point = projectScreen(wrist, pad.x, pad.y, pad.z, camera);
        const rawX = (point.x - ground.x) / scale;
        const rawY = (point.y - ground.y) / scale;
        const standingY = rawY < 0 ? rawY * baseBodyHeight : rawY;
        const baseX = MathUtils.lerp(rawX, side < 0 ? -50 : -13, effectiveCrouch);
        const baseY = MathUtils.lerp(standingY, side < 0 ? -3 : -4, effectiveCrouch);
        const paddlePhase = carryElapsed * 8.6 + (side < 0 ? 0 : Math.PI);
        const paddleUp = Math.sin(paddlePhase) * (3.8 + 8.5 * struggleAmp);
        const paddleOut = Math.cos(paddlePhase) * (2.0 + 4.8 * struggleAmp) * side;
        const carryX = side * (19.5 + 2.8 * struggleAmp) + paddleOut - carrySwing * 9;
        const carryY = -38 - Math.abs(Math.sin(paddlePhase * .5)) * 6 * struggleAmp + paddleUp;
        return {
          side,
          x: MathUtils.lerp(baseX, carryX, carryBlend),
          y: MathUtils.lerp(baseY, carryY, carryBlend),
        };
      });
      if (hasTailTarget) {
        const point = projectWorld(tailTarget, camera);
        const nextX = (point.x - ground.x) / (scale * baseBodyWidth);
        const nextY = (point.y - ground.y) / (scale * baseBodyHeight);
        if (Math.hypot(nextX - tailTargetX, nextY - tailTargetY) > 1.5) {
          tailTargetX = nextX;
          tailTargetY = nextY;
          tailHitRel = solveTailHit(tailTargetX, tailTargetY);
        }
      }
      const footScreenOffsets = [-1, 1].map(side => {
        const foot = projectScreen(model, bodyCenterX + side * .110, 0, .168, camera);
        return {
          side,
          fx: MathUtils.lerp((foot.x - ground.x) / scale, side < 0 ? -24 : 36, effectiveCrouch),
          fy: MathUtils.lerp((foot.y - ground.y) / scale, 3, effectiveCrouch),
        };
      });

      const renderPetSprite = (ctx, spriteCoatKey, spriteEyeStyle, walk = null) => {
        const coat = catCoatPalettes[spriteCoatKey] ?? catCoatPalettes.black;
        const isDog = coat.species === 'dog';
        const walkIntensity = walk ? walk.intensity : 0;
        const spriteCrouch = walk ? effectiveCrouch * (1 - walkIntensity) : effectiveCrouch;
        const spriteCarry = walk ? 0 : carryBlend;
        const stepWave = walk ? Math.sin(walk.phase) : 0;
        const stepHop = walk ? -Math.abs(stepWave) * 9.5 * walkIntensity : 0;
        const walkRoll = walk ? stepWave * .095 * walkIntensity : 0;
        const walkSquash = walk ? (.042 - .065 * Math.abs(stepWave)) * walkIntensity : 0;
        const bodyWidth = (walk ? 1 + walkSquash * .75 : baseBodyWidth);
        const bodyHeight = (walk ? 1 - walkSquash : baseBodyHeight);

        // Diagonal quadruped catwalk gait: left-front + right-hind alternate with right-front + left-hind
        const frontLiftL = walk ? Math.max(0, Math.sin(walk.phase)) * walkIntensity : 0;
        const frontLiftR = walk ? Math.max(0, -Math.sin(walk.phase)) * walkIntensity : 0;
        const hindStepL = frontLiftR * 9.5;
        const hindStepR = frontLiftL * 9.5;

        const activeBody = spriteCrouch > .002 || spriteCarry > .002 || hindStepL > .05 || hindStepR > .05
          ? createBodyPath(spriteCrouch, spriteCarry, kickLx, kickLy, kickRx, kickRy, isDog, hindStepL, hindStepR)
          : (isDog ? dogBodyShape : bodyShape);

        const armTargets = walk
          ? baseArmTargets.map(({ side, x, y }) => {
            const pawPhase = walk.phase + (side < 0 ? 0 : Math.PI);
            const lift = Math.max(0, Math.sin(pawPhase));
            const cross = Math.sin(pawPhase) * 8.5 * -side;
            const walkX = side * 25 + cross;
            const walkY = -3 - 22 * lift + 2.8 * (1 - lift);
            return {
              side,
              x: MathUtils.lerp(x, walkX, walkIntensity),
              y: MathUtils.lerp(y, walkY, walkIntensity),
            };
          })
          : baseArmTargets;

        const spriteFace = walk
          ? {
            ...face,
            x: MathUtils.lerp(face.x, stepWave * 4.2 + walk.dir * -3.5, walkIntensity),
            y: MathUtils.lerp(face.y, headRestY, walkIntensity) + stepHop * .48,
            angle: MathUtils.lerp(face.angle, -walkRoll * .52 + walk.dir * -.045, walkIntensity),
            closed: face.closed * (1 - walkIntensity),
            carry: 0,
            carrySquint: 0,
          }
          : face;

        const activeHeadShape = getHeadShape(spriteCoatKey);
        const activeTailWidth = coat.stubbyTail ? 19.5 : isDog ? 18.8 : tailWidth;
        const activeTailLengths = coat.stubbyTail ? stubbyTailLengths : tailLengths;
        const tailRootX = MathUtils.lerp(
          MathUtils.lerp((coat.stubbyTail ? 40 : 45) * tailMirror, 61, spriteCrouch),
          34 * tailMirror,
          spriteCarry,
        );
        const spriteTailAngles = walk
          ? tailAngles.map((a, j) => {
            const baseRest = isDog ? dogTailRestRel[j] : tailRestRel[j];
            return MathUtils.lerp(a, baseRest + (.12 + .06 * j) * Math.sin(walk.phase - j * .45), walkIntensity);
          })
          : tailAngles;
        const tailPoints = computeTailChain(spriteTailAngles, tailRootX, walk ? -34 : tailRootY, tailMirror, activeTailLengths);
        const dogTailPath = isDog
          ? buildFluffyDogTailPath(sampleTailSpline(tailPoints, 7), activeTailWidth * .54, Boolean(coat.stubbyTail))
          : null;
        const earBounce = bobPos * .32 + musicBlend * Math.sin(elapsed * 5.8) * .45
          + Math.sin(carryElapsed * 8.4) * .55 * spriteCarry + stepWave * .55 * walkIntensity;
        const spriteTongue = isDog
          ? (walk ? (spriteCoatKey === 'samoyed' || spriteCoatKey === 'golden' || spriteCoatKey === 'husky' || spriteCoatKey === 'corgi' ? .62 : .38) : dogTongue)
          : 0;

        const applyCarryPendulum = () => {
          if (spriteCarry <= .001) return;
          ctx.translate(0, scruffPivotY);
          ctx.rotate(carryAngle);
          ctx.translate(0, -scruffPivotY);
        };
        const applyBodyTransform = () => {
          applyCarryPendulum();
          ctx.translate(0, 4 * spriteCrouch);
          ctx.scale(bodyWidth, bodyHeight);
          ctx.translate(0, -4 * spriteCrouch);
        };

        ctx.save();
        if (walk) {
          ctx.translate(walk.offsetX, walk.offsetY);
          ctx.scale(walk.depthScale, walk.depthScale);
        }

        if (!walk && fire > .025) drawFire(ctx, fire, elapsed);
        const footShadowAlpha = (1 - MathUtils.smoothstep(spriteCarry, 0, .55)) * (walk ? (.65 + .35 * (1 - walk.depth)) : 1);
        if (footShadowAlpha > .01) {
          ctx.save();
          ctx.globalAlpha = footShadowAlpha;
          if (walk) {
            ctx.save();
            ctx.translate(0, 3);
            ctx.scale(1, .34);
            const floorShadow = ctx.createRadialGradient(0, 0, 4, 0, 0, 46);
            floorShadow.addColorStop(0, '#14172252');
            floorShadow.addColorStop(1, '#14172200');
            ellipse(ctx, 0, 0, 46, 46, floorShadow);
            ctx.restore();
          } else {
            for (const { fx, fy } of footScreenOffsets) {
              drawFootShadow(ctx, fx, fy);
            }
          }
          ctx.restore();
        }

        ctx.translate(0, (walk ? stepHop : carryLiftY));
        if (walk && Math.abs(walkRoll) > .0005) {
          ctx.translate(0, -24);
          ctx.rotate(walkRoll);
          ctx.translate(0, 24);
        }

        // Lay down the outline before filling the overlapping shapes.
        ctx.save();
        applyBodyTransform();
        if (dogTailPath) {
          stroke(ctx, ivory, silhouetteWidth, dogTailPath);
          if (coat.rim) stroke(ctx, coat.rim, 2.0, dogTailPath);
        } else {
          drawTailChain(ctx, tailPoints, ivory, activeTailWidth + silhouetteWidth);
          if (coat.rim) drawTailChain(ctx, tailPoints, coat.rim, activeTailWidth + 2.0);
        }
        stroke(ctx, ivory, silhouetteWidth, activeBody);
        if (coat.rim) stroke(ctx, coat.rim, 2.0, activeBody);
        ctx.restore();
        ctx.save();
        applyCarryPendulum();
        for (const arm of armTargets) {
          drawArm(ctx, arm.side, arm.x, arm.y, bodyHeight, spriteCrouch, 'outline', spriteCoatKey, spriteCarry);
        }
        ctx.restore();
        const closed = Math.max(spriteFace.closed, spriteFace.crying, spriteFace.carrySquint ?? 0);
        const eyeOffset = resolveFaceGaze(gaze, walk ? 0 : reaction.tension, closed);
        const whiskerTwitch = .55 * Math.sin(elapsed * 2.4) + bobPos * .85 + (walk ? 0 : reaction.tension * .9)
          + (1.25 * Math.sin(elapsed * 15) * spriteCarry);
        ctx.save();
        positionHead(ctx, spriteFace);
        if (!isDog) {
          drawWhiskers(ctx, coat.whiskerHalo, 2.6, whiskerTwitch, eyeOffset.x * .82, eyeOffset.y * .82);
        }
        stroke(ctx, ivory, silhouetteWidth, activeHeadShape);
        if (coat.rim) stroke(ctx, coat.rim, 2.0, activeHeadShape);
        if (isDog) drawDogEarFlaps(ctx, spriteCoatKey, 'outline', earBounce);
        ctx.restore();
        // Solid arm base behind body so outward-reaching arms stay 100% opaque outside the torso.
        ctx.save();
        applyCarryPendulum();
        for (const arm of armTargets) {
          drawArm(ctx, arm.side, arm.x, arm.y, bodyHeight, spriteCrouch, 'under', spriteCoatKey, spriteCarry);
        }
        ctx.restore();
        ctx.save();
        applyBodyTransform();
        if (dogTailPath) {
          ctx.fillStyle = coat.tail;
          ctx.fill(dogTailPath);
        } else {
          drawTailChain(ctx, tailPoints, coat.tail, activeTailWidth);
        }
        drawTailMarkings(ctx, tailPoints, spriteCoatKey, activeTailWidth, dogTailPath);
        ctx.fillStyle = coat.body;
        ctx.fill(activeBody);
        drawBodyMarkings(ctx, activeBody, spriteCoatKey, spriteCrouch, spriteCarry, kickLx, kickLy, kickRx, kickRy);
        if (isDog) drawDogChestFluff(ctx, coat, spriteCrouch, spriteCarry);
        const haunchAlpha = MathUtils.smoothstep(spriteCrouch, .35, .95) * .68 * (1 - spriteCarry);
        if (haunchAlpha > .01) {
          ctx.globalAlpha = haunchAlpha;
          ctx.beginPath();
          ctx.moveTo(22, -33);
          ctx.bezierCurveTo(45, -35, 55, -16, 44, 2);
          stroke(ctx, coat.haunch, 1.5);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
        ctx.save();
        applyCarryPendulum();
        for (const arm of armTargets) {
          drawArm(ctx, arm.side, arm.x, arm.y, bodyHeight, spriteCrouch, 'over', spriteCoatKey, spriteCarry);
        }
        if (spriteCarry > .12) {
          drawCarryStruggleLines(ctx, spriteCarry * MathUtils.smoothstep(struggleAmp, .42, 1.05), elapsed);
        }
        ctx.restore();
        drawHead(ctx, gaze, walk ? { ...reaction, tension: 0, mouth: 0 } : reaction, spriteFace,
          whiskerTwitch, spriteEyeStyle, elapsed, musicBlend, headphoneStyle, spriteCoatKey, earBounce, spriteTongue);
        if (!walk && tailImpacts.length) {
          drawTailImpacts(ctx, tailImpacts, elapsed);
        }
        ctx.restore();
      };

      if (petSwap) {
        if (!swapCanvas) {
          swapCanvas = document.createElement('canvas');
          swapPaint = swapCanvas.getContext('2d');
        }
        if (swapCanvas.width !== pixelWidth || swapCanvas.height !== pixelHeight) {
          swapCanvas.width = pixelWidth;
          swapCanvas.height = pixelHeight;
        }
        const layers = [];
        const tOut = MathUtils.clamp(petSwap.elapsed / petSwap.exitDuration, 0, 1);
        if (tOut < 1) {
          const depth = MathUtils.lerp(petSwap.fromStartDepth, 1, Math.pow(tOut, 1.45));
          layers.push({
            coatKey: petSwap.fromCoat,
            eye: petSwap.fromEye,
            walk: {
              depth,
              offsetX: -34 * depth,
              offsetY: -54 * depth,
              depthScale: 1 - .56 * depth,
              alpha: 1 - MathUtils.smoothstep(tOut, .58, 1),
              phase: tOut * Math.PI * 3.5,
              intensity: MathUtils.smoothstep(tOut, 0, .14),
              dir: -1,
            },
          });
        }
        if (petSwap.elapsed >= petSwap.enterDelay) {
          const tIn = MathUtils.clamp((petSwap.elapsed - petSwap.enterDelay) / petSwap.enterDuration, 0, 1);
          const depth = Math.pow(1 - tIn, 2.4);
          layers.push({
            coatKey: petSwap.toCoat,
            eye: petSwap.toEye,
            walk: {
              depth,
              offsetX: 30 * depth,
              offsetY: -54 * depth,
              depthScale: 1 - .56 * depth,
              alpha: MathUtils.smoothstep(tIn, 0, .22),
              phase: tIn * Math.PI * 4.0,
              intensity: 1 - MathUtils.smoothstep(tIn, .80, 1),
              dir: 1,
            },
          });
        }
        layers.sort((a, b) => b.walk.depth - a.walk.depth);
        for (const layer of layers) {
          if (swapPaint && layer.walk.alpha < .995) {
            swapPaint.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            swapPaint.clearRect(0, 0, width, height);
            swapPaint.translate(ground.x, ground.y);
            swapPaint.scale(scale, scale);
            renderPetSprite(swapPaint, layer.coatKey, layer.eye, layer.walk);
            paint.save();
            paint.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            paint.globalAlpha = layer.walk.alpha;
            paint.drawImage(swapCanvas, 0, 0, width, height);
            paint.restore();
          } else {
            renderPetSprite(paint, layer.coatKey, layer.eye, layer.walk);
          }
        }
      } else {
        renderPetSprite(paint, catCoat, eyeStyle, null);
      }
      if (walkPuffs.length) drawWalkPuffs();
    },
    containsHeadPoint,
    containsScreenPoint(x, y) {
      if (containsHeadPoint(x, y)) return true;
      const isDog = isDogCoat(catCoat);
      const effectiveCrouch = crouch * (1 - carryBlend);
      const liftY = (-22 + carryBobY) * carryBlend;
      const activeBody = effectiveCrouch > .002 || carryBlend > .002
        ? createBodyPath(effectiveCrouch, carryBlend, 0, 0, 0, 0, isDog)
        : (isDog ? dogBodyShape : bodyShape);
      const localX = (x - ground.x) / scale;
      const localY = (y - ground.y) / scale - liftY;
      paint.save();
      paint.resetTransform();
      const hit = paint.isPointInPath(activeBody, localX, localY);
      paint.restore();
      return hit;
    },
    projectHead(x, y, target) {
      const liftY = (-22 + carryBobY) * carryBlend;
      const localX = x * 300;
      const localY = (.102 - y) * 290;
      const cos = Math.cos(face.angle);
      const sin = Math.sin(face.angle);
      const screenX = ground.x + scale * (face.x + localX * cos - localY * sin);
      const screenY = ground.y + scale * (face.y + liftY + localX * sin + localY * cos);
      return target.set(2 * screenX / viewportWidth - 1, 1 - 2 * screenY / viewportHeight, 0);
    },
    dispose() {
      canvas.remove();
    },
  };
}

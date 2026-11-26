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

function createBodyPath(sleep, carry = 0, kickLx = 0, kickLy = 0, kickRx = 0, kickRy = 0) {
  const path = new Path2D();
  const baseStartX = MathUtils.lerp(standingBodyStart[0], lyingBodyStart[0], sleep);
  const baseStartY = MathUtils.lerp(standingBodyStart[1], lyingBodyStart[1], sleep);
  path.moveTo(
    MathUtils.lerp(baseStartX, carriedBodyStart[0], carry),
    MathUtils.lerp(baseStartY, carriedBodyStart[1], carry),
  );
  const carriedSegs = carry > .002 ? buildCarriedBodySegs(kickLx, kickLy, kickRx, kickRy) : null;
  for (let i = 0; i < standingBodySegs.length; i++) {
    const a = standingBodySegs[i];
    const b = lyingBodySegs[i];
    let x1 = MathUtils.lerp(a[0], b[0], sleep);
    let y1 = MathUtils.lerp(a[1], b[1], sleep);
    let x2 = MathUtils.lerp(a[2], b[2], sleep);
    let y2 = MathUtils.lerp(a[3], b[3], sleep);
    let x3 = MathUtils.lerp(a[4], b[4], sleep);
    let y3 = MathUtils.lerp(a[5], b[5], sleep);
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

const tailLengths = [20, 20, 19, 18, 17];
const tailRestRel = [.06, -.44, -.56, -.14, .20];
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

function computeTailChain(relAngles, rootX = 45, rootY = -34, mirror = 1) {
  const pts = [[rootX, rootY]];
  let x = rootX;
  let y = rootY;
  let angle = 0;
  for (let i = 0; i < tailLengths.length; i++) {
    angle += relAngles[i];
    x += tailLengths[i] * Math.cos(angle) * mirror;
    y += tailLengths[i] * Math.sin(angle);
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
  const carrySquint = face.carrySquint ?? 0;
  const carry = face.carry ?? 0;
  const closed = Math.max(face.closed, face.crying, carrySquint);
  const lid = MathUtils.smoothstep(closed, .62, .94);
  const { x, y, angry } = eyeOffset;
  const bigBlack = eyeStyle === 'xiaohei' || eyeStyle === 'starry' || eyeStyle === 'glossy';
  const jewelIris = eyeStyle === 'amber' || eyeStyle === 'sapphire';
  const rx = bigBlack ? 12.5 : jewelIris ? 11.8 : eyeStyle === 'lime' ? 11.4 : 10.7;
  const ry = bigBlack ? 12.7 : jewelIris ? 12.1 : eyeStyle === 'lime' ? 11.8 : 11.5;
  paint.save();
  paint.translate(side * ((bigBlack ? 18.8 : 18.2) - 1.1 * angry) + x, y);

  if (lid < 1) {
    const rw = rx * (1 + (bigBlack ? .04 : .06) * angry + .05 * carry);
    const rh = ry * (1 - .86 * closed) * (1 - (bigBlack ? .06 : .08) * angry) * (1 + .06 * carry);
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

function drawTailMarkings(paint, pts, coatKey) {
  if (coatKey !== 'tabby' && coatKey !== 'orange' && coatKey !== 'calico') return;
  const samples = sampleTailSpline(pts);
  const clipPath = buildTailPath(samples, tailWidth * .5);
  paint.save();
  paint.clip(clipPath);
  if (coatKey === 'tabby' || coatKey === 'orange') {
    const stripe = coatKey === 'tabby' ? '#443b35' : '#ce742c';
    const tipColor = coatKey === 'tabby' ? '#403732' : '#fff7eb';
    const last = samples.length - 1;
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
    const last = samples.length - 1;
    for (let i = Math.round(.18 * last); i <= Math.round(.54 * last); i++) {
      ellipse(paint, samples[i][0], samples[i][1], 11.5, 11.5, '#e68a42');
    }
    for (let i = Math.round(.67 * last); i <= last; i++) {
      ellipse(paint, samples[i][0], samples[i][1], 11.5, 11.5, '#2c2a2c');
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
  }
  paint.restore();
}

function drawHeadMarkings(paint, coatKey, featureX, featureY) {
  if (coatKey === 'black') return;
  paint.save();
  paint.clip(headShape);
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

function drawHead(paint, gaze, reaction, face, twitch, eyeStyle, elapsed, musicBlend = 0, headphoneStyle = 'cream', coatKey = 'black') {
  const coat = catCoatPalettes[coatKey] ?? catCoatPalettes.black;
  paint.save();
  positionHead(paint, face);
  const closed = Math.max(face.closed, face.crying, face.carrySquint ?? 0);
  const eyeOffset = resolveFaceGaze(gaze, reaction.tension, closed);
  const featureX = eyeOffset.x * .82;
  const featureY = eyeOffset.y * .82;
  paint.fillStyle = coat.head;
  paint.fill(headShape);
  drawHeadMarkings(paint, coatKey, featureX, featureY);

  for (const side of [-1, 1]) {
    drawEye(paint, side, eyeOffset, gaze, face, eyeStyle, elapsed, coat);
    if (reaction.blush > .01) {
      paint.globalAlpha = reaction.blush * .72;
      ellipse(paint, side * 29 + featureX * .7, 14.5 + featureY * .65, 6.2, 2.9, '#ed89a5', side * .08);
      paint.globalAlpha = 1;
    }
  }

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
  let catCoat = Object.hasOwn(midnightCatCoats, initialCatCoat) ? initialCatCoat : 'black';
  let eyeStyle = isEyeStyleAllowed(initialEyeStyle, catCoat) ? initialEyeStyle : 'xiaohei';
  let headphoneStyle = Object.hasOwn(midnightHeadphoneStyles, initialHeadphoneStyle) ? initialHeadphoneStyle : 'cream';

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
  const reaction = { tension: 0, squint: 0, yaw: 0, pitch: 0, roll: 0, blush: 0, mouth: 0, crying: 0, doze: 0, happy: 0, carry: 0, carrySquint: 0 };
  const face = { x: 0, y: headRestY, angle: 0, closed: 0, crying: 0, happy: 0, carry: 0, carrySquint: 0 };
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
    const hit = paint.isPointInPath(headShape, (x - ground.x) / scale, (y - ground.y) / scale - liftY);
    paint.restore();
    return hit;
  }

  return {
    model,
    pawContact: { pad, outerToes: new Vector3(.020, -.047, .052) },
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
      if (Object.hasOwn(midnightCatCoats, coat)) {
        catCoat = coat;
        if (!isEyeStyleAllowed(eyeStyle, catCoat)) eyeStyle = 'xiaohei';
      }
    },
    setEyeStyle(style) {
      if (isEyeStyleAllowed(style, catCoat)) eyeStyle = style;
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
      crying = 0, doze = 0, happy = 0, carry = 0, carrySquint = 0 } = {}) {
      Object.assign(reaction, { tension, squint, yaw, pitch, roll, blush, mouth, crying, doze, happy, carry, carrySquint });
    },
    update(seconds) {
      elapsed += seconds;
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
      tailWag += seconds * (2.3 + 4.8 * tapEnergy + 3.2 * reaction.tension + 2.8 * musicBlend * (1 - crouch) + 4.2 * carryBlend);
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
      const activeMood = effectiveCrouch > .25 ? { side: 1, rel: tailSleepRel } : tailMoods[tailMoodIndex];
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

      const wagAmp = (.052 + .062 * tapEnergy + .05 * reaction.tension + .065 * musicBlend) * (1 - .68 * effectiveCrouch)
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
      const bodyWidth = (1 + squash * .75 - .014 * napBreath * effectiveCrouch) * (1 - carryStretch * .45);
      const bodyHeight = (1 - squash + .038 * napBreath * effectiveCrouch) * (1 + carryStretch);

      const strugglePulse = Math.pow(.5 + .5 * Math.sin(carryElapsed * 2.5 - .6), 2.6);
      const struggleAmp = MathUtils.clamp(.38 + .62 * strugglePulse + .45 * carryMotionEnergy, 0, 1.15);
      const kickPhaseL = carryElapsed * 8.4;
      const kickPhaseR = kickPhaseL + Math.PI;
      const kickLy = (-2.2 - 5.8 * Math.max(0, Math.sin(kickPhaseL))) * struggleAmp * carryBlend;
      const kickRy = (-2.2 - 5.8 * Math.max(0, Math.sin(kickPhaseR))) * struggleAmp * carryBlend;
      const kickLx = (-1.6 - 3.0 * Math.sin(kickPhaseL)) * struggleAmp * carryBlend;
      const kickRx = (1.6 + 3.0 * Math.sin(kickPhaseR)) * struggleAmp * carryBlend;

      const activeBody = effectiveCrouch > .002 || carryBlend > .002
        ? createBodyPath(effectiveCrouch, carryBlend, kickLx, kickLy, kickRx, kickRy)
        : bodyShape;

      if (fire > .025) drawFire(paint, fire, elapsed);
      const footShadowAlpha = 1 - MathUtils.smoothstep(carryBlend, 0, .55);
      if (footShadowAlpha > .01) {
        paint.save();
        paint.globalAlpha = footShadowAlpha;
        for (const side of [-1, 1]) {
          const foot = projectScreen(model, bodyCenterX + side * .110, 0, .168, camera);
          const fx = MathUtils.lerp((foot.x - ground.x) / scale, side < 0 ? -24 : 36, effectiveCrouch);
          const fy = MathUtils.lerp((foot.y - ground.y) / scale, 3, effectiveCrouch);
          drawFootShadow(paint, fx, fy);
        }
        paint.restore();
      }

      const carryLiftY = (-22 + carryBobY) * carryBlend;
      const scruffPivotY = -162;
      const carrySquirmAngle = Math.sin(carryElapsed * 8.4) * .026 * struggleAmp;
      const carryAngle = (carrySwing + carrySquirmAngle) * carryBlend;

      const armTargets = paws.map(({ side, wrist }) => {
        const point = projectScreen(wrist, pad.x, pad.y, pad.z, camera);
        const rawX = (point.x - ground.x) / scale;
        const rawY = (point.y - ground.y) / scale;
        const standingY = rawY < 0 ? rawY * bodyHeight : rawY;
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
        const nextX = (point.x - ground.x) / (scale * bodyWidth);
        const nextY = (point.y - ground.y) / (scale * bodyHeight);
        if (Math.hypot(nextX - tailTargetX, nextY - tailTargetY) > 1.5) {
          tailTargetX = nextX;
          tailTargetY = nextY;
          tailHitRel = solveTailHit(tailTargetX, tailTargetY);
        }
      }
      const tailRootX = MathUtils.lerp(MathUtils.lerp(45 * tailMirror, 61, effectiveCrouch), 34 * tailMirror, carryBlend);
      const tailPoints = computeTailChain(tailAngles, tailRootX, tailRootY, tailMirror);
      const applyCarryPendulum = () => {
        if (carryBlend <= .001) return;
        paint.translate(0, scruffPivotY);
        paint.rotate(carryAngle);
        paint.translate(0, -scruffPivotY);
      };
      const applyBodyTransform = () => {
        applyCarryPendulum();
        paint.translate(0, 4 * effectiveCrouch);
        paint.scale(bodyWidth, bodyHeight);
        paint.translate(0, -4 * effectiveCrouch);
      };
      const coat = catCoatPalettes[catCoat] ?? catCoatPalettes.black;

      paint.save();
      paint.translate(0, carryLiftY);

      // Lay down the outline before filling the overlapping shapes.
      paint.save();
      applyBodyTransform();
      drawTailChain(paint, tailPoints, ivory, tailWidth + silhouetteWidth);
      if (coat.rim) drawTailChain(paint, tailPoints, coat.rim, tailWidth + 2.0);
      stroke(paint, ivory, silhouetteWidth, activeBody);
      if (coat.rim) stroke(paint, coat.rim, 2.0, activeBody);
      paint.restore();
      paint.save();
      applyCarryPendulum();
      for (const arm of armTargets) {
        drawArm(paint, arm.side, arm.x, arm.y, bodyHeight, effectiveCrouch, 'outline', catCoat, carryBlend);
      }
      paint.restore();
      const closed = Math.max(face.closed, face.crying, face.carrySquint ?? 0);
      const eyeOffset = resolveFaceGaze(gaze, reaction.tension, closed);
      const whiskerTwitch = .55 * Math.sin(elapsed * 2.4) + bobPos * .85 + reaction.tension * .9
        + (1.25 * Math.sin(elapsed * 15) * carryBlend);
      paint.save();
      positionHead(paint, face);
      drawWhiskers(paint, coat.whiskerHalo, 2.6, whiskerTwitch, eyeOffset.x * .82, eyeOffset.y * .82);
      stroke(paint, ivory, silhouetteWidth, headShape);
      if (coat.rim) stroke(paint, coat.rim, 2.0, headShape);
      paint.restore();
      // Solid arm base behind body so outward-reaching arms stay 100% opaque outside the torso.
      paint.save();
      applyCarryPendulum();
      for (const arm of armTargets) {
        drawArm(paint, arm.side, arm.x, arm.y, bodyHeight, effectiveCrouch, 'under', catCoat, carryBlend);
      }
      paint.restore();
      paint.save();
      applyBodyTransform();
      drawTailChain(paint, tailPoints, coat.tail, tailWidth);
      drawTailMarkings(paint, tailPoints, catCoat);
      paint.fillStyle = coat.body;
      paint.fill(activeBody);
      drawBodyMarkings(paint, activeBody, catCoat, effectiveCrouch, carryBlend, kickLx, kickLy, kickRx, kickRy);
      const haunchAlpha = MathUtils.smoothstep(effectiveCrouch, .35, .95) * .68 * (1 - carryBlend);
      if (haunchAlpha > .01) {
        paint.globalAlpha = haunchAlpha;
        paint.beginPath();
        paint.moveTo(22, -33);
        paint.bezierCurveTo(45, -35, 55, -16, 44, 2);
        stroke(paint, coat.haunch, 1.5);
        paint.globalAlpha = 1;
      }
      paint.restore();
      paint.save();
      applyCarryPendulum();
      for (const arm of armTargets) {
        drawArm(paint, arm.side, arm.x, arm.y, bodyHeight, effectiveCrouch, 'over', catCoat, carryBlend);
      }
      if (carryBlend > .12) {
        drawCarryStruggleLines(paint, carryBlend * MathUtils.smoothstep(struggleAmp, .42, 1.05), elapsed);
      }
      paint.restore();
      drawHead(paint, gaze, reaction, face, whiskerTwitch, eyeStyle, elapsed, musicBlend, headphoneStyle, catCoat);
      if (tailImpacts.length) {
        drawTailImpacts(paint, tailImpacts, elapsed);
      }
      paint.restore();
    },
    containsHeadPoint,
    containsScreenPoint(x, y) {
      if (containsHeadPoint(x, y)) return true;
      const effectiveCrouch = crouch * (1 - carryBlend);
      const liftY = (-22 + carryBobY) * carryBlend;
      const activeBody = effectiveCrouch > .002 || carryBlend > .002
        ? createBodyPath(effectiveCrouch, carryBlend)
        : bodyShape;
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

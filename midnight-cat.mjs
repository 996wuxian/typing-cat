import { Bone, Group, MathUtils, Vector2, Vector3 } from 'three';

const black = '#161615';
const ivory = '#fbf8ee';
const silhouetteWidth = 4.6;
const tailWidth = 14.5;
const headRestY = -149;
const bodyCenterX = -.028;

export const midnightEyeStyles = {
  xiaohei: { label: '星瞳' },
  starry: { label: '闪亮星星眼' },
  glossy: { label: '纯净大黑瞳' },
  lime: { label: '青柠猫瞳' },
  ring: { label: '极简白圈' },
};
export const midnightHeadphoneStyles = {
  cream: { label: '奶白复古' },
  sony: { label: '曜石降噪' },
  max: { label: '银月头戴' },
  marshall: { label: '摇滚经典' },
  sakura: { label: '樱粉甜心' },
  retro: { label: '复古橙绵' },
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

function createBodyPath(sleep) {
  const path = new Path2D();
  path.moveTo(
    MathUtils.lerp(standingBodyStart[0], lyingBodyStart[0], sleep),
    MathUtils.lerp(standingBodyStart[1], lyingBodyStart[1], sleep),
  );
  for (let i = 0; i < standingBodySegs.length; i++) {
    const a = standingBodySegs[i];
    const b = lyingBodySegs[i];
    path.bezierCurveTo(
      MathUtils.lerp(a[0], b[0], sleep), MathUtils.lerp(a[1], b[1], sleep),
      MathUtils.lerp(a[2], b[2], sleep), MathUtils.lerp(a[3], b[3], sleep),
      MathUtils.lerp(a[4], b[4], sleep), MathUtils.lerp(a[5], b[5], sleep),
    );
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

function drawEye(paint, side, eyeOffset, gaze, face, eyeStyle, elapsed) {
  const closed = Math.max(face.closed, face.crying);
  const lid = MathUtils.smoothstep(closed, .62, .94);
  const { x, y, angry } = eyeOffset;
  const bigBlack = eyeStyle === 'xiaohei' || eyeStyle === 'starry' || eyeStyle === 'glossy';
  const rx = bigBlack ? 12.5 : eyeStyle === 'lime' ? 11.4 : 10.7;
  const ry = bigBlack ? 12.7 : eyeStyle === 'lime' ? 11.8 : 11.5;
  paint.save();
  paint.translate(side * ((bigBlack ? 18.8 : 18.2) - 1.1 * angry) + x, y);

  if (lid < 1) {
    const rw = rx * (1 + (bigBlack ? .04 : .06) * angry);
    const rh = ry * (1 - .86 * closed) * (1 - (bigBlack ? .06 : .08) * angry);
    paint.save();
    paint.globalAlpha = 1 - lid;
    if (angry > .01) {
      const tilt = -side * .56 * Math.sqrt(angry);
      const browY = MathUtils.lerp(-rh - 4, bigBlack ? .4 : eyeStyle === 'lime' ? .2 : .8, angry);
      paint.rotate(tilt);
      paint.beginPath();
      paint.rect(-rw - 8, browY, (rw + 8) * 2, rh * 2 + 16);
      paint.clip();
      paint.rotate(-tilt);
    }

    if (eyeStyle === 'ring') {
      paint.beginPath();
      paint.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      stroke(paint, ivory, 2.7 + .6 * angry);
    } else if (eyeStyle === 'lime') {
      paint.beginPath();
      paint.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      fillShape(paint, '#daf478');
      paint.clip();
      const open = 1 - closed;
      const pupilX = MathUtils.clamp(gaze.x * .44 * open, -4.2, 4.2);
      const pupilY = MathUtils.clamp(MathUtils.lerp(gaze.y * .36 + .7, 1.3, angry) * open, -3.4, 3.6);
      ellipse(paint, pupilX, pupilY, 5.4 - 1.5 * angry, (7.8 - .7 * angry) * (1 - .72 * closed), black);
      if (closed < .55) {
        ellipse(paint, pupilX - 1.7, pupilY - 2.6, 1.4, 1.4, '#f7ffdb');
      }
    } else {
      paint.beginPath();
      paint.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      fillShape(paint, ivory);
      paint.clip();
      const open = 1 - closed;
      const pupilX = MathUtils.clamp(gaze.x * .28 * open, -2.8, 2.8);
      const pupilY = MathUtils.clamp(MathUtils.lerp(gaze.y * .25, .9, angry) * open, -2.4, 2.6);
      const pupilRx = 9.0 - .9 * angry;
      const pupilRy = (9.2 - .8 * angry) * (1 - .78 * closed);
      ellipse(paint, pupilX, pupilY, pupilRx, pupilRy, black);
      if (closed < .55) {
        const twinkleAmp = .1 + .08 * face.happy;
        const twinkle = 1 + twinkleAmp * Math.sin(elapsed * (4.2 + 2.4 * face.happy) + side);
        if (eyeStyle === 'xiaohei') {
          drawSparkle(paint, pupilX + side * 3.0, pupilY - 1.2, 2.7 * twinkle, 0, '#ffe078');
          ellipse(paint, pupilX - side * 2.5, pupilY + 2.7, 1.15, 1.15, ivory);
        } else if (eyeStyle === 'starry') {
          const twinkleAlt = 1 + twinkleAmp * Math.cos(elapsed * (4.6 + 2.4 * face.happy) - side);
          drawSparkle(paint, pupilX - 2.5, pupilY - 1.7, 3.5 * twinkle, 0, '#ffa3be');
          drawSparkle(paint, pupilX + 3.3, pupilY + 1.8, 2.7 * twinkleAlt, 0, '#ffdc70');
          ellipse(paint, pupilX + 2.7, pupilY - 3.5, 1.65, 1.65, '#ffffff');
          ellipse(paint, pupilX - 1.5, pupilY + 3.7, 1.25, 1.25, '#9de8d6');
        } else {
          ellipse(paint, pupilX - 2.6, pupilY - 2.5, 1.9, 1.9, ivory);
          ellipse(paint, pupilX + 2.4, pupilY + 2.8, .95, .95, ivory);
        }
      }
    }
    paint.restore();
    if (face.happy > .02 && face.crying <= .02) {
      const smileLift = face.happy * (1 - lid);
      if (smileLift > .02) {
        paint.save();
        paint.globalAlpha = smileLift;
        ellipse(paint, 0, MathUtils.lerp(rh + 9, 13.8, face.happy), rw + 2.4, 8.1, black);
        paint.restore();
      }
    }
  }

  if (lid > 0) {
    paint.globalAlpha = lid;
    paint.beginPath();
    if (face.happy > .35 && face.crying <= .02) {
      paint.moveTo(-10.2, 2.4);
      paint.quadraticCurveTo(0, -6.2, 10.2, 2.4);
      stroke(paint, ivory, 2.0);
    } else {
      paint.moveTo(-10.7, .8);
      paint.quadraticCurveTo(0, MathUtils.lerp(7, -3, face.crying), 10.7, .8 + side * face.crying);
      stroke(paint, ivory, 1.8);
    }
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
  [39, 7.5, 46, 5.8, 52.5, 4.5],
  [40, 13, 47, 12.8, 54, 12.6],
  [38, 18.5, 44.5, 19.8, 50.5, 21],
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

function drawHead(paint, gaze, reaction, face, twitch, eyeStyle, elapsed, musicBlend = 0, headphoneStyle = 'cream') {
  paint.save();
  positionHead(paint, face);
  const closed = Math.max(face.closed, face.crying);
  const eyeOffset = resolveFaceGaze(gaze, reaction.tension, closed);
  const featureX = eyeOffset.x * .82;
  const featureY = eyeOffset.y * .82;
  drawWhiskers(paint, black, 2, twitch, featureX, featureY);
  paint.fillStyle = black;
  paint.fill(headShape);

  for (const side of [-1, 1]) {
    drawEye(paint, side, eyeOffset, gaze, face, eyeStyle, elapsed);
    if (reaction.blush > .01) {
      paint.globalAlpha = reaction.blush * .72;
      ellipse(paint, side * 30 + featureX * .7, 14.5 + featureY * .65, 6.2, 2.9, '#ed89a5', side * .08);
      paint.globalAlpha = 1;
    }
  }

  ellipse(paint, .8 + featureX, 13.8 + featureY, 2.8, 1.35, '#34322f', -.1);
  if (reaction.mouth > .04) {
    ellipse(paint, featureX * .85, 22 + featureY * .65, 4.1, 1 + 4.5 * reaction.mouth, '#d392a6');
  } else if (face.crying > .01) {
    paint.globalAlpha = .85 * face.crying;
    paint.beginPath();
    paint.moveTo(-4 + featureX * .85, 22 + featureY * .65);
    paint.quadraticCurveTo(featureX * .85, 18.5 + featureY * .65, 4 + featureX * .85, 22 + featureY * .65);
    stroke(paint, '#c3b6b7', 1.25);
  } else if (eyeOffset.angry > .05) {
    const mx = featureX * .88;
    const my = 20.8 + featureY * .62;
    const pout = eyeOffset.angry;
    paint.globalAlpha = MathUtils.smoothstep(pout, .05, .45);
    paint.beginPath();
    paint.moveTo(mx - 3.6, my + 1.1 * pout);
    paint.quadraticCurveTo(mx, my - 1.3 * pout, mx + 3.6, my + 1.1 * pout);
    stroke(paint, ivory, 1.8);
  }
  drawHeadphones(paint, musicBlend, elapsed, headphoneStyle);
  paint.restore();
}

function drawArm(paint, side, endX, endY, bodyHeight, crouch = 0, outline = false) {
  const stand = 1 - crouch;
  const outward = side * endX;
  const splay = MathUtils.smoothstep(outward, 33, 82) * stand;
  const crossing = MathUtils.smoothstep(-outward, 13, 104) * stand;
  const reach = Math.max(splay, crossing);
  const standRootX = side * (32 + 15 * splay - 17 * crossing);
  const standRootY = (-66 + 13 * splay + 29 * crossing) * bodyHeight;
  const rootX = MathUtils.lerp(standRootX, side < 0 ? -26 : -14, crouch);
  const rootY = MathUtils.lerp(standRootY, -18, crouch);
  const dx = endX - rootX;
  const dy = endY - rootY;
  const length = Math.hypot(dx, dy);
  const stretch = Math.max(reach, MathUtils.smoothstep(length, 46, 74));
  const shoulderHalfWidth = 8.5 + 2.2 * stretch;
  const forearmHalfWidth = 7 + 2.1 * stretch;
  const wristHalfWidth = 6.2 + 1.7 * stretch;
  const wrist = length * .79;
  const tip = length + 9.5;
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

  paint.beginPath();
  paint.moveTo(-shoulderHalfWidth, 0);
  paint.bezierCurveTo(upperCurve - shoulderHalfWidth, length * .32,
    lowerCurve - forearmHalfWidth, length * .61, wristX - wristHalfWidth, wrist);
  paint.bezierCurveTo(padX(length * .91) - wristHalfWidth, length * .91,
    padX(length - 3.7) - 9.7, length - 3.7, padX(length + .8) - 9.7, length + .8);
  paint.bezierCurveTo(padX(length + 7) - 9.7, length + 7, tipX - 6.1, tip, tipX, tip);
  paint.bezierCurveTo(tipX + 6.1, tip, padX(length + 7) + 9.7, length + 7,
    padX(length + .8) + 9.7, length + .8);
  paint.bezierCurveTo(padX(length - 3.7) + 9.7, length - 3.7,
    padX(length * .91) + wristHalfWidth, length * .91, wristX + wristHalfWidth, wrist);
  paint.bezierCurveTo(lowerCurve + forearmHalfWidth, length * .61,
    upperCurve + shoulderHalfWidth, length * .32, shoulderHalfWidth, 0);
  paint.bezierCurveTo(shoulderHalfWidth, -shoulderHalfWidth * .55,
    -shoulderHalfWidth, -shoulderHalfWidth * .55, -shoulderHalfWidth, 0);
  paint.closePath();
  if (outline) {
    stroke(paint, ivory, silhouetteWidth);
  } else {
    fillShape(paint, black);
    const innerEdge = 1 - splay;
    if (innerEdge > .02) {
      const edge = paint.createLinearGradient(0, 0, 0, tip);
      edge.addColorStop(0, black);
      edge.addColorStop(.38, '#3c3b38');
      edge.addColorStop(.85, '#64615d');
      edge.addColorStop(1, '#64615d00');
      paint.globalAlpha *= innerEdge;
      stroke(paint, edge, 1.35);
    }
  }
  paint.restore();
}

export function createMidnightCat(floatingLayer, {
  eyeStyle: initialEyeStyle = 'xiaohei',
  headphoneStyle: initialHeadphoneStyle = 'cream',
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'midnight-cat';
  canvas.setAttribute('aria-hidden', 'true');
  const paint = canvas.getContext('2d');
  if (!paint) throw new Error('Could not create the 2D cat canvas.');
  floatingLayer.before(canvas);
  let eyeStyle = Object.hasOwn(midnightEyeStyles, initialEyeStyle) ? initialEyeStyle : 'xiaohei';
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
  const reaction = { tension: 0, squint: 0, yaw: 0, pitch: 0, roll: 0, blush: 0, mouth: 0, crying: 0, doze: 0, happy: 0 };
  const face = { x: 0, y: headRestY, angle: 0, closed: 0, crying: 0, happy: 0 };
  const anchor = new Vector3();
  const ground = new Vector2();
  let scale = 1;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let elapsed = 0;
  let fire = 0;
  let crouch = 0;
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
    paint.save();
    paint.resetTransform();
    positionHead(paint, face);
    const hit = paint.isPointInPath(headShape, (x - ground.x) / scale, (y - ground.y) / scale);
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
    setEyeStyle(style) {
      if (Object.hasOwn(midnightEyeStyles, style)) eyeStyle = style;
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
      crying = 0, doze = 0, happy = 0 } = {}) {
      Object.assign(reaction, { tension, squint, yaw, pitch, roll, blush, mouth, crying, doze, happy });
    },
    update(seconds) {
      elapsed += seconds;
      fire = MathUtils.damp(fire, reaction.tension, reaction.tension > fire ? 10 : 6, seconds);
      musicBlend = MathUtils.damp(musicBlend, musicMode ? 1 : 0, musicMode ? 9 : 11, seconds);
      bobVel += (-180 * bobPos - 17 * bobVel) * seconds;
      bobPos = MathUtils.clamp(bobPos + bobVel * seconds, -1, 2);
      tapEnergy = MathUtils.damp(tapEnergy, 0, 6.5, seconds);
      tapLean = MathUtils.damp(tapLean, leanTarget * tapEnergy, 16, seconds);
      tailFlick = MathUtils.damp(tailFlick, 0, 11, seconds);
      tailWag += seconds * (2.3 + 4.8 * tapEnergy + 3.2 * reaction.tension + 2.8 * musicBlend * (1 - crouch));
      const pointerX = pointer.x * (1 - reaction.doze) * (1 - .7 * reaction.happy);
      const pointerY = pointer.y * (1 - reaction.doze) * (1 - .7 * reaction.happy);
      const tensionDown = reaction.tension * (1 - reaction.doze);
      const stand = 1 - crouch;
      const napBreath = Math.sin(elapsed * 2.1) * reaction.doze;
      gaze.x = MathUtils.damp(gaze.x, pointerX * 8.5, 15, seconds);
      gaze.y = MathUtils.damp(gaze.y, pointerY * -8.5, 15, seconds);
      face.x = MathUtils.damp(face.x,
        (pointerX * 9.5 + tapLean * 4.2 + reaction.yaw * 16) * stand - 36 * crouch, 11, seconds);
      face.y = MathUtils.damp(face.y,
        MathUtils.lerp(headRestY - pointerY * 6.5 + reaction.pitch * 24 + tensionDown * 8 + bobPos * 4.5,
          -28 + 1.8 * napBreath, crouch), 11, seconds);
      face.angle = MathUtils.damp(face.angle,
        (pointerX * .095 - pointerX * pointerY * .03 + tapLean * .068 + reaction.roll * .85) * stand
          + (-.24 - .018 * napBreath) * crouch, 11, seconds);
      face.closed = MathUtils.damp(face.closed, reaction.squint, 13, seconds);
      face.crying = MathUtils.damp(face.crying, reaction.crying, 12, seconds);
      face.happy = MathUtils.damp(face.happy, reaction.happy, 11, seconds);

      if (!tailMotion && crouch < .1 && elapsed >= nextTailMood) {
        let next = Math.floor(Math.random() * (tailMoods.length - 1));
        if (next >= tailMoodIndex) next++;
        tailMoodIndex = next;
        const mood = tailMoods[tailMoodIndex];
        nextTailMood = elapsed + mood.min + Math.random() * (mood.max - mood.min);
      }
      const activeMood = crouch > .25 ? { side: 1, rel: tailSleepRel } : tailMoods[tailMoodIndex];
      const desiredSide = tailMotion ? 1 : activeMood.side;
      tailMirror = MathUtils.damp(tailMirror, desiredSide, tailMotion ? 22 : 5.5, seconds);
      tailRootY = MathUtils.damp(tailRootY, MathUtils.lerp(desiredSide < 0 ? -44 : -34, -14, crouch), 8, seconds);
      const moodRel = activeMood.rel;

      if (crouch > .45 && !tailMotion) {
        if (elapsed >= sleepTailFlickAt) {
          sleepTailFlickEnd = elapsed + 1.05;
          sleepTailFlickAt = sleepTailFlickEnd + 3.2 + Math.random() * 2.8;
          sleepTailFlickDir = -sleepTailFlickDir;
        }
      } else if (crouch <= .2) {
        sleepTailFlickAt = elapsed + 2.8 + Math.random() * 2.2;
        sleepTailFlickEnd = -Infinity;
      }
      const sleepFlickRemaining = sleepTailFlickEnd - elapsed;
      const sleepFlickPhase = sleepFlickRemaining > 0 ? 1 - sleepFlickRemaining / 1.05 : -1;
      const sleepFlickWave = sleepFlickPhase >= 0 && sleepFlickPhase <= 1
        ? Math.sin(Math.PI * sleepFlickPhase) * Math.sin(sleepFlickPhase * Math.PI * 2.2) * sleepTailFlickDir * crouch
        : 0;

      const wagAmp = (.052 + .062 * tapEnergy + .05 * reaction.tension + .065 * musicBlend) * (1 - .68 * crouch);
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
              target = moodRel[j] + wagAmp * (.26 + .16 * j) * Math.sin(tailWag - j * .55);
              k = tailKUp[j];
              damp = tailDUp[j];
            }
          } else {
            const sleepKick = sleepFlickWave * (j === 0 ? .10 : j === 1 ? .18 : .30);
            target = moodRel[j] + wagAmp * (.26 + .16 * j) * Math.sin(tailWag - j * .55)
              + (j === 0 ? tailFlick : tailFlick * .45) + sleepKick;
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
      const grooveBounce = musicBlend * (1 - crouch) * .026 * Math.abs(Math.sin(elapsed * 5.8));
      const squash = bobPos * .036 * (1 - crouch) + grooveBounce;
      const napBreath = Math.sin(elapsed * 2.1) * reaction.doze;
      const bodyWidth = 1 + squash * .75 - .014 * napBreath * crouch;
      const bodyHeight = 1 - squash + .038 * napBreath * crouch;
      const activeBody = crouch > .002 ? createBodyPath(crouch) : bodyShape;
      if (fire > .025) drawFire(paint, fire, elapsed);
      for (const side of [-1, 1]) {
        const foot = projectScreen(model, bodyCenterX + side * .110, 0, .168, camera);
        const fx = MathUtils.lerp((foot.x - ground.x) / scale, side < 0 ? -24 : 36, crouch);
        const fy = MathUtils.lerp((foot.y - ground.y) / scale, 3, crouch);
        drawFootShadow(paint, fx, fy);
      }
      const armTargets = paws.map(({ side, wrist }) => {
        const point = projectScreen(wrist, pad.x, pad.y, pad.z, camera);
        const rawX = (point.x - ground.x) / scale;
        const rawY = (point.y - ground.y) / scale;
        const standingY = rawY < 0 ? rawY * bodyHeight : rawY;
        const x = MathUtils.lerp(rawX, side < 0 ? -50 : -13, crouch);
        const y = MathUtils.lerp(standingY, side < 0 ? -3 : -4, crouch);
        return { side, x, y };
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
      const tailRootX = MathUtils.lerp(45 * tailMirror, 61, crouch);
      const tailPoints = computeTailChain(tailAngles, tailRootX, tailRootY, tailMirror);
      const applyBodyTransform = () => {
        paint.translate(0, 4 * crouch);
        paint.scale(bodyWidth, bodyHeight);
        paint.translate(0, -4 * crouch);
      };
      // Lay down the outline before filling the overlapping shapes.
      paint.save();
      applyBodyTransform();
      drawTailChain(paint, tailPoints, ivory, tailWidth + silhouetteWidth);
      stroke(paint, ivory, silhouetteWidth, activeBody);
      paint.restore();
      for (const arm of armTargets) {
        drawArm(paint, arm.side, arm.x, arm.y, bodyHeight, crouch, true);
      }
      const closed = Math.max(face.closed, face.crying);
      const eyeOffset = resolveFaceGaze(gaze, reaction.tension, closed);
      const whiskerTwitch = .55 * Math.sin(elapsed * 2.4) + bobPos * .85 + reaction.tension * .9;
      paint.save();
      positionHead(paint, face);
      drawWhiskers(paint, ivory, 5.2, whiskerTwitch, eyeOffset.x * .82, eyeOffset.y * .82);
      stroke(paint, ivory, silhouetteWidth, headShape);
      paint.restore();
      paint.save();
      applyBodyTransform();
      drawTailChain(paint, tailPoints, black, tailWidth);
      paint.fillStyle = black;
      paint.fill(activeBody);
      const haunchAlpha = MathUtils.smoothstep(crouch, .35, .95) * .68;
      if (haunchAlpha > .01) {
        paint.globalAlpha = haunchAlpha;
        paint.beginPath();
        paint.moveTo(22, -33);
        paint.bezierCurveTo(45, -35, 55, -16, 44, 2);
        stroke(paint, '#575450', 1.5);
        paint.globalAlpha = 1;
      }
      paint.restore();
      for (const arm of armTargets) {
        drawArm(paint, arm.side, arm.x, arm.y, bodyHeight, crouch);
      }
      drawHead(paint, gaze, reaction, face, whiskerTwitch, eyeStyle, elapsed, musicBlend, headphoneStyle);
      if (tailImpacts.length) {
        drawTailImpacts(paint, tailImpacts, elapsed);
      }
    },
    containsHeadPoint,
    containsScreenPoint(x, y) {
      if (containsHeadPoint(x, y)) return true;
      const activeBody = crouch > .002 ? createBodyPath(crouch) : bodyShape;
      const localX = (x - ground.x) / scale;
      const localY = (y - ground.y) / scale;
      paint.save();
      paint.resetTransform();
      const hit = paint.isPointInPath(activeBody, localX, localY);
      paint.restore();
      return hit;
    },
    projectHead(x, y, target) {
      const localX = x * 300;
      const localY = (.102 - y) * 290;
      const cos = Math.cos(face.angle);
      const sin = Math.sin(face.angle);
      const screenX = ground.x + scale * (face.x + localX * cos - localY * sin);
      const screenY = ground.y + scale * (face.y + localX * sin + localY * cos);
      return target.set(2 * screenX / viewportWidth - 1, 1 - 2 * screenY / viewportHeight, 0);
    },
    dispose() {
      canvas.remove();
    },
  };
}

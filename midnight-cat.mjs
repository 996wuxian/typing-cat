import { Bone, Group, MathUtils, Vector2, Vector3 } from 'three';

const black = '#171716';
const outlineColor = '#fff';
const outlineWidth = 4.4;
const eyeSpacing = 18.4;
const feet = [
  { x: -34, y: -7, rx: 13, ry: 8, angle: -.22, edgeStart: Math.PI, edgeEnd: 1.48 * Math.PI },
  { x: 35, y: -6, rx: 12, ry: 8, angle: .18, edgeStart: 1.52 * Math.PI, edgeEnd: 2 * Math.PI },
];
const flameTongues = [
  { x: -50, y: -20, height: 112, width: 31, lean: -37, phase: .5 },
  { x: -36, y: -31, height: 170, width: 39, lean: -30, phase: 2 },
  { x: 7, y: -36, height: 174, width: 44, lean: 18, phase: 4.1 },
  { x: 40, y: -32, height: 153, width: 38, lean: 34, phase: 5.4 },
  { x: 54, y: -19, height: 103, width: 30, lean: 38, phase: 3.2 },
];

function fillShape(paint, color, borderWidth) {
  if (borderWidth) stroke(paint, color, borderWidth);
  paint.fillStyle = color;
  paint.fill();
}

function ellipse(paint, x, y, rx, ry, color, angle = 0, borderWidth = 0) {
  paint.beginPath();
  paint.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  fillShape(paint, color, borderWidth);
}

function stroke(paint, color, width) {
  paint.strokeStyle = color;
  paint.lineWidth = width;
  paint.lineCap = 'round';
  paint.lineJoin = 'round';
  paint.stroke();
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

function drawBody(paint, sway, color = black, borderWidth = 0) {
  paint.beginPath();
  paint.moveTo(44, -28);
  paint.bezierCurveTo(68, -28, 67, -61 - sway, 97, -65 - sway);
  stroke(paint, color, 13 + borderWidth);

  for (const { x, y, rx, ry, angle } of feet) {
    ellipse(paint, x, y, rx, ry, color, angle, borderWidth);
  }

  paint.beginPath();
  paint.moveTo(-30, -124);
  paint.bezierCurveTo(-34, -103, -55, -78, -60, -54);
  paint.bezierCurveTo(-65, -27, -52, -13, -38, -9);
  paint.bezierCurveTo(-18, -3, 21, -4, 40, -9);
  paint.bezierCurveTo(58, -13, 65, -33, 57, -52);
  paint.bezierCurveTo(50, -73, 38, -100, 34, -124);
  paint.closePath();
  fillShape(paint, color, borderWidth);
}

function drawFootEdges(paint) {
  const edge = paint.createLinearGradient(0, -17, 0, -5);
  edge.addColorStop(0, '#fff0');
  edge.addColorStop(1, '#fffc');
  for (const { x, y, rx, ry, angle, edgeStart, edgeEnd } of feet) {
    paint.beginPath();
    paint.ellipse(x, y, rx, ry, angle, edgeStart, edgeEnd);
    stroke(paint, edge, 1.35);
  }
}

function drawHeadShape(paint, color, borderWidth = 0) {
  paint.beginPath();
  paint.moveTo(-36, 25);
  paint.bezierCurveTo(-48, 19, -52, 4, -47, -8);
  paint.bezierCurveTo(-41, -22, -45, -39, -37, -43);
  paint.bezierCurveTo(-30, -47, -20, -37, -15, -29);
  paint.bezierCurveTo(-5, -31, 8, -31, 17, -29);
  paint.bezierCurveTo(22, -35, 29, -45, 36, -42);
  paint.bezierCurveTo(44, -39, 43, -21, 47, -10);
  paint.bezierCurveTo(51, 1, 49, 17, 39, 24);
  paint.bezierCurveTo(22, 34, -19, 35, -36, 25);
  paint.closePath();
  fillShape(paint, color, borderWidth);
}

function drawEye(paint, side, gaze, tension, face) {
  const closed = Math.max(face.closed, face.crying);
  const lid = MathUtils.smoothstep(closed, .65, .94);
  paint.save();
  paint.translate(side * eyeSpacing, side === 1 ? -.6 : 0);
  paint.scale(side, 1);

  if (lid < 1) {
    const open = 1 - .89 * closed;
    const inner = 3.1 * tension;
    const outer = -1.5 * tension;
    paint.save();
    paint.globalAlpha = 1 - lid;
    paint.beginPath();
    paint.moveTo(-12.7, inner * open);
    // Lower the upper lid toward the nose while keeping the outer corner open.
    paint.bezierCurveTo(-12.7, (-6 + 8 * tension) * open, -7, (-10.8 + 11 * tension) * open,
      0, (-10.8 + 7.5 * tension) * open);
    paint.bezierCurveTo(7, (-10.8 + 4.8 * tension) * open, 12.7, (-6 + 2.4 * tension) * open, 12.7, outer * open);
    paint.bezierCurveTo(12.7, 6 * open, 7, (10.8 - 2 * tension) * open, 0, (10.8 - 2 * tension) * open);
    paint.bezierCurveTo(-7, (10.8 - 2 * tension) * open, -12.7, (6 + tension) * open, -12.7, inner * open);
    paint.closePath();
    fillShape(paint, '#dff874');
    paint.clip();
    const pupilX = gaze.x * side * (1 - .5 * tension);
    const pupilY = 3.5 + MathUtils.lerp(gaze.y * (1 - .66 * tension), 2.3, face.crying);
    ellipse(paint, pupilX, pupilY, 5.3 - .8 * tension, 8.6, '#151614', -.09 * side);
    ellipse(paint, pupilX - 1.5 * side, pupilY - 3, 1, 1.25, '#b5cb64');
    paint.restore();
  }

  if (lid > 0) {
    paint.globalAlpha = lid;
    paint.beginPath();
    paint.moveTo(-10.4, MathUtils.lerp(.8, -1, face.crying));
    paint.quadraticCurveTo(-1.5, MathUtils.lerp(6.2, -.7, face.crying),
      10.2, MathUtils.lerp(1.6, 3.4, face.crying));
    stroke(paint, '#847b81', 1.5);
  }
  if (face.crying > .01) {
    paint.globalAlpha = .75 * face.crying;
    paint.beginPath();
    paint.moveTo(-7.6, -9.2);
    paint.quadraticCurveTo(-2.9, -6.3, 4.7, -6.6);
    stroke(paint, '#6b6266', 1.15);
  }
  paint.restore();
}

function drawHead(paint, gaze, reaction, face) {
  paint.save();
  paint.translate(face.x, face.y);
  paint.rotate(face.angle);
  drawHeadShape(paint, black);

  for (const side of [-1, 1]) {
    if (reaction.blush > .01) {
      paint.globalAlpha = reaction.blush * .78;
      ellipse(paint, side * 32, 17, 9, 4, '#ed89a5', side * .08);
      paint.globalAlpha = 1;
    }
    for (let i = 0; i < 3; i++) {
      paint.beginPath();
      paint.moveTo(side * 29, 13 + 3 * i);
      paint.quadraticCurveTo(side * 33, 13 + 3 * i, side * (39 - i), 15 + 4 * i);
      stroke(paint, '#777770', .75);
    }
    drawEye(paint, side, gaze, reaction.tension, face);
  }

  ellipse(paint, .8, 13.8, 2.8, 1.35, '#34322f', -.1);
  if (reaction.mouth > .04) {
    ellipse(paint, 0, 22, 5.4, 1 + 5.5 * reaction.mouth, '#b9758a');
  } else if (face.crying > .01) {
    paint.globalAlpha = .85 * face.crying;
    paint.beginPath();
    paint.moveTo(-4.1, 22.3);
    paint.quadraticCurveTo(0, 18.8, 4.1, 22.3);
    stroke(paint, '#918185', 1.25);
  }
  paint.restore();
}

function drawArm(paint, side, endX, endY) {
  const outward = side * endX;
  const splay = MathUtils.smoothstep(outward, 29, 112);
  const crossing = MathUtils.smoothstep(-outward, 14, 108);
  const rootX = side * (24 + 28 * splay - 18 * crossing);
  const rootY = -57 + 29 * Math.max(splay, crossing);
  const dx = endX - rootX;
  const dy = endY - rootY;
  const length = Math.hypot(dx, dy);
  const bend = MathUtils.clamp(-dx * .16, -9, 9);
  const wrist = length * .82;
  const tip = length + 12;
  const cuff = (length - Math.min(10, length * .25)) / tip;
  const palm = (length - Math.min(5, length * .12)) / tip;

  paint.save();
  paint.translate(rootX, rootY);
  paint.rotate(Math.atan2(-dx, dy));

  const blend = paint.createLinearGradient(0, 0, 0, tip);
  blend.addColorStop(0, black);
  blend.addColorStop(cuff * .74, '#222120');
  blend.addColorStop(cuff, '#888a91');
  blend.addColorStop(palm, '#f5f5f6');
  blend.addColorStop(1, '#dedfe3');

  const edge = paint.createLinearGradient(0, 0, 0, tip);
  edge.addColorStop(cuff * .34, black);
  edge.addColorStop(cuff * .67, '#454440');
  edge.addColorStop(cuff, '#ebebed');
  edge.addColorStop(palm, outlineColor);
  edge.addColorStop(1, '#f0f0f2');

  paint.beginPath();
  paint.moveTo(-8.5, 0);
  paint.bezierCurveTo(bend - 8.5, length * .35, bend * .35 - 7, length * .62, -6, wrist);
  paint.bezierCurveTo(-6, length * .93, -9.3, length - 4, -9.3, length);
  paint.bezierCurveTo(-9.3, length + 6.6, -5.1, tip, 0, tip);
  paint.bezierCurveTo(5.1, tip, 9.3, length + 6.6, 9.3, length);
  paint.bezierCurveTo(9.3, length - 4, 6, length * .93, 6, wrist);
  paint.bezierCurveTo(bend * .35 + 7, length * .62, bend + 8.5, length * .35, 8.5, 0);
  paint.closePath();
  paint.fillStyle = blend;
  paint.fill();
  stroke(paint, edge, 1.55);

  paint.beginPath();
  for (const toe of [-1, 1]) {
    paint.moveTo(3 * toe, tip - 2.7);
    paint.quadraticCurveTo(3.9 * toe, tip - 5.4, 3.5 * toe, tip - 7.6);
  }
  stroke(paint, '#b2b4bb', .75);
  paint.restore();
}

export function createMidnightCat(floatingLayer) {
  const canvas = document.createElement('canvas');
  canvas.className = 'midnight-cat';
  canvas.setAttribute('aria-hidden', 'true');
  const paint = canvas.getContext('2d');
  if (!paint) throw new Error('Could not create the 2D cat canvas.');
  floatingLayer.before(canvas);

  const model = new Group();
  const paws = [-1, 1].map(side => {
    const suffix = side === -1 ? 'R' : 'L';
    const shoulder = addJoint(model, `ForeShoulder_${suffix}`, .110 * side, .380, .141);
    const elbow = addJoint(shoulder, `ForeElbow_${suffix}`, .043 * side, -.185, -.190);
    return { side, wrist: addJoint(elbow, `ForePaw_${suffix}`, -.055 * side, -.027, .269) };
  });
  const pad = new Vector3(0, -.050, .043);
  const pointer = new Vector2();
  const gaze = new Vector2();
  const reaction = { tension: 0, squint: 0, yaw: 0, pitch: 0, roll: 0, blush: 0, mouth: 0, crying: 0, doze: 0 };
  const face = { x: 0, y: -130, angle: 0, closed: 0, crying: 0 };
  const anchor = new Vector3();
  const ground = new Vector2();
  let scale = 1;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let elapsed = 0;
  let fire = 0;

  function projectScreen(object, x, y, z, camera) {
    object.localToWorld(anchor.set(x, y, z)).project(camera);
    anchor.x = (anchor.x * .5 + .5) * viewportWidth;
    anchor.y = (.5 - anchor.y * .5) * viewportHeight;
    return anchor;
  }

  return {
    model,
    pawContact: { pad, outerToes: new Vector3(.020, -.047, .052) },
    setPointer(x, y) {
      pointer.set(MathUtils.clamp(x, -1, 1), MathUtils.clamp(y, -1, 1));
    },
    setReaction({ tension = 0, squint = 0, yaw = 0, pitch = 0, roll = 0, blush = 0, mouth = 0,
      crying = 0, doze = 0 } = {}) {
      Object.assign(reaction, { tension, squint, yaw, pitch, roll, blush, mouth, crying, doze });
    },
    update(seconds) {
      elapsed += seconds;
      fire = MathUtils.damp(fire, reaction.tension, reaction.tension > fire ? 10 : 6, seconds);
      const pointerX = pointer.x * (1 - reaction.doze);
      const pointerY = pointer.y * (1 - reaction.doze);
      gaze.x = MathUtils.damp(gaze.x, pointerX * 6.2, 18, seconds);
      gaze.y = MathUtils.damp(gaze.y, pointerY * -4.5, 18, seconds);
      face.x = MathUtils.damp(face.x, pointerX * 3.8 + reaction.yaw * 16, 9, seconds);
      face.y = MathUtils.damp(face.y, -130 - pointerY * 2.5 + reaction.pitch * 16, 9, seconds);
      face.angle = MathUtils.damp(face.angle, reaction.roll * .85, 9, seconds);
      face.closed = MathUtils.damp(face.closed, reaction.squint, 13, seconds);
      face.crying = MathUtils.damp(face.crying, reaction.crying, 12, seconds);
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
      const base = projectScreen(model, -.028, .057, .258, camera);
      ground.set(base.x, base.y);
      scale = (projectScreen(model, .284, .057, .258, camera).x - ground.x) / 110;
      paint.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      paint.clearRect(0, 0, width, height);
      paint.translate(ground.x, ground.y);
      paint.scale(scale, scale);
      const sway = 4 * Math.sin(elapsed * 2.3);
      if (fire > .025) drawFire(paint, fire, elapsed);
      // Draw the silhouette first so the overlapping shapes share one outline.
      drawBody(paint, sway, outlineColor, outlineWidth);
      paint.save();
      paint.translate(face.x, face.y);
      paint.rotate(face.angle);
      drawHeadShape(paint, outlineColor, outlineWidth);
      paint.restore();
      drawBody(paint, sway);
      drawFootEdges(paint);
      for (const { side, wrist } of paws) {
        const point = projectScreen(wrist, pad.x, pad.y, pad.z, camera);
        drawArm(paint, side, (point.x - ground.x) / scale, (point.y - ground.y) / scale);
      }
      drawHead(paint, gaze, reaction, face);
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

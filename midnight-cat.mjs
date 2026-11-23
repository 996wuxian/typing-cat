import { Bone, Group, MathUtils, Vector2, Vector3 } from 'three';

const black = '#171716';
const outlineColor = '#fff';
const outlineWidth = 4.4;
const eyeSpacing = 18.4;

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

function drawBody(paint, sway, color = black, borderWidth = 0) {
  paint.beginPath();
  paint.moveTo(44, -28);
  paint.bezierCurveTo(68, -28, 67, -61 - sway, 97, -65 - sway);
  stroke(paint, color, 13 + borderWidth);

  ellipse(paint, -34, -7, 13, 8, color, -.22, borderWidth);
  ellipse(paint, 35, -6, 12, 8, color, .18, borderWidth);

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

function drawHead(paint, gaze, reaction, closed, face) {
  paint.save();
  paint.translate(face.x, face.y);
  paint.rotate(face.angle);
  drawHeadShape(paint, black);

  for (const side of [-1, 1]) {
    const squint = Math.max(.07, 1 - closed - reaction.tension * .41);
    paint.save();
    paint.translate(side * eyeSpacing, side === 1 ? -.6 : 0);
    paint.rotate(side * (.06 + .24 * reaction.tension));
    if (reaction.crying || closed >= .87) {
      paint.beginPath();
      paint.moveTo(-10, 1);
      paint.quadraticCurveTo(0, 8, 10, 0);
      stroke(paint, '#77717b', 1.5);
    } else {
      paint.scale(1, squint);
      ellipse(paint, 0, 0, 12.7, 10.8, '#dff874');
      paint.clip();
      ellipse(paint, gaze.x, 3.5 + gaze.y, 5.3, 8.6, '#151614', -.09);
      ellipse(paint, gaze.x - 1.5, .5 + gaze.y, 1, 1.25, '#b5cb64');
    }
    paint.restore();

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
  }

  ellipse(paint, .8, 13.8, 2.8, 1.35, '#34322f', -.1);
  if (reaction.mouth > .04) {
    ellipse(paint, 0, 22, 5.4, 1 + 5.5 * reaction.mouth, '#b9758a');
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
  edge.addColorStop(cuff, '#4a4845');
  edge.addColorStop(palm, '#a9abb1');
  edge.addColorStop(1, '#b1b3b9');

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
  stroke(paint, edge, .9);

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
  const reaction = { tension: 0, squint: 0, yaw: 0, pitch: 0, roll: 0, blush: 0, mouth: 0, crying: false };
  const face = { x: 0, y: -130, angle: 0 };
  const anchor = new Vector3();
  const ground = new Vector2();
  let scale = 1;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let elapsed = 0;
  let closed = 0;

  function projectScreen(object, x, y, z, camera) {
    object.localToWorld(anchor.set(x, y, z)).project(camera);
    anchor.x = (anchor.x * .5 + .5) * viewportWidth;
    anchor.y = (.5 - anchor.y * .5) * viewportHeight;
    return anchor;
  }

  return {
    model,
    pawContact: { pad, outerToes: new Vector3(.020, -.047, .052) },
    eyeAnchors: [-1, 1].map(side => [side * eyeSpacing / 300, .089, 0]),
    setPointer(x, y) {
      pointer.set(MathUtils.clamp(x, -1, 1), MathUtils.clamp(y, -1, 1));
    },
    setReaction({ tension = 0, squint = 0, yaw = 0, pitch = 0, roll = 0, blush = 0, mouth = 0, crying = false } = {}) {
      Object.assign(reaction, { tension, squint, yaw, pitch, roll, blush, mouth, crying });
    },
    update(seconds) {
      elapsed += seconds;
      gaze.x = MathUtils.damp(gaze.x, pointer.x * 6.2, 18, seconds);
      gaze.y = MathUtils.damp(gaze.y, pointer.y * -4.5, 18, seconds);
      face.x = MathUtils.damp(face.x, pointer.x * 3.8 + reaction.yaw * 16, 9, seconds);
      face.y = MathUtils.damp(face.y, -130 - pointer.y * 2.5 + reaction.pitch * 16, 9, seconds);
      face.angle = MathUtils.damp(face.angle, reaction.roll * .85, 9, seconds);
      closed = MathUtils.damp(closed, reaction.squint, 13, seconds);
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
      // Draw the silhouette first so the overlapping shapes share one outline.
      drawBody(paint, sway, outlineColor, outlineWidth);
      paint.save();
      paint.translate(face.x, face.y);
      paint.rotate(face.angle);
      drawHeadShape(paint, outlineColor, outlineWidth);
      paint.restore();
      drawBody(paint, sway);
      for (const { side, wrist } of paws) {
        const point = projectScreen(wrist, pad.x, pad.y, pad.z, camera);
        drawArm(paint, side, (point.x - ground.x) / scale, (point.y - ground.y) / scale);
      }
      drawHead(paint, gaze, reaction, closed, face);
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

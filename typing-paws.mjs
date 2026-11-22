import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

const approachTime = 0.092;
const holdTime = 0.202;
const minimumHold = 0.15;
const returnDuration = 0.168;
const neutralRotation = new Quaternion();
const mouseGrip = new Quaternion().setFromEuler(new Euler(.23, .22, -.12, 'YXZ'));
const mousePress = new Quaternion().setFromEuler(new Euler(.31, .22, -.12, 'YXZ'));

function makePaw(model, suffix) {
  const shoulder = model.getObjectByName(`ForeShoulder_${suffix}`);
  const elbow = model.getObjectByName(`ForeElbow_${suffix}`);
  const paw = model.getObjectByName(`ForePaw_${suffix}`);
  if (!shoulder?.isBone || !elbow?.isBone || !paw?.isBone) {
    throw new Error('The typing cat requires both front paw bone chains.');
  }
  const origin = model.worldToLocal(shoulder.getWorldPosition(new Vector3()));
  const rest = model.worldToLocal(paw.getWorldPosition(new Vector3()));
  const upper = elbow.position.clone();
  const lower = paw.position.clone();
  const upperLength = upper.length();
  const lowerLength = lower.length();
  const restAxis = rest.clone().sub(origin).normalize();
  const pole = upper.clone().addScaledVector(restAxis, -upper.dot(restAxis)).normalize();
  upper.normalize();
  lower.normalize();
  const axis = new Vector3();
  const bend = new Vector3();
  const towardElbow = new Vector3();
  const towardPaw = new Vector3();
  const inverseUpper = new Quaternion();
  return {
    rest,
    wrist: rest.clone(),
    rotation: new Quaternion(),
    motion: null,
    solve() {
      axis.copy(this.wrist).sub(origin);
      const reach = MathUtils.clamp(axis.length(), Math.abs(upperLength - lowerLength) + 0.002,
        upperLength + lowerLength - 0.00002);
      axis.normalize();
      bend.copy(pole).addScaledVector(axis, -pole.dot(axis)).normalize();
      const along = (upperLength ** 2 - lowerLength ** 2 + reach ** 2) / (2 * reach);
      const offset = Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2));
      towardElbow.copy(axis).multiplyScalar(along).addScaledVector(bend, offset);
      towardPaw.copy(axis).multiplyScalar(reach).sub(towardElbow).normalize();
      shoulder.quaternion.setFromUnitVectors(upper, towardElbow.normalize());
      inverseUpper.copy(shoulder.quaternion).invert();
      elbow.quaternion.setFromUnitVectors(lower, towardPaw.applyQuaternion(inverseUpper));
      paw.quaternion.copy(shoulder.quaternion).multiply(elbow.quaternion).invert().multiply(this.rotation);
    },
  };
}

function wristAt(surface, rotation = neutralRotation) {
  return surface.clone().sub(new Vector3(0, -.068, .087).applyQuaternion(rotation));
}

export function createTypingPaws(model) {
  model.updateMatrixWorld(true);
  const left = makePaw(model, 'R');
  const right = makePaw(model, 'L');
  let mouse = null;

  return {
    tap(surface, time, side = surface.x < 0.018 ? 'left' : 'right', held = false) {
      const arm = side === 'left' ? left : right;
      arm.motion = {
        time, from: arm.wrist.clone(), contact: wristAt(surface),
        releaseAt: held ? Infinity : time + holdTime,
      };
    },

    release(side, time) {
      const arm = side === 'left' ? left : right;
      const motion = arm.motion;
      if (motion?.releaseAt === Infinity) motion.releaseAt = Math.max(time, motion.time + minimumHold);
    },

    followMouse(surface, time, pressed) {
      const rotation = pressed ? mousePress : mouseGrip;
      mouse = { until: time + 0.48, wrist: wristAt(surface, rotation), rotation, pressed };
    },

    update(time, seconds) {
      for (const arm of [left, right]) {
        const grip = arm === right && mouse && time < mouse.until ? mouse : null;
        const blend = 1 - Math.exp(-21 * seconds);
        const motion = arm.motion;
        const age = motion ? time - motion.time : Infinity;
        const canGrip = grip && (grip.pressed || !motion || time >= motion.releaseAt + returnDuration);
        arm.rotation.slerp(canGrip ? grip.rotation : neutralRotation, blend);
        if (canGrip) {
          arm.wrist.lerp(grip.wrist, blend);
        } else if (motion && age < approachTime) {
          const progress = MathUtils.clamp(age / approachTime, 0, 1);
          arm.wrist.lerpVectors(motion.from, motion.contact, MathUtils.smoothstep(progress, 0, 1));
          arm.wrist.y += 0.036 * Math.sin(progress * Math.PI);
        } else if (motion && time < motion.releaseAt) {
          arm.wrist.copy(motion.contact);
        } else if (motion && time < motion.releaseAt + returnDuration) {
          const progress = (time - motion.releaseAt) / returnDuration;
          arm.wrist.lerpVectors(motion.contact, arm.rest, MathUtils.smoothstep(progress, 0, 1));
          arm.wrist.y += 0.028 * Math.sin(progress * Math.PI);
        } else {
          arm.motion = null;
          arm.wrist.lerp(arm.rest, 1 - Math.exp(-15 * seconds));
        }
        arm.solve();
      }
    },
  };
}

import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

const approachTime = 0.074;
const holdTime = 0.19;
const minimumHold = 0.14;
const returnDuration = 0.145;
const neutralRotation = new Quaternion();
const pawPad = new Vector3(0, -.068, .087);
const outerToes = new Vector3(.031, -.064, .091);

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

function wristAt(surface, rotation = neutralRotation, contact = pawPad) {
  return surface.clone().sub(contact.clone().applyQuaternion(rotation));
}

export function createTypingPaws(model, mouseSide = 'right', contact = {}) {
  model.updateMatrixWorld(true);
  const arms = { left: makePaw(model, 'R'), right: makePaw(model, 'L') };
  const direction = mouseSide === 'right' ? 1 : -1;
  const mouseGrip = new Quaternion().setFromEuler(new Euler(.23, .22 * direction, -.12 * direction, 'YXZ'));
  const mousePress = new Quaternion().setFromEuler(new Euler(.31, .22 * direction, -.12 * direction, 'YXZ'));
  const crossKeyboard = new Quaternion().setFromEuler(new Euler(.25, .73 * direction, .18 * direction, 'YXZ'));
  const pad = contact.pad ?? pawPad;
  const crossContact = (contact.outerToes ?? outerToes).clone();
  crossContact.x *= direction;
  let mouse = null;

  return {
    tap(surface, time, side = surface.x < 0.018 ? 'left' : 'right', held = false) {
      const arm = arms[side];
      const crossing = side !== mouseSide && surface.x * direction > .065;
      const rotation = crossing ? crossKeyboard : neutralRotation;
      arm.motion = {
        time, from: arm.wrist.clone(), rotation,
        contact: wristAt(surface, rotation, crossing ? crossContact : pad),
        releaseAt: held ? Infinity : time + holdTime,
      };
    },

    release(side, time) {
      const arm = arms[side];
      const motion = arm.motion;
      if (motion?.releaseAt === Infinity) motion.releaseAt = Math.max(time, motion.time + minimumHold);
    },

    followMouse(surface, time, pressed) {
      const rotation = pressed ? mousePress : mouseGrip;
      mouse = { until: time + 0.48, wrist: wristAt(surface, rotation, pad), rotation, pressed };
    },

    update(time, seconds, resting = false) {
      if (resting) mouse = null;
      for (const [side, arm] of Object.entries(arms)) {
        if (resting) arm.motion = null;
        const grip = side === mouseSide && mouse && time < mouse.until ? mouse : null;
        const blend = 1 - Math.exp(-21 * seconds);
        const motion = arm.motion;
        const age = motion ? time - motion.time : Infinity;
        const canGrip = grip && (grip.pressed || !motion || time >= motion.releaseAt + returnDuration);
        const typingRotation = motion && time < motion.releaseAt ? motion.rotation : neutralRotation;
        arm.rotation.slerp(canGrip ? grip.rotation : typingRotation, blend);
        if (canGrip) {
          arm.wrist.lerp(grip.wrist, blend);
        } else if (motion && age < approachTime) {
          const progress = MathUtils.clamp(age / approachTime, 0, 1);
          arm.wrist.lerpVectors(motion.from, motion.contact, MathUtils.smoothstep(progress, 0, 1));
          arm.wrist.y += 0.056 * Math.sin(progress * Math.PI);
        } else if (motion && time < motion.releaseAt) {
          arm.wrist.copy(motion.contact);
        } else if (motion && time < motion.releaseAt + returnDuration) {
          const progress = (time - motion.releaseAt) / returnDuration;
          arm.wrist.lerpVectors(motion.contact, arm.rest, MathUtils.smoothstep(progress, 0, 1));
          arm.wrist.y += 0.042 * Math.sin(progress * Math.PI);
        } else {
          arm.motion = null;
          arm.wrist.lerp(arm.rest, 1 - Math.exp(-15 * seconds));
        }
        arm.solve();
      }
    },
  };
}

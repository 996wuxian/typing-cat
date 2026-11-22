import { AnimationMixer, CanvasTexture, Euler, MathUtils, Quaternion, Vector2 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const radians = MathUtils.degToRad;

function addEyeTracking(mesh) {
  const gaze = new Vector2();
  const expression = new Vector2();
  const muzzle = new Vector2();
  const mask = document.createElement('canvas');
  mask.width = 316;
  mask.height = 92;
  const paint = mask.getContext('2d');
  paint.translate(-222, -150);
  paint.filter = 'blur(1.2px)';
  paint.fillStyle = '#fff';
  // Outlines of the two eyelid openings in the model's frontal rest projection.
  paint.fill(new Path2D(
    'M 242 206 C 240 187 252 172 271 166 C 280 162 295 164 305 173 ' +
    'C 313 180 320 194 323 204 C 326 215 324 224 317 228 ' +
    'C 305 234 279 235 263 230 C 250 226 242 217 242 206 Z',
  ));
  paint.fill(new Path2D(
    'M 443 209 C 445 194 452 177 464 169 C 472 164 485 162 495 165 ' +
    'C 511 168 522 181 526 195 C 531 210 522 226 505 230 ' +
    'C 491 235 470 235 457 230 C 446 227 439 222 443 209 Z',
  ));
  const aperture = new CanvasTexture(mask);
  aperture.flipY = false;
  const material = mesh.material;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.catEyeAperture = { value: aperture };
    shader.uniforms.catEyeGaze = { value: gaze };
    shader.uniforms.catExpression = { value: expression };
    shader.uniforms.catMuzzle = { value: muzzle };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCatRestPosition;\nuniform vec2 catMuzzle;')
      .replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vCatRestPosition = position;
        float jaw = (1.0 - smoothstep(.694, .729, position.y)) * smoothstep(.632, .687, position.y)
          * (1.0 - smoothstep(.046, .091, abs(position.x - .021))) * smoothstep(.225, .303, position.z);
        transformed.y -= .015 * catMuzzle.y * jaw;
        transformed.z -= .006 * catMuzzle.y * jaw;
      `);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `
        #include <common>
        varying vec3 vCatRestPosition;
        uniform sampler2D catEyeAperture;
        uniform vec2 catEyeGaze;
        uniform vec2 catExpression;
        uniform vec2 catMuzzle;
      `)
      .replace('#include <map_fragment>', `
        #include <map_fragment>
        if (catMuzzle.x > 0.0) {
          vec2 cheekCenter = vCatRestPosition.x < .022 ? vec2(-.082, .759) : vec2(.126, .759);
          vec2 cheek = (vCatRestPosition.xy - cheekCenter) / vec2(.049, .022);
          float blush = exp(-2.3 * dot(cheek, cheek)) * smoothstep(.227, .266, vCatRestPosition.z);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.83, .23, .30), blush * catMuzzle.x * .7);
        }
        if (catMuzzle.y > .02) {
          vec2 lips = (vCatRestPosition.xy - vec2(.020, .721 - .004 * catMuzzle.y))
            / vec2(.019, .003 + .012 * catMuzzle.y);
          float lip = (1.0 - smoothstep(.67, 1.03, dot(lips, lips))) * smoothstep(.260, .301, vCatRestPosition.z);
          vec3 mouth = mix(vec3(.078, .026, .029), vec3(.30, .092, .10), smoothstep(.15, .72, -lips.y));
          diffuseColor.rgb = mix(diffuseColor.rgb, mouth, lip * smoothstep(.02, .26, catMuzzle.y));
        }
        vec2 eyePoint = vec2(vCatRestPosition.x + 0.235, 0.925 - vCatRestPosition.y) * 1500.0;
        vec2 eyeUV = (eyePoint - vec2(222.0, 150.0)) / vec2(316.0, 92.0);
        float catLidCoverage = 0.0;
        float closeAmount = smoothstep(0.07, 0.91, catExpression.y);
        float shut = smoothstep(0.72, 0.99, closeAmount);
        float gazeBlend = max(smoothstep(0.15, 3.2, length(catEyeGaze)), max(catExpression.x, catExpression.y));
        if (gazeBlend > 0.0 && vCatRestPosition.z > 0.230 && vCatRestPosition.z < mix(0.283, 0.299, shut)
            && all(greaterThan(eyeUV, vec2(0.0))) && all(lessThan(eyeUV, vec2(1.0)))) {
          float eyeMask = texture2D(catEyeAperture, eyeUV).a;
          float outerEye = eyeMask;
          if (shut > 0.0) {
            outerEye = max(outerEye, texture2D(catEyeAperture, eyeUV + vec2(.011, 0.0)).a);
            outerEye = max(outerEye, texture2D(catEyeAperture, eyeUV - vec2(.011, 0.0)).a);
            outerEye = max(outerEye, texture2D(catEyeAperture, eyeUV + vec2(0.0, .043)).a);
            outerEye = max(outerEye, texture2D(catEyeAperture, eyeUV - vec2(0.0, .043)).a);
          }
          if (outerEye > 0.0) {
            vec2 restCenter = eyePoint.x < 380.0 ? vec2(290.0, 195.0) : vec2(479.0, 194.0);
            float leftEye = eyePoint.x < 380.0 ? 1.0 : -1.0;
            vec2 pupilSize = mix(vec2(28.4, 30.1), vec2(17.5, 26.0), catExpression.x);
            vec2 fromPupil = (eyePoint - restCenter - catEyeGaze) / pupilSize;
            float pupilRadius = length(fromPupil);
            float pupil = 1.0 - smoothstep(0.96, 1.04, pupilRadius);
            float angle = atan(fromPupil.y, fromPupil.x + 0.00001);
            float fibers = 1.0 + 0.065 * sin(51.0 * angle + 2.8 * pupilRadius)
                               + 0.038 * sin(89.0 * angle - 4.0 * pupilRadius);
            float shade = mix(0.20, 1.0, smoothstep(165.0, 194.0, eyePoint.y));
            float limbus = 1.0 - 0.26 * smoothstep(1.28, 1.68, pupilRadius);
            vec3 iris = vec3(0.51, 0.43, 0.27) * (fibers * shade * limbus);
            vec3 pupilColor = vec3(0.0105, 0.0092, 0.0078) * mix(0.66, 1.0, shade);
            vec3 eyeColor = mix(iris, pupilColor, pupil);
            diffuseColor.rgb = mix(diffuseColor.rgb, eyeColor, eyeMask * gazeBlend);
            float inward = clamp((eyePoint.x - restCenter.x) * leftEye / 36.0, -1.0, 1.0);
            float lidLine = 166.0 + catExpression.x * (15.0 + 12.0 * inward) + 79.0 * closeAmount;
            float eyelid = (1.0 - smoothstep(lidLine - 2.0, lidLine + 2.0, eyePoint.y))
              * max(catExpression.x, closeAmount) * eyeMask;
            catLidCoverage = max(eyelid, shut * smoothstep(.015, .53, outerEye));
            vec3 relaxedLid = mix(vec3(.32, .267, .235), vec3(.27, .224, .196),
              smoothstep(169.0, 236.0, eyePoint.y));
            vec3 lidColor = mix(vec3(.19, .15, .13), relaxedLid, closeAmount);
            diffuseColor.rgb = mix(diffuseColor.rgb, lidColor, catLidCoverage);
          }
        }
      `)
      .replace('#include <roughnessmap_fragment>', `
        #include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 1.0, catLidCoverage);
      `)
      .replace('#include <metalnessmap_fragment>', `
        #include <metalnessmap_fragment>
        metalnessFactor *= 1.0 - catLidCoverage;
      `);
  };
  material.addEventListener('dispose', () => aperture.dispose());
  return { gaze, expression, muzzle };
}

export async function loadSeatedCat(
  url = new URL('./seated-cat.glb', import.meta.url),
) {
  const { scene, animations } = await new GLTFLoader().loadAsync(url.href ?? url);
  const neck = scene.getObjectByName('Neck');
  const head = scene.getObjectByName('Head');
  const tailSwish = animations.find((clip) => clip.name === 'TailSwish');
  if (!neck?.isBone || !head?.isBone || !tailSwish) {
    throw new Error('Expected the Seated Cat GLB with Neck, Head and TailSwish.');
  }

  const mixer = new AnimationMixer(scene);
  mixer.clipAction(tailSwish).play();
  const neckRest = neck.quaternion.clone();
  const headRest = head.quaternion.clone();
  const euler = new Euler(0, 0, 0, 'YXZ');
  const offset = new Quaternion();
  const mesh = scene.getObjectByName('CatMesh');
  const eyes = mesh?.material?.isMeshStandardMaterial && typeof document !== 'undefined'
    ? addEyeTracking(mesh)
    : null;
  let pointerX = 0;
  let pointerY = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let urgent = 0;
  let relaxed = 0;
  let reactionYaw = 0;
  let reactionPitch = 0;
  let reactionRoll = 0;
  let reactionBlush = 0;
  let reactionMouth = 0;

  return {
    model: scene,

    // Both coordinates run from -1 to 1. Positive y points up.
    setPointer(x, y) {
      pointerX = MathUtils.clamp(x, -1, 1);
      pointerY = MathUtils.clamp(y, -1, 1);
      targetYaw = radians(14) * pointerX;
      targetPitch = -radians(7) * pointerY;
    },

    setReaction({ tension = 0, squint = 0, yaw = 0, pitch = 0, roll = 0, blush = 0, mouth = 0 } = {}) {
      urgent = tension;
      relaxed = squint;
      reactionYaw = yaw;
      reactionPitch = pitch;
      reactionRoll = roll;
      reactionBlush = blush;
      reactionMouth = mouth;
    },

    update(deltaSeconds) {
      mixer.update(deltaSeconds);
      yaw = MathUtils.damp(yaw, targetYaw + reactionYaw, 8, deltaSeconds);
      pitch = MathUtils.damp(pitch, targetPitch + reactionPitch, 8, deltaSeconds);
      roll = MathUtils.damp(roll, reactionRoll, 9, deltaSeconds);

      offset.setFromEuler(euler.set(pitch * 0.35, yaw * 0.28, 0));
      neck.quaternion.copy(neckRest).multiply(offset);

      offset.setFromEuler(euler.set(pitch * 0.65, yaw * 0.72, roll));
      head.quaternion.copy(headRest).multiply(offset);

      if (eyes) {
        eyes.gaze.x = MathUtils.damp(eyes.gaze.x, 15.5 * pointerX, 17, deltaSeconds);
        eyes.gaze.y = MathUtils.damp(eyes.gaze.y, -11 * pointerY, 17, deltaSeconds);
        eyes.expression.x = MathUtils.damp(eyes.expression.x, urgent, 11, deltaSeconds);
        eyes.expression.y = MathUtils.damp(eyes.expression.y, relaxed, 11, deltaSeconds);
        eyes.muzzle.x = MathUtils.damp(eyes.muzzle.x, reactionBlush, 10, deltaSeconds);
        eyes.muzzle.y = MathUtils.damp(eyes.muzzle.y, reactionMouth, 32, deltaSeconds);
      }
    },
  };
}

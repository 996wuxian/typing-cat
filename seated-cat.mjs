import { AnimationMixer, CanvasTexture, Euler, MathUtils, Quaternion, Vector2, Vector4 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const radians = MathUtils.degToRad;

function addEyeTracking(mesh) {
  const gaze = new Vector2();
  const expression = new Vector4(0, 0, 0, 0);
  const muzzle = new Vector2();
  const tearTime = { value: 0 };
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
    shader.uniforms.catTearTime = tearTime;
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
        uniform vec4 catExpression;
        uniform vec2 catMuzzle;
        uniform float catTearTime;
      `)
      .replace('#include <map_fragment>', `
        #include <map_fragment>
        float catCrying = catExpression.z;
        if (catMuzzle.x > 0.0) {
          vec2 cheekCenter = vCatRestPosition.x < .022 ? vec2(-.082, .759) : vec2(.126, .759);
          vec2 cheek = (vCatRestPosition.xy - cheekCenter) / vec2(.049, .022);
          float blush = exp(-2.3 * dot(cheek, cheek)) * smoothstep(.227, .266, vCatRestPosition.z);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.83, .23, .30), blush * catMuzzle.x * .7);
        }
        if (catMuzzle.y > .02) {
          vec2 lipOffset = vCatRestPosition.xy - vec2(.020, .721 - .004 * catMuzzle.y);
          float mouthWidth = mix(.019, .024, catCrying);
          float fromMouthCenter = lipOffset.x / mouthWidth;
          lipOffset.y += .006 * catCrying * min(fromMouthCenter * fromMouthCenter, 1.0);
          vec2 lips = lipOffset / vec2(mouthWidth, .003 + .012 * catMuzzle.y);
          float lip = (1.0 - smoothstep(.67, 1.03, dot(lips, lips))) * smoothstep(.260, .301, vCatRestPosition.z);
          vec3 mouth = mix(vec3(.078, .026, .029), vec3(.30, .092, .10), smoothstep(.15, .72, -lips.y));
          diffuseColor.rgb = mix(diffuseColor.rgb, mouth, lip * smoothstep(.02, .26, catMuzzle.y));
        }
        vec2 eyePoint = vec2(vCatRestPosition.x + 0.235, 0.925 - vCatRestPosition.y) * 1500.0;
        vec2 eyeUV = (eyePoint - vec2(222.0, 150.0)) / vec2(316.0, 92.0);
        float catLidCoverage = 0.0;
        float catTearWetness = 0.0;
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
            float fromEyeCenter = (eyePoint.x - restCenter.x) * leftEye / 36.0;
            float inward = clamp(fromEyeCenter, -1.0, 1.0);
            float lidLine = 166.0 + catExpression.x * (15.0 + 12.0 * inward) + 79.0 * closeAmount;
            float eyelid = (1.0 - smoothstep(lidLine - 2.0, lidLine + 2.0, eyePoint.y))
              * max(catExpression.x, closeAmount) * eyeMask;
            catLidCoverage = max(eyelid, shut * smoothstep(.015, .53, outerEye));
            vec3 relaxedLid = mix(vec3(.32, .267, .235), vec3(.27, .224, .196),
              smoothstep(169.0, 236.0, eyePoint.y));
            vec3 lidColor = mix(vec3(.19, .15, .13), relaxedLid, closeAmount);
            diffuseColor.rgb = mix(diffuseColor.rgb, lidColor, catLidCoverage);
            float sleeping = catExpression.w;
            float creaseAmount = max(catCrying, .78 * sleeping);
            if (creaseAmount > .0) {
              float sadLid = 12.0 - 10.0 * inward + 3.5 * inward * inward;
              float restedLid = 16.0 - 8.0 * inward * inward;
              float creaseY = restCenter.y + mix(sadLid, restedLid, sleeping);
              float crease = (1.0 - smoothstep(1.2, 3.2, abs(eyePoint.y - creaseY)))
                * (1.0 - smoothstep(.68, 1.04, abs(fromEyeCenter))) * catLidCoverage;
              diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.12, .092, .082), crease * creaseAmount * .9);
            }
          }
        }
        if (catCrying > .01 && eyePoint.y > 212.0 && eyePoint.y < 290.0) {
          // Use the same head-space projection as the eyelids so the tears follow the face.
          bool leftCheek = eyePoint.x < 380.0;
          vec2 corner = leftCheek ? vec2(267.0, 221.0) : vec2(501.0, 220.0);
          float delay = leftCheek ? 0.0 : .30;
          float phase = fract(max(0.0, catTearTime - delay) / .94);
          float travel = 4.0 + 50.0 * pow(phase, 1.65);
          float flow = smoothstep(.09, .24, phase) * (1.0 - smoothstep(.75, 1.0, phase));
          float down = eyePoint.y - corner.y;
          float outward = leftCheek ? -1.0 : 1.0;
          float alongCheek = max(0.0, down);
          float across = eyePoint.x - corner.x - outward * alongCheek * (.075 + .002 * alongCheek);

          vec2 poolUV = vec2(across, down) / vec2(8.2, 3.5);
          float pool = 1.0 - smoothstep(.28, 1.06, dot(poolUV, poolUV));
          float trail = (1.0 - smoothstep(1.2, 4.2, abs(across))) * smoothstep(0.0, 8.0, down)
            * (1.0 - smoothstep(travel - 4.0, travel + 2.0, down));
          vec2 dropUV = vec2(across, down - travel) / vec2(6.8, 10.4);
          dropUV.x *= mix(1.38, 1.0, smoothstep(-.9, .35, dropUV.y));
          float drop = 1.0 - smoothstep(.65, 1.1, dot(dropUV, dropUV));
          vec2 highlightUV = (dropUV - vec2(-.25, -.29)) / vec2(.24, .42);
          float highlight = (1.0 - smoothstep(.19, 1.0, dot(highlightUV, highlightUV))) * drop;

          float visible = catCrying * smoothstep(.222, .263, vCatRestPosition.z);
          catTearWetness = visible * max(pool * .55, flow * max(trail * .52, drop));
          diffuseColor.rgb *= 1.0 - .16 * catTearWetness;
          float sheen = visible * max(pool * .25, flow * (trail * .09 + drop * .29 + highlight * .45));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.83, .88, .91), sheen);
        }
      `)
      .replace('#include <roughnessmap_fragment>', `
        #include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 1.0, catLidCoverage);
        roughnessFactor = mix(roughnessFactor, .24, catTearWetness);
      `)
      .replace('#include <metalnessmap_fragment>', `
        #include <metalnessmap_fragment>
        metalnessFactor *= 1.0 - catLidCoverage;
      `);
  };
  material.addEventListener('dispose', () => aperture.dispose());
  return { gaze, expression, muzzle, tearTime };
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
  let reactionCrying = 0;
  let reactionDoze = 0;

  return {
    model: scene,

    // Both coordinates run from -1 to 1. Positive y points up.
    setPointer(x, y) {
      pointerX = MathUtils.clamp(x, -1, 1);
      pointerY = MathUtils.clamp(y, -1, 1);
      targetYaw = radians(21) * pointerX;
      targetPitch = -radians(12) * pointerY;
    },

    setReaction({ tension = 0, squint = 0, yaw = 0, pitch = 0, roll = 0, blush = 0, mouth = 0,
      crying = 0, sob = 0, doze = 0 } = {}) {
      urgent = tension;
      relaxed = Math.max(squint, .96 * crying);
      reactionYaw = yaw;
      reactionPitch = pitch;
      reactionRoll = roll;
      reactionBlush = blush;
      reactionMouth = Math.max(mouth, sob);
      reactionCrying = crying;
      reactionDoze = doze;
    },

    update(deltaSeconds) {
      mixer.update(deltaSeconds);
      const pointerWeight = 1 - Math.max(.82 * reactionCrying, reactionDoze);
      yaw = MathUtils.damp(yaw, targetYaw * pointerWeight + reactionYaw, 8, deltaSeconds);
      pitch = MathUtils.damp(pitch, targetPitch * pointerWeight + reactionPitch + radians(7) * reactionCrying,
        8, deltaSeconds);
      roll = MathUtils.damp(roll, reactionRoll, 9, deltaSeconds);

      offset.setFromEuler(euler.set(pitch * 0.35, yaw * 0.28, 0));
      neck.quaternion.copy(neckRest).multiply(offset);

      offset.setFromEuler(euler.set(pitch * 0.65, yaw * 0.72, roll));
      head.quaternion.copy(headRest).multiply(offset);

      if (eyes) {
        eyes.gaze.x = MathUtils.damp(eyes.gaze.x, 19.5 * pointerX * pointerWeight, 17, deltaSeconds);
        eyes.gaze.y = MathUtils.damp(eyes.gaze.y, -14 * pointerY * pointerWeight + 9 * reactionCrying, 17, deltaSeconds);
        eyes.expression.x = MathUtils.damp(eyes.expression.x, urgent, 11, deltaSeconds);
        eyes.expression.y = MathUtils.damp(eyes.expression.y, relaxed, 11, deltaSeconds);
        eyes.expression.z = MathUtils.damp(eyes.expression.z, reactionCrying, 11, deltaSeconds);
        eyes.expression.w = MathUtils.damp(eyes.expression.w, reactionDoze, 11, deltaSeconds);
        eyes.tearTime.value = eyes.expression.z > .01 ? eyes.tearTime.value + deltaSeconds : 0;
        eyes.muzzle.x = MathUtils.damp(eyes.muzzle.x, reactionBlush, 10, deltaSeconds);
        eyes.muzzle.y = MathUtils.damp(eyes.muzzle.y, reactionMouth, 32, deltaSeconds);
      }
    },
  };
}

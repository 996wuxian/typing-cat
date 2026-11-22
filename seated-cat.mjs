import { AnimationMixer, CanvasTexture, Euler, MathUtils, Quaternion, Vector2 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const radians = MathUtils.degToRad;

function addEyeTracking(mesh) {
  const gaze = new Vector2();
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
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCatRestPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCatRestPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `
        #include <common>
        varying vec3 vCatRestPosition;
        uniform sampler2D catEyeAperture;
        uniform vec2 catEyeGaze;
      `)
      .replace('#include <map_fragment>', `
        #include <map_fragment>
        vec2 eyePoint = vec2(vCatRestPosition.x + 0.235, 0.925 - vCatRestPosition.y) * 1500.0;
        vec2 eyeUV = (eyePoint - vec2(222.0, 150.0)) / vec2(316.0, 92.0);
        float gazeBlend = smoothstep(0.15, 3.2, length(catEyeGaze));
        if (gazeBlend > 0.0 && vCatRestPosition.z > 0.235 && vCatRestPosition.z < 0.283
            && all(greaterThan(eyeUV, vec2(0.0))) && all(lessThan(eyeUV, vec2(1.0)))) {
          float eyeMask = texture2D(catEyeAperture, eyeUV).a;
          if (eyeMask > 0.0) {
            vec2 restCenter = eyePoint.x < 380.0 ? vec2(290.0, 195.0) : vec2(479.0, 194.0);
            vec2 fromPupil = (eyePoint - restCenter - catEyeGaze) / vec2(28.4, 30.1);
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
          }
        }
      `);
  };
  material.addEventListener('dispose', () => aperture.dispose());
  return gaze;
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
  const eyeGaze = mesh?.material?.isMeshStandardMaterial && typeof document !== 'undefined'
    ? addEyeTracking(mesh)
    : null;
  let pointerX = 0;
  let pointerY = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let yaw = 0;
  let pitch = 0;

  return {
    model: scene,

    // Both coordinates run from -1 to 1. Positive y points up.
    setPointer(x, y) {
      pointerX = MathUtils.clamp(x, -1, 1);
      pointerY = MathUtils.clamp(y, -1, 1);
      targetYaw = radians(14) * pointerX;
      targetPitch = -radians(7) * pointerY;
    },

    update(deltaSeconds) {
      mixer.update(deltaSeconds);
      yaw = MathUtils.damp(yaw, targetYaw, 8, deltaSeconds);
      pitch = MathUtils.damp(pitch, targetPitch, 8, deltaSeconds);

      offset.setFromEuler(euler.set(pitch * 0.35, yaw * 0.28, 0));
      neck.quaternion.copy(neckRest).multiply(offset);

      offset.setFromEuler(euler.set(pitch * 0.65, yaw * 0.72, 0));
      head.quaternion.copy(headRest).multiply(offset);

      if (eyeGaze) {
        eyeGaze.x = MathUtils.damp(eyeGaze.x, 15.5 * pointerX, 17, deltaSeconds);
        eyeGaze.y = MathUtils.damp(eyeGaze.y, -11 * pointerY, 17, deltaSeconds);
      }
    },
  };
}

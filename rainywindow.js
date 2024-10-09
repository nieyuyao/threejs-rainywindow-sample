import { Mesh, ShaderMaterial } from 'three'
import { FullScreenGeometry } from './full-screen-geometry.js'

export class RainyWindow extends Mesh {
  constructor(params) {
    const geo = new FullScreenGeometry()
    const mat = new ShaderMaterial({
      transparent: true,
      uniforms: {
        iResolution: { value: params.resolution },
        iTime: { value: 0 },
        mainTexture: { value: null },
        iBlur: { value: 0.4 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 1.0, 1.0);
        }
      `,
      fragmentShader: `
        #define S(a, b, t) smoothstep(a, b, t)

        uniform float iTime;
        uniform vec2 iResolution;
        uniform sampler2D mainTexture;
        uniform float iBlur;
        varying vec2 vUv;

        float N21(vec2 p) {
          p = fract(p * vec2(123.34, 345.45));
          p += dot(p, p + 34.345);
          return fract(p.x * p.y);
        }


        vec3 Layer(vec2 UV, float t, float uvSize) {
          vec2 aspect = vec2(2., 1.);
          vec2 uv = UV;
          uv /= iResolution;
          uv *= uvSize * aspect;
          uv.y += t * 0.25;

          vec2 id = floor(vec2(uv.x, uv.x));
          float n = N21(id);
          t += n * 6.2831;
         
          vec2 gv = fract(uv);
          gv -= 0.5;

          float w = UV.y * 10.0;
          float x = (n - 0.5) * 0.8;
          x += (0.4 - abs(x)) * sin(3. * w) * pow(sin(w), 6.) * 0.45;
          float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.45;
          y -= (gv.x - x) * (gv.x - x);

          // x^2 + y^2 + x^4 + 2x^2 * y = 0.05
          vec2 dropPos = (gv - vec2(x, y)) / aspect;
          float drop = S(0.05, 0.03, length(dropPos));

          vec2 trailPos = (gv - vec2(x, y)) / aspect;
          trailPos.y = (fract(trailPos.y * 8.) - 0.5) / 8.;
          float trail = S(0.03, 0.01, length(trailPos));
          float fogTrail = S(-0.05, 0.05, dropPos.y);
          fogTrail *= S(0.5, y, gv.y);
          trail *= fogTrail;
          fogTrail *= S(0.03, 0.02, abs(dropPos.x));

          vec2 offset = vec2(drop * dropPos + trail * trailPos);
          return vec3(offset, fogTrail);
        }

        void main() {
          float t = mod(iTime, 7200.);
          vec3 col = vec3(0.);

          vec3 drops = Layer(vUv, t * 1., 4.0);
          drops += Layer(vUv * 1.23 + 7.54, t * 4., 3.0);
          // drops += Layer(vUv * 1.23 + 1.54, t * 3., 5.0);
          drops += Layer(vUv * 1.57 - 7.54, t * 0.8, 8.0);

          float blur = iBlur * 7. * (1. - drops.z / 6.);
          vec4 texColor = textureLod(mainTexture, vUv + drops.xy * 5., blur);
          gl_FragColor = texColor;
        }
      `
    })
    super(geo, mat)
  }

  setTexture(texture) {
    this.material.uniforms.mainTexture.value = texture
  }

  update(elapsed) {
    this.material.uniforms.iTime.value = elapsed
  }
}
import * as THREE from "three";

// Uniforms shared by reference across every custom material; the Simulator
// writes them once per frame.
export const globals = {
  uTime: { value: 0 },
  uPower: { value: 0 },
  uHeat: { value: 0 },
  uFlow: { value: 0 },
  uLink: { value: 0 },
};

const common = /* glsl */ `
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
  }
  vec3 thermal(float t){
    t = clamp(t, 0., 1.) * 6.;
    vec3 c0=vec3(.004,.004,.02), c1=vec3(.02,.02,.58), c2=vec3(0.,.58,.79), c3=vec3(.04,.79,.1), c4=vec3(1.,.75,.02), c5=vec3(1.,.1,0.), c6=vec3(1.,.92,.85);
    if(t<1.) return mix(c0,c1,t);
    if(t<2.) return mix(c1,c2,t-1.);
    if(t<3.) return mix(c2,c3,t-2.);
    if(t<4.) return mix(c3,c4,t-3.);
    if(t<5.) return mix(c4,c5,t-4.);
    return mix(c5,c6,t-5.);
  }
`;

const uvVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vWorld;
  void main(){
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.);
    vWorld = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vView = cameraPosition - w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const col = (c: THREE.ColorRepresentation) => new THREE.Color(c);

export function traceMaterial(origin: [number, number]) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...globals,
      uOrigin:{ value: new THREE.Vector2(...origin) },
      uCopper: { value: col("#8a5a24") },
      uPulse: { value: col("#3ff3ff") },
      uHot: { value: col("#ff6a1a") },
    },
    vertexShader: /* glsl */ `
      attribute float aDist;
      attribute float aSeed;
      varying float vDist;
      varying float vSeed;
      varying vec3 vWorld;
      void main(){
        vDist = aDist; vSeed = aSeed;
        vec4 w = modelMatrix * vec4(position, 1.);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uPower, uHeat;
      uniform vec2 uOrigin;
      uniform vec3 uCopper, uPulse, uHot;
      varying float vDist;
      varying float vSeed;
      varying vec3 vWorld;
      void main(){
        float r = distance(vWorld.xz, uOrigin);
        float reach = uPower * 26.;
        float on = smoothstep(r - 1.5, r, reach);
        float live = step(0.35, fract(vSeed * 13.17));
        float speed = 0.25 + fract(vSeed * 3.1) * 0.45 + uHeat * 0.9;
        float s = fract(vDist / 3.2 - uTime * speed + vSeed * 7.);
        float pulse = pow(s, 22.) * live;
        vec3 pc = mix(uPulse, uHot, smoothstep(0.3, 1., uHeat) * step(r, 6.));
        vec3 c = uCopper * (0.12 + 0.18 * on) + pc * pulse * on * 3.5;
        float front = smoothstep(1.4, 0., abs(r - reach)) * (1. - step(0.999, uPower));
        c += uPulse * front * 2.5;
        gl_FragColor = vec4(c, 1.);
      }
    `,
  });
}

export function fiberMaterial(color: THREE.ColorRepresentation, length: number, seed = 0, speed = 0.6) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...globals,
      uColor: { value: col(color) },
      uLen: { value: length },
      uSeed: { value: seed },
      uSpeed: { value: speed },
      uBoost: { value: 1 },
    },
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime, uPower, uLen, uSeed, uSpeed, uBoost;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main(){
        float s = fract(vUv.x * uLen / 2.2 - uTime * uSpeed + uSeed);
        float pulse = pow(s, 16.);
        float fres = pow(1. - abs(dot(normalize(vN), normalize(vView))), 2.);
        vec3 c = uColor * (0.18 + fres * 0.9) * (0.2 + uPower) + uColor * pulse * 4.5 * uPower * uBoost;
        gl_FragColor = vec4(c, 1.);
      }
    `,
  });
}

export function coolantMaterial(a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, length: number) {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals, uA: { value: col(a) }, uB: { value: col(b) }, uLen: { value: length }, uAlpha: { value: 0.92 } },
    transparent: true,
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      ${common}
      uniform vec3 uA, uB;
      uniform float uTime, uPower, uFlow, uLen, uHeat, uAlpha;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main(){
        float x = vUv.x * uLen;
        float t = uTime * (0.4 + uFlow * 1.6);
        float n = noise(vec2(x * 2.2 - t * 3., vUv.y * 5.));
        float bands = smoothstep(0.55, 1., sin(x * 3. - t * 5.) * 0.5 + 0.5);
        float fres = pow(1. - abs(dot(normalize(vN), normalize(vView))), 1.5);
        vec3 c = mix(uA, uB, n * 0.7 + uHeat * 0.3);
        c *= (0.35 + bands * 1.4 + fres * 0.8) * (0.25 + uPower * 1.1);
        gl_FragColor = vec4(c, uAlpha);
      }
    `,
  });
}

export function dieMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals },
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      ${common}
      uniform float uTime, uPower, uHeat;
      varying vec2 vUv;
      void main(){
        vec2 g = vUv * 4.;
        vec2 id = floor(g);
        vec2 f = fract(g);
        float core = hash(id + 3.1);
        float wake = smoothstep(core * 0.6, core * 0.6 + 0.3, uHeat);
        // Keep peaks just under the white end of the ramp so cores stay distinguishable
        float t = 0.1 + 0.05 * sin(uTime * 0.8 + core * 30.);
        t += wake * (0.28 + core * 0.22 + 0.16 * sin(uTime * (2. + core * 4.) + core * 20.));
        t += noise(vUv * 9. + uTime * 0.4) * (0.05 + uHeat * 0.1);
        t += uHeat * 0.12 * (1. - length(vUv - 0.5) * 1.7);
        float grid = step(0.93, max(f.x, f.y)) + step(max(f.x, f.y), 0.03);
        // Stay mostly under the bloom threshold so the core grid reads; only peaks glow
        vec3 c = thermal(t) * (0.6 + 0.75 * uHeat + step(0.8, t) * 0.6) * (0.15 + uPower * 0.85);
        c = mix(c, vec3(0.03, 0.04, 0.05), clamp(grid, 0., 1.) * 0.7);
        float edge = step(0.98, max(abs(vUv.x*2.-1.), abs(vUv.y*2.-1.)));
        c += vec3(0.6, 0.45, 0.2) * edge;
        gl_FragColor = vec4(c, 1.);
      }
    `,
  });
}

export function heatGlowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      ${common}
      uniform float uTime, uHeat;
      varying vec2 vUv;
      void main(){
        float d = length(vUv - 0.5) * 2.;
        float n = noise(vUv * 6. + uTime * 0.3);
        float a = smoothstep(1., 0., d + n * 0.15);
        a = a * a * smoothstep(0.15, 1., uHeat);
        vec3 c = thermal(0.35 + 0.65 * (1. - d) * uHeat);
        gl_FragColor = vec4(c * a * 0.9, a);
      }
    `,
  });
}

export function lightBarMaterial(color: THREE.ColorRepresentation, seed: number) {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals, uColor: { value: col(color) }, uSeed: { value: seed }, uBoost: { value: 1 } },
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime, uPower, uSeed, uBoost;
      varying vec2 vUv;
      void main(){
        float s = fract(vUv.x * 0.8 - uTime * 0.35 + uSeed);
        float p = pow(s, 6.);
        vec3 c = uColor * (0.5 + p * 2.5) * uPower * uBoost;
        gl_FragColor = vec4(c, 1.);
      }
    `,
  });
}

export function holoPanelMaterial(color: THREE.ColorRepresentation) {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals, uColor: { value: col(color) }, uOpen: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime, uOpen;
      varying vec2 vUv;
      void main(){
        float scan = 0.5 + 0.5 * sin(vUv.y * 380. - uTime * 6.);
        vec2 q = abs(vUv * 2. - 1.);
        float edge = max(smoothstep(0.975, 1., q.x), smoothstep(0.96, 1., q.y));
        float corner = step(0.9, q.x) * step(0.86, q.y);
        float flick = 0.88 + 0.12 * sin(uTime * 37.) * sin(uTime * 11.);
        float sweep = smoothstep(0.03, 0., abs(fract(vUv.y - uTime * 0.2) - 0.5));
        float a = (0.05 + scan * 0.05 + edge * 0.8 + corner * 0.9 + sweep * 0.18) * flick * uOpen;
        gl_FragColor = vec4(uColor * (1. + edge * 2. + corner * 2.), a);
      }
    `,
  });
}

export function beamMaterial(color: THREE.ColorRepresentation) {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals, uColor: { value: col(color) }, uOpen: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime, uOpen;
      varying vec2 vUv;
      void main(){
        float streak = 0.6 + 0.4 * sin(vUv.x * 60. + uTime * 3.) * sin(vUv.x * 23. - uTime * 2.);
        float rise = 0.5 + 0.5 * sin(vUv.y * 30. - uTime * 8.);
        float a = mix(0.45, 0.02, vUv.y) * streak * (0.7 + rise * 0.3) * uOpen;
        gl_FragColor = vec4(uColor * 1.6, a);
      }
    `,
  });
}

export function floorMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...globals },
    transparent: true,
    depthWrite: false,
    vertexShader: uvVert,
    fragmentShader: /* glsl */ `
      uniform float uTime, uPower;
      varying vec3 vWorld;
      void main(){
        vec2 p = vWorld.xz;
        vec2 g = abs(fract(p / 2.) - 0.5);
        float line = smoothstep(0.03, 0., min(g.x, g.y));
        float d = length(p) ;
        float fade = smoothstep(60., 12., d);
        float ring = smoothstep(1.5, 0., abs(d - mod(uTime * 6., 60.))) * 0.5;
        vec3 c = vec3(0.1, 0.55, 0.6) * (line * 0.12 + ring * line * 0.8) * uPower;
        gl_FragColor = vec4(c, fade * (line * 0.8 + 0.02));
      }
    `,
  });
}

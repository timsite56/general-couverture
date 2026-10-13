import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ------------------------------------------------------------------ helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const win = (v, start, dur) => clamp((v - start) / dur);
const deg = THREE.MathUtils.degToRad;
const isMobile = () => innerWidth <= 820;

// ------------------------------------------------------------------ dimensions (metres)
const W = 10, D = 7, Hw = 3.5, A = deg(35), O = 0.5, GO = 0.45;
const HP = Hw + 0.35;
const tanA = Math.tan(A), cosA = Math.cos(A), sinA = Math.sin(A);
const S = D / 2 + O;
const yRidge = HP + (D / 2) * tanA;
const yEave = HP - O * tanA;
const L = S / cosA;
const Lx = W + 2 * GO;
const yRoof = (z) => yRidge - Math.abs(z) * tanA;
const onFront = (x, z, d) => new THREE.Vector3(x, yRoof(z) + d * cosA, z + d * sinA);
const CHIM = { x: 2.4, z: 1.3, half: 0.45 };

// ------------------------------------------------------------------ renderer
const stage = $('#stage');
const canvas = $('#scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  stage.classList.add('no-3d');
  $('#loader').classList.add('is-hidden');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
// Éclairage d'ambiance (reflets doux sur le zinc, les vitres, les tuiles)
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  pmrem.dispose();
} catch (e) { /* sans environnement, les lumières directes suffisent */ }

// ------------------------------------------------------------------ lights
const hemi = new THREE.HemisphereLight(0xdfe6ee, 0x8a847c, 0.75);
const amb = new THREE.AmbientLight(0xffffff, 0.25);
const sun = new THREE.DirectionalLight(0xfff4e0, 2.4);
sun.position.set(8, 14, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(isMobile() ? 1024 : 2048, isMobile() ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.03;
const doorLight = new THREE.PointLight(0xffb067, 0, 10, 2);
doorLight.position.set(0, 2.3, D / 2 + 1.0);
scene.add(hemi, amb, sun, sun.target, doorLight);

const LIGHTS = {
  jour: { sun: [8, 14, 7], sunI: 2.4, sunC: 0xfff4e0, skyC: 0xbcd0e6, gndC: 0x5a4a3a, hemiI: 0.7, ambI: 0.25, glow: 0, door: 0 },
  soir: { sun: [-11, 4.5, 9], sunI: 2.1, sunC: 0xff9a55, skyC: 0x7a5f7e, gndC: 0x3a2a22, hemiI: 0.5, ambI: 0.16, glow: 0.35, door: 2.5 },
  nuit: { sun: [-6, 11, -5], sunI: 0.35, sunC: 0x8ea6ff, skyC: 0x25324d, gndC: 0x0a0a0a, hemiI: 0.4, ambI: 0.08, glow: 1.3, door: 7 },
};
const lightCur = { sun: new THREE.Vector3(8, 14, 7), sunI: 2.4, sunC: new THREE.Color(0xfff4e0), skyC: new THREE.Color(0xbcd0e6), gndC: new THREE.Color(0x5a4a3a), hemiI: 0.7, ambI: 0.25, glow: 0, door: 0 };
let lightMode = 'jour';

// ------------------------------------------------------------------ materials
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
const M = {
  wall: std(0xf2ece1, { roughness: 1 }),
  base: std(0xb3a48d, { roughness: 1 }),
  timber: std(0xb6803f, { roughness: 0.85 }),
  rafter: std(0xc48e55, { roughness: 0.85 }),
  insul: std(0xe8d59c, { roughness: 1 }),
  underlay: std(0x2d3237, { roughness: 0.95, side: THREE.DoubleSide }),
  batten: std(0xc9a46c),
  tile: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }),
  slate: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.1 }),
  zinc: std(0xa4aaaf, { metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide }),
  zincNew: std(0xd6dde3, { metalness: 0.9, roughness: 0.2 }),
  chimney: std(0x9a4c3c, { roughness: 0.95 }),
  cap: std(0xd9d1c3),
  glass: new THREE.MeshStandardMaterial({ color: 0x1a2330, roughness: 0.25, metalness: 0.35, emissive: 0xffc473, emissiveIntensity: 0 }),
  frame: std(0xf5f2ea, { roughness: 0.7 }),
  shutter: std(0x5c6f69, { roughness: 0.8 }),
  door: std(0x3a2a21, { roughness: 0.7 }),
  plinth: std(0xb9b4ae, { roughness: 0.95 }),
  path: std(0xa39d95, { roughness: 1 }),
  lawn: std(0x3a5a37, { roughness: 1 }),
  hedge: std(0x2f5631, { roughness: 1 }),
  trunk: std(0x5a4030),
  leaf: std(0x41703d, { roughness: 1, flatShading: true }),
  defect: new THREE.MeshStandardMaterial({ color: 0x3a1a14, roughness: 0.9, emissive: 0xff3b2f, emissiveIntensity: 0 }),
  drop: new THREE.MeshStandardMaterial({ color: 0x8fd0ff, roughness: 0.15, metalness: 0.1, emissive: 0x3b8fff, emissiveIntensity: 0.6 }),
  stain: new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 1, transparent: true, opacity: 0, depthWrite: false }),
  ring: new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xff3b2f, emissiveIntensity: 1.2, transparent: true, opacity: 0, depthWrite: false }),
};
const shadowed = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

// ------------------------------------------------------------------ world
const world = new THREE.Group();
scene.add(world);
const plinth = new THREE.Mesh(new RoundedBoxGeometry(21, 0.7, 15.5, 4, 0.3), M.plinth);
plinth.position.y = -0.35; plinth.receiveShadow = true; world.add(plinth);
const lawn = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.1, 8, 2, 0.05), M.lawn);
lawn.position.set(-7.6, 0.05, 0.3); lawn.receiveShadow = true; world.add(lawn);
const path = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 3.4), M.path);
path.position.set(0, 0.02, D / 2 + 1.95); path.receiveShadow = true; world.add(path);
const step = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 0.6), M.base);
step.position.set(0, 0.08, D / 2 + 0.3); world.add(shadowed(step));
const hedge = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.9, 3.6, 2, 0.3), M.hedge);
hedge.position.set(6.9, 0.45, -0.8); world.add(shadowed(hedge));
const tree = new THREE.Group();
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.4, 8), M.trunk);
trunk.position.y = 1.2; tree.add(trunk);
[[0, 3.1, 0, 1.35], [0.8, 2.6, 0.5, 0.95], [-0.7, 2.7, -0.4, 0.9], [0.2, 3.9, -0.3, 0.8]].forEach(([x, y, z, r]) => {
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M.leaf); c.position.set(x, y, z); tree.add(c);
});
tree.position.set(-8, 0, 2.6); world.add(shadowed(tree));

const walls = new THREE.Mesh(new THREE.BoxGeometry(W, Hw, D), M.wall);
walls.position.y = Hw / 2; world.add(shadowed(walls));
const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.45, D + 0.06), M.base);
base.position.y = 0.225; world.add(shadowed(base));
const gShape = new THREE.Shape();
gShape.moveTo(-D / 2, Hw - 0.05); gShape.lineTo(D / 2, Hw - 0.05); gShape.lineTo(D / 2, HP); gShape.lineTo(0, yRidge); gShape.lineTo(-D / 2, HP); gShape.closePath();
const gGeo = new THREE.ExtrudeGeometry(gShape, { depth: 0.25, bevelEnabled: false });
for (const sgn of [1, -1]) {
  const gb = new THREE.Mesh(gGeo, M.wall);
  gb.rotation.y = sgn * Math.PI / 2; gb.position.x = sgn * (W / 2 - 0.25);
  world.add(shadowed(gb));
  const oc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24), M.glass);
  oc.rotation.z = Math.PI / 2; oc.position.set(sgn * (W / 2 + 0.02), Hw + 1.15, 0); world.add(oc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 8, 32), M.frame);
  ring.rotation.y = Math.PI / 2; ring.position.set(sgn * (W / 2 + 0.05), Hw + 1.15, 0); world.add(shadowed(ring));
}
function addOpening(x, y, z, w, h, rotY, { shutters = true, door = false } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY;
  const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.1), M.frame); fr.position.z = 0.03; g.add(fr);
  if (door) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), M.door); d.position.z = 0.07; g.add(d);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), M.zincNew); knob.position.set(w / 2 - 0.15, 0, 0.12); g.add(knob);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), M.glass); lamp.position.set(w / 2 + 0.45, h / 2 + 0.1, 0.1); g.add(lamp);
  } else {
    const gl = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), M.glass); gl.position.z = 0.07; g.add(gl);
    const mv = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.03), M.frame); mv.position.z = 0.1; g.add(mv);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.03), M.frame); mh.position.z = 0.1; g.add(mh);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.08, 0.22), M.frame); sill.position.set(0, -h / 2 - 0.08, 0.08); g.add(sill);
    if (shutters) for (const sg of [-1, 1]) {
      const sh = new THREE.Mesh(new THREE.BoxGeometry(w / 2, h + 0.1, 0.05), M.shutter);
      sh.position.set(sg * (w / 2 + 0.1 + w / 4), 0, 0.05); g.add(sh);
    }
  }
  world.add(shadowed(g));
}
addOpening(-3.3, 1.75, D / 2, 1.25, 1.45, 0);
addOpening(0, 1.1, D / 2, 1.05, 2.2, 0, { door: true });
addOpening(3.3, 1.75, D / 2, 1.25, 1.45, 0);
addOpening(-3, 1.75, -D / 2, 1.25, 1.45, Math.PI);
addOpening(0.4, 1.75, -D / 2, 1.25, 1.45, Math.PI);
addOpening(3.4, 1.75, -D / 2, 1.25, 1.45, Math.PI);
addOpening(W / 2, 1.75, 0.9, 1.1, 1.3, Math.PI / 2);
addOpening(-W / 2, 1.75, -0.7, 1.1, 1.3, -Math.PI / 2);

// ------------------------------------------------------------------ timber frame
const roof = new THREE.Group(); world.add(roof);
const frame = [];
const UP = new THREE.Vector3(0, 1, 0);
function beam(from, to, w, h, mat) {
  const len = from.distanceTo(to);
  const g = new THREE.BoxGeometry(w, len, h); g.translate(0, len / 2, 0);
  const m = new THREE.Mesh(g, mat); m.position.copy(from);
  m.quaternion.setFromUnitVectors(UP, to.clone().sub(from).normalize());
  m.castShadow = true; m.receiveShadow = true;
  roof.add(m); frame.push(m); return m;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
for (const sg of [1, -1]) beam(V(-W / 2, Hw + 0.08, sg * (D / 2 - 0.08)), V(W / 2, Hw + 0.08, sg * (D / 2 - 0.08)), 0.16, 0.16, M.timber);
const fermesX = [-W / 2 + 0.6, 0, W / 2 - 0.6];
for (const x of fermesX) beam(V(x, Hw + 0.28, -3.2), V(x, Hw + 0.28, 3.2), 0.18, 0.24, M.timber);
for (const x of fermesX) for (const sg of [1, -1]) beam(V(x, Hw + 0.42, sg * 3.0), V(x, yRidge - 0.62, 0), 0.16, 0.22, M.timber);
for (const x of fermesX) beam(V(x, Hw + 0.42, 0), V(x, yRidge - 0.64, 0), 0.16, 0.16, M.timber);
const panneY = (z) => yRoof(z) - 0.268 - 0.1;
for (const z of [-D / 4, D / 4, 0]) beam(V(-Lx / 2, panneY(z), z), V(Lx / 2, panneY(z), z), 0.2, 0.2, M.timber);
const NCH = 18;
for (let i = 0; i < NCH; i++) {
  const x = -Lx / 2 + 0.12 + i * ((Lx - 0.24) / (NCH - 1));
  for (const sg of [1, -1]) beam(V(x, yEave - 0.134, sg * S), V(x, yRidge - 0.134, 0), 0.08, 0.22, M.rafter);
}

// ------------------------------------------------------------------ tiles
const tileGeo = (() => {
  const flat = new THREE.BoxGeometry(0.3, 0.4, 0.025);
  const bump = new THREE.CylinderGeometry(0.065, 0.065, 0.4, 10, 1, false, -Math.PI / 2, Math.PI);
  bump.translate(-0.075, 0, 0.0125);
  return mergeGeometries([flat, bump]);
})();
const slateGeo = new THREE.BoxGeometry(0.22, 0.32, 0.008);
const ridgeTileGeo = new THREE.CylinderGeometry(0.13, 0.13, Lx, 12, 1, false, 0, Math.PI);
const TILE = { rows: 14, cols: Math.floor(Lx / 0.3), pitch: 0.33, v0: 0.25, len: 0.4, w: 0.3, tilt: -0.065, stagger: false, z0: 0.065, lift: 1.6 };
const SLATE = { rows: 34, cols: 47, pitch: 0.14, v0: 0.2, len: 0.32, w: 0.23, tilt: -0.035, stagger: true, z0: 0.055, lift: 1.6 };
const chimLocal = { x: CHIM.x, v: (S - CHIM.z) / cosA, half: CHIM.half + 0.12 };

function makeSlope(front) {
  const g = new THREE.Group(); g.position.set(0, yEave, S); g.rotation.x = A - Math.PI / 2;
  const root = new THREE.Group(); if (!front) root.rotation.y = Math.PI; root.add(g); roof.add(root);
  const insL = L - 0.66;
  const ins = new THREE.Mesh(new THREE.BoxGeometry(W, insL, 0.18), M.insul);
  ins.position.set(0, 0.61 + insL / 2, -0.11); g.add(shadowed(ins));
  let ug;
  if (front) {
    const sh = new THREE.Shape(); sh.moveTo(-Lx / 2, 0); sh.lineTo(Lx / 2, 0); sh.lineTo(Lx / 2, L); sh.lineTo(-Lx / 2, L); sh.closePath();
    const hole = new THREE.Path(); const h = CHIM.half + 0.06;
    hole.moveTo(chimLocal.x - h, chimLocal.v - h); hole.lineTo(chimLocal.x + h, chimLocal.v - h); hole.lineTo(chimLocal.x + h, chimLocal.v + h); hole.lineTo(chimLocal.x - h, chimLocal.v + h); hole.closePath();
    sh.holes.push(hole); ug = new THREE.ShapeGeometry(sh);
  } else { ug = new THREE.PlaneGeometry(Lx, L); ug.translate(0, L / 2, 0); }
  const und = new THREE.Mesh(ug, M.underlay.clone()); und.position.set(0, 0, 0.005); und.receiveShadow = true; g.add(und);
  const battens = []; const bg = new THREE.BoxGeometry(Lx, 0.04, 0.027); const batMat = M.batten.clone();
  for (let i = 0; i < TILE.rows; i++) {
    const b = new THREE.Mesh(bg, batMat); b.position.set(0, TILE.v0 + i * TILE.pitch, 0.0235); b.castShadow = true; g.add(b); battens.push(b);
  }
  const tiles = new THREE.InstancedMesh(tileGeo, M.tile.clone(), TILE.rows * TILE.cols);
  tiles.castShadow = true; tiles.receiveShadow = true; g.add(tiles);
  const slates = new THREE.InstancedMesh(slateGeo, M.slate.clone(), SLATE.rows * SLATE.cols);
  slates.castShadow = true; slates.receiveShadow = true; slates.visible = false; g.add(slates);
  return { front, root, g, ins, und, battens, batMat, tiles, slates };
}
const slopes = [makeSlope(true), makeSlope(false)];

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
function layoutInstances(mesh, P, build, explode, front) {
  let k = 0;
  const liftY = explode * P.lift * sinA, liftZ = explode * P.lift * cosA;
  const dur = 0.4 * 2.5 / P.rows;
  for (let i = 0; i < P.rows; i++) {
    const t = win(build, 0.6 + (0.4 - dur) * i / (P.rows - 1), dur);
    const yoff = (1 - t) * 0.7, zoff = (1 - t) * 1.3;
    const v = P.v0 + i * P.pitch + P.len / 2 - 0.12;
    for (let c = 0; c < P.cols; c++) {
      const x = -Lx / 2 + P.w / 2 + c * P.w + ((P.stagger && i % 2) ? P.w / 2 : 0);
      let sc = t > 0 ? 1 : 0.0001;
      if (front && Math.abs(x - chimLocal.x) < chimLocal.half && Math.abs(v - chimLocal.v) < chimLocal.half) sc = 0.0001;
      _p.set(x, v + yoff + liftY, P.z0 + zoff + liftZ);
      _e.set(P.tilt, 0, 0); _q.setFromEuler(_e); _s.set(sc, sc, sc);
      _m.compose(_p, _q, _s); mesh.setMatrixAt(k++, _m);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
}
function colorInstances(mesh, mode) {
  const c = new THREE.Color(); const n = mesh.count;
  for (let i = 0; i < n; i++) {
    if (mode === 'vieillie') {
      if (Math.random() < 0.13) c.setHSL(0.2 + Math.random() * 0.06, 0.28, 0.24 + Math.random() * 0.07);
      else c.setHSL(0.03 + Math.random() * 0.025, 0.42 + Math.random() * 0.12, 0.3 + Math.random() * 0.1);
    } else if (mode === 'ardoise') {
      c.setHSL(0.6 + Math.random() * 0.03, 0.1 + Math.random() * 0.06, 0.26 + Math.random() * 0.1);
    } else {
      c.setHSL(0.045 + Math.random() * 0.02, 0.58 + Math.random() * 0.12, 0.44 + Math.random() * 0.08);
    }
    mesh.setColorAt(i, c);
  }
  mesh.instanceColor.needsUpdate = true;
}

const ridge = new THREE.Group(); roof.add(ridge);
const ridgeTiles = new THREE.Mesh(ridgeTileGeo, M.tile.clone()); ridgeTiles.rotation.z = Math.PI / 2; ridgeTiles.position.y = yRidge + 0.03; ridge.add(shadowed(ridgeTiles));
const ridgeZinc = new THREE.Mesh(new THREE.BoxGeometry(Lx, 0.07, 0.42), M.zinc); ridgeZinc.position.y = yRidge + 0.08; ridgeZinc.visible = false; ridge.add(shadowed(ridgeZinc));
const gutters = new THREE.Group(); roof.add(gutters);
for (const sg of [1, -1]) {
  const gu = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, Lx, 12, 1, true, Math.PI, Math.PI), M.zinc);
  gu.rotation.z = Math.PI / 2; gu.position.set(0, yEave - 0.1, sg * (S + 0.07)); gutters.add(shadowed(gu));
  for (const sx of [1, -1]) {
    const dp = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, yEave - 0.15, 10), M.zinc);
    dp.position.set(sx * (W / 2 - 0.4), (yEave - 0.15) / 2, sg * (D / 2 + 0.11)); gutters.add(shadowed(dp));
  }
}
const chimney = new THREE.Group(); world.add(chimney);
const chBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.3, 0.9), M.chimney); chBody.position.set(CHIM.x, yRoof(CHIM.z) - 0.95 + 1.15, CHIM.z); chimney.add(shadowed(chBody));
const chCap = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.14, 1.08), M.cap); chCap.position.set(CHIM.x, yRoof(CHIM.z) + 1.42, CHIM.z); chimney.add(shadowed(chCap));
const chPot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.4, 12), M.cap); chPot.position.set(CHIM.x, yRoof(CHIM.z) + 1.68, CHIM.z); chimney.add(shadowed(chPot));
const flashing = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 1.3), M.zinc); flashing.rotation.x = A; flashing.position.copy(onFront(CHIM.x, CHIM.z, 0.19)); chimney.add(flashing);

// leak scene
const leak = new THREE.Group(); world.add(leak);
const defect = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.12), M.defect); defect.rotation.x = A; defect.position.copy(onFront(CHIM.x, CHIM.z - 0.52, 0.2)); leak.add(defect);
const repairSkirt = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.035, 1.42), M.zincNew); repairSkirt.rotation.x = A; repairSkirt.position.copy(onFront(CHIM.x, CHIM.z, 0.21)); repairSkirt.visible = false; leak.add(repairSkirt);
const repairBack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.04), M.zincNew); repairBack.position.copy(onFront(CHIM.x, CHIM.z - 0.47, 0.24)).add(V(0, 0.2, 0)); repairBack.visible = false; leak.add(repairBack);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 8, 48), M.ring); ring.rotation.x = A - Math.PI / 2; ring.position.copy(onFront(CHIM.x, CHIM.z, 0.3)); leak.add(ring);
const drop = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), M.drop); drop.visible = false; leak.add(drop);
const P0 = onFront(CHIM.x, CHIM.z - 0.4, -0.05), P1 = onFront(CHIM.x, 3.25, -0.05);
const stain = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), M.stain); stain.scale.set(1.1, 0.7, 1); stain.rotation.x = A - Math.PI / 2; stain.position.copy(onFront(CHIM.x, 3.22, -0.03)); leak.add(stain);
const RN = 1800; const rp = new Float32Array(RN * 3);
for (let i = 0; i < RN; i++) { rp[i * 3] = -8 + Math.random() * 16; rp[i * 3 + 1] = 3 + Math.random() * 10; rp[i * 3 + 2] = -5 + Math.random() * 11; }
const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xa9cbee, size: 0.07, transparent: true, opacity: 0, depthWrite: false }));
rain.visible = false; leak.add(rain);

// ------------------------------------------------------------------ state
const exp = $('#experience');
const steps = $$('.step');
const NCHAP = steps.length;
const KEYS = [
  { az: 38, el: 20, dist: 34, tgt: [0, 3.2, 0] },
  { az: 56, el: 33, dist: 32, tgt: [0, 3.8, 0] },
  { az: 22, el: 27, dist: 30, tgt: [0, 3.6, 0] },
  { az: 26, el: 21, dist: 29, tgt: [0, 5.4, 0.6] },
  { az: 18, el: 26, dist: 15, tgt: [2.4, 5.2, 1.6] },
  { az: -28, el: 19, dist: 33, tgt: [0, 3.2, 0] },
];
const st = { p: 0, cp: 0, build: 1, explode: 0, leakW: 0, az: KEYS[0].az, el: KEYS[0].el, dist: KEYS[0].dist, tgt: new THREE.Vector3(...KEYS[0].tgt), userAz: 0, parAz: 0, parEl: 0 };
let matMode = 'tuile', leakStep = 0, leakManual = false, leakTimer = 0;
let lastBuild = -1, lastExplode = -1, dirty = true;
let stageW = 1, stageH = 1, stageTop = 0;

// Progression : un chapitre commence quand le haut de son texte franchit la ligne de déclenchement
// (sous la scène épinglée sur mobile, au milieu de l'écran sur grand écran).
function readScroll() {
  const line = isMobile() ? stage.getBoundingClientRect().bottom + 14 : innerHeight * 0.5;
  let cp = 0;
  for (let i = 0; i < NCHAP; i++) {
    const r = steps[i].getBoundingClientRect();
    if (r.top <= line) cp = i + clamp((line - r.top) / Math.max(1, r.height + (i === NCHAP - 1 ? innerHeight * 0.3 : 0)));
  }
  st.cp = Math.min(cp, NCHAP - 0.001);
  st.p = st.cp / NCHAP;
}

function chapterWeight(i, cp) {
  const f = cp - i; if (f < 0 || f > 1) return 0;
  const fin = i === 0 ? 1 : smooth(f / 0.12);
  const fout = i === NCHAP - 1 ? 1 : 1 - smooth((f - 0.88) / 0.12);
  return fin * fout;
}
function targets() {
  const cp = st.cp, ci = Math.min(NCHAP - 1, Math.floor(cp)), cf = cp - ci;
  let build = 1, explode = 0, leakW = 0;
  if (ci === 1) build = cf < 0.2 ? 1 - cf / 0.2 : 0.5 * (cf - 0.2) / 0.8;
  else if (ci === 2) build = 0.5 + 0.5 * cf;
  if (ci === 3) explode = smooth(cf / 0.65);
  else if (ci === 4) { explode = 1 - smooth(cf / 0.15); leakW = smooth((cf - 0.05) / 0.12) * (1 - smooth((cf - 0.82) / 0.15)); }
  const ki = clamp(cp - 0.5, 0, NCHAP - 1), kb = Math.floor(ki), kf = smooth((ki - kb - 0.25) / 0.5);
  const a = KEYS[Math.min(kb, NCHAP - 1)], b = KEYS[Math.min(kb + 1, NCHAP - 1)];
  let az = lerp(a.az, b.az, kf), el = lerp(a.el, b.el, kf), dist = lerp(a.dist, b.dist, kf);
  const tgt = new THREE.Vector3().fromArray(a.tgt).lerp(new THREE.Vector3().fromArray(b.tgt), kf);
  if (ci === 4) {
    const stepTgt = [[2.4, 4.6, 2.4], [2.4, 5.4, 1.1], [2.4, 5.4, 1.2]][leakStep];
    tgt.lerp(new THREE.Vector3(...stepTgt), leakW * 0.9);
    az += leakStep * 7 * leakW;
  }
  if (ci === NCHAP - 1) az += cf * 30;
  return { build, explode, leakW, az, el, dist, tgt, ci, cf, cp };
}

// ------------------------------------------------------------------ UI
function setStep(n, manual) {
  leakStep = n; if (manual) leakManual = true; leakTimer = 0;
  $$('.step-btn').forEach((b) => b.classList.toggle('is-active', +b.dataset.step === n));
  $$('.step-text').forEach((p) => { p.hidden = +p.dataset.stepText !== n; });
}
$$('.step-btn').forEach((b) => b.addEventListener('click', () => setStep(+b.dataset.step, true)));
function setMat(mode) {
  matMode = mode;
  $$('[data-mat]').forEach((b) => b.classList.toggle('is-active', b.dataset.mat === mode));
  const slate = mode === 'ardoise';
  for (const sl of slopes) { sl.tiles.visible = !slate; sl.slates.visible = slate; colorInstances(slate ? sl.slates : sl.tiles, mode); }
  ridgeTiles.visible = !slate; ridgeZinc.visible = slate;
  if (!slate) { const c = new THREE.Color(); c.setHSL(mode === 'vieillie' ? 0.035 : 0.05, mode === 'vieillie' ? 0.45 : 0.62, mode === 'vieillie' ? 0.33 : 0.46); ridgeTiles.material.color.copy(c); }
  dirty = true;
}
$$('[data-mat]').forEach((b) => b.addEventListener('click', () => setMat(b.dataset.mat)));
function setLight(mode) {
  lightMode = mode;
  $$('[data-light]').forEach((b) => b.classList.toggle('is-active', b.dataset.light === mode));
  stage.dataset.light = mode;
}
$$('[data-light]').forEach((b) => b.addEventListener('click', () => setLight(b.dataset.light)));

let dragging = false, lastX = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
addEventListener('pointermove', (e) => {
  if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; st.userAz += dx * 0.25; }
  if (e.pointerType === 'mouse' && !isMobile()) {
    const r = stage.getBoundingClientRect();
    st.parAz = ((e.clientX - r.left) / r.width - 0.5) * 5; st.parEl = ((e.clientY - r.top) / r.height - 0.5) * -2.5;
  }
});
addEventListener('pointerup', () => { dragging = false; });
addEventListener('pointercancel', () => { dragging = false; });

// labels (positioned inside the stage box)
const layerLabels = {
  tuiles: { x: -3.5, v: 2.6, z: 0.1, lift: TILE.lift },
  liteaux: { x: -1.3, v: 2.1, z: 0.05, lift: 1.2 },
  ecran: { x: 1.0, v: 2.4, z: 0.02, lift: 0.8 },
  isolation: { x: 3.4, v: 2.0, z: -0.02, lift: 0.4 },
  chevrons: { x: -4.2, v: 1.5, z: -0.1, lift: 0 },
};
const labelEls = $$('.lbl[data-layer]').map((el) => ({ el, cfg: layerLabels[el.dataset.layer] }));
const leakEls = $$('.lbl.leak');
const leakAnchors = [onFront(CHIM.x, 3.2, 0.15), onFront(CHIM.x, CHIM.z - 0.52, 0.35), new THREE.Vector3(CHIM.x, yRoof(CHIM.z) + 1.3, CHIM.z)];
const _v = new THREE.Vector3();
function placeLabel(el, worldPos, opacity) {
  _v.copy(worldPos).project(camera);
  const x = (_v.x + 1) / 2 * stageW, y = (1 - _v.y) / 2 * stageH;
  const flip = x > stageW * 0.52;
  el.classList.toggle('is-flipped', flip);
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${flip ? '-100%' : '0'}, -50%) translate(${flip ? '6px' : '-6px'}, 0)`;
  el.style.opacity = (_v.z < 1 ? opacity : 0).toFixed(2);
}

// ------------------------------------------------------------------ resize (stage box)
function resize() {
  const r = stage.getBoundingClientRect();
  stageW = Math.max(1, Math.round(r.width)); stageH = Math.max(1, Math.round(r.height));
  renderer.setSize(stageW, stageH, false);
  camera.aspect = stageW / stageH;
  camera.updateProjectionMatrix();
  readScroll();
}
addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);

// ------------------------------------------------------------------ build / explode
function applyBuild(build, explode) {
  const N = frame.length, fdur = 1.5 / N;
  for (let i = 0; i < N; i++) {
    const t = easeOut(win(build, (0.5 - fdur) * i / (N - 1), fdur));
    const m = frame[i]; m.visible = t > 0.001; m.scale.y = Math.max(t, 0.001);
  }
  for (const sl of slopes) {
    const ti = easeOut(win(build, 0.5, 0.05));
    sl.ins.visible = ti > 0.001; sl.ins.scale.x = Math.max(ti, 0.001);
    sl.ins.position.set(0, 0.61 + (L - 0.66) / 2 + explode * 0.4 * sinA, -0.11 + explode * 0.4 * cosA);
    const tu = easeOut(win(build, 0.53, 0.06));
    sl.und.visible = tu > 0.001; sl.und.scale.y = Math.max(tu, 0.001);
    sl.und.position.set(0, explode * 0.8 * sinA, 0.005 + explode * 0.8 * cosA);
    sl.battens.forEach((b, i) => {
      const t = easeOut(win(build, 0.57 + 0.05 * i / TILE.rows, 0.05 * 2 / TILE.rows));
      b.visible = t > 0.001; b.scale.x = Math.max(t, 0.001);
      b.position.set(0, TILE.v0 + i * TILE.pitch + explode * 1.2 * sinA, 0.0235 + explode * 1.2 * cosA);
    });
    if (sl.tiles.visible) layoutInstances(sl.tiles, TILE, build, explode, sl.front);
    if (sl.slates.visible) layoutInstances(sl.slates, SLATE, build, explode, sl.front);
  }
  const tr = easeOut(win(build, 0.93, 0.07)); ridge.visible = tr > 0.001; ridge.scale.x = Math.max(tr, 0.001); ridge.position.y = explode * 1.6;
  const tg = easeOut(win(build, 0.88, 0.1)); gutters.visible = tg > 0.001; gutters.scale.x = Math.max(tg, 0.001);
  const tc = easeOut(win(build, 0.96, 0.04)); flashing.visible = tc > 0.001;
}

// ------------------------------------------------------------------ main loop
const clock = new THREE.Clock();
let firstFrame = true;
const counterEl = $('#stage-counter'), barEl = $('#stage-bar');
const pad2 = (n) => String(n).padStart(2, '0');
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
  readScroll();
  const T = targets();
  const k = 1 - Math.exp(-dt * 7), kc = 1 - Math.exp(-dt * 4.5);
  st.build = lerp(st.build, T.build, k);
  st.explode = lerp(st.explode, T.explode, k);
  st.leakW = lerp(st.leakW, T.leakW, k);
  st.az = lerp(st.az, T.az, kc); st.el = lerp(st.el, T.el, kc); st.dist = lerp(st.dist, T.dist, kc); st.tgt.lerp(T.tgt, kc);
  if (!dragging && T.ci !== 5 && T.ci !== 0) st.userAz *= 0.97;

  if (dirty || Math.abs(st.build - lastBuild) > 1e-4 || Math.abs(st.explode - lastExplode) > 1e-4) {
    applyBuild(st.build, st.explode); lastBuild = st.build; lastExplode = st.explode; dirty = false;
  }

  // camera: fit the house whatever the stage aspect ratio
  const az = deg(st.az + st.userAz + st.parAz + Math.sin(time * 0.25) * 1.5), el = deg(st.el + st.parEl);
  const dist = st.dist * clamp(1.05 / camera.aspect, 1, 2.4) * (isMobile() ? 0.95 : 1);
  camera.position.set(st.tgt.x + dist * Math.sin(az) * Math.cos(el), st.tgt.y + dist * Math.sin(el), st.tgt.z + dist * Math.cos(az) * Math.cos(el));
  camera.lookAt(st.tgt);

  // lights
  const LT = LIGHTS[lightMode], kl = 1 - Math.exp(-dt * 2.2);
  lightCur.sun.lerp(new THREE.Vector3(...LT.sun), kl); sun.position.copy(lightCur.sun);
  lightCur.sunI = lerp(lightCur.sunI, LT.sunI, kl); sun.intensity = lightCur.sunI;
  lightCur.sunC.lerp(new THREE.Color(LT.sunC), kl); sun.color.copy(lightCur.sunC);
  lightCur.skyC.lerp(new THREE.Color(LT.skyC), kl); hemi.color.copy(lightCur.skyC);
  lightCur.gndC.lerp(new THREE.Color(LT.gndC), kl); hemi.groundColor.copy(lightCur.gndC);
  lightCur.hemiI = lerp(lightCur.hemiI, LT.hemiI, kl); hemi.intensity = lightCur.hemiI;
  lightCur.ambI = lerp(lightCur.ambI, LT.ambI, kl); amb.intensity = lightCur.ambI;
  lightCur.glow = lerp(lightCur.glow, LT.glow, kl); M.glass.emissiveIntensity = lightCur.glow;
  lightCur.door = lerp(lightCur.door, LT.door, kl); doorLight.intensity = lightCur.door;

  // leak scene
  const lw = st.leakW;
  const frontOp = lerp(1, 0.1, lw);
  const fs = slopes[0];
  for (const mat of [fs.tiles.material, fs.slates.material, fs.batMat, fs.und.material]) {
    const tr = frontOp < 0.995;
    if (mat.transparent !== tr) { mat.transparent = tr; mat.needsUpdate = true; }
    mat.opacity = frontOp; mat.depthWrite = frontOp > 0.5;
  }
  rain.visible = lw > 0.01; rain.material.opacity = lw * 0.75;
  if (rain.visible) {
    const pos = rainGeo.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) { pos[i] -= dt * 9; if (pos[i] < 2.4) pos[i] += 10.5; }
    rainGeo.attributes.position.needsUpdate = true;
  }
  if (lw > 0.5 && !leakManual) { leakTimer += dt; if (leakTimer > 4.2) setStep((leakStep + 1) % 3, false); }
  if (lw < 0.05) leakTimer = 0;
  const pulse = 0.5 + 0.5 * Math.sin(time * 4);
  const showDrop = lw > 0.3 && leakStep < 2;
  drop.visible = showDrop;
  if (showDrop) { const t = (time * 0.32) % 1; drop.position.lerpVectors(P0, P1, t * t); drop.scale.setScalar(0.7 + 0.5 * t); }
  M.stain.opacity = lw * (leakStep < 2 ? 0.75 : 0);
  M.defect.emissiveIntensity = leakStep === 1 ? 0.6 + pulse * 1.6 : 0; defect.visible = lw > 0.2 && leakStep < 2;
  repairSkirt.visible = repairBack.visible = lw > 0.2 && leakStep === 2;
  M.ring.emissive.set(leakStep === 2 ? 0x4cc38a : 0xff3b2f);
  M.ring.opacity = lw * (leakStep >= 1 ? 0.5 + pulse * 0.5 : 0);
  ring.visible = M.ring.opacity > 0.02; stain.visible = M.stain.opacity > 0.02;
  ring.scale.setScalar(1 + pulse * 0.12);

  // labels
  const lblOp = smooth((st.explode - 0.65) / 0.3) * (1 - lw);
  for (const { el, cfg } of labelEls) {
    _p.set(cfg.x, cfg.v + st.explode * cfg.lift * sinA, cfg.z + st.explode * cfg.lift * cosA);
    slopes[0].g.localToWorld(_p);
    placeLabel(el, _p, lblOp);
  }
  leakEls.forEach((el, i) => placeLabel(el, leakAnchors[i], (lw > 0.3 && leakStep === i) ? 1 : 0));

  // steps opacity (desktop) + progress UI
  const mobile = isMobile();
  steps.forEach((c, i) => {
    const inner = c.firstElementChild;
    inner.style.opacity = mobile ? '' : chapterWeight(i, T.cp).toFixed(2);
  });
  if (counterEl) counterEl.textContent = `${pad2(T.ci + 1)} / ${pad2(NCHAP)}`;
  if (barEl) barEl.style.width = `${(st.p * 100).toFixed(1)}%`;

  renderer.render(scene, camera);
  if (firstFrame) { firstFrame = false; setTimeout(() => $('#loader').classList.add('is-hidden'), 300); }
  requestAnimationFrame(tick);
}

// ------------------------------------------------------------------ boot
window.__dbg = { st, camera, KEYS, setMat, setLight, setStep, scene };
setMat('tuile');
resize();
applyBuild(1, 0);
sun.target.position.set(0, 2, 0);
tick();

// Paramètres d'URL pour les captures de contrôle (?step=3&f=0.6&mat=ardoise&light=nuit&leak=1&to=%23services)
const qs = new URLSearchParams(location.search);
if (qs.has('step') || qs.has('to')) {
  const go = () => {
    document.documentElement.style.scrollBehavior = 'auto';
    if (qs.get('mat')) setMat(qs.get('mat'));
    if (qs.get('light')) setLight(qs.get('light'));
    if (qs.has('leak')) setStep(+qs.get('leak'), true);
    if (qs.has('to')) { const el = document.querySelector(qs.get('to')); if (el) el.scrollIntoView(); return; }
    const i = clamp(+qs.get('step') || 0, 0, NCHAP - 1), f = clamp(+(qs.get('f') || 0.5));
    const r = steps[i].getBoundingClientRect();
    const line = isMobile() ? stage.getBoundingClientRect().bottom + 14 : innerHeight * 0.5;
    scrollBy(0, r.top - line + f * r.height);
  };
  addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(go)));
}

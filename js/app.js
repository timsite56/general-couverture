import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Général Couverture — la maquette 3D racontée au défilement : hero, coupe, diagnostic (6 désordres), entretien, matières
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
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// ------------------------------------------------------------------ dimensions (mètres)
const W = 10, D = 7, Hw = 3.5, A = deg(35), O = 0.5, GO = 0.45;
const HP = Hw + 0.35;
const tanA = Math.tan(A), cosA = Math.cos(A), sinA = Math.sin(A);
const S = D / 2 + O, yRidge = HP + (D / 2) * tanA, yEave = HP - O * tanA, L = S / cosA, Lx = W + 2 * GO;
const yRoof = (z) => yRidge - Math.abs(z) * tanA;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// point sur un versant : x (largeur), v (distance depuis l'égout le long de la pente), n (hauteur au-dessus de la surface)
const slopeToWorld = (front, x, v, n) => V3(x, yEave + v * sinA + n * cosA, (front ? 1 : -1) * (S - v * cosA + n * sinA));
const onFront = (x, z, d) => V3(x, yRoof(z) + d * cosA, z + d * sinA);
const CHIM = { x: 2.4, z: 1.3, half: 0.45 };
const chimLocal = { x: CHIM.x, v: (S - CHIM.z) / cosA, half: CHIM.half + 0.12 };
const VELUX = { x: -2.6, v: 1.55, w: 0.8, h: 1.2 };

// ------------------------------------------------------------------ renderer
const stage = $('#stage'), canvas = $('#scene'), exp = $('#experience');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  stage.classList.add('no-3d'); $('#loader').classList.add('is-hidden'); throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;
  pmrem.dispose();
} catch (e) { /* les lumières directes suffisent */ }

// ------------------------------------------------------------------ lumières (maquette sur fond bleu nuit)
const hemi = new THREE.HemisphereLight(0xcfdae8, 0x3a332c, 0.7);
const amb = new THREE.AmbientLight(0xffffff, 0.16);
const sun = new THREE.DirectionalLight(0xfff0dc, 2.3);
sun.position.set(8, 14, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(isMobile() ? 1024 : 2048, isMobile() ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 60 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
const rim = new THREE.DirectionalLight(0x9dbfe6, 0.9); rim.position.set(-9, 7, -11);
scene.add(hemi, amb, sun, sun.target, rim);
sun.target.position.set(0, 2, 0);

// ------------------------------------------------------------------ matériaux
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
const M = {
  wall: std(0xf0e8d9, { roughness: 1 }),
  base: std(0xb3a48d, { roughness: 1 }),
  timber: std(0xb6803f, { roughness: 0.85 }),
  rafter: std(0xc48e55, { roughness: 0.85 }),
  insul: std(0xe8d59c, { roughness: 1 }),
  underlay: std(0x2d3237, { roughness: 0.95, side: THREE.DoubleSide }),
  batten: std(0xc9a46c),
  deck: std(0xcdb07a, { roughness: 0.9 }),
  tile: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }),
  slate: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.1 }),
  zinc: std(0xa4aaaf, { metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide }),
  zincNew: std(0xd6dde3, { metalness: 0.9, roughness: 0.2 }),
  chimney: std(0x9a4c3c, { roughness: 0.95 }),
  cap: std(0xd9d1c3),
  glass: new THREE.MeshStandardMaterial({ color: 0x1a2330, roughness: 0.25, metalness: 0.35 }),
  frame: std(0xf5f2ea, { roughness: 0.7 }),
  shutter: std(0x4f6660, { roughness: 0.8 }),
  door: std(0x3a2a21, { roughness: 0.7 }),
  podium: std(0xe6dfd2, { roughness: 0.95 }),
  moss: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
  veluxFrame: std(0x3a3d41, { roughness: 0.6, metalness: 0.3 }),
  veluxGlass: new THREE.MeshStandardMaterial({ color: 0x24323f, roughness: 0.15, metalness: 0.45 }),
  defect: new THREE.MeshStandardMaterial({ color: 0x3a1a14, roughness: 0.9, emissive: 0xff3b2f, emissiveIntensity: 0 }),
  loose: std(0xb8623a, { roughness: 0.85 }),
  ring: new THREE.MeshBasicMaterial({ color: 0xe3c9a3, transparent: true, opacity: 0, depthWrite: false }),
};
const shadowed = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

// ------------------------------------------------------------------ maquette : socle, murs, ouvertures
const world = new THREE.Group(); scene.add(world);
const podium = new THREE.Mesh(new RoundedBoxGeometry(16, 0.6, 12, 4, 0.22), M.podium);
podium.position.y = -0.3; podium.receiveShadow = true; world.add(podium);
const step = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 0.6), M.base);
step.position.set(0, 0.08, D / 2 + 0.3); world.add(shadowed(step));
const walls = new THREE.Mesh(new THREE.BoxGeometry(W, Hw, D), M.wall);
walls.position.y = Hw / 2; world.add(shadowed(walls));
const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, 0.45, D + 0.06), M.base);
base.position.y = 0.225; world.add(shadowed(base));
const gShape = new THREE.Shape();
gShape.moveTo(-D / 2, Hw - 0.05); gShape.lineTo(D / 2, Hw - 0.05); gShape.lineTo(D / 2, HP); gShape.lineTo(0, yRidge); gShape.lineTo(-D / 2, HP); gShape.closePath();
const gGeo = new THREE.ExtrudeGeometry(gShape, { depth: 0.25, bevelEnabled: false });
for (const sgn of [1, -1]) {
  const gb = new THREE.Mesh(gGeo, M.wall); gb.rotation.y = sgn * Math.PI / 2; gb.position.x = sgn * (W / 2 - 0.25); world.add(shadowed(gb));
  const oc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24), M.glass); oc.rotation.z = Math.PI / 2; oc.position.set(sgn * (W / 2 + 0.02), Hw + 1.15, 0); world.add(oc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 8, 32), M.frame); ring.rotation.y = Math.PI / 2; ring.position.set(sgn * (W / 2 + 0.05), Hw + 1.15, 0); world.add(shadowed(ring));
}
function addOpening(x, y, z, w, h, rotY, { shutters = true, door = false } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY;
  const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.1), M.frame); fr.position.z = 0.03; g.add(fr);
  if (door) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), M.door); d.position.z = 0.07; g.add(d);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), M.zincNew); knob.position.set(w / 2 - 0.15, 0, 0.12); g.add(knob);
  } else {
    const gl = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), M.glass); gl.position.z = 0.07; g.add(gl);
    const mv = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.03), M.frame); mv.position.z = 0.1; g.add(mv);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.03), M.frame); mh.position.z = 0.1; g.add(mh);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.08, 0.22), M.frame); sill.position.set(0, -h / 2 - 0.08, 0.08); g.add(sill);
    if (shutters) for (const sg of [-1, 1]) { const sh = new THREE.Mesh(new THREE.BoxGeometry(w / 2, h + 0.1, 0.05), M.shutter); sh.position.set(sg * (w / 2 + 0.1 + w / 4), 0, 0.05); g.add(sh); }
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

// ------------------------------------------------------------------ charpente
const roof = new THREE.Group(); world.add(roof);
const frame = [];
const UP = V3(0, 1, 0);
function beam(from, to, w, h, mat) {
  const len = from.distanceTo(to);
  const g = new THREE.BoxGeometry(w, len, h); g.translate(0, len / 2, 0);
  const m = new THREE.Mesh(g, mat); m.position.copy(from);
  m.quaternion.setFromUnitVectors(UP, to.clone().sub(from).normalize());
  m.castShadow = true; m.receiveShadow = true;
  roof.add(m); frame.push(m); return m;
}
for (const sg of [1, -1]) beam(V3(-W / 2, Hw + 0.08, sg * (D / 2 - 0.08)), V3(W / 2, Hw + 0.08, sg * (D / 2 - 0.08)), 0.16, 0.16, M.timber);
const fermesX = [-W / 2 + 0.6, 0, W / 2 - 0.6];
for (const x of fermesX) beam(V3(x, Hw + 0.28, -3.2), V3(x, Hw + 0.28, 3.2), 0.18, 0.24, M.timber);
for (const x of fermesX) for (const sg of [1, -1]) beam(V3(x, Hw + 0.42, sg * 3.0), V3(x, yRidge - 0.62, 0), 0.16, 0.22, M.timber);
for (const x of fermesX) beam(V3(x, Hw + 0.42, 0), V3(x, yRidge - 0.64, 0), 0.16, 0.16, M.timber);
const panneY = (z) => yRoof(z) - 0.268 - 0.1;
for (const z of [-D / 4, D / 4, 0]) beam(V3(-Lx / 2, panneY(z), z), V3(Lx / 2, panneY(z), z), 0.2, 0.2, M.timber);
const NCH = 18;
for (let i = 0; i < NCH; i++) {
  const x = -Lx / 2 + 0.12 + i * ((Lx - 0.24) / (NCH - 1));
  for (const sg of [1, -1]) beam(V3(x, yEave - 0.134, sg * S), V3(x, yRidge - 0.134, 0), 0.08, 0.22, M.rafter);
}

// ------------------------------------------------------------------ couverture (instances)
const tileGeo = (() => {
  const flat = new THREE.BoxGeometry(0.3, 0.4, 0.025);
  const bump = new THREE.CylinderGeometry(0.065, 0.065, 0.4, 10, 1, false, -Math.PI / 2, Math.PI);
  bump.translate(-0.075, 0, 0.0125);
  return mergeGeometries([flat, bump]);
})();
const slateGeo = new THREE.BoxGeometry(0.22, 0.32, 0.008);
const ridgeTileGeo = new THREE.CylinderGeometry(0.13, 0.13, Lx, 12, 1, false, 0, Math.PI);
const TILE = { rows: 14, cols: Math.floor(Lx / 0.3), pitch: 0.33, v0: 0.25, len: 0.4, w: 0.3, tilt: -0.065, stagger: false, z0: 0.065, lift: 2.3 };
const SLATE = { rows: 34, cols: 47, pitch: 0.14, v0: 0.2, len: 0.32, w: 0.23, tilt: -0.035, stagger: true, z0: 0.055, lift: 2.3 };
const mossScore = (front, x, v) => {
  const n = 0.5 + 0.5 * Math.sin(x * 1.9 + 1.3) * Math.cos(v * 2.4 - x * 0.7);
  let s = 0.45 * n + 0.35 * (1 - v / L) + 0.3 * rnd();
  s += front ? -0.12 : 0.3;
  return clamp(s);
};
function cells(P, front) {
  const out = [];
  for (let i = 0; i < P.rows; i++) {
    const v = P.v0 + i * P.pitch + P.len / 2 - 0.12;
    for (let c = 0; c < P.cols; c++) {
      const x = -Lx / 2 + P.w / 2 + c * P.w + ((P.stagger && i % 2) ? P.w / 2 : 0);
      let hole = false;
      if (front && Math.abs(x - chimLocal.x) < chimLocal.half && Math.abs(v - chimLocal.v) < chimLocal.half) hole = true;
      if (front && Math.abs(x - VELUX.x) < VELUX.w / 2 + 0.1 && Math.abs(v - VELUX.v) < VELUX.h / 2 + 0.12) hole = true;
      out.push({ x, v, row: i, hole, score: mossScore(front, x, v) });
    }
  }
  return out;
}

function makeSlope(front) {
  const g = new THREE.Group(); g.position.set(0, yEave, S); g.rotation.x = A - Math.PI / 2;
  const root = new THREE.Group(); if (!front) root.rotation.y = Math.PI; root.add(g); roof.add(root);
  const insL = L - 0.66;
  const ins = new THREE.Mesh(new THREE.BoxGeometry(W, insL, 0.18), M.insul.clone());
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
  for (let i = 0; i < TILE.rows; i++) { const b = new THREE.Mesh(bg, batMat); b.position.set(0, TILE.v0 + i * TILE.pitch, 0.0235); b.castShadow = true; g.add(b); battens.push(b); }
  const deck = new THREE.Mesh(new THREE.BoxGeometry(Lx, L, 0.03), M.deck.clone()); deck.position.set(0, L / 2, 0.02); deck.visible = false; g.add(shadowed(deck));
  const zinc = new THREE.Group(); zinc.visible = false; g.add(zinc);
  const zMat = M.zinc.clone(); zMat.side = THREE.FrontSide;
  const zp = new THREE.Mesh(new THREE.BoxGeometry(Lx, L, 0.02), zMat); zp.position.set(0, L / 2, 0.05); zinc.add(shadowed(zp));
  const NS = 16;
  for (let i = 0; i <= NS; i++) { const sm = new THREE.Mesh(new THREE.BoxGeometry(0.045, L - 0.08, 0.05), zMat); sm.position.set(-Lx / 2 + i * (Lx / NS), L / 2, 0.08); zinc.add(shadowed(sm)); }
  const tiles = new THREE.InstancedMesh(tileGeo, M.tile.clone(), TILE.rows * TILE.cols); tiles.castShadow = true; tiles.receiveShadow = true; g.add(tiles);
  const slates = new THREE.InstancedMesh(slateGeo, M.slate.clone(), SLATE.rows * SLATE.cols); slates.castShadow = true; slates.receiveShadow = true; slates.visible = false; g.add(slates);
  const NB = 90;
  const blobs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), M.moss.clone(), NB); g.add(blobs);
  const blobData = []; const c = new THREE.Color();
  for (let i = 0; i < NB; i++) {
    const x = -Lx / 2 + 0.3 + rnd() * (Lx - 0.6), v = 0.25 + rnd() * (L - 0.7);
    blobData.push({ x, v, r: 0.05 + rnd() * 0.08, score: mossScore(front, x, v) });
    c.setHSL(0.2 + rnd() * 0.08, 0.38, 0.3 + rnd() * 0.14).convertSRGBToLinear(); blobs.setColorAt(i, c);
  }
  blobs.instanceColor.needsUpdate = true;
  let velux = null;
  if (front) {
    velux = new THREE.Group();
    const vf = new THREE.Mesh(new THREE.BoxGeometry(VELUX.w + 0.2, VELUX.h + 0.2, 0.1), M.veluxFrame); vf.position.z = 0.05; velux.add(vf);
    const vg = new THREE.Mesh(new THREE.BoxGeometry(VELUX.w, VELUX.h, 0.04), M.veluxGlass.clone()); vg.position.z = 0.11; velux.add(vg);
    const vb = new THREE.Mesh(new THREE.BoxGeometry(VELUX.w + 0.2, 0.08, 0.03), M.veluxFrame); vb.position.set(0, 0, 0.13); velux.add(vb);
    velux.position.set(VELUX.x, VELUX.v, 0.08); velux.userData.glass = vg; g.add(shadowed(velux));
  }
  return { front, g, ins, und, battens, batMat, deck, zinc, zMat, tiles, slates, blobs, blobData, velux, tileCells: cells(TILE, front), slateCells: cells(SLATE, front), base: null };
}
const slopes = [makeSlope(true), makeSlope(false)];

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler(), _c = new THREE.Color();
function layoutInstances(mesh, cl, P, build, explode, gaps) {
  const liftY = explode * P.lift * sinA, liftZ = explode * P.lift * cosA;
  const dur = 0.4 * 2.5 / P.rows;
  for (let k = 0; k < cl.length; k++) {
    const c = cl[k];
    const t = win(build, 0.6 + (0.4 - dur) * c.row / (P.rows - 1), dur);
    const yoff = (1 - t) * 0.7, zoff = (1 - t) * 1.3;
    let sc = (t > 0 && !c.hole) ? 1 : 0.0001;
    if (sc > 0.5 && gaps) for (const gp of gaps) if (Math.abs(c.x - gp.x) < gp.r && Math.abs(c.v - gp.v) < gp.r) { sc = 0.0001; break; }
    _p.set(c.x, c.v + yoff + liftY, P.z0 + zoff + liftZ);
    _e.set(P.tilt, 0, 0); _q.setFromEuler(_e); _s.set(sc, sc, sc);
    _m.compose(_p, _q, _s); mesh.setMatrixAt(k, _m);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
function layoutBlobs(sl, explode, moss) {
  const thr = 1 - moss * 0.9, liftY = explode * TILE.lift * sinA, liftZ = explode * TILE.lift * cosA;
  sl.blobData.forEach((b, i) => {
    const m = moss > 0.02 ? smooth((b.score - thr) / 0.3) : 0, s = Math.max(b.r * m, 1e-4);
    _p.set(b.x, b.v + liftY, 0.1 + liftZ); _q.identity(); _s.set(s, s * 0.8, s * 0.45);
    _m.compose(_p, _q, _s); sl.blobs.setMatrixAt(i, _m);
  });
  sl.blobs.instanceMatrix.needsUpdate = true;
}

// matières : géométrie + couleurs de base
const MATS = {
  tuile: { geo: 'tile', base: () => _c.setHSL(0.04 + rnd() * 0.025, 0.6 + rnd() * 0.12, 0.42 + rnd() * 0.08).convertSRGBToLinear(), ridge: [0.045, 0.62, 0.42], rough: 0.85 },
  beton: { geo: 'tile', base: () => _c.setHSL(0.6 + rnd() * 0.02, 0.05 + rnd() * 0.05, 0.24 + rnd() * 0.08).convertSRGBToLinear(), ridge: [0.6, 0.06, 0.26], rough: 0.8 },
  ardoise: { geo: 'slate', base: () => _c.setHSL(0.6 + rnd() * 0.03, 0.1 + rnd() * 0.06, 0.3 + rnd() * 0.1).convertSRGBToLinear(), rough: 0.55 },
  zinc: { geo: 'zinc' },
};
const activeMesh = (sl) => MATS[matMode].geo === 'tile' ? sl.tiles : MATS[matMode].geo === 'slate' ? sl.slates : null;
const activeCells = (sl) => MATS[matMode].geo === 'slate' ? sl.slateCells : sl.tileCells;
function recolor(sl, moss, fade) {
  const mesh = activeMesh(sl); if (!mesh || !sl.base) return;
  const cl = activeCells(sl), b = sl.base, thr = 1 - moss * 0.9;
  for (let k = 0; k < cl.length; k++) {
    const c = cl[k]; let r = b[k * 3], g = b[k * 3 + 1], bl = b[k * 3 + 2];
    if (fade > 0.01 && sl.front) { const f = fade * 0.8, gr = (r + g + bl) / 3 * 1.3 + 0.14; r = lerp(r, gr, f); g = lerp(g, gr, f); bl = lerp(bl, gr, f); }
    if (moss > 0.01) { const m = clamp((c.score - thr) / 0.25) * 0.82; if (m > 0) { r = lerp(r, 0.27, m); g = lerp(g, 0.34, m); bl = lerp(bl, 0.14, m); } }
    _c.setRGB(r, g, bl); mesh.setColorAt(k, _c);
  }
  mesh.instanceColor.needsUpdate = true;
}

// faîtage, gouttières, cheminée, défauts
const ridge = new THREE.Group(); roof.add(ridge);
const ridgeTiles = new THREE.Mesh(ridgeTileGeo, M.tile.clone()); ridgeTiles.rotation.z = Math.PI / 2; ridgeTiles.position.y = yRidge + 0.03; ridge.add(shadowed(ridgeTiles));
const ridgeZinc = new THREE.Mesh(new THREE.BoxGeometry(Lx, 0.07, 0.42), M.zinc); ridgeZinc.position.y = yRidge + 0.08; ridgeZinc.visible = false; ridge.add(shadowed(ridgeZinc));
const gutters = new THREE.Group(); roof.add(gutters);
for (const sg of [1, -1]) {
  const gu = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, Lx, 12, 1, true, Math.PI, Math.PI), M.zinc);
  gu.rotation.z = Math.PI / 2; gu.position.set(0, yEave - 0.1, sg * (S + 0.07)); gutters.add(shadowed(gu));
  for (const sx of [1, -1]) { const dp = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, yEave - 0.15, 10), M.zinc); dp.position.set(sx * (W / 2 - 0.4), (yEave - 0.15) / 2, sg * (D / 2 + 0.11)); gutters.add(shadowed(dp)); }
}
const chimney = new THREE.Group(); world.add(chimney);
const chBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.3, 0.9), M.chimney); chBody.position.set(CHIM.x, yRoof(CHIM.z) + 0.2, CHIM.z); chimney.add(shadowed(chBody));
const chCap = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.14, 1.08), M.cap); chCap.position.set(CHIM.x, yRoof(CHIM.z) + 1.42, CHIM.z); chimney.add(shadowed(chCap));
const chPot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.4, 12), M.cap); chPot.position.set(CHIM.x, yRoof(CHIM.z) + 1.68, CHIM.z); chimney.add(shadowed(chPot));
const flashing = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 1.3), M.zinc); flashing.rotation.x = A; flashing.position.copy(onFront(CHIM.x, CHIM.z, 0.19)); chimney.add(flashing);
const defect = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.12), M.defect); defect.rotation.x = A; defect.position.copy(onFront(CHIM.x, CHIM.z - 0.52, 0.2)); defect.visible = false; world.add(defect);
const repairSkirt = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.035, 1.42), M.zincNew); repairSkirt.rotation.x = A; repairSkirt.position.copy(onFront(CHIM.x, CHIM.z, 0.21)); repairSkirt.visible = false; world.add(repairSkirt);
const looseTile = new THREE.Mesh(tileGeo, M.loose); looseTile.position.set(-0.9, 2.3 - 0.3, 0.1); looseTile.rotation.set(TILE.tilt, 0, 0.42); looseTile.visible = false; slopes[0].g.add(shadowed(looseTile));
const hsRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 48), M.ring); hsRing.visible = false; world.add(hsRing);
const RN = 1600; const rp = new Float32Array(RN * 3);
for (let i = 0; i < RN; i++) { rp[i * 3] = -8 + Math.random() * 16; rp[i * 3 + 1] = 3 + Math.random() * 10; rp[i * 3 + 2] = -5 + Math.random() * 11; }
const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xa9cbee, size: 0.07, transparent: true, opacity: 0, depthWrite: false })); rain.visible = false; world.add(rain);

// ------------------------------------------------------------------ chapitres (pilotés par le défilement)
const steps = $$('.step');
const NST = steps.length;
const KIND = steps.map((s) => s.dataset.kind);
const HSID = steps.map((s) => s.dataset.hs || null);
const KEYS = {
  hero: { az: 36, el: 19, dist: 35, tgt: [0, 3.2, 0] },
  coupe: { az: 26, el: 30, dist: 30, tgt: [0, 5.9, 0.7] },
  entretien: { az: 160, el: 30, dist: 28, tgt: [0, 5.0, -0.9] },
  matieres: { az: 32, el: 24, dist: 31, tgt: [0, 3.4, 0] },
};
const HS = {
  tuile: { cam: { az: 20, el: 20, dist: 16, tgt: [-0.9, 5.3, 2.7] }, anchor: slopeToWorld(true, -0.9, 2.3, 0.3), front: true, gaps: [{ x: -0.9, v: 2.3, r: 0.17 }] },
  usure: { cam: { az: 36, el: 22, dist: 17, tgt: [3.5, 4.8, 3.0] }, anchor: slopeToWorld(true, 3.6, 0.9, 0.32), front: true, gaps: [{ x: 3.15, v: 0.75, r: 0.17 }, { x: 3.45, v: 1.08, r: 0.17 }, { x: 3.75, v: 0.75, r: 0.17 }, { x: 4.05, v: 1.08, r: 0.17 }, { x: 3.45, v: 0.42, r: 0.17 }, { x: 4.05, v: 0.42, r: 0.17 }] },
  mousse: { cam: { az: 162, el: 30, dist: 24, tgt: [0.3, 5.0, -1.0] }, anchor: slopeToWorld(false, 0.6, 2.1, 0.32), front: false, gaps: [] },
  solin: { cam: { az: 16, el: 26, dist: 14, tgt: [2.4, 5.5, 1.4] }, anchor: onFront(CHIM.x, CHIM.z - 0.55, 0.4), front: true, gaps: [] },
  velux: { cam: { az: 12, el: 22, dist: 15, tgt: [-2.6, 5.1, 2.6] }, anchor: slopeToWorld(true, VELUX.x, VELUX.v, 0.4), front: true, gaps: [] },
  teinte: { cam: { az: 30, el: 24, dist: 22, tgt: [0.4, 5.0, 2.0] }, anchor: slopeToWorld(true, -3.7, 0.95, 0.3), front: true, gaps: [] },
};
const stepKey = (i) => (KIND[i] === 'hs' ? HS[HSID[i]].cam : KEYS[KIND[i]] || KEYS.hero);
const layerLabels = {
  couverture: { x: -4.3, v: 3.5, lift: TILE.lift },
  liteaux: { x: -2.3, v: 2.2, lift: 1.65 },
  ecran: { x: 2.2, v: 3.3, lift: 1.05 },
  isolation: { x: 4.0, v: 1.8, lift: 0.5 },
  charpente: { x: -4.8, v: 0.7, lift: 0 },
};
const CHAP = { hero: 1, coupe: 2, hs: 3, entretien: 4, matieres: 5 };
const MAT_ORDER = ['tuile', 'beton', 'ardoise', 'zinc'];

// ------------------------------------------------------------------ état
const _v = new THREE.Vector3();
const st = { cp: 0, build: 0, explode: 0, moss: 0, fade: 0, rain: 0, az: KEYS.hero.az, el: KEYS.hero.el, dist: KEYS.hero.dist, tgt: V3(...KEYS.hero.tgt), userAz: 0, parAz: 0, parEl: 0, sy: 0 };
let matMode = 'tuile', matManual = false, buildAnim = true, buildStart = 0, dirty = true, idle = 0, curStep = -1;
let lastBuild = -1, lastExplode = -1, lastMoss = -1, lastFade = -1, lastGapsKey = '';
let stageW = 1, stageH = 1;

// Progression : un chapitre commence quand le haut de son texte franchit le milieu de l'écran
function readScroll() {
  const line = innerHeight * 0.5; let cp = 0;
  for (let i = 0; i < NST; i++) {
    const r = steps[i].getBoundingClientRect();
    if (r.top <= line) cp = i + clamp((line - r.top) / Math.max(1, r.height + (i === NST - 1 ? innerHeight * 0.25 : 0)));
  }
  st.cp = Math.min(cp, NST - 0.001);
}
function chapterWeight(i, cp) {
  const f = cp - i; if (f < 0 || f > 1) return 0;
  const fin = i === 0 ? 1 : smooth(f / 0.12);
  const fout = i === NST - 1 ? 1 : 1 - smooth((f - 0.88) / 0.12);
  return fin * fout;
}
function targets() {
  const cp = st.cp, ci = Math.min(NST - 1, Math.floor(cp)), cf = cp - ci, kind = KIND[ci];
  const T = { moss: 0, fade: 0, explode: 0, rain: 0, defects: false, hs: null, after: false, sheen: 0, clean: 0, mat: null, ci, cf, kind };
  if (kind === 'coupe') T.explode = smooth(cf / 0.62);
  else if (kind === 'hs') {
    T.defects = true; T.hs = HSID[ci]; T.after = cf > 0.56;
    T.moss = (T.after && T.hs === 'mousse') ? 0 : 0.6;
    T.fade = (T.after && (T.hs === 'teinte' || T.hs === 'usure')) ? 0 : 0.45;
    T.rain = (T.hs === 'tuile' && !T.after) ? 1 : 0;
  } else if (kind === 'entretien') { T.clean = smooth((cf - 0.08) / 0.7); T.moss = 1 - T.clean; T.sheen = smooth((cf - 0.72) / 0.25); }
  else if (kind === 'matieres') T.mat = MAT_ORDER[Math.min(3, Math.floor(cf * 4.4))];
  const ki = clamp(cp - 0.5, 0, NST - 1), kb = Math.floor(ki), kf = smooth((ki - kb - 0.25) / 0.5);
  const a = stepKey(Math.min(kb, NST - 1)), b = stepKey(Math.min(kb + 1, NST - 1));
  T.az = lerp(a.az, b.az, kf); T.el = lerp(a.el, b.el, kf); T.dist = lerp(a.dist, b.dist, kf);
  T.tgt = _v.fromArray(a.tgt).lerp(_s.fromArray(b.tgt), kf);
  if (kind === 'matieres') T.az += cf * 40;
  return T;
}
function activeGaps(T) {
  if (!T.defects) return null;
  const g = [];
  for (const id in HS) { if (T.after && T.hs === id) continue; g.push(...HS[id].gaps); }
  return g;
}

// ------------------------------------------------------------------ interface
function setMat(m, manual) {
  matMode = m; if (manual) matManual = true; const cfg = MATS[m];
  $$('[data-mat]').forEach((b) => b.classList.toggle('is-active', b.dataset.mat === m));
  $$('[data-mat-info]').forEach((d) => { d.hidden = d.dataset.matInfo !== m; });
  for (const sl of slopes) {
    sl.tiles.visible = cfg.geo === 'tile'; sl.slates.visible = cfg.geo === 'slate';
    sl.zinc.visible = cfg.geo === 'zinc'; sl.deck.visible = cfg.geo === 'zinc';
    sl.battens.forEach((b) => { b.visible = cfg.geo !== 'zinc'; });
    sl.blobs.visible = cfg.geo !== 'zinc';
    const mesh = activeMesh(sl);
    if (mesh) {
      const n = activeCells(sl).length; sl.base = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) { cfg.base(); sl.base[k * 3] = _c.r; sl.base[k * 3 + 1] = _c.g; sl.base[k * 3 + 2] = _c.b; }
      mesh.material.roughness = cfg.rough;
    }
  }
  ridgeTiles.visible = cfg.geo === 'tile'; ridgeZinc.visible = cfg.geo !== 'tile';
  if (cfg.ridge) ridgeTiles.material.color.setHSL(...cfg.ridge).convertSRGBToLinear();
  lastMoss = -1; dirty = true;
}
function scrollToStep(i, f = 0.5) {
  const r = steps[i].getBoundingClientRect();
  scrollTo({ top: scrollY + r.top - innerHeight * 0.5 + f * r.height + 2, behavior: reduced ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const mat = e.target.closest('[data-mat]'); if (mat) { setMat(mat.dataset.mat, true); return; }
  const go = e.target.closest('[data-goto]'); if (go) { e.preventDefault(); scrollToStep(+go.dataset.goto, +(go.dataset.f || 0.5)); return; }
  const dot = e.target.closest('.hs'); if (dot) { const i = HSID.indexOf(dot.dataset.hs); if (i >= 0) scrollToStep(i, 0.2); }
});
const mcap = $('#m-caption'), counterEl = $('#stage-counter');
function showStep(ci) {
  if (ci === curStep) return;
  const prevKind = curStep >= 0 ? KIND[curStep] : null; curStep = ci;
  steps.forEach((s, i) => s.classList.toggle('is-current', i === ci));
  if (mcap) { mcap.innerHTML = steps[ci].querySelector('.step-inner').innerHTML; mcap.classList.remove('swap'); void mcap.offsetWidth; mcap.classList.add('swap'); mcap.scrollTop = 0; $$('[data-mat]', mcap).forEach((b) => b.classList.toggle('is-active', b.dataset.mat === matMode)); $$('[data-mat-info]', mcap).forEach((d) => { d.hidden = d.dataset.matInfo !== matMode; }); }
  if (counterEl) counterEl.textContent = `0${CHAP[KIND[ci]] || 1} / 05`;
  stage.dataset.kind = KIND[ci];
  if (prevKind === 'matieres' && KIND[ci] !== 'matieres') { matManual = false; if (matMode !== 'tuile') setMat('tuile'); }
}

// orbite à la main + parallaxe souris
let dragging = false, lastX = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; idle = 0; });
addEventListener('pointermove', (e) => {
  if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; st.userAz += dx * 0.28; idle = 0; }
  if (e.pointerType === 'mouse' && !isMobile()) {
    const r = stage.getBoundingClientRect();
    st.parAz = ((e.clientX - r.left) / r.width - 0.5) * 4; st.parEl = ((e.clientY - r.top) / r.height - 0.5) * -2;
  }
});
addEventListener('pointerup', () => { dragging = false; });
addEventListener('pointercancel', () => { dragging = false; });

// ------------------------------------------------------------------ étiquettes projetées
const labelEls = $$('.lbl[data-layer]').map((el) => ({ el, cfg: layerLabels[el.dataset.layer] }));
const hsEls = $$('.hs').map((el) => ({ el, cfg: HS[el.dataset.hs] }));
const _w = new THREE.Vector3();
function placeLabel(el, worldPos, opacity, flipAt = 0.52) {
  _w.copy(worldPos).project(camera);
  const x = (_w.x + 1) / 2 * stageW, y = (1 - _w.y) / 2 * stageH;
  const flip = x > stageW * flipAt;
  el.classList.toggle('is-flipped', flip);
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${flip ? '-100%' : '0'}, -50%) translate(${flip ? '6px' : '-6px'}, 0)`;
  const op = (_w.z < 1 ? opacity : 0);
  el.style.opacity = op.toFixed(2); el.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
}

// ------------------------------------------------------------------ taille
function resize() {
  const r = stage.getBoundingClientRect();
  stageW = Math.max(1, Math.round(r.width)); stageH = Math.max(1, Math.round(r.height));
  renderer.setSize(stageW, stageH, false);
  camera.aspect = stageW / stageH; camera.updateProjectionMatrix();
  readScroll();
}
addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);

function applyBuild(build, explode, gaps) {
  const N = frame.length, fdur = 1.5 / N;
  for (let i = 0; i < N; i++) { const t = easeOut(win(build, (0.5 - fdur) * i / (N - 1), fdur)); const m = frame[i]; m.visible = t > 0.001; m.scale.y = Math.max(t, 0.001); }
  for (const sl of slopes) {
    const ti = easeOut(win(build, 0.5, 0.05));
    sl.ins.visible = ti > 0.001; sl.ins.scale.x = Math.max(ti, 0.001);
    sl.ins.position.set(0, 0.61 + (L - 0.66) / 2 + explode * 0.5 * sinA, -0.11 + explode * 0.5 * cosA);
    const tu = easeOut(win(build, 0.53, 0.06));
    sl.und.visible = tu > 0.001; sl.und.scale.y = Math.max(tu, 0.001);
    sl.und.position.set(0, explode * 1.05 * sinA, 0.005 + explode * 1.05 * cosA);
    sl.battens.forEach((b, i) => {
      const t = easeOut(win(build, 0.57 + 0.05 * i / TILE.rows, 0.05 * 2 / TILE.rows));
      b.visible = t > 0.001 && MATS[matMode].geo !== 'zinc'; b.scale.x = Math.max(t, 0.001);
      b.position.set(0, TILE.v0 + i * TILE.pitch + explode * 1.65 * sinA, 0.0235 + explode * 1.65 * cosA);
    });
    const td = easeOut(win(build, 0.58, 0.08));
    sl.deck.scale.y = Math.max(td, 0.001); sl.deck.position.set(0, L / 2 + explode * 1.65 * sinA, 0.02 + explode * 1.65 * cosA);
    const tz = easeOut(win(build, 0.66, 0.3));
    sl.zinc.scale.y = Math.max(tz, 0.001); sl.zinc.position.set(0, explode * TILE.lift * sinA, explode * TILE.lift * cosA);
    if (sl.tiles.visible) layoutInstances(sl.tiles, sl.tileCells, TILE, build, explode, gaps);
    if (sl.slates.visible) layoutInstances(sl.slates, sl.slateCells, SLATE, build, explode, gaps);
    if (sl.velux) { sl.velux.visible = build > 0.97; sl.velux.position.set(VELUX.x, VELUX.v + explode * TILE.lift * sinA, 0.08 + explode * TILE.lift * cosA); }
  }
  const tr = easeOut(win(build, 0.93, 0.07)); ridge.visible = tr > 0.001; ridge.scale.x = Math.max(tr, 0.001); ridge.position.y = explode * TILE.lift;
  const tg = easeOut(win(build, 0.88, 0.1)); gutters.visible = tg > 0.001; gutters.scale.x = Math.max(tg, 0.001);
  flashing.visible = build > 0.96;
  looseTile.position.set(-0.9, 2.0 + explode * TILE.lift * sinA, 0.1 + explode * TILE.lift * cosA);
}

// ------------------------------------------------------------------ boucle
const clock = new THREE.Clock();
let firstFrame = true;
const cleanEls = $$('.clean-val');
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), time = clock.elapsedTime;
  readScroll();
  if (buildAnim) { st.build = reduced ? 1 : clamp((time - buildStart) / 3.2); if (st.build >= 1) buildAnim = false; }
  const T = targets();
  showStep(T.ci);
  if (T.mat && !matManual && T.mat !== matMode) setMat(T.mat);
  const k = 1 - Math.exp(-dt * 6), kc = 1 - Math.exp(-dt * 4), km = 1 - Math.exp(-dt * 3.5);
  st.explode = lerp(st.explode, T.explode, k);
  st.moss = lerp(st.moss, T.moss, km);
  st.fade = lerp(st.fade, T.fade, km);
  st.rain = lerp(st.rain, T.rain, k);
  st.az = lerp(st.az, T.az, kc); st.el = lerp(st.el, T.el, kc); st.dist = lerp(st.dist, T.dist, kc); st.tgt.lerp(T.tgt, kc);
  idle += dt; if (!dragging && idle > 5) st.userAz *= 0.985;

  // caméra : la maison remonte sur mobile (la légende occupe le bas de l'écran)
  const mobile = isMobile();
  const syT = mobile ? (T.kind === 'hero' ? 0.3 : 0.22) : 0;
  st.sy = lerp(st.sy, syT, kc);
  camera.setViewOffset(stageW, stageH, 0, st.sy * stageH, stageW, stageH);
  const orbit = (T.kind === 'hero' && !reduced) ? Math.sin(time * 0.22) * 2.5 : 0;
  const azR = deg(st.az + st.userAz + st.parAz + orbit), elR = deg(st.el + st.parEl);
  const dd = st.dist * clamp(1.05 / camera.aspect, 1, 2.4) * (mobile ? (T.kind === 'hero' ? 0.9 : 0.8) : 1);
  camera.position.set(st.tgt.x + dd * Math.sin(azR) * Math.cos(elR), st.tgt.y + dd * Math.sin(elR), st.tgt.z + dd * Math.cos(azR) * Math.cos(elR));
  camera.lookAt(st.tgt);

  // géométrie : montage, éclaté, tuiles manquantes
  const gaps = activeGaps(T), gapsKey = gaps ? gaps.length + (T.after ? 'a' : '') + (T.hs || '') : '';
  if (dirty || Math.abs(st.build - lastBuild) > 1e-4 || Math.abs(st.explode - lastExplode) > 1e-4 || gapsKey !== lastGapsKey) {
    applyBuild(st.build, st.explode, gaps); lastBuild = st.build; lastExplode = st.explode; lastGapsKey = gapsKey;
    for (const sl of slopes) layoutBlobs(sl, st.explode, st.moss);
    dirty = false; lastMoss = -1;
  }
  if (Math.abs(st.moss - lastMoss) > 0.008 || Math.abs(st.fade - lastFade) > 0.008) {
    for (const sl of slopes) { recolor(sl, st.moss, st.fade); layoutBlobs(sl, st.explode, st.moss); }
    lastMoss = st.moss; lastFade = st.fade;
  }
  for (const sl of slopes) { const mesh = activeMesh(sl); if (mesh) mesh.material.roughness = lerp(MATS[matMode].rough || 0.85, 0.5, T.sheen); }
  if (T.kind === 'entretien') { const txt = Math.round(T.clean * 100) + ' %'; cleanEls.forEach((e) => { if (e.textContent !== txt) e.textContent = txt; }); $$('.clean-val', mcap || document).forEach((e) => { if (e.textContent !== txt) e.textContent = txt; }); }

  // diagnostic : désordres visibles, réparation en seconde moitié de chaque étape
  const showDef = T.defects, hs = T.hs, after = T.after;
  looseTile.visible = showDef && !(after && hs === 'tuile');
  defect.visible = showDef && !(after && hs === 'solin'); repairSkirt.visible = showDef && after && hs === 'solin';
  const pulse = 0.5 + 0.5 * Math.sin(time * 4);
  M.defect.emissiveIntensity = hs === 'solin' && showDef && !after ? 0.5 + pulse * 1.4 : 0;
  const vg = slopes[0].velux.userData.glass.material;
  const fog = showDef && !(after && hs === 'velux') ? 1 : 0;
  vg.color.lerp(_c.set(fog ? 0xb9c0c4 : 0x24323f), k); vg.roughness = lerp(vg.roughness, fog ? 0.85 : 0.15, k); vg.metalness = lerp(vg.metalness, fog ? 0.05 : 0.45, k);
  rain.visible = st.rain > 0.02; rain.material.opacity = st.rain * 0.45;
  if (rain.visible) { const pos = rainGeo.attributes.position.array; for (let i = 1; i < pos.length; i += 3) { pos[i] -= dt * 9; if (pos[i] < 2.4) pos[i] += 10.5; } rainGeo.attributes.position.needsUpdate = true; }
  if (showDef && hs) {
    const cfg = HS[hs]; hsRing.visible = true; hsRing.position.copy(cfg.anchor); hsRing.rotation.set(cfg.front ? A - Math.PI / 2 : Math.PI / 2 - A, 0, 0);
    M.ring.opacity = after ? 0.25 : 0.45 + pulse * 0.45; hsRing.scale.setScalar(1 + pulse * 0.1);
  } else hsRing.visible = false;
  stage.classList.toggle('is-after', !!(showDef && after));

  // étiquettes
  const lblOp = T.kind === 'coupe' ? smooth((st.explode - 0.45) / 0.3) : 0;
  for (const { el, cfg } of labelEls) {
    _p.set(cfg.x, cfg.v + st.explode * cfg.lift * sinA, st.explode * cfg.lift * cosA);
    slopes[0].g.localToWorld(_p);
    placeLabel(el, _p, lblOp);
  }
  const nF = _v.set(0, cosA, sinA), nB = _s.set(0, cosA, -sinA);
  for (const { el, cfg } of hsEls) {
    const facing = _p.copy(camera.position).sub(cfg.anchor).dot(cfg.front ? nF : nB) > 0.3;
    el.classList.toggle('is-active', el.dataset.hs === hs);
    placeLabel(el, cfg.anchor, (showDef && facing) ? 1 : 0, 0.6);
  }

  // textes des chapitres (grand écran)
  if (!mobile) steps.forEach((c, i) => { c.firstElementChild.style.opacity = chapterWeight(i, T.cp === undefined ? st.cp : st.cp).toFixed(2); });
  else steps.forEach((c) => { c.firstElementChild.style.opacity = ''; });

  renderer.render(scene, camera);
  if (firstFrame) { firstFrame = false; setTimeout(() => $('#loader').classList.add('is-hidden'), 200); }
  requestAnimationFrame(tick);
}

// ------------------------------------------------------------------ démarrage
window.__dbg = { st, camera, KEYS, HS, setMat, scrollToStep, scene, steps };
setMat('tuile');
resize();
applyBuild(0, 0, null);
tick();

// Paramètres d'URL pour les captures : ?step=3&f=0.7&mat=ardoise&instant
const qs = new URLSearchParams(location.search);
if (qs.has('step')) {
  addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const i = clamp(+qs.get('step') || 0, 0, NST - 1), f = clamp(+(qs.get('f') || 0.5));
    const r = steps[i].getBoundingClientRect();
    scrollBy(0, r.top - innerHeight * 0.5 + f * r.height + 1);
    if (qs.get('mat')) setMat(qs.get('mat'), true);
    if (qs.has('instant')) { st.build = 1; buildAnim = false; readScroll(); const T = targets(); st.explode = T.explode; st.moss = T.moss; st.fade = T.fade; st.az = T.az; st.el = T.el; st.dist = T.dist; st.tgt.copy(T.tgt); st.sy = isMobile() ? (T.kind === 'hero' ? 0.3 : 0.22) : 0; }
    dirty = true;
  })));
}

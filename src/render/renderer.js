// Three.js renderer, scene and procedural meshes
import { TERRAIN } from '../world/map.js';

export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080f);
  scene.fog = new THREE.Fog(0x05080f, 30, 90);

  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 300);
  camera.position.set(0, 22, 14);
  camera.lookAt(0, 0, 0);

  // lights
  const ambient = new THREE.AmbientLight(0x334466, 0.7);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0x9a5cff, 0.9);
  dir.position.set(10, 20, 8);
  dir.castShadow = true;
  scene.add(dir);
  const glow = new THREE.PointLight(0x4aa8ff, 0.8, 40);
  glow.position.set(0, 6, 0);
  scene.add(glow);

  // fog / water base plane
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x05080f, transparent: true, opacity: 0 })
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.05;
  scene.add(base);

  let width = container.clientWidth;
  let height = container.clientHeight;
  const onResize = () => {
    width = container.clientWidth; height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera, width: () => width, height: () => height };
}

// Build a tile-based terrain mesh for the world
export function buildWorld(meshGroup, mapModel, tileSize = 3) {
  clearGroup(meshGroup);
  const geo = new THREE.BoxGeometry(tileSize, 0.8, tileSize);
  for (let y = 0; y < mapModel.size; y++) {
    for (let x = 0; x < mapModel.size; x++) {
      const terrain = mapModel.tiles[y][x];
      let color = 0x16203a;
      if (terrain === TERRAIN.FOREST) color = 0x1f3a24;
      else if (terrain === TERRAIN.RUINS) color = 0x33314a;
      else if (terrain === TERRAIN.WATER) color = 0x0a1c33;
      else if (terrain === TERRAIN.TOWER) color = 0x241d33;
      const mat = new THREE.MeshLambertMaterial({ color });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((x - mapModel.size / 2) * tileSize, 0, (y - mapModel.size / 2) * tileSize);
      m.receiveShadow = true;
      meshGroup.add(m);
      // forest trees
      if (terrain === TERRAIN.FOREST && (x * 7 + y * 13) % 5 === 0) {
        const tree = makeTree(0x1a2f1c, 0x274d2c);
        tree.position.copy(m.position).setY(0.4);
        meshGroup.add(tree);
      }
    }
  }
  // points of interest markers
  for (const p of mapModel.poi) {
    const pos = new THREE.Vector3((p.x - mapModel.size / 2) * tileSize, 1.2, (p.y - mapModel.size / 2) * tileSize);
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 2.4, 8),
      new THREE.MeshBasicMaterial({ color: p.color })
    );
    beacon.position.copy(pos);
    meshGroup.add(beacon);
    beacon.userData = { type: p.type, biome: p.biome, marker: true };
  }
  return meshGroup;
}

export function makeTree(trunk, leaves) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1), new THREE.MeshLambertMaterial({ color: trunk }));
  t.position.y = 0.5;
  const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55), new THREE.MeshLambertMaterial({ color: leaves }));
  l.position.y = 1.4;
  g.add(t); g.add(l);
  return g;
}

export function makePlayerMesh(color = 0x4aa8ff) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.7, 4, 8), new THREE.MeshLambertMaterial({ color }));
  body.position.y = 0.9;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshLambertMaterial({ color: 0xd7e6ff }));
  head.position.y = 1.9;
  const glow = new THREE.PointLight(color, 0.6, 6);
  glow.position.y = 1.4;
  g.add(body); g.add(head); g.add(glow);
  return g;
}

export function makeEnemyMesh(color, isBoss) {
  const g = new THREE.Group();
  const s = isBoss ? 1.6 : 1;
  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.55 * s),
    new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.2 })
  );
  body.position.y = 1.1 * s;
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
  eye.position.set(0, 1.35 * s, 0.4 * s);
  g.add(body); g.add(eye);
  return g;
}

export function clearGroup(group) {
  while (group.children.length) {
    const c = group.children[0];
    group.remove(c);
    if (c.geometry) c.geometry.dispose();
    if (c.material) { if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material.dispose(); }
  }
}

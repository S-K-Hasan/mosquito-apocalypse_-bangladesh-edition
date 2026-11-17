import * as THREE from 'three';
import { ART_COLORS, ArtMaterials } from './artSystem';

/**
 * Extra environment props used by Levels 2–6.
 * Everything is procedural geometry with cached materials so adding detail does
 * not multiply draw-call material compilation cost on mid-range Android.
 */

const matCache = new Map<string, THREE.Material>();

function standard(
  color: number,
  roughness = 0.7,
  metalness = 0.05,
  extra: Partial<THREE.MeshStandardMaterialParameters> = {}
): THREE.MeshStandardMaterial {
  const key = `s:${color}:${roughness}:${metalness}:${JSON.stringify(extra)}`;
  if (!matCache.has(key)) {
    matCache.set(
      key,
      new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra })
    );
  }
  return matCache.get(key) as THREE.MeshStandardMaterial;
}

function basic(color: number, opacity = 1): THREE.MeshBasicMaterial {
  const key = `b:${color}:${opacity}`;
  if (!matCache.has(key)) {
    matCache.set(
      key,
      new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity })
    );
  }
  return matCache.get(key) as THREE.MeshBasicMaterial;
}

function mesh(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  parent: THREE.Object3D,
  opts: { cast?: boolean; receive?: boolean } = {}
): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = opts.cast ?? true;
  m.receiveShadow = opts.receive ?? true;
  parent.add(m);
  return m;
}

// ============================================================================
// LEVEL 2 — APARTMENT CORRIDOR
// ============================================================================

/** Recessed teak apartment door with frame, panels, peephole, number plate. */
export function createDetailedApartmentDoor(number: string, handleSide = 1): THREE.Group {
  const g = new THREE.Group();
  const teak = ArtMaterials.wood(true, 0x4a2412);
  const frameMat = ArtMaterials.paintedWall(0xe7dcc8);
  const brass = ArtMaterials.metal('brass');

  // Heavy frame (jambs, header, threshold).
  mesh(new THREE.BoxGeometry(0.14, 2.36, 0.13), frameMat, g).position.set(-0.61, 1.18, 0);
  mesh(new THREE.BoxGeometry(0.14, 2.36, 0.13), frameMat, g).position.set(0.61, 1.18, 0);
  mesh(new THREE.BoxGeometry(1.36, 0.14, 0.13), frameMat, g).position.set(0, 2.29, 0);
  const threshold = mesh(new THREE.BoxGeometry(1.28, 0.05, 0.22), standard(0x3f3a34, 0.9), g);
  threshold.position.set(0, 0.025, 0.02);

  // Recessed leaf.
  const leaf = new THREE.Group();
  leaf.position.z = 0.035;
  g.add(leaf);
  mesh(new THREE.BoxGeometry(1.08, 2.16, 0.075), teak, leaf).position.y = 1.1;

  // Raised panel mouldings.
  const panelMat = ArtMaterials.wood(true, 0x5c2f17);
  for (const y of [0.55, 1.65]) {
    mesh(new THREE.BoxGeometry(0.82, 0.78, 0.022), panelMat, leaf).position.set(0, y, -0.049);
    const inset = mesh(new THREE.BoxGeometry(0.66, 0.62, 0.014), standard(0x3a1c0d, 0.62), leaf);
    inset.position.set(0, y, -0.062);
  }

  // Hinges.
  for (const y of [0.35, 1.85]) {
    mesh(new THREE.BoxGeometry(0.05, 0.16, 0.03), brass, leaf).position.set(-0.53, y, -0.055);
  }

  // Handle + escutcheon.
  const handle = mesh(
    new THREE.TorusGeometry(0.075, 0.014, 6, 12, Math.PI * 1.1),
    brass,
    leaf
  );
  handle.position.set(handleSide * 0.39, 1.03, -0.075);
  handle.rotation.y = Math.PI / 2;
  handle.rotation.z = -0.4;
  mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.018, 12), brass, leaf)
    .rotation.x = Math.PI / 2;
  const escutcheon = leaf.children[leaf.children.length - 1] as THREE.Mesh;
  escutcheon.position.set(handleSide * 0.39, 1.03, -0.06);

  // Peephole and number plate.
  mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.02, 10), brass, leaf)
    .rotation.x = Math.PI / 2;
  const peep = leaf.children[leaf.children.length - 1] as THREE.Mesh;
  peep.position.set(0, 1.58, -0.06);

  mesh(new THREE.BoxGeometry(0.22, 0.1, 0.01), standard(0xeab308, 0.35, 0.7), leaf)
    .position.set(0, 1.92, -0.058);
  const plate = leaf.children[leaf.children.length - 1] as THREE.Mesh;
  plate.position.set(0, 1.92, -0.058);

  // Bengali number rendered with a tiny canvas texture.
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 128, 64);
  ctx.strokeStyle = '#3f2a07';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, 122, 58);
  ctx.fillStyle = '#231704';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, 64, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  plate.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.3 });

  // Worn kick plate.
  const kick = mesh(new THREE.BoxGeometry(1.06, 0.24, 0.01), standard(0x7c6a52, 0.55, 0.5), leaf);
  kick.position.set(0, 0.15, -0.047);

  // Door mat.
  const mat = mesh(new THREE.BoxGeometry(0.82, 0.025, 0.42), ArtMaterials.fabric(0x6b4f2a), g);
  mat.position.set(0, 0.014, 0.26);

  return g;
}

/** Corridor window with iron security grill, sill and cool moonlit glass. */
export function createCorridorWindow(): THREE.Group {
  const g = new THREE.Group();
  const frame = ArtMaterials.metal('dark', 0x36514b);
  const glass = ArtMaterials.glass(0x8fc7ff, 0.24);

  mesh(new THREE.BoxGeometry(1.7, 0.1, 0.16), frame, g).position.y = 1.05;
  mesh(new THREE.BoxGeometry(1.7, 0.1, 0.16), frame, g).position.y = 2.35;
  mesh(new THREE.BoxGeometry(0.1, 1.4, 0.16), frame, g).position.set(-0.8, 1.7, 0);
  mesh(new THREE.BoxGeometry(0.1, 1.4, 0.16), frame, g).position.set(0.8, 1.7, 0);
  mesh(new THREE.BoxGeometry(0.07, 1.3, 0.1), frame, g).position.set(0, 1.7, 0);
  mesh(new THREE.BoxGeometry(1.56, 1.26, 0.02), glass, g, { cast: false }).position.set(0, 1.7, 0.06);

  // Deep sill.
  const sill = mesh(new THREE.BoxGeometry(1.9, 0.08, 0.34), ArtMaterials.concrete(0x8b8478), g);
  sill.position.set(0, 0.98, 0.12);

  // Security bars, slightly rusted.
  const barMat = ArtMaterials.metal('dark', 0x4a3b2c);
  for (let i = -3; i <= 3; i++) {
    mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.32, 6), barMat, g)
      .position.set(i * 0.21, 1.7, -0.02);
  }
  for (let j = 0; j < 3; j++) {
    mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.58, 6), barMat, g)
      .position.set(0, 1.25 + j * 0.45, -0.025);
  }

  // Mosquito mesh screen.
  const screen = mesh(
    new THREE.PlaneGeometry(1.54, 1.24),
    new THREE.MeshBasicMaterial({ color: 0x0b1418, transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
    g,
    { cast: false }
  );
  screen.position.set(0, 1.7, 0.075);

  return g;
}

/** Fluorescent batten fixture with an emissive tube. */
export function createFluorescentFixture(length = 1.35): THREE.Group {
  const g = new THREE.Group();
  const housingMat = ArtMaterials.metal('dark', 0xd7d3c8);
  const housing = mesh(
    new THREE.BoxGeometry(0.28, 0.1, length),
    housingMat,
    g
  );
  housing.position.y = 0.04;

  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xfffbe8,
    emissive: 0xfff2cc,
    emissiveIntensity: 1.5,
    roughness: 0.35,
  });
  const tube = mesh(new THREE.CylinderGeometry(0.035, 0.035, length - 0.12, 10), tubeMat, g, {
    cast: false,
  });
  tube.rotation.x = Math.PI / 2;
  tube.position.y = -0.015;

  // End caps.
  for (const z of [-length / 2 + 0.03, length / 2 - 0.03]) {
    const cap = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), housingMat, g, {
      cast: false,
    });
    cap.rotation.x = Math.PI / 2;
    cap.position.set(0, -0.015, z);
  }

  // Hanging rods.
  for (const z of [-0.45, 0.45]) {
    mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 5), housingMat, g, { cast: false })
      .position.set(0, 0.23, z);
  }

  g.name = 'fluorescentFixture';
  return g;
}

/** Hanging bare bulb with a protective wire cage (for the fuse room). */
export function createCagedBulb(): THREE.Group {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.85, 5), standard(0x1c1c1f, 0.9), g, {
    cast: false,
  }).position.y = 0.42;
  const shade = mesh(new THREE.ConeGeometry(0.11, 0.1, 12, 1, true), ArtMaterials.metal('dark', 0x2b2f33), g);
  shade.position.y = 0.02;
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffd9a0,
    emissive: 0xffb347,
    emissiveIntensity: 1.8,
    roughness: 0.3,
  });
  const bulb = mesh(new THREE.SphereGeometry(0.055, 10, 8), bulbMat, g, { cast: false });
  bulb.position.y = -0.075;
  bulb.name = 'cagedBulbGlow';
  // Wire cage.
  for (let i = 0; i < 4; i++) {
    const arc = mesh(new THREE.TorusGeometry(0.075, 0.004, 4, 12, Math.PI), ArtMaterials.metal('dark'), g, {
      cast: false,
    });
    arc.rotation.y = (i * Math.PI) / 4;
    arc.position.y = -0.075;
  }
  return g;
}

/** Old wooden corridor bench with turned legs and worn cushion. */
export function createCorridorBench(): THREE.Group {
  const g = new THREE.Group();
  const wood = ArtMaterials.wood(true, 0x5a321b);
  const seat = mesh(new THREE.BoxGeometry(1.55, 0.09, 0.42), wood, g);
  seat.position.y = 0.46;
  const cushion = mesh(new THREE.BoxGeometry(1.42, 0.09, 0.36), ArtMaterials.fabric(0x8a3b2e), g);
  cushion.position.y = 0.53;
  const back = mesh(new THREE.BoxGeometry(1.55, 0.42, 0.07), wood, g);
  back.position.set(0, 0.83, 0.18);
  back.rotation.x = -0.12;
  for (const x of [-0.63, 0.63]) {
    for (const z of [-0.14, 0.14]) {
      mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.46, 7), wood, g).position.set(x, 0.23, z);
    }
  }
  // Back supports.
  for (const x of [-0.63, 0.63]) {
    mesh(new THREE.BoxGeometry(0.06, 0.56, 0.06), wood, g).position.set(x, 0.72, 0.16);
  }
  return g;
}

/** Wooden shoe rack with a few pairs of slippers and sandals. */
export function createShoeRack(): THREE.Group {
  const g = new THREE.Group();
  const wood = ArtMaterials.wood(true, 0x5f3a20);
  mesh(new THREE.BoxGeometry(0.9, 0.05, 0.34), wood, g).position.y = 0.08;
  mesh(new THREE.BoxGeometry(0.9, 0.05, 0.34), wood, g).position.y = 0.42;
  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.14, 0.14]) {
      mesh(new THREE.BoxGeometry(0.045, 0.52, 0.045), wood, g).position.set(x, 0.26, z);
    }
  }
  const colors = [0x1e3a8a, 0x7f1d1d, 0x374151, 0x6d28d9];
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const sole = mesh(new THREE.BoxGeometry(0.22, 0.035, 0.1), standard(colors[i], 0.8), g);
      sole.position.set(-0.3 + i * 0.2, i < 2 ? 0.125 : 0.465, side * 0.07);
      sole.rotation.y = side * 0.08;
    }
  }
  return g;
}

/** LPG cylinder with regulator and hose. */
export function createGasCylinder(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.68, 16), standard(0xc2410c, 0.45, 0.35), g);
  body.position.y = 0.34;
  const top = mesh(new THREE.SphereGeometry(0.21, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), standard(0xc2410c, 0.45, 0.35), g);
  top.position.y = 0.68;
  top.scale.y = 0.35;
  const ring = mesh(new THREE.TorusGeometry(0.14, 0.022, 6, 16), ArtMaterials.metal('chrome'), g);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.76;
  const valve = mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.11, 8), ArtMaterials.metal('brass'), g);
  valve.position.y = 0.79;
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.81, 0),
    new THREE.Vector3(0.1, 0.86, 0.03),
    new THREE.Vector3(0.26, 0.78, 0.05),
    new THREE.Vector3(0.32, 0.62, 0.08),
  ]);
  mesh(new THREE.TubeGeometry(hoseCurve, 12, 0.012, 6, false), standard(0x1f2937, 0.8), g, {
    cast: false,
  });
  return g;
}

/** Blue plastic water jar with lid and tap. */
export function createWaterJar(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.27, 0.24, 0.66, 16), ArtMaterials.plastic(0x1d4ed8, false), g);
  body.position.y = 0.34;
  mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 16), ArtMaterials.plastic(0x1e40af, false), g)
    .position.set(0, 0.72, 0);
  const lid = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 16), ArtMaterials.plastic(0x93c5fd, false), g);
  lid.position.y = 0.82;
  const tap = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), ArtMaterials.plastic(0xdc2626), g);
  tap.rotation.z = Math.PI / 2;
  tap.position.set(0.26, 0.16, 0);
  return g;
}

/** Mop, wiper and bucket set. */
export function createMopBucket(): THREE.Group {
  const g = new THREE.Group();
  const bucket = mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.3, 14), ArtMaterials.plastic(0xdc2626, false), g);
  bucket.position.y = 0.16;
  mesh(new THREE.TorusGeometry(0.2, 0.012, 5, 14), ArtMaterials.plastic(0xb91c1c), g)
    .position.y = 0.31;
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, 0.33, 0),
    new THREE.Vector3(0, 0.48, 0.01),
    new THREE.Vector3(0.12, 0.33, 0),
  ]);
  mesh(new THREE.TubeGeometry(handleCurve, 8, 0.008, 5, false), ArtMaterials.metal('chrome'), g)
    .rotation.x = Math.PI / 2;
  const stick = mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 6), ArtMaterials.metal('chrome'), g);
  stick.position.set(0.18, 0.7, 0.05);
  stick.rotation.z = -0.18;
  const head = mesh(new THREE.BoxGeometry(0.26, 0.06, 0.12), standard(0xcbd5e1, 0.9), g);
  head.position.set(0.29, 0.12, 0.05);
  return g;
}

/** Cork notice board with Bengali notices and a taped timetable. */
export function createNoticeBoard(): THREE.Group {
  const g = new THREE.Group();
  const frame = ArtMaterials.wood(true, 0x4a2e17);
  mesh(new THREE.BoxGeometry(1.15, 0.02, 0.78), frame, g).rotation.x = Math.PI / 2;
  const board = mesh(new THREE.BoxGeometry(1.05, 0.72, 0.025), standard(0x9a6b3f, 0.95), g);
  board.position.z = -0.02;

  const paperColors = ['#f6f0df', '#e7f0d8', '#f3e1c4', '#f8f4e8'];
  const lines = [
    ['#2f3e46', '#2f3e46', '#8b3a3a'],
    ['#3c3c3c', '#3c3c3c'],
    ['#1f2937', '#6b7280', '#1f2937'],
    ['#3b2f2f'],
  ];
  for (let i = 0; i < 4; i++) {
    const c = document.createElement('canvas');
    c.width = 112;
    c.height = 150;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = paperColors[i];
    ctx.fillRect(0, 0, 112, 150);
    ctx.strokeStyle = lines[i][0];
    ctx.lineWidth = 2;
    for (let l = 0; l < 8; l++) {
      ctx.beginPath();
      ctx.moveTo(12, 28 + l * 14);
      ctx.lineTo(12 + 30 + Math.random() * 60, 28 + l * 14);
      ctx.strokeStyle = lines[i][(l + i) % lines[i].length];
      ctx.stroke();
    }
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(12, 10, 52, 8);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const paper = mesh(
      new THREE.PlaneGeometry(0.26, 0.34),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }),
      g,
      { cast: false }
    );
    paper.position.set(-0.34 + (i % 2) * 0.68, 0.14 - Math.floor(i / 2) * 0.34, 0.015);
    paper.rotation.z = (Math.random() - 0.5) * 0.15;
    const pin = mesh(new THREE.SphereGeometry(0.012, 6, 6), basic(i % 2 ? 0xdc2626 : 0x2563eb), g, {
      cast: false,
    });
    pin.position.set(paper.position.x, paper.position.y + 0.14, 0.03);
  }
  return g;
}

/** Damp plaster stain decal for corridor walls. */
export function createWallStain(width = 1.4, height = 2.2, tint = '#1b2a2a'): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 256);
  const grad = ctx.createRadialGradient(128, 40, 10, 128, 180, 170);
  grad.addColorStop(0, tint);
  grad.addColorStop(0.55, 'rgba(18,30,28,0.45)');
  grad.addColorStop(1, 'rgba(18,30,28,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.bezierCurveTo(210, 0, 230, 140, 190, 256);
  ctx.lineTo(60, 256);
  ctx.bezierCurveTo(10, 160, 20, 60, 30, 0);
  ctx.fill();
  // Drip streaks.
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = 'rgba(15,25,24,0.28)';
    ctx.lineWidth = 4 + Math.random() * 5;
    ctx.beginPath();
    ctx.moveTo(60 + i * 24, 20);
    ctx.lineTo(58 + i * 24, 180 + Math.random() * 60);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false })
  );
  m.renderOrder = 2;
  return m;
}

// ============================================================================
// LEVEL 3 — ROOFTOP
// ============================================================================

/** Traditional woven charpai / khatiya with a folded blanket. */
export function createRooftopCharpai(): THREE.Group {
  const g = new THREE.Group();
  const wood = ArtMaterials.wood(true, 0x6b3f20);
  const frameW = 1.7;
  const frameD = 0.85;
  mesh(new THREE.BoxGeometry(frameW, 0.07, 0.07), wood, g).position.set(0, 0.42, -frameD / 2);
  mesh(new THREE.BoxGeometry(frameW, 0.07, 0.07), wood, g).position.set(0, 0.42, frameD / 2);
  mesh(new THREE.BoxGeometry(0.07, 0.07, frameD), wood, g).position.set(-frameW / 2, 0.42, 0);
  mesh(new THREE.BoxGeometry(0.07, 0.07, frameD), wood, g).position.set(frameW / 2, 0.42, 0);
  for (const x of [-0.76, 0.76]) {
    for (const z of [-0.34, 0.34]) {
      mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.42, 7), wood, g).position.set(x, 0.21, z);
    }
  }
  // Woven rope surface.
  const ropeMat = standard(0xbda06a, 0.95);
  for (let i = 0; i < 9; i++) {
    const strip = mesh(new THREE.BoxGeometry(frameW - 0.1, 0.012, 0.035), ropeMat, g, {
      cast: false,
    });
    strip.position.set(0, 0.445, -frameD / 2 + 0.08 + i * ((frameD - 0.16) / 8));
  }
  for (let i = 0; i < 7; i++) {
    const strip = mesh(new THREE.BoxGeometry(0.035, 0.014, frameD - 0.1), ropeMat, g, {
      cast: false,
    });
    strip.position.set(-frameW / 2 + 0.1 + i * ((frameW - 0.2) / 6), 0.44, 0);
  }
  const blanket = mesh(new THREE.BoxGeometry(0.64, 0.07, 0.7), ArtMaterials.fabric(0x7f1d1d), g);
  blanket.position.set(0.42, 0.5, 0.02);
  return g;
}

/** Split AC outdoor unit with fan grille and copper pipes. */
export function createSplitACUnit(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(0.86, 0.58, 0.32), standard(0xd9d3c5, 0.55, 0.2), g);
  body.position.y = 0.34;
  const grille = mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20),
    standard(0x3b3b3b, 0.75, 0.1),
    g,
    { cast: false }
  );
  grille.rotation.x = Math.PI / 2;
  grille.position.set(-0.18, 0.35, 0.165);
  for (let i = 0; i < 6; i++) {
    const blade = mesh(new THREE.BoxGeometry(0.05, 0.16, 0.008), standard(0x4b5563, 0.5, 0.3), g, {
      cast: false,
    });
    blade.position.set(-0.18, 0.35, 0.18);
    blade.rotation.z = (i * Math.PI) / 3;
  }
  for (let i = 0; i < 7; i++) {
    mesh(new THREE.BoxGeometry(0.3, 0.006, 0.02), standard(0xb0aba0, 0.6), g, { cast: false })
      .position.set(0.24, 0.15 + i * 0.055, 0.165);
  }
  // Mounting bracket.
  for (const x of [-0.32, 0.32]) {
    mesh(new THREE.BoxGeometry(0.04, 0.06, 0.5), ArtMaterials.metal('dark'), g)
      .position.set(x, 0.03, -0.05);
  }
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.36, 0.2, -0.15),
    new THREE.Vector3(0.44, 0.1, -0.2),
    new THREE.Vector3(0.46, -0.3, -0.22),
    new THREE.Vector3(0.4, -0.7, -0.22),
  ]);
  mesh(new THREE.TubeGeometry(pipeCurve, 12, 0.018, 6, false), standard(0xb87333, 0.5, 0.7), g);
  return g;
}

/** Rooftop water drum with lid and bucket. */
export function createRooftopDrum(): THREE.Group {
  const g = new THREE.Group();
  const drum = mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.92, 16), ArtMaterials.plastic(0x1e3a8a, false), g);
  drum.position.y = 0.46;
  mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.045, 16), ArtMaterials.plastic(0x1e40af, false), g)
    .position.y = 0.93;
  mesh(new THREE.TorusGeometry(0.46, 0.02, 5, 16), ArtMaterials.plastic(0x172554), g)
    .rotation.x = Math.PI / 2;
  const bucket = mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.26, 12), ArtMaterials.plastic(0xdc2626, false), g);
  bucket.position.set(0.54, 0.13, 0.1);
  return g;
}

/** String of warm fairy bulbs for rooftop / street dressing. */
export function createStringLights(count = 14, span = 4.5): THREE.Group {
  const g = new THREE.Group();
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-span / 2, 0, 0),
    new THREE.Vector3(-span / 4, -0.25, 0),
    new THREE.Vector3(0, -0.42, 0),
    new THREE.Vector3(span / 4, -0.25, 0),
    new THREE.Vector3(span / 2, 0, 0),
  ]);
  mesh(new THREE.TubeGeometry(cable, 24, 0.008, 5, false), standard(0x1c1917, 0.9), g, {
    cast: false,
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffd27a,
    emissive: 0xffb347,
    emissiveIntensity: 2,
    roughness: 0.2,
  });
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const p = cable.getPoint(t);
    const bulb = mesh(new THREE.SphereGeometry(0.035, 7, 6), bulbMat, g, { cast: false });
    bulb.position.set(p.x, p.y - 0.035, p.z);
  }
  return g;
}

// ============================================================================
// LEVEL 5 — DHAKA STREET
// ============================================================================

/** Sagging overhead cable bundle with cloth ties. */
export function createOverheadCable(from: THREE.Vector3, to: THREE.Vector3): THREE.Group {
  const g = new THREE.Group();
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.y -= 0.7;
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  for (let i = 0; i < 3; i++) {
    const offset = i * 0.05;
    const c = new THREE.QuadraticBezierCurve3(
      from.clone().add(new THREE.Vector3(offset, 0, offset)),
      mid.clone().add(new THREE.Vector3(offset, 0.06, offset)),
      to.clone().add(new THREE.Vector3(offset, 0, offset))
    );
    mesh(new THREE.TubeGeometry(c, 20, 0.018, 4, false), standard(0x15161a, 0.9, 0.2), g, {
      cast: false,
    });
  }
  // Cloth ties / cable clumps.
  for (let i = 0; i < 4; i++) {
    const p = curve.getPoint(0.18 + i * 0.2);
    const tie = mesh(new THREE.CylinderGeometry(0.05, 0.13, 0.24, 6), ArtMaterials.fabric(0x4b5563), g, {
      cast: false,
    });
    tie.position.copy(p);
    tie.rotation.z = 0.1;
  }
  return g;
}

/** Striped shop awning with scalloped valance. */
export function createShopAwning(width = 2.6, depth = 1.2, colorA = 0xb91c1c, colorB = 0xf5f0e1): THREE.Group {
  const g = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? `#${colorB.toString(16).padStart(6, '0')}` : `#${colorA.toString(16).padStart(6, '0')}`;
    ctx.fillRect((i * 256) / 8, 0, 256 / 8, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide });
  const top = mesh(new THREE.PlaneGeometry(width, depth), mat, g);
  top.rotation.x = -Math.PI / 2.35;
  top.position.set(0, 0.2, depth / 2);
  // Valance.
  const valance = mesh(new THREE.PlaneGeometry(width, 0.3), mat, g);
  valance.position.set(0, 0.04, depth * 0.94);
  // Support poles.
  for (const x of [-width / 2 + 0.06, width / 2 - 0.06]) {
    mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), ArtMaterials.metal('dark'), g)
      .position.set(x, -1.0, depth);
  }
  return g;
}

/** Roadside vegetable cart with bamboo baskets and produce. */
export function createVegetableCart(): THREE.Group {
  const g = new THREE.Group();
  const wood = ArtMaterials.wood(true, 0x6b4423);
  const cart = mesh(new THREE.BoxGeometry(1.6, 0.1, 0.85), wood, g);
  cart.position.y = 0.55;
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.35, 0.35]) {
      mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), wood, g).position.set(x, 0.28, z);
    }
  }
  // Two large wheels.
  for (const x of [-0.55, 0.55]) {
    const wheel = mesh(new THREE.TorusGeometry(0.32, 0.045, 6, 16), standard(0x1f2937, 0.75, 0.2), g);
    wheel.position.set(x, 0.34, 0.48);
    const spokes = 6;
    for (let s = 0; s < spokes; s++) {
      mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.58, 4), ArtMaterials.metal('dark'), g)
        .position.set(x, 0.34, 0.48);
    }
  }
  // Baskets.
  const basketMat = standard(0xb98a45, 0.95);
  const produceColors = [0xdc2626, 0x16a34a, 0xf59e0b, 0x7c3aed, 0x65a30d];
  for (let b = 0; b < 4; b++) {
    const basket = mesh(
      new THREE.CylinderGeometry(0.19, 0.15, 0.13, 10, 1, true),
      basketMat,
      g,
      { cast: false }
    );
    basket.position.set(-0.55 + b * 0.37, 0.66, -0.12 + (b % 2) * 0.24);
    for (let p = 0; p < 6; p++) {
      const produce = mesh(new THREE.SphereGeometry(0.045, 6, 5), standard(produceColors[(b + p) % produceColors.length], 0.5), g, {
        cast: false,
      });
      produce.position.set(
        basket.position.x + (Math.random() - 0.5) * 0.2,
        0.7 + Math.random() * 0.04,
        basket.position.z + (Math.random() - 0.5) * 0.14
      );
    }
  }
  // Handles.
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.8, 0.6, -0.3),
    new THREE.Vector3(1.2, 0.55, -0.28),
    new THREE.Vector3(1.2, 0.55, 0.28),
    new THREE.Vector3(0.8, 0.6, 0.3),
  ]);
  mesh(new THREE.TubeGeometry(handleCurve, 10, 0.025, 5, false), wood, g);
  return g;
}

/** Street lamp with a warm sodium-vapour cone. */
export function createStreetLamp(height = 5.6): THREE.Group {
  const g = new THREE.Group();
  const metal = ArtMaterials.metal('dark', 0x4b5563);
  mesh(new THREE.CylinderGeometry(0.09, 0.12, height, 10), metal, g).position.y = height / 2;
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, height - 0.1, 0),
    new THREE.Vector3(0.5, height + 0.08, 0),
    new THREE.Vector3(0.95, height + 0.02, 0),
  ]);
  mesh(new THREE.TubeGeometry(armCurve, 10, 0.05, 6, false), metal, g);
  const shade = mesh(new THREE.ConeGeometry(0.22, 0.16, 12, 1, true), metal, g);
  shade.position.set(0.95, height - 0.06, 0);
  const glow = mesh(
    new THREE.SphereGeometry(0.12, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0xfff1c2,
      emissive: 0xffc45b,
      emissiveIntensity: 2.6,
      roughness: 0.2,
    }),
    g,
    { cast: false }
  );
  glow.position.set(0.95, height - 0.14, 0);
  g.name = 'streetLamp';
  return g;
}

/** Concrete debris pile with rusted rebar. */
export function createDebrisPile(): THREE.Group {
  const g = new THREE.Group();
  const concrete = ArtMaterials.concrete(0x5b5b58);
  for (let i = 0; i < 8; i++) {
    const size = 0.18 + Math.random() * 0.34;
    const chunk = mesh(new THREE.BoxGeometry(size, size * 0.6, size * 0.8), concrete, g);
    chunk.position.set((Math.random() - 0.5) * 1.4, size * 0.3, (Math.random() - 0.5) * 1.4);
    chunk.rotation.set(Math.random(), Math.random() * 3, Math.random());
  }
  for (let i = 0; i < 4; i++) {
    const rebar = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7 + Math.random() * 0.4, 5), standard(0x8a4b2a, 0.8, 0.6), g);
    rebar.position.set((Math.random() - 0.5) * 1.2, 0.22, (Math.random() - 0.5) * 1.2);
    rebar.rotation.set(Math.random() * 0.9, Math.random() * 3, Math.random() * 0.9);
  }
  return g;
}

// ============================================================================
// LEVEL 4 / 6 — BIO ARENA
// ============================================================================

/** Glowing incubator pod with a suspended mutant silhouette. */
export function createBioPod(height = 2.3): THREE.Group {
  const g = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.25, 12), ArtMaterials.metal('dark', 0x1f2937), g);
  base.position.y = 0.12;
  const glass = ArtMaterials.glass(0x34d399, 0.32);
  const tank = mesh(new THREE.CylinderGeometry(0.42, 0.5, height, 16, 1, true), glass, g);
  tank.position.y = height / 2 + 0.2;
  const fluidMat = new THREE.MeshStandardMaterial({
    color: 0x065f46,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.32,
    roughness: 0.2,
  });
  const fluid = mesh(new THREE.CylinderGeometry(0.36, 0.42, height - 0.3, 14), fluidMat, g, {
    cast: false,
  });
  fluid.position.y = height / 2 + 0.2;
  // Suspended mutant silhouette.
  const mutant = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x022c22, transparent: true, opacity: 0.7 })
  );
  mutant.position.y = height * 0.62;
  mutant.scale.set(0.8, 1.5, 0.8);
  g.add(mutant);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.6, 5), mutant.material);
    arm.position.set(side * 0.2, height * 0.6, 0);
    arm.rotation.z = side * 0.4;
    g.add(arm);
  }
  const lid = mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.16, 12), ArtMaterials.metal('dark', 0x111827), g);
  lid.position.y = height + 0.2;
  for (let i = 0; i < 3; i++) {
    const band = mesh(new THREE.TorusGeometry(0.46, 0.02, 5, 14), ArtMaterials.metal('chrome'), g, {
      cast: false,
    });
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.5 + i * 0.7;
  }
  const light = new THREE.PointLight(0x10b981, 1.1, 4.5, 2);
  light.position.y = height * 0.55;
  g.add(light);
  return g;
}

/** Collapsed concrete slab / cover block. */
export function createCollapsedSlab(): THREE.Group {
  const g = new THREE.Group();
  const concrete = ArtMaterials.concrete(0x3f4a47);
  const slab = mesh(new THREE.BoxGeometry(2.8, 0.28, 1.6), concrete, g);
  slab.position.y = 0.55;
  slab.rotation.z = 0.16;
  slab.rotation.x = -0.08;
  // Broken edge chunks.
  for (let i = 0; i < 5; i++) {
    const chunk = mesh(new THREE.BoxGeometry(0.35, 0.2, 0.3), concrete, g);
    chunk.position.set(-1.0 + i * 0.5, 0.3 + Math.random() * 0.2, -0.5 + Math.random() * 1.0);
    chunk.rotation.set(Math.random(), Math.random() * 3, Math.random());
  }
  // Rebar.
  for (let i = 0; i < 5; i++) {
    const bar = mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 5), standard(0x7c3f1c, 0.8, 0.5), g);
    bar.position.set(-1.1 + i * 0.55, 0.55, -0.15);
    bar.rotation.set(Math.random() * 0.6, Math.random() * 2, 0.7);
  }
  return g;
}

/** Industrial generator with warning stripes / exhaust. */
export function createIndustrialGenerator(): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(1.3, 0.9, 0.8), standard(0x3f3f46, 0.55, 0.5), g);
  body.position.y = 0.46;
  for (let i = 0; i < 3; i++) {
    mesh(new THREE.BoxGeometry(0.36, 0.05, 0.82), basic(0xfacc15), g, { cast: false })
      .position.set(-0.35 + i * 0.35, 0.86, 0);
  }
  const exhaust = mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.7, 8), ArtMaterials.metal('dark'), g);
  exhaust.position.set(0.45, 1.2, -0.2);
  const grille = mesh(new THREE.BoxGeometry(0.5, 0.35, 0.03), standard(0x111827, 0.8), g);
  grille.position.set(-0.3, 0.4, 0.41);
  const light = new THREE.PointLight(0xf59e0b, 0.8, 3, 2);
  light.position.set(0.42, 0.95, 0.2);
  g.add(light);
  return g;
}

/** Wall-mounted biohazard warning board for the final arena. */
export function createBiohazardBoard(): THREE.Group {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 160);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, 244, 148);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BIOHAZARD', 128, 38);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(128, 88, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(128, 88, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('BANGLADESH ARMY', 128, 132);
  ctx.fillText('LEVEL 4 — RESTRICTED', 128, 150);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.5),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.2 })
  );
  g.add(board);
  return g;
}

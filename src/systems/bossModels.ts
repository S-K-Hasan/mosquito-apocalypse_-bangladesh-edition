import * as THREE from 'three';
import { ART_COLORS, ArtMaterials } from './artSystem';

/**
 * Unique, hand-built boss models.
 *
 * These are deliberately NOT scaled copies of the regular mosquito. Each boss
 * has its own silhouette, proportions, material response and named animation
 * nodes so GameCanvas can drive wing flaps, abdomen breathing, leg sway and
 * glowing weak points.
 */

function makeWing(opts: {
  color: number;
  opacity: number;
  length: number;
  width: number;
  veins?: number;
}): THREE.Group {
  const { color, opacity, length, width, veins = 5 } = opts;
  const group = new THREE.Group();

  // Membrane: a curved, leaf-shaped wing rather than a flat triangle.
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.85, length * 0.18, width * 0.95, length * 0.62, width * 0.42, length);
  shape.bezierCurveTo(width * 0.12, length * 0.84, -width * 0.08, length * 0.42, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 18);
  geo.rotateX(Math.PI / 2);

  const membrane = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.1,
      metalness: 0.08,
      transmission: 0.48,
      thickness: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      emissive: new THREE.Color(color).multiplyScalar(0.12),
    })
  );
  membrane.castShadow = false;
  group.add(membrane);

  // Structural veins give the wing readable detail against dark skies.
  const veinMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(0.55),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  for (let v = 0; v < veins; v++) {
    const t = (v + 1) / (veins + 1);
    const points = [
      new THREE.Vector3(0, 0.002, 0),
      new THREE.Vector3(width * 0.36 * t, 0.003, length * 0.28),
      new THREE.Vector3(width * 0.52 * t, 0.003, length * 0.62),
      new THREE.Vector3(width * 0.4 * t, 0.002, length * 0.92),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const vein = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.006, 4, false), veinMat);
    group.add(vein);
  }
  // Thick leading edge.
  const edgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.004, 0),
    new THREE.Vector3(width * 0.7, 0.004, length * 0.25),
    new THREE.Vector3(width * 0.6, 0.004, length * 0.75),
    new THREE.Vector3(width * 0.42, 0.003, length),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(edgeCurve, 16, 0.012, 5, false), veinMat));

  return group;
}

function addLeg(
  parent: THREE.Group,
  side: number,
  index: number,
  chitin: THREE.Material,
  tip: THREE.Material,
  scale = 1
): THREE.Group {
  const hip = new THREE.Group();
  hip.position.set(side * 0.16 * scale, -0.05 * scale, (index - 1) * 0.22 * scale);

  const femur = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028 * scale, 0.022 * scale, 0.42 * scale, 7),
    chitin
  );
  femur.rotation.z = side * 1.02;
  femur.rotation.x = (index - 1) * 0.22;
  femur.position.set(side * 0.16 * scale, -0.08 * scale, 0);
  hip.add(femur);

  const knee = new THREE.Group();
  knee.position.set(side * 0.34 * scale, -0.18 * scale, (index - 1) * 0.025 * scale);
  const tibia = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018 * scale, 0.009 * scale, 0.52 * scale, 6),
    chitin
  );
  tibia.rotation.z = side * -0.58;
  tibia.position.set(side * 0.13 * scale, -0.23 * scale, 0);
  knee.add(tibia);

  // Spiny ridge on the tibia.
  for (let s = 0; s < 3; s++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.013 * scale, 0.11 * scale, 4),
      tip
    );
    spike.position.set(side * (0.10 + s * 0.018) * scale, (-0.12 - s * 0.09) * scale, 0);
    spike.rotation.z = side * -1.0;
    knee.add(spike);
  }

  const tarsus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008 * scale, 0.003 * scale, 0.28 * scale, 5),
    chitin
  );
  tarsus.rotation.x = -Math.PI / 2.2;
  tarsus.rotation.z = side * 0.12;
  tarsus.position.set(side * 0.12 * scale, -0.48 * scale, 0.1 * scale);
  knee.add(tarsus);

  const claw = new THREE.Mesh(new THREE.ConeGeometry(0.013 * scale, 0.12 * scale, 4), tip);
  claw.position.set(side * 0.11 * scale, -0.5 * scale, 0.24 * scale);
  claw.rotation.x = -1.1;
  knee.add(claw);

  hip.add(knee);
  parent.add(hip);
  return hip;
}

/**
 * DENGUE KING — bulky, crowned, armored Aedes tyrant.
 * Distinct proportions: massive segmented abdomen, high royal thorax,
 * four wings, six spined legs, horned crown, glowing venom sacs.
 */
export function createDengueKingModel(): THREE.Group {
  const boss = new THREE.Group();
  boss.name = 'dengueKingRoot';

  const scale = 1.35;
  const chitin = new THREE.MeshPhysicalMaterial({
    color: 0x2a0d12,
    roughness: 0.25,
    metalness: 0.38,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xcf3a46),
    sheenRoughness: 0.25,
  });
  const plate = new THREE.MeshPhysicalMaterial({
    color: 0x3f1119,
    roughness: 0.2,
    metalness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: new THREE.Color(0x2a0508),
    emissiveIntensity: 0.4,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd4a72c,
    roughness: 0.22,
    metalness: 0.95,
  });
  const cream = new THREE.MeshStandardMaterial({ color: 0xe9dcc0, roughness: 0.45 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1a2b });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4055 });
  const veinMat = new THREE.MeshStandardMaterial({
    color: 0x5b0b16,
    emissive: 0x8b1020,
    emissiveIntensity: 0.8,
    roughness: 0.4,
  });

  // ---- Thorax: tall, layered royal carapace ------------------------------
  const thorax = new THREE.Group();
  thorax.name = 'bossThorax';
  thorax.position.set(0, 0.08 * scale, 0);
  boss.add(thorax);

  const thoraxBody = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 16, 12), chitin);
  thoraxBody.scale.set(1.05, 1.15, 1.35);
  thorax.add(thoraxBody);

  for (let i = 0; i < 3; i++) {
    const armor = new THREE.Mesh(
      new THREE.SphereGeometry((0.23 - i * 0.025) * scale, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42),
      plate
    );
    armor.scale.set(1.05, 0.6, 1.2);
    armor.position.set(0, (0.06 + i * 0.045) * scale, (0.02 - i * 0.03) * scale);
    thorax.add(armor);
  }

  // Gold collar / gorget.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22 * scale, 0.025 * scale, 8, 22), gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.16 * scale, -0.1 * scale);
  thorax.add(collar);

  for (let s = -2; s <= 2; s++) {
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 6, 6), gold);
    rivet.position.set(s * 0.075 * scale, 0.17 * scale, -0.24 * scale + Math.abs(s) * 0.016);
    thorax.add(rivet);
  }

  // Dorsal spikes / royal crest.
  for (let sp = 0; sp < 4; sp++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry((0.03 - sp * 0.004) * scale, (0.17 - sp * 0.02) * scale, 5),
      gold
    );
    spike.position.set(0, (0.2 + sp * 0.005) * scale, (-0.08 + sp * 0.1) * scale);
    spike.rotation.x = 0.28 + sp * 0.08;
    thorax.add(spike);
  }

  // ---- Head: crown, mandibles, eyes, stinger ------------------------------
  const head = new THREE.Group();
  head.name = 'bossHead';
  head.position.set(0, 0.09 * scale, -0.31 * scale);
  thorax.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15 * scale, 14, 12), plate);
  skull.scale.set(1, 0.9, 1.1);
  head.add(skull);

  // Crown: band + five gold spikes + ruby gems.
  const crownBand = new THREE.Mesh(new THREE.TorusGeometry(0.135 * scale, 0.025 * scale, 8, 20), gold);
  crownBand.rotation.x = Math.PI / 2;
  crownBand.position.y = 0.13 * scale;
  head.add(crownBand);
  for (let c = -2; c <= 2; c++) {
    const crownSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.026 * scale, (0.24 - Math.abs(c) * 0.035) * scale, 5),
      gold
    );
    crownSpike.position.set(c * 0.052 * scale, (0.25 - Math.abs(c) * 0.018) * scale, 0.01 * scale);
    crownSpike.rotation.z = c * -0.13;
    head.add(crownSpike);

    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.022 * scale, 0), glowMat);
    gem.position.set(c * 0.052 * scale, (0.17 - Math.abs(c) * 0.01) * scale, -0.11 * scale);
    head.add(gem);
  }

  // Compound eyes with faceted iris and specular glints.
  for (const side of [-1, 1]) {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.075 * scale, 12, 10), chitin);
    socket.position.set(side * 0.09 * scale, 0.035 * scale, -0.09 * scale);
    head.add(socket);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.062 * scale, 14, 12), eyeMat);
    eye.position.set(side * 0.105 * scale, 0.04 * scale, -0.125 * scale);
    head.add(eye);
    // Facet glints.
    for (let g = 0; g < 3; g++) {
      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.009 * scale, 5, 5),
        new THREE.MeshBasicMaterial({ color: 0xffd0d4 })
      );
      glint.position.set(
        side * (0.11 + g * 0.006) * scale,
        (0.055 + g * 0.012) * scale,
        (-0.17 - g * 0.005) * scale
      );
      head.add(glint);
    }
    // Angry brow.
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.11 * scale, 0.022 * scale, 0.035 * scale), chitin);
    brow.position.set(side * 0.09 * scale, 0.105 * scale, -0.12 * scale);
    brow.rotation.z = side * -0.38;
    head.add(brow);
  }

  // Mandibles.
  for (const side of [-1, 1]) {
    const mandible = new THREE.Mesh(new THREE.ConeGeometry(0.02 * scale, 0.2 * scale, 5), gold);
    mandible.position.set(side * 0.07 * scale, -0.08 * scale, -0.16 * scale);
    mandible.rotation.x = -0.45;
    mandible.rotation.z = side * 0.32;
    head.add(mandible);
  }

  // Segmented proboscis with dripping venom sac.
  const proboscis = new THREE.Group();
  proboscis.name = 'bossProboscis';
  proboscis.position.set(0, -0.09 * scale, -0.18 * scale);
  proboscis.rotation.x = 0.35;
  head.add(proboscis);

  for (let p = 0; p < 3; p++) {
    const segment = new THREE.Mesh(
      new THREE.CylinderGeometry((0.022 - p * 0.004) * scale, (0.026 - p * 0.004) * scale, 0.13 * scale, 7),
      p === 0 ? chitin : plate
    );
    segment.rotation.x = Math.PI / 2;
    segment.position.z = -p * 0.11 * scale;
    proboscis.add(segment);
  }
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.014 * scale, 0.22 * scale, 6), gold);
  needle.rotation.x = -Math.PI / 2;
  needle.position.z = -0.42 * scale;
  proboscis.add(needle);

  const venomDrop = new THREE.Mesh(new THREE.SphereGeometry(0.028 * scale, 10, 8), glowMat);
  venomDrop.name = 'venomDrop';
  venomDrop.position.set(0, 0.02 * scale, -0.43 * scale);
  venomDrop.userData.baseY = venomDrop.position.y;
  proboscis.add(venomDrop);

  // ---- Abdomen: huge, segmented, breathing royal egg-sac -------------------
  const abdomenGroup = new THREE.Group();
  abdomenGroup.name = 'abdomen';
  abdomenGroup.position.set(0, -0.02 * scale, 0.42 * scale);
  boss.add(abdomenGroup);

  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 16, 14), plate);
  abdomen.scale.set(1.05, 0.95, 1.85);
  abdomenGroup.add(abdomen);

  // Alternating Aedes-like cream bands.
  for (let s = 0; s < 5; s++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry((0.12 + s * 0.012) * scale, (0.022 - s * 0.002) * scale, 6, 18),
      s % 2 === 0 ? cream : veinMat
    );
    band.position.z = (-0.25 + s * 0.14) * scale;
    band.scale.set(1.05, 0.95, 1);
    abdomenGroup.add(band);
  }

  // Glowing venom sacs along the dorsal abdomen.
  for (let v = 0; v < 4; v++) {
    const sac = new THREE.Mesh(new THREE.SphereGeometry((0.035 - v * 0.004) * scale, 8, 8), glowMat);
    sac.position.set(0, (0.24 - v * 0.01) * scale, (-0.18 + v * 0.15) * scale);
    if (v === 0) sac.name = 'bossWeakPoint';
    abdomenGroup.add(sac);
  }

  // Tail spike.
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.04 * scale, 0.3 * scale, 6), gold);
  tail.rotation.x = Math.PI / 2;
  tail.position.z = 0.56 * scale;
  abdomenGroup.add(tail);

  // ---- Four wings --------------------------------------------------------
  const wingRoot = new THREE.Group();
  wingRoot.position.set(0, 0.17 * scale, 0.02 * scale);
  boss.add(wingRoot);

  const leftWing = new THREE.Group();
  leftWing.name = 'leftWing';
  leftWing.add(makeWing({ color: 0xff7b86, opacity: 0.62, length: 0.9 * scale, width: 0.46 * scale, veins: 6 }));
  leftWing.rotation.y = -0.45;
  wingRoot.add(leftWing);

  const rightWing = new THREE.Group();
  rightWing.name = 'rightWing';
  const rightWingMesh = makeWing({ color: 0xff7b86, opacity: 0.62, length: 0.9 * scale, width: 0.46 * scale, veins: 6 });
  rightWingMesh.scale.x = -1;
  rightWing.add(rightWingMesh);
  rightWing.rotation.y = 0.45;
  wingRoot.add(rightWing);

  const leftRearWing = new THREE.Group();
  leftRearWing.name = 'leftRearWing';
  const lrw = makeWing({ color: 0xd85a68, opacity: 0.5, length: 0.62 * scale, width: 0.36 * scale, veins: 4 });
  lrw.position.z = 0.1 * scale;
  leftRearWing.add(lrw);
  leftRearWing.rotation.y = -0.7;
  wingRoot.add(leftRearWing);

  const rightRearWing = new THREE.Group();
  rightRearWing.name = 'rightRearWing';
  const rrw = makeWing({ color: 0xd85a68, opacity: 0.5, length: 0.62 * scale, width: 0.36 * scale, veins: 4 });
  rrw.position.z = 0.1 * scale;
  rrw.scale.x = -1;
  rightRearWing.add(rrw);
  rightRearWing.rotation.y = 0.7;
  wingRoot.add(rightRearWing);

  // ---- Six spined legs ---------------------------------------------------
  const leftLegs = new THREE.Group();
  leftLegs.name = 'leftLegs';
  const rightLegs = new THREE.Group();
  rightLegs.name = 'rightLegs';
  for (let i = 0; i < 3; i++) {
    addLeg(leftLegs, -1, i, chitin, gold, scale);
    addLeg(rightLegs, 1, i, chitin, gold, scale);
  }
  boss.add(leftLegs, rightLegs);

  // Foreleg scythes.
  for (const side of [-1, 1]) {
    const scythe = new THREE.Mesh(new THREE.ConeGeometry(0.035 * scale, 0.54 * scale, 5), gold);
    scythe.position.set(side * 0.44 * scale, -0.18 * scale, -0.18 * scale);
    scythe.rotation.z = side * 0.55;
    scythe.rotation.x = -0.55;
    boss.add(scythe);
  }

  // ---- Aura, rim light and ground shadow ---------------------------------
  const aura = new THREE.PointLight(0xff3344, 1.9, 6.5, 1.6);
  aura.name = 'bossAuraLight';
  aura.position.set(0, 0.05 * scale, 0);
  boss.add(aura);

  const underGlow = new THREE.PointLight(0x8b1020, 1.2, 3.2, 2);
  underGlow.position.set(0, -0.45 * scale, 0.1 * scale);
  boss.add(underGlow);

  boss.userData.isUniqueBoss = true;
  boss.userData.bossKind = 'dengue_king';
  return boss;
}

/**
 * THE INVISIBLE APEX — a translucent, exposed-organ horror with extra
 * scythe limbs, a split jaw and a pulsing bio-reactor core.
 */
export function createInvisibleApexModel(): THREE.Group {
  const boss = new THREE.Group();
  boss.name = 'invisibleApexRoot';
  const scale = 1.45;

  const shell = new THREE.MeshPhysicalMaterial({
    color: 0x3ef0b0,
    transparent: true,
    opacity: 0.24,
    roughness: 0.06,
    metalness: 0.1,
    transmission: 0.7,
    thickness: 0.4,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const organ = new THREE.MeshStandardMaterial({
    color: 0x0d7a56,
    emissive: 0x10b981,
    emissiveIntensity: 1.4,
    roughness: 0.25,
  });
  const vein = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.8 });
  const darkShell = new THREE.MeshPhysicalMaterial({
    color: 0x0b3b2c,
    roughness: 0.18,
    metalness: 0.55,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
  });

  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.3 * scale, 16, 14), shell);
  thorax.scale.set(1, 1.1, 1.5);
  boss.add(thorax);

  // Visible internal organs.
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 12, 10), organ);
  heart.position.set(0, 0.02 * scale, 0.02 * scale);
  boss.add(heart);
  const lung1 = new THREE.Mesh(new THREE.SphereGeometry(0.075 * scale, 10, 8), organ);
  lung1.position.set(-0.13 * scale, 0.02 * scale, 0.1 * scale);
  boss.add(lung1);
  const lung2 = lung1.clone();
  lung2.position.x = 0.13 * scale;
  boss.add(lung2);

  // Exposed rib arcs.
  for (let r = 0; r < 4; r++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry((0.25 - r * 0.02) * scale, 0.01 * scale, 5, 16, Math.PI), vein);
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = Math.PI / 2;
    rib.position.set(0, (-0.08 + r * 0.05) * scale, (0.03 - r * 0.02) * scale);
    boss.add(rib);
  }

  // Armored dorsal carapace plates.
  for (let i = 0; i < 3; i++) {
    const plate = new THREE.Mesh(new THREE.SphereGeometry((0.27 - i * 0.03) * scale, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.38), darkShell);
    plate.position.set(0, (0.09 + i * 0.04) * scale, (0.02 - i * 0.04) * scale);
    boss.add(plate);
  }

  // Head with split mandibles and many eyes.
  const head = new THREE.Group();
  head.position.set(0, 0.06 * scale, -0.36 * scale);
  boss.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.17 * scale, 14, 12), shell);
  skull.scale.set(1, 0.85, 1.2);
  head.add(skull);
  for (const side of [-1, 1]) {
    const mandible = new THREE.Mesh(new THREE.ConeGeometry(0.03 * scale, 0.3 * scale, 5), darkShell);
    mandible.position.set(side * 0.09 * scale, -0.07 * scale, -0.12 * scale);
    mandible.rotation.x = -0.55;
    mandible.rotation.z = side * 0.5;
    head.add(mandible);
  }
  for (let e = 0; e < 5; e++) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025 * scale, 8, 8), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 }));
    eye.position.set((e - 2) * 0.045 * scale, 0.04 * scale + Math.abs(e - 2) * 0.01, -0.14 * scale);
    head.add(eye);
  }

  // Proboscis with glowing tip.
  const prob = new THREE.Mesh(new THREE.ConeGeometry(0.018 * scale, 0.44 * scale, 6), darkShell);
  prob.rotation.x = -Math.PI / 2.3;
  prob.position.set(0, -0.08 * scale, -0.3 * scale);
  head.add(prob);
  const probTip = new THREE.Mesh(new THREE.SphereGeometry(0.026 * scale, 8, 8), organ);
  probTip.position.set(0, -0.13 * scale, -0.5 * scale);
  head.add(probTip);

  // Abdomen with glowing bio-reactor core.
  const abdomen = new THREE.Group();
  abdomen.name = 'abdomen';
  abdomen.position.set(0, -0.02 * scale, 0.5 * scale);
  boss.add(abdomen);
  const abdo = new THREE.Mesh(new THREE.SphereGeometry(0.27 * scale, 16, 12), shell);
  abdo.scale.set(1, 0.9, 1.75);
  abdomen.add(abdo);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11 * scale, 1), organ);
  core.name = 'invisibleBioCore';
  core.position.set(0, 0.02 * scale, 0.02 * scale);
  abdomen.add(core);
  for (let k = 0; k < 5; k++) {
    const band = new THREE.Mesh(new THREE.TorusGeometry((0.1 + k * 0.012) * scale, 0.008 * scale, 5, 16), vein);
    band.position.z = (-0.25 + k * 0.13) * scale;
    abdomen.add(band);
  }

  // Four translucent wings.
  const wingRoot = new THREE.Group();
  wingRoot.position.set(0, 0.18 * scale, 0.02 * scale);
  boss.add(wingRoot);
  const addPair = (name: string, len: number, wid: number, z: number, yaw: number, back = false) => {
    const l = new THREE.Group();
    l.name = name;
    const wl = makeWing({ color: 0x9fffe0, opacity: 0.36, length: len * scale, width: wid * scale, veins: 5 });
    wl.position.z = z * scale;
    l.add(wl);
    l.rotation.y = -yaw;
    wingRoot.add(l);
    const r = new THREE.Group();
    r.name = name.replace('left', 'right');
    const wr = makeWing({ color: 0x9fffe0, opacity: 0.36, length: len * scale, width: wid * scale, veins: 5 });
    wr.position.z = z * scale;
    wr.scale.x = -1;
    r.add(wr);
    r.rotation.y = yaw;
    wingRoot.add(r);
    return back;
  };
  addPair('leftWing', 0.95, 0.46, 0, 0.42);
  addPair('leftRearWing', 0.65, 0.34, 0.14, 0.72);

  // Eight legs (two extra scythe limbs).
  const leftLegs = new THREE.Group();
  leftLegs.name = 'leftLegs';
  const rightLegs = new THREE.Group();
  rightLegs.name = 'rightLegs';
  for (const side of [-1, 1]) {
    const target = side < 0 ? leftLegs : rightLegs;
    for (let i = 0; i < 3; i++) addLeg(target, side, i, darkShell, organ, scale);
    const scythe = new THREE.Mesh(new THREE.ConeGeometry(0.03 * scale, 0.62 * scale, 5), organ);
    scythe.position.set(side * 0.42 * scale, -0.16 * scale, -0.2 * scale);
    scythe.rotation.z = side * 0.58;
    scythe.rotation.x = -0.6;
    target.add(scythe);
  }
  boss.add(leftLegs, rightLegs);

  const aura = new THREE.PointLight(0x10b981, 2.4, 8.5, 1.6);
  aura.name = 'bossAuraLight';
  boss.add(aura);

  boss.userData.isUniqueBoss = true;
  boss.userData.bossKind = 'invisible_apex';
  return boss;
}

/** Scalloped bat-wing silhouette used by the Midnight Mosquito. */
function makeBatWing(opts: {
  color: number;
  opacity: number;
  length: number;
  width: number;
  scallops?: number;
}): THREE.Group {
  const { color, opacity, length, width, scallops = 4 } = opts;
  const group = new THREE.Group();

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.55, length * 0.1, width, length * 0.42, width * 0.86, length * 0.78);
  // Scalloped trailing edge, like a bat or a torn cloak.
  for (let s = 1; s <= scallops; s++) {
    const t = s / scallops;
    const x = width * 0.86 * (1 - t);
    const y = length * (0.78 - t * 0.78);
    const dip = length * 0.08;
    shape.quadraticCurveTo(x + width * 0.08, y + dip, x, y);
  }
  shape.quadraticCurveTo(width * 0.2, length * 0.12, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 20);
  geo.rotateX(Math.PI / 2);
  const membrane = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.12,
      metalness: 0.2,
      transmission: 0.3,
      thickness: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
      clearcoat: 0.8,
      emissive: new THREE.Color(color).multiplyScalar(0.14),
    })
  );
  group.add(membrane);

  // Thumb claw at the wing wrist.
  const claw = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.03, length * 0.2, 5),
    new THREE.MeshStandardMaterial({ color: 0xc4b5fd, metalness: 0.7, roughness: 0.3 })
  );
  claw.position.set(width * 0.5, 0.01, length * 0.35);
  claw.rotation.x = -0.7;
  group.add(claw);

  // Sparse black finger struts.
  const strutMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(0.3),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  for (let f = 0; f < 4; f++) {
    const t = (f + 1) / 5;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.004, 0),
      new THREE.Vector3(width * 0.5 * t, 0.004, length * 0.3),
      new THREE.Vector3(width * 0.78 * t, 0.004, length * 0.66),
      new THREE.Vector3(width * 0.7 * t, 0.004, length * 0.9),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.008, 4, false), strutMat));
  }

  return group;
}

/**
 * MIDNIGHT MOSQUITO — a gaunt, aristocratic vampire-insect that haunts the
 * Level 5 street. Tall collar, torn cloak wings, silver rapier proboscis and a
 * cold violet aura. Deliberately taller and leaner than the Dengue King.
 */
export function createMidnightMosquitoModel(): THREE.Group {
  const boss = new THREE.Group();
  boss.name = 'midnightMosquitoRoot';
  const scale = 1.2;

  const chitin = new THREE.MeshPhysicalMaterial({
    color: 0x1a1230,
    roughness: 0.22,
    metalness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    sheen: 0.7,
    sheenColor: new THREE.Color(0x8b5cf6),
    sheenRoughness: 0.3,
  });
  const cloak = new THREE.MeshPhysicalMaterial({
    color: 0x2e1a52,
    roughness: 0.55,
    metalness: 0.15,
    sheen: 0.9,
    sheenColor: new THREE.Color(0xa78bfa),
    side: THREE.DoubleSide,
  });
  const silver = new THREE.MeshStandardMaterial({ color: 0xddd6fe, roughness: 0.18, metalness: 0.9 });
  const crimson = new THREE.MeshBasicMaterial({ color: 0xff2d55 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
  const vein = new THREE.MeshStandardMaterial({
    color: 0x4c1d95,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.9,
    roughness: 0.35,
  });

  // ---- Tall thorax with flared vampire collar ----------------------------
  const thorax = new THREE.Group();
  thorax.name = 'bossThorax';
  thorax.position.set(0, 0.1 * scale, 0);
  boss.add(thorax);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 14, 12), chitin);
  chest.scale.set(0.92, 1.3, 1.15);
  thorax.add(chest);

  for (const side of [-1, 1]) {
    const collarPanel = new THREE.Mesh(new THREE.BoxGeometry(0.34 * scale, 0.5 * scale, 0.035 * scale), cloak);
    collarPanel.position.set(side * 0.16 * scale, 0.2 * scale, -0.02 * scale);
    collarPanel.rotation.z = side * 0.55;
    collarPanel.rotation.y = side * -0.25;
    thorax.add(collarPanel);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.34 * scale, 0.035 * scale, 0.04 * scale), silver);
    trim.position.set(side * 0.205 * scale, 0.38 * scale, -0.02 * scale);
    trim.rotation.z = side * 0.55;
    thorax.add(trim);
  }

  // Coat buttons.
  for (let b = 0; b < 3; b++) {
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 7, 7), silver);
    button.position.set(0, (-0.04 + b * 0.09) * scale, -0.2 * scale);
    thorax.add(button);
  }

  // ---- Head: narrow skull, fangs, six eyes, rapier proboscis -------------
  const head = new THREE.Group();
  head.name = 'bossHead';
  head.position.set(0, 0.14 * scale, -0.28 * scale);
  thorax.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 14, 12), chitin);
  skull.scale.set(0.9, 1.05, 1.2);
  head.add(skull);

  // Swept-back horn ears.
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035 * scale, 0.3 * scale, 5), chitin);
    ear.position.set(side * 0.09 * scale, 0.16 * scale, 0.03 * scale);
    ear.rotation.z = side * 0.38;
    ear.rotation.x = -0.35;
    head.add(ear);
  }

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045 * scale, 12, 10), crimson);
    eye.position.set(side * 0.07 * scale, 0.035 * scale, -0.1 * scale);
    head.add(eye);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.012 * scale, 0.055 * scale, 0.01 * scale), silver);
    slit.position.set(side * 0.07 * scale, 0.038 * scale, -0.142 * scale);
    head.add(slit);
    // Smaller secondary eyes above.
    const small1 = new THREE.Mesh(new THREE.SphereGeometry(0.014 * scale, 6, 6), glow);
    small1.position.set(side * 0.11 * scale, 0.075 * scale, -0.08 * scale);
    head.add(small1);
    const small2 = new THREE.Mesh(new THREE.SphereGeometry(0.011 * scale, 6, 6), glow);
    small2.position.set(side * 0.13 * scale, 0.045 * scale, -0.06 * scale);
    head.add(small2);
  }

  // Two long downward fangs.
  for (const side of [-1, 1]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.018 * scale, 0.26 * scale, 5), silver);
    fang.position.set(side * 0.055 * scale, -0.1 * scale, -0.1 * scale);
    fang.rotation.x = Math.PI - 0.18;
    fang.rotation.z = side * 0.12;
    head.add(fang);
  }

  // Rapier-like proboscis.
  const proboscis = new THREE.Group();
  proboscis.name = 'bossProboscis';
  proboscis.position.set(0, -0.06 * scale, -0.14 * scale);
  proboscis.rotation.x = 0.22;
  head.add(proboscis);
  const rapier = new THREE.Mesh(new THREE.CylinderGeometry(0.009 * scale, 0.02 * scale, 0.72 * scale, 6), silver);
  rapier.rotation.x = Math.PI / 2;
  rapier.position.z = -0.34 * scale;
  proboscis.add(rapier);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.055 * scale, 0.012 * scale, 6, 14), silver);
  guard.position.z = -0.06 * scale;
  proboscis.add(guard);
  const venomDrop = new THREE.Mesh(new THREE.SphereGeometry(0.022 * scale, 8, 8), crimson);
  venomDrop.name = 'venomDrop';
  venomDrop.position.set(0, 0, -0.7 * scale);
  venomDrop.userData.baseY = 0;
  proboscis.add(venomDrop);

  // ---- Abdomen: narrow, banded, tipped with a violet lantern ------------
  const abdomenGroup = new THREE.Group();
  abdomenGroup.name = 'abdomen';
  abdomenGroup.position.set(0, -0.02 * scale, 0.36 * scale);
  boss.add(abdomenGroup);

  const abdo = new THREE.Mesh(new THREE.SphereGeometry(0.19 * scale, 14, 12), chitin);
  abdo.scale.set(0.9, 0.85, 2.1);
  abdomenGroup.add(abdo);

  for (let b = 0; b < 5; b++) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry((0.075 + b * 0.008) * scale, 0.008 * scale, 5, 16),
      b % 2 === 0 ? vein : silver
    );
    band.position.z = (-0.18 + b * 0.1) * scale;
    band.scale.set(0.9, 0.85, 1);
    abdomenGroup.add(band);
  }

  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.055 * scale, 10, 8), glow);
  lantern.position.z = 0.4 * scale;
  lantern.name = 'midnightLantern';
  abdomenGroup.add(lantern);

  // ---- Torn cloak wings -------------------------------------------------
  const wingRoot = new THREE.Group();
  wingRoot.position.set(0, 0.2 * scale, 0.02 * scale);
  boss.add(wingRoot);

  const leftWing = new THREE.Group();
  leftWing.name = 'leftWing';
  leftWing.add(makeBatWing({ color: 0x4c2a7a, opacity: 0.7, length: 1.05 * scale, width: 0.5 * scale }));
  leftWing.rotation.y = -0.38;
  wingRoot.add(leftWing);

  const rightWing = new THREE.Group();
  rightWing.name = 'rightWing';
  const rw = makeBatWing({ color: 0x4c2a7a, opacity: 0.7, length: 1.05 * scale, width: 0.5 * scale });
  rw.scale.x = -1;
  rightWing.add(rw);
  rightWing.rotation.y = 0.38;
  wingRoot.add(rightWing);

  const leftRearWing = new THREE.Group();
  leftRearWing.name = 'leftRearWing';
  const lrw = makeBatWing({ color: 0x3b1f63, opacity: 0.55, length: 0.72 * scale, width: 0.4 * scale });
  lrw.position.z = 0.14 * scale;
  leftRearWing.add(lrw);
  leftRearWing.rotation.y = -0.66;
  wingRoot.add(leftRearWing);

  const rightRearWing = new THREE.Group();
  rightRearWing.name = 'rightRearWing';
  const rrw = makeBatWing({ color: 0x3b1f63, opacity: 0.55, length: 0.72 * scale, width: 0.4 * scale });
  rrw.position.z = 0.14 * scale;
  rrw.scale.x = -1;
  rightRearWing.add(rrw);
  rightRearWing.rotation.y = 0.66;
  wingRoot.add(rightRearWing);

  // ---- Six slender legs -------------------------------------------------
  const leftLegs = new THREE.Group();
  leftLegs.name = 'leftLegs';
  const rightLegs = new THREE.Group();
  rightLegs.name = 'rightLegs';
  for (let i = 0; i < 3; i++) {
    addLeg(leftLegs, -1, i, chitin, silver, scale * 0.88);
    addLeg(rightLegs, 1, i, chitin, silver, scale * 0.88);
  }
  boss.add(leftLegs, rightLegs);

  const aura = new THREE.PointLight(0x8b5cf6, 2.1, 8, 1.7);
  aura.name = 'bossAuraLight';
  aura.position.set(0, 0.05 * scale, 0);
  boss.add(aura);

  const capeGlow = new THREE.PointLight(0xc084fc, 0.9, 4, 2);
  capeGlow.position.set(0, 0.3 * scale, 0.4 * scale);
  boss.add(capeGlow);

  boss.userData.isUniqueBoss = true;
  boss.userData.bossKind = 'midnight_mosquito';
  return boss;
}

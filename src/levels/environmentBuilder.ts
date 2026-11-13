import * as THREE from 'three';
import {
  createBedWithMoshari,
  createCeilingFan,
  createPlasticChair,
  createOldFridge,
  createFuseBox,
  createWaterTank,
  createClothesline,
  createRickshaw,
  createTeaStall,
  createCalendarTexture,
  createFloorTilesTexture,
  createWallTexture,
  createAlmirah,
  createBedsideTable,
  createWindowWithCurtains,
  createWallClock,
  createFramedArt,
  createSlippers,
  createStudyTable,
  createDeskChair,
  createSwitchboard,
  createRoomBucket,
  createClothesHanger,
  createGiantMosquitoShadow,
  createRooftopPlantPots,
  createSatelliteDish,
  createYagiAntenna,
  createStaircaseShed,
  createWaterPipes,
  createDhakaCitySkyline,
  createGiantMosquitoHive,
  createOldDhakaColonialArch,
  createElectricPoleWithTransformer,
  createDhakaStreetBuilding,
  createParkedMotorcycle,
  createDhakaDustbin,
  createRoadDrainGutter,
  createStreetWallPosters,
  createFinalBioHiveArena,
} from '../systems/models';
import { SearchableContainer } from '../types/game';
import { ART_COLORS, ArtMaterials } from '../systems/artSystem';

export interface BuiltLevel {
  environmentGroup: THREE.Group;
  colliders: THREE.Box3[];
  searchables: SearchableContainer[];
  ceilingFanBladeGroup?: THREE.Group;
  fuseBoxMesh?: THREE.Group;
  giantMosquitoShadowMesh?: THREE.Mesh;
  spawnPoints: [number, number, number][];
  playerStart: [number, number, number];
}

function createDangerSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Yellow caution background
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 256, 128);

  // Top and bottom black hazard diagonals
  ctx.fillStyle = '#0f172a';
  for (let i = -128; i < 300; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 14, 0);
    ctx.lineTo(i + 2, 16);
    ctx.lineTo(i - 12, 16);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(i, 112);
    ctx.lineTo(i + 14, 112);
    ctx.lineTo(i + 2, 128);
    ctx.lineTo(i - 12, 128);
    ctx.fill();
  }

  // Red warning banner
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(16, 22, 224, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('সাবধান! বিপদজনক', 128, 43);

  // English hazard subtext
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('HIGH VOLTAGE 440V', 128, 78);
  ctx.font = '12px sans-serif';
  ctx.fillText('MAIN BREAKER PANEL', 128, 100);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildLevelEnvironment(levelId: number): BuiltLevel {
  const group = new THREE.Group();
  const colliders: THREE.Box3[] = [];
  const searchables: SearchableContainer[] = [];
  let ceilingFanBladeGroup: THREE.Group | undefined;
  let fuseBoxMesh: THREE.Group | undefined;
  let giantMosquitoShadowMesh: THREE.Mesh | undefined;
  const spawnPoints: [number, number, number][] = [];
  let playerStart: [number, number, number] = [0, 1.2, 0];

  const helperBox = (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) => {
    colliders.push(new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ)));
  };

  switch (levelId) {
    case 1: {
      // LEVEL 1: BEDROOM NIGHTMARE (Authentic Dhaka Residential Flat)
      playerStart = [0, 1.2, 1.5];

      // 1. Ceramic Tiled Floor (Off-white/beige ceramic tiles with marble veins and dark grout lines)
      const floorGeo = new THREE.PlaneGeometry(12, 12);
      const floorMat = new THREE.MeshStandardMaterial({
        map: createFloorTilesTexture(),
        roughness: 0.35,
        metalness: 0.05,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      group.add(floor);

      // Bedside decorative runner rug
      const rugGeo = new THREE.PlaneGeometry(4.2, 2.6);
      const rugMat = ArtMaterials.fabric(0x881337);
      const rug = new THREE.Mesh(rugGeo, rugMat);
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(-0.5, 0.015, -0.6);
      rug.receiveShadow = true;
      group.add(rug);

      // 2. Ceiling (Cozy evening ceiling, darker so it never blows out)
      const ceilGeo = new THREE.PlaneGeometry(12, 12);
      const ceilMat = ArtMaterials.paintedWall(0x334155);
      const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = 3.6;
      group.add(ceiling);

      // 3. Walls with Warm Plaster Texture and Teak Wood Skirting Board
      const wallMat = ArtMaterials.paintedWall();
      const wallW = 12, wallH = 3.6;

      // North Wall
      const northWall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, wallH), wallMat);
      northWall.position.set(0, wallH / 2, -6);
      northWall.receiveShadow = true;
      group.add(northWall);
      helperBox(-6, 0, -6.5, 6, 4, -5.8);

      // South Wall
      const southWall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, wallH), wallMat);
      southWall.rotation.y = Math.PI;
      southWall.position.set(0, wallH / 2, 6);
      southWall.receiveShadow = true;
      group.add(southWall);
      helperBox(-6, 0, 5.8, 6, 4, 6.5);

      // West Wall (with Balcony window)
      const westWall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, wallH), wallMat);
      westWall.rotation.y = Math.PI / 2;
      westWall.position.set(-6, wallH / 2, 0);
      westWall.receiveShadow = true;
      group.add(westWall);
      helperBox(-6.5, 0, -6, -5.8, 4, 6);

      // East Wall
      const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, wallH), wallMat);
      eastWall.rotation.y = -Math.PI / 2;
      eastWall.position.set(6, wallH / 2, 0);
      eastWall.receiveShadow = true;
      group.add(eastWall);
      helperBox(5.8, 0, -6, 6.5, 4, 6);

      // 4. Balcony Window with Curtains, Night City Glow & Iron Grill
      const windowWithCurtains = createWindowWithCurtains();
      windowWithCurtains.position.set(-5.92, 2.0, -1.5);
      group.add(windowWithCurtains);

      // 5. Heavy Teak Bed with Nakshi Kantha Bedsheet & Translucent Moshari
      const bed = createBedWithMoshari();
      bed.position.set(-2.8, 0, -3.2);
      group.add(bed);
      helperBox(-4.2, 0, -5.0, -1.4, 2.4, -1.4);

      // 6. Bedside Table with Steel Thermos, Chai Cup & Burning Mosquito Coil
      const bedsideTable = createBedsideTable();
      bedsideTable.position.set(-1.15, 0, -4.7);
      group.add(bedsideTable);
      helperBox(-1.6, 0, -5.1, -0.7, 1.2, -4.3);

      searchables.push({
        id: 'bedside_table',
        name: 'Bedside Table Drawer',
        banglaName: 'খাটের পাশের ড্রয়ার',
        position: [-1.15, 0.7, -4.7],
        searched: false,
        itemGiven: { type: 'ammo_coil', amount: 3, name: 'Pack of Eagle Coils' },
      });

      // Pair of house slippers beside bed
      const slippers = createSlippers();
      slippers.position.set(-1.4, 0, -2.4);
      group.add(slippers);

      // 7. Large Wooden Wardrobe / Almirah with Mirror Pane
      const almirah = createAlmirah();
      almirah.position.set(4.9, 0, -3.4);
      almirah.rotation.y = -Math.PI / 2;
      group.add(almirah);
      helperBox(4.0, 0, -4.3, 5.7, 2.4, -2.5);

      searchables.push({
        id: 'almirah_1',
        name: 'Wooden Almirah',
        banglaName: 'কাঠের আলমারি',
        position: [4.9, 1.1, -3.4],
        searched: false,
        itemGiven: { type: 'ammo_spray', amount: 40, name: 'Can of Insect Spray' },
      });

      // 8. Vintage Kelvinator Refrigerator
      const fridge = createOldFridge();
      fridge.position.set(4.9, 0, 4.2);
      fridge.rotation.y = -Math.PI / 2;
      group.add(fridge);
      helperBox(4.2, 0, 3.6, 5.6, 1.9, 4.9);

      searchables.push({
        id: 'fridge_1',
        name: 'Kelvinator Refrigerator',
        banglaName: 'পুরনো ফ্রিজ',
        position: [4.9, 1.0, 4.2],
        searched: false,
        itemGiven: { type: 'health', amount: 35, name: 'Cold Singara & Water' },
      });

      // 9. Ceiling Fan with spinning blades
      const fan = createCeilingFan();
      fan.position.set(0, 3.2, 0);
      group.add(fan);
      ceilingFanBladeGroup = fan.getObjectByName('ceilingBlades') as THREE.Group;

      // 10. Wall Accessories: Wall Clock (11:30 PM), Framed Art, Calendar, Fuse Box
      const wallClock = createWallClock();
      wallClock.position.set(0, 2.65, -5.94);
      group.add(wallClock);

      const framedArt = createFramedArt();
      framedArt.position.set(-2.8, 2.2, -5.94);
      group.add(framedArt);

      const calTex = createCalendarTexture();
      const calendar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.65, 0.95),
        new THREE.MeshStandardMaterial({ map: calTex, roughness: 0.8 })
      );
      calendar.position.set(2.4, 2.1, -5.94);
      group.add(calendar);

      // Fuse Box on East Wall
      const fuse = createFuseBox();
      fuse.position.set(5.92, 1.7, -1.0);
      fuse.rotation.y = -Math.PI / 2;
      group.add(fuse);
      fuseBoxMesh = fuse;

      // 11. Two Plastic Chairs (Red & Blue RFL molded plastic)
      const chair1 = createPlasticChair(0xdc2626); // Red
      chair1.position.set(2.4, 0, -3.2);
      chair1.rotation.y = -0.4;
      group.add(chair1);
      helperBox(2.0, 0, -3.7, 2.8, 1.0, -2.7);

      const chair2 = createPlasticChair(0x2563eb); // Blue
      chair2.position.set(3.4, 0, -2.5);
      chair2.rotation.y = -1.1;
      group.add(chair2);

      // 12. Detailed Wooden Study Table with books, desk lamp & charging phone
      const studyDesk = createStudyTable();
      studyDesk.position.set(-2.8, 0, 5.25);
      studyDesk.rotation.y = Math.PI;
      group.add(studyDesk);
      helperBox(-3.6, 0, 4.8, -2.0, 1.2, 5.7);

      // Wooden study desk chair tucked in
      const deskChair = createDeskChair();
      deskChair.position.set(-2.8, 0, 4.45);
      group.add(deskChair);
      helperBox(-3.1, 0, 4.1, -2.5, 1.0, 4.7);

      // 13. Electrical Switchboard with glowing red neon indicator & plugged charger
      const switchboard = createSwitchboard();
      switchboard.position.set(5.92, 1.4, 1.2);
      switchboard.rotation.y = -Math.PI / 2;
      group.add(switchboard);

      // 14. Clothes Rack with hanging lungi on West wall
      const clothesRack = createClothesHanger();
      clothesRack.position.set(-5.92, 2.1, 3.2);
      clothesRack.rotation.y = Math.PI / 2;
      group.add(clothesRack);

      // 15. Traditional Plastic Bucket & Bodna in corner
      const bucket = createRoomBucket();
      bucket.position.set(4.8, 0, 1.8);
      group.add(bucket);
      helperBox(4.5, 0, 1.5, 5.2, 0.45, 2.1);

      // 16. Cinematic Giant Mosquito Wall Shadow Projector (Fades in during power cut)
      const shadowGroup = createGiantMosquitoShadow();
      shadowGroup.position.set(0, 2.0, -5.92);
      group.add(shadowGroup);
      giantMosquitoShadowMesh = shadowGroup.getObjectByName('giantMosquitoShadowMesh') as THREE.Mesh;

      // 17. Spawn points for mosquitoes
      spawnPoints.push([-4.5, 2.2, -1.5]); // window
      spawnPoints.push([4.0, 2.4, 4.0]);  // ceiling corner
      spawnPoints.push([-4.0, 2.5, 4.0]); // wardrobe corner
      spawnPoints.push([0, 2.6, -4.5]);   // above bed
      break;
    }

    case 2: {
      // LEVEL 2: LOAD SHEDDING LOCKDOWN (Dark Corridor & Fuse Room)
      playerStart = [0, 1.2, 6.0];

      // Long hallway with concrete floor tiles
      const hallFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 20),
        ArtMaterials.concrete(0x334155)
      );
      hallFloor.rotation.x = -Math.PI / 2;
      group.add(hallFloor);

      const hallCeil = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 20),
        ArtMaterials.paintedWall(0x1e293b)
      );
      hallCeil.rotation.x = Math.PI / 2;
      hallCeil.position.y = 3.2;
      group.add(hallCeil);

      // Hallway walls
      const hallWallMat = ArtMaterials.paintedWall(0x475569);
      // Left Wall
      const leftW = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.2), hallWallMat);
      leftW.rotation.y = Math.PI / 2;
      leftW.position.set(-3.0, 1.6, 0);
      group.add(leftW);
      helperBox(-3.5, 0, -10, -2.8, 3.5, 10);

      // Right Wall
      const rightW = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.2), hallWallMat);
      rightW.rotation.y = -Math.PI / 2;
      rightW.position.set(3.0, 1.6, 0);
      group.add(rightW);
      helperBox(2.8, 0, -10, 3.5, 3.5, 10);

      // Back Wall
      const backW = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), hallWallMat);
      backW.rotation.y = Math.PI;
      backW.position.set(0, 1.6, 10);
      group.add(backW);
      helperBox(-3, 0, 9.8, 3, 3.5, 10.5);

      // Front Far Wall (with the Main Electrical Panel)
      const frontW = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), hallWallMat);
      frontW.position.set(0, 1.6, -10);
      group.add(frontW);
      helperBox(-3, 0, -10.5, 3, 3.5, -9.8);

      // Apartment Doors along the corridor (Flat 101, 102, 103)
      const doorWood = ArtMaterials.wood(true, 0x582a12);
      const brassKnob = ArtMaterials.metal('brass');

      const addCorridorDoor = (x: number, z: number, isLeft: boolean, numberStr: string) => {
        const doorGroup = new THREE.Group();
        const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 1.1), doorWood);
        doorGroup.add(doorMesh);

        // Brass handle
        const handle = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), brassKnob);
        handle.position.set(isLeft ? 0.04 : -0.04, 0, 0.4);
        doorGroup.add(handle);

        // Number Plate
        const plate = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.08, 0.2),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 })
        );
        plate.position.set(isLeft ? 0.04 : -0.04, 0.5, 0);
        doorGroup.add(plate);

        doorGroup.position.set(x, 1.1, z);
        group.add(doorGroup);
      };

      addCorridorDoor(-2.95, -4.0, true, '101');
      addCorridorDoor(2.95, -1.0, false, '102');
      addCorridorDoor(-2.95, 4.0, true, '103');

      // Slippers outside flat 101
      const s1 = createSlippers();
      s1.position.set(-2.4, 0, -3.4);
      group.add(s1);

      // Main Fuse Box
      const fuse = createFuseBox();
      fuse.scale.set(1.5, 1.5, 1.5);
      fuse.position.set(0, 1.6, -9.88);
      group.add(fuse);
      fuseBoxMesh = fuse;

      // High Voltage Warning sign directly above Main Breaker
      const dangerSignMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.48),
        new THREE.MeshStandardMaterial({ map: createDangerSignTexture(), roughness: 0.4 })
      );
      dangerSignMesh.position.set(0, 2.65, -9.92);
      group.add(dangerSignMesh);

      // Fluorescent tube fixtures along corridor ceiling
      [-5, 0, 5].forEach((zPos) => {
        const fixtureGroup = new THREE.Group();
        const chassis = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.08, 1.5),
          ArtMaterials.metal('dark', 0x334155)
        );
        fixtureGroup.add(chassis);

        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 1.3, 12),
          new THREE.MeshBasicMaterial({ color: 0xfffbe6 })
        );
        tube.rotation.x = Math.PI / 2;
        tube.position.y = -0.04;
        fixtureGroup.add(tube);

        fixtureGroup.position.set(0, 3.16, zPos);
        group.add(fixtureGroup);
      });

      // Conduit metal pipe along top wall corner leading to breaker
      const conduitMat = ArtMaterials.metal('dark', 0x64748b);
      const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 20, 8), conduitMat);
      conduit.rotation.x = Math.PI / 2;
      conduit.position.set(-2.88, 3.1, 0);
      group.add(conduit);

      // Wall gang switchboard near corridor entrance
      const switchboard2 = createSwitchboard();
      switchboard2.position.set(2.92, 1.4, 4.5);
      switchboard2.rotation.y = -Math.PI / 2;
      group.add(switchboard2);

      // Cardboard boxes in hallway
      const boxMat = ArtMaterials.wood(false, 0x854d0e);
      for (let b = 0; b < 3; b++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), boxMat);
        box.position.set(1.8, 0.4, -2.0 + b * 1.2);
        group.add(box);
        helperBox(1.3, 0, -2.5 + b * 1.2, 2.3, 0.8, -1.5 + b * 1.2);
      }

      searchables.push({
        id: 'corridor_box',
        name: 'Storage Crate',
        banglaName: 'মালপত্রের কার্টন',
        position: [1.8, 0.6, -2.0],
        searched: false,
        itemGiven: { type: 'ammo_spray', amount: 50, name: 'Extra HIT Spray Can' },
      });

      spawnPoints.push([-1.5, 2.2, -6.0]);
      spawnPoints.push([1.5, 2.2, -4.0]);
      spawnPoints.push([0, 2.5, 0]);
      spawnPoints.push([1.8, 1.8, 4.0]);
      break;
    }

    case 3: {
      // LEVEL 3: ROOFTOP BATTLE (CHHAD) — Authentic Dhaka Residential Rooftop
      playerStart = [0, 1.2, 0];

      // 1. Concrete Rooftop Floor (Weathered slab with expansion joints)
      const roofFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24),
        ArtMaterials.concrete(0x475569)
      );
      roofFloor.rotation.x = -Math.PI / 2;
      roofFloor.receiveShadow = true;
      group.add(roofFloor);

      // 2. Parapet Railing Walls (Red brick with smooth concrete coping)
      const parapetMat = ArtMaterials.concrete(0x991b1b);
      const copingMat = ArtMaterials.concrete(0x64748b);

      const borderConfig = [
        { w: 24, h: 1.1, d: 0.45, x: 0, z: -12 },
        { w: 24, h: 1.1, d: 0.45, x: 0, z: 12 },
        { w: 0.45, h: 1.1, d: 24, x: -12, z: 0 },
        { w: 0.45, h: 1.1, d: 24, x: 12, z: 0 },
      ];

      borderConfig.forEach((bc) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(bc.w, bc.h, bc.d), parapetMat);
        p.position.set(bc.x, bc.h / 2, bc.z);
        p.castShadow = true;
        p.receiveShadow = true;
        group.add(p);

        // Coping ledge on top
        const coping = new THREE.Mesh(
          new THREE.BoxGeometry(bc.w + (bc.w > bc.d ? 0.2 : 0), 0.08, bc.d + (bc.d > bc.w ? 0.2 : 0)),
          copingMat
        );
        coping.position.set(bc.x, bc.h + 0.04, bc.z);
        group.add(coping);

        helperBox(bc.x - bc.w / 2, 0, bc.z - bc.d / 2, bc.x + bc.w / 2, bc.h, bc.z + bc.d / 2);
      });

      // 3. Staircase Bulkhead Entrance Shed (চিলেকোঠা / Rooftop Room)
      const staircase = createStaircaseShed();
      staircase.position.set(-6.0, 0, 7.5);
      group.add(staircase);
      helperBox(-7.4, 0, 6.0, -4.6, 2.8, 9.0);

      // 4. Black Gazi Water Tanks (Left & Right)
      const tank1 = createWaterTank();
      tank1.position.set(-8.5, 0, -8.0);
      group.add(tank1);
      helperBox(-9.5, 0, -9.0, -7.5, 2.2, -7.0);

      const tank2 = createWaterTank();
      tank2.position.set(8.5, 0, -8.0);
      group.add(tank2);
      helperBox(7.5, 0, -9.0, 9.5, 2.2, -7.0);

      // 5. Blue PVC Water Pipes & Brass Turn-Cock Tap along parapet
      const pipes = createWaterPipes();
      pipes.position.set(-8.0, 0, -11.6);
      group.add(pipes);

      // 6. Rooftop Satellite Dishes (Akash DTH) on parapet corners
      const dish1 = createSatelliteDish();
      dish1.position.set(-11.5, 1.1, -11.5);
      dish1.rotation.y = 0.6;
      group.add(dish1);

      const dish2 = createSatelliteDish();
      dish2.position.set(11.5, 1.1, 9.5);
      dish2.rotation.y = -1.2;
      group.add(dish2);

      // 7. Aluminum TV Yagi Antenna on tall mast
      const antenna = createYagiAntenna();
      antenna.position.set(11.2, 0, -11.2);
      group.add(antenna);

      // 8. Clotheslines with drying lungi & saree
      const clothes = createClothesline();
      clothes.position.set(0, 0, 3.5);
      group.add(clothes);

      // 9. Terracotta Rooftop Flower Pots (টব) with tropical leaves & marigolds
      const pots1 = createRooftopPlantPots();
      pots1.position.set(-9.5, 0, 1.5);
      group.add(pots1);
      helperBox(-10.2, 0, 0.8, -8.8, 0.6, 2.2);

      const pots2 = createRooftopPlantPots();
      pots2.position.set(4.5, 0, -9.5);
      pots2.rotation.y = Math.PI / 2;
      group.add(pots2);
      helperBox(3.8, 0, -10.2, 5.2, 0.6, -8.8);

      // 10. Rooftop molded RFL plastic chairs
      const rChair1 = createPlasticChair(0x16a34a); // Green
      rChair1.position.set(-3.2, 0, -1.0);
      rChair1.rotation.y = 0.8;
      group.add(rChair1);

      const rChair2 = createPlasticChair(0xdc2626); // Red
      rChair2.position.set(3.2, 0, -1.0);
      rChair2.rotation.y = -0.7;
      group.add(rChair2);

      // 11. Laundry buckets with bodna in corner
      const bucket1 = createRoomBucket();
      bucket1.position.set(9.2, 0, 6.5);
      group.add(bucket1);

      // 12. Searchable tool & coil supply chest
      const toolChest = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 0.7),
        ArtMaterials.metal('dark', 0x1e3a8a)
      );
      toolChest.position.set(5.5, 0.3, 4.0);
      toolChest.castShadow = true;
      group.add(toolChest);
      helperBox(4.8, 0, 3.5, 6.2, 0.7, 4.5);

      searchables.push({
        id: 'roof_chest',
        name: 'Rooftop Storage Chest',
        banglaName: 'ছাদের স্টোরেজ বাক্স',
        position: [5.5, 0.5, 4.0],
        searched: false,
        itemGiven: { type: 'ammo_coil', amount: 4, name: 'Heavy Duty Coils' },
      });

      // 13. Detailed Multi-Tier Dhaka City Skyline Backdrop
      const skyline = createDhakaCitySkyline();
      group.add(skyline);

      // 14. Rooftop Mosquito Airborne Spawn Points
      spawnPoints.push([-8, 3.5, -8]);
      spawnPoints.push([8, 4.0, -8]);
      spawnPoints.push([0, 4.5, -10]);
      spawnPoints.push([-9, 3.8, 8]);
      spawnPoints.push([9, 3.8, 8]);
      spawnPoints.push([0, 5.0, 0]); // High air dive
      break;
    }

    case 4: {
      // LEVEL 4: DENGUE KING COURTYARD — Infected Waterlogged Arena
      playerStart = [0, 1.2, 6.5];

      // 1. Wet Mud & Old Dhaka Pavers Ground
      const courtGround = new THREE.Mesh(
        new THREE.PlaneGeometry(32, 32),
        ArtMaterials.concrete(0x27272a)
      );
      courtGround.rotation.x = -Math.PI / 2;
      courtGround.receiveShadow = true;
      group.add(courtGround);

      // 2. Large Stagnant Monsoon Water Puddles (Dengue Breeding Hotspots)
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x14532d,
        roughness: 0.08,
        metalness: 0.4,
        transparent: true,
        opacity: 0.8,
      });

      const puddle1 = new THREE.Mesh(new THREE.CircleGeometry(4.8, 24), waterMat);
      puddle1.rotation.x = -Math.PI / 2;
      puddle1.position.set(-3.5, 0.02, -2.5);
      puddle1.receiveShadow = true;
      group.add(puddle1);

      const puddle2 = new THREE.Mesh(new THREE.CircleGeometry(3.6, 20), waterMat);
      puddle2.rotation.x = -Math.PI / 2;
      puddle2.position.set(5.5, 0.02, 1.0);
      puddle2.receiveShadow = true;
      group.add(puddle2);

      // Floating green algae patches on puddles
      const algaeMat = ArtMaterials.vegetation(0x4d7c0f);
      for (let al = 0; al < 6; al++) {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(0.6 + Math.random() * 0.4, 8), algaeMat);
        patch.rotation.x = -Math.PI / 2;
        patch.position.set(-3.5 + (Math.random() - 0.5) * 3, 0.03, -2.5 + (Math.random() - 0.5) * 3);
        group.add(patch);
      }

      // 3. Giant Organic Mosquito Queen Hive / Dengue King Nest Mound
      const hive = createGiantMosquitoHive();
      hive.position.set(0, 0, -11.5);
      group.add(hive);
      helperBox(-4.5, 0, -14.0, 4.5, 6.0, -8.5);

      // 4. Old Dhaka Colonial Crumbling Brick Archway (Arena Entrance)
      const archway = createOldDhakaColonialArch();
      archway.position.set(0, 0, 11.0);
      group.add(archway);
      helperBox(-3.5, 0, 10.4, 3.5, 5.0, 11.6);

      // 5. Crumbling Colonial Perimeter Boundary Walls
      const wallMat = ArtMaterials.concrete(0x713f12); // Damp red brick with moss
      const arenaWalls = [
        { w: 32, h: 3.8, d: 0.6, x: 0, z: -16 },
        { w: 32, h: 3.8, d: 0.6, x: 0, z: 16 },
        { w: 0.6, h: 3.8, d: 32, x: -16, z: 0 },
        { w: 0.6, h: 3.8, d: 32, x: 16, z: 0 },
      ];

      arenaWalls.forEach((aw) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(aw.w, aw.h, aw.d), wallMat);
        wall.position.set(aw.x, aw.h / 2, aw.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);
        helperBox(aw.x - aw.w / 2, 0, aw.z - aw.d / 2, aw.x + aw.w / 2, aw.h, aw.z + aw.d / 2);
      });

      // 6. Corrugated Tin Shed Awnings along side walls
      const tinMat = ArtMaterials.metal('chrome', 0x94a3b8);
      const shed1 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 3.4, 3.2), tinMat);
      shed1.position.set(-11.5, 1.7, -4.0);
      shed1.castShadow = true;
      group.add(shed1);
      helperBox(-14.5, 0, -6.0, -8.5, 3.5, -2.0);

      const shed2 = new THREE.Mesh(new THREE.BoxGeometry(9.0, 3.4, 3.2), tinMat);
      shed2.position.set(11.5, 1.7, 4.0);
      shed2.castShadow = true;
      group.add(shed2);
      helperBox(8.5, 0, 2.0, 14.5, 3.5, 6.0);

      // 7. Tropical Banana Trees around the muddy perimeter
      for (let t = 0; t < 8; t++) {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.24, 3.6, 8),
          ArtMaterials.wood(false, 0x65a30d)
        );
        trunk.position.y = 1.8;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        for (let l = 0; l < 5; l++) {
          const leaf = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 2.5),
            ArtMaterials.vegetation(0x15803d)
          );
          leaf.rotation.x = 0.75;
          leaf.rotation.y = (l * Math.PI * 2) / 5;
          leaf.position.set(0, 3.4, 0);
          treeGroup.add(leaf);
        }

        const ang = (t * Math.PI * 2) / 8;
        treeGroup.position.set(Math.cos(ang) * 13.5, 0, Math.sin(ang) * 13.5);
        group.add(treeGroup);
      }

      // 8. Discarded Blue Plastic Water Drum (Searchable Health / Meds)
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 1.05, 12),
        ArtMaterials.plastic(0x1d4ed8)
      );
      barrel.position.set(7.5, 0.52, 2.5);
      barrel.castShadow = true;
      group.add(barrel);
      helperBox(6.9, 0, 1.9, 8.1, 1.1, 3.1);

      searchables.push({
        id: 'barrel_med',
        name: 'Emergency Supply Barrel',
        banglaName: 'ত্রাণের ড্রাম',
        position: [7.5, 0.6, 2.5],
        searched: false,
        itemGiven: { type: 'health', amount: 50, name: 'First Aid Kit & Glucose' },
      });

      // 9. Second Supply Box near Entrance
      const medCrate = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.8),
        ArtMaterials.wood(false, 0x78350f)
      );
      medCrate.position.set(-6.5, 0.3, 7.5);
      medCrate.castShadow = true;
      group.add(medCrate);
      helperBox(-7.0, 0, 7.0, -6.0, 0.7, 8.0);

      searchables.push({
        id: 'court_crate',
        name: 'Relief Supply Crate',
        banglaName: 'ত্রাণের কাঠের বাক্স',
        position: [-6.5, 0.5, 7.5],
        searched: false,
        itemGiven: { type: 'ammo_spray', amount: 45, name: 'Can of Insect Spray' },
      });

      // 10. Dengue Arena Spawn Points (Boss emerges from the Hive cave portal)
      spawnPoints.push([0, 3.4, -9.0]); // Emerging from Hive
      spawnPoints.push([-4, 3.2, -3]);
      spawnPoints.push([4, 3.2, 1]);
      spawnPoints.push([0, 4.0, 0]);
      spawnPoints.push([-8, 3.0, 6]);
      spawnPoints.push([8, 3.0, 6]);
      break;
    }

    case 5: {
      // LEVEL 5: MIDNIGHT STREET INVASION (Authentic Dhaka residential street & rickshaw lane)
      playerStart = [0, 1.2, 11];

      // 1. Asphalt Roadway
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 38),
        ArtMaterials.asphalt()
      );
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      group.add(road);

      // White dashed center road lane dividers (Dhaka city lane markings)
      const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let z = -16; z <= 16; z += 4.5) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.2), whiteLineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(0, 0.015, z);
        group.add(dash);
      }

      // 2. Concrete Sidewalks / Footpaths
      const sidewalkMat = ArtMaterials.concrete(0x64748b);
      const curbMat = ArtMaterials.concrete(0x475569);

      // Left Sidewalk
      const leftWalk = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.24, 38), sidewalkMat);
      leftWalk.position.set(-8.6, 0.12, 0);
      leftWalk.receiveShadow = true;
      group.add(leftWalk);

      const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 38), curbMat);
      leftCurb.position.set(-6.0, 0.14, 0);
      group.add(leftCurb);

      // Right Sidewalk
      const rightWalk = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.24, 38), sidewalkMat);
      rightWalk.position.set(8.6, 0.12, 0);
      rightWalk.receiveShadow = true;
      group.add(rightWalk);

      const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 38), curbMat);
      rightCurb.position.set(6.0, 0.14, 0);
      group.add(rightCurb);

      // Roadside Storm Drain Gutters along both curbs
      const leftGutter = createRoadDrainGutter(34);
      leftGutter.position.set(-5.8, 0, 0);
      group.add(leftGutter);

      const rightGutter = createRoadDrainGutter(34);
      rightGutter.position.set(5.8, 0, 0);
      group.add(rightGutter);

      // 3. Multi-Story Dhaka Residential & Commercial Buildings on Both Sides
      // Building 1 (Left North): 3-Story "Janani Pharmacy"
      const bld1 = createDhakaStreetBuilding(
        8.5,
        14,
        6.0,
        0xd5c8b2,
        'জননী ফার্মেসী',
        '২৪ ঘণ্টা খোলা • ঔষধ ও সার্জিকাল সামগ্রী',
        'pharmacy',
        true
      );
      bld1.position.set(-10.2, 0, -9.0);
      group.add(bld1);
      helperBox(-14.5, 0, -12.5, -6.0, 14, -5.5);

      // Building 2 (Left South): 3-Story "Bismillah General Store"
      const bld2 = createDhakaStreetBuilding(
        8.5,
        14,
        6.0,
        0xe2e8f0,
        'বিসমিল্লাহ জেনারেল স্টোর',
        'নিত্যপ্রয়োজনীয় মুদি ও স্টেশনারি মালামাল',
        'store',
        true
      );
      bld2.position.set(-10.2, 0, 7.5);
      group.add(bld2);
      helperBox(-14.5, 0, 4.0, -6.0, 14, 11.0);

      // Building 3 (Right North): 3-Story "Dhaka Laundry"
      const bld3 = createDhakaStreetBuilding(
        8.5,
        14,
        6.0,
        0xd7cfc7,
        'ঢাকা লন্ড্রি ও ড্রাই ক্লিনার্স',
        'অত্যাধুনিক মেশিনে কাপড় ওয়াশ ও ইস্ত্রি',
        'laundry',
        true
      );
      bld3.position.set(10.2, 0, -8.5);
      bld3.rotation.y = Math.PI;
      group.add(bld3);
      helperBox(6.0, 0, -12.0, 14.5, 14, -5.0);

      // Building 4 (Right South): 3-Story Residential & Workshop
      const bld4 = createDhakaStreetBuilding(
        8.5,
        14,
        6.0,
        0xcbc5b9,
        'মায়ের দোয়া সাইকেল ও রিকশা',
        'রিকশা মেরামত ও যন্ত্রাংশ বিক্রয় কেন্দ্র',
        'tea',
        false
      );
      bld4.position.set(10.2, 0, 8.0);
      bld4.rotation.y = Math.PI;
      group.add(bld4);
      helperBox(6.0, 0, 4.5, 14.5, 14, 11.5);

      // 4. Authentic Roadside "Tong" Tea Stall (চায়ের টং)
      const teaStall = createTeaStall();
      teaStall.position.set(-5.4, 0.24, -1.0);
      teaStall.rotation.y = 0.15;
      group.add(teaStall);
      helperBox(-6.8, 0, -2.4, -4.0, 2.5, 0.4);

      // Tea stall customer bench collider
      helperBox(-6.6, 0, -0.1, -4.2, 0.6, 0.6);

      searchables.push({
        id: 'tea_counter',
        name: 'Tong Tea Stall Counter',
        banglaName: 'চায়ের টংয়ের মালাই চা ও টোস্ট',
        position: [-5.4, 1.1, -1.0],
        searched: false,
        itemGiven: { type: 'health', amount: 40, name: 'Hot Milk Cha & Butter Toast' },
      });

      // 5. Authentic Dhaka Cycle Rickshaws parked by roadside
      // Rickshaw 1: Yellow & Blue Rickshaw on left sidewalk
      const rickshaw1 = createRickshaw(0xfacc15, 0x1e3a8a);
      rickshaw1.position.set(-3.2, 0.24, 4.2);
      rickshaw1.rotation.y = 0.28;
      group.add(rickshaw1);
      helperBox(-4.2, 0, 2.8, -2.2, 1.8, 5.6);

      // Rickshaw 2: Emerald & Red Rickshaw on right sidewalk
      const rickshaw2 = createRickshaw(0xef4444, 0x065f46);
      rickshaw2.position.set(3.5, 0.24, -4.5);
      rickshaw2.rotation.y = -0.32;
      group.add(rickshaw2);
      helperBox(2.5, 0, -6.0, 4.5, 1.8, -3.0);

      // Searchable cargo seat on Rickshaw 2
      searchables.push({
        id: 'rickshaw_cargo',
        name: 'Rickshaw Passenger Seat',
        banglaName: 'রিকশার সিটের নিচে ফেলে যাওয়া স্প্রে',
        position: [3.5, 0.8, -4.5],
        searched: false,
        itemGiven: { type: 'ammo_spray', amount: 50, name: 'Forgotten Can of Insect Spray' },
      });

      // 6. Concrete Electric Utility Poles with Transformers & Tangled Cables
      // Pole 1 on Left Sidewalk (with streetlamp illumination)
      const pole1 = createElectricPoleWithTransformer();
      pole1.position.set(-5.8, 0.24, 7.5);
      group.add(pole1);
      helperBox(-6.1, 0, 7.2, -5.5, 8.5, 7.8);

      // Pole 2 on Right Sidewalk (contains fuse box for load-shedding restore)
      const pole2 = createElectricPoleWithTransformer();
      pole2.position.set(5.8, 0.24, -4.5);
      pole2.rotation.y = Math.PI;
      group.add(pole2);
      helperBox(5.5, 0, -4.8, 6.1, 8.5, -4.2);

      // Fuse box on Pole 2 for power restore objective
      const fuse = createFuseBox();
      fuse.position.set(6.2, 1.6, -4.5);
      fuse.rotation.y = -Math.PI / 2;
      group.add(fuse);
      fuseBoxMesh = fuse;

      // 7. Parked 125cc Commuter Motorcycle
      const motorcycle = createParkedMotorcycle();
      motorcycle.position.set(4.2, 0.24, 3.2);
      motorcycle.rotation.y = 0.45;
      group.add(motorcycle);
      helperBox(3.4, 0, 2.3, 5.0, 1.1, 4.1);

      // 8. Dhaka City Corporation Green Waste Bin
      const dustbin = createDhakaDustbin();
      dustbin.position.set(-5.6, 0.24, 5.8);
      group.add(dustbin);
      helperBox(-6.1, 0, 5.3, -5.1, 1.2, 6.3);

      // 9. Weathered Bengali Street Posters on Walls
      const posters1 = createStreetWallPosters();
      posters1.position.set(-5.9, 0.4, 3.0);
      posters1.rotation.y = Math.PI / 2;
      group.add(posters1);

      const posters2 = createStreetWallPosters();
      posters2.position.set(5.9, 0.4, -1.0);
      posters2.rotation.y = -Math.PI / 2;
      group.add(posters2);

      // 10. Street Mosquito Spawn Points (Tactical alleyways & rooftops)
      spawnPoints.push([-3.5, 3.0, -8.0]);
      spawnPoints.push([3.5, 3.2, -7.0]);
      spawnPoints.push([0.0, 4.2, 0.0]);
      spawnPoints.push([-5.0, 3.0, 6.0]);
      spawnPoints.push([5.0, 3.2, 7.0]);
      spawnPoints.push([0.0, 3.5, -12.0]);
      break;
    }

    case 6: {
      // LEVEL 6: FINAL NIGHT (Ground Zero: Subterranean Mosquito Mutation Lab beneath Dhaka)
      playerStart = [0, 1.2, 12];

      // 1. Vast Underground Cavern Floor (Cracked industrial concrete with toxic grime)
      const cavernFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(36, 36),
        ArtMaterials.concrete(0x0a1d17)
      );
      cavernFloor.rotation.x = -Math.PI / 2;
      cavernFloor.receiveShadow = true;
      group.add(cavernFloor);

      // Cavern Vaulted Rock Dome Ceiling
      const cavernDome = new THREE.Mesh(
        new THREE.SphereGeometry(22, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
        ArtMaterials.concrete(0x05140f)
      );
      cavernDome.material.side = THREE.BackSide;
      cavernDome.position.y = 0;
      group.add(cavernDome);

      // 2. Complete Final Mutation Bio-Hive Arena Structure
      // Includes:
      // - Colossal 7m central queen mutation egg sac cluster
      // - 4 cracked Dhaka Metro rail concrete viaduct pillars with exposed rusted rebar
      // - 4 cryogenic mutation incubator vats with glowing emerald fluid & suspended mutant silhouettes
      // - Bioluminescent toxic slime pools on the floor
      // - Collapsed structural concrete slabs for cover
      const bioArena = createFinalBioHiveArena();
      bioArena.position.set(0, 0, -1.0);
      group.add(bioArena);

      // Central Queen Hive Mound Collider (Boss emerging point)
      helperBox(-4.0, 0, -4.5, 4.0, 7.0, 2.5);

      // 4 Metro Rail Pillar Colliders
      helperBox(-9.2, 0, -9.2, -6.8, 7.5, -6.8);
      helperBox(6.8, 0, -9.2, 9.2, 7.5, -6.8);
      helperBox(-9.2, 0, 6.8, -6.8, 7.5, 9.2);
      helperBox(6.8, 0, 6.8, 9.2, 7.5, 9.2);

      // Collapsed Concrete Slab Colliders (Tactical cover against boss charges)
      helperBox(-7.5, 0, 4.2, -3.5, 1.2, 6.8);
      helperBox(4.2, 0, -6.2, 7.8, 1.2, -3.8);

      // 3. Searchable Supply Caches
      // Cache 1: Experimental Bio-Arsenal Crate with Hazard Warning
      const bioBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.9, 0.9),
        ArtMaterials.metal('dark', 0x15803d)
      );
      bioBox.position.set(-6.5, 0.45, 6.5);
      bioBox.castShadow = true;
      group.add(bioBox);
      helperBox(-7.4, 0, 5.9, -5.6, 1.1, 7.1);

      searchables.push({
        id: 'bio_crate',
        name: 'Experimental Bio-Arsenal Crate',
        banglaName: 'সামরিক বাহিনীর অ্যান্টি-মস্কিটো অস্ত্রভাণ্ডার',
        position: [-6.5, 0.6, 6.5],
        searched: false,
        itemGiven: { type: 'ammo_spray', amount: 100, name: 'Military-Grade Max Spray Refill' },
      });

      // Cache 2: Emergency Antidote Medkit
      const medKit = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.5, 0.8),
        ArtMaterials.plastic(0xdc2626, true)
      );
      medKit.position.set(6.5, 0.25, 6.5);
      medKit.castShadow = true;
      group.add(medKit);
      helperBox(6.0, 0, 6.0, 7.0, 0.6, 7.0);

      searchables.push({
        id: 'emergency_med',
        name: 'Subterranean Antidote Kit',
        banglaName: 'জরুরি অ্যান্টিডোট ও স্যালাইন',
        position: [6.5, 0.5, 6.5],
        searched: false,
        itemGiven: { type: 'health', amount: 60, name: 'Adrenaline & Bio-Antidote' },
      });

      // 4. Biohazard Emergency Flashing Beacon Light on Metro Pillar
      const beaconLight = new THREE.PointLight(0xef4444, 1.8, 12.0);
      beaconLight.position.set(-8.0, 4.8, 7.0);
      group.add(beaconLight);

      // 5. Final Apex Mutant Boss Arena Spawn Points
      spawnPoints.push([0.0, 4.5, -4.5]); // Directly emerging from Master Hive Core!
      spawnPoints.push([-7.0, 3.8, -5.0]);
      spawnPoints.push([7.0, 3.8, -5.0]);
      spawnPoints.push([-5.0, 3.2, 4.0]);
      spawnPoints.push([5.0, 3.2, 4.0]);
      spawnPoints.push([0.0, 3.0, 8.0]);
      break;
    }
  }

  return {
    environmentGroup: group,
    colliders,
    searchables,
    ceilingFanBladeGroup,
    fuseBoxMesh,
    giantMosquitoShadowMesh,
    spawnPoints,
    playerStart,
  };
}

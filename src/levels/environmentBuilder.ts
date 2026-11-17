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
import {
  AtmosphereSpec,
  FlickerSpec,
} from '../systems/atmosphere';
import {
  createDetailedApartmentDoor,
  createCorridorWindow,
  createFluorescentFixture,
  createCagedBulb,
  createCorridorBench,
  createShoeRack,
  createGasCylinder,
  createWaterJar,
  createMopBucket,
  createNoticeBoard,
  createWallStain,
  createRooftopCharpai,
  createSplitACUnit,
  createRooftopDrum,
  createStringLights,
  createOverheadCable,
  createShopAwning,
  createVegetableCart,
  createStreetLamp,
  createDebrisPile,
  createBioPod,
  createCollapsedSlab,
  createIndustrialGenerator,
  createBiohazardBoard,
} from '../systems/propModels';

export interface BuiltLevel {
  environmentGroup: THREE.Group;
  colliders: THREE.Box3[];
  searchables: SearchableContainer[];
  ceilingFanBladeGroup?: THREE.Group;
  fuseBoxMesh?: THREE.Group;
  giantMosquitoShadowMesh?: THREE.Mesh;
  atmosphere?: AtmosphereSpec;
  spawnPoints: [number, number, number][];
  playerStart: [number, number, number];
}

/** Clone a material's texture so it can tile without mutating the shared cache. */
function tiled(
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  repeatX: number,
  repeatY: number
): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  const clone = material.clone();
  if (clone.map) {
    clone.map = clone.map.clone();
    clone.map.wrapS = THREE.RepeatWrapping;
    clone.map.wrapT = THREE.RepeatWrapping;
    clone.map.repeat.set(repeatX, repeatY);
    clone.map.needsUpdate = true;
  }
  return clone;
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
  const atmosphere: AtmosphereSpec = { motes: [], beams: [], flickers: [] };

  const helperBox = (minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) => {
    colliders.push(new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ)));
  };

  /** Add a practical light that the atmosphere system can flicker / black out. */
  const practicalLight = (
    color: number,
    intensity: number,
    distance: number,
    x: number,
    y: number,
    z: number,
    flicker?: Omit<FlickerSpec, 'light' | 'base'>
  ): THREE.PointLight => {
    const light = new THREE.PointLight(color, intensity, distance, 1.7);
    light.position.set(x, y, z);
    group.add(light);
    if (flicker) {
      atmosphere.flickers!.push({ light, base: intensity, ...flicker });
    }
    return light;
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
      // A lived-in Dhaka apartment corridor: ceramic floor, damp plaster, tiled
      // wainscot, real door furniture, moonlit windows and buzzing battens.
      playerStart = [0, 1.2, 6.0];

      // --- Floor: stained ceramic tile with dark grout and a worn runner ----
      const hallFloorMat = tiled(ArtMaterials.concrete(0x3c4750), 3, 10);
      const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(6, 20), hallFloorMat);
      hallFloor.rotation.x = -Math.PI / 2;
      hallFloor.receiveShadow = true;
      group.add(hallFloor);

      const runnerMat = tiled(ArtMaterials.fabric(0x3f4a3a), 1, 6);
      const runner = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 17.2), runnerMat);
      runner.rotation.x = -Math.PI / 2;
      runner.rotation.z = 0.004;
      runner.position.set(0.05, 0.012, -0.2);
      runner.receiveShadow = true;
      group.add(runner);
      // Frayed runner edges.
      for (const side of [-1, 1]) {
        const edge = new THREE.Mesh(
          new THREE.PlaneGeometry(0.05, 17.2),
          new THREE.MeshStandardMaterial({ color: 0x8a7a4d, roughness: 0.95 })
        );
        edge.rotation.x = -Math.PI / 2;
        edge.position.set(0.05 + side * 0.55, 0.014, -0.2);
        group.add(edge);
      }

      // --- Ceiling with beams, conduit and a water stain --------------------
      const hallCeil = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 20),
        ArtMaterials.paintedWall(0x232c36)
      );
      hallCeil.rotation.x = Math.PI / 2;
      hallCeil.position.y = 3.2;
      group.add(hallCeil);

      const beamMat = ArtMaterials.concrete(0x2f3842);
      for (let b = -8; b <= 8; b += 4) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(6, 0.16, 0.2), beamMat);
        beam.position.set(0, 3.1, b);
        group.add(beam);
      }
      const ceilingStain = new THREE.Mesh(
        new THREE.CircleGeometry(0.85, 18),
        new THREE.MeshStandardMaterial({
          color: 0x596b5c,
          transparent: true,
          opacity: 0.35,
          roughness: 1,
          depthWrite: false,
        })
      );
      ceilingStain.rotation.x = Math.PI / 2;
      ceilingStain.position.set(1.2, 3.19, 3.4);
      ceilingStain.scale.set(1.5, 0.7, 1);
      group.add(ceilingStain);

      // --- Walls: two-tone paint, tiled dado, skirting and grime -------------
      const upperWallMat = tiled(ArtMaterials.paintedWall(0x5c6a6f), 8, 1);
      const dadoMat = tiled(ArtMaterials.concrete(0x2f4f4a), 8, 1);
      const skirtingMat = ArtMaterials.wood(false, 0x2b1c11);

      const addSideWall = (side: -1 | 1) => {
        const x = side * 3.0;
        const upper = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.72), upperWallMat);
        upper.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        upper.position.set(x, 2.34, 0);
        upper.receiveShadow = true;
        group.add(upper);

        const dado = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.44), dadoMat);
        dado.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        dado.position.set(x - side * 0.002, 0.72, 0);
        dado.receiveShadow = true;
        group.add(dado);

        const dadoTrim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 20), skirtingMat);
        dadoTrim.position.set(x - side * 0.03, 1.45, 0);
        group.add(dadoTrim);

        const skirting = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 20), skirtingMat);
        skirting.position.set(x - side * 0.04, 0.08, 0);
        group.add(skirting);

        // Damp patches climbing from the floor.
        for (const [z, w, h, tint] of [
          [-7.2, 1.5, 1.9, '#22312f'],
          [-1.6, 1.1, 1.5, '#2a3338'],
          [5.6, 1.8, 2.1, '#1f2d2c'],
        ] as [number, number, number, string][]) {
          const stain = createWallStain(w, h, tint);
          const stainMat = (stain.material as THREE.Material).clone() as THREE.MeshBasicMaterial;
          stainMat.transparent = true;
          stainMat.opacity = 0.65;
          stainMat.depthWrite = false;
          stain.material = stainMat;
          stain.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
          stain.position.set(x - side * 0.015, h * 0.5 + 0.1, z);
          group.add(stain);
        }
      };
      addSideWall(-1);
      addSideWall(1);
      helperBox(-3.5, 0, -10, -2.94, 3.5, 10);
      helperBox(2.94, 0, -10, 3.5, 3.5, 10);

      // Back wall behind the player.
      const backWallMat = tiled(ArtMaterials.paintedWall(0x5c6a6f), 3, 1);
      const backW = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), backWallMat);
      backW.rotation.y = Math.PI;
      backW.position.set(0, 1.6, 10);
      group.add(backW);
      helperBox(-3, 0, 9.94, 3, 3.5, 10.5);

      // The fuse wall: older, grimier concrete.
      const frontW = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 3.2),
        tiled(ArtMaterials.concrete(0x3d4846), 3, 1.5)
      );
      frontW.position.set(0, 1.6, -10);
      frontW.receiveShadow = true;
      group.add(frontW);
      helperBox(-3, 0, -10.5, 3, 3.5, -9.94);

      // --- Apartment doors with frames, panels, brass and Bengali numbers ---
      const doors: Array<{ x: number; z: number; side: -1 | 1; num: string }> = [
        { x: -2.93, z: -5.4, side: -1, num: '১০১' },
        { x: 2.93, z: -2.6, side: 1, num: '১০২' },
        { x: -2.93, z: 2.4, side: -1, num: '১০৩' },
        { x: 2.93, z: 6.2, side: 1, num: '১০৪' },
      ];
      for (const d of doors) {
        const door = createDetailedApartmentDoor(d.num, d.side);
        door.position.set(d.x, 0, d.z);
        door.rotation.y = d.side < 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(door);
      }

      // Slippers outside flat 101 and a bench by 102.
      const s1 = createSlippers();
      s1.position.set(-2.45, 0, -4.35);
      s1.rotation.y = 0.4;
      group.add(s1);

      const bench = createCorridorBench();
      bench.position.set(2.42, 0, 1.0);
      bench.rotation.y = -Math.PI / 2;
      group.add(bench);
      helperBox(2.05, 0, 0.2, 2.78, 1.1, 1.8);

      const shoeRack = createShoeRack();
      shoeRack.position.set(-2.6, 0, -3.9);
      shoeRack.rotation.y = Math.PI / 2;
      group.add(shoeRack);
      helperBox(-2.82, 0, -4.35, -2.35, 0.62, -3.45);

      const notice = createNoticeBoard();
      notice.position.set(2.91, 1.62, -0.5);
      notice.rotation.y = -Math.PI / 2;
      group.add(notice);

      // --- Moonlit windows with iron grilles --------------------------------
      const windowZs: Array<{ z: number; side: -1 | 1 }> = [
        { z: -7.4, side: -1 },
        { z: 5.0, side: 1 },
      ];
      for (const w of windowZs) {
        const windowGroup = createCorridorWindow();
        windowGroup.position.set(w.side * 2.95, 0, w.z);
        windowGroup.rotation.y = w.side < 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(windowGroup);

        // Cool moonlight spilling across the corridor.
        atmosphere.beams!.push({
          position: [w.side * 1.35, 1.55, w.z + (w.side < 0 ? 0.35 : -0.35)],
          rotation: [0, w.side * -0.32, w.side * 0.38],
          width: 2.1,
          height: 3.3,
          color: 0x7192c9,
          opacity: 0.20,
          pulse: 0.7,
        });
        practicalLight(0x7fa6e8, 0.9, 5.5, w.side * 2.3, 1.7, w.z, {
          style: 'bulb',
          seed: w.z,
        });
      }

      // --- Ceiling battens: the only warm light, and they flicker -------------
      [-7.4, -2.4, 2.6, 7.4].forEach((zPos, i) => {
        const fixture = createFluorescentFixture(1.45);
        fixture.position.set(0, 3.05, zPos);
        group.add(fixture);
        practicalLight(0xd8efff, 2.0, 6.5, 0, 2.92, zPos, {
          style: 'fluorescent',
          seed: i * 9.7,
        });
      });

      // A single caged bulb over the fuse panel with red emergency standby.
      const caged = createCagedBulb();
      caged.position.set(0.9, 2.55, -9.35);
      group.add(caged);
      practicalLight(0xffcf8a, 1.4, 4.2, 0.9, 2.35, -9.35, {
        style: 'bulb',
        seed: 3.2,
      });
      practicalLight(0xff3b30, 1.1, 3.2, -0.9, 2.6, -9.6, {
        style: 'emergency',
        seed: 1.4,
        survivesPowerCut: true,
      });

      // Conduit pipes and a junction box feeding the breaker.
      const conduitMat = ArtMaterials.metal('dark', 0x59636b);
      for (const x of [-0.55, 0.55]) {
        const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 19.6, 8), conduitMat);
        conduit.rotation.x = Math.PI / 2;
        conduit.position.set(x, 3.06, 0);
        group.add(conduit);
      }
      const conduitDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.9, 8), conduitMat);
      conduitDrop.position.set(-0.55, 2.7, -9.85);
      group.add(conduitDrop);

      const junction = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.36, 0.16),
        ArtMaterials.metal('dark', 0x4a5560)
      );
      junction.position.set(-1.7, 2.35, -9.88);
      group.add(junction);

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

      // Wall gang switchboard near corridor entrance
      const switchboard2 = createSwitchboard();
      switchboard2.position.set(2.92, 1.4, 4.5);
      switchboard2.rotation.y = -Math.PI / 2;
      group.add(switchboard2);

      // --- Clutter: gas cylinder, water jar, mop bucket, crates -------------
      const gas = createGasCylinder();
      gas.position.set(2.55, 0, 7.4);
      group.add(gas);
      helperBox(2.28, 0, 7.1, 2.82, 0.78, 7.7);

      const jar = createWaterJar();
      jar.position.set(-2.55, 0, 7.6);
      group.add(jar);
      helperBox(-2.82, 0, 7.33, -2.28, 0.88, 7.88);

      const mop = createMopBucket();
      mop.position.set(2.5, 0, -7.6);
      group.add(mop);

      const boxMat = ArtMaterials.wood(false, 0x6d4c2f);
      for (let b = 0; b < 2; b++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.66, 0.72), boxMat);
        box.position.set(2.15, 0.33, -1.5 - b * 0.78);
        box.rotation.y = b * 0.18;
        box.castShadow = true;
        group.add(box);
      }
      helperBox(1.75, 0, -2.7, 2.55, 0.66, -1.1);

      searchables.push({
        id: 'corridor_box',
        name: 'Storage Crate',
        banglaName: 'মালপত্রের কার্টন',
        position: [2.15, 0.6, -1.9],
        searched: false,
        itemGiven: { type: 'ammo_spray', amount: 50, name: 'Extra HIT Spray Can' },
      });

      // --- Air: dust caught in the moonbeams and batten light ----------------
      atmosphere.motes!.push({
        count: 460,
        color: 0xbcd4ee,
        size: 0.032,
        center: [0, 1.55, -0.5],
        bounds: [5.4, 2.5, 18.5],
        opacity: 0.42,
        drift: 0.1,
        fall: -0.018,
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
        tiled(ArtMaterials.concrete(0x5a6068), 4, 4)
      );
      roofFloor.rotation.x = -Math.PI / 2;
      roofFloor.receiveShadow = true;
      group.add(roofFloor);

      // Expansion joints and patched repairs break up the slab.
      const jointMat = new THREE.MeshStandardMaterial({ color: 0x2c3238, roughness: 0.95 });
      for (let j = -8; j <= 8; j += 8) {
        const jointX = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 23.4), jointMat);
        jointX.rotation.x = -Math.PI / 2;
        jointX.position.set(j, 0.006, 0);
        group.add(jointX);
        const jointZ = new THREE.Mesh(new THREE.PlaneGeometry(23.4, 0.06), jointMat);
        jointZ.rotation.x = -Math.PI / 2;
        jointZ.position.set(0, 0.006, j);
        group.add(jointZ);
      }
      const patchMat = new THREE.MeshStandardMaterial({ color: 0x6b7076, roughness: 0.92 });
      for (const [px, pz, pw, pd] of [
        [-4.2, -6.8, 3.1, 2.2],
        [6.0, 4.4, 2.4, 3.4],
        [2.2, -3.1, 1.8, 1.4],
      ] as [number, number, number, number][]) {
        const patch = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), patchMat);
        patch.rotation.x = -Math.PI / 2;
        patch.position.set(px, 0.008, pz);
        group.add(patch);
      }

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

      // 14. Lived-in rooftop furniture: charpai, AC unit, drums and cables
      const charpai = createRooftopCharpai();
      charpai.position.set(-1.7, 0, 8.6);
      charpai.rotation.y = 0.28;
      group.add(charpai);
      helperBox(-2.7, 0, 7.9, -0.7, 0.6, 9.3);

      const ac = createSplitACUnit();
      ac.position.set(2.9, 0, 7.2);
      ac.rotation.y = -0.35;
      group.add(ac);
      helperBox(2.35, 0, 6.85, 3.45, 1.05, 7.55);

      const drum1 = createRooftopDrum();
      drum1.position.set(7.1, 0, -2.3);
      group.add(drum1);
      helperBox(6.55, 0, -2.85, 7.65, 1.0, -1.75);

      const drum2 = createRooftopDrum();
      drum2.position.set(-7.5, 0, 4.4);
      drum2.rotation.y = 0.7;
      group.add(drum2);
      helperBox(-8.05, 0, 3.85, -6.95, 1.0, 4.95);

      // Bulb string zig-zagging over the seating corner.
      const stringLights = createStringLights(16, 5.4);
      stringLights.position.set(-1.8, 3.0, 4.8);
      stringLights.rotation.y = 0.1;
      group.add(stringLights);
      practicalLight(0xffc169, 1.1, 6.0, -1.8, 2.6, 4.8, {
        style: 'bulb',
        seed: 6.5,
      });

      // Sagging neighbourhood cables crossing the rooftop sky.
      const cableGroup = createOverheadCable(
        new THREE.Vector3(-12.2, 5.4, -10.6),
        new THREE.Vector3(12.2, 5.9, -8.8)
      );
      group.add(cableGroup);
      const cableGroup2 = createOverheadCable(
        new THREE.Vector3(-12.2, 6.1, 6.0),
        new THREE.Vector3(10.5, 5.3, 11.5)
      );
      group.add(cableGroup2);

      // Stairwell porch lamp and a weak fluorescent over the tank platform.
      practicalLight(0xffb15c, 1.4, 5.5, -4.9, 2.55, 7.1, {
        style: 'bulb',
        seed: 2.1,
      });
      practicalLight(0x9fc5e8, 0.85, 7.0, -8.5, 2.4, -8.0, {
        style: 'fluorescent',
        seed: 8.8,
      });

      // Moonlight shaft across the slab.
      atmosphere.beams!.push({
        position: [-4.0, 2.2, -2.0],
        rotation: [0.12, -0.5, 0.32],
        width: 4.6,
        height: 7.5,
        color: 0x9db8e8,
        opacity: 0.10,
        pulse: 0.5,
      });

      // City dust and monsoon haze drifting across the roof.
      atmosphere.motes!.push({
        count: 380,
        color: 0xffc98c,
        size: 0.028,
        center: [0, 2.4, 0],
        bounds: [22, 5.0, 22],
        opacity: 0.30,
        drift: 0.24,
        fall: 0.015,
      });
      atmosphere.motes!.push({
        count: 140,
        color: 0x9ec9ff,
        size: 0.022,
        center: [0, 4.6, 0],
        bounds: [24, 4.0, 24],
        opacity: 0.20,
        drift: 0.32,
      });

      // 15. Rooftop Mosquito Airborne Spawn Points
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

      // 10. Collapsed colonial masonry, breeding vats and warning lighting
      const slab1 = createCollapsedSlab();
      slab1.position.set(-10.4, 0, 7.6);
      slab1.rotation.y = 0.55;
      group.add(slab1);
      helperBox(-11.9, 0, 6.0, -8.9, 0.9, 9.2);

      const slab2 = createCollapsedSlab();
      slab2.position.set(10.2, 0, -7.2);
      slab2.rotation.y = -0.8;
      group.add(slab2);
      helperBox(8.7, 0, -8.8, 11.7, 0.9, -5.6);

      for (const [dx, dz, rot] of [
        [-12.6, -9.6, 0.4],
        [12.8, 9.4, -1.1],
        [-11.9, 11.4, 1.8],
        [11.5, -11.2, 0.2],
      ] as [number, number, number][]) {
        const debris = createDebrisPile();
        debris.position.set(dx, 0, dz);
        debris.rotation.y = rot;
        group.add(debris);
      }

      // Two infected breeding pods flanking the hive.
      for (const side of [-1, 1]) {
        const pod = createBioPod(2.0);
        pod.position.set(side * 6.2, 0, -11.6);
        pod.rotation.y = side * -0.25;
        group.add(pod);
        helperBox(side * 6.2 - 0.75, 0, -12.35, side * 6.2 + 0.75, 2.3, -10.85);
        practicalLight(0x35d07f, 1.3, 5.5, side * 6.2, 1.5, -11.3, {
          style: 'emergency',
          seed: side * 4.4,
          survivesPowerCut: true,
        });
      }

      // Hazard lamps and a sodium work light at the archway.
      practicalLight(0xff3b30, 1.5, 6.0, -4.2, 4.6, -8.5, {
        style: 'neon',
        seed: 2.7,
        survivesPowerCut: true,
      });
      practicalLight(0xffb160, 1.6, 7.0, 4.5, 3.6, 9.6, {
        style: 'bulb',
        seed: 5.1,
      });
      practicalLight(0x54e0a0, 1.2, 8.0, -3.5, 0.7, -2.5, {
        style: 'emergency',
        seed: 1.9,
        survivesPowerCut: true,
      });

      // Moonlight cutting through monsoon cloud above the courtyard.
      atmosphere.beams!.push({
        position: [-2.5, 3.4, 2.0],
        rotation: [0.16, 0.3, -0.24],
        width: 5.0,
        height: 8.5,
        color: 0x7f9fd0,
        opacity: 0.10,
        pulse: 0.45,
      });

      // Stagnant, spore-heavy air.
      atmosphere.motes!.push({
        count: 520,
        color: 0x8fbf8a,
        size: 0.038,
        center: [0, 2.0, 0],
        bounds: [30, 5.5, 30],
        opacity: 0.30,
        drift: 0.13,
        fall: -0.012,
      });

      // 11. Dengue Arena Spawn Points (Boss emerges from the Hive cave portal)
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

      // 10. Street furniture, lamps and the tangle of Dhaka overhead cables
      const lamp1 = createStreetLamp(5.8);
      lamp1.position.set(-5.6, 0.24, -6.6);
      lamp1.rotation.y = Math.PI / 2;
      group.add(lamp1);
      helperBox(-5.82, 0, -6.85, -5.38, 5.9, -6.35);
      practicalLight(0xffb35e, 2.6, 11.0, -4.7, 5.65, -6.6, {
        style: 'fluorescent',
        seed: 3.3,
      });
      atmosphere.beams!.push({
        position: [-4.85, 3.1, -6.6],
        rotation: [0, 0, 0.09],
        width: 2.6,
        height: 5.6,
        color: 0xffbe73,
        opacity: 0.16,
        pulse: 1.1,
      });

      const lamp2 = createStreetLamp(5.5);
      lamp2.position.set(5.6, 0.24, 5.2);
      lamp2.rotation.y = -Math.PI / 2;
      group.add(lamp2);
      helperBox(5.38, 0, 4.95, 5.82, 5.6, 5.45);
      practicalLight(0xffa94d, 2.2, 10.0, 4.7, 5.35, 5.2, {
        style: 'fluorescent',
        seed: 7.6,
      });
      atmosphere.beams!.push({
        position: [4.85, 2.9, 5.2],
        rotation: [0, 0, -0.08],
        width: 2.4,
        height: 5.2,
        color: 0xffb066,
        opacity: 0.14,
        pulse: 0.9,
      });

      // Striped shop awnings.
      const awning1 = createShopAwning(2.8, 1.25, 0xb91c1c, 0xf5f0e1);
      awning1.position.set(-5.92, 2.75, -8.2);
      awning1.rotation.y = Math.PI / 2;
      group.add(awning1);

      const awning2 = createShopAwning(3.0, 1.3, 0x1d4ed8, 0xf5f0e1);
      awning2.position.set(5.92, 2.9, 8.2);
      awning2.rotation.y = -Math.PI / 2;
      group.add(awning2);

      // Street vendor cart resting by the kerb.
      const cart = createVegetableCart();
      cart.position.set(-4.45, 0.24, 2.2);
      cart.rotation.y = 0.22;
      group.add(cart);
      helperBox(-5.35, 0, 1.35, -3.55, 1.15, 3.05);

      // Debris and monsoon puddles against the gutters.
      const streetDebris = createDebrisPile();
      streetDebris.position.set(4.9, 0.22, -9.6);
      streetDebris.rotation.y = 0.6;
      group.add(streetDebris);

      const puddleMat = new THREE.MeshPhysicalMaterial({
        color: 0x18212c,
        roughness: 0.05,
        metalness: 0.35,
        transparent: true,
        opacity: 0.68,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
      });
      for (const [px, pz, pr] of [
        [-4.1, -1.8, 1.25],
        [2.8, 6.4, 1.7],
        [4.6, -6.2, 1.0],
        [-2.2, 9.4, 1.4],
      ] as [number, number, number][]) {
        const puddle = new THREE.Mesh(new THREE.CircleGeometry(pr, 20), puddleMat);
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(px, 0.028, pz);
        puddle.scale.z = 0.62;
        group.add(puddle);
      }

      // Cables strung from pole to pole and across to the apartments.
      group.add(createOverheadCable(
        new THREE.Vector3(-5.8, 7.8, 7.5),
        new THREE.Vector3(5.8, 7.4, -4.5)
      ));
      group.add(createOverheadCable(
        new THREE.Vector3(-5.9, 7.2, 7.2),
        new THREE.Vector3(-10.1, 8.4, -6.0)
      ));
      group.add(createOverheadCable(
        new THREE.Vector3(5.9, 7.0, -4.8),
        new THREE.Vector3(10.1, 8.6, 7.0)
      ));

      const partyLights = createStringLights(18, 7.2);
      partyLights.position.set(0, 5.4, -1.5);
      partyLights.rotation.y = Math.PI / 2;
      group.add(partyLights);

      // Warm shop interiors and a buzzing sign.
      practicalLight(0xffc06a, 1.7, 7.0, -5.6, 2.2, -8.2, {
        style: 'bulb',
        seed: 4.2,
      });
      practicalLight(0x60a5fa, 1.3, 6.0, 5.7, 2.5, 8.2, {
        style: 'neon',
        seed: 9.1,
      });
      practicalLight(0xff8a4c, 1.5, 5.5, -4.9, 1.9, -0.6, {
        style: 'bulb',
        seed: 1.3,
      });

      // Exhaust haze, road dust and insects around the lamps.
      atmosphere.motes!.push({
        count: 470,
        color: 0xffc58c,
        size: 0.034,
        center: [0, 2.4, 0],
        bounds: [10, 5.0, 34],
        opacity: 0.30,
        drift: 0.2,
        fall: 0.02,
      });
      atmosphere.motes!.push({
        count: 160,
        color: 0xd7e6ff,
        size: 0.024,
        center: [0, 4.6, 0],
        bounds: [12, 3.5, 30],
        opacity: 0.18,
        drift: 0.34,
      });

      // 11. Street Mosquito Spawn Points (Tactical alleyways & rooftops)
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
      atmosphere.flickers!.push({
        light: beaconLight,
        base: 1.8,
        style: 'emergency',
        seed: 1.1,
        survivesPowerCut: true,
      });

      // 4b. Mutation lab machinery ringing the arena.
      const generator = createIndustrialGenerator();
      generator.position.set(11.2, 0, 10.6);
      generator.rotation.y = -0.65;
      group.add(generator);
      helperBox(10.2, 0, 9.6, 12.2, 1.1, 11.6);
      practicalLight(0xff5a3c, 1.4, 7.0, 11.2, 1.6, 10.6, {
        style: 'neon',
        seed: 6.3,
        survivesPowerCut: true,
      });

      for (const side of [-1, 1]) {
        const pod = createBioPod(2.7);
        pod.position.set(side * 10.8, 0, -1.8);
        pod.rotation.y = side * -0.3;
        group.add(pod);
        helperBox(side * 10.8 - 0.8, 0, -2.6, side * 10.8 + 0.8, 3.1, -1.0);
        practicalLight(0x2dd4bf, 1.5, 6.5, side * 10.8, 1.7, -1.4, {
          style: 'emergency',
          seed: side * 2.8,
          survivesPowerCut: true,
        });
      }

      const slabA = createCollapsedSlab();
      slabA.position.set(-11.6, 0, -10.4);
      slabA.rotation.y = 0.5;
      group.add(slabA);
      const slabB = createCollapsedSlab();
      slabB.position.set(11.4, 0, -10.0);
      slabB.rotation.y = -0.7;
      group.add(slabB);

      const hazardBoard = createBiohazardBoard();
      hazardBoard.position.set(-3.0, 2.6, -12.4);
      group.add(hazardBoard);

      for (const [dx, dz] of [[-13.2, 2.0], [13.4, 2.6], [-2.0, -13.4], [8.0, 12.6]] as [number, number][]) {
        const debris = createDebrisPile();
        debris.position.set(dx, 0, dz);
        group.add(debris);
      }

      // Dramatic shafts from the lab ceiling penetrations.
      atmosphere.beams!.push({
        position: [-3.6, 4.0, -2.0],
        rotation: [0.1, 0.25, -0.3],
        width: 4.2,
        height: 9.5,
        color: 0x34d399,
        opacity: 0.10,
        pulse: 0.35,
      });
      atmosphere.beams!.push({
        position: [4.2, 4.2, 3.0],
        rotation: [0.14, -0.35, 0.26],
        width: 3.8,
        height: 9.0,
        color: 0xa855f7,
        opacity: 0.08,
        pulse: 0.28,
      });

      // Spore-laden cavern air (spore puffs are added by GameCanvas).
      atmosphere.motes!.push({
        count: 620,
        color: 0x5eead4,
        size: 0.042,
        center: [0, 2.4, 0],
        bounds: [34, 6.5, 34],
        opacity: 0.32,
        drift: 0.16,
        fall: -0.01,
      });
      atmosphere.motes!.push({
        count: 220,
        color: 0xc084fc,
        size: 0.03,
        center: [0, 4.0, 0],
        bounds: [32, 5.0, 32],
        opacity: 0.18,
        drift: 0.24,
      });

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
    atmosphere,
    spawnPoints,
    playerStart,
  };
}

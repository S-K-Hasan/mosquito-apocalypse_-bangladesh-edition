import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  WeaponType,
  EnemyType,
  EnemyInstance,
  PlacedCoil,
  SearchableContainer,
  LevelConfig,
  PlayerStats,
  GameSubtitle,
} from '../types/game';
import { INITIAL_WEAPONS } from '../systems/weapons';
import { soundManager } from '../systems/audio';
import { voiceManager } from '../systems/voiceManager';
import { ParticleSystem } from '../systems/particles';
import { buildLevelEnvironment } from '../levels/environmentBuilder';
import { createWeaponModel, createMosquitoModel, optimizeModelDrawCalls, WEAPON_VIEWMODEL_RIGS } from '../systems/models';
import { MobileInputState } from './MobileControls';
import { applyLightingPreset, LightingPresetId } from '../systems/lightingPresets';
import { createAtmosphere } from '../systems/atmosphere';
import { mergeStaticEnvironment } from '../systems/sceneOptimizer';
import { isLowPowerDevice } from '../utils/device';

interface MosquitoNodes {
  leftWing?: THREE.Object3D | null;
  rightWing?: THREE.Object3D | null;
  leftRearWing?: THREE.Object3D | null;
  rightRearWing?: THREE.Object3D | null;
  leftLegs?: THREE.Object3D | null;
  rightLegs?: THREE.Object3D | null;
  abdomen?: THREE.Object3D | null;
  bossThorax?: THREE.Object3D | null;
  bossWeakPoint?: THREE.Object3D | null;
  midnightLantern?: THREE.Object3D | null;
  venomDrop?: THREE.Object3D | null;
  invisibleBioCore?: THREE.Object3D | null;
  bossAuraLight?: THREE.Object3D | null;
  camouflageMaterials?: THREE.MeshPhysicalMaterial[];
}

/**
 * Building a mosquito from scratch allocates dozens of geometries. A cloned
 * template shares those geometries/materials, so spawning a swarm is cheap and
 * the node lookups the animation loop needs are cached once per enemy.
 */
const MOSQUITO_TEMPLATES = new Map<EnemyType, THREE.Group>();

/** Dispose unique GPU resources (used for placed coils; shared models are kept). */
function disposeObject3D(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!material) continue;
      const mat = material as THREE.MeshStandardMaterial;
      mat.map?.dispose();
      mat.normalMap?.dispose();
      mat.roughnessMap?.dispose();
      mat.metalnessMap?.dispose();
      mat.alphaMap?.dispose();
      mat.emissiveMap?.dispose();
      mat.dispose();
    }
  });
}

function createEnemyMesh(type: EnemyType): THREE.Group {
  let template = MOSQUITO_TEMPLATES.get(type);
  if (!template) {
    template = createMosquitoModel(type);
    optimizeModelDrawCalls(template);
    MOSQUITO_TEMPLATES.set(type, template);
  }

  const mesh = template.clone(true) as THREE.Group;
  const find = (name: string) => mesh.getObjectByName(name);
  const camouflageMaterials: THREE.MeshPhysicalMaterial[] = [];

  if (type === 'boss_invisible') {
    mesh.traverse((child) => {
      const asMesh = child as THREE.Mesh;
      if (!asMesh.isMesh) return;
      const materials = Array.isArray(asMesh.material) ? asMesh.material : [asMesh.material];
      for (const mat of materials) {
        const physical = mat as THREE.MeshPhysicalMaterial;
        if (physical && physical.transmission !== undefined && !camouflageMaterials.includes(physical)) {
          camouflageMaterials.push(physical);
        }
      }
    });
  }

  const nodes: MosquitoNodes = {
    leftWing: find('leftWing'),
    rightWing: find('rightWing'),
    leftRearWing: find('leftRearWing'),
    rightRearWing: find('rightRearWing'),
    leftLegs: find('leftLegs'),
    rightLegs: find('rightLegs'),
    abdomen: find('abdomen'),
    bossThorax: find('bossThorax'),
    bossWeakPoint: find('bossWeakPoint'),
    midnightLantern: find('midnightLantern'),
    venomDrop: find('venomDrop'),
    invisibleBioCore: find('invisibleBioCore'),
    bossAuraLight: find('bossAuraLight'),
    camouflageMaterials,
  };
  mesh.userData.enemyNodes = nodes;
  return mesh;
}


interface GameCanvasProps {
  level: LevelConfig;
  playerStats: PlayerStats;
  currentWeapon: WeaponType;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onObjectiveUpdate: (objectiveId: string, progress?: number, isCompleted?: boolean) => void;
  onShowSubtitle: (sub: GameSubtitle) => void;
  onGameOver: (reason: string) => void;
  onVictory: (stats: { kills: number; time: number; score: number }) => void;
  onPowerCutStateChange: (isPowerCut: boolean) => void;
  onBossHealthChange: (boss: { name: string; health: number; maxHealth: number } | null) => void;
  onHitmarker: () => void;
  onCanInteractChange: (canInteract: boolean, prompt?: string) => void;
  mobileInputRef: React.MutableRefObject<MobileInputState>;
  mouseSensitivity: number;
  isPaused: boolean;
  attackTriggerRef: React.MutableRefObject<{
    primary: () => void;
    secondary: () => void;
    interact: () => void;
    toggleFlashlight: () => void;
  } | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  playerStats,
  currentWeapon,
  onUpdateStats,
  onObjectiveUpdate,
  onShowSubtitle,
  onGameOver,
  onVictory,
  onPowerCutStateChange,
  onBossHealthChange,
  onHitmarker,
  onCanInteractChange,
  mobileInputRef,
  mouseSensitivity,
  isPaused,
  attackTriggerRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to keep state in sync across requestAnimationFrame without tearing down Three.js canvas
  const stateRef = useRef({
    currentWeapon,
    playerStats,
    isPaused,
    mouseSensitivity,
    level,
    mobileInputRef,
  });

  stateRef.current = {
    currentWeapon,
    playerStats,
    isPaused,
    mouseSensitivity,
    level,
    mobileInputRef,
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // NOTE: AudioContext is deliberately NOT unlocked here. Chrome only allows
    // it to start inside a genuine gesture; App.tsx and the pointer handlers
    // below handle that. Unlocking on mount produced a silent first line.

    // Setup software WebGL probe per directives
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Quality tier: never removes gameplay, only caps GPU cost. The adaptive
    // loop below can lower the pixel ratio further if measured frames slow down.
    const isLowPower = isLowPowerDevice();
    const nativeDpr = window.devicePixelRatio || 1;
    const maxPixelRatio = isSoftwareGl ? 1 : isLowPower ? Math.min(nativeDpr, 1.25) : Math.min(nativeDpr, 1.5);
    let activePixelRatio = maxPixelRatio;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(level.skyColor);
    scene.fog = new THREE.FogExp2(level.fogColor, level.fogDensity);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 120);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl && !isLowPower,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(activePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = !isSoftwareGl;
    // PCFSoftShadowMap costs a second blur pass per shadow map. Mid-range
    // phones keep contact shadows with the cheaper PCF filter.
    renderer.shadowMap.type = isLowPower ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // ------------------------------------------------------------------
    // Reliable viewport resizing. ResizeObserver covers fullscreen, browser
    // toolbar collapse, split-screen and CSS layout changes; window resize and
    // orientationchange are added for older mobile browsers. Work is
    // coalesced into one animation frame so a burst of events resizes once.
    // ------------------------------------------------------------------
    let resizeFrame = 0;
    let lastWidth = width;
    let lastHeight = height;
    let particleSystemRef: ParticleSystem | null = null;

    const applyViewportSize = (force = false) => {
      resizeFrame = 0;
      const el = containerRef.current;
      if (!el) return;

      const w = Math.max(1, Math.round(el.clientWidth || window.innerWidth));
      const h = Math.max(1, Math.round(el.clientHeight || window.innerHeight));
      const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, activePixelRatio));

      if (force || Math.abs(renderer.getPixelRatio() - dpr) > 0.001) {
        renderer.setPixelRatio(dpr);
        particleSystemRef?.setPixelRatio(dpr);
      }

      if (force || w !== lastWidth || h !== lastHeight) {
        lastWidth = w;
        lastHeight = h;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };

    const scheduleResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => applyViewportSize(false));
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => scheduleResize())
        : null;
    resizeObserver?.observe(containerRef.current);
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
    window.visualViewport?.addEventListener('resize', scheduleResize);
    document.addEventListener('fullscreenchange', scheduleResize);
    document.addEventListener('webkitfullscreenchange', scheduleResize);
    applyViewportSize(true);

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Global Lighting Rig from presets system (Balanced ambient, directional key, fill, and soft shadows)
    const presetId: LightingPresetId = level.lightingPreset || 'indoor_nighttime';
    const lightingRig = applyLightingPreset(scene, presetId, isSoftwareGl, isLowPower);
    renderer.toneMappingExposure = lightingRig.config.exposure;

    // Flashlight (Player attached spot light with realistic cone and falloff)
    const flashlight = new THREE.SpotLight(0xffffff, 2.8, 18, Math.PI / 4.5, 0.35, 1.2);
    flashlight.position.set(0, 0, 0);
    const flashTarget = new THREE.Object3D();
    flashTarget.position.set(0, 0, -5);
    camera.add(flashlight);
    camera.add(flashTarget);
    flashlight.target = flashTarget;
    flashlight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      const shadowSize = isLowPower ? 512 : 1024;
      flashlight.shadow.mapSize.width = shadowSize;
      flashlight.shadow.mapSize.height = shadowSize;
      flashlight.shadow.bias = -0.0005;
      flashlight.shadow.camera.near = 0.2;
      flashlight.shadow.camera.far = 18;
    }
    flashlight.visible = playerStats.flashlightOn;
    scene.add(camera);

    // Build Environment
    const builtEnv = buildLevelEnvironment(level.id);
    // Static scenery is merged by material: hundreds of prop meshes become a
    // handful of draw calls. Animated nodes stay separate.
    const optimizeStats = mergeStaticEnvironment(builtEnv.environmentGroup, [
      builtEnv.ceilingFanBladeGroup,
      builtEnv.giantMosquitoShadowMesh,
    ]);
    if (import.meta.env.DEV) {
      console.log(
        `[Perf] merged static scenery: ${optimizeStats.meshesBefore} → ${optimizeStats.meshesAfter} meshes (${optimizeStats.mergedMeshes} merged)`
      );
    }
    scene.add(builtEnv.environmentGroup);
    camera.position.set(builtEnv.playerStart[0], builtEnv.playerStart[1], builtEnv.playerStart[2]);

    // For Level 6 (The Final Night - Apocalyptic Boss Arena), add dual dramatic atmospheric rim lights
    if (level.id === 6) {
      const bioRimLight = new THREE.DirectionalLight(0x10b981, 1.4);
      bioRimLight.position.set(-15, 12, -10);
      scene.add(bioRimLight);

      const dreadRimLight = new THREE.DirectionalLight(0x9333ea, 1.2);
      dreadRimLight.position.set(15, 14, 12);
      scene.add(dreadRimLight);
    }

    // Ceiling fan audio & loop if bedroom
    if (level.id === 1 && builtEnv.ceilingFanBladeGroup) {
      soundManager.startCeilingFan();
    }

    // Particle System
    const particles = new ParticleSystem(scene);
    particleSystemRef = particles;
    particles.setPixelRatio(renderer.getPixelRatio());

    // Per-level volumetric air (dust, moonbeams, flickering practicals).
    const atmosphere = createAtmosphere(builtEnv.atmosphere, scene);

    // Ergonomic weapon rig attached to the camera. Each weapon has its own
    // lower-right rest pose so the reticle and screen centre stay clear.
    const weaponContainer = new THREE.Group();
    const initialRig = WEAPON_VIEWMODEL_RIGS[currentWeapon];
    weaponContainer.position.set(...initialRig.position);
    weaponContainer.rotation.set(...initialRig.rotation);
    camera.add(weaponContainer);

    let activeWeaponMesh: THREE.Group | null = null;
    let currentRenderedWeapon: WeaponType | null = null;
    let weaponSwitchProgress = 1.0;
    let targetWeaponType: WeaponType | null = null;

    const updateWeaponMesh = (wType: WeaponType) => {
      if (currentRenderedWeapon === wType && activeWeaponMesh) return;
      if (activeWeaponMesh) weaponContainer.remove(activeWeaponMesh);
      activeWeaponMesh = createWeaponModel(wType);
      weaponContainer.add(activeWeaponMesh);
      currentRenderedWeapon = wType;
    };

    updateWeaponMesh(currentWeapon);

    // Game state tracking
    const enemies: { instance: EnemyInstance; mesh: THREE.Group }[] = [];
    const placedCoils: { data: PlacedCoil; mesh: THREE.Group }[] = [];
    let searchableContainers: SearchableContainer[] = [...builtEnv.searchables];

    // Dev-only inspection hook used by automated visual/perf checks. It is
    // compiled out of production builds and never exposed to players.
    if (import.meta.env.DEV) {
      (window as unknown as { __MOSQUITO_DEBUG__?: unknown }).__MOSQUITO_DEBUG__ = {
        THREE,
        scene,
        camera,
        renderer,
        weaponContainer,
        enemies,
        builtEnv,
        get spawnEnemy() {
          return spawnEnemy;
        },
        get activeWeaponMesh() {
          return activeWeaponMesh;
        },
      };
    }

    // Player Kinematics
    const playerVel = new THREE.Vector3();
    const keysPressed: Record<string, boolean> = {};
    let isGrounded = true;
    let cameraPitch = 0;
    let cameraYaw = 0;
    let walkBobTimer = 0;
    let damageShake = 0;
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    let isAttacking = false;
    let attackTimer = 0;
    let attackType: 'primary' | 'secondary' = 'primary';
    let comboCount = 0;
    let lastAttackTime = 0;
    let giantMosquitoVoicePlayed = false;
    let lastMissVoiceTime = 0;
    let lastMosquitoTauntTime = 0;
    let lastInteractionCan: boolean | null = null;
    let lastInteractionPrompt = '';
    let buzzUpdateTimer = 0;

    // Scratch vectors reused by the per-frame enemy loop. Avoids several
    // hundred short-lived Vector3 allocations per second during swarms.
    const scratchToPlayer = new THREE.Vector3();
    const scratchToDir = new THREE.Vector3();
    const scratchPerp = new THREE.Vector3();
    const scratchCamDir = new THREE.Vector3();
    const scratchBehind = new THREE.Vector3();
    const scratchOrbit = new THREE.Vector3();

    // Power Cut (Load Shedding) State & 9-Step Cinematic Sequence
    let isPowerCut = false;
    let powerCutPhase: 'normal' | 'flickering' | 'blackout' = 'normal';
    let powerCutFlickerTimer = 0;
    const POWER_CUT_FLICKER_DURATION = 1.8;
    let powerCutTimer = 0;
    let nextPowerCutIn = level.hasPowerCuts ? 18 + Math.random() * 20 : 999999;
    let fanBladeSpeed = 12.0;

    // Boss State & Multi-Boss Trio Tracking
    let activeBoss: EnemyInstance | null = null;
    let bossMesh: THREE.Group | null = null;
    let bossAttackTimer = 0;

    const getLivingBosses = () => enemies.filter((e) => e.instance.isBoss && e.instance.state !== 'dead');

    const updateBossHealthHud = (priorityInstance?: EnemyInstance) => {
      const living = getLivingBosses();
      if (living.length === 0) {
        onBossHealthChange(null);
        return;
      }

      // Priority instance if still alive, else first living boss
      const target = (priorityInstance && priorityInstance.state !== 'dead')
        ? priorityInstance
        : living[0].instance;

      let bTitle = target.type === 'boss_dengue'
        ? '👑 Dengue King (ডেঙ্গু রাজা)'
        : target.type === 'boss_midnight'
        ? '🦇 Midnight Mosquito (ড্রাকুলা মশা)'
        : '☣️ The Invisible Apex (অদৃশ্য দানব)';

      if (living.length > 1) {
        bTitle = `[TRIO ${living.length} ALIVE] ${bTitle}`;
      }

      onBossHealthChange({
        name: bTitle,
        health: Math.max(0, target.health),
        maxHealth: target.maxHealth,
      });
    };

    // Wave spawning state
    let currentWaveIdx = 0;
    let spawnTimer = 0;
    let waveEnemiesSpawned = 0;
    let levelCompleted = false;
    let gameStartTime = Date.now();

    // Initial Bangladeshi humor voice intro
    setTimeout(() => {
      voiceManager.triggerEvent('player_damage');
    }, 1000);

    // ==========================================
    // SPAWNING SYSTEM
    // ==========================================

    const spawnEnemy = (type: EnemyType, isBoss = false) => {
      const spIdx = Math.floor(Math.random() * builtEnv.spawnPoints.length);
      const spawnP = builtEnv.spawnPoints[spIdx] || [0, 2, -4];
      const startPos: [number, number, number] = [
        spawnP[0] + (Math.random() - 0.5) * 1.5,
        spawnP[1] + (Math.random() - 0.5) * 0.8,
        spawnP[2] + (Math.random() - 0.5) * 1.5,
      ];

      const mesh = createEnemyMesh(type);
      mesh.position.set(...startPos);
      scene.add(mesh);

      if (isBoss) {
        // Cinematic materialisation: the boss swells out of the hive rather
        // than popping into existence at full size.
        mesh.userData.entranceT = 0;
        mesh.scale.setScalar(0.08);
      }

      let hp = 30;
      let spd = 2.4;
      let dmg = 8;
      let subType: 'fast' | 'armored' | 'sneaky' | 'swarm' | 'elite' = 'fast';

      if (type === 'giant') {
        hp = 95; spd = 1.6; dmg = 18;
        subType = 'armored';
        if (!giantMosquitoVoicePlayed) {
          giantMosquitoVoicePlayed = true;
          voiceManager.triggerEvent('player_giant_seen');
          voiceManager.triggerEvent('mosquito_giant');
        }
      } else if (type === 'stealth') {
        hp = 45; spd = 2.8; dmg = 12;
        subType = 'sneaky';
        voiceManager.triggerEvent('mosquito_stealth');
      } else if (type === 'swarm') {
        hp = 20; spd = 3.2; dmg = 5;
        subType = 'swarm';
        voiceManager.triggerEvent('mosquito_swarm');
      } else if (type.startsWith('boss')) {
        subType = 'elite';
        if (type === 'boss_dengue') {
          hp = level.id === 6 ? 600 : (level.boss?.maxHealth || 450);
          spd = 2.0; dmg = 26;
        } else if (type === 'boss_midnight') {
          hp = level.id === 6 ? 500 : (level.boss?.maxHealth || 600);
          spd = 2.4; dmg = 28;
        } else if (type === 'boss_invisible') {
          hp = level.id === 6 ? 850 : (level.boss?.maxHealth || 750);
          spd = 2.6; dmg = 32;
        }
      }

      const instance: EnemyInstance = {
        id: Math.random().toString(),
        type,
        subType,
        meshIndex: enemies.length,
        position: startPos,
        rotation: [0, 0, 0],
        health: hp,
        maxHealth: hp,
        speed: spd,
        damage: dmg,
        state: 'chasing',
        wingAngle: 0,
        hoverOffset: Math.random() * Math.PI * 2,
        stealthOpacity: type === 'stealth' ? 0.4 : 1.0,
        attackCooldown: 1.0,
        targetPos: [camera.position.x, camera.position.y, camera.position.z],
        isBoss,
        specialAttackTimer: Math.random() * 2.5,
        strafeDir: Math.random() > 0.5 ? 1 : -1,
        strafeTimer: Math.random() * 0.8,
        diveTimer: 0,
        diveBoost: 1.0,
      };

      enemies.push({ instance, mesh });

      if (isBoss) {
        activeBoss = instance;
        bossMesh = mesh;
        updateBossHealthHud(instance);

        // Dramatic Boss Entrance: Sonic roar, screen shake, floating title banner
        soundManager.playBossRoar(type === 'boss_dengue' ? 1.4 : 1.5);
        damageShake = 0.85;

        const bannerText = type === 'boss_dengue'
          ? '👑 DENGUE KING AWAKENS! (ডেঙ্গু রাজা আসছে!)'
          : type === 'boss_midnight'
          ? '🦇 MIDNIGHT DRACULA EMERGES! (ড্রাকুলা মশা আসছে!)'
          : '☣️ THE INVISIBLE APEX AWAKENS! (অদৃশ্য দানব আসছে!)';

        particles.addFloatingText(
          [camera.position.x, camera.position.y + 0.6, camera.position.z],
          bannerText,
          type === 'boss_invisible' ? '#10b981' : type === 'boss_midnight' ? '#c084fc' : '#ef4444'
        );

        if (type === 'boss_dengue') {
          particles.emitPoisonShockwave(mesh.position);
          voiceManager.triggerEvent('boss_dengue_intro', true);
        } else if (type === 'boss_midnight') {
          voiceManager.triggerEvent('boss_midnight_intro', true);
        } else if (type === 'boss_invisible') {
          voiceManager.triggerEvent('boss_invisible_intro', true);
        }
      }
    };

    // ==========================================
    // INPUT HANDLING & POINTER LOCK
    // ==========================================

    const handlePointerLock = () => {
      soundManager.unlock();
      voiceManager.unlock();
      if (document.pointerLockElement !== renderer.domElement) {
        try {
          const request = renderer.domElement.requestPointerLock?.() as
            | Promise<void>
            | undefined;
          // Chrome returns a promise; a denied request must not surface as an
          // uncaught page error (for example when the tab is not focused).
          if (request && typeof request.catch === 'function') {
            request.catch(() => {
              console.warn('[Input] Pointer lock was not granted; mouse-look paused.');
            });
          }
        } catch (err) {
          console.warn('[Input] Pointer lock request failed:', err);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      const sens = 0.0022 * stateRef.current.mouseSensitivity;
      cameraYaw -= e.movementX * sens;
      cameraPitch -= e.movementY * sens;
      cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;

      if (e.code === 'KeyF') {
        toggleFlashlight();
      }

      if (e.code === 'KeyE') {
        handleInteract();
      }

      if (e.code === 'KeyQ') {
        triggerAttack('secondary');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      handlePointerLock();
      if (e.button === 0) {
        triggerAttack('primary');
      } else if (e.button === 2) {
        e.preventDefault();
        triggerAttack('secondary');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      const order: WeaponType[] = ['racket', 'newspaper', 'coil', 'fan', 'spray'];
      const curIdx = order.indexOf(stateRef.current.currentWeapon);
      const nextIdx = e.deltaY > 0 ? (curIdx + 1) % order.length : (curIdx - 1 + order.length) % order.length;
      updateWeaponMesh(order[nextIdx]);
    };

    renderer.domElement.addEventListener('click', handlePointerLock);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    renderer.domElement.addEventListener('wheel', handleWheel);

    const toggleFlashlight = () => {
      onUpdateStats((prev) => {
        const nextVal = !prev.flashlightOn;
        flashlight.visible = nextVal;
        soundManager.playCoilPlace();
        return { ...prev, flashlightOn: nextVal };
      });
      onObjectiveUpdate('locate_flashlight', 1, true);
    };

    // ==========================================
    // INTERACTION (Fuse Box & Searchables)
    // ==========================================

    const handleInteract = () => {
      const playerPos = camera.position;

      // 1. Fuse Box reset during power cut
      if (level.fuseBoxPosition) {
        const fbDist = playerPos.distanceTo(new THREE.Vector3(...level.fuseBoxPosition));
        if (fbDist < 2.5) {
          if (isPowerCut || powerCutPhase === 'flickering') {
            isPowerCut = false;
            powerCutPhase = 'normal';
            powerCutTimer = 0;
            nextPowerCutIn = 35 + Math.random() * 25;
            onPowerCutStateChange(false);
            soundManager.playFuseReset();
            particles.emitSparks(new THREE.Vector3(...level.fuseBoxPosition), 25, true);
            lightingRig.setPowerCutMode(false);
            atmosphere.setPowerCut(false);
            if (level.id === 1 && builtEnv.ceilingFanBladeGroup) {
              soundManager.startCeilingFan();
            }

            voiceManager.triggerEvent('player_kill', true);

            onUpdateStats((prev) => ({
              ...prev,
              powerCutsSurvived: prev.powerCutsSurvived + 1,
            }));
            onObjectiveUpdate('survive_powercut', 1, true);
            onObjectiveUpdate('reset_main_breaker', 1, true);
            return;
          } else {
            particles.addFloatingText(level.fuseBoxPosition, 'Fuse OK (লাইন চালু আছে)', '#38bdf8');
          }
        }
      }

      // 2. Searchable Containers
      for (let s of searchableContainers) {
        if (!s.searched) {
          const sDist = playerPos.distanceTo(new THREE.Vector3(...s.position));
          if (sDist < 2.2) {
            s.searched = true;
            soundManager.playPickup();

            if (s.itemGiven) {
              const item = s.itemGiven;
              particles.addFloatingText(s.position, `+${item.amount} ${item.name}`, '#22c55e');

              onUpdateStats((prev) => {
                let next = { ...prev };
                if (item.type === 'health') {
                  next.health = Math.min(prev.maxHealth, prev.health + item.amount);
                } else if (item.type === 'ammo_coil') {
                  next.coilsInInventory = prev.coilsInInventory + item.amount;
                } else if (item.type === 'ammo_spray') {
                  next.sprayAmmo = Math.min(prev.maxSprayAmmo, prev.sprayAmmo + item.amount);
                } else if (item.type === 'battery') {
                  next.racketBattery = Math.min(100, prev.racketBattery + item.amount);
                }
                return next;
              });

              onObjectiveUpdate('search_room', 1);
            }
            break;
          }
        }
      }
    };

    // ==========================================
    // COMBAT & ATTACK EXECUTION
    // ==========================================

    const triggerAttack = (type: 'primary' | 'secondary') => {
      const curW = stateRef.current.currentWeapon;
      const wData = INITIAL_WEAPONS[curW];
      const now = performance.now();

      if (now - lastAttackTime < wData.cooldown * 1000) return;
      lastAttackTime = now;

      isAttacking = true;
      attackTimer = 0;
      attackType = type;

      const playerPos = camera.position;
      const forwardDir = new THREE.Vector3();
      camera.getWorldDirection(forwardDir);

      if (curW === 'racket') {
        const isCharged = type === 'secondary';
        soundManager.playRacketZap(isCharged);

        if (isCharged) {
          voiceManager.triggerEvent('player_weapon_racket');
        }

        const zapOrigin = playerPos.clone().add(forwardDir.clone().multiplyScalar(1.2));
        particles.emitSparks(zapOrigin, isCharged ? 35 : 18, isCharged);

        const attackRadius = isCharged ? 5.5 : 2.8;
        let hits = 0;

        enemies.forEach(({ instance, mesh }) => {
          if (instance.state === 'dead') return;
          const dist = playerPos.distanceTo(mesh.position);
          const toEnemy = mesh.position.clone().sub(playerPos).normalize();
          const angle = forwardDir.angleTo(toEnemy);

          if (dist <= attackRadius && (isCharged || angle < Math.PI / 3)) {
            const dmg = isCharged ? 120 : 45;
            applyDamageToEnemy(instance, mesh, dmg, forwardDir.clone().multiplyScalar(isCharged ? 7 : 4));
            hits++;
          }
        });

        if (hits > 0) {
          comboCount += hits;
          onHitmarker();
          particles.addFloatingText([zapOrigin.x, zapOrigin.y, zapOrigin.z], `ZAP! x${hits} (${comboCount} COMBO)`, '#60a5fa');
        } else {
          // Miss reaction: triggers signature dialogue "ধুর শালার বেটা মশা, তোরে আমি খাইসি!"
          if (now - lastMissVoiceTime > 5500) {
            lastMissVoiceTime = now;
            if (Math.random() < 0.6) {
              voiceManager.triggerEvent('player_attack_signature');
            } else {
              voiceManager.triggerEvent('player_attack_miss');
            }
          }
        }
      } else if (curW === 'newspaper') {
        soundManager.playNewspaperSlap();
        const slapOrigin = playerPos.clone().add(forwardDir.clone().multiplyScalar(1.0));
        particles.emitSlapImpact(slapOrigin);

        if (type === 'secondary') {
          voiceManager.triggerEvent('player_weapon_newspaper');
        }

        const attackRadius = type === 'secondary' ? 4.0 : 2.4;
        let hits = 0;
        enemies.forEach(({ instance, mesh }) => {
          if (instance.state === 'dead') return;
          const dist = playerPos.distanceTo(mesh.position);
          const toEnemy = mesh.position.clone().sub(playerPos).normalize();
          const angle = forwardDir.angleTo(toEnemy);

          if (dist <= attackRadius && (type === 'secondary' || angle < Math.PI / 2.5)) {
            const knockForce = forwardDir.clone().multiplyScalar(type === 'secondary' ? 9.0 : 5.5);
            applyDamageToEnemy(instance, mesh, type === 'secondary' ? 65 : 35, knockForce);
            hits++;
            particles.addFloatingText([mesh.position.x, mesh.position.y, mesh.position.z], 'THWACK! (ঠাস্স!)', '#facc15');
          }
        });
        if (hits > 0) {
          onHitmarker();
        } else {
          // Miss reaction for newspaper swat
          if (now - lastMissVoiceTime > 5500) {
            lastMissVoiceTime = now;
            if (Math.random() < 0.6) {
              voiceManager.triggerEvent('player_attack_signature');
            } else {
              voiceManager.triggerEvent('player_attack_miss');
            }
          }
        }
      } else if (curW === 'coil') {
        if (stateRef.current.playerStats.coilsInInventory > 0) {
          onUpdateStats((prev) => ({ ...prev, coilsInInventory: prev.coilsInInventory - 1 }));
          soundManager.playCoilPlace();
          voiceManager.triggerEvent('player_weapon_coil');

          const coilPos: [number, number, number] = [playerPos.x + forwardDir.x * 1.2, 0.05, playerPos.z + forwardDir.z * 1.2];
          const coilMesh = createWeaponModel('coil');
          coilMesh.position.set(...coilPos);
          scene.add(coilMesh);

          const newCoil: PlacedCoil = {
            id: Math.random().toString(),
            position: coilPos,
            radius: 5.0,
            remainingTime: 35.0,
            totalTime: 35.0,
          };
          placedCoils.push({ data: newCoil, mesh: coilMesh });
          particles.addFloatingText(coilPos, 'Coil Burning! (ধোঁয়া ছড়াচ্ছে)', '#4ade80');
          onObjectiveUpdate('place_smoke_defenses', 1);
        } else {
          particles.addFloatingText([playerPos.x, playerPos.y, playerPos.z], 'No Coils Left! (কয়েল শেষ!)', '#ef4444');
          voiceManager.triggerEvent('player_ammo_empty');
        }
      } else if (curW === 'fan') {
        soundManager.playFanBlast();
        if (type === 'secondary') voiceManager.triggerEvent('player_weapon_fan');

        const fanOrigin = playerPos.clone().add(forwardDir.clone().multiplyScalar(0.8));
        particles.emitFanWind(fanOrigin, forwardDir, type === 'secondary' ? 22 : 12);

        let hits = 0;
        enemies.forEach(({ instance, mesh }) => {
          if (instance.state === 'dead') return;
          const dist = playerPos.distanceTo(mesh.position);
          const toEnemy = mesh.position.clone().sub(playerPos).normalize();
          const angle = forwardDir.angleTo(toEnemy);

          if (dist <= 6.5 && angle < Math.PI / 3) {
            const windPush = forwardDir.clone().multiplyScalar(type === 'secondary' ? 12 : 7);
            applyDamageToEnemy(instance, mesh, type === 'secondary' ? 45 : 25, windPush);
            hits++;
            particles.addFloatingText([mesh.position.x, mesh.position.y, mesh.position.z], 'BLOWN AWAY! (উড়ায় দিল!)', '#38bdf8');
          }
        });
        if (hits > 0) onHitmarker();
      } else if (curW === 'spray') {
        if (stateRef.current.playerStats.sprayAmmo > 0) {
          const drain = type === 'secondary' ? 25 : 8;
          onUpdateStats((prev) => ({ ...prev, sprayAmmo: Math.max(0, prev.sprayAmmo - drain) }));
          soundManager.playSprayHiss(type === 'secondary' ? 0.4 : 0.2);
          if (type === 'secondary') voiceManager.triggerEvent('player_weapon_spray');

          const sprayOrigin = playerPos.clone().add(forwardDir.clone().multiplyScalar(0.7));
          particles.emitSprayMist(sprayOrigin, forwardDir, type === 'secondary' ? 18 : 8);

          let hits = 0;
          enemies.forEach(({ instance, mesh }) => {
            if (instance.state === 'dead') return;
            const dist = playerPos.distanceTo(mesh.position);
            const toEnemy = mesh.position.clone().sub(playerPos).normalize();
            const angle = forwardDir.angleTo(toEnemy);

            if (dist <= 4.8 && angle < Math.PI / 3.5) {
              const poisonDmg = type === 'secondary' ? 70 : 40;
              applyDamageToEnemy(instance, mesh, poisonDmg, forwardDir.clone().multiplyScalar(1.5));
              hits++;
              particles.addFloatingText([mesh.position.x, mesh.position.y, mesh.position.z], 'HIT SPRAY! (বিষাক্ত গ্যাস!)', '#facc15');
            }
          });
          if (hits > 0) onHitmarker();
        } else {
          particles.addFloatingText([playerPos.x, playerPos.y, playerPos.z], 'Spray Empty! (স্প্রে খালি!)', '#ef4444');
          voiceManager.triggerEvent('player_ammo_empty');
        }
      }
    };

    // Attach attack triggers for Mobile touch buttons
    attackTriggerRef.current = {
      primary: () => triggerAttack('primary'),
      secondary: () => triggerAttack('secondary'),
      interact: handleInteract,
      toggleFlashlight: toggleFlashlight,
    };

    const applyDamageToEnemy = (
      instance: EnemyInstance,
      mesh: THREE.Group,
      dmg: number,
      knockback?: THREE.Vector3
    ) => {
      // Armored enemy class chitin resistance
      const finalDmg = instance.subType === 'armored' ? Math.max(1, Math.round(dmg * 0.75)) : dmg;
      instance.health -= finalDmg;

      if (knockback) {
        const forceMult = instance.subType === 'armored' ? 0.15 : 0.3;
        mesh.position.add(knockback.clone().multiplyScalar(forceMult));
      }

      // Hit reaction is read by the animation loop to make impacts land.
      mesh.userData.hitT = instance.isBoss ? 0.28 : 0.14;

      if (instance.isBoss) {
        updateBossHealthHud(instance);

        // Boss Rage Mode Transition (< 40% health)
        if (instance.health <= instance.maxHealth * 0.4 && !instance.isRageMode) {
          instance.isRageMode = true;
          instance.speed *= 1.35;
          damageShake = 0.65;
          soundManager.playBossRoar(1.5);
          const rageBanner = instance.type === 'boss_dengue'
            ? '⚡ DENGUE KING ENRAGED! (রাজা ক্ষিপ্ত!) ⚡'
            : instance.type === 'boss_midnight'
            ? '🦇 MIDNIGHT DRACULA ENRAGED! (ড্রাকুলা উন্মাদ!) 🦇'
            : '☣️ APEX MUTANT ENRAGED! (দানব অতি-ক্ষিপ্র!) ☣️';
          particles.addFloatingText(
            [camera.position.x, camera.position.y + 0.45, camera.position.z],
            rageBanner,
            '#f59e0b'
          );
          particles.emitPoisonShockwave(mesh.position);
          voiceManager.triggerEvent('boss_dengue_attack', true);
        }
      }

      if (instance.health <= 0 && instance.state !== 'dead') {
        instance.state = 'dead';
        particles.emitMosquitoDeath(mesh.position, instance.isBoss);

        if (instance.isBoss) {
          particles.emitSparks(mesh.position, 45, true);
          damageShake = 0.9;
        }

        onUpdateStats((prev) => ({
          ...prev,
          kills: prev.kills + 1,
          score: prev.score + (instance.isBoss ? 2000 : 150),
        }));

        // Objectives check across all 6 levels
        if (instance.type === 'normal') onObjectiveUpdate('defeat_wave', 1);
        if (instance.type === 'stealth') onObjectiveUpdate('defeat_stealth', 1);
        if (instance.type === 'giant') onObjectiveUpdate('defend_rooftop', 1);
        if (instance.type === 'swarm') onObjectiveUpdate('clear_guard_swarms', 1);
        if (level.id === 3) onObjectiveUpdate('defend_rooftop', 1);
        if (level.id === 5) onObjectiveUpdate('clear_street_enemies', 1);
        if (level.id === 6) onObjectiveUpdate('destroy_mutation_eggs', 1);
        if (instance.type === 'boss_dengue') onObjectiveUpdate('defeat_dengue_boss', 1, true);
        if (instance.type === 'boss_midnight') onObjectiveUpdate('defeat_midnight_boss', 1, true);
        if (instance.type === 'boss_invisible') onObjectiveUpdate('defeat_invisible_boss', 1, true);

        // Audible player Bengali reaction voice line
        voiceManager.triggerEvent('player_kill');

        // Check if boss died
        if (instance.isBoss) {
          if (instance.type === 'boss_dengue') {
            voiceManager.triggerEvent('boss_dengue_defeat', true);
            particles.emitPoisonShockwave(mesh.position);
            particles.addFloatingText([mesh.position.x, mesh.position.y + 0.8, mesh.position.z], 'DENGUE KING SLAIN! (ডেঙ্গু রাজা খতম!)', '#ef4444');
          } else if (instance.type === 'boss_midnight') {
            voiceManager.triggerEvent('boss_midnight_defeat', true);
            particles.emitSparks(mesh.position, 45, true);
            particles.addFloatingText([mesh.position.x, mesh.position.y + 0.8, mesh.position.z], 'MIDNIGHT MOSQUITO VANQUISHED! (ড্রাকুলা মশা নিধন!)', '#c084fc');
          } else if (instance.type === 'boss_invisible') {
            voiceManager.triggerEvent('boss_invisible_defeat', true);
            particles.emitSparks(mesh.position, 60, true);
            particles.emitPoisonShockwave(mesh.position);
            particles.addFloatingText([mesh.position.x, mesh.position.y + 1.0, mesh.position.z], 'APEX MUTANT DESTROYED! BANGLADESH IS SAVED! (বাংলাদেশ মুক্ত!)', '#10b981');
          }

          const livingBosses = getLivingBosses();
          if (livingBosses.length > 0) {
            particles.addFloatingText(
              [camera.position.x, camera.position.y + 0.5, camera.position.z],
              `🔥 BOSS DESTROYED! ${livingBosses.length} REMAINING! 🔥`,
              '#f59e0b'
            );
            updateBossHealthHud(livingBosses[0].instance);
          } else {
            onBossHealthChange(null);
            setTimeout(() => {
              if (enemies.every((e) => e.instance.state === 'dead')) {
                checkLevelCompletion();
              }
            }, 1800);
          }
        }
      }
    };

    const checkLevelCompletion = () => {
      if (levelCompleted) return;
      levelCompleted = true;
      if (level.id === 6) {
        // Climax victory dialogue:
        // Player: "এত কষ্ট করার পর এখন যদি একটা মশাও কামড় দেয়, আমি কিন্তু দেশ ছাইড়া চলে যামু!"
        // Comedic mosquito: "মামা... একটু রক্ত দিয়া যান না!"
        voiceManager.triggerEvent('player_victory_final', true);
        setTimeout(() => {
          voiceManager.triggerEvent('mosquito_victory_joke', true);
        }, 3400);
      } else {
        voiceManager.triggerEvent('player_victory', true);
      }
      const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
      onVictory({
        kills: stateRef.current.playerStats.kills,
        time: survivalTime,
        score: stateRef.current.playerStats.score + 1000,
      });
    };

    // ==========================================
    // MAIN GAME LOOP (TICK)
    // ==========================================

    const clock = new THREE.Clock();
    let frameId = 0;

    // Adaptive resolution / frame-time counters (dev diagnostics + dynamic DPR).
    let perfWindowTime = 0;
    let perfWindowFrames = 0;
    let perfCooldown = 0;
    let smoothedFps = 60;
    let smoothedFrameMs = 16.7;
    let worstFrameMs = 0;

    let devDiagFrame = 0;
    const tick = () => {
      if (stateRef.current.isPaused) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.elapsedTime;

      // Revert the previous frame's camera-shake offset before physics runs so
      // repeated hits cannot permanently drift the player/collision position.
      camera.position.x -= shakeOffsetX;
      camera.position.y -= shakeOffsetY;
      shakeOffsetX = 0;
      shakeOffsetY = 0;

      // Measure real frame pacing and lower the render resolution on slow GPUs.
      // This reacts to the actual device instead of guessing from a user agent.
      const frameMs = delta * 1000;
      smoothedFrameMs = smoothedFrameMs * 0.9 + frameMs * 0.1;
      smoothedFps = smoothedFps * 0.9 + (1000 / Math.max(frameMs, 0.01)) * 0.1;
      if (frameMs > worstFrameMs) worstFrameMs = frameMs;
      perfWindowTime += delta;
      perfWindowFrames += 1;
      perfCooldown -= delta;
      if (perfWindowTime >= 1.5) {
        const avgFrameMs = (perfWindowTime / Math.max(1, perfWindowFrames)) * 1000;
        if (document.visibilityState === 'visible' && perfCooldown <= 0) {
          if (avgFrameMs > 25 && activePixelRatio > 1.0) {
            activePixelRatio = Math.max(1.0, activePixelRatio - 0.25);
            applyViewportSize(true);
            perfCooldown = 2.5;
          } else if (avgFrameMs < 18 && activePixelRatio < maxPixelRatio) {
            activePixelRatio = Math.min(maxPixelRatio, activePixelRatio + 0.25);
            applyViewportSize(true);
            perfCooldown = 3;
          }
        }
        perfWindowTime = 0;
        perfWindowFrames = 0;
      }

      // 1. Sync Active Weapon Model if switched in HUD (with smooth tactical lowering & raising animation)
      if (stateRef.current.currentWeapon !== currentRenderedWeapon && !targetWeaponType) {
        targetWeaponType = stateRef.current.currentWeapon;
      }
      if (targetWeaponType) {
        if (currentRenderedWeapon !== targetWeaponType) {
          // Lowering phase
          weaponSwitchProgress = Math.max(0, weaponSwitchProgress - delta * 6.5);
          if (weaponSwitchProgress <= 0) {
            updateWeaponMesh(targetWeaponType);
          }
        } else {
          // Raising phase
          weaponSwitchProgress = Math.min(1, weaponSwitchProgress + delta * 6.5);
          if (weaponSwitchProgress >= 1) {
            targetWeaponType = null;
          }
        }
      }

      // 2. Camera Orientation (combining mouse look + mobile touch drag look)
      const mobInput = stateRef.current.mobileInputRef.current;
      const isFocusing = Boolean(mobInput?.isFocusing);
      const isCrouching = Boolean(mobInput?.isCrouching);
      if (mobInput && (mobInput.lookDelta.x !== 0 || mobInput.lookDelta.y !== 0)) {
        const touchSens = 0.0035 * stateRef.current.mouseSensitivity * (isFocusing ? 0.55 : 1);
        cameraYaw -= mobInput.lookDelta.x * touchSens;
        cameraPitch -= mobInput.lookDelta.y * touchSens;
        mobInput.lookDelta.x = 0;
        mobInput.lookDelta.y = 0;
      }

      cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, cameraPitch));
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.x = cameraPitch;
      euler.y = cameraYaw;
      camera.quaternion.setFromEuler(euler);

      // Focus/aim zooms the view without touching the weapon rig or HUD.
      const targetFov = isFocusing ? 58 : 75;
      if (Math.abs(camera.fov - targetFov) > 0.02) {
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 12, delta);
        camera.updateProjectionMatrix();
      }

      // 3. Player Movement & WASD / Mobile Joystick Physics
      const moveInput = new THREE.Vector2();
      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) moveInput.y += 1;
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) moveInput.y -= 1;
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) moveInput.x -= 1;
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) moveInput.x += 1;

      // Add mobile joystick input
      if (mobInput && (mobInput.moveVector.x !== 0 || mobInput.moveVector.y !== 0)) {
        moveInput.x += mobInput.moveVector.x;
        moveInput.y += mobInput.moveVector.y;
      }

      const isSprinting = !isCrouching && !isFocusing && (keysPressed['ShiftLeft'] || keysPressed['ShiftRight'] || Boolean(mobInput && mobInput.isSprinting));
      const speed = isFocusing ? 2.2 : isCrouching ? 2.5 : isSprinting ? 7.5 : 4.5;

      if (moveInput.lengthSq() > 0) {
        if (moveInput.length() > 1) moveInput.normalize();
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
        const moveDir = forward.multiplyScalar(moveInput.y).add(right.multiplyScalar(moveInput.x));

        playerVel.x = THREE.MathUtils.damp(playerVel.x, moveDir.x * speed, 12, delta);
        playerVel.z = THREE.MathUtils.damp(playerVel.z, moveDir.z * speed, 12, delta);

        walkBobTimer += delta * (isSprinting ? 14 : 9);
        if (Math.sin(walkBobTimer) > 0.95) {
          soundManager.playFootstep();
        }
      } else {
        playerVel.x = THREE.MathUtils.damp(playerVel.x, 0, 14, delta);
        playerVel.z = THREE.MathUtils.damp(playerVel.z, 0, 14, delta);
      }

      // Jump (Keyboard Space or Mobile Jump)
      if ((keysPressed['Space'] || (mobInput && mobInput.isJumping)) && isGrounded) {
        playerVel.y = 5.2;
        isGrounded = false;
      }

      // Gravity
      playerVel.y -= 14.0 * delta;
      camera.position.addScaledVector(playerVel, delta);

      // Floor collision (crouch lowers the eye line without breaking jumping)
      const eyeHeight = isCrouching ? 1.08 : 1.6;
      if (camera.position.y <= eyeHeight) {
        camera.position.y = eyeHeight;
        playerVel.y = 0;
        isGrounded = true;
      }

      // Colliders
      for (let box of builtEnv.colliders) {
        const pRadius = 0.35;
        if (
          camera.position.x + pRadius > box.min.x &&
          camera.position.x - pRadius < box.max.x &&
          camera.position.z + pRadius > box.min.z &&
          camera.position.z - pRadius < box.max.z
        ) {
          const overlapX1 = Math.abs(camera.position.x + pRadius - box.min.x);
          const overlapX2 = Math.abs(box.max.x - (camera.position.x - pRadius));
          const overlapZ1 = Math.abs(camera.position.z + pRadius - box.min.z);
          const overlapZ2 = Math.abs(box.max.z - (camera.position.z - pRadius));
          const minOverlap = Math.min(overlapX1, overlapX2, overlapZ1, overlapZ2);

          if (minOverlap === overlapX1) camera.position.x = box.min.x - pRadius;
          else if (minOverlap === overlapX2) camera.position.x = box.max.x + pRadius;
          else if (minOverlap === overlapZ1) camera.position.z = box.min.z - pRadius;
          else if (minOverlap === overlapZ2) camera.position.z = box.max.z + pRadius;
        }
      }

      // Check contextual interaction nearby
      let nearbyInteraction = false;
      let interactionText = '';
      if (level.fuseBoxPosition) {
        const fbDist = camera.position.distanceTo(new THREE.Vector3(...level.fuseBoxPosition));
        if (fbDist < 2.5) {
          nearbyInteraction = true;
          interactionText = isPowerCut ? 'RESTORE FUSE (ফিউজ ঠিক করুন)' : 'FUSE BOX OK';
        }
      }
      if (!nearbyInteraction) {
        for (let s of searchableContainers) {
          if (!s.searched) {
            const sDist = camera.position.distanceTo(new THREE.Vector3(...s.position));
            if (sDist < 2.2) {
              nearbyInteraction = true;
              interactionText = `SEARCH ${s.name.toUpperCase()}`;
              break;
            }
          }
        }
      }
      // Only notify React when the interaction target actually changes; this
      // used to call setState on every animation frame.
      if (nearbyInteraction !== lastInteractionCan || interactionText !== lastInteractionPrompt) {
        lastInteractionCan = nearbyInteraction;
        lastInteractionPrompt = interactionText;
        onCanInteractChange(nearbyInteraction, interactionText);
      }

      // Camera Bobbing (grounded only, so jumping is visible)
      const bobAmount = isSprinting ? 0.045 : 0.025;
      const bobOffset = moveInput.lengthSq() > 0 ? Math.sin(walkBobTimer) * bobAmount : 0;
      if (isGrounded) {
        camera.position.y = eyeHeight + bobOffset;
      } else if (camera.position.y < eyeHeight) {
        camera.position.y = eyeHeight;
      }

      // Damage shake is applied as a temporary render offset and reverted at
      // the start of the next frame, so it cannot accumulate into camera drift.
      if (damageShake > 0) {
        damageShake = Math.max(0, damageShake - delta * 3.5);
        const shakeAmount = damageShake * 0.15;
        shakeOffsetX = (Math.random() - 0.5) * shakeAmount;
        shakeOffsetY = (Math.random() - 0.5) * shakeAmount;
        camera.position.x += shakeOffsetX;
        camera.position.y += shakeOffsetY;
      }

      // 4. Weapon Viewmodel Animation (Lower-Right Corner FPS positioning & dynamic animations)
      if (weaponContainer) {
        const curW = stateRef.current.currentWeapon;
        const rig = WEAPON_VIEWMODEL_RIGS[curW];
        const switchYOffset = (1.0 - weaponSwitchProgress) * -0.35;
        const idleBreath = Math.sin(elapsed * 2.2) * 0.003;
        const walkBobX = moveInput.lengthSq() > 0 ? Math.sin(walkBobTimer * 0.5) * 0.007 : 0;
        const walkBobY = moveInput.lengthSq() > 0 ? Math.cos(walkBobTimer) * 0.009 : 0;

        if (isAttacking) {
          attackTimer += delta;
          const attackDuration = attackType === 'secondary' ? 0.32 : 0.20;
          const prog = Math.min(1, attackTimer / attackDuration);
          const swingArc = Math.sin(prog * Math.PI);

          if (attackType === 'primary') {
            const isSwat = curW === 'racket' || curW === 'newspaper';
            if (isSwat) {
              // Fluid inward swat with a snappy recovery.
              weaponContainer.position.set(
                rig.position[0] - swingArc * 0.15 + walkBobX,
                rig.position[1] + switchYOffset + swingArc * 0.07 + idleBreath + walkBobY,
                rig.position[2] - swingArc * 0.09
              );
              weaponContainer.rotation.set(
                rig.rotation[0] + swingArc * 0.50,
                rig.rotation[1] + swingArc * 0.68,
                rig.rotation[2] - swingArc * 0.82
              );
            } else if (curW === 'spray') {
              // Aerosol back-kick: small, fast, tactile.
              weaponContainer.position.set(
                rig.position[0] + swingArc * 0.008 + walkBobX,
                rig.position[1] + switchYOffset + swingArc * 0.012 + idleBreath + walkBobY,
                rig.position[2] + swingArc * 0.045
              );
              weaponContainer.rotation.set(
                rig.rotation[0] - swingArc * 0.16,
                rig.rotation[1] + swingArc * 0.03,
                rig.rotation[2] + swingArc * 0.05
              );
            } else if (curW === 'fan') {
              // Forward shove that pushes the airflow cone toward the swarm.
              weaponContainer.position.set(
                rig.position[0] - swingArc * 0.03 + walkBobX,
                rig.position[1] + switchYOffset + swingArc * 0.02 + idleBreath + walkBobY,
                rig.position[2] - swingArc * 0.13
              );
              weaponContainer.rotation.set(
                rig.rotation[0] + swingArc * 0.28,
                rig.rotation[1] - swingArc * 0.20,
                rig.rotation[2] + swingArc * 0.08
              );
            } else {
              // Coil underhand placement.
              weaponContainer.position.set(
                rig.position[0] - swingArc * 0.05 + walkBobX,
                rig.position[1] + switchYOffset + swingArc * 0.11 + idleBreath + walkBobY,
                rig.position[2] - swingArc * 0.10
              );
              weaponContainer.rotation.set(
                rig.rotation[0] - swingArc * 0.45,
                rig.rotation[1] + swingArc * 0.25,
                rig.rotation[2] + swingArc * 0.18
              );
            }
          } else {
            // Secondary special: charged 360-degree shockwave swing for the
            // melee tools, a braced push for the placed/sprayed tools.
            const isSpin = curW === 'racket' || curW === 'newspaper' || curW === 'fan';
            if (isSpin) {
              weaponContainer.position.set(
                rig.position[0] - swingArc * 0.08 + walkBobX,
                rig.position[1] + switchYOffset + swingArc * 0.04 + idleBreath + walkBobY,
                rig.position[2] - swingArc * 0.16
              );
              weaponContainer.rotation.set(
                rig.rotation[0] + swingArc * 0.30,
                rig.rotation[1] + prog * Math.PI * 2,
                rig.rotation[2] - swingArc * 0.20
              );
            } else {
              weaponContainer.position.set(
                rig.position[0] + walkBobX,
                rig.position[1] + switchYOffset + swingArc * 0.02 + idleBreath + walkBobY,
                rig.position[2] - swingArc * 0.08
              );
              weaponContainer.rotation.set(
                rig.rotation[0] + swingArc * 0.10,
                rig.rotation[1] + swingArc * 0.06,
                rig.rotation[2] + swingArc * 0.04
              );
            }
          }

          // Per-Weapon Attack Details
          if (curW === 'spray') {
            // Depress actuator spray nozzle & index finger
            const nozzle = activeWeaponMesh?.getObjectByName('sprayNozzle');
            if (nozzle) nozzle.position.y = 0.145 - swingArc * 0.016;

            const finger = activeWeaponMesh?.getObjectByName('sprayTriggerFinger');
            if (finger) finger.rotation.x = -0.35 - swingArc * 0.30;
          } else if (curW === 'fan') {
            // Air breeze vortex swirl cone visual fades in
            const airSwirl = activeWeaponMesh?.getObjectByName('fanAirSwirl') as THREE.Mesh;
            if (airSwirl && airSwirl.material) {
              (airSwirl.material as THREE.MeshBasicMaterial).opacity = swingArc * 0.55;
              airSwirl.rotation.z += delta * 35.0;
            }
          } else if (curW === 'coil') {
            // Ember light intensifies during attack
            const emberLight = activeWeaponMesh?.getObjectByName('coilEmberLight') as THREE.PointLight;
            if (emberLight) emberLight.intensity = 1.6 + swingArc * 1.2;
          }

          if (prog >= 1) {
            isAttacking = false;
            // Reset nozzle & finger
            const nozzle = activeWeaponMesh?.getObjectByName('sprayNozzle');
            if (nozzle) nozzle.position.y = 0.145;
            const finger = activeWeaponMesh?.getObjectByName('sprayTriggerFinger');
            if (finger) finger.rotation.x = -0.35;
            const airSwirl = activeWeaponMesh?.getObjectByName('fanAirSwirl') as THREE.Mesh;
            if (airSwirl && airSwirl.material) (airSwirl.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        } else {
          // Natural idle breathing and walking bob in each weapon's rest pose.
          weaponContainer.position.set(
            rig.position[0] + walkBobX,
            rig.position[1] + switchYOffset + idleBreath + walkBobY,
            rig.position[2]
          );
          weaponContainer.rotation.set(
            rig.rotation[0] + (moveInput.lengthSq() > 0 ? Math.cos(walkBobTimer * 0.5) * 0.018 : 0),
            rig.rotation[1] + (moveInput.lengthSq() > 0 ? Math.sin(walkBobTimer * 0.5) * 0.018 : 0),
            rig.rotation[2] + (moveInput.lengthSq() > 0 ? Math.sin(walkBobTimer * 0.5) * 0.014 : 0)
          );
        }

        // Idle weapon mechanical details
        if (curW === 'racket') {
          // Racket electric spark arc line jitters subtly
          const electricArc = activeWeaponMesh?.getObjectByName('racketElectricArc');
          if (electricArc) {
            electricArc.visible = isAttacking ? true : Math.random() > 0.4;
          }
        } else if (curW === 'fan') {
          // Handheld fan blades rotate continuously
          const fanBlades = activeWeaponMesh?.getObjectByName('fanBlades');
          if (fanBlades) {
            fanBlades.rotation.z += delta * (isAttacking ? 48.0 : 26.0);
          }
        } else if (curW === 'coil') {
          // Glowing ember tip gently pulses
          const emberLight = activeWeaponMesh?.getObjectByName('coilEmberLight') as THREE.PointLight;
          if (emberLight && !isAttacking) {
            emberLight.intensity = 0.7 + Math.sin(elapsed * 4.0) * 0.25;
          }
          // Emit gentle ambient smoke puff from held coil ember
          if (Math.random() < 0.15) {
            const worldEmber = new THREE.Vector3();
            activeWeaponMesh?.getObjectByName('coilEmber')?.getWorldPosition(worldEmber);
            if (worldEmber.lengthSq() > 0) particles.emitCoilSmoke(worldEmber);
          }
        }
      }

      // 5. Ceiling Fan Physics & Inertial Deceleration (Step 2)
      if (builtEnv.ceilingFanBladeGroup) {
        if (isPowerCut) {
          // Gradually slows down with authentic mechanical drag/inertia
          fanBladeSpeed = Math.max(0, fanBladeSpeed - delta * 2.8);
        } else if (powerCutPhase === 'flickering') {
          // Motor loses torque as voltage fluctuates
          fanBladeSpeed = Math.max(3.0, fanBladeSpeed - delta * 2.2);
        } else {
          // Regular mains speed
          fanBladeSpeed = Math.min(14.0, fanBladeSpeed + delta * 4.5);
        }
        builtEnv.ceilingFanBladeGroup.rotation.y += fanBladeSpeed * delta;
      }

      // 6. Signature Feature: 9-Step Cinematic Load Shedding (Midnight Power Cut)
      if (level.hasPowerCuts) {
        if (powerCutPhase === 'normal') {
          powerCutTimer += delta;
          if (powerCutTimer >= nextPowerCutIn) {
            // STEP 1: Lights flicker (voltage fluctuation)
            powerCutPhase = 'flickering';
            powerCutFlickerTimer = 0;
            soundManager.playVoltageFlicker();

            if (level.fuseBoxPosition) {
              particles.emitSparks(new THREE.Vector3(...level.fuseBoxPosition), 14, false);
            }
            particles.addFloatingText(
              [camera.position.x, camera.position.y + 0.35, camera.position.z],
              'Voltage Fluctuation! (ভোল্টেজ ড্রপ করছে...)',
              '#f59e0b'
            );
          }
        } else if (powerCutPhase === 'flickering') {
          // STEP 1 execution: Rapid erratic dips and spikes in key light and ambient
          powerCutFlickerTimer += delta;
          const prog = powerCutFlickerTimer / POWER_CUT_FLICKER_DURATION;
          const noise = Math.sin(powerCutFlickerTimer * 42.0) * Math.cos(powerCutFlickerTimer * 23.0);
          const isDip = Math.random() < 0.25 + prog * 0.45;

          lightingRig.keyLight.intensity = isDip
            ? 0.04
            : lightingRig.config.keyLight.intensity * (0.35 + 0.65 * Math.abs(noise));
          lightingRig.ambientLight.intensity = isDip
            ? 0.10
            : lightingRig.config.ambient.intensity * 0.8;

          if (powerCutFlickerTimer >= POWER_CUT_FLICKER_DURATION) {
            // STEP 3: Electricity shuts down (room ceiling light turns off)
            // STEP 4: Room becomes dark (ambient drops to deep blue night value, NO black screen overlay)
            // STEP 5: Moonlight enters through the window (casts moonlit cool blue + grill shadow pattern)
            powerCutPhase = 'blackout';
            isPowerCut = true;
            onPowerCutStateChange(true);

            soundManager.playPowerOutage();
            soundManager.stopCeilingFan();
            lightingRig.setPowerCutMode(true);
            atmosphere.setPowerCut(true);

            // STEP 7: Mosquito buzzing increases & authentic Bengali reaction whisper
            voiceManager.triggerEvent('signature_powercut_whisper', true);

            // Remind player about flashlight if currently off (STEP 6)
            if (!stateRef.current.playerStats.flashlightOn) {
              particles.addFloatingText(
                [camera.position.x, camera.position.y + 0.2, camera.position.z],
                'Press [F] for Flashlight! (টর্চ অন করুন!)',
                '#38bdf8'
              );
            }

            setTimeout(() => {
              voiceManager.triggerEvent('player_powercut');
            }, 3500);

            // Distant neighbor shout occasionally
            setTimeout(() => {
              voiceManager.triggerEvent('env_neighbor_powercut');
            }, 8000);
          }
        }
      }

      // 6b. Giant Mosquito Wall Shadow Projector (STEP 8 & STEP 9)
      if (builtEnv.giantMosquitoShadowMesh) {
        const shadowMat = builtEnv.giantMosquitoShadowMesh.material as THREE.MeshBasicMaterial;
        if (isPowerCut) {
          // Smoothly project the giant mosquito shadow onto the bedroom wall
          shadowMat.opacity = Math.min(0.85, shadowMat.opacity + delta * 0.45);
          // Creepy breathing and wing flap flutter
          const flutter = Math.sin(elapsed * 14.0) * 0.05;
          const breathe = Math.sin(elapsed * 2.2) * 0.03;
          builtEnv.giantMosquitoShadowMesh.scale.set(1.0 + breathe, 1.0 + flutter, 1.0);
        } else {
          // Smoothly fade out when power is restored
          shadowMat.opacity = Math.max(0.0, shadowMat.opacity - delta * 1.6);
        }
      }

      // 7. Placed Mosquito Coils Update
      for (let cIdx = placedCoils.length - 1; cIdx >= 0; cIdx--) {
        const c = placedCoils[cIdx];
        c.data.remainingTime -= delta;
        const coilPos = new THREE.Vector3(...c.data.position);

        if (Math.random() < 0.4) {
          particles.emitCoilSmoke(coilPos);
        }

        enemies.forEach(({ instance, mesh }) => {
          if (instance.state === 'dead') return;
          const dist = mesh.position.distanceTo(coilPos);
          if (dist <= c.data.radius) {
            instance.health -= 18.0 * delta;
            instance.speed *= 0.6;
            if (instance.health <= 0) {
              applyDamageToEnemy(instance, mesh, 1);
              onUpdateStats((p) => ({ ...p, killsByCoil: p.killsByCoil + 1 }));
            }
          }
        });

        if (c.data.remainingTime <= 0) {
          scene.remove(c.mesh);
          disposeObject3D(c.mesh);
          placedCoils.splice(cIdx, 1);
        }
      }

      // 8. Waves & Enemy Spawning Loop
      const curWave = level.waves[currentWaveIdx];
      if (curWave && waveEnemiesSpawned < curWave.enemies.reduce((acc, e) => acc + e.count, 0)) {
        spawnTimer += delta;
        if (spawnTimer >= curWave.spawnInterval) {
          spawnTimer = 0;
          let countAccum = 0;
          for (let eConfig of curWave.enemies) {
            countAccum += eConfig.count;
            if (waveEnemiesSpawned < countAccum) {
              spawnEnemy(eConfig.type, eConfig.type.startsWith('boss'));
              waveEnemiesSpawned++;
              break;
            }
          }
        }
      } else if (curWave && enemies.every((e) => e.instance.state === 'dead')) {
        if (currentWaveIdx + 1 < level.waves.length) {
          currentWaveIdx++;
          waveEnemiesSpawned = 0;
          spawnTimer = 0;
          particles.addFloatingText([camera.position.x, camera.position.y + 0.5, camera.position.z], `WAVE ${currentWaveIdx + 1}!`, '#f59e0b');
        } else if (!levelCompleted && (!level.boss || getLivingBosses().length === 0)) {
          checkLevelCompletion();
        }
      }

      // Atmospheric Biohazard Spores for Level 6
      if (level.id === 6 && Math.random() < 0.28) {
        const sporePos = new THREE.Vector3(
          camera.position.x + (Math.random() - 0.5) * 14,
          0.4 + Math.random() * 3.5,
          camera.position.z + (Math.random() - 0.5) * 14
        );
        particles.emitBiohazardSpore(sporePos);
      }

      // 9. Mosquito AI, Flight Kinematics & Attack
      let nearestMosquitoDist = 999;
      let livingCount = 0;
      const playerPos = camera.position;

      enemies.forEach(({ instance, mesh }) => {
        const nodes = mesh.userData.enemyNodes as MosquitoNodes | undefined;

        if (instance.state === 'dead') {
          if (mesh.position.y > 0.08) {
            mesh.position.y -= delta * 3.2;
            mesh.rotation.x += delta * 6.5;
            mesh.rotation.z += delta * 4.8;
            // Realistic insect death reflex (legs curl tightly inwards)
            if (nodes?.leftLegs) nodes.leftLegs.rotation.x = 0.8;
            if (nodes?.rightLegs) nodes.rightLegs.rotation.x = -0.8;
          }
          return;
        }

        livingCount += 1;

        // Boss entrance: ease from a small seed into full terrifying scale.
        const entranceT = mesh.userData.entranceT as number | undefined;
        if (entranceT !== undefined && entranceT < 1) {
          const next = Math.min(1, entranceT + delta * 0.72);
          mesh.userData.entranceT = next;
          const eased = 1 - Math.pow(1 - next, 3);
          const overshoot = 1 + Math.sin(next * Math.PI) * 0.12;
          mesh.scale.setScalar((0.08 + eased * 0.92) * overshoot);
        }

        const dist = mesh.position.distanceTo(playerPos);
        if (dist < nearestMosquitoDist) nearestMosquitoDist = dist;

        // Species-tuned wing flapping rates
        let baseWingSpeed = 62;
        if (instance.type === 'swarm') baseWingSpeed = 82;
        else if (instance.type === 'giant') baseWingSpeed = 44; // Heavier, deeper wing flap
        else if (instance.type === 'boss_dengue') baseWingSpeed = instance.isRageMode ? 88 : 54;
        else if (instance.type === 'boss_midnight') baseWingSpeed = 68;
        else if (instance.type === 'boss_invisible') baseWingSpeed = 74;

        instance.wingAngle += delta * baseWingSpeed;
        if (nodes?.leftWing) nodes.leftWing.rotation.z = Math.sin(instance.wingAngle) * 0.62;
        if (nodes?.rightWing) nodes.rightWing.rotation.z = -Math.sin(instance.wingAngle) * 0.62;

        if (nodes?.leftRearWing) nodes.leftRearWing.rotation.z = Math.sin(instance.wingAngle + 0.35) * 0.55;
        if (nodes?.rightRearWing) nodes.rightRearWing.rotation.z = -Math.sin(instance.wingAngle + 0.35) * 0.55;

        // Realistic animated insect leg dangling & sway in flight
        if (nodes?.leftLegs && nodes?.rightLegs) {
          const legSway = Math.sin(instance.wingAngle * 0.16) * 0.12;
          nodes.leftLegs.rotation.x = legSway;
          nodes.rightLegs.rotation.x = -legSway;
          nodes.leftLegs.rotation.z = Math.cos(instance.wingAngle * 0.16) * 0.06;
          nodes.rightLegs.rotation.z = -Math.cos(instance.wingAngle * 0.16) * 0.06;
        }

        // Abdomen breathing pulse
        if (nodes?.abdomen) {
          const abPulse = 1 + Math.sin(instance.wingAngle * 0.2) * (instance.isRageMode ? 0.14 : 0.08);
          nodes.abdomen.scale.set(abPulse, abPulse, abPulse);
        }

        // Unique boss secondary motion.
        if (instance.isBoss) {
          if (nodes?.bossThorax) {
            const breathe = 1 + Math.sin(elapsed * 1.7 + instance.hoverOffset) * 0.022;
            nodes.bossThorax.scale.set(breathe, 1 + (breathe - 1) * 1.4, breathe);
          }
          if (nodes?.bossWeakPoint) {
            const beat = 1 + Math.sin(elapsed * 6.2) * 0.22;
            nodes.bossWeakPoint.scale.setScalar(beat);
          }
          if (nodes?.midnightLantern) {
            const glowPulse = 1 + Math.sin(elapsed * 3.4) * 0.25;
            nodes.midnightLantern.scale.setScalar(glowPulse);
          }
        }

        // Dripping venom drop animation for Dengue King
        if (nodes?.venomDrop) {
          const dripPhase = (elapsed * 2.5) % 1.0;
          const baseY = (nodes.venomDrop.userData.baseY as number | undefined) ?? -0.19 * 3.8;
          nodes.venomDrop.position.y = baseY - dripPhase * 0.07;
          nodes.venomDrop.scale.set(1.0 - dripPhase * 0.35, 1.0 + dripPhase * 0.55, 1.0 - dripPhase * 0.35);
        }

        // Optical camouflage shimmer & bioluminescent core for Invisible Mosquito
        if (instance.type === 'boss_invisible') {
          if (nodes?.camouflageMaterials) {
            const camoOpacity = 0.20 + Math.sin(elapsed * 3.5) * 0.10;
            for (const mat of nodes.camouflageMaterials) mat.opacity = camoOpacity;
          }
          if (nodes?.invisibleBioCore) {
            const corePulse = 1.0 + Math.sin(elapsed * 5.0) * 0.18;
            nodes.invisibleBioCore.scale.set(corePulse, corePulse, corePulse);
          }
        }

        // If in Rage Mode, emit trailing fiery aura particles & pulse aura light
        if (instance.isRageMode && Math.random() < 0.6) {
          particles.emitBossRageAura(mesh.position);
          const auraLight = nodes?.bossAuraLight as THREE.PointLight | undefined;
          if (auraLight) {
            auraLight.intensity = 2.4 + Math.sin(elapsed * 12.0) * 1.2;
          }
        }

        instance.hoverOffset += delta * 3;
        const hoverY = Math.sin(instance.hoverOffset) * 0.015;

        const toPlayer = scratchToPlayer.copy(playerPos).sub(mesh.position);
        toPlayer.y += hoverY;

        // Boss unique abilities (per-instance special attack timers)
        if (instance.isBoss) {
          instance.specialAttackTimer = (instance.specialAttackTimer || 0) + delta;
          if (instance.type === 'boss_midnight' && instance.specialAttackTimer > 5.5) {
            instance.specialAttackTimer = 0;
            camera.getWorldDirection(scratchCamDir);
            const behindPos = scratchBehind.copy(playerPos).addScaledVector(scratchCamDir, -3.5);
            mesh.position.set(behindPos.x, playerPos.y + 1.2, behindPos.z);
            soundManager.playBossRoar(1.5);
            particles.emitSparks(mesh.position, 35, true);
            particles.addFloatingText([mesh.position.x, mesh.position.y + 0.6, mesh.position.z], 'SHADOW BLINK! (ছায়ায় উধাও!)', '#c084fc');
            voiceManager.triggerEvent('boss_midnight_attack', true);
            damageShake = 0.45;
          } else if (instance.type === 'boss_dengue') {
            const attackInterval = instance.isRageMode ? 3.8 : 5.4;
            if (instance.specialAttackTimer > attackInterval) {
              instance.specialAttackTimer = 0;
              const attackRoll = Math.random();
              if (attackRoll < 0.38) {
                // ATTACK 1: STINGER DIVE BOMB CHARGE
                soundManager.playBossRoar(instance.isRageMode ? 1.6 : 1.3);
                voiceManager.triggerEvent('boss_dengue_attack');
                const rushDir = scratchToDir.copy(toPlayer).normalize();
                mesh.position.add(rushDir.multiplyScalar(3.0));
                damageShake = 0.55;
                particles.emitSparks(mesh.position, 22, true);
                particles.addFloatingText([mesh.position.x, mesh.position.y + 0.5, mesh.position.z], 'STINGER CHARGE! (হুল ফোটানো আক্রমণ!)', '#ef4444');
              } else if (attackRoll < 0.72) {
                // ATTACK 2: TOXIC VENOM SHOCKWAVE
                soundManager.playSprayHiss(0.4);
                particles.emitPoisonShockwave(mesh.position);
                particles.addFloatingText([mesh.position.x, mesh.position.y + 0.5, mesh.position.z], 'POISON SHOCKWAVE! (বিষাক্ত তরঙ্গ!)', '#f59e0b');
                if (dist < 5.0) {
                  soundManager.playPlayerHit();
                  damageShake = 0.45;
                  onUpdateStats((prev) => ({ ...prev, health: Math.max(0, prev.health - (instance.isRageMode ? 22 : 14)) }));
                }
              } else {
                // ATTACK 3: SUMMON MINION ESCORT SWARM!
                soundManager.playBossRoar(1.1);
                particles.emitSparks(mesh.position, 16, false);
                particles.addFloatingText([mesh.position.x, mesh.position.y + 0.5, mesh.position.z], 'SUMMON MINIONS! (প্রহরী তলব!)', '#22c55e');
                spawnEnemy('swarm', false);
              }
            }
          } else if (instance.type === 'boss_invisible' && instance.specialAttackTimer > 5.8) {
            instance.specialAttackTimer = 0;
            const attackRoll = Math.random();
            if (attackRoll < 0.55) {
              // ATTACK 1: BIO-HORROR SHOCKWAVE & CAMOUFLAGE LUNGE
              soundManager.playBossRoar(1.6);
              soundManager.playSprayHiss(0.5);
              voiceManager.triggerEvent('boss_invisible_attack');
              particles.emitPoisonShockwave(mesh.position);
              particles.addFloatingText([mesh.position.x, mesh.position.y + 0.6, mesh.position.z], 'BIO-HORROR STRIKE! (জৈব হুল আক্রমণ!)', '#10b981');
              damageShake = 0.6;
              if (dist < 5.5) {
                soundManager.playPlayerHit();
                onUpdateStats((prev) => ({ ...prev, health: Math.max(0, prev.health - 24) }));
              }
            } else {
              // ATTACK 2: SUMMON MUTANT ESCORTS
              soundManager.playBossRoar(1.3);
              particles.emitSparks(mesh.position, 25, false);
              particles.addFloatingText([mesh.position.x, mesh.position.y + 0.6, mesh.position.z], 'MUTANT SWARM CALL! (মিউট্যান্ট তলব!)', '#34d399');
              spawnEnemy('giant', false);
            }
          }
        }

        // Dynamic Multi-Class Mosquito Kinematics & Flocking AI
        if (dist > 1.2) {
          const toDir = scratchToDir.copy(toPlayer).normalize();

          if (instance.subType === 'fast') {
            // Fast class: erratic zig-zag strafing and sudden sprint dives
            instance.strafeTimer = (instance.strafeTimer || 0) + delta;
            if (instance.strafeTimer > 0.75) {
              instance.strafeTimer = 0;
              instance.strafeDir = (instance.strafeDir || 1) * -1;
            }
            const perp = scratchPerp
              .set(-toDir.z, 0, toDir.x)
              .normalize()
              .multiplyScalar((instance.strafeDir || 1) * 1.4);
            const isDiving = dist < 3.8;
            const diveSpeed = isDiving ? 1.35 : 1.0;
            const composite = toDir.add(perp).normalize();
            mesh.position.addScaledVector(composite, instance.speed * diveSpeed * delta);
          } else if (instance.subType === 'sneaky') {
            // Sneaky class: attempts to flank behind player's blind spot
            camera.getWorldDirection(scratchCamDir);
            const behindPos = scratchBehind.copy(playerPos).addScaledVector(scratchCamDir, -2.5);
            const toBehind = behindPos.sub(mesh.position);

            // If player faces sneaky mosquito directly, camouflages and retreats slightly
            const toEnemyDir = scratchPerp.copy(mesh.position).sub(playerPos).normalize();
            const angle = scratchCamDir.angleTo(toEnemyDir);
            if (angle < Math.PI / 4) {
              // Direct player gaze: fade to near-invisibility
              instance.stealthOpacity = THREE.MathUtils.damp(instance.stealthOpacity, 0.18, 8, delta);
              mesh.position.addScaledVector(toDir, -instance.speed * 0.6 * delta);
            } else {
              instance.stealthOpacity = THREE.MathUtils.damp(instance.stealthOpacity, 0.75, 4, delta);
              const flankDir = toBehind.lengthSq() > 0.5 ? toBehind.normalize() : toDir;
              mesh.position.addScaledVector(flankDir, instance.speed * delta);
            }
          } else if (instance.subType === 'swarm') {
            // Swarm class: rapid orbiting spiral and jittery aerial bob
            const orbitOffset = scratchOrbit.set(
              Math.sin(elapsed * 4.5 + instance.hoverOffset) * 1.2,
              Math.cos(elapsed * 6.0 + instance.hoverOffset) * 0.4,
              Math.cos(elapsed * 4.5 + instance.hoverOffset) * 1.2
            );
            const swarmDir = scratchPerp.copy(toPlayer).add(orbitOffset).normalize();
            mesh.position.addScaledVector(swarmDir, instance.speed * delta);
          } else if (instance.subType === 'armored') {
            // Armored class: heavy, relentless, unstoppable forward charge
            mesh.position.addScaledVector(toDir, instance.speed * delta);
          } else {
            // Standard / Elite pursuit
            mesh.position.addScaledVector(toDir, instance.speed * delta);
          }

          mesh.lookAt(playerPos.x, playerPos.y, playerPos.z);

          // Impact flinch: a short recoil twist layered over the pursuit facing.
          const hitT = (mesh.userData.hitT as number | undefined) ?? 0;
          if (hitT > 0) {
            mesh.userData.hitT = Math.max(0, hitT - delta);
            const recoil = Math.sin((hitT / 0.28) * Math.PI) * (instance.isBoss ? 0.22 : 0.4);
            mesh.rotateZ(recoil);
            mesh.rotateX(-recoil * 0.4);
          }
        } else {
          // In biting range! Attack player
          instance.attackCooldown -= delta;
          if (instance.attackCooldown <= 0) {
            instance.attackCooldown = 1.2;
            soundManager.playPlayerHit();
            damageShake = 0.5;

            // Player damage voice
            voiceManager.triggerEvent('player_damage');

            onUpdateStats((prev) => {
              const newHp = Math.max(0, prev.health - instance.damage);
              if (newHp < 30) {
                voiceManager.triggerEvent('player_low_health');
              }
              if (newHp <= 0) {
                voiceManager.triggerEvent('player_death', true);
                onGameOver(
                  instance.isBoss
                    ? `Drained dry by ${level.boss?.name || 'the Boss Mosquito'}!`
                    : 'Overwhelmed and sucked completely dry by mutant Dhaka mosquitoes!'
                );
              }
              return { ...prev, health: newHp };
            });

            particles.addFloatingText([playerPos.x, playerPos.y, playerPos.z], `OUCH! -${instance.damage} HP`, '#ef4444');
          }
        }
      });

      // Signature Mosquito Dialogue Trigger: "মামুর বেটা পারলে আজকে ঘুমা!"
      // Fires when mosquitoes are actively buzzing close to the player
      if (nearestMosquitoDist < 3.8 && elapsed - lastMosquitoTauntTime > 11.0) {
        lastMosquitoTauntTime = elapsed;
        voiceManager.triggerEvent('mosquito_taunt_signature');
      }

      // Update spatial buzzing audio at ~8 Hz. The AudioParam ramps used to be
      // scheduled on every animation frame, which produced unnecessary Web
      // Audio work during large swarms.
      buzzUpdateTimer += delta;
      if (livingCount === 0 || buzzUpdateTimer >= 0.12) {
        buzzUpdateTimer = 0;
        soundManager.updateMosquitoBuzz(livingCount, nearestMosquitoDist, isPowerCut);
      }

      // 10. Update Particles & Atmosphere
      particles.update(delta);
      atmosphere.update(elapsed, delta);

      renderer.render(scene, camera);

      if (import.meta.env.DEV && ++devDiagFrame % 5 === 0) {
        const diagBox = new THREE.Box3().setFromObject(weaponContainer);
        const diagCorners: THREE.Vector3[] = [];
        for (const bx of [diagBox.min.x, diagBox.max.x]) {
          for (const by of [diagBox.min.y, diagBox.max.y]) {
            for (const bz of [diagBox.min.z, diagBox.max.z]) {
              diagCorners.push(new THREE.Vector3(bx, by, bz).project(camera));
            }
          }
        }
        const diagXs = diagCorners.map((v) => v.x);
        const diagYs = diagCorners.map((v) => v.y);
        const perfMemory = (performance as Performance & {
          memory?: { usedJSHeapSize: number };
        }).memory;
        document.documentElement.dataset.gameDiag = JSON.stringify({
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          enemies: enemies.length,
          livingEnemies: livingCount,
          fps: +smoothedFps.toFixed(1),
          frameMs: +smoothedFrameMs.toFixed(2),
          worstFrameMs: +worstFrameMs.toFixed(2),
          dpr: +renderer.getPixelRatio().toFixed(2),
          jsHeapMB: perfMemory ? +(perfMemory.usedJSHeapSize / 1048576).toFixed(1) : null,
          weapon: currentRenderedWeapon,
          centerClear: !(Math.max(...diagXs) > -0.33 && Math.min(...diagXs) < 0.33 && Math.max(...diagYs) > -0.33 && Math.min(...diagYs) < 0.33),
          weaponNdc: {
            minX: +Math.min(...diagXs).toFixed(2),
            maxX: +Math.max(...diagXs).toFixed(2),
            minY: +Math.min(...diagYs).toFixed(2),
            maxY: +Math.max(...diagYs).toFixed(2),
          },
        });
        worstFrameMs = 0;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleResize);
      window.removeEventListener('orientationchange', scheduleResize);
      window.visualViewport?.removeEventListener('resize', scheduleResize);
      document.removeEventListener('fullscreenchange', scheduleResize);
      document.removeEventListener('webkitfullscreenchange', scheduleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('click', handlePointerLock);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      renderer.domElement.removeEventListener('wheel', handleWheel);

      if (attackTriggerRef.current) attackTriggerRef.current = null;
      if (document.pointerLockElement === renderer.domElement) {
        document.exitPointerLock?.();
      }

      soundManager.stopAllMosquitoBuzz();
      soundManager.stopCeilingFan();
      atmosphere.dispose();
      particles.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [level.id]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-crosshair select-none bg-black touch-none"
    />
  );
};

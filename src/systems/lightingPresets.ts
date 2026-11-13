import * as THREE from 'three';
import { LightingPresetId } from '../types/game';
import { ART_COLORS } from './artSystem';

export type { LightingPresetId };

export interface LightingRigConfig {
  id: LightingPresetId;
  name: string;
  description: string;
  ambient: {
    color: number;
    intensity: number;
  };
  keyLight: {
    type: 'point' | 'directional';
    color: number;
    intensity: number;
    position: [number, number, number];
    distance?: number;
    decay?: number;
  };
  fillLight: {
    type: 'hemisphere' | 'directional';
    skyColor: number;
    groundColor: number;
    intensity: number;
    position?: [number, number, number];
  };
  accentLight?: {
    color: number;
    intensity: number;
    position: [number, number, number];
    distance?: number;
  };
  fog: {
    color: string;
    density: number;
  };
  skyColor: string;
  exposure: number;
}

export const LIGHTING_PRESETS: Record<LightingPresetId, LightingRigConfig> = {
  // 1. INDOOR DAYTIME
  indoor_daytime: {
    id: 'indoor_daytime',
    name: 'Indoor Daytime',
    description: 'Bright warm daylight streaming into Dhaka residence flat',
    ambient: {
      color: 0xffeedd,
      intensity: 0.55,
    },
    keyLight: {
      type: 'directional',
      color: 0xfff6e5,
      intensity: 1.15,
      position: [-5, 6, -3],
    },
    fillLight: {
      type: 'hemisphere',
      skyColor: ART_COLORS.ELECTRIC_BLUE_HEX,
      groundColor: ART_COLORS.WARM_CREAM_HEX,
      intensity: 0.45,
    },
    accentLight: {
      color: ART_COLORS.WARM_YELLOW_HEX,
      intensity: 0.5,
      position: [0, 3, 0],
      distance: 14,
    },
    fog: {
      color: '#cbd5e1',
      density: 0.006,
    },
    skyColor: '#e2e8f0',
    exposure: 1.05,
  },

  // 2. INDOOR NIGHTTIME (Level 1: Bedroom Nightmare)
  indoor_nighttime: {
    id: 'indoor_nighttime',
    name: 'Indoor Nighttime',
    description: 'Warm ceiling lamp ambiance contrasted against cool Dhaka moonlight',
    ambient: {
      color: 0xffeedd,
      intensity: 0.35,
    },
    keyLight: {
      type: 'point',
      color: 0xfff1cf,
      intensity: 0.95,
      position: [0, 3.1, 0],
      distance: 16,
      decay: 1.2,
    },
    fillLight: {
      type: 'directional',
      skyColor: ART_COLORS.ELECTRIC_BLUE_HEX,
      groundColor: ART_COLORS.DEEP_NAVY_HEX,
      intensity: 0.55,
      position: [-6, 3.2, -1.5], // Window moonlight angle
    },
    accentLight: {
      color: ART_COLORS.WARM_YELLOW_HEX,
      intensity: 0.4,
      position: [-1.15, 0.75, -4.7], // Bedside burning coil glow
      distance: 5,
    },
    fog: {
      color: '#0e1420',
      density: 0.012,
    },
    skyColor: '#090d16',
    exposure: 0.95,
  },

  // 3. OUTDOOR DAYTIME
  outdoor_daytime: {
    id: 'outdoor_daytime',
    name: 'Outdoor Daytime',
    description: 'Vibrant sunlit Dhaka street and rooftop with crisp cartoon shadows',
    ambient: {
      color: 0xffeedd,
      intensity: 0.65,
    },
    keyLight: {
      type: 'directional',
      color: 0xfff1d6,
      intensity: 1.3,
      position: [8, 12, 6],
    },
    fillLight: {
      type: 'hemisphere',
      skyColor: ART_COLORS.ELECTRIC_BLUE_HEX,
      groundColor: ART_COLORS.STATUS_GREEN_HEX,
      intensity: 0.5,
    },
    fog: {
      color: '#94a3b8',
      density: 0.005,
    },
    skyColor: '#60a5fa',
    exposure: 1.08,
  },

  // 4. OUTDOOR NIGHTTIME (Level 3: Rooftop Battle, Level 5: Midnight Street)
  outdoor_nighttime: {
    id: 'outdoor_nighttime',
    name: 'Outdoor Nighttime',
    description: 'Moonlit urban Dhaka night with tea stall amber street lanterns',
    ambient: {
      color: ART_COLORS.DEEP_NAVY_HEX,
      intensity: 0.42,
    },
    keyLight: {
      type: 'directional',
      color: 0x93c5fd,
      intensity: 0.75,
      position: [-6, 9, -5],
    },
    fillLight: {
      type: 'hemisphere',
      skyColor: ART_COLORS.DEEP_NAVY_HEX,
      groundColor: 0x1e293b,
      intensity: 0.35,
    },
    accentLight: {
      color: ART_COLORS.WARM_YELLOW_HEX,
      intensity: 1.1,
      position: [0, 2.5, 0], // Tea stall or street lamp
      distance: 18,
    },
    fog: {
      color: '#101726',
      density: 0.012,
    },
    skyColor: '#111827',
    exposure: 0.96,
  },

  // 5. DARK HORROR (Level 2: Load Shedding Lockdown corridor)
  dark_horror: {
    id: 'dark_horror',
    name: 'Dark Horror',
    description: 'Tense Load-Shedding atmosphere with silhouette visibility and red warning beacons',
    ambient: {
      color: ART_COLORS.DEEP_NAVY_HEX,
      intensity: 0.22, // Never 0: keeps depth perception and character silhouettes readable
    },
    keyLight: {
      type: 'directional',
      color: 0x4b6584,
      intensity: 0.3,
      position: [0, 4, -4],
    },
    fillLight: {
      type: 'hemisphere',
      skyColor: 0x0f172a,
      groundColor: 0x020617,
      intensity: 0.18,
    },
    accentLight: {
      color: ART_COLORS.MOSQUITO_RED_HEX,
      intensity: 0.85,
      position: [0, 1.6, -8.2], // Blinking fuse box / transformer spark
      distance: 10,
    },
    fog: {
      color: '#070a10',
      density: 0.038,
    },
    skyColor: '#05070a',
    exposure: 0.92,
  },

  // 6. BOSS ARENA (Level 4: Dengue King, Level 6: Final Night Bio-Nest)
  boss_arena: {
    id: 'boss_arena',
    name: 'Boss Arena',
    description: 'Menacing crimson atmosphere with dramatic electric-blue rim lighting',
    ambient: {
      color: 0x3d1720,
      intensity: 0.48,
    },
    keyLight: {
      type: 'directional',
      color: ART_COLORS.MOSQUITO_RED_HEX,
      intensity: 1.05,
      position: [0, 8, -6],
    },
    fillLight: {
      type: 'hemisphere',
      skyColor: ART_COLORS.MOSQUITO_RED_HEX,
      groundColor: ART_COLORS.DEEP_NAVY_HEX,
      intensity: 0.42,
    },
    accentLight: {
      color: ART_COLORS.ELECTRIC_BLUE_HEX,
      intensity: 0.9,
      position: [0, 1.5, 4], // Back rim light for dramatic cartoon comic silhouette
      distance: 22,
    },
    fog: {
      color: '#1f131a',
      density: 0.018,
    },
    skyColor: '#180f15',
    exposure: 1.0,
  },
};

export interface ActiveLightingRig {
  group: THREE.Group;
  config: LightingRigConfig;
  ambientLight: THREE.AmbientLight;
  keyLight: THREE.Light;
  fillLight: THREE.Light;
  accentLight?: THREE.PointLight;
  setPowerCutMode: (isPowerCut: boolean) => void;
}

/**
 * Creates and applies a complete, balanced multi-light rig to the Three.js scene
 */
export function applyLightingPreset(
  scene: THREE.Scene,
  presetId: LightingPresetId,
  isSoftwareGl: boolean
): ActiveLightingRig {
  const config = LIGHTING_PRESETS[presetId] || LIGHTING_PRESETS.indoor_nighttime;

  // Remove existing lighting group if present
  const existing = scene.getObjectByName('__activeLightingGroup');
  if (existing) {
    scene.remove(existing);
  }

  const group = new THREE.Group();
  group.name = '__activeLightingGroup';

  // 1. Ambient Light (Balanced base bounce)
  const ambientLight = new THREE.AmbientLight(config.ambient.color, config.ambient.intensity);
  group.add(ambientLight);

  // 2. Key Light (Soft shadow caster)
  let keyLight: THREE.Light;
  if (config.keyLight.type === 'point') {
    const pLight = new THREE.PointLight(
      config.keyLight.color,
      config.keyLight.intensity,
      config.keyLight.distance || 18,
      config.keyLight.decay || 1.2
    );
    pLight.position.set(...config.keyLight.position);
    pLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      pLight.shadow.mapSize.width = 1024;
      pLight.shadow.mapSize.height = 1024;
      pLight.shadow.bias = -0.0005;
      pLight.shadow.normalBias = 0.02;
    }
    keyLight = pLight;
  } else {
    const dLight = new THREE.DirectionalLight(config.keyLight.color, config.keyLight.intensity);
    dLight.position.set(...config.keyLight.position);
    dLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      dLight.shadow.mapSize.width = 1024;
      dLight.shadow.mapSize.height = 1024;
      dLight.shadow.bias = -0.0005;
      dLight.shadow.normalBias = 0.02;
      dLight.shadow.camera.near = 0.5;
      dLight.shadow.camera.far = 40;
      dLight.shadow.camera.left = -10;
      dLight.shadow.camera.right = 10;
      dLight.shadow.camera.top = 10;
      dLight.shadow.camera.bottom = -10;
    }
    keyLight = dLight;
  }
  group.add(keyLight);

  // 3. Fill Light (Hemisphere or directional)
  let fillLight: THREE.Light;
  if (config.fillLight.type === 'hemisphere') {
    fillLight = new THREE.HemisphereLight(
      config.fillLight.skyColor,
      config.fillLight.groundColor,
      config.fillLight.intensity
    );
  } else {
    const fDir = new THREE.DirectionalLight(config.fillLight.skyColor, config.fillLight.intensity);
    if (config.fillLight.position) {
      fDir.position.set(...config.fillLight.position);
    }
    fillLight = fDir;
  }
  group.add(fillLight);

  // 4. Accent / Rim Light
  let accentLight: THREE.PointLight | undefined;
  if (config.accentLight) {
    accentLight = new THREE.PointLight(
      config.accentLight.color,
      config.accentLight.intensity,
      config.accentLight.distance || 12,
      1.2
    );
    accentLight.position.set(...config.accentLight.position);
    group.add(accentLight);
  }

  // Add group to scene
  scene.add(group);

  // Function to smoothly switch into or out of power-cut (Load Shedding) mode
  const setPowerCutMode = (isPowerCut: boolean) => {
    if (isPowerCut) {
      ambientLight.color.setHex(0x0c1427); // Deep nocturnal Dhaka navy
      ambientLight.intensity = 0.08;
      keyLight.intensity = 0.0; // Ceiling lamp cuts out completely
      // Window moonlight remains strong / becomes dominant ambient source
      fillLight.intensity = Math.max(0.65, config.fillLight.intensity * 1.15);
      if (accentLight) {
        accentLight.intensity = 0.25; // Distant emergency ember / coil tip
      }
    } else {
      ambientLight.color.setHex(config.ambient.color);
      ambientLight.intensity = config.ambient.intensity;
      keyLight.intensity = config.keyLight.intensity;
      fillLight.intensity = config.fillLight.intensity;
      if (accentLight) {
        accentLight.intensity = config.accentLight?.intensity || 0.5;
      }
    }
  };

  return {
    group,
    config,
    ambientLight,
    keyLight,
    fillLight,
    accentLight,
    setPowerCutMode,
  };
}

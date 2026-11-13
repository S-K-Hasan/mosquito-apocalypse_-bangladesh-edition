export type WeaponType = 'racket' | 'newspaper' | 'coil' | 'fan' | 'spray';

export interface WeaponData {
  id: WeaponType;
  name: string;
  banglaName: string;
  damage: number;
  range: number;
  cooldown: number; // in seconds
  ammo?: number;
  maxAmmo?: number;
  energy?: number; // 0 to 100
  unlocked: boolean;
  description: string;
  secondaryName: string;
  secondaryDesc: string;
}

export type EnemyType = 
  | 'normal' 
  | 'giant' 
  | 'stealth' 
  | 'swarm' 
  | 'boss_dengue' 
  | 'boss_midnight' 
  | 'boss_invisible';

export type EnemySubType = 'fast' | 'armored' | 'sneaky' | 'swarm' | 'elite';

export interface EnemyInstance {
  id: string;
  type: EnemyType;
  subType?: EnemySubType;
  meshIndex: number;
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  state: 'idle' | 'chasing' | 'attacking' | 'fleeing' | 'dead';
  wingAngle: number;
  hoverOffset: number;
  stealthOpacity: number;
  attackCooldown: number;
  targetPos: [number, number, number];
  isBoss?: boolean;
  bossPhase?: number;
  isRageMode?: boolean;
  stunTimer?: number;
  specialAttackTimer?: number;
  strafeDir?: number;
  strafeTimer?: number;
  diveTimer?: number;
  diveBoost?: number;
}

export interface PlacedCoil {
  id: string;
  position: [number, number, number];
  radius: number;
  remainingTime: number; // in seconds
  totalTime: number;
}

export interface SearchableContainer {
  id: string;
  name: string;
  banglaName: string;
  position: [number, number, number];
  searched: boolean;
  itemGiven?: {
    type: 'health' | 'ammo_spray' | 'ammo_coil' | 'battery';
    amount: number;
    name: string;
  };
}

export type LightingPresetId =
  | 'indoor_daytime'
  | 'indoor_nighttime'
  | 'outdoor_daytime'
  | 'outdoor_nighttime'
  | 'dark_horror'
  | 'boss_arena';

export interface LevelConfig {
  id: number;
  title: string;
  banglaTitle: string;
  subtitle: string;
  location: string;
  storyIntro: string;
  storyIntroBangla: string;
  lightingPreset?: LightingPresetId;
  objectives: {
    id: string;
    text: string;
    banglaText: string;
    completed: boolean;
    current?: number;
    target?: number;
  }[];
  waves: {
    waveNumber: number;
    enemies: { type: EnemyType; count: number }[];
    spawnInterval: number;
  }[];
  boss?: {
    type: EnemyType;
    name: string;
    banglaName: string;
    title: string;
    maxHealth: number;
    introSubtitle: string;
  };
  hasPowerCuts: boolean;
  ambientLight: number;
  fogColor: string;
  fogDensity: number;
  skyColor: string;
  fuseBoxPosition?: [number, number, number];
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  flashlightOn: boolean;
  coilsInInventory: number;
  sprayAmmo: number;
  maxSprayAmmo: number;
  racketBattery: number;
  score: number;
  kills: number;
  killsByCoil: number;
  powerCutsSurvived: number;
}

export interface GameSubtitle {
  id: string;
  speaker: string;
  speakerBangla: string;
  text: string;
  banglaText: string;
  duration: number; // seconds
  isUrgent?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  banglaTitle: string;
  description: string;
  banglaDescription: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface GameSettings {
  mouseSensitivity: number;
  touchSensitivity: number;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
  environmentVolume: number;
  subtitlesEnabled: boolean;
  subtitlesLanguage: 'both' | 'bangla' | 'english';
}

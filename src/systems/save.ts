import { Achievement, GameSettings } from '../types/game';

const SAVE_KEY = 'mosquito_apocalypse_save_v1';
const SETTINGS_KEY = 'mosquito_apocalypse_settings_v1';

export interface GameSaveData {
  unlockedLevel: number;
  completedLevels: number[];
  highScore: number;
  totalKills: number;
  totalPowerCutsSurvived: number;
  achievements: Achievement[];
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'powercut_survivor',
    title: 'Heatwave Survivor',
    banglaTitle: 'বাংলাদেশি গরমে বেঁচে গেলাম',
    description: 'Survive 3 midnight power outages without dying.',
    banglaDescription: 'না মরে ৩ বার লোডশেডিং এর মধ্যে বেঁচে থাকুন।',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'mosquito_slayer_100',
    title: 'Mosquito Nemesis',
    banglaTitle: 'মশার যম',
    description: 'Eliminate 100 mutated mosquitoes.',
    banglaDescription: '১০০টি রক্তচোষা দানব মশা খতম করুন।',
    icon: '💀',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'coil_master',
    title: 'Coil King',
    banglaTitle: 'কয়েল কিং',
    description: 'Eliminate 25 mosquitoes with mosquito coils.',
    banglaDescription: 'মশার কয়েল দিয়ে ২৫টি মশা কাবু করুন।',
    icon: '🌀',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'newspaper_champion',
    title: 'Daily Ittefaq Master',
    banglaTitle: 'দৈনিক ইত্তেফাক ওস্তাদ',
    description: 'Swat 30 mosquitoes using the rolled newspaper.',
    banglaDescription: 'খবরের কাগজ দিয়ে বাড়ি মেরে ৩০টি মশা মারুন।',
    icon: '📰',
    unlocked: false,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'racket_zapper',
    title: 'Electric Spark Magician',
    banglaTitle: 'ইলেকট্রিক জাদুকর',
    description: 'Zap 50 mosquitoes with the electric racket.',
    banglaDescription: 'ইলেকট্রিক ব্যাট দিয়ে ৫০টি মশা তড়িতাহত করুন।',
    icon: '🏸',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'rooftop_hero',
    title: 'Night Watchman',
    banglaTitle: 'রাতের পাহারাদার',
    description: 'Complete Level 3 (Rooftop Battle) under Dhaka skies.',
    banglaDescription: 'ঢাকার ছাদে রাতভর মশার সাথে যুদ্ধ জয় করুন।',
    icon: '🏢',
    unlocked: false,
  },
  {
    id: 'dengue_king_down',
    title: 'Dengue Conqueror',
    banglaTitle: 'ডেঙ্গু রাজার পতন',
    description: 'Defeat the Dengue King boss in Level 4.',
    banglaDescription: 'বিশাল দানব ডেঙ্গু রাজাকে পরাস্ত করুন।',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'midnight_boss_down',
    title: 'Midnight Nightmare Banisher',
    banglaTitle: 'মধ্যরাতের দুঃস্বপ্ন জয়ী',
    description: 'Defeat the Midnight Mosquito boss in Level 5.',
    banglaDescription: 'মধ্যরাতের অতিপ্রাকৃতিক কালো মশাকে খতম করুন।',
    icon: '🦇',
    unlocked: false,
  },
  {
    id: 'the_final_mosquito',
    title: 'The Last Mosquito',
    banglaTitle: 'শেষ মশা',
    description: 'Defeat The Invisible Mosquito in Level 6 and save Bangladesh!',
    banglaDescription: 'অদৃশ্য মশাকে পরাস্ত করে বাংলাদেশকে বাঁচান!',
    icon: '🇧🇩',
    unlocked: false,
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  mouseSensitivity: 1.0,
  touchSensitivity: 1.0,
  masterVolume: 0.8,
  sfxVolume: 0.9,
  musicVolume: 0.6,
  voiceVolume: 1.0,
  environmentVolume: 0.8,
  subtitlesEnabled: true,
  subtitlesLanguage: 'both',
};

export const saveSystem = {
  loadData(): GameSaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with initial achievements in case new ones were added
        const mergedAchievements = INITIAL_ACHIEVEMENTS.map((ach) => {
          const found = parsed.achievements?.find((a: Achievement) => a.id === ach.id);
          return found || ach;
        });
        return {
          unlockedLevel: parsed.unlockedLevel || 1,
          completedLevels: parsed.completedLevels || [],
          highScore: parsed.highScore || 0,
          totalKills: parsed.totalKills || 0,
          totalPowerCutsSurvived: parsed.totalPowerCutsSurvived || 0,
          achievements: mergedAchievements,
        };
      }
    } catch (e) {
      console.warn('Failed to load save data:', e);
    }
    return {
      unlockedLevel: 1,
      completedLevels: [],
      highScore: 0,
      totalKills: 0,
      totalPowerCutsSurvived: 0,
      achievements: INITIAL_ACHIEVEMENTS,
    };
  },

  saveData(data: GameSaveData) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save data:', e);
    }
  },

  loadSettings(): GameSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  checkAndUnlockAchievement(
    save: GameSaveData,
    achievementId: string,
    addProgress: number = 1
  ): { updated: GameSaveData; newlyUnlocked: Achievement | null } {
    let newlyUnlocked: Achievement | null = null;
    const achievements = save.achievements.map((ach) => {
      if (ach.id === achievementId && !ach.unlocked) {
        if (ach.maxProgress) {
          const newProgress = Math.min(ach.maxProgress, (ach.progress || 0) + addProgress);
          if (newProgress >= ach.maxProgress) {
            newlyUnlocked = { ...ach, unlocked: true, progress: newProgress, unlockedAt: new Date().toISOString() };
            return newlyUnlocked;
          }
          return { ...ach, progress: newProgress };
        } else {
          newlyUnlocked = { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
          return newlyUnlocked;
        }
      }
      return ach;
    });

    const updated = { ...save, achievements };
    if (newlyUnlocked) {
      this.saveData(updated);
    }
    return { updated, newlyUnlocked };
  },
};

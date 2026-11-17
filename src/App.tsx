import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MobileControls, MobileInputState } from './components/MobileControls';
import { MainMenu } from './components/MainMenu';
import { PauseMenu, GameOverScreen, VictoryScreen } from './components/ModalScreens';
import {
  WeaponType,
  PlayerStats,
  LevelConfig,
  GameSettings,
} from './types/game';
import { GAME_LEVELS } from './levels/levelData';
import { saveSystem, GameSaveData } from './systems/save';
import { soundManager } from './systems/audio';
import { voiceManager, VoiceLine } from './systems/voiceManager';

const INITIAL_PLAYER_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  flashlightOn: false,
  coilsInInventory: 4,
  sprayAmmo: 100,
  maxSprayAmmo: 200,
  racketBattery: 100,
  score: 0,
  kills: 0,
  killsByCoil: 0,
  powerCutsSurvived: 0,
};

const INITIAL_MOBILE_INPUT: MobileInputState = {
  moveVector: { x: 0, y: 0 },
  lookDelta: { x: 0, y: 0 },
  isSprinting: false,
  isJumping: false,
  isCrouching: false,
  isFocusing: false,
  triggerPrimaryAttack: false,
  triggerSecondaryAttack: false,
  triggerInteract: false,
  triggerFlashlight: false,
};

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => saveSystem.loadData());
  const [settings, setSettings] = useState<GameSettings>(() => saveSystem.loadSettings());

  const [view, setView] = useState<'menu' | 'playing' | 'gameover' | 'victory'>('menu');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('racket');
  const [activeVoiceLine, setActiveVoiceLine] = useState<VoiceLine | null>(null);
  const [isPowerCut, setIsPowerCut] = useState<boolean>(false);
  const [bossInfo, setBossInfo] = useState<{ name: string; health: number; maxHealth: number } | null>(null);
  const [hitmarkerActive, setHitmarkerActive] = useState<boolean>(false);
  const [canInteract, setCanInteract] = useState<boolean>(false);
  const [interactionPrompt, setInteractionPrompt] = useState<string | undefined>();
  // Touch input lives in a mutable ref: a finger drag updates it 60-120 times a
  // second and must not re-render React (or rebuild the Three.js scene state).
  const mobileInputRef = useRef<MobileInputState>({ ...INITIAL_MOBILE_INPUT });
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [victoryStats, setVictoryStats] = useState<{ kills: number; time: number; score: number }>({
    kills: 0,
    time: 0,
    score: 0,
  });

  const attackTriggerRef = useRef<{
    primary: () => void;
    secondary: () => void;
    interact: () => void;
    toggleFlashlight: () => void;
  } | null>(null);

  // Synchronize VoiceManager audio volume & subtitle callbacks
  useEffect(() => {
    soundManager.setVolumes(
      settings.masterVolume,
      settings.sfxVolume,
      settings.musicVolume,
      settings.voiceVolume
    );
    // Voice level is applied exactly once, by soundManager's dedicated voiceGain
    // (which feeds masterGain). Multiplying by the settings again here squared
    // the attenuation and made dialogue inaudible on PC Chrome.
    voiceManager.setVolume(1.0);
    voiceManager.setSubtitleCallback((line) => {
      if (settings.subtitlesEnabled) {
        setActiveVoiceLine(line);
      } else {
        setActiveVoiceLine(null);
      }
    });
  }, [settings]);

  // Global trusted user gesture listener for AudioContext & Voice unlock (Crucial for desktop Chrome)
  useEffect(() => {
    const handleUserGesture = () => {
      soundManager.unlock();
      voiceManager.unlock();
    };

    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, []);

  // Keyboard shortcut listener for Weapon Switching 1-5 and Pause (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'playing') return;

      if (e.code === 'Digit1') setCurrentWeapon('racket');
      if (e.code === 'Digit2') setCurrentWeapon('newspaper');
      if (e.code === 'Digit3') setCurrentWeapon('coil');
      if (e.code === 'Digit4') setCurrentWeapon('fan');
      if (e.code === 'Digit5') setCurrentWeapon('spray');

      if (e.code === 'Escape') {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  // Stable touch-input writer. No React state update occurs per pointer move.
  const updateMobileInput = useCallback(
    (updater: (prev: MobileInputState) => MobileInputState) => {
      mobileInputRef.current = updater(mobileInputRef.current);
    },
    []
  );

  // Start Level
  const startLevel = useCallback((lvlId: number) => {
    // Unlock Web Audio and Speech systems synchronously within trusted user interaction event
    soundManager.unlock();
    voiceManager.unlock();

    setCurrentLevelId(lvlId);

    // Reset objectives state for this level to allow replayability
    const levelConfig = GAME_LEVELS.find((l) => l.id === lvlId);
    if (levelConfig) {
      levelConfig.objectives.forEach((obj) => {
        obj.completed = false;
        if (obj.current !== undefined) obj.current = 0;
      });
    }

    setPlayerStats({
      ...INITIAL_PLAYER_STATS,
      coilsInInventory: lvlId === 6 ? 8 : lvlId >= 3 ? 6 : 4,
      sprayAmmo: lvlId === 6 ? 200 : lvlId >= 4 ? 150 : 100,
      maxSprayAmmo: lvlId === 6 ? 200 : 150,
    });
    setCurrentWeapon('racket');
    setIsPaused(false);
    setIsPowerCut(false);
    setBossInfo(null);
    setHitmarkerActive(false);
    setCanInteract(false);
    mobileInputRef.current = { ...INITIAL_MOBILE_INPUT, moveVector: { x: 0, y: 0 }, lookDelta: { x: 0, y: 0 } };
    setView('playing');
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSystem.saveSettings(newSettings);
  };

  // Hitmarker trigger on damage
  const handleHitmarker = useCallback(() => {
    setHitmarkerActive(true);
    setTimeout(() => setHitmarkerActive(false), 120);
  }, []);

  // Contextual interaction handler
  const handleCanInteractChange = useCallback((can: boolean, prompt?: string) => {
    setCanInteract(can);
    setInteractionPrompt(prompt);
  }, []);

  // Handle Objective Progress
  const handleObjectiveUpdate = useCallback((objId: string, progress: number = 1, isCompleted?: boolean) => {
    const currentConfig = GAME_LEVELS.find((l) => l.id === currentLevelId);
    if (!currentConfig) return;

    const targetObj = currentConfig.objectives.find((o) => o.id === objId);
    if (targetObj) {
      if (isCompleted !== undefined) {
        targetObj.completed = isCompleted;
      } else if (targetObj.target) {
        targetObj.current = Math.min(targetObj.target, (targetObj.current || 0) + progress);
        if (targetObj.current >= targetObj.target) {
          targetObj.completed = true;
        }
      } else {
        targetObj.completed = true;
      }
    }
  }, [currentLevelId]);

  // Handle Game Over
  const handleGameOver = useCallback((reason: string) => {
    setGameOverReason(reason);
    setView('gameover');
  }, []);

  // Handle Level Victory
  const handleVictory = useCallback((stats: { kills: number; time: number; score: number }) => {
    setVictoryStats(stats);
    setView('victory');

    setSaveData((prev) => {
      const nextUnlocked = Math.min(6, Math.max(prev.unlockedLevel, currentLevelId + 1));
      const nextCompleted = prev.completedLevels.includes(currentLevelId)
        ? prev.completedLevels
        : [...prev.completedLevels, currentLevelId];
      const nextScore = Math.max(prev.highScore, stats.score);
      const nextKills = prev.totalKills + stats.kills;

      let updatedSave: GameSaveData = {
        ...prev,
        unlockedLevel: nextUnlocked,
        completedLevels: nextCompleted,
        highScore: nextScore,
        totalKills: nextKills,
      };

      if (currentLevelId === 3) {
        updatedSave = saveSystem.checkAndUnlockAchievement(updatedSave, 'rooftop_hero').updated;
      }
      if (currentLevelId === 4) {
        updatedSave = saveSystem.checkAndUnlockAchievement(updatedSave, 'dengue_king_down').updated;
      }
      if (currentLevelId === 5) {
        updatedSave = saveSystem.checkAndUnlockAchievement(updatedSave, 'midnight_boss_down').updated;
      }
      if (currentLevelId === 6) {
        updatedSave = saveSystem.checkAndUnlockAchievement(updatedSave, 'the_final_mosquito').updated;
      }

      saveSystem.saveData(updatedSave);
      return updatedSave;
    });
  }, [currentLevelId]);

  const currentLevelConfig = GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];

  return (
    <div id="game-root" className="relative w-full h-full overflow-hidden bg-black font-sans select-none touch-none">
      {view === 'menu' && (
        <MainMenu
          onStartLevel={startLevel}
          unlockedLevel={saveData.unlockedLevel}
          completedLevels={saveData.completedLevels}
          achievements={saveData.achievements}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {view === 'playing' && (
        <>
          <GameCanvas
            level={currentLevelConfig}
            playerStats={playerStats}
            currentWeapon={currentWeapon}
            onUpdateStats={setPlayerStats}
            onObjectiveUpdate={handleObjectiveUpdate}
            onShowSubtitle={() => {}}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onPowerCutStateChange={setIsPowerCut}
            onBossHealthChange={setBossInfo}
            onHitmarker={handleHitmarker}
            onCanInteractChange={handleCanInteractChange}
            mobileInputRef={mobileInputRef}
            mouseSensitivity={settings.mouseSensitivity}
            isPaused={isPaused}
            attackTriggerRef={attackTriggerRef}
          />

          <HUD
            level={currentLevelConfig}
            playerStats={playerStats}
            currentWeapon={currentWeapon}
            onSelectWeapon={setCurrentWeapon}
            voiceSubtitle={activeVoiceLine}
            isPowerCut={isPowerCut}
            bossInfo={bossInfo}
            hitmarkerActive={hitmarkerActive}
            canInteract={canInteract}
            interactionPrompt={interactionPrompt}
            onPause={() => setIsPaused(true)}
          />

          <MobileControls
            onUpdateInput={updateMobileInput}
            onInteract={() => attackTriggerRef.current?.interact()}
            onToggleFlashlight={() => attackTriggerRef.current?.toggleFlashlight()}
            onAttackPrimary={() => attackTriggerRef.current?.primary()}
            onAttackSecondary={() => attackTriggerRef.current?.secondary()}
            isFlashlightOn={playerStats.flashlightOn}
            canInteract={canInteract}
            interactionPrompt={interactionPrompt}
            isPaused={isPaused}
            currentWeapon={currentWeapon}
            onSelectWeapon={setCurrentWeapon}
            playerStats={playerStats}
          />

          {isPaused && (
            <PauseMenu
              onResume={() => setIsPaused(false)}
              onRestart={() => startLevel(currentLevelId)}
              onMainMenu={() => {
                voiceManager.stop();
                setView('menu');
              }}
            />
          )}
        </>
      )}

      {view === 'gameover' && (
        <GameOverScreen
          reason={gameOverReason}
          stats={{ kills: playerStats.kills, score: playerStats.score }}
          onRestart={() => startLevel(currentLevelId)}
          onMainMenu={() => {
            voiceManager.stop();
            setView('menu');
          }}
        />
      )}

      {view === 'victory' && (
        <VictoryScreen
          levelId={currentLevelId}
          isFinalLevel={currentLevelId === 6}
          stats={victoryStats}
          onNextLevel={() => startLevel(Math.min(6, currentLevelId + 1))}
          onMainMenu={() => {
            voiceManager.stop();
            setView('menu');
          }}
        />
      )}
    </div>
  );
}

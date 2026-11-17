import React, { useState, useEffect } from 'react';
import {
  WeaponType,
  PlayerStats,
  LevelConfig,
} from '../types/game';
import { INITIAL_WEAPONS } from '../systems/weapons';
import { voiceManager, VoiceLine, AudioDiagnosticState } from '../systems/voiceManager';
import { soundManager } from '../systems/audio';
import {
  Heart,
  Zap,
  Flashlight,
  Skull,
  Award,
  Pause,
  ChevronDown,
  ChevronUp,
  Battery,
  ShieldAlert,
  Check,
} from 'lucide-react';

interface HUDProps {
  level: LevelConfig;
  playerStats: PlayerStats;
  currentWeapon: WeaponType;
  onSelectWeapon: (type: WeaponType) => void;
  voiceSubtitle: VoiceLine | null;
  isPowerCut: boolean;
  bossInfo: { name: string; health: number; maxHealth: number } | null;
  hitmarkerActive: boolean;
  canInteract: boolean;
  interactionPrompt?: string;
  onPause: () => void;
}

const WEAPONS_DATA: { id: WeaponType; num: string; label: string; icon: string }[] = [
  { id: 'racket', num: '1', label: 'Racket', icon: '🏸' },
  { id: 'newspaper', num: '2', label: 'News', icon: '📰' },
  { id: 'coil', num: '3', label: 'Coil', icon: '🌀' },
  { id: 'fan', num: '4', label: 'Fan', icon: '💨' },
  { id: 'spray', num: '5', label: 'Spray', icon: '🧴' },
];

export const HUD: React.FC<HUDProps> = ({
  level,
  playerStats,
  currentWeapon,
  onSelectWeapon,
  voiceSubtitle,
  isPowerCut,
  bossInfo,
  hitmarkerActive,
  canInteract,
  interactionPrompt,
  onPause,
}) => {
  const [isObjectivesCollapsed, setIsObjectivesCollapsed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showAudioDiag, setShowAudioDiag] = useState(false);
  const [diagState, setDiagState] = useState<AudioDiagnosticState>(() => voiceManager.getDiagnostics());
  const curWeaponData = INITIAL_WEAPONS[currentWeapon];

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    const timer = setInterval(() => {
      setDiagState(voiceManager.getDiagnostics());
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const healthPercent = Math.max(0, Math.min(100, (playerStats.health / playerStats.maxHealth) * 100));
  const staminaPercent = Math.max(0, Math.min(100, (playerStats.stamina / playerStats.maxStamina) * 100));

  const completedCount = level.objectives.filter((o) => o.completed).length;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-4 z-20 overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* TOP ROW: Compact Mission Badge (Left) | Boss/Alert | Top-Right Pill */}
      {/* ======================================================== */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* TOP LEFT: Compact Mission Badge (Reference Sheet Panel 2) */}
        <div className="bg-[#121620]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 max-w-[260px] sm:max-w-[290px] shadow-2xl pointer-events-auto transition-all">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white font-game text-[11px] px-2 py-0.5 rounded-md tracking-wider font-bold shadow-sm">
                Lv. {level.id}
              </span>
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate">
                {level.title}
              </span>
            </div>
            <button
              onClick={() => setIsObjectivesCollapsed(!isObjectivesCollapsed)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 transition"
              title="Toggle Objectives"
            >
              {isObjectivesCollapsed ? (
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                  {completedCount}/{level.objectives.length} ▾
                </span>
              ) : (
                <span className="text-slate-400 hover:text-white text-xs font-mono">✕</span>
              )}
            </button>
          </div>

          <div className="text-xs text-emerald-400 font-bangla font-semibold truncate mb-1.5">
            {level.banglaTitle}
          </div>

          {!isObjectivesCollapsed && (
            <div className="space-y-1.5 pt-1.5 border-t border-slate-800 text-[11px]">
              {level.objectives.map((obj) => (
                <div key={obj.id} className="flex items-start gap-2">
                  <span
                    className={`w-3.5 h-3.5 mt-0.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${
                      obj.completed
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'border border-slate-600 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <div className="flex-1 leading-snug">
                    <span className={obj.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {obj.text}
                      {obj.target && (
                        <span className="ml-1 text-amber-400 font-mono font-bold">
                          ({obj.current || 0}/{obj.target})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP CENTER: Boss Bar or Power Cut Alert (Reference Sheet Panel 2) */}
        <div className="flex-1 max-w-sm mx-2 flex flex-col items-center">
          {bossInfo && (() => {
            const isRage = (bossInfo.health / bossInfo.maxHealth) < 0.4;
            return (
              <div className={`w-full bg-[#121620]/95 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center pointer-events-auto transition-all ${
                isRage
                  ? 'border-2 border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.7)] animate-pulse'
                  : 'border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              }`}>
                <div className="flex items-center justify-between w-full mb-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Skull className={`w-4 h-4 ${isRage ? 'text-amber-400 animate-bounce' : 'text-red-500 animate-pulse'}`} />
                    <span className={`font-game text-xs uppercase tracking-wider ${isRage ? 'text-amber-300 font-black' : 'text-red-400'}`}>
                      {bossInfo.name}
                    </span>
                    {isRage && (
                      <span className="bg-amber-500 text-slate-950 font-game text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        ⚡ RAGE MODE ⚡
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-mono font-bold ${isRage ? 'text-amber-300' : 'text-red-300'}`}>
                    {Math.round(bossInfo.health)} / {bossInfo.maxHealth}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-red-950">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isRage
                        ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 shadow-[0_0_12px_#f59e0b]'
                        : 'bg-gradient-to-r from-red-600 to-amber-500 shadow-[0_0_8px_#ef4444]'
                    }`}
                    style={{ width: `${Math.max(0, (bossInfo.health / bossInfo.maxHealth) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {isPowerCut && (
            <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-5 py-2 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.7)] flex items-center gap-3 font-bold pointer-events-auto border-2 border-amber-300 animate-pulse">
              <Zap className="w-5 h-5 text-yellow-300 shrink-0 fill-yellow-300" />
              <div className="flex flex-col items-center leading-tight">
                <span className="font-game text-xs text-yellow-200 tracking-wider">⚡ LOAD SHEDDING! ⚡</span>
                <span className="font-bangla text-xs text-white">কারেন্ট চলে গেছে! ফিউজ ঠিক করুন [E]</span>
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT: Compact Pill with Kills, Score, Pause & Audio Diagnostics Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio Diagnostics Toggle Button */}
          <button
            onClick={() => setShowAudioDiag(!showAudioDiag)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all border shadow-lg flex items-center gap-1.5 ${
              showAudioDiag
                ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400'
                : 'bg-[#121620]/95 text-emerald-400 hover:text-emerald-300 border-emerald-500/50 hover:border-emerald-400'
            }`}
            title="Toggle Audio Diagnostics Panel"
          >
            <span>🔊</span>
            <span className="hidden sm:inline">AUDIO DIAG</span>
          </button>

          <div className="bg-[#121620]/95 border border-slate-700/80 rounded-full px-3 py-1 flex items-center gap-2.5 text-xs shadow-2xl">
            {/* Kills */}
            <div className="flex items-center gap-1">
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono font-bold text-white text-xs">{playerStats.kills}</span>
            </div>

            <div className="h-3 w-[1px] bg-slate-700" />

            {/* Score */}
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-amber-300 text-xs">{playerStats.score}</span>
            </div>

            <div className="h-3 w-[1px] bg-slate-700" />

            {/* Circular Pause Button */}
            <button
              onClick={onPause}
              className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 transition shadow active:scale-90"
              title="Pause Game (ESC)"
            >
              <Pause className="w-2.5 h-2.5 fill-slate-200" />
            </button>
          </div>
        </div>
      </div>

      {/* AUDIO DIAGNOSTICS OVERLAY (PART 4 REQUIREMENT) */}
      {showAudioDiag && (
        <div className="absolute top-16 right-4 w-80 sm:w-96 bg-[#121620]/98 backdrop-blur-xl border border-emerald-500/60 rounded-2xl p-3.5 shadow-2xl pointer-events-auto z-40 text-xs text-slate-200 font-mono">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 tracking-wider">
              <span>🔊</span>
              <span>AUDIO DIAGNOSTICS</span>
            </div>
            <button
              onClick={() => setShowAudioDiag(false)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Player Trigger Status:</span>
              <span className="font-bold text-amber-300 truncate max-w-[170px]">
                {diagState.playerDialogueTriggerStatus || 'Idle'}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Selected Audio File:</span>
              <span className="font-bold text-cyan-300 truncate max-w-[170px]" title={diagState.selectedAudioFilename || 'None'}>
                {diagState.selectedAudioFilename ? diagState.selectedAudioFilename.replace(/^.*\/audio\/voices\//, '') : 'None'}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Audio Loading Status:</span>
              <span className={`font-bold ${
                diagState.audioLoadingStatus === 'loaded' ? 'text-emerald-400' :
                diagState.audioLoadingStatus === 'loading' ? 'text-amber-400 animate-pulse' :
                diagState.audioLoadingStatus === 'error' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {diagState.audioLoadingStatus.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Playback Status:</span>
              <span className={`font-bold ${
                diagState.playbackStatus === 'playing' ? 'text-cyan-400 animate-pulse' :
                diagState.playbackStatus === 'ended' ? 'text-slate-300' :
                diagState.playbackStatus === 'error' ? 'text-red-400' : 'text-slate-500'
              }`}>
                {diagState.playbackStatus.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">AudioContext State:</span>
              <span className={`font-bold ${
                diagState.audioContextState === 'running' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {diagState.audioContextState.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Player Voice Volume:</span>
              <span className="font-bold text-white font-mono">
                {Math.round(diagState.playerVoiceVolume * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Playback Errors:</span>
              <span className={`font-bold truncate max-w-[170px] ${
                diagState.playbackError ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {diagState.playbackError || 'None'}
              </span>
            </div>
          </div>

          {/* Test Buttons for user verification (Natural Male Voices) */}
          <div className="mt-3 pt-2 border-t border-slate-800 flex flex-col gap-1.5 font-sans">
            <div className="text-[10px] text-slate-400 font-semibold mb-0.5">
              🔊 Live Test (Genuine Adult Male Voices):
            </div>
            <button
              onClick={() => {
                soundManager.unlock();
                voiceManager.unlock();
                voiceManager.triggerEvent('player_attack_signature', true);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bangla font-bold py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>🧑</span>
              <span>প্লেয়ার (Bangladeshi Male): "ধুর শালার বেটা মশা..."</span>
            </button>

            <button
              onClick={() => {
                soundManager.unlock();
                voiceManager.unlock();
                voiceManager.triggerEvent('mosquito_taunt_signature', true);
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bangla font-bold py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>🦟</span>
              <span>মশা (Teasing Male): "মামুর বেটা, পারলে আজকে ঘুমা!"</span>
            </button>

            <button
              onClick={() => {
                soundManager.unlock();
                voiceManager.unlock();
                voiceManager.triggerEvent('boss_dengue_intro', true);
              }}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bangla font-bold py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>👑</span>
              <span>ডেঙ্গু রাজা (Boss Male Villain): "হাহাহা! আমার রাজ্যে স্বাগতম..."</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CENTER: Minimal Crosshair with Dynamic Red Hitmarker     */}
      {/* ======================================================== */}
      <div className="self-center flex items-center justify-center pointer-events-none relative">
        <div className="relative w-6 h-6 flex items-center justify-center">
          {/* Center tiny dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/95 shadow-sm" />
          {/* Crosshair ticks with gap */}
          <div className="absolute left-0 w-1.5 h-[1.5px] bg-white/80" />
          <div className="absolute right-0 w-1.5 h-[1.5px] bg-white/80" />
          <div className="absolute top-0 h-1.5 w-[1.5px] bg-white/80" />
          <div className="absolute bottom-0 h-1.5 w-[1.5px] bg-white/80" />

          {/* Dynamic Hitmarker Flash on Damage */}
          {hitmarkerActive && (
            <div className="absolute inset-0 flex items-center justify-center animate-ping">
              <div className="w-3.5 h-3.5 border-2 border-red-500 rotate-45" />
            </div>
          )}
        </div>

        {/* Contextual Interaction Prompt */}
        {canInteract && (
          <div className="absolute top-8 bg-[#121620]/95 border border-amber-400/90 text-amber-300 px-3 py-1 rounded-lg text-xs font-bold shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
            <span className="bg-amber-400 text-slate-950 px-1 py-0.5 rounded text-[9px] font-game">E</span>
            <span>{interactionPrompt || 'INTERACT'}</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SUBTITLE & DIALOGUE (Reference Sheet Panel 7)             */}
      {/* ======================================================== */}
      <div className="self-center flex items-center justify-center pointer-events-auto mb-2 min-h-[52px]">
        {voiceSubtitle && (
          <div className="bg-[#121620]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 max-w-lg text-left shadow-2xl flex items-center gap-3 transition-all">
            {/* Character Avatar (Dhaka Protagonist / Boss) */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 border border-amber-400/60 p-0.5 shrink-0 flex items-center justify-center shadow-lg">
              <span className="text-2xl drop-shadow">
                {voiceSubtitle.category === 'boss' ? '👑' : voiceSubtitle.category === 'whisper' ? '🦟' : '👦🏽'}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-game shadow-sm">
                  {voiceSubtitle.speaker.toUpperCase().includes('ME') ||
                  voiceSubtitle.speaker.toUpperCase().includes('YOU') ||
                  voiceSubtitle.speaker.toUpperCase().includes('PLAYER')
                    ? 'YOU'
                    : voiceSubtitle.speaker}
                </span>
                <span className="text-xs text-slate-300 font-bangla font-semibold">
                  {voiceSubtitle.speakerBangla || 'আপনি'}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white font-bangla leading-snug">
                {voiceSubtitle.banglaText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* BOTTOM ROW: Desktop Mode (Health, Weapons Dock, Specs)   */}
      {/* (Reference Sheet Panel 2: PC / Desktop Gameplay UI)      */}
      {/* ======================================================== */}
      {!isTouchDevice && (
        <div className="flex items-end justify-between w-full max-w-4xl mx-auto gap-3 pointer-events-auto">
          {/* BOTTOM LEFT: Health, Stamina, Flashlight (Reference Sheet Panel 2) */}
          <div className="bg-[#121620]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 flex flex-col gap-2 w-48 shadow-2xl">
            {/* Health (Heart + Red Bar + 100/100) */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150 shadow-[0_0_8px_#ef4444]"
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>
              </div>
              <span className="font-mono font-bold text-[11px] text-white shrink-0">
                {Math.round(playerStats.health)}/100
              </span>
            </div>

            {/* Stamina (Lightning + Green Bar + 85/100) */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-150 shadow-[0_0_8px_#10b981]"
                    style={{ width: `${staminaPercent}%` }}
                  />
                </div>
              </div>
              <span className="font-mono font-bold text-[11px] text-white shrink-0">
                {Math.round(playerStats.stamina)}/100
              </span>
            </div>

            {/* Flashlight Status (Torch icon + 70%) */}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Flashlight className={`w-3.5 h-3.5 ${playerStats.flashlightOn ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="font-bold text-[10px]">TORCH [F]</span>
              </div>
              <span className={`font-mono font-bold text-[11px] ${playerStats.flashlightOn ? 'text-amber-400' : 'text-slate-500'}`}>
                {playerStats.flashlightOn ? '70%' : 'OFF'}
              </span>
            </div>
          </div>

          {/* BOTTOM CENTER: 5-Weapon Selector Dock (Reference Sheet Panel 2: 1 Racket, 2 News, etc.) */}
          <div className="bg-[#121620]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-2">
            {WEAPONS_DATA.map((w) => {
              const isSelected = currentWeapon === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => onSelectWeapon(w.id)}
                  className={`relative flex flex-col items-center justify-between py-1.5 px-2 min-w-[54px] h-14 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-red-950/90 to-[#121620] border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] ring-1 ring-red-500 scale-105'
                      : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl leading-none">{w.icon}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {w.num}
                    </span>
                    <span className="text-[9px] font-bold tracking-tight">{w.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BOTTOM RIGHT: Current Weapon Specs (Reference Sheet Panel 2) */}
          <div className="bg-[#121620]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 flex flex-col justify-between w-48 shadow-2xl">
            <div>
              <div className="text-xs font-bold text-white tracking-wide truncate">
                {curWeaponData.name}
              </div>
              <div className="text-[11px] text-emerald-400 font-bangla font-semibold truncate">
                {curWeaponData.banglaName}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-bold text-emerald-300 text-xs">
                  {currentWeapon === 'spray'
                    ? `${playerStats.sprayAmmo}/${playerStats.maxSprayAmmo}`
                    : currentWeapon === 'coil'
                    ? `${playerStats.coilsInInventory} Coils`
                    : '92%'}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-amber-300 font-semibold mt-1 truncate">
              ⚡ [R] Special: {curWeaponData.secondaryName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

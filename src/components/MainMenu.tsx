import React, { useState } from 'react';
import { LevelConfig, Achievement, GameSettings } from '../types/game';
import { GAME_LEVELS } from '../levels/levelData';
import { soundManager } from '../systems/audio';
import { voiceManager } from '../systems/voiceManager';
import { FullscreenButton } from './FullscreenButton';
import {
  Play,
  Grid,
  Settings as SettingsIcon,
  Info,
  ArrowLeft,
  Volume2,
  Gamepad2,
  Sliders,
  Globe,
  Star,
  Lock,
  CheckCircle,
  Skull,
  Crosshair,
  Sparkles,
} from 'lucide-react';

interface MainMenuProps {
  onStartLevel: (levelId: number) => void;
  unlockedLevel: number;
  completedLevels: number[];
  achievements: Achievement[];
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
}

// Procedural Level Thumbnail Graphics matching Reference 5 & Reference 10
const LevelThumbnail: React.FC<{ levelId: number; isUnlocked: boolean }> = ({ levelId, isUnlocked }) => {
  if (!isUnlocked) {
    return (
      <div className="w-full h-24 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center">
        <Lock className="w-7 h-7 text-slate-600" />
      </div>
    );
  }

  // Visual thumbnail scenes for each level
  switch (levelId) {
    case 1:
      // Bedroom Nightmare: Bed, mosquito net, ceiling fan
      return (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gradient-to-b from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-900/40 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
          {/* Ceiling Fan */}
          <div className="absolute top-2 w-6 h-6 border-2 border-slate-500/60 rounded-full flex items-center justify-center animate-spin">
            <div className="w-8 h-1 bg-slate-500/80" />
          </div>
          {/* Bed & Net */}
          <div className="relative z-10 w-24 h-12 border border-purple-400/50 rounded bg-purple-950/40 backdrop-blur-xs flex items-center justify-center">
            <span className="text-[10px] font-bold text-purple-200">🛏️ মশারি (Net)</span>
          </div>
        </div>
      );
    case 2:
      // Power Cut: Flashlight beam cutting through darkness, fuse box
      return (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
          <div className="absolute top-1/2 left-4 w-28 h-16 bg-gradient-to-r from-amber-300/30 via-amber-400/10 to-transparent -rotate-6 transform origin-left blur-xs" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xl">🔦</span>
            <span className="text-[10px] font-bold text-amber-300 font-bangla mt-0.5">লোডশেডিং</span>
          </div>
        </div>
      );
    case 3:
      // Rooftop Battle: Sunset sky, water tank, clotheslines
      return (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gradient-to-b from-orange-950/60 via-rose-950/50 to-slate-900 border border-orange-900/40 flex items-center justify-center">
          <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-900/90" />
          {/* Water Tank */}
          <div className="relative z-10 w-10 h-10 rounded-sm bg-blue-900/80 border border-blue-500/50 flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-bold text-cyan-200">TANK</span>
          </div>
          <div className="absolute top-3 left-4 text-xs">🌇</div>
        </div>
      );
    case 4:
      // Dengue King: Red fog, glowing red mosquito boss
      return (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gradient-to-b from-red-950 via-red-900/40 to-slate-950 border border-red-700/50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.35),transparent_70%)] animate-pulse" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-2xl animate-bounce">👑🦟</span>
            <span className="text-[9px] font-game text-red-400 uppercase tracking-widest mt-0.5">Dengue King</span>
          </div>
        </div>
      );
    case 5:
      // Midnight Invasion: Dhaka street, tea stall (চায়ের দোকান), rickshaw
      return (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800 flex items-center justify-center">
          <div className="absolute top-2 left-3 bg-red-600/30 border border-red-500/50 px-1.5 py-0.5 rounded text-[8px] font-bangla text-amber-300 font-bold">
            চায়ের দোকান
          </div>
          <div className="relative z-10 flex items-center gap-2 mt-2">
            <span className="text-2xl">🛺</span>
            <span className="text-xs">🏮</span>
          </div>
        </div>
      );
    case 6:
      // Final Night: Mutation bio-nest lab
      return (
        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-950 to-black border border-emerald-600/50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_70%)]" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-2xl">🧬🦟</span>
            <span className="text-[9px] font-game text-emerald-400 tracking-wider">BIO-NEST LAB</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
          <span className="text-2xl">🦟</span>
        </div>
      );
  }
};

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartLevel,
  unlockedLevel,
  completedLevels,
  achievements,
  settings,
  onUpdateSettings,
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'levels' | 'settings' | 'credits'>('none');
  const [settingsTab, setSettingsTab] = useState<'audio' | 'controls' | 'gameplay' | 'language'>('audio');

  const handleStartLevel = (levelId: number) => {
    soundManager.unlock();
    voiceManager.unlock();
    onStartLevel(levelId);
  };

  return (
    <div className="menu-safe relative flex h-full w-full flex-col justify-between overflow-y-auto overflow-x-hidden select-none bg-[#0a0d14] text-white">
      <FullscreenButton variant="menu" />

      {/* BACKGROUND KEY ART (Reference 4: Dhaka night street, tea stall, giant mosquito silhouette) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0d131f] to-[#121620]" />

        {/* Ambient atmospheric lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/80 to-transparent z-1" />

        {/* Procedural City Skyline & Giant Mosquito Silhouette */}
        <div className="absolute inset-x-0 bottom-12 flex items-end justify-between px-8 opacity-25">
          <div className="w-16 h-36 bg-slate-800 rounded-t-sm" />
          <div className="w-24 h-48 bg-slate-850 rounded-t-sm" />
          <div className="w-20 h-56 bg-slate-800 rounded-t-sm" />
          <div className="w-28 h-64 bg-slate-900 rounded-t-sm" />
          <div className="w-16 h-40 bg-slate-800 rounded-t-sm" />
          <div className="w-24 h-52 bg-slate-850 rounded-t-sm" />
        </div>

        {/* Giant Mutant Mosquito Silhouette with glowing red eyes in night sky */}
        <div className="absolute top-16 right-12 sm:right-28 opacity-40 pointer-events-none">
          <div className="relative text-7xl sm:text-9xl transform -scale-x-100 rotate-12 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
            🦟
            <div className="absolute top-5 left-8 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <div className="absolute top-6 left-12 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
          </div>
        </div>
      </div>

      {/* HEADER / 3D CARTOON TITLE LOGO (Reference 1 & Reference 4) */}
      <header className="relative z-10 pt-10 sm:pt-14 px-6 flex flex-col items-center text-center">
        {/* Title Logo Group */}
        <div className="flex flex-col items-center">
          {/* "MOSQUITO" 3D Extruded Cartoon Text */}
          <h1
            className="font-game text-5xl sm:text-7xl md:text-8xl tracking-wider uppercase font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            style={{
              textShadow:
                '0 1px 0 #b45309, 0 2px 0 #92400e, 0 3px 0 #78350f, 0 4px 0 #451a03, 0 8px 16px rgba(0,0,0,0.8)',
            }}
          >
            MOSQUITO
          </h1>

          {/* "APOCALYPSE" Crimson 3D Block Text */}
          <div
            className="font-game text-3xl sm:text-5xl md:text-6xl tracking-widest uppercase font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-600 to-rose-700 -mt-2 sm:-mt-4"
            style={{
              textShadow:
                '0 1px 0 #991b1b, 0 2px 0 #7f1d1d, 0 3px 0 #450a0a, 0 6px 14px rgba(220,38,38,0.5)',
            }}
          >
            APOCALYPSE
          </div>

          {/* BANGLADESH EDITION Pill Badge with Bangladesh Flag Accent */}
          <div className="mt-2 inline-flex items-center gap-2 bg-[#024e32] border border-emerald-400/50 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg shadow-emerald-950/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626]" />
            <span>BANGLADESH EDITION</span>
          </div>

          {/* Bengali Subtitle */}
          <div className="font-bangla text-base sm:text-xl font-bold text-emerald-400 mt-2 drop-shadow">
            ঢাকার মশা ধ্বংসযজ্ঞ: শেষ রাতের লড়াই
          </div>
        </div>
      </header>

      {/* CENTER: MAIN MENU ACTION BUTTONS (Reference 4) */}
      <main className="relative z-10 w-full max-w-sm mx-auto px-6 py-6 flex flex-col items-center gap-3">
        {/* 1. NEW GAME (Crimson red highlighted button with play icon) */}
        <button
          onClick={() => handleStartLevel(1)}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-game text-lg py-3.5 px-6 rounded-2xl shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 border border-rose-400/40"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>NEW GAME</span>
        </button>

        {/* 2. CONTINUE (Dark charcoal button) */}
        <button
          onClick={() => handleStartLevel(unlockedLevel)}
          className="w-full bg-[#121620]/90 hover:bg-[#1a202c] border border-slate-700/80 hover:border-slate-500 text-white font-game text-base py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5"
        >
          <Play className="w-4 h-4 text-slate-300" />
          <span>CONTINUE (LEVEL {unlockedLevel})</span>
        </button>

        {/* 3. LEVEL SELECTION (Reference 5 modal opener) */}
        <button
          onClick={() => setActiveModal('levels')}
          className="w-full bg-[#121620]/90 hover:bg-[#1a202c] border border-slate-700/80 hover:border-slate-500 text-white font-game text-base py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5"
        >
          <Grid className="w-4 h-4 text-amber-400" />
          <span>LEVEL SELECTION</span>
        </button>

        {/* 4. SETTINGS (Reference 6 modal opener) */}
        <button
          onClick={() => setActiveModal('settings')}
          className="w-full bg-[#121620]/90 hover:bg-[#1a202c] border border-slate-700/80 hover:border-slate-500 text-white font-game text-base py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5"
        >
          <SettingsIcon className="w-4 h-4 text-blue-400" />
          <span>SETTINGS</span>
        </button>

        {/* 5. CREDITS */}
        <button
          onClick={() => setActiveModal('credits')}
          className="w-full bg-[#121620]/70 hover:bg-[#1a202c] border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white font-game text-sm py-2.5 px-6 rounded-2xl transition flex items-center justify-center gap-2"
        >
          <Info className="w-4 h-4 text-slate-400" />
          <span>CREDITS & HOW TO PLAY</span>
        </button>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 pb-6 text-center text-xs text-slate-500">
        <div>MOSQUITO APOCALYPSE: BANGLADESH EDITION 🇧🇩</div>
        <div className="font-bangla text-[11px] text-slate-600 mt-0.5">
          একটি নির্ভেজাল বাংলাদেশি হাসির সারভাইভাল গেম
        </div>
      </footer>

      {/* ======================================================== */}
      {/* MODAL 1: LEVEL SELECTION (Reference 5: 6 Level Cards)     */}
      {/* ======================================================== */}
      {activeModal === 'levels' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <button
                onClick={() => setActiveModal('none')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> BACK
              </button>
              <h2 className="font-game text-xl text-white tracking-wider flex items-center gap-2">
                <span>SELECT LEVEL</span>
              </h2>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                {completedLevels.length}/6 CLEARED
              </span>
            </div>

            {/* 6 Level Cards in 2x3 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 my-4 overflow-y-auto pr-1">
              {GAME_LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= unlockedLevel;
                const isCompleted = completedLevels.includes(lvl.id);

                return (
                  <div
                    key={lvl.id}
                    onClick={() => isUnlocked && handleStartLevel(lvl.id)}
                    className={`relative rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                      isUnlocked
                        ? 'bg-[#181d2a] border-slate-700 hover:border-red-500 cursor-pointer shadow-lg hover:shadow-red-600/10 hover:-translate-y-0.5'
                        : 'bg-slate-950/70 border-slate-900 opacity-55 cursor-not-allowed'
                    }`}
                  >
                    {/* Level Thumbnail */}
                    <div className="mb-2">
                      <LevelThumbnail levelId={lvl.id} isUnlocked={isUnlocked} />
                    </div>

                    {/* Level Details */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-game font-bold text-red-400 bg-red-600/15 border border-red-500/30 px-1.5 py-0.5 rounded">
                          Level {lvl.id}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> DONE
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm text-white line-clamp-1">{lvl.title}</div>
                      <div className="font-bangla text-xs text-emerald-400 font-semibold mb-1 line-clamp-1">
                        {lvl.banglaTitle}
                      </div>

                      {/* 3-Star Rating (Reference 5) */}
                      <div className="flex items-center gap-1 mt-1 text-amber-400">
                        <Star className={`w-3.5 h-3.5 ${isCompleted ? 'fill-amber-400' : 'text-slate-700'}`} />
                        <Star className={`w-3.5 h-3.5 ${isCompleted ? 'fill-amber-400' : 'text-slate-700'}`} />
                        <Star className={`w-3.5 h-3.5 ${isCompleted ? 'fill-amber-400' : 'text-slate-700'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SETTINGS (Reference 6: 4 Tabs, Sliders, Toggle)   */}
      {/* ======================================================== */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                <h2 className="font-game text-xl text-white tracking-wider flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-red-500" />
                  <span>SETTINGS</span>
                </h2>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="text-xs font-bold text-slate-400 hover:text-white transition px-3 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                CLOSE
              </button>
            </div>

            {/* Body: Left Tab Sidebar + Right Settings Form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-4 flex-1 overflow-y-auto">
              {/* Left Tab Sidebar (Reference 6) */}
              <div className="sm:col-span-1 flex sm:flex-col gap-1.5">
                <button
                  onClick={() => setSettingsTab('audio')}
                  className={`w-full py-2.5 px-3 rounded-xl font-game text-xs tracking-wider flex items-center gap-2 transition ${
                    settingsTab === 'audio'
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Audio</span>
                </button>

                <button
                  onClick={() => setSettingsTab('controls')}
                  className={`w-full py-2.5 px-3 rounded-xl font-game text-xs tracking-wider flex items-center gap-2 transition ${
                    settingsTab === 'controls'
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Controls</span>
                </button>

                <button
                  onClick={() => setSettingsTab('gameplay')}
                  className={`w-full py-2.5 px-3 rounded-xl font-game text-xs tracking-wider flex items-center gap-2 transition ${
                    settingsTab === 'gameplay'
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Gameplay</span>
                </button>

                <button
                  onClick={() => setSettingsTab('language')}
                  className={`w-full py-2.5 px-3 rounded-xl font-game text-xs tracking-wider flex items-center gap-2 transition ${
                    settingsTab === 'language'
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Language</span>
                </button>
              </div>

              {/* Right Settings Form */}
              <div className="sm:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5">
                {/* TAB 1: AUDIO (Reference 6: 5 Sliders + Subtitles Toggle + Language Button) */}
                {settingsTab === 'audio' && (
                  <div className="space-y-3">
                    {/* Master Volume */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Master Volume</span>
                        <span className="font-mono text-red-400">{Math.round(settings.masterVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.masterVolume}
                        onChange={(e) => onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) })}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Music Volume */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Music Volume</span>
                        <span className="font-mono text-red-400">{Math.round(settings.musicVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.musicVolume}
                        onChange={(e) => onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Sound Effects */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Sound Effects</span>
                        <span className="font-mono text-red-400">{Math.round(settings.sfxVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.sfxVolume}
                        onChange={(e) => onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Voice / Dialogue */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Voice / Dialogue</span>
                        <span className="font-mono text-red-400">{Math.round(settings.voiceVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.voiceVolume}
                        onChange={(e) => onUpdateSettings({ ...settings, voiceVolume: parseFloat(e.target.value) })}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Environment */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Environment</span>
                        <span className="font-mono text-red-400">{Math.round(settings.environmentVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.environmentVolume}
                        onChange={(e) =>
                          onUpdateSettings({ ...settings, environmentVolume: parseFloat(e.target.value) })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    {/* Subtitles Toggle Switch (Ref 6) */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Subtitles</span>
                      <button
                        onClick={() => onUpdateSettings({ ...settings, subtitlesEnabled: !settings.subtitlesEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                          settings.subtitlesEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                            settings.subtitlesEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Language Toggle (Ref 6) */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Language</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateSettings({ ...settings, subtitlesLanguage: 'bangla' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bangla font-bold transition ${
                            settings.subtitlesLanguage === 'bangla'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          বাংলা
                        </button>
                        <button
                          onClick={() => onUpdateSettings({ ...settings, subtitlesLanguage: 'english' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            settings.subtitlesLanguage === 'english'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CONTROLS */}
                {settingsTab === 'controls' && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Mouse Look Sensitivity (PC)</span>
                        <span className="font-mono text-red-400">{settings.mouseSensitivity.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={settings.mouseSensitivity}
                        onChange={(e) =>
                          onUpdateSettings({ ...settings, mouseSensitivity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Touch Look Sensitivity (Mobile)</span>
                        <span className="font-mono text-red-400">{settings.touchSensitivity.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={settings.touchSensitivity}
                        onChange={(e) =>
                          onUpdateSettings({ ...settings, touchSensitivity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                      <div className="font-bold text-slate-200">Controls Reference:</div>
                      <div>• Desktop: W A S D to move, Mouse to aim, Left Click to SWAT</div>
                      <div>• Number keys 1-5 to switch between Racket, News, Coil, Fan, Spray</div>
                      <div>• F to toggle Flashlight, E to interact / fuse box</div>
                    </div>
                  </div>
                )}

                {/* TAB 3: GAMEPLAY */}
                {settingsTab === 'gameplay' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Screen Damage Shake</span>
                      <span className="text-emerald-400 font-bold">ACTIVE ✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Hitmarker Feedback</span>
                      <span className="text-emerald-400 font-bold">ACTIVE ✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Dhaka Power Cut Load-Shedding</span>
                      <span className="text-amber-400 font-bold">ENABLED (REALISTIC)</span>
                    </div>
                  </div>
                )}

                {/* TAB 4: LANGUAGE */}
                {settingsTab === 'language' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-300">
                      Select your preferred subtitle display mode for Dhaka comedic dialogue and voice lines:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['both', 'bangla', 'english'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => onUpdateSettings({ ...settings, subtitlesLanguage: lang })}
                          className={`p-3 rounded-xl border text-center transition ${
                            settings.subtitlesLanguage === lang
                              ? 'bg-red-600/30 border-red-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="capitalize">{lang}</div>
                          <div className="font-bangla text-[10px] text-emerald-400 mt-1">
                            {lang === 'both' ? 'উভয়' : lang === 'bangla' ? 'বাংলা' : 'ইংরেজি'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREDITS & HOW TO PLAY                           */}
      {/* ======================================================== */}
      {activeModal === 'credits' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-center">
            <h3 className="font-game text-2xl text-white mb-1">MOSQUITO APOCALYPSE: BANGLADESH EDITION 🇧🇩</h3>
            <div className="font-bangla text-base text-emerald-400 font-bold mb-4">
              ঢাকার মশা ধ্বংসযজ্ঞ: শেষ রাতের লড়াই
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Dedicated to every resident of Dhaka who has survived load-shedding with only a matchbox and an electric mosquito racket.
            </p>
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
              <div className="font-bold text-red-400 mb-1">5 Signature Weapons:</div>
              <div>🏸 Electric Racket • 📰 Folded Newspaper • 🌀 Mosquito Coil • 💨 Table Fan • 🧴 Aerosol Spray</div>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-game py-2.5 rounded-xl transition text-sm"
            >
              BACK TO MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

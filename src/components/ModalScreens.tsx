import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Home, Skull, CheckCircle } from 'lucide-react';
import { soundManager } from '../systems/audio';
import { voiceManager } from '../systems/voiceManager';
import { FullscreenButton } from './FullscreenButton';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onMainMenu }) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="bg-[#121620] border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col gap-3 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center mb-1">
          <span className="text-xl">⏸️</span>
        </div>
        <h2 className="font-game text-2xl text-white tracking-wider">GAME PAUSED</h2>
        <div className="font-bangla text-emerald-400 text-sm font-semibold mb-2">
          খেলা সাময়িক বিরতিতে আছে
        </div>

        <button
          onClick={() => {
            soundManager.unlock();
            voiceManager.unlock();
            onResume();
          }}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-game py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-red-600/25 border border-rose-400/30"
        >
          <Play className="w-4 h-4 fill-white" /> RESUME GAME (চালিয়ে যান)
        </button>

        <button
          onClick={() => {
            soundManager.unlock();
            voiceManager.unlock();
            onRestart();
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" /> RESTART LEVEL (আবার শুরু)
        </button>

        <button
          onClick={onMainMenu}
          className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-slate-700"
        >
          <Home className="w-4 h-4" /> MAIN MENU (মূল মেনু)
        </button>

        <FullscreenButton variant="pause" />
      </div>
    </div>
  );
};

interface GameOverScreenProps {
  reason: string;
  stats: { kills: number; score: number };
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  reason,
  stats,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-red-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-[#121620] border-2 border-red-600/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500/60 flex items-center justify-center mb-3">
          <Skull className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="font-game text-3xl sm:text-4xl text-red-500 tracking-wider">
          YOU DIED!
        </h2>
        <div className="font-bangla text-lg font-bold text-amber-400 mt-1 mb-2">
          রক্তশূন্য হয়ে খাটের নিচে পড়ে রইলেন!
        </div>

        <p className="text-xs text-slate-300 mb-5 italic bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 w-full">
          "{reason}"
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Kills</span>
            <span className="text-2xl font-game text-white">{stats.kills}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Final Score</span>
            <span className="text-2xl font-game text-amber-400">{stats.score}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              soundManager.unlock();
              voiceManager.unlock();
              onRestart();
            }}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-game py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-red-600/30 border border-rose-400/40"
          >
            <RotateCcw className="w-4 h-4" /> TRY AGAIN (পুনরায় চেষ্টা)
          </button>
          <button
            onClick={onMainMenu}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition text-xs border border-slate-800"
          >
            MAIN MENU (মূল মেনু)
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryScreenProps {
  levelId: number;
  isFinalLevel: boolean;
  stats: { kills: number; time: number; score: number };
  onNextLevel: () => void;
  onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  levelId,
  isFinalLevel,
  stats,
  onNextLevel,
  onMainMenu,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if canvas unavailable
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-[#121620] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center mb-3">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="font-game text-3xl sm:text-4xl text-emerald-400 tracking-wider">
          {isFinalLevel ? 'BANGLADESH SAVED! 🇧🇩' : 'LEVEL CLEARED!'}
        </h2>
        <div className="font-bangla text-lg font-bold text-amber-400 mt-1 mb-2">
          {isFinalLevel
            ? 'সব মশার বিনাশ হয়েছে! ঢাকা এখন নিরাপদ!'
            : 'মিশন সফল! রক্তচোষারা পিছু হটেছে!'}
        </div>

        {isFinalLevel && (
          <div className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 my-2 text-left flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-start gap-2">
              <span className="text-base">🧑</span>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">আপনি (পরম শান্তিতে):</span>
                <p className="font-bangla text-sm text-slate-100 font-semibold leading-relaxed">
                  "এত কষ্ট করার পর এখন যদি একটা মশাও কামড় দেয়, আমি কিন্তু দেশ ছাইড়া চলে যামু!"
                </p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-2 flex items-start gap-2">
              <span className="text-base">🦟</span>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">শেষ মশা (বেদনায় কাতরাচ্ছে):</span>
                <p className="font-bangla text-sm text-amber-300 font-semibold italic leading-relaxed">
                  "মামা... একটু রক্ত দিয়া যান না!"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 w-full my-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Kills</span>
            <span className="text-xl font-game text-white">{stats.kills}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Time</span>
            <span className="text-xl font-game text-cyan-400">{stats.time}s</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Score</span>
            <span className="text-xl font-game text-amber-400">{stats.score}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          {!isFinalLevel ? (
            <button
              onClick={() => {
                soundManager.unlock();
                voiceManager.unlock();
                onNextLevel();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-game py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-emerald-600/30 border border-emerald-400/40"
            >
              NEXT MISSION (পরবর্তী লেভেল {levelId + 1}) →
            </button>
          ) : (
            <button
              onClick={onMainMenu}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-game py-3 px-4 rounded-xl transition text-sm shadow-xl shadow-emerald-600/30"
            >
              VICTORY! RETURN TO MAIN MENU
            </button>
          )}

          <button
            onClick={onMainMenu}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition text-xs border border-slate-800"
          >
            MAIN MENU (মূল মেনু)
          </button>
        </div>
      </div>
    </div>
  );
};

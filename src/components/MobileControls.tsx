import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Zap, Flame, Compass, ArrowUp, ShieldAlert, Crosshair } from 'lucide-react';
import { WeaponType, PlayerStats } from '../types/game';

export interface MobileInputState {
  moveVector: { x: number; y: number };
  lookDelta: { x: number; y: number };
  isSprinting: boolean;
  isJumping: boolean;
  isCrouching: boolean;
  triggerPrimaryAttack: boolean;
  triggerSecondaryAttack: boolean;
  triggerInteract: boolean;
  triggerFlashlight: boolean;
}

interface MobileControlsProps {
  onUpdateInput: (updater: (prev: MobileInputState) => MobileInputState) => void;
  onInteract: () => void;
  onToggleFlashlight: () => void;
  onAttackPrimary: () => void;
  onAttackSecondary: () => void;
  isFlashlightOn: boolean;
  canInteract: boolean;
  interactionPrompt?: string;
  isPaused: boolean;
  currentWeapon?: WeaponType;
  onSelectWeapon?: (w: WeaponType) => void;
  playerStats?: PlayerStats;
}

const WEAPONS_LIST: { id: WeaponType; label: string; icon: string }[] = [
  { id: 'racket', label: 'Racket', icon: '🏸' },
  { id: 'newspaper', label: 'News', icon: '📰' },
  { id: 'coil', label: 'Coil', icon: '🌀' },
  { id: 'fan', label: 'Fan', icon: '💨' },
  { id: 'spray', label: 'Spray', icon: '🧴' },
];

export const MobileControls: React.FC<MobileControlsProps> = ({
  onUpdateInput,
  onInteract,
  onToggleFlashlight,
  onAttackPrimary,
  onAttackSecondary,
  isFlashlightOn,
  canInteract,
  interactionPrompt,
  isPaused,
  currentWeapon = 'racket',
  onSelectWeapon,
  playerStats,
}) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [sprinting, setSprinting] = useState<boolean>(false);
  const [crouching, setCrouching] = useState<boolean>(false);

  // Joystick state
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera swipe state
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Detect touch device & orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchId.current !== null || !joystickRef.current) return;

    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;

    const rect = joystickRef.current.getBoundingClientRect();
    joystickCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setKnobPos({ x: 0, y: 0 });
        onUpdateInput((prev) => ({ ...prev, moveVector: { x: 0, y: 0 } }));
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    const dx = clientX - joystickCenter.current.x;
    const dy = clientY - joystickCenter.current.y;
    const maxRadius = 45;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setKnobPos({ x: kx, y: ky });

    // Normalize -1 to 1 for movement (y inverted for forward)
    const normX = kx / maxRadius;
    const normY = -ky / maxRadius;
    onUpdateInput((prev) => ({ ...prev, moveVector: { x: normX, y: normY } }));
  };

  // Camera look drag touch handlers (right side touch zone)
  const handleLookTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        onUpdateInput((prev) => ({
          ...prev,
          lookDelta: { x: prev.lookDelta.x + dx, y: prev.lookDelta.y + dy },
        }));
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  const toggleSprint = () => {
    setSprinting((prev) => {
      const next = !prev;
      onUpdateInput((p) => ({ ...p, isSprinting: next }));
      return next;
    });
  };

  const toggleCrouch = () => {
    setCrouching((prev) => {
      const next = !prev;
      onUpdateInput((p) => ({ ...p, isCrouching: next }));
      return next;
    });
  };

  if (!isTouchDevice) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden touch-none">
      {/* PORTRAIT ORIENTATION BANNER */}
      {isPortrait && (
        <div className="absolute inset-0 bg-[#0c1017]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-4 animate-bounce shadow-xl">
            <RotateCcw className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-game text-2xl text-white tracking-wider mb-1">PLEASE ROTATE DEVICE</h2>
          <div className="font-bangla text-base font-bold text-emerald-400 mb-2">
            অনুগ্রহ করে ফোনটি ঘুরিয়ে ল্যান্ডস্কেপ করুন!
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Mosquito Apocalypse is built for landscape mode for wide-angle survival combat and dual-thumb ergonomics.
          </p>
        </div>
      )}

      {/* RIGHT SIDE CAMERA SWIPE LOOK ZONE (Right 60% upper half) */}
      <div
        className="absolute top-12 right-0 w-3/5 h-3/5 pointer-events-auto opacity-0"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      />

      {/* BOTTOM-LEFT: MINI STATUS BARS (Heart 100, Lightning 90) & VIRTUAL JOYSTICK + SPRINT (Reference 3) */}
      <div className="absolute bottom-4 left-4 pointer-events-auto flex flex-col gap-2">
        {/* Mini Health & Stamina Bars (Ref 3 bottom left) */}
        {playerStats && (
          <div className="flex flex-col gap-1 bg-[#121620]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg w-32">
            {/* Health */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-300">
              <span className="text-red-500">❤️</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, playerStats.health))}%` }}
                />
              </div>
              <span className="font-mono">{Math.round(playerStats.health)}</span>
            </div>
            {/* Stamina */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
              <span className="text-emerald-400">⚡</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, playerStats.stamina))}%` }}
                />
              </div>
              <span className="font-mono">{Math.round(playerStats.stamina)}</span>
            </div>
          </div>
        )}

        {/* Joystick & Sprint Row */}
        <div className="flex items-end gap-2.5">
          {/* Joystick Base */}
          <div
            ref={joystickRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            onTouchCancel={handleJoystickTouchEnd}
            className="relative w-28 h-28 rounded-full bg-[#121620]/80 backdrop-blur-md border-2 border-slate-700 shadow-2xl flex items-center justify-center touch-none active:border-emerald-500"
          >
            {/* Guide Rings */}
            <div className="absolute w-16 h-16 rounded-full border border-slate-700/40" />
            <div className="absolute w-full h-[1px] bg-slate-700/30" />
            <div className="absolute h-full w-[1px] bg-slate-700/30" />

            {/* Draggable Knob */}
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-400 shadow-xl flex items-center justify-center pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Sprint Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              toggleSprint();
            }}
            className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center shadow-lg active:scale-95 transition ${
              sprinting
                ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold'
                : 'bg-[#121620]/80 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-base">🏃</span>
          </button>
        </div>
      </div>

      {/* BOTTOM-CENTER: MOBILE COMPACT WEAPON DOCK (Reference 3) */}
      {onSelectWeapon && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-1.5 bg-[#121620]/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-2xl z-20">
          {WEAPONS_LIST.map((w) => {
            const isActive = currentWeapon === w.id;
            return (
              <button
                key={w.id}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onSelectWeapon(w.id);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                  isActive
                    ? 'bg-red-600/30 border-2 border-red-500 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-slate-900/60 border border-slate-700/80 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>{w.icon}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* RIGHT SIDE: ERGONOMIC RADIAL ACTION CLUSTER (Reference 3) */}
      <div className="absolute bottom-4 right-4 pointer-events-auto flex flex-col items-end gap-2 z-20">
        {/* Contextual Interaction Button */}
        {canInteract && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onInteract();
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-1.5 border-2 border-amber-300 animate-pulse text-xs active:scale-95 mb-1"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span className="font-game">{interactionPrompt || 'INTERACT'}</span>
          </button>
        )}

        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Flashlight (Top-Left of cluster) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onToggleFlashlight();
            }}
            className={`absolute top-0 right-32 w-11 h-11 rounded-full border flex items-center justify-center shadow-lg active:scale-95 transition ${
              isFlashlightOn
                ? 'bg-amber-500 border-amber-300 text-slate-950'
                : 'bg-[#121620]/90 border-slate-700 text-slate-300'
            }`}
            title="Flashlight"
          >
            <span className="text-base">🔦</span>
          </button>

          {/* Spray / Secondary Attack (Top-Center of cluster) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onAttackSecondary();
            }}
            className="absolute top-1 right-18 w-11 h-11 rounded-full bg-[#121620]/90 border border-slate-600 text-amber-300 flex items-center justify-center shadow-lg active:bg-blue-600 active:scale-95 transition"
            title="Special Shockwave / Secondary Attack"
          >
            <span className="text-base">🧴</span>
          </button>

          {/* Jump (Top-Right of cluster) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onUpdateInput((p) => ({ ...p, isJumping: true }));
              setTimeout(() => onUpdateInput((p) => ({ ...p, isJumping: false })), 120);
            }}
            className="absolute top-10 right-2 w-11 h-11 rounded-full bg-[#121620]/90 border border-slate-600 text-white flex items-center justify-center shadow-lg active:bg-slate-700 active:scale-95"
            title="Jump"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </button>

          {/* Aim / Crosshair (Center-Right of cluster) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              // Focus / subtle aim zoom
              onUpdateInput((p) => ({ ...p, isSprinting: false }));
            }}
            className="absolute top-24 -right-1 w-11 h-11 rounded-full bg-[#121620]/90 border border-slate-600 text-white flex items-center justify-center shadow-lg active:bg-slate-700 active:scale-95"
            title="Focus Aim"
          >
            <Crosshair className="w-5 h-5 text-emerald-400" />
          </button>

          {/* Crouch (Bottom-Left of cluster) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              toggleCrouch();
            }}
            className={`absolute bottom-2 right-30 w-11 h-11 rounded-full border flex items-center justify-center shadow-lg active:scale-95 transition ${
              crouching
                ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold'
                : 'bg-[#121620]/90 border-slate-700 text-slate-300'
            }`}
            title="Crouch"
          >
            <span className="text-sm">🏃‍♂️</span>
          </button>

          {/* Main SWAT Button (Center-Bottom large primary attack button with racket icon - Reference Sheet Panel 3) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onAttackPrimary();
            }}
            className="absolute bottom-1 right-5 w-20 h-20 rounded-full bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 border-2 border-rose-400 text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.6)] active:from-red-500 active:scale-95 z-10"
            title="Swat Attack"
          >
            <span className="text-3xl leading-none">🏸</span>
            <span className="text-[9px] font-game tracking-wider uppercase mt-0.5 text-rose-100">SWAT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

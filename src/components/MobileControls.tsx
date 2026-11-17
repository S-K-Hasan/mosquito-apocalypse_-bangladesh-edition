import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Zap, Flashlight, ArrowUp, Crosshair, PersonStanding, Wind, Hand } from 'lucide-react';
import { WeaponType, PlayerStats } from '../types/game';
import { isTouchDevice as detectTouchDevice } from '../utils/device';

export interface MobileInputState {
  moveVector: { x: number; y: number };
  lookDelta: { x: number; y: number };
  isSprinting: boolean;
  isJumping: boolean;
  isCrouching: boolean;
  isFocusing: boolean;
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

const WEAPONS_LIST: { id: WeaponType; label: string; short: string; icon: string }[] = [
  { id: 'racket', label: 'Racket', short: '1', icon: '🏸' },
  { id: 'newspaper', label: 'Newspaper', short: '2', icon: '📰' },
  { id: 'coil', label: 'Coil', short: '3', icon: '🌀' },
  { id: 'fan', label: 'Fan', short: '4', icon: '💨' },
  { id: 'spray', label: 'Spray', short: '5', icon: '🧴' },
];

const CLUSTER_BUTTON =
  'pointer-events-auto flex h-full w-full touch-none select-none items-center justify-center rounded-full border shadow-lg transition active:scale-90';

/**
 * Touch HUD.
 *
 * All input is written straight into the shared mutable input object through
 * `onUpdateInput`; only purely visual toggles (joystick knob, sprint, crouch)
 * touch React state. Pointer Events are used instead of Touch Events so that
 * the joystick, look drag, and action buttons can all be held at the same time
 * (multi-touch) and so a release outside the element is still delivered.
 */
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
}) => {
  const [isTouchDevice] = useState<boolean>(() => detectTouchDevice());
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [sprinting, setSprinting] = useState(false);
  const [crouching, setCrouching] = useState(false);
  const [focusing, setFocusing] = useState(false);

  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const joystickPointerId = useRef<number | null>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const joystickRadius = useRef(45);

  const lookPointerId = useRef<number | null>(null);
  const lastLookPos = useRef({ x: 0, y: 0 });
  const jumpTimer = useRef<number | null>(null);

  useEffect(() => {
    const syncOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
    syncOrientation();
    window.addEventListener('resize', syncOrientation);
    window.addEventListener('orientationchange', syncOrientation);
    window.visualViewport?.addEventListener('resize', syncOrientation);
    return () => {
      window.removeEventListener('resize', syncOrientation);
      window.removeEventListener('orientationchange', syncOrientation);
      window.visualViewport?.removeEventListener('resize', syncOrientation);
    };
  }, []);

  const setKnob = (x: number, y: number) => {
    if (knobRef.current) {
      knobRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const releaseInput = () => {
    joystickPointerId.current = null;
    lookPointerId.current = null;
    setKnob(0, 0);
    setSprinting(false);
    setCrouching(false);
    setFocusing(false);
    if (jumpTimer.current !== null) {
      window.clearTimeout(jumpTimer.current);
      jumpTimer.current = null;
    }
    onUpdateInput((prev) => ({
      ...prev,
      moveVector: { x: 0, y: 0 },
      lookDelta: { x: 0, y: 0 },
      isSprinting: false,
      isJumping: false,
      isCrouching: false,
      isFocusing: false,
    }));
  };

  // Losing focus, locking the screen, or a browser gesture must never leave a
  // finger "stuck" holding movement or an action.
  useEffect(() => {
    const onBlur = () => releaseInput();
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') releaseInput();
    };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateJoystick = (clientX: number, clientY: number) => {
    const max = joystickRadius.current;
    const dx = clientX - joystickCenter.current.x;
    const dy = clientY - joystickCenter.current.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, max);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clamped;
    const ky = Math.sin(angle) * clamped;
    setKnob(kx, ky);
    onUpdateInput((prev) => ({
      ...prev,
      moveVector: { x: kx / max, y: -ky / max },
    }));
  };

  const handleJoystickDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (joystickPointerId.current !== null || !joystickRef.current) return;
    joystickPointerId.current = event.pointerId;
    joystickRef.current.setPointerCapture(event.pointerId);
    const rect = joystickRef.current.getBoundingClientRect();
    joystickCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    joystickRadius.current = rect.width * 0.34;
    updateJoystick(event.clientX, event.clientY);
  };

  const handleJoystickMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== joystickPointerId.current) return;
    event.preventDefault();
    updateJoystick(event.clientX, event.clientY);
  };

  const handleJoystickUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== joystickPointerId.current) return;
    event.preventDefault();
    joystickPointerId.current = null;
    setKnob(0, 0);
    onUpdateInput((prev) => ({ ...prev, moveVector: { x: 0, y: 0 } }));
  };

  const handleLookDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (lookPointerId.current !== null) return;
    event.preventDefault();
    lookPointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    lastLookPos.current = { x: event.clientX, y: event.clientY };
  };

  const handleLookMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== lookPointerId.current) return;
    event.preventDefault();
    const dx = event.clientX - lastLookPos.current.x;
    const dy = event.clientY - lastLookPos.current.y;
    lastLookPos.current = { x: event.clientX, y: event.clientY };
    if (dx === 0 && dy === 0) return;
    onUpdateInput((prev) => ({
      ...prev,
      lookDelta: { x: prev.lookDelta.x + dx, y: prev.lookDelta.y + dy },
    }));
  };

  const handleLookUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== lookPointerId.current) return;
    lookPointerId.current = null;
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

  const handleJump = () => {
    onUpdateInput((p) => ({ ...p, isJumping: true }));
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
    jumpTimer.current = window.setTimeout(() => {
      onUpdateInput((p) => ({ ...p, isJumping: false }));
      jumpTimer.current = null;
    }, 150);
  };

  const startFocus = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (focusing) return;
    setFocusing(true);
    onUpdateInput((p) => ({ ...p, isFocusing: true }));
  };

  const endFocus = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setFocusing(false);
    onUpdateInput((p) => ({ ...p, isFocusing: false }));
  };

  const attackButton = (event: React.PointerEvent<HTMLButtonElement>, fn: () => void) => {
    event.preventDefault();
    event.stopPropagation();
    fn();
  };

  if (!isTouchDevice) return null;

  const activeWeapon = WEAPONS_LIST.find((w) => w.id === currentWeapon) || WEAPONS_LIST[0];

  return (
    <div className="pointer-events-none absolute inset-0 z-40 select-none overflow-hidden touch-none mobile-controls">
      {/* PORTRAIT ORIENTATION BANNER */}
      {isPortrait && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-[#0c1017]/96 p-6 text-center backdrop-blur-md">
          <div className="mb-1 flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl border-2 border-red-500 bg-red-600/20 shadow-xl">
            <RotateCcw className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="font-game text-2xl tracking-wider text-white">PLEASE ROTATE DEVICE</h2>
          <div className="font-bangla text-base font-bold text-emerald-400">
            অনুগ্রহ করে ফোনটি ঘুরিয়ে ল্যান্ডস্কেপ করুন!
          </div>
          <p className="max-w-xs text-xs text-slate-400">
            Mosquito Apocalypse is built for landscape mode for wide-angle survival combat and dual-thumb ergonomics.
          </p>
        </div>
      )}

      {/* LOOK / AIM DRAG ZONE (the empty centre-right of the screen). */}
      <div
        className="mobile-look-zone pointer-events-auto opacity-0"
        onPointerDown={handleLookDown}
        onPointerMove={handleLookMove}
        onPointerUp={handleLookUp}
        onPointerCancel={handleLookUp}
        onLostPointerCapture={handleLookUp}
      />

      {/* BOTTOM-LEFT: joystick + sprint, kept fully inside the safe area. */}
      <div className="mobile-bottom-left pointer-events-none absolute z-20 flex flex-col items-center gap-1.5">
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSprint();
          }}
          className={`pointer-events-auto flex h-9 w-14 touch-none select-none items-center justify-center gap-1 rounded-full border text-[9px] font-game tracking-wider shadow-lg transition active:scale-95 ${
            sprinting
              ? 'border-amber-300 bg-amber-500 text-slate-950'
              : 'border-slate-600/80 bg-[#121620]/90 text-slate-300'
          }`}
          aria-pressed={sprinting}
          aria-label="Toggle sprint"
        >
          <Wind className="h-3.5 w-3.5" />
          RUN
        </button>

        <div
          ref={joystickRef}
          onPointerDown={handleJoystickDown}
          onPointerMove={handleJoystickMove}
          onPointerUp={handleJoystickUp}
          onPointerCancel={handleJoystickUp}
          onLostPointerCapture={handleJoystickUp}
          className="pointer-events-auto relative flex h-28 w-28 touch-none select-none items-center justify-center rounded-full border-2 border-slate-600/90 bg-[#121620]/85 shadow-2xl backdrop-blur-md"
          role="application"
          aria-label="Movement joystick"
        >
          <div className="pointer-events-none absolute h-[62%] w-[62%] rounded-full border border-slate-600/40" />
          <div className="pointer-events-none absolute h-px w-full bg-slate-600/25" />
          <div className="pointer-events-none absolute h-full w-px bg-slate-600/25" />
          <div
            ref={knobRef}
            className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-300/80 bg-gradient-to-br from-slate-700 to-slate-900 shadow-xl will-change-transform"
          >
            <Crosshair className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* BOTTOM-CENTRE: all five weapons, always visible. */}
      {onSelectWeapon && (
        <div className="mobile-weapon-dock pointer-events-auto absolute z-20 flex items-center gap-1 rounded-2xl border border-slate-700/70 bg-[#121620]/92 px-1.5 py-1.5 shadow-2xl backdrop-blur-md">
          {WEAPONS_LIST.map((weapon) => {
            const isActive = currentWeapon === weapon.id;
            return (
              <button
                key={weapon.id}
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectWeapon(weapon.id);
                }}
                className={`relative flex h-10 w-10 touch-none select-none items-center justify-center rounded-xl border text-lg transition active:scale-90 ${
                  isActive
                    ? 'border-red-500 bg-red-600/30 text-white shadow-lg shadow-red-700/30'
                    : 'border-slate-700/80 bg-slate-900/70 text-slate-400'
                }`}
                aria-pressed={isActive}
                aria-label={`Select ${weapon.label}`}
              >
                <span className="leading-none">{weapon.icon}</span>
                <span
                  className={`absolute -left-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-mono font-bold ${
                    isActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {weapon.short}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* BOTTOM-RIGHT: contextual prompt + consistent action grid. */}
      <div className="mobile-bottom-right pointer-events-none absolute z-20 flex flex-col items-end gap-1.5">
        {canInteract && (
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onInteract();
            }}
            className="pointer-events-auto flex max-w-[13rem] touch-none select-none items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-amber-500 px-3 py-1.5 text-[10px] font-game tracking-wide text-slate-950 shadow-2xl animate-pulse active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 shrink-0 fill-slate-950" />
            <span className="truncate">{interactionPrompt || 'INTERACT'}</span>
          </button>
        )}

        <div className="mobile-action-cluster grid grid-cols-3 grid-rows-3 gap-1.5">
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleFlashlight();
            }}
            className={`${CLUSTER_BUTTON} ${
              isFlashlightOn
                ? 'border-amber-300 bg-amber-500 text-slate-950'
                : 'border-slate-600 bg-[#121620]/92 text-slate-300'
            }`}
            style={{ gridColumn: 1, gridRow: 1 }}
            aria-label="Toggle flashlight"
            aria-pressed={isFlashlightOn}
          >
            <Flashlight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleJump();
            }}
            className={`${CLUSTER_BUTTON} border-slate-600 bg-[#121620]/92 text-slate-100`}
            style={{ gridColumn: 2, gridRow: 1 }}
            aria-label="Jump"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <button
            type="button"
            onPointerDown={(event) => attackButton(event, onAttackSecondary)}
            className={`${CLUSTER_BUTTON} border-amber-500/70 bg-[#121620]/92 text-amber-300`}
            style={{ gridColumn: 3, gridRow: 1 }}
            aria-label="Secondary attack"
          >
            <Zap className="h-5 w-5" />
          </button>

          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleCrouch();
            }}
            className={`${CLUSTER_BUTTON} ${
              crouching
                ? 'border-amber-300 bg-amber-500 text-slate-950'
                : 'border-slate-600 bg-[#121620]/92 text-slate-300'
            }`}
            style={{ gridColumn: 1, gridRow: 2 }}
            aria-label="Toggle crouch"
            aria-pressed={crouching}
          >
            <PersonStanding className="h-5 w-5" />
          </button>

          <button
            type="button"
            onPointerDown={startFocus}
            onPointerUp={endFocus}
            onPointerCancel={endFocus}
            onPointerLeave={endFocus}
            className={`${CLUSTER_BUTTON} ${
              focusing
                ? 'border-emerald-300 bg-emerald-500 text-slate-950'
                : 'border-slate-600 bg-[#121620]/92 text-emerald-400'
            }`}
            style={{ gridColumn: 1, gridRow: 3 }}
            aria-label="Hold to focus aim"
            aria-pressed={focusing}
          >
            <Crosshair className="h-5 w-5" />
          </button>

          <button
            type="button"
            onPointerDown={(event) => attackButton(event, onAttackPrimary)}
            className="pointer-events-auto col-span-2 row-span-2 flex touch-none select-none flex-col items-center justify-center rounded-full border-2 border-rose-400/90 bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 text-white shadow-[0_0_22px_rgba(225,29,72,0.55)] transition active:scale-95"
            style={{ gridColumn: '2 / span 2', gridRow: '2 / span 2' }}
            aria-label={`Attack with ${activeWeapon.label}`}
          >
            <span className="text-3xl leading-none">{activeWeapon.icon}</span>
            <span className="mt-0.5 font-game text-[9px] uppercase tracking-wider text-rose-100">
              Attack
            </span>
          </button>
        </div>

        <div className="pointer-events-none flex items-center gap-1 pr-1 text-[9px] font-mono text-slate-400">
          <Hand className="h-3 w-3" />
          <span>{isPaused ? 'PAUSED' : activeWeapon.label.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

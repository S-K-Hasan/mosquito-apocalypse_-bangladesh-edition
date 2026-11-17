import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../hooks/useFullscreen';

interface FullscreenButtonProps {
  variant?: 'menu' | 'game' | 'pause';
  className?: string;
}

/**
 * User-gesture fullscreen control. Renders nothing when the browser has no
 * Fullscreen API, so unsupported browsers keep working normally.
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  variant = 'game',
  className = '',
}) => {
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen('game-root');

  if (!isSupported) return null;

  const label = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

  if (variant === 'pause') {
    return (
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className={`w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-slate-700 ${className}`}
        aria-label={label}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        {isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}
      </button>
    );
  }

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className={`fullscreen-fab pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#121620]/90 px-3 py-2 text-xs font-bold text-slate-200 shadow-xl backdrop-blur-md transition hover:border-emerald-500/70 hover:text-white active:scale-95 ${className}`}
        aria-label={label}
        title={label}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void toggleFullscreen()}
      className={`pointer-events-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-900/90 text-slate-200 shadow transition hover:bg-slate-700 active:scale-90 ${className}`}
      aria-label={label}
      title={label}
    >
      {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
    </button>
  );
};

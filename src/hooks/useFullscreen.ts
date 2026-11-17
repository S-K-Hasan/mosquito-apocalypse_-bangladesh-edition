import { useCallback, useEffect, useState } from 'react';

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msFullscreenElement?: Element | null;
  msExitFullscreen?: () => Promise<void> | void;
};

type VendorFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type OrientationLock = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
};

function fullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null;
  const doc = document as WebkitDocument;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement as VendorFullscreenElement;
  return Boolean(
    el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen
  );
}

/**
 * Small fullscreen controller shared by the menu, HUD and pause screen.
 * Every call is made from a real click/pointer handler so it satisfies the
 * browser's user-gesture requirement. Unsupported or rejected requests simply
 * leave the game in windowed mode.
 */
export function useFullscreen(targetId: string = 'game-root') {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    Boolean(fullscreenElement())
  );
  const [isSupported] = useState<boolean>(() => isFullscreenSupported());

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const sync = () => setIsFullscreen(Boolean(fullscreenElement()));
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync as EventListener);
    document.addEventListener('MSFullscreenChange', sync as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync as EventListener);
      document.removeEventListener('MSFullscreenChange', sync as EventListener);
    };
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (!fullscreenElement()) return;
    const doc = document as WebkitDocument;
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch (err) {
      console.warn('[Fullscreen] Exit request was rejected:', err);
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (!isSupported) return;
    if (fullscreenElement()) return;

    const target =
      (document.getElementById(targetId) as VendorFullscreenElement | null) ||
      (document.documentElement as VendorFullscreenElement);

    try {
      let request: Promise<void> | void = undefined;
      if (target.requestFullscreen) {
        request = target.requestFullscreen({ navigationUI: 'hide' });
      } else if (target.webkitRequestFullscreen) {
        request = target.webkitRequestFullscreen();
      } else if (target.msRequestFullscreen) {
        request = target.msRequestFullscreen();
      }
      if (request && typeof (request as Promise<void>).catch === 'function') {
        await request;
      }

      // Landscape lock is best-effort: Android Chrome may allow it once the
      // document is genuinely fullscreen, iOS Safari does not.
      const orientation = screen.orientation as OrientationLock | undefined;
      if (orientation?.lock) {
        try {
          await orientation.lock('landscape');
        } catch {
          /* Orientation lock is optional. */
        }
      }
    } catch (err) {
      // A denied fullscreen request must never become an uncaught page error.
      console.warn('[Fullscreen] Request was rejected:', err);
    }
  }, [isSupported, targetId]);

  const toggleFullscreen = useCallback(async () => {
    if (fullscreenElement()) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  return { isFullscreen, isSupported, enterFullscreen, exitFullscreen, toggleFullscreen };
}

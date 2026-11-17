/**
 * Shared device capability helpers.
 *
 * The game normally decides between the desktop HUD and the touch HUD from the
 * browser touch capabilities. `?mobile=1` / `?mobile=0` is a QA override so the
 * touch layout can be inspected on a desktop browser without spoofing hardware.
 */

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const forced = new URLSearchParams(window.location.search).get('mobile');
  if (forced === '1' || forced === 'touch') return true;
  if (forced === '0' || forced === 'off') return false;

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Conservative low-power hint used only to pick renderer defaults. It never
 * removes gameplay features; it lowers shadow-map size and the pixel-ratio cap.
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8;
  return isTouchDevice() || cores <= 4 || memory <= 4;
}

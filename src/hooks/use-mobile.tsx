import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Viewport detection via `useSyncExternalStore` — avoids the setState-in-effect
 * pattern that newer react-hooks lint rules flag, and stays SSR-safe.
 */
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

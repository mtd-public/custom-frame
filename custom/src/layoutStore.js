// Saves the layout on the device (browser storage), so a rearranged frame survives reboots.
// Storage can be missing or throw in some WebView setups: every access is guarded and the
// app falls back to the default layout.
import { DEFAULT_LAYOUT, WIDGETS, COLS, ROWS } from './widgets/index.js';

const KEY = 'custom-frame.layout.v1';

export function loadLayout() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const items = JSON.parse(raw).filter((it) => WIDGETS[it.type]);
      if (items.length) return items;
    }
  } catch (e) { /* fall through */ }
  return DEFAULT_LAYOUT.map((it) => ({ ...it }));
}

export function saveLayout(items) {
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* ignore */ }
}

export function clearLayout() {
  try { window.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}

/** First free spot for a w×h widget on the 12×8 board, or null if it doesn't fit. */
export function findSpot(items, w, h) {
  const taken = (x, y) => items.some((it) => x < it.x + it.w && x + w > it.x && y < it.y + it.h && y + h > it.y);
  for (let y = 0; y + h <= ROWS; y++) {
    for (let x = 0; x + w <= COLS; x++) {
      if (!taken(x, y)) return { x, y };
    }
  }
  return null;
}

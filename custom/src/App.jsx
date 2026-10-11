import { useCallback, useEffect, useMemo, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { createScaledStrategy, transformStrategy, getCompactor } from 'react-grid-layout/core';
import { WIDGETS, COLS, ROWS, DEFAULT_LAYOUT } from './widgets/index.js';
import { loadLayout, saveLayout, clearLayout, findSpot } from './layoutStore.js';
import Icon from './Icon.jsx';

// The frame's panel. Everything is laid out at this size; a desktop browser scales it to fit.
const W = 1280, H = 800, GAP = 16;
const ROW_H = (H - GAP * (ROWS + 1)) / ROWS; // 82px: 8 rows fill the screen exactly

// A fixed screen can't scroll, so widgets never push each other off the board:
// no compaction (things stay where you put them) and a move onto another widget snaps back.
const COMPACTOR = getCompactor(null, false, true);
const inBounds = (l) => l.x >= 0 && l.y >= 0 && l.x + l.w <= COLS && l.y + l.h <= ROWS;

function useStageScale() {
  const calc = () => Math.min(window.innerWidth / W, window.innerHeight / H);
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const on = () => setScale(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return Math.abs(scale - 1) < 0.01 ? 1 : scale;
}

export default function App() {
  const [items, setItems] = useState(loadLayout);
  const [editing, setEditing] = useState(false);
  const [palette, setPalette] = useState(false);
  const [barTop, setBarTop] = useState(false); // the edit bar can flip so it never hides a widget
  const [flash, setFlash] = useState('');
  const [gridRev, setGridRev] = useState(0);
  const scale = useStageScale();

  useEffect(() => { saveLayout(items); }, [items]);
  useEffect(() => { window.__frameStarted = true; }, []);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(''), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  // The grid reports positions only; keep each item's type and props alongside.
  const onLayoutChange = useCallback((layout) => {
    // Belt and braces: never save an off-screen layout; remount the grid so it snaps back.
    if (!layout.every(inBounds)) { setGridRev((r) => r + 1); return; }
    setItems((prev) => layout.map((l) => {
      const it = prev.find((p) => p.i === l.i) || {};
      return { ...it, i: l.i, x: l.x, y: l.y, w: l.w, h: l.h };
    }));
  }, []);

  const add = (type) => {
    const def = WIDGETS[type];
    const spot = findSpot(items, def.w, def.h) || findSpot(items, def.minW, def.minH);
    if (!spot) { setFlash(`No room for ${def.title}. Shrink or remove a widget first.`); return; }
    const fits = findSpot(items, def.w, def.h);
    const w = fits ? def.w : def.minW, h = fits ? def.h : def.minH;
    setItems((prev) => prev.concat({ i: `${type}-${Date.now().toString(36)}`, type, ...spot, w, h }));
    setPalette(false);
  };
  const remove = (id) => setItems((prev) => prev.filter((it) => it.i !== id));
  const setProps = (id, props) => setItems((prev) => prev.map((it) => (it.i === id ? { ...it, props } : it)));
  const reset = () => { clearLayout(); setItems(DEFAULT_LAYOUT.map((it) => ({ ...it }))); };

  const layout = useMemo(() => items.map((it) => {
    const def = WIDGETS[it.type];
    return { i: it.i, x: it.x, y: it.y, w: it.w, h: it.h, minW: def.minW, minH: def.minH };
  }), [items]);

  const positionStrategy = useMemo(
    () => (scale === 1 ? transformStrategy : createScaledStrategy(scale)),
    [scale],
  );

  return (
    <div className="viewport">
      <div
        className={'stage' + (editing ? ' is-editing' : '')}
        style={{ width: W, height: H, transform: scale === 1 ? undefined : `scale(${scale})` }}
      >
        <GridLayout
          key={gridRev}
          width={W}
          layout={layout}
          gridConfig={{ cols: COLS, rowHeight: ROW_H, margin: [GAP, GAP], containerPadding: [GAP, GAP], maxRows: ROWS }}
          dragConfig={{ enabled: editing, bounded: true, cancel: '.no-drag, textarea, button, input' }}
          resizeConfig={{ enabled: editing, handles: ['se'] }}
          compactor={COMPACTOR}
          positionStrategy={positionStrategy}
          autoSize={false}
          style={{ height: H }}
          onLayoutChange={onLayoutChange}
        >
          {items.map((it) => {
            const Widget = WIDGETS[it.type].component;
            return (
              <div key={it.i} className={'card card--' + it.type}>
                <Widget
                  size={{ w: it.w, h: it.h }}
                  props={it.props || {}}
                  editing={editing}
                  onProps={(p) => setProps(it.i, p)}
                />
                {editing && (
                  <button className="card__remove no-drag" aria-label={`Remove ${WIDGETS[it.type].title}`} onClick={() => remove(it.i)}>
                    <Icon name="x" size={22} />
                  </button>
                )}
              </div>
            );
          })}
        </GridLayout>

        {editing && (
          <div className={'editbar' + (barTop ? ' is-top' : '')}>
            <span className="editbar__hint">Drag to move · corner to resize</span>
            <button className="editbar__flip" aria-label="Move this bar" onClick={() => setBarTop((v) => !v)}>
              {barTop ? '↓ Bar down' : '↑ Bar up'}
            </button>
            <button onClick={() => setPalette((v) => !v)}><Icon name="plus" size={22} /> Add widget</button>
            <button onClick={reset}><Icon name="undo" size={22} /> Reset</button>
            <button className="is-primary" onClick={() => { setEditing(false); setPalette(false); }}><Icon name="check" size={22} /> Done</button>
          </div>
        )}
        {editing && palette && (
          <div className={'palette' + (barTop ? ' is-top' : '')}>
            {Object.entries(WIDGETS).map(([type, def]) => (
              <button key={type} onClick={() => add(type)}>
                <b>{def.title}</b><small>{def.w}×{def.h}</small>
              </button>
            ))}
          </div>
        )}
        {!editing && (
          <button className="gear" aria-label="Edit layout" onClick={() => setEditing(true)}>
            <Icon name="sliders" size={22} />
          </button>
        )}
        {flash && <div className="flash">{flash}</div>}
      </div>
    </div>
  );
}

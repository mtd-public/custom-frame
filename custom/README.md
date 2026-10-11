# custom/ — drag-and-drop frame dashboard

A React version of the frame dashboard where the screen is a 12 × 8 grid of widgets you can
rearrange on the frame itself. It sits next to Wes's vanilla dashboard in `../dashboard/`
and reuses its mock data, icons and design tokens, so both stay in sync with upstream.

## Run it

```sh
cd custom
npm install
npm run dev        # http://localhost:5174, also on your LAN (host: true)
npm run build      # dist/, targets Android WebView 106 like ../dashboard
npm run preview    # serves dist/ on port 4174, LAN-visible
```

A desktop browser scales the 1280 × 800 stage to fit the window; on the frame it is 1:1.

## Using it on the frame

- **Edit mode:** tap the faint sliders icon in the bottom-right corner.
  Drag a widget to move it, drag its corner to resize, the × removes it,
  **Add widget** opens the palette, **Reset** returns to the default layout,
  **Bar up / Bar down** moves the toolbar if it covers a widget.
- A move onto another widget snaps back. Nothing is pushed off the screen, because the frame
  can't scroll.
- The layout is saved in the frame's browser storage (`custom-frame.layout.v1`), so it survives
  reboots. Each device keeps its own layout.

## Point the kiosk app at it

Host `dist/` somewhere the frame can reach, either:

- **Cloudflare Workers:** `npx wrangler login`, then `npm run deploy`. You get
  `https://custom-frame.<your-subdomain>.workers.dev/`.
- **A computer on your LAN:** `npm run preview`, then use `http://<computer-ip>:4174/`.

Then, once the kiosk app is installed (see `../dashboard/kiosk/`), set the URL over ADB.
It is remembered across reboots, so there's no rebuild:

```sh
adb shell am start -a android.intent.action.VIEW -d https://custom-frame.<you>.workers.dev/ -n com.wesbos.homehq/.MainActivity
# back to Wes's demo:  ... -d default ...
```

## Extend it

| File | What it is |
| --- | --- |
| `src/widgets/basic.jsx` | The starter widgets. Each gets `{ size: {w, h}, props, editing, onProps }` |
| `src/widgets/index.js` | The registry (title, default and minimum size) and `DEFAULT_LAYOUT` |
| `src/data/index.js` | **The data swap point.** Mock data today; replace `loadData()` or call `setData()` after a fetch |
| `src/layoutStore.js` | Saving/loading the layout, and finding free space for a new widget |
| `src/App.jsx` | The grid, edit mode, toolbar and palette |
| `src/styles/app.css` | Styles. Keep to WebView 106: no CSS nesting, `color-mix()`, `oklch()`, or 4/8-digit hex colours |

To add a widget: write a component in `basic.jsx` (or a new file), then add one line to `WIDGETS`.
It appears in the palette automatically.

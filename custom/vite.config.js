import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Same browser targets as Wes's dashboard: the frame runs Android WebView 106.
// cssTarget stays at chrome61 because that WebView rejects 4/8-digit hex colours,
// which a newer target lets the minifier emit (see ../dashboard/vite.config.js).
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'chrome106',
    cssTarget: 'chrome61',
  },
  // fs.allow '..' lets dev mode read Wes's mock data in ../dashboard/js/data.js.
  server: { host: true, port: 5174, fs: { allow: ['..'] } },
  preview: { host: true, port: 4174 },
});

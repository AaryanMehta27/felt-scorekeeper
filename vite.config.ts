import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base ("./") makes the built app work both at a domain root
// (Vercel) and under a sub-path (GitHub Pages project sites) with no
// extra configuration. The app is a single page with no client-side
// router, so relative asset URLs resolve correctly everywhere.
export default defineConfig({
  base: './',
  plugins: [react()],
});

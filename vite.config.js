import { resolve } from "path";
import { defineConfig } from "vite";

// Multi-page setup: the dashboard and the saved page are separate HTML entries.
// BASE_URL is set to the repo name in CI so asset paths work on GitHub Pages.
export default defineConfig({
  base: process.env.BASE_URL || "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        saved: resolve(__dirname, "saved.html"),
      },
    },
  },
});

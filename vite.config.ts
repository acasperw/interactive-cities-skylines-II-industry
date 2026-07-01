import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Pages project sites the app is served from
// https://<user>.github.io/<repo>/ so the base must match the repo name.
// Set to "/" if you deploy to a custom domain or a user/org root page.
export default defineConfig({
  base: "/interactive-cities-skylines-II-industry/",
  plugins: [react()],
});

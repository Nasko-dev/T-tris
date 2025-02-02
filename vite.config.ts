// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/T-tris/", // Doit correspondre exactement au nom de votre dépôt
  plugins: [react()],
});

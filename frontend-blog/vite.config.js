import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Create an alias for the Shared folder
      "@shared": path.resolve(__dirname, "../Shared"),
    },
  },
  server: {
    fs: {
      // Allow Vite to serve files from one level up (the Shared folder)
      allow: [".."],
    },
  },
});
 
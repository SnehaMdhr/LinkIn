import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
const keyPath = path.resolve(__dirname, "localhost+2-key.pem");
const certPath = path.resolve(__dirname, "localhost+2.pem");
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);
const httpsOptions = hasCerts
  ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  : false;

if (!hasCerts) {
  console.log("[Vite] SSL certs not found in frontend/. Dev server will use HTTP.");
}

export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsOptions,
    port: 3000,
  },
});

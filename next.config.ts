import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Turbopack tome por error el yarn.lock del perfil de Windows
  // como raíz del proyecto.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

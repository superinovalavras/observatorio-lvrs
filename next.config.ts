import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Logos sobem por Server Action: até 1 MB de imagem + folga do multipart.
  experimental: { serverActions: { bodySizeLimit: "1.2mb" } },
};

export default nextConfig;

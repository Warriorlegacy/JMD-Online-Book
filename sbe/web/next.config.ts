import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Webpack/Turbopack from bundling native Node.js modules
  serverExternalPackages: ["pg", "pg-native", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;

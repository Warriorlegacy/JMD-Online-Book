import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "pg-native", "bcryptjs"],
  turbopack: {
    root: path.resolve(__dirname),
  },
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

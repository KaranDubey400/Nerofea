import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'jtopjneotszhuxxbmhxn.supabase.co',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

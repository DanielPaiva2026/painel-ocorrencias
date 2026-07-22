import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.119', '127.0.0.1', 'localhost'],
};

export default nextConfig;

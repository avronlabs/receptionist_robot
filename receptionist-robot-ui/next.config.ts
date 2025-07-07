import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  devIndicators: true
};

module.exports = nextConfig;

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Surface TypeScript errors at build time. The codebase should be clean.
  typescript: {
    ignoreBuildErrors: false,
  },
  // NOTE: Next.js 16 removed the built-in `eslint.ignoreDuringBuilds` flag
  // (and `next lint`). Lint is now run via `npm run lint` (eslint .) in CI.
  reactStrictMode: false,
  // Allow larger request bodies for image uploads (FormData with images up to 25MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  // Allow next/image to load from Vercel Blob storage (future-proofing).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.vercel-storage.com" },
      { protocol: "https", hostname: "vercel-storage.com" },
    ],
  },
  // Security: don't expose the Next.js version in response headers.
  poweredByHeader: false,
};

export default nextConfig;

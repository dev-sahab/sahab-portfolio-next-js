import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
  },
  sassOptions: {
    // `sass-loader` forwards this to Dart Sass's modern API, which reads
    // `loadPaths` — `includePaths` is the legacy node-sass/renderSync name
    // and is silently ignored here, breaking bare `@use 'variables'` imports.
    loadPaths: [path.join(__dirname, 'styles')],
  },
}

export default nextConfig

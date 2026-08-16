import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  // jsdom (pulled in by isomorphic-dompurify, used to sanitize post/project
  // HTML) has a transitive ESM-only dependency (html-encoding-sniffer ->
  // @exodus/bytes-encoding-lite). Bundling it triggers ERR_REQUIRE_ESM at
  // runtime on Vercel — leave it unbundled so Node's own resolver handles it.
  serverExternalPackages: ['jsdom', 'isomorphic-dompurify'],
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

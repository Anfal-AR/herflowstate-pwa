/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  assetPrefix: undefined,
  basePath: '',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  }
}

module.exports = nextConfig
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Docker 部署必要
  experimental: {
    // serverActions: true,
  },
}

export default nextConfig

import type { NextConfig } from "next";

import { buildSecurityHeaders } from './lib/security/headers';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: '/:path*', headers: buildSecurityHeaders(process.env.NODE_ENV === 'production') }];
  },
};

export default nextConfig;

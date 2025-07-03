import initializeBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';
import type { NextConfig } from 'next';


// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com'
            },
            {
                protocol: 'https',
                hostname: 'ui.shadcn.com'
            }
        ]
    }
};

const withPwa = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development'
});

export default withBundleAnalyzer(withPwa(nextConfig));

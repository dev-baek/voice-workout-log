import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@toss/tds-mobile', '@toss/tds-mobile-ait'],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;

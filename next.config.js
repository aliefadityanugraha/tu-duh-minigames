const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias['@shared'] = path.join(__dirname, 'shared');
    return config;
  },
}

module.exports = nextConfig

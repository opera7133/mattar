/** @type {import('next').NextConfig} */
const { version } = require('./package.json')
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      port: '',
      pathname: '/mattarli/image/upload/**',
    },],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      loader: 'html-loader',
    })
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
      {
        source: '/api/account/create',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://mattar.wmsci.com',
          },
        ],
      },
    ]
  },
  publicRuntimeConfig: {
    version,
  },
}

module.exports = withPWA(nextConfig);

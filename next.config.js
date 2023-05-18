/** @type {import('next').NextConfig} */
const { version } = require('./package.json')

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
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

module.exports = nextConfig

/** @type {import('next').NextConfig} */
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
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://mattar-li.vercel.app',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

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
}

module.exports = nextConfig

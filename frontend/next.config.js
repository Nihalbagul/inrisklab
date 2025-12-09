/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 'standalone' is for Docker deployment
  // Remove this for Netlify/Vercel deployment, or use 'export' for static export
  // output: 'standalone',  // Commented out for Netlify
}

module.exports = nextConfig


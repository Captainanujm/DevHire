/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🛑 FIX: Configure Next.js to treat react-dom/server as an external dependency.
  // This resolves the build error caused by importing react-dom/server in the API Route Handler.
  serverExternalPackages: ['react-dom/server'],
};

export default nextConfig;
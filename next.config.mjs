/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Vercel limit is 4.5MB
    },
    responseLimit: false,
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;

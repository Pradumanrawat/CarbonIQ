

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    MONGO_URI: process.env.MONGO_URI,
  },
};

export default nextConfig;

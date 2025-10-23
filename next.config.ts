/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows all HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // optional: allows all HTTP domains (less secure)
      },
    ],
  },
};

module.exports = nextConfig;

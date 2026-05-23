/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  
  // Custom headers to resolve Google AdSense preview iframe blocking
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Allow self and all verified Google/DoubleClick AdSense preview domains to embed our pages
            value: "frame-ancestors 'self' https://*.google.com https://*.doubleclick.net https://*.googleads.g.doubleclick.net https://admanager.google.com https://partner.googleadservices.com;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;

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
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      // Indian & global news image sources
      { protocol: 'https', hostname: 'bl-i.thgim.com' },
      { protocol: 'https', hostname: '*.thgim.com' },
      { protocol: 'https', hostname: 'images.indianexpress.com' },
      { protocol: 'https', hostname: 's.yimg.com' },
      { protocol: 'https', hostname: 'www.livemint.com' },
      { protocol: 'https', hostname: 'img.etimg.com' },
      { protocol: 'https', hostname: 'images.news18.com' },
      { protocol: 'https', hostname: 'static.phoenix.ms' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
      { protocol: 'https', hostname: '*.ndtvimg.com' },
      { protocol: 'https', hostname: '*.hindustantimes.com' },
      { protocol: 'https', hostname: '*.thehindu.com' },
      { protocol: 'https', hostname: '*.toi.in' },
      { protocol: 'https', hostname: '*.indiatoday.in' },
      { protocol: 'https', hostname: '*.cricbuzz.com' },
      { protocol: 'https', hostname: '*.espncricinfo.com' },
      { protocol: 'https', hostname: '*.vogue.in' },
      { protocol: 'https', hostname: 'cdn-images-1.medium.com' },
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

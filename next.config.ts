import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-eval' https://www.google.com https://www.gstatic.com;", // add nonce or hashes if you can
      "style-src 'self' 'unsafe-inline';", // consider using non-inline styles and removing 'unsafe-inline'
      "img-src 'self' data: blob: https:;",
      "connect-src 'self' https://www.google.com https://www.gstatic.com; ",
      "font-src 'self' https://fonts.gstatic.com data:;",
      "frame-src https://www.google.com;", // for reCAPTCHA iframes
      "base-uri 'self';",
      "form-action 'self';",
      "frame-ancestors 'none';", // also protects against clickjacking (see section 3)
      "upgrade-insecure-requests;",
    ].join(" "),
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  /**
   * Keep hashed `/_next/static/*` on Next/Vercel immutable caching.
   * Only force HTML/document routes to revalidate so a post-deploy tab
   * cannot keep an old document that points at removed chunk URLs.
   */
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|.*\\..*).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Small classic bootstrap; avoid long-lived cache so deploy updates apply.
        source: "/browser-support.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

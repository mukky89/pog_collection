/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Obrázky sa nastreamujú priamo do prehliadača (bez server-side
    // optimalizácie). Vďaka tomu fungujú externé skiny (DiceBear) aj SVG
    // nezávisle od egress politiky servera.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;

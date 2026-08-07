import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/boardgames",
  trailingSlash: true,
  images: { unoptimized: true },
  // Allow importing BBGE packages from /bbge outside src/
  experimental: {
    externalDir: true,
  },
};

export default withNextIntl(nextConfig);

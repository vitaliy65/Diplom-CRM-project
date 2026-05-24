/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  analyzerMode: "json", // Генерує файл статистики замість відкриття вкладки браузера
});

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  turbopack: {},
};

module.exports = withBundleAnalyzer(nextConfig);

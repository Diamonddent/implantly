// Static export so the app can be hosted on GitHub Pages and installed as an app.
// BASE_PATH is "/implantly" for https://diamonddent.github.io/implantly (set in the deploy workflow).
const basePath = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default nextConfig;

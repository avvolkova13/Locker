import type { NextConfig } from "next";

const isGithubActionsBuild = process.env.GITHUB_ACTIONS === "true";
const githubBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGithubActionsBuild ? "/Locker" : "");

process.env.NEXT_PUBLIC_BASE_PATH = githubBasePath;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  basePath: githubBasePath || undefined,
  images: {
    unoptimized: true,
  },
  output: "export",
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
};

export default nextConfig;

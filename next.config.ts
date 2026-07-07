import type { NextConfig } from "next";

const isGithubActionsBuild = process.env.GITHUB_ACTIONS === "true";
const githubBasePath = "/Locker";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  basePath: isGithubActionsBuild ? githubBasePath : undefined,
  images: {
    unoptimized: true,
  },
  output: "export",
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
};

export default nextConfig;

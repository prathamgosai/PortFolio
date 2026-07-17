import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json sits in the parent directory, so Next infers the
  // wrong workspace root. Pin it to this project.
  turbopack: { root: __dirname },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
		dynamicIO: false,
	},
};

export default nextConfig;

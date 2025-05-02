import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
		dynamicIO: false,
		ppr: "incremental",
	},
};

export default nextConfig;

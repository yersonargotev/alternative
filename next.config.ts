import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
		dynamicIO: false,
		ppr: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
				pathname: "/u/**",
			},
			{
				protocol: "https",
				hostname: "img.clerk.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "www.google.com", // For favicons via Google's service
				port: "",
				pathname: "/s2/favicons",
			},
		],
	},
};

export default nextConfig;

"use client";
import useFetchData from "@/hooks/useFetchData";
import { Facebook, Instagram } from "lucide-react";

function SocialMediaLinks() {
	const { data: settings } = useFetchData("/api/settings", "settings");

	return (
		<div className="flex items-center gap-2">
			<a href={settings?.[0]?.facebook} target="_blank" rel="noopener noreferrer" className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-[#1877F2] text-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group" aria-label="Facebook">
				<Facebook className="w-4 h-4" />
			</a>
			<a href={settings?.[0]?.instagram} target="_blank" rel="noopener noreferrer" className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] text-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group" aria-label="Instagram">
				<Instagram className="w-4 h-4" />
			</a>
		</div>
	);
}

export default SocialMediaLinks;

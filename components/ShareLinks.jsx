"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaRedditAlien } from "react-icons/fa";

export default function ShareLinks({ title }) {
	const pathname = usePathname();
	const [fullUrl, setFullUrl] = useState("");

	useEffect(() => {
		setFullUrl(`${window.location.origin}${pathname}`);
	}, [pathname]);

	if (!fullUrl) return null;

	return (
		<div className="bg-white rounded-lg shadow-sm p-6 lg:mt-16">
			<h3 className="text-lg font-semibold text-gray-800 mb-4">Share this post</h3>
			<div className="flex space-x-3">
				<a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-200">
					<FaFacebookF />
				</a>
				<a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition duration-200">
					<FaTwitter />
				</a>
				<a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition duration-200">
					<FaLinkedinIn />
				</a>
				<a href={`https://reddit.com/submit?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition duration-200">
					<FaRedditAlien />
				</a>
			</div>
		</div>
	);
}

import Gallery from "@/components/Gallery";
import GlobalLoading from "@/components/GlobalLoading";
import React, { Suspense } from "react";
import { Metadata } from "next";
import VideoGallery from "@/components/VideoGallery";

export const metadata: Metadata = {
	title: "Gallery | PNSB-Norway",
	description: "Explore the gallery of PNSB-Norway, showcasing our events, community, and memorable moments. See the vibrant life of our organization through photos and videos.",
	openGraph: {
		title: "Gallery | PNSB-Norway",
		description: "Explore the gallery of PNSB-Norway, showcasing our events, community, and memorable moments. See the vibrant life of our organization through photos and videos.",
		url: "/gallery",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

const page = () => {
	return (
		<Suspense fallback={<GlobalLoading />}>
			<Gallery />
			<VideoGallery />
		</Suspense>
	);
};
export default page;

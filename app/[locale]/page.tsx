import Hero from "@/components/Hero";
import About from "@/components/About";
import { Metadata } from "next";
import Blogs from "@/components/Blogs";
import Gallery from "@/components/Gallery";
import VideoGallery from "@/components/VideoGallery";
// import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
	title: "Home | PNSB-Norway",
	description: "Welcome to PNSB-Norway. Explore our latest news, events, and gallery showcasing our vibrant community.",
	openGraph: {
		title: "Home | PNSB-Norway",
		description: "Welcome to PNSB-Norway. Explore our latest news, events, and gallery showcasing our vibrant community.",
		url: "/",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

export default function LandingPage() {
	return (
		<main>
			{/* <HeroSection /> */}
			<Hero />
			<About />
			<Blogs />
			<Gallery />
			<VideoGallery />
		</main>
	);
}

import Hero from "@/components/Hero";
import About from "@/components/About";
import { Metadata } from "next";
import Blogs from "@/components/Blogs";
import Gallery from "@/components/Gallery";
import VideoGallery from "@/components/VideoGallery";
import EventsTimeline from "@/components/EventsTimeline";
import NewsletterSection from "@/components/NewsletterSection";

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
			{/* Hero Section */}
			<Hero />

			{/* About Section with Statistics */}
			<About />

			{/* Featured News/Updates Section */}
			<Blogs />

			{/* Events Timeline Section */}
			<EventsTimeline />

			{/* Gallery Section */}
			<Gallery />

			{/* Video Gallery Section */}
			<VideoGallery />

			{/* Newsletter Subscription Section */}
			<NewsletterSection />
		</main>
	);
}

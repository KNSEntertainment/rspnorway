"use client";

import Hero from "@/components/Hero";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import Blog from "@/components/Blog";
import Notice from "@/components/Notice";
import UpcomingEvents from "@/components/UpcomingEvents";
// import Post from "@/components/Post";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
			<main>
				<Hero />
				{/* <Post /> */}
				<About />
				<Notice />
				<UpcomingEvents />
				<Testimonials />
				<Blog />
				<Gallery />
			</main>
		</div>
	);
}

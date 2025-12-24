"use client";

import Hero from "@/components/Hero";
import About from "@/components/About";
import Blog from "@/components/Blog";
import UpcomingEvents from "@/components/UpcomingEvents";
// import Post from "@/components/Post";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
			<main>
				<Hero />
				{/* <Post /> */}
				<About />
				<UpcomingEvents />
				<Blog />
			</main>
		</div>
	);
}

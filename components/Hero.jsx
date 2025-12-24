"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";

export default function Hero() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	// Define your slides with unique content for each
	const slides = [
		{
			image: "/rabi1.webp",
			title: "Welcome to RSP Norway",
			description: "Discover RSP Norway, where parents find the perfect blend of nurturing care and innovative learning for their toddlers.",
			primaryButton: "Explore Our School",
			primaryLink: "/about-us",
			secondaryButton: "Book School Tour",
			secondaryLink: "/school-tour-form",
			primaryColor: "##0094da",
			primaryHover: "#0093dd",
		},
		{
			image: "/rabi2.webp", // You'll need to add this image to your public folder
			title: "Where Learning Meets Imagination",
			description: "Our creative curriculum engages children through play-based learning, helping them develop essential cognitive and social skills in a safe environment.",
			primaryButton: "Our Curriculum",
			primaryLink: "/curriculum",
			secondaryButton: "Meet Our Teachers",
			secondaryLink: "/teachers",
			primaryColor: "#4A90E2",
			primaryHover: "#3A7BC8",
		},
		{
			image: "/rabi3.webp", // You'll need to add this image to your public folder
			title: "Growing Bright Minds For Tomorrow",
			description: "We provide age-appropriate activities that foster creativity, critical thinking, and a lifelong love of learning in a nurturing community.",
			primaryButton: "Enroll Today",
			primaryLink: "/admission",
			secondaryButton: "View Programs",
			secondaryLink: "/programs",
			primaryColor: "#4A90E2",
			primaryHover: "#3A7BC8",
		},
	];

	const nextSlide = useCallback(() => {
		if (isAnimating) return;

		setIsAnimating(true);
		setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

		// Reset animation state after transition completes
		setTimeout(() => setIsAnimating(false), 1000);
	}, [isAnimating, slides.length]);

	const prevSlide = useCallback(() => {
		if (isAnimating) return;

		setIsAnimating(true);
		setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

		// Reset animation state after transition completes
		setTimeout(() => setIsAnimating(false), 1000);
	}, [isAnimating, slides.length]);

	// Auto-slide functionality
	useEffect(() => {
		const interval = setInterval(() => {
			if (!isAnimating) {
				nextSlide();
			}
		}, 5000); // Change slide every 7 seconds

		return () => clearInterval(interval);
	}, [currentSlide, nextSlide, isAnimating]);

	const currentSlideData = slides[currentSlide];

	return (
		<>
			<Head>
				<title>RSP Norway</title>
			</Head>

			{/* Hero Section */}
			<section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
				{/* Background Images (one for each slide with animation) */}
				{slides.map((slide, index) => (
					<motion.div
						key={index}
						className="absolute inset-0"
						initial={{ opacity: 0 }}
						animate={{
							opacity: currentSlide === index ? 1 : 0,
							scale: currentSlide === index ? 1 : 1.1,
						}}
						transition={{ duration: 1.2, ease: "easeInOut" }}
					>
						<Image src={slide.image} alt={`RSP Norway Slide ${index + 1}`} width={1920} height={1080} className="w-full h-full object-cover" priority={index === 0} />
					</motion.div>
				))}

				{/* Dark Overlay with varying opacity based on image */}
				<motion.div className="absolute inset-0 bg-black" animate={{ opacity: 0.5 }} transition={{ duration: 0.8 }}></motion.div>

				{/* Content */}
				<div className="relative max-w-6xl leading-relaxed z-10 text-white px-6 md:px-12">
					{/* Heading */}
					<motion.h1 className="text-2xl md:text-4xl font-bold mb-4" key={`title-${currentSlide}`} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.8 }}>
						{currentSlideData.title}
					</motion.h1>

					{/* Subheading */}
					<motion.p className="text-md md:text-lg mb-8 max-w-2xl mx-auto" key={`desc-${currentSlide}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8, delay: 0.2 }}>
						{currentSlideData.description}
					</motion.p>

					{/* Buttons */}
					<motion.div className="flex flex-col md:flex-row gap-4 justify-center" key={`buttons-${currentSlide}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
						<Link href={currentSlideData.primaryLink}>
							<Button
								className={`text-white px-6 py-3 rounded-lg transition-all duration-300`}
								style={{
									backgroundColor: currentSlideData.primaryColor,
									transition: "background-color 0.3s ease",
								}}
								onMouseOver={(e) => (e.currentTarget.style.backgroundColor = currentSlideData.primaryHover)}
								onMouseOut={(e) => (e.currentTarget.style.backgroundColor = currentSlideData.primaryColor)}
							>
								{currentSlideData.primaryButton}
							</Button>
						</Link>
						<Link href={currentSlideData.secondaryLink}>
							<Button className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300">{currentSlideData.secondaryButton}</Button>
						</Link>
					</motion.div>
				</div>

				{/* Slider Navigation */}
				<div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-20">
					{slides.map((_, index) => (
						<button
							key={index}
							onClick={() => {
								if (!isAnimating) {
									setIsAnimating(true);
									setCurrentSlide(index);
									setTimeout(() => setIsAnimating(false), 1000);
								}
							}}
							className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-white w-10" : "bg-white/50 hover:bg-white/80"}`}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>

				{/* Left/Right Navigation Arrows */}
				<button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" aria-label="Previous slide">
					<ChevronLeft className="w-6 h-6" />
				</button>

				<button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" aria-label="Next slide">
					<ChevronRight className="w-6 h-6" />
				</button>
			</section>
		</>
	);
}

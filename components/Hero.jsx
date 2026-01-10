"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
export default function Hero() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const t = useTranslations("slider");
	const locale = useLocale();
	// Define your slides with unique content for each
	const slides = [
		{
			image: "/rabi1.webp",
			title: t("title_1"),
			description: t("subtitle_1"),
			primaryButton: t("become_a_member"),
			primaryLink: "/membership",
			secondaryButton: t("explore_rsp"),
			secondaryLink: "/about-us",
			primaryColor: "#0094da",
			primaryHover: "#0093dd",
		},

		{
			image: "/rabi3.webp",
			title: t("title_2"),
			description: t("subtitle_2"),
			primaryButton: t("get_involved"),
			primaryLink: "/get-involved",
			secondaryButton: t("contact_us"),
			secondaryLink: "/contact",
			primaryColor: "#0094da",
			primaryHover: "#0075b1",
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
		<div className="relative left-1/2 right-1/2 w-screen max-h-screen max-w-none -translate-x-1/2">
			<Head>
				<title>RSP Norway</title>
			</Head>

			{/* Hero Section */}
			<section
				className="relative flex items-center justify-center text-center overflow-hidden"
				role="hero"
				style={{
					height: "calc(100vh - 6rem)",
					minHeight: 320,
				}}
			>
				<style>{`
					   @media (min-width: 768px) {
						   section[role='hero'] { height: calc(100vh - 8.5rem) !important; }
					   }
				   `}</style>
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
					<motion.div className="flex gap-4 justify-center" key={`buttons-${currentSlide}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
						<Link href={currentSlideData.primaryLink} locale={locale}>
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
						<Link href={currentSlideData.secondaryLink} locale={locale}>
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
		</div>
	);
}

// import Image from "next/image";
// import React from "react";

// const Hero = () => {
// 	return (
// 		<div className={`min-h-screen flex items-center justify-center`}>
// 			<div className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden`}>
// 				<Image src="/herorabi.jpeg" alt="RSP Norway Hero" fill style={{ objectFit: "cover" }} className="absolute inset-0 w-full h-full" />
// 				<div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10" />
// 			</div>
// 		</div>
// 	);
// };

// export default Hero;

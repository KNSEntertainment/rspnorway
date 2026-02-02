"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function FullWidthHero() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const t = useTranslations("slider");
	const locale = useLocale();

	const slides = [
		{
			image: "/rabi1.webp",
			title: t("title_1"),
			description: t("subtitle_1"),
			primaryLink: "/membership",
			secondaryLink: "/about-us",
		},
		{
			image: "/rabi3.webp",
			title: t("title_2"),
			description: t("subtitle_2"),
			primaryLink: "/get-involved",
			secondaryLink: "/contact",
		},
	];

	const nextSlide = useCallback(() => {
		if (isAnimating) return;
		setIsAnimating(true);
		setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
		setTimeout(() => setIsAnimating(false), 1200);
	}, [isAnimating, slides.length]);

	const prevSlide = useCallback(() => {
		if (isAnimating) return;
		setIsAnimating(true);
		setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
		setTimeout(() => setIsAnimating(false), 1200);
	}, [isAnimating, slides.length]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!isAnimating) nextSlide();
		}, 7000);
		return () => clearInterval(interval);
	}, [currentSlide, nextSlide, isAnimating]);

	return (
		/* The trick for True Full Width:
           w-screen + relative left-1/2 -translate-x-1/2 
        */
		<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-slate-900">
			<section className="relative h-[82vh] w-full flex items-center">
				{/* Background Layer */}
				<AnimatePresence mode="wait">
					<motion.div key={currentSlide} className="absolute inset-0 z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
						<Image src={slides[currentSlide].image} alt="Background" fill className="object-cover transition-transform duration-[10s] scale-110 animate-ken-burns" priority />
						{/* Overlay: Darkens and adds a blue tint for political branding */}
						<div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/40 to-transparent z-10" />
					</motion.div>
				</AnimatePresence>

				{/* Content Layer */}
				<div className="container relative z-20 mx-auto px-6 md:px-12">
					<div className="max-w-3xl">
						<AnimatePresence mode="wait">
							<motion.div key={currentSlide} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.7, ease: "easeOut" }}>
								<h1 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">{slides[currentSlide].title}</h1>
								<p className="text-xl md:text-2xl text-blue-100/80 mb-10 leading-relaxed font-light">{slides[currentSlide].description}</p>

								<div className="flex flex-wrap gap-5">
									<Link href={slides[currentSlide].primaryLink} locale={locale}>
										<Button className="h-16 px-10 text-lg font-bold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">{t("become_a_member")}</Button>
									</Link>
									<Link href={slides[currentSlide].secondaryLink} locale={locale}>
										<Button variant="outline" className="h-16 px-10 text-lg font-bold rounded-full border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-blue-900 transition-all flex items-center gap-2">
											{t("explore_rsp")}
											<ArrowRight className="w-5 h-5" />
										</Button>
									</Link>
								</div>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

				{/* Navigation Controls */}
				<div className="absolute bottom-12 right-12 md:right-24 z-30 flex items-center gap-4">
					<button onClick={prevSlide} className="p-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-lg text-white hover:bg-white hover:text-blue-900 transition-all">
						<ChevronLeft className="w-6 h-6" />
					</button>

					{/* Progress Indicator */}
					<div className="flex gap-2">
						{slides.map((_, i) => (
							<div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${currentSlide === i ? "w-12 bg-blue-500" : "w-4 bg-white/30"}`} />
						))}
					</div>

					<button onClick={nextSlide} className="p-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-lg text-white hover:bg-white hover:text-blue-900 transition-all">
						<ChevronRight className="w-6 h-6" />
					</button>
				</div>
			</section>

			{/* Global CSS for Ken Burns Effect */}
			<style jsx global>{`
				@keyframes kenburns {
					from {
						transform: scale(1);
					}
					to {
						transform: scale(1.15);
					}
				}
				.animate-ken-burns {
					animation: kenburns 20s ease-out infinite alternate;
				}
			`}</style>
		</div>
	);
}

// "use client";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Link } from "@/i18n/navigation";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { useCallback, useState, useEffect } from "react";
// import Head from "next/head";
// import Image from "next/image";
// import { useTranslations, useLocale } from "next-intl";
// export default function Hero() {
// 	const [currentSlide, setCurrentSlide] = useState(0);
// 	const [isAnimating, setIsAnimating] = useState(false);
// 	const t = useTranslations("slider");
// 	const locale = useLocale();
// 	// Define your slides with unique content for each
// 	const slides = [
// 		{
// 			image: "/rabi1.webp",
// 			title: t("title_1"),
// 			description: t("subtitle_1"),
// 			primaryButton: t("become_a_member"),
// 			primaryLink: "/membership",
// 			secondaryButton: t("explore_rsp"),
// 			secondaryLink: "/about-us",
// 			primaryColor: "#0094da",
// 			primaryHover: "#0093dd",
// 		},

// 		{
// 			image: "/rabi3.webp",
// 			title: t("title_2"),
// 			description: t("subtitle_2"),
// 			primaryButton: t("get_involved"),
// 			primaryLink: "/get-involved",
// 			secondaryButton: t("contact_us"),
// 			secondaryLink: "/contact",
// 			primaryColor: "#0094da",
// 			primaryHover: "#0075b1",
// 		},
// 	];

// 	const nextSlide = useCallback(() => {
// 		if (isAnimating) return;

// 		setIsAnimating(true);
// 		setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

// 		// Reset animation state after transition completes
// 		setTimeout(() => setIsAnimating(false), 1000);
// 	}, [isAnimating, slides.length]);

// 	const prevSlide = useCallback(() => {
// 		if (isAnimating) return;

// 		setIsAnimating(true);
// 		setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

// 		// Reset animation state after transition completes
// 		setTimeout(() => setIsAnimating(false), 1000);
// 	}, [isAnimating, slides.length]);

// 	// Auto-slide functionality
// 	useEffect(() => {
// 		const interval = setInterval(() => {
// 			if (!isAnimating) {
// 				nextSlide();
// 			}
// 		}, 5000); // Change slide every 7 seconds

// 		return () => clearInterval(interval);
// 	}, [currentSlide, nextSlide, isAnimating]);

// 	const currentSlideData = slides[currentSlide];

// 	return (
// 		<div className="relative left-1/2 right-1/2 w-screen max-h-screen max-w-none -translate-x-1/2">
// 			<Head>
// 				<title>RSP Norway</title>
// 			</Head>

// 			{/* Hero Section */}
// 			<section
// 				className="relative flex items-center justify-center text-center overflow-hidden"
// 				role="hero"
// 				style={{
// 					height: "calc(100vh - 6rem)",
// 					minHeight: 320,
// 				}}
// 			>
// 				<style>{`
// 					   @media (min-width: 768px) {
// 						   section[role='hero'] { height: calc(100vh - 8.5rem) !important; }
// 					   }
// 				   `}</style>
// 				{/* Background Images (one for each slide with animation) */}
// 				{slides.map((slide, index) => (
// 					<motion.div
// 						key={index}
// 						className="absolute inset-0"
// 						initial={{ opacity: 0 }}
// 						animate={{
// 							opacity: currentSlide === index ? 1 : 0,
// 							scale: currentSlide === index ? 1 : 1.1,
// 						}}
// 						transition={{ duration: 1.2, ease: "easeInOut" }}
// 					>
// 						<Image src={slide.image} alt={`RSP Norway Slide ${index + 1}`} width={600} height={600} className="w-full h-full object-cover" priority={index === 0} fetchPriority="high" />
// 					</motion.div>
// 				))}

// 				{/* Dark Overlay with varying opacity based on image */}
// 				<motion.div className="absolute inset-0 bg-black" animate={{ opacity: 0.5 }} transition={{ duration: 0.8 }}></motion.div>

// 				{/* Content */}
// 				<div className="relative max-w-6xl leading-relaxed z-10 text-white px-6 md:px-12">
// 					{/* Heading */}
// 					<motion.h1 className="text-2xl md:text-4xl font-bold mb-4" key={`title-${currentSlide}`} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.8 }}>
// 						{currentSlideData.title}
// 					</motion.h1>

// 					{/* Subheading */}
// 					<motion.p className="text-md md:text-lg mb-8 max-w-2xl mx-auto" key={`desc-${currentSlide}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8, delay: 0.2 }}>
// 						{currentSlideData.description}
// 					</motion.p>

// 					{/* Buttons */}
// 					<motion.div className="flex gap-4 justify-center" key={`buttons-${currentSlide}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
// 						<Link href={currentSlideData.primaryLink} locale={locale}>
// 							<Button
// 								className={`text-white px-6 py-3 rounded-lg transition-all duration-300`}
// 								style={{
// 									backgroundColor: currentSlideData.primaryColor,
// 									transition: "background-color 0.3s ease",
// 								}}
// 								onMouseOver={(e) => (e.currentTarget.style.backgroundColor = currentSlideData.primaryHover)}
// 								onMouseOut={(e) => (e.currentTarget.style.backgroundColor = currentSlideData.primaryColor)}
// 							>
// 								{currentSlideData.primaryButton}
// 							</Button>
// 						</Link>
// 						<Link href={currentSlideData.secondaryLink} locale={locale}>
// 							<Button className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300">{currentSlideData.secondaryButton}</Button>
// 						</Link>
// 					</motion.div>
// 				</div>

// 				{/* Slider Navigation */}
// 				<div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-20">
// 					{slides.map((_, index) => (
// 						<button
// 							key={index}
// 							onClick={() => {
// 								if (!isAnimating) {
// 									setIsAnimating(true);
// 									setCurrentSlide(index);
// 									setTimeout(() => setIsAnimating(false), 1000);
// 								}
// 							}}
// 							className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-white w-10" : "bg-white/50 hover:bg-white/80"}`}
// 							aria-label={`Go to slide ${index + 1}`}
// 						/>
// 					))}
// 				</div>

// 				{/* Left/Right Navigation Arrows */}
// 				<button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" aria-label="Previous slide">
// 					<ChevronLeft className="w-6 h-6" />
// 				</button>

// 				<button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" aria-label="Next slide">
// 					<ChevronRight className="w-6 h-6" />
// 				</button>
// 			</section>
// 		</div>
// 	);
// }

// import React from "react";

// const Hero = () => {
// 	return (
// 		<section class="relative bg-brand text-white overflow-hidden py-24 px-6 lg:px-20">
// 			<div class="absolute inset-0 opacity-10 bg-[url('/herorabi.jpeg')] bg-cover"></div>

// 			<div class="relative z-10  flex flex-col lg:flex-row items-center gap-12">
// 				<div class="lg:w-1/2 text-center lg:text-left">
// 					<span class="inline-block px-4 py-1 mb-6 border border-blue-400 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-800/50">For a Brighter Tomorrow</span>
// 					<h1 class="text-5xl lg:text-7xl font-bold leading-tight mb-6">
// 						समृद्ध नेपाल, <span class="text-green-200">सुखी नेपाली</span>
// 					</h1>
// 					<p class="text-lg text-blue-100 mb-10 leading-relaxed max-w-xl">Join us in our mission to transform Nepal through innovation, integrity, and grassroots empowerment. Your voice is the catalyst for change.</p>
// 					<div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
// 						<button class="bg-white text-brand px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg">Become a Member</button>
// 						<button class="border-2 border-white/30 px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition">View Manifest</button>
// 					</div>
// 				</div>

// 				<div class="lg:w-1/2 relative">
// 					<div class="rounded-2xl overflow-hidden border-4 border-blue-700/50 shadow-2xl">
// 						<img src="/herorabi.jpeg" alt="Nepal Landscape" class="w-full h-auto object-cover" />
// 					</div>
// 					<div class="absolute -bottom-6 -left-6 bg-brand p-6 rounded-xl shadow-xl hidden md:block">
// 						<p class="text-3xl font-bold">500K+</p>
// 						<p class="text-sm text-blue-200">Active Volunteers</p>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };

// export default Hero;

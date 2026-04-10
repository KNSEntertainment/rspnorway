"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HeroLoading() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		// Server-side fallback - static version
		return (
			<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-neutral-900">
				<section className="relative h-[82vh] w-full flex items-center justify-center">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-brand/10 to-purple-900/20" />
					<div className="relative z-10">
						<Image
							src="/rsp-norway-logo-removebg-preview.png"
							alt="RSP Norway Loading"
							width={192}
							height={192}
							className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl"
						/>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-neutral-900">
			<section className="relative h-[82vh] w-full flex items-center justify-center">
				{/* Animated Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-brand/10 to-purple-900/20 animate-pulse" />
				
				{/* Logo Container with Multiple Animations */}
				<motion.div 
					className="relative z-10"
					initial={{ scale: 0, rotate: -180, opacity: 0 }}
					animate={{ 
						scale: [0, 1.2, 1], 
						rotate: [-180, 10, 0], 
						opacity: [0, 1, 1] 
					}}
					transition={{ 
						duration: 2, 
						ease: "easeInOut",
						times: [0, 0.7, 1]
					}}
				>
					{/* Logo with Glow Effect */}
					<motion.div
						className="relative"
						animate={{
							scale: [1, 1.05, 1],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut"
						}}
					>
						{/* Glow Effect */}
						<motion.div
							className="absolute inset-0 blur-3xl"
							animate={{
								opacity: [0.3, 0.8, 0.3],
								scale: [1, 1.2, 1],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut"
							}}
						>
							<div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-brand/50 to-blue-500/50 rounded-full" />
						</motion.div>
						
						{/* Logo Image */}
						<Image
							src="/rsp-norway-logo-removebg-preview.png"
							alt="RSP Norway Loading"
							width={192}
							height={192}
							className="w-32 h-32 md:w-48 md:h-48 relative z-10 drop-shadow-2xl"
						/>
					</motion.div>
				</motion.div>

				{/* Loading Dots */}
				<motion.div 
					className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5, duration: 0.5 }}
				>
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="w-3 h-3 bg-brand rounded-full"
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.5, 1, 0.5],
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								delay: i * 0.2,
								ease: "easeInOut"
							}}
						/>
					))}
				</motion.div>


				{/* Animated Particles */}
				{[...Array(6)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 bg-brand/30 rounded-full"
						initial={{
							x: Math.random() * 100 - 50,
							y: Math.random() * 100 - 50,
							opacity: 0,
						}}
						animate={{
							x: Math.random() * 200 - 100,
							y: Math.random() * 200 - 100,
							opacity: [0, 1, 0],
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2,
							ease: "easeInOut"
						}}
					/>
				))}

				{/* Global CSS for Additional Effects */}
				<style jsx global>{`
					@keyframes float {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-10px); }
					}
					.animate-float {
						animation: float 3s ease-in-out infinite;
					}
				`}</style>
			</section>
		</div>
	);
}

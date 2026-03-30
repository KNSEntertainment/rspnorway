"use client";

import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function NewsletterSection() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1500));

		setIsSubmitted(true);
		setIsSubmitting(false);
		setEmail("");

		// Reset success message after 3 seconds
		setTimeout(() => setIsSubmitted(false), 3000);
	};

	return (
		<section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
			<div className="container mx-auto px-6">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
							<Mail className="w-8 h-8 text-white" />
						</div>
						
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Stay Connected
						</h2>
						
						<p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
							Subscribe to our newsletter and be the first to know about upcoming events, news, and community updates.
						</p>
					</motion.div>

					<motion.form
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						onSubmit={handleSubmit}
						className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
					>
						<div className="flex-1 relative">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email address"
								className="w-full px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-300"
								required
								disabled={isSubmitting || isSubmitted}
							/>
							<Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						</div>

						<button
							type="submit"
							disabled={isSubmitting || isSubmitted}
							className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[140px]"
						>
							{isSubmitting ? (
								<>
									<div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
									Subscribing...
								</>
							) : isSubmitted ? (
								<>
									<CheckCircle className="w-5 h-5" />
									Subscribed!
								</>
							) : (
								<>
									<Send className="w-5 h-5" />
									Subscribe
								</>
							)}
						</button>
					</motion.form>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="text-white/70 text-sm mt-6"
					>
						Join 500+ community members. Unsubscribe at any time.
					</motion.p>

					{/* Success Message */}
					{isSubmitted && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
						>
							<div className="flex items-center justify-center gap-2 text-white">
								<CheckCircle className="w-5 h-5" />
								<span>Thank you for subscribing! Check your email for confirmation.</span>
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</section>
	);
}

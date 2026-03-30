"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, Heart, ArrowRight, HandHeart, Award, Target, Globe } from "lucide-react";
import SectionHeader from "./SectionHeader";

export default function About() {
	const locale = useLocale();
	const t = useTranslations("about");

	// Statistics data
	const statistics = [
		{ icon: Users, value: "500+", label: "Active Members", color: "from-blue-500 to-blue-600" },
		{ icon: Award, value: "15+", label: "Years of Service", color: "from-purple-500 to-purple-600" },
		{ icon: Globe, value: "10+", label: "Cities Covered", color: "from-green-500 to-green-600" },
		{ icon: Target, value: "50+", label: "Events Organized", color: "from-orange-500 to-orange-600" },
	];

	const ctas = [
		{ href: "/membership", title: t("cta_member_title"), description: t("cta_member_desc"), color: "bg-brand", icon: Users },
		{ href: "/donate", title: t("cta_donate_title"), description: t("cta_donate_desc"), color: "bg-success", icon: Heart },
		{ href: "/get-involved", title: t("cta_involved_title"), description: t("cta_involved_desc"), color: "bg-blue-600", icon: HandHeart },
	];

	return (
		<section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="container mx-auto px-6">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<SectionHeader heading={t("cta_title")} />
					<p className="text-gray-600 mt-4 max-w-2xl mx-auto">
						We are proud to serve the Nepali community in Norway with dedication and excellence.
					</p>
				</motion.div>

				{/* Statistics Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{statistics.map((stat, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 * index }}
							className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
						>
							<div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-6`}>
								<stat.icon className="w-8 h-8 text-white" />
							</div>
							<div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
							<div className="text-gray-600 font-medium">{stat.label}</div>
						</motion.div>
					))}
				</div>

				{/* Call to Actions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<header className="text-center mb-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Join us in our mission to support and empower the Nepali community in Norway.
						</p>
					</header>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{ctas.map((cta, index) => (
							<Link key={index} href={`/${locale}${cta.href}`}>
								<motion.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
									className={`${cta.color} rounded-xl p-6 text-white hover:shadow-2xl hover:brightness-110 transition-all duration-300 cursor-pointer group hover:scale-105`}
								>
									<div className="flex items-start justify-between mb-4">
										<cta.icon className="w-8 h-8" />
										<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
									</div>
									<h4 className="text-xl font-bold mb-2">{cta.title}</h4>
									<p className="text-white text-sm leading-relaxed">{cta.description}</p>
								</motion.div>
							</Link>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, Heart, ArrowRight, HandHeart } from "lucide-react";
import SectionHeader from "./SectionHeader";

// Counter animation component
// function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
// 	const [count, setCount] = useState(0);

// 	useEffect(() => {
// 		let startTime: number;
// 		let animationFrame: number;

// 		const animate = (currentTime: number) => {
// 			if (!startTime) startTime = currentTime;
// 			const progress = Math.min((currentTime - startTime) / duration, 1);
// 			setCount(Math.floor(progress * end));

// 			if (progress < 1) {
// 				animationFrame = requestAnimationFrame(animate);
// 			}
// 		};

// 		animationFrame = requestAnimationFrame(animate);
// 		return () => cancelAnimationFrame(animationFrame);
// 	}, [end, duration]);

// 	return <span>{count}</span>;
// }

export default function About() {
	const locale = useLocale();
	const t = useTranslations("about");

	const ctas = [
		{ href: "/membership", title: t("cta_member_title"), description: t("cta_member_desc"), color: "bg-brand", icon: Users },
		{ href: "/donate", title: t("cta_donate_title"), description: t("cta_donate_desc"), color: "bg-success", icon: Heart },
		{ href: "/get-involved", title: t("cta_involved_title"), description: t("cta_involved_desc"), color: "bg-blue-600", icon: HandHeart },
	];

	return (
		<section id="about" className="container mx-auto w-full px-4 pb-12 md:pb-20">
			{/* Value Propositions */}

			{/* Call to Actions */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
				<header className="text-center my-12">
					<SectionHeader heading={t("cta_title")} />
				</header>{" "}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{ctas.map((cta, index) => (
						<Link key={index} href={`/${locale}${cta.href}`}>
							<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }} className={`${cta.color} rounded-xl p-6 text-white hover:shadow-2xl hover:brightness-110 transition-all duration-300 cursor-pointer group hover:scale-105`}>
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
		</section>
	);
}

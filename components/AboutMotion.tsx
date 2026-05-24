"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AboutMotionProps {
	ctas: Array<{
		href: string;
		title: string;
		description: string;
		color: string;
		icon: React.ComponentType<{ className?: string }>;
	}>;
	t: (key: string) => string;
}

export default function AboutMotion({ ctas, t }: AboutMotionProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
			{ctas.map((cta, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: index * 0.1 }}
					className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
				>
					<Link href={cta.href} className="block h-full p-6">
						<div className="flex items-center gap-4 mb-4">
							<div className={`${cta.color} p-3 rounded-lg text-white`}>
								<cta.icon className="w-6 h-6" />
							</div>
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">{cta.title}</h3>
						<p className="text-gray-600 mb-4">{cta.description}</p>
						<div className="flex items-center text-brand font-semibold">
							{t("learn_more")}
							<ArrowRight className="w-4 h-4 ml-2" />
						</div>
					</Link>
				</motion.div>
			))}
		</div>
	);
}

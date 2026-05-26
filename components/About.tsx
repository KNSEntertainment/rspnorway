"use client";

import { useTranslations, useLocale } from "next-intl";
import { Users, Heart, HandHeart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function About() {
	const t = useTranslations("about");
	const locale = useLocale();

	const ctas = [
		{ href: `/${locale}/membership`, title: t("cta_member_title"), description: t("cta_member_desc"), color: "bg-brand", icon: Users },
		{ href: `/${locale}/donate`, title: t("cta_donate_title"), description: t("cta_donate_desc"), color: "bg-success", icon: Heart },
		{ href: `/${locale}/get-involved`, title: t("cta_involved_title"), description: t("cta_involved_desc"), color: "bg-blue-600", icon: HandHeart },
	];

	return (
		<section id="about" className="pt-8 md:pt-20">
			<div className="container mx-auto px-6">
				{/* Call to Actions */}
				<div className="-mt-16 sm:-mt-36 relative z-10 px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{ctas.map((cta, index) => (
							<div
								key={index}
								className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
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
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

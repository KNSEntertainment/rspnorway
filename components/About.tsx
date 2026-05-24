"use client";

import { useTranslations } from "next-intl";
import { Users, Heart, HandHeart } from "lucide-react";
import dynamic from "next/dynamic";

const AboutMotion = dynamic(() => import("./AboutMotion"), {
	ssr: false,
	loading: () => <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{/* Loading skeleton */}</div>
});

export default function About() {
	const t = useTranslations("about");


	const ctas = [
		{ href: "/membership", title: t("cta_member_title"), description: t("cta_member_desc"), color: "bg-brand", icon: Users },
		{ href: "/donate", title: t("cta_donate_title"), description: t("cta_donate_desc"), color: "bg-success", icon: Heart },
		{ href: "/get-involved", title: t("cta_involved_title"), description: t("cta_involved_desc"), color: "bg-blue-600", icon: HandHeart },
	];

	return (
		<section id="about" className="pt-8 md:pt-20">
			<div className="container mx-auto px-6">


		

				{/* Call to Actions */}
				<div className="-mt-16 sm:-mt-36 relative z-10 px-6">
					<AboutMotion ctas={ctas} t={t} />
				</div>
			</div>
		</section>
	);
}

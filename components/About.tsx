"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export default function About() {
	const locale = useLocale();
	const t = useTranslations("about");
	return (
		<section id="about" className="container mx-auto w-full px-4 md:my-20 flex items-center justify-center">
			{/* Content container */}
			<div className="container mx-auto flex flex-col md:flex-row relative z-10">
				<motion.div className="mx-auto bg-blue-50 overflow-hidden" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
					{/* Content with padding */}
					<div className="grid grid-cols-1 md:grid-cols-2 justify-center items-center py-6 md:py-0">
						<div className="px-6 py-4 md:px-12">
							<h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 ">
								{t("title").split(" ")[0]}
								<span className="text-brand mt-1"> {t("title").split(" ").slice(1).join(" ")}</span>
							</h2>

							<div className="space-y-4 text-gray-700">
								<p className="text-lg">{t("description")}</p>
							</div>

							<div className="my-4">
								<Link href={`/${locale}/message-from-rsp`}>
									<Button className="bg-brand text-white px-6 py-3 rounded transition-colors duration-300 inline-flex items-center group">
										{t("read_more")}
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
										</svg>
									</Button>
								</Link>
							</div>
						</div>
						<div className="px-6 md:px-0 w-auto md:h-auto bg-brand">
							<Image src="/ghanti.png" alt="About RSP Norway" width={150} height={150} className="rounded-lg object-cover w-full p-12 h-full" />
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

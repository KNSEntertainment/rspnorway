"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionHeader from "./SectionHeader";
import ViewAllButton from "./ViewAllButton";
import { motion } from "framer-motion";

const GalleryClient = dynamic(() => import("./GalleryClient"), { ssr: false });

export default function GalleryWrapper({ images, locale }) {
	const t = useTranslations("gallery");
	return (
		<section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="container mx-auto px-6">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<SectionHeader heading={t("title")} />
					<p className="text-gray-600 mt-4 max-w-2xl mx-auto">
						Explore our collection of memorable moments and events from the Nepali community in Norway.
					</p>
				</motion.div>

				{/* Gallery Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<GalleryClient images={images} />
				</motion.div>

				{/* View All Button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="flex justify-center mt-12"
				>
					<ViewAllButton href={`/${locale}/photo-gallery`} label={t("view_all")} />
				</motion.div>
			</div>
		</section>
	);
}

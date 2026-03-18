"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionHeader from "./SectionHeader";
import ViewAllButton from "./ViewAllButton";

const GalleryClient = dynamic(() => import("./GalleryClient"), { ssr: false });

export default function GalleryWrapper({ images, locale }) {
	const t = useTranslations("gallery");
	return (
		<div className="px-4">
			<div className="mb-6 md:mb-8">
				<SectionHeader heading={t("title")} />
			</div>
			<GalleryClient images={images} />
			<div className="flex justify-center mt-6">
				<ViewAllButton href={`/${locale}/photo-gallery`} label={t("view_all")} />
			</div>
		</div>
	);
}

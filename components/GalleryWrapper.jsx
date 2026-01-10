"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionHeader from "./SectionHeader";

const GalleryClient = dynamic(() => import("./GalleryClient"), { ssr: false });

export default function GalleryWrapper({ images }) {
	const t = useTranslations("gallery");
	return (
		<div className="px-4">
			<SectionHeader heading={t("title")} />
			<GalleryClient images={images} />;
		</div>
	);
}

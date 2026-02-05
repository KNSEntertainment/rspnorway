"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionHeader from "./SectionHeader";
import Link from "next/link";

const GalleryClient = dynamic(() => import("./GalleryClient"), { ssr: false });

export default function GalleryWrapper({ images, locale }) {
	const t = useTranslations("gallery");
	return (
		<div className="px-4">
			<SectionHeader heading={t("title")} />
			<GalleryClient images={images} />
			<div className="flex justify-center mt-8">
				<Link href={`/${locale}/photo-gallery`} className="inline-flex items-center px-6 py-3 font-medium text-sm rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors duration-200 shadow-md hover:shadow-lg">
					{t("view_all")}
					<svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
					</svg>
				</Link>
			</div>
		</div>
	);
}

import { MessageCirclePlusIcon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/SectionHeader";

export default function AboutUs() {
	const t = useTranslations("about-us");
	return (
		<main className="px-4">
			<SectionHeader heading={t("title")} />

			<div className="flex flex-col md:flex-row gap-12 items-center">
				{/* Text Content Column */}
				<div className="md:w-1/2">
					<div className="space-y-6 text-gray-800 text-lg">
						<p>{t("about_description_1")}</p>
						<p>{t("about_description_2")}</p>
						<p>{t("about_description_3")}</p>
					</div>
				</div>

				{/* Image Column */}
				<div className="md:w-1/2 flex items-center justify-center">
					<div className="w-full">
						<Image src="/rabi1.webp" alt="Event Experience" width={600} height={600} className="rounded-lg shadow-xl w-full h-auto object-cover" />
					</div>
				</div>
			</div>

			<section className="h-auto flex flex-col md:flex-row items-center rounded-lg mt-4 md:mt-12 md:p-12 py-4 md:gap-12">
				<div className="flex text-black p-4 lg:px-16 border border-1 border-brand rounded-3xl mx-6">
					<MessageCirclePlusIcon className="w-8 h-8 text-brand mr-4 flex-shrink-0" />
					<div>
						<h2 className="text-xl md:text-2xl font-bold mb-4">
							{t("mission_title").split(" ")[0]} <span className="text-brand leading-tight">{t("mission_title").split(" ")[1]}</span>
						</h2>
						<p className="text-lg mb-4">{t("mission_description")}</p>
					</div>
				</div>
				<div className="flex text-black p-4 lg:px-16 bg-brand/10 rounded-3xl mx-6 my-6 md:my-0">
					<MessageCirclePlusIcon className="w-8 h-8 text-brand mr-4 flex-shrink-0" />

					<div>
						<h2 className="text-xl md:text-2xl font-bold mb-4">
							{t("vision_title").split(" ")[0]} <span className="text-brand leading-tight">{t("vision_title").split(" ")[1]}</span>
						</h2>
						<p className="text-lg mb-4">{t("vision_description")}</p>
					</div>
				</div>
			</section>
		</main>
	);
}

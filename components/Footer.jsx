import { getSettings } from "@/lib/data/settings";
import FooterClient from "./FooterClient";
import { normalizeDocs } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
	const settings = await getSettings();

	const settingsNorm = normalizeDocs(settings);

	const t = await getTranslations("footer");
	const year = new Date().getFullYear();
	const translations = {
		about_us: t("about_us"),
		about_description: t("about_description"),
		logo_alt: t("logo_alt"),
		logo_head: t("logo_head"),
		tagline: t("tagline"),
		contact_details: t("contact_details"),
		address: t("address"),
		phone: t("phone"),
		facebook: t("facebook"),
		instagram: t("instagram"),
		developed_by: t("developed_by"),
		developer: t("developer"),
		terms: t("terms"),
		privacy: t("privacy"),
		copyright: t("copyright", { year }),
		follow_us: t("follow_us"),
	};

	return <FooterClient settings={settingsNorm} t={translations} />;
}

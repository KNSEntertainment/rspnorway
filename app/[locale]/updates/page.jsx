import { getTranslations } from "next-intl/server";
import UpdatesClient from "./Updates";
import { getEvents } from "@/lib/data/events";
import { getNotices } from "@/lib/data/notices";
import { getPublishedCirculars } from "@/lib/data/circulars";
import { normalizeDocs } from "@/lib/utils";

export const metadata = {
	title: "Updates | PNSB-Norway",
	description: "Stay informed with the latest updates from PNSB-Norway. Get updates on events, announcements, and important information for our community.",
	openGraph: {
		title: "Updates | PNSB-Norway",
		description: "Stay informed with the latest updates from PNSB-Norway. Get updates on events, announcements, and important information for our community.",
		url: "/updates",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

export default async function UpdatesPage({ params }) {
	const { locale } = params;
	const events = await getEvents();
	const notices = await getNotices();
	const circulars = await getPublishedCirculars();

	const eventsNorm = normalizeDocs(events);
	const noticesNorm = normalizeDocs(notices);
	const circularsNorm = normalizeDocs(circulars);

	const t = await getTranslations("notices");

	const translations = {
		title: t("title"),
		description: t("description"),
		events_tab: t("events_tab"),
		notices_tab: t("notices_tab"),
		circulars_tab: t("circulars_tab"),
		back: t("back"),
		other_events: t("other_events"),
		other_notices: t("other_notices"),
		other_circulars: t("other_circulars"),
		view_detail: t("view_detail"),
		read_more: t("read_more"),
		no_events: t("no_events"),
		no_events_desc: t("no_events_desc"),
		no_notices: t("no_notices"),
		no_notices_desc: t("no_notices_desc"),
		no_circulars: t("no_circulars"),
		no_circulars_desc: t("no_circulars_desc"),
	};

	return <UpdatesClient events={eventsNorm} notices={noticesNorm} circulars={circularsNorm} translations={translations} locale={locale} />;
}

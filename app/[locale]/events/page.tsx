import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getEvents, getEventById } from "@/lib/data/events";
import { normalizeDocs } from "@/lib/utils";
import EventsClientLoader from "./EventsClientLoader";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
	eventdescription?: string;
	eventposterUrl?: string;
	eventposter2Url?: string;
	eventposter3Url?: string;
	[key: string]: unknown;
}

interface Props {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ eventId?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
	const { locale } = await params;
	const { eventId } = await searchParams;

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rspnorway.org";

	if (eventId) {
		const rawEvent = await getEventById(eventId);
		if (rawEvent) {
			const event = JSON.parse(JSON.stringify(rawEvent));
			const title = `${event.eventname} | PNSB-Norway`;

			// Clean description without HTML tags or excess whitespace
			let description = (event.eventdescription || "")
				.replace(/<[^>]*>?/gm, " ")
				.replace(/\s+/g, " ")
				.trim();

			if (!description) {
				const dateStr = event.eventdate ? ` on ${new Date(event.eventdate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}` : "";
				const venueStr = event.eventvenue ? ` at ${event.eventvenue}` : "";
				description = `Join us for ${event.eventname}${dateStr}${venueStr}. Click to view details and register on PNSB-Norway.`;
			} else if (description.length > 200) {
				description = description.slice(0, 197) + "...";
			}

			const eventUrl = `${baseUrl}/${locale}/events?eventId=${event._id}`;
			const posterUrl = event.eventposterUrl || event.eventposter2Url || event.eventposter3Url;
			const images = posterUrl
				? [
						{
							url: posterUrl,
							width: 1200,
							height: 630,
							alt: event.eventname,
						},
					]
				: [];

			return {
				title,
				description,
				metadataBase: new URL(baseUrl),
				alternates: {
					canonical: eventUrl,
				},
				openGraph: {
					title,
					description,
					url: eventUrl,
					siteName: "PNSB-Norway",
					type: "article",
					images: images.length > 0 ? images : undefined,
				},
				twitter: {
					card: "summary_large_image",
					title,
					description,
					images: posterUrl ? [posterUrl] : undefined,
				},
			};
		}
	}

	const fallbackTitle = "Events | PNSB-Norway";
	const fallbackDesc = "Stay updated with upcoming and past events from PNSB-Norway. Join us for community gatherings, celebrations, and important meetings.";
	const fallbackUrl = `${baseUrl}/${locale}/events`;

	return {
		title: fallbackTitle,
		description: fallbackDesc,
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: fallbackUrl,
		},
		openGraph: {
			title: fallbackTitle,
			description: fallbackDesc,
			url: fallbackUrl,
			siteName: "PNSB-Norway",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: fallbackTitle,
			description: fallbackDesc,
		},
	};
}

export default async function EventsPage({ searchParams }: Props) {
	const { eventId } = await searchParams;

	const events = await getEvents();
	const eventsNorm = normalizeDocs(events);

	const t = await getTranslations("notices");

	const translations = {
		events_tab: t("events_tab"),
		events_subtitle: t("events_subtitle"),
		back: t("back"),
		other_events: t("other_events"),
		view_detail: t("view_detail"),
		no_events: t("no_events"),
		no_events_desc: t("no_events_desc"),
	};

	return <EventsClientLoader events={eventsNorm as Event[]} translations={translations} initialEventId={eventId} />;
}

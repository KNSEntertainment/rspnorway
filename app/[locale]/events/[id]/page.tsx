import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEventById, getEvents } from "@/lib/data/events";
import { normalizeDocs } from "@/lib/utils";
import EventDetailClient from "./EventDetailClient";
import { EventItem } from "@/components/events/types";

interface Props {
	params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, id } = await params;
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rspnorway.org";

	try {
		const rawEvent = await getEventById(id);
		if (!rawEvent) {
			return {
				title: "Event Not Found | PNSB-Norway",
				description: "The requested event could not be found.",
			};
		}

		const event = JSON.parse(JSON.stringify(rawEvent));
		const title = `${event.eventname} | PNSB-Norway`;

		let description = (event.eventdescription || "")
			.replace(/<[^>]*>?/gm, " ")
			.replace(/\s+/g, " ")
			.trim();

		if (!description) {
			const dateStr = event.eventdate
				? ` on ${new Date(event.eventdate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
				: "";
			const venueStr = event.eventvenue ? ` at ${event.eventvenue}` : "";
			description = `Join us for ${event.eventname}${dateStr}${venueStr}. Click to view details and register on PNSB-Norway.`;
		} else if (description.length > 200) {
			description = description.slice(0, 197) + "...";
		}

		const eventUrl = `${baseUrl}/${locale}/events/${id}`;
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
	} catch {
		return {
			title: "Event | PNSB-Norway",
			description: "View event details on PNSB-Norway.",
		};
	}
}

export default async function EventDetailPage({ params }: Props) {
	const { id } = await params;

	let rawEvent = null;
	try {
		rawEvent = await getEventById(id);
	} catch {
		rawEvent = null;
	}

	if (!rawEvent) {
		notFound();
	}

	const eventNorm = JSON.parse(JSON.stringify(rawEvent)) as EventItem;

	// Fetch all events for the "Other Events" recommendation sidebar
	const allEvents = await getEvents();
	const allEventsNorm = normalizeDocs(allEvents) as unknown as EventItem[];
	const otherEvents = allEventsNorm.filter((e) => String(e._id) !== String(id));

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

	return (
		<EventDetailClient
			event={eventNorm}
			otherEvents={otherEvents}
			translations={translations}
		/>
	);
}

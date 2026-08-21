import { getEvents } from "@/lib/data/events";
import { normalizeDocs } from "@/lib/utils";
import EventFeedbackPageClient from "./EventFeedbackPageClient";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventvenue?: string;
	[key: string]: unknown;
}

export const metadata = {
	title: "Event Feedback | PNSB-Norway",
	description: "Share your feedback about a past PNSB-Norway event.",
};

export default async function EventFeedbackPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
	const { eventId } = await searchParams;

	const events = await getEvents();
	const eventsNorm = normalizeDocs(events);

	return <EventFeedbackPageClient events={eventsNorm as Event[]} initialEventId={eventId} />;
}

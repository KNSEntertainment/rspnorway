"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, MessageSquare } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import EventFeedbackForm from "@/components/EventFeedbackForm";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isEventPast } from "@/lib/eventStatus";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventvenue?: string;
	[key: string]: unknown;
}

interface EventFeedbackPageClientProps {
	events: Event[];
	initialEventId?: string;
}

const formatEventDate = (dateString: string) => {
	try {
		return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
	} catch {
		return dateString;
	}
};

export default function EventFeedbackPageClient({ events, initialEventId }: EventFeedbackPageClientProps) {
	const t = useTranslations("eventFeedback");
	const pastEvents = useMemo(
		() =>
			[...(events || [])]
				.filter((e) => isEventPast(e.eventdate))
				.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime()),
		[events]
	);

	const [selectedEventId, setSelectedEventId] = useState<string>(() => {
		if (initialEventId && pastEvents.some((e) => e._id === initialEventId)) return initialEventId;
		return "";
	});

	const selectedEvent = pastEvents.find((e) => e._id === selectedEventId) || null;

	return (
		<main className="py-12">
			<div className="container mx-auto px-4 max-w-3xl">
				<SectionHeader heading={t("pageHeading")} subtitle={t("pageSubtitle")} />

				<div className="bg-white rounded-2xl shadow-md md:shadow-xl overflow-hidden border border-light p-6 sm:p-8 space-y-6">
					<div className="space-y-1.5">
						<Label htmlFor="feedback-event-select">{t("selectEventLabel")}</Label>
						{pastEvents.length > 0 ? (
							<Select value={selectedEventId} onValueChange={setSelectedEventId}>
								<SelectTrigger id="feedback-event-select">
									<SelectValue placeholder={t("selectEventPlaceholder")} />
								</SelectTrigger>
								<SelectContent>
									{pastEvents.map((event) => (
										<SelectItem key={event._id} value={event._id}>
											{event.eventname} — {formatEventDate(event.eventdate)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						) : (
							<p className="text-sm text-gray-500">{t("noPastEvents")}</p>
						)}
					</div>

					{selectedEvent && (
						<>
							<div className="flex flex-wrap gap-3 text-sm text-gray-600 bg-light rounded-lg p-3">
								<span className="inline-flex items-center gap-1.5">
									<Calendar className="w-4 h-4 text-brand" /> {formatEventDate(selectedEvent.eventdate)}
								</span>
								{selectedEvent.eventvenue && (
									<span className="inline-flex items-center gap-1.5">
										<MapPin className="w-4 h-4 text-brand" /> {selectedEvent.eventvenue}
									</span>
								)}
							</div>

							<div className="border-t pt-6">
								<div className="flex items-center gap-2 mb-4">
									<MessageSquare className="w-5 h-5 text-brand" />
									<h2 className="text-lg font-bold text-gray-900">{t("yourFeedbackFor", { eventName: selectedEvent.eventname })}</h2>
								</div>
								<EventFeedbackForm key={selectedEvent._id} eventId={selectedEvent._id} compact />
							</div>
						</>
					)}
				</div>
			</div>
		</main>
	);
}

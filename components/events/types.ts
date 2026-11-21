import type { Event as RegistrationModalEvent } from "@/components/EventRegistrationModal";

export interface EventItem extends RegistrationModalEvent {
	eventposter2Url?: string;
	eventposter3Url?: string;
	eventvideoUrl?: string;
	totalRegistrations?: number;
	totalCollection?: number;
	createdAt?: string | Date;
}

export interface EventTranslations {
	events_tab?: string;
	events_subtitle?: string;
	back?: string;
	other_events?: string;
	view_detail?: string;
	no_events?: string;
	no_events_desc?: string;
	[key: string]: string | undefined;
}

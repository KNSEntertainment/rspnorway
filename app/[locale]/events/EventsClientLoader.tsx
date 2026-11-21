"use client";

import dynamic from "next/dynamic";
import { EventItem, EventTranslations } from "@/components/events/types";

const EventsClient = dynamic(() => import("./EventsClient"), {
	ssr: true,
	loading: () => (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/20">
			<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-14 pb-16">
				<div className="text-center mb-12">
					<div className="h-8 w-40 mx-auto rounded bg-gray-200 animate-pulse mb-3" />
					<div className="h-4 w-72 mx-auto rounded bg-gray-100 animate-pulse" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="h-80 rounded-2xl border border-gray-200/80 bg-white shadow-sm p-4 animate-pulse flex flex-col justify-between">
							<div className="h-44 bg-gray-100 rounded-xl" />
							<div className="space-y-2 mt-4">
								<div className="h-4 bg-gray-200 rounded w-3/4" />
								<div className="h-3 bg-gray-100 rounded w-1/2" />
							</div>
							<div className="h-3 bg-gray-100 rounded w-1/3 mt-4" />
						</div>
					))}
				</div>
			</div>
		</div>
	),
});

interface EventsClientLoaderProps {
	events: EventItem[];
	translations: EventTranslations;
}

export default function EventsClientLoader(props: EventsClientLoaderProps) {
	return <EventsClient {...props} />;
}

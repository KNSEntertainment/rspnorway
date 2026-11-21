"use client";

import { useMemo, useState } from "react";
import { Calendar, Search, X } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import EventCard from "@/components/events/EventCard";
import { EventItem, EventTranslations } from "@/components/events/types";
import { isEventPast } from "@/lib/eventStatus";

interface EventsClientProps {
	events: EventItem[];
	translations: EventTranslations;
}

type EventFilterType = "all" | "upcoming" | "past";

export default function EventsClient({ events = [], translations: t }: EventsClientProps) {
	const [activeFilter, setActiveFilter] = useState<EventFilterType>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Categorize and compute counts
	const counts = useMemo(() => {
		let upcoming = 0;
		let past = 0;
		for (const ev of events) {
			if (isEventPast(ev.eventdate)) {
				past++;
			} else {
				upcoming++;
			}
		}
		return { all: events.length, upcoming, past };
	}, [events]);

	// Filter and sort events
	const filteredEvents = useMemo(() => {
		let list = [...events];

		// Filter by tab
		if (activeFilter === "upcoming") {
			list = list.filter((e) => !isEventPast(e.eventdate));
			// Sort upcoming by closest date first
			list.sort((a, b) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime());
		} else if (activeFilter === "past") {
			list = list.filter((e) => isEventPast(e.eventdate));
			// Sort past by most recent first
			list.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime());
		} else {
			// All: sort by date descending (newest / most recent first)
			list.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime());
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			list = list.filter((e) => {
				const nameMatch = e.eventname?.toLowerCase().includes(query);
				const venueMatch = e.eventvenue?.toLowerCase().includes(query);
				const descMatch = e.eventdescription?.toLowerCase().includes(query);
				return nameMatch || venueMatch || descMatch;
			});
		}

		return list;
	}, [events, activeFilter, searchQuery]);

	const handleResetFilters = () => {
		setActiveFilter("all");
		setSearchQuery("");
	};

	return (
		<section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/20">
			<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-14 pb-16">
				{/* Header */}
				<SectionHeader
					heading={t.events_tab || "Events"}
					subtitle={t.events_subtitle || "Bringing people together through memorable experiences"}
				/>

				{/* Toolbar: Filter Tabs & Search Bar */}
				<div className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
					{/* Filter Pills */}
					<div className="inline-flex p-1 bg-white rounded-xl border border-gray-200/80 shadow-sm self-start sm:self-auto overflow-x-auto max-w-full">
						<button
							onClick={() => setActiveFilter("all")}
							className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
								activeFilter === "all"
									? "bg-brand text-white shadow-sm"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
							}`}
						>
							<span>All Events</span>
							<span
								className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
									activeFilter === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
								}`}
							>
								{counts.all}
							</span>
						</button>

						<button
							onClick={() => setActiveFilter("upcoming")}
							className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
								activeFilter === "upcoming"
									? "bg-brand text-white shadow-sm"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
							}`}
						>
							<span>Upcoming</span>
							<span
								className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
									activeFilter === "upcoming" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
								}`}
							>
								{counts.upcoming}
							</span>
						</button>

						<button
							onClick={() => setActiveFilter("past")}
							className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
								activeFilter === "past"
									? "bg-brand text-white shadow-sm"
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
							}`}
						>
							<span>Past Events</span>
							<span
								className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
									activeFilter === "past" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
								}`}
							>
								{counts.past}
							</span>
						</button>
					</div>

					{/* Search Input */}
					<div className="relative w-full sm:w-72 md:w-80">
						<Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by title, venue..."
							className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200/90 rounded-xl shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								title="Clear search"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>
				</div>

				{/* Event Cards Grid */}
				{filteredEvents.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
						{filteredEvents.map((event) => (
							<EventCard key={event._id} event={event} translations={t} />
						))}
					</div>
				) : (
					/* Empty State */
					<div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
						<div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand flex items-center justify-center mx-auto mb-4">
							<Calendar className="w-8 h-8 text-brand/70" />
						</div>
						<h3 className="text-lg font-bold text-gray-900 mb-1">
							{searchQuery || activeFilter !== "all" ? "No Matching Events" : t.no_events || "No Events Scheduled"}
						</h3>
						<p className="text-sm text-gray-500 mb-6">
							{searchQuery || activeFilter !== "all"
								? "Try adjusting your search terms or filter selection to find events."
								: t.no_events_desc || "Check back soon for upcoming events!"}
						</p>
						{(searchQuery || activeFilter !== "all") && (
							<button
								onClick={handleResetFilters}
								className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all"
							>
								Reset Filters
							</button>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
	Calendar,
	Clock,
	MapPin,
	Users,
	MessageSquare,
	Share2,
	Check,
	ArrowLeft,
	ExternalLink,
	Ticket,
	Info,
	Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { isEventPast } from "@/lib/eventStatus";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { Button } from "@/components/ui/button";
import { EventItem, EventTranslations } from "@/components/events/types";

interface EventDetailClientProps {
	event: EventItem;
	otherEvents: EventItem[];
	translations?: EventTranslations;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDetailedDate(dateString?: string) {
	if (!dateString) return { formatted: "—", day: "—", monthShort: "—" };
	try {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) return { formatted: dateString, day: "—", monthShort: "—" };
		return {
			formatted: d.toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			day: d.getDate(),
			monthShort: MONTHS_SHORT[d.getMonth()],
			monthFull: MONTHS[d.getMonth()],
			iso: d.toISOString(),
		};
	} catch {
		return { formatted: dateString, day: "—", monthShort: "—" };
	}
}

function getSeatsRemaining(event: EventItem): number | null {
	const maximumSeats = Number(event.maximumSeats || 0);
	if (maximumSeats <= 0) return null;
	return Math.max(maximumSeats - Number(event.registeredSeats || 0), 0);
}

function getPriceList(event: EventItem) {
	if (event.paymentCollectionEnabled === false) return [];
	const items: { label: string; price: number; detail?: string }[] = [];
	if (event.price !== undefined && event.price !== null) {
		items.push({ label: "Adult", price: event.price });
	}
	if (event.studentPrice !== undefined && event.studentPrice !== null) {
		items.push({ label: "Student", price: event.studentPrice });
	}
	if (event.childPrice !== undefined && event.childPrice !== null) {
		items.push({
			label: "Children",
			price: event.childPrice,
			detail: event.childAgeLimit ? `Age: ${event.childAgeLimit}` : undefined,
		});
	}
	if (event.elderlyPrice !== undefined && event.elderlyPrice !== null) {
		items.push({
			label: "Senior / Elderly",
			price: event.elderlyPrice,
			detail: event.elderlyAgeLimit ? `Age: ${event.elderlyAgeLimit}` : undefined,
		});
	}
	return items;
}

function getGoogleCalendarUrl(event: EventItem): string | null {
	if (!event.eventdate) return null;
	try {
		const d = new Date(event.eventdate);
		if (Number.isNaN(d.getTime())) return null;

		const y = d.getUTCFullYear();
		const m = String(d.getUTCMonth() + 1).padStart(2, "0");
		const day = String(d.getUTCDate()).padStart(2, "0");
		const dateParam = `${y}${m}${day}/${y}${m}${day}`;

		const title = encodeURIComponent(event.eventname || "Event");
		const details = encodeURIComponent((event.eventdescription || "").slice(0, 300));
		const location = encodeURIComponent(event.eventvenue || "");

		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateParam}`;
	} catch {
		return null;
	}
}

export default function EventDetailClient({ event, otherEvents, translations = {} }: EventDetailClientProps) {
	const tFeedback = useTranslations("eventFeedback");
	const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [activePosterIndex, setActivePosterIndex] = useState(0);

	const isPast = isEventPast(event.eventdate);
	const dateInfo = formatDetailedDate(event.eventdate);
	const seatsRemaining = getSeatsRemaining(event);
	const priceList = getPriceList(event);
	const isFree = event.paymentCollectionEnabled === false || (priceList.length === 0 && (event.price === 0 || event.price === undefined));

	const posters = [event.eventposterUrl, event.eventposter2Url, event.eventposter3Url].filter(Boolean) as string[];
	const currentPoster = posters[activePosterIndex] || event.eventposterUrl;

	const calendarUrl = getGoogleCalendarUrl(event);
	const mapsUrl = event.eventvenue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.eventvenue)}` : null;

	const handleShare = async () => {
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		const shareUrl = `${origin}/events/${event._id}`;
		const shareData = {
			title: event.eventname,
			text: `Check out ${event.eventname} on PNSB-Norway!`,
			url: shareUrl,
		};

		if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
			try {
				await navigator.share(shareData);
				return;
			} catch (err) {
				if ((err as Error)?.name !== "AbortError") {
					console.error("Error sharing:", err);
				}
			}
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch (err) {
			console.error("Clipboard copy failed:", err);
		}
	};

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
				<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
					{/* Top Navigation Bar: Back & Share */}
					<div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
						<Link
							href="/events"
							className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-xl shadow-sm hover:shadow transition-all group"
						>
							<ArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-1 transition-transform" />
							<span>{translations.back || "Back to Events"}</span>
						</Link>

						<button
							onClick={handleShare}
							className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-xl shadow-sm hover:shadow transition-all"
							title="Share this event"
						>
							{copied ? (
								<>
									<Check className="w-4 h-4 text-emerald-600" />
									<span className="text-emerald-700 font-semibold">Link Copied!</span>
								</>
							) : (
								<>
									<Share2 className="w-4 h-4 text-brand" />
									<span>Share Event</span>
								</>
							)}
						</button>
					</div>

					{/* 2-Column Responsive Layout */}
					<div className="grid lg:grid-cols-3 gap-8 items-start">
						{/* ── Left Column: Main Event Content (2 cols) ── */}
						<div className="lg:col-span-2 space-y-6 sm:space-y-8">
							{/* Hero Title & Meta Card */}
							<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
								{/* Status Badges */}
								<div className="flex flex-wrap items-center gap-2 mb-4">
									{isPast ? (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
											Event Completed
										</span>
									) : isFree ? (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
											<Sparkles className="w-3.5 h-3.5" />
											Free Admission
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
											<Ticket className="w-3.5 h-3.5" />
											Ticketed Event
										</span>
									)}

									{!isPast && event.registrationEnabled !== false && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
											Registration Open
										</span>
									)}
								</div>

								{/* Event Title */}
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
									{event.eventname}
								</h1>

								{/* Quick Meta Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
									<div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
										<div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
											<Calendar className="w-5 h-5" />
										</div>
										<div>
											<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</p>
											<p className="text-sm font-semibold text-gray-900">{dateInfo.formatted}</p>
										</div>
									</div>

									{event.eventtime && (
										<div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
											<div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
												<Clock className="w-5 h-5" />
											</div>
											<div>
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</p>
												<p className="text-sm font-semibold text-gray-900">{event.eventtime}</p>
											</div>
										</div>
									)}

									{event.eventvenue && (
										<div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100 sm:col-span-2">
											<div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
												<MapPin className="w-5 h-5" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue</p>
												<p className="text-sm font-semibold text-gray-900">{event.eventvenue}</p>
											</div>
											{mapsUrl && (
												<a
													href={mapsUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="self-center text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
												>
													Maps <ExternalLink className="w-3 h-3" />
												</a>
											)}
										</div>
									)}
								</div>
							</div>

							{/* Event Poster Media Display */}
							{currentPoster && (
								<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-3 sm:p-4">
									<div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900">
										<Image
											src={currentPoster}
											alt={event.eventname}
											fill
											priority
											sizes="(max-width: 1024px) 100vw, 66vw"
											className="object-contain"
										/>
									</div>

									{/* Multi-Poster Thumbnail Selector */}
									{posters.length > 1 && (
										<div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 overflow-x-auto pb-1">
											{posters.map((poster, idx) => (
												<button
													key={`${poster}-${idx}`}
													onClick={() => setActivePosterIndex(idx)}
													className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
														activePosterIndex === idx
															? "border-brand ring-2 ring-brand/30 scale-105"
															: "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
													}`}
												>
													<Image src={poster} alt={`Poster ${idx + 1}`} fill className="object-cover" />
												</button>
											))}
										</div>
									)}
								</div>
							)}

							{/* Description Section */}
							<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
								<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<Info className="w-5 h-5 text-brand" />
									About this event
								</h2>

								{event.eventdescription ? (
									<div className="prose prose-slate max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
										{event.eventdescription}
									</div>
								) : (
									<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-gray-500 text-sm">
										Event description will be available soon. Please check back for updates!
									</div>
								)}
							</div>

							{/* Practical Information Section */}
							{event.practicalInfo && (
								<div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl shadow-sm p-6 sm:p-8">
									<div className="flex items-center gap-3 mb-3">
										<div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
											<Info className="w-4 h-4" />
										</div>
										<h2 className="text-xl font-bold text-emerald-950">Practical Information</h2>
									</div>
									<p className="text-emerald-900/90 leading-relaxed whitespace-pre-wrap text-sm sm:text-base pl-11">
										{event.practicalInfo}
									</p>
								</div>
							)}

							{/* Feedback Section (For Past Events) */}
							{isPast && (
								<div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-start gap-3">
										<div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
											<MessageSquare className="w-5 h-5" />
										</div>
										<div>
											<h3 className="font-bold text-gray-900 text-base sm:text-lg">
												{tFeedback("attendedPromptTitle")}
											</h3>
											<p className="text-gray-600 text-xs sm:text-sm">
												{tFeedback("attendedPromptSubtitle")}
											</p>
										</div>
									</div>

									<Link
										href={`/events/feedback?eventId=${event._id}`}
										className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm hover:shadow flex-shrink-0"
									>
										<MessageSquare className="w-4 h-4" />
										{tFeedback("leaveFeedback")}
									</Link>
								</div>
							)}
						</div>

						{/* ── Right Column: Sticky Sidebar (1 col) ── */}
						<div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
							{/* Registration & Ticket Box */}
							<div className="bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden">
								<div className="bg-gradient-to-r from-brand to-brand/90 text-white p-5 sm:p-6">
									<div className="flex items-center gap-2.5">
										<Ticket className="w-5 h-5" />
										<h2 className="text-lg sm:text-xl font-bold">Registration & Tickets</h2>
									</div>
									<p className="text-white/80 text-xs mt-1">
										{isPast
											? "This event has ended"
											: event.registrationEnabled === false
											? "Registration is currently closed"
											: isFree
											? "Free admission — reserve your spot"
											: "Select tickets and secure your spot"}
									</p>
								</div>

								<div className="p-5 sm:p-6 space-y-5">
									{/* Pricing Breakdown */}
									{isFree ? (
										<div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
											<p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Admission</p>
											<p className="text-xl font-extrabold text-emerald-700 mt-0.5">Free Entry</p>
										</div>
									) : priceList.length > 0 ? (
										<div className="space-y-2.5">
											<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket Prices</p>
											<div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
												{priceList.map((tier) => (
													<div key={tier.label} className="flex items-center justify-between p-3 text-sm">
														<div>
															<span className="font-medium text-gray-800">{tier.label}</span>
															{tier.detail && <span className="text-xs text-gray-500 block">{tier.detail}</span>}
														</div>
														<span className="font-bold text-brand">NOK {tier.price}</span>
													</div>
												))}
											</div>
										</div>
									) : null}

									{/* Seats remaining */}
									{seatsRemaining !== null && (
										<div className="flex items-center justify-between text-xs sm:text-sm p-3 rounded-xl bg-gray-50 border border-gray-100">
											<span className="text-gray-600 flex items-center gap-1.5">
												<Users className="w-4 h-4 text-brand" />
												Availability
											</span>
											<span className={`font-bold ${seatsRemaining > 0 ? "text-emerald-700" : "text-rose-600"}`}>
												{seatsRemaining > 0 ? `${seatsRemaining} seats remaining` : "Sold out"}
											</span>
										</div>
									)}

									{/* Registration CTA Button */}
									<div>
										{isPast ? (
											<Button
												disabled
												className="w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed hover:bg-gray-100"
											>
												Event Completed
											</Button>
										) : event.registrationEnabled === false ? (
											<Button
												disabled
												className="w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed hover:bg-gray-100"
											>
												Registration Closed
											</Button>
										) : (
											<Button
												onClick={() => setRegistrationModalOpen(true)}
												className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-base flex items-center justify-center gap-2"
											>
												<Users className="w-5 h-5" />
												Register Now
											</Button>
										)}
									</div>
								</div>
							</div>

							{/* Quick Links Card: Calendar & Maps */}
							<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-3">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Actions</p>

								{calendarUrl && (
									<a
										href={calendarUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-colors"
									>
										<Calendar className="w-4 h-4 text-brand" />
										Add to Google Calendar
									</a>
								)}

								{mapsUrl && (
									<a
										href={mapsUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-colors"
									>
										<MapPin className="w-4 h-4 text-brand" />
										Open in Google Maps
									</a>
								)}
							</div>

							{/* Other Events Card */}
							{otherEvents.length > 0 && (
								<div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6">
									<div className="flex items-center gap-2 mb-4">
										<Calendar className="w-4 h-4 text-brand" />
										<h3 className="font-bold text-gray-900 text-base">
											{translations.other_events || "Other Events"}
										</h3>
									</div>

									<div className="space-y-3">
										{otherEvents.slice(0, 4).map((other) => {
											const otherDate = formatDetailedDate(other.eventdate);
											return (
												<Link
													key={other._id}
													href={`/events/${other._id}`}
													className="group block p-3 rounded-xl border border-gray-100 hover:border-brand/40 hover:bg-brand-50/10 transition-all"
												>
													<div className="flex gap-3">
														<div className="w-12 h-12 rounded-lg bg-brand/10 text-brand flex flex-col items-center justify-center flex-shrink-0">
															<span className="text-sm font-bold leading-none">{otherDate.day}</span>
															<span className="text-[10px] font-semibold uppercase">{otherDate.monthShort}</span>
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand transition-colors line-clamp-1">
																{other.eventname}
															</h4>
															{other.eventvenue && (
																<p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
																	{other.eventvenue}
																</p>
															)}
														</div>
													</div>
												</Link>
											);
										})}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Floating Mobile Registration Bar */}
				{!isPast && event.registrationEnabled !== false && (
					<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-2xl flex items-center justify-between gap-4">
						<div className="min-w-0">
							<p className="text-xs text-gray-500 line-clamp-1 font-medium">{event.eventname}</p>
							<p className="text-sm font-extrabold text-gray-900">
								{isFree ? "Free" : event.price ? `NOK ${event.price}` : "Tickets"}
							</p>
						</div>
						<Button
							onClick={() => setRegistrationModalOpen(true)}
							className="bg-brand hover:bg-brand/90 text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-sm flex-shrink-0"
						>
							Register
						</Button>
					</div>
				)}
			</div>

			{/* Event Registration Modal */}
			<EventRegistrationModal
				event={event}
				isOpen={registrationModalOpen}
				onClose={() => setRegistrationModalOpen(false)}
			/>
		</>
	);
}

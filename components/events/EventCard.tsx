"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { isEventPast } from "@/lib/eventStatus";
import { EventItem, EventTranslations } from "./types";

interface EventCardProps {
	event: EventItem;
	translations?: EventTranslations;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatEventBadgeDate(dateString?: string) {
	if (!dateString) return { day: "—", month: "—" };
	try {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) return { day: "—", month: "—" };
		return {
			day: d.getDate(),
			month: MONTHS[d.getMonth()],
		};
	} catch {
		return { day: "—", month: "—" };
	}
}

function getSeatsRemaining(event: EventItem): number | null {
	const maximumSeats = Number(event.maximumSeats || 0);
	if (maximumSeats <= 0) return null;
	return Math.max(maximumSeats - Number(event.registeredSeats || 0), 0);
}

function getCleanSnippet(text?: string, maxLength = 110): string {
	if (!text) return "";
	const clean = text
		.replace(/<[^>]*>?/gm, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (clean.length <= maxLength) return clean;
	return clean.slice(0, maxLength).trim() + "…";
}

export default function EventCard({ event, translations = {} }: EventCardProps) {
	const { day, month } = formatEventBadgeDate(event.eventdate);
	const isPast = isEventPast(event.eventdate);
	const seatsRemaining = getSeatsRemaining(event);
	const snippet = getCleanSnippet(event.eventdescription);

	const isFree = event.paymentCollectionEnabled === false || (event.price === 0 && !event.studentPrice);
	const hasPrice = !isFree && typeof event.price === "number" && event.price > 0;

	return (
		<Link
			href={`/events/${event._id}`}
			className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-brand/40 transition-all duration-300 overflow-hidden hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand/40"
		>
			{/* Thumbnail Section */}
			<div className="relative w-full h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
				{event.eventposterUrl ? (
					<Image
						src={event.eventposterUrl}
						alt={event.eventname}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						className="object-cover object-top origin-top group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-brand-50/20 to-brand/10">
						<Calendar className="w-10 h-10 text-brand/40 mb-1" />
						<span className="text-xs font-medium text-gray-400">PNSB Event</span>
					</div>
				)}

				{/* Subtle gradient for contrast */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

				{/* Date Badge (Top Left) */}
				<div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-white/50 overflow-hidden text-center min-w-[50px] transition-transform duration-300 group-hover:scale-105">
					<div className="bg-brand text-white text-[10px] font-bold uppercase tracking-wider py-0.5 px-2">
						{month}
					</div>
					<div className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-none py-1.5 px-2">
						{day}
					</div>
				</div>

				{/* Status Pill (Top Right) */}
				<div className="absolute top-3 right-3">
					{isPast ? (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900/75 text-white backdrop-blur-md shadow-sm">
							Past
						</span>
					) : isFree ? (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
							Free
						</span>
					) : hasPrice ? (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/90 text-white backdrop-blur-md shadow-sm">
							NOK {event.price}
						</span>
					) : (
						<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/90 text-white backdrop-blur-md shadow-sm">
							Upcoming
						</span>
					)}
				</div>
			</div>

			{/* Card Body - Just Important Quick Info */}
			<div className="p-4 sm:p-5 flex flex-col flex-1">
				{/* Title */}
				<h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug mb-2.5">
					{event.eventname}
				</h3>

				{/* Quick Metadata */}
				<div className="space-y-1.5 text-xs sm:text-sm text-gray-600 mb-3">
					{event.eventtime && (
						<div className="flex items-center gap-2">
							<Clock className="w-3.5 h-3.5 text-brand flex-shrink-0" />
							<span className="line-clamp-1">{event.eventtime}</span>
						</div>
					)}
					{event.eventvenue && (
						<div className="flex items-center gap-2">
							<MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
							<span className="line-clamp-1">{event.eventvenue}</span>
						</div>
					)}
				</div>

				{/* Short Description Teaser */}
				{snippet ? (
					<p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
						{snippet}
					</p>
				) : (
					<div className="flex-1" />
				)}

				{/* Clean Footer Row */}
				<div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto text-xs">
					<div>
						{isPast ? (
							<span className="text-gray-400 font-medium">Event ended</span>
						) : seatsRemaining !== null ? (
							seatsRemaining > 0 ? (
								<span className="font-medium text-amber-600">{seatsRemaining} seats left</span>
							) : (
								<span className="font-medium text-rose-600">Sold out</span>
							)
						) : event.registrationEnabled === false ? (
							<span className="text-gray-400 font-medium">Registration closed</span>
						) : (
							<span className="font-medium text-emerald-600">Registration open</span>
						)}
					</div>

					<span className="font-semibold text-brand inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
						{translations.view_detail || "View Details"}
						<ArrowRight className="w-3.5 h-3.5" />
					</span>
				</div>
			</div>
		</Link>
	);
}

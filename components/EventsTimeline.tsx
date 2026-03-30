"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from "./SectionHeader";
import { useState, useEffect } from "react";
import EventPopup from "./EventPopup";

interface Event {
	_id: string;
	eventname: string;
	eventdescription: string;
	eventvenue: string;
	eventdate: string;
	eventtime: string;
	eventposterUrl: string;
	eventposter2Url?: string;
	eventposter3Url?: string;
	eventvideoUrl?: string;
	createdAt: string;
}

export default function EventsTimeline() {
	const locale = useLocale();
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [latestEvent, setLatestEvent] = useState<Event | null>(null);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				const res = await fetch(`${baseUrl}/api/events`, { cache: "no-store" });
				const data = await res.json();
				// Get latest 4 events for timeline
				const allEvents = data.events || [];
				setEvents(allEvents.slice(0, 4));
				// Set latest event for popup
				if (allEvents.length > 0) {
					setLatestEvent(allEvents[0]);
				}
			} catch (error) {
				console.error("Failed to fetch events:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	const getLocalizedTitle = (event: Event): string => {
		return event.eventname || "Untitled Event";
	};

	const getLocalizedDescription = (event: Event): string => {
		return event.eventdescription || "";
	};

	// const getEventTypeColor = (type?: string) => {
	// 	return "from-blue-500 to-blue-600";
	// };

	if (loading) {
		return (
			<section className="py-20 bg-white">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
									<div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
									<div className="h-3 bg-gray-300 rounded mb-2"></div>
									<div className="h-3 bg-gray-300 rounded w-5/6"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<>
			<section className="py-20 bg-white">
				<div className="container mx-auto px-6">
					{/* Section Header */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-16"
					>
						<SectionHeader heading="Upcoming Events" />
						<p className="text-gray-600 mt-4 max-w-2xl mx-auto">
							Join us for exciting events and activities that bring our community together.
						</p>
					</motion.div>

					{events.length > 0 ? (
						<div className="w-full">
							{/* Timeline */}
							<div className="relative">
								{/* Timeline Line */}
								<div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

								{/* Timeline Events */}
								{events.map((event, index) => (
									<motion.div
										key={event._id}
										initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.6, delay: index * 0.2 }}
										className={`relative flex items-center mb-12 ${
											index % 2 === 0 ? "md:flex-row-reverse" : ""
										}`}
									>
										{/* Timeline Dot */}
										<div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-500 rounded-full z-10"></div>

										{/* Event Card - Full Width */}
										<div className={`ml-16 md:ml-0 md:w-11/12 ${index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}>
											<div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 group">
												<div className="flex flex-col md:flex-row">
													{/* Event Poster Column */}
													<div className="w-full md:w-1/3 relative h-48 md:h-auto">
														<Image 
															src={event.eventposterUrl || "/ghanti.png"} 
															alt={getLocalizedTitle(event)} 
															fill 
															className="object-cover transition-transform duration-700 group-hover:scale-110" 
														/>
														{/* Gradient Overlay */}
														<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden"></div>
														
														{/* Event Date Badge on Poster */}
														<div className="absolute top-4 left-4">
															<div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
																<div className="text-center">
																	<div className="text-xs font-bold text-blue-600">{event.eventdate?.split(' ')[0] || 'Date'}</div>
																</div>
															</div>
														</div>
													</div>

													{/* Event Information Column */}
													<div className="w-full md:w-2/3 p-6 md:p-8">
														{/* Event Type Badge */}
														<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
															<Calendar className="w-4 h-4" />
															Upcoming Event
														</div>

														{/* Event Title */}
														<h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
															{getLocalizedTitle(event)}
														</h3>

														{/* Event Description */}
														<p className="text-gray-600 mb-6 line-clamp-3 text-base leading-relaxed">
															{getLocalizedDescription(event)}
														</p>

														{/* Event Details Grid */}
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
															<div className="flex items-center text-gray-500">
																<Calendar className="w-5 h-5 mr-3 text-blue-500" />
																<span className="font-medium">{event.eventdate}</span>
															</div>
															{event.eventtime && (
																<div className="flex items-center text-gray-500">
																	<Clock className="w-5 h-5 mr-3 text-purple-500" />
																	<span className="font-medium">{event.eventtime}</span>
																</div>
															)}
															{event.eventvenue && (
																<div className="flex items-center text-gray-500">
																	<MapPin className="w-5 h-5 mr-3 text-green-500" />
																	<span className="font-medium">{event.eventvenue}</span>
																</div>
															)}
														</div>

														{/* Action Button */}
														<div className="flex items-center justify-between">
															<Link href={`/${locale}/events`}>
																<button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
																	View Details
																	<ArrowRight className="w-5 h-5 ml-2" />
																</button>
															</Link>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Spacer for alternating layout */}
										<div className="hidden md:block md:w-1/12"></div>
									</motion.div>
								))}
							</div>

							{/* View All Events Button */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.8 }}
								className="text-center mt-12"
							>
								<Link href={`/${locale}/events`}>
									<button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
										View All Events
										<ArrowRight className="w-5 h-5 ml-2" />
									</button>
								</Link>
							</motion.div>
						</div>
					) : (
						<div className="text-center py-12">
							<Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Events</h3>
							<p className="text-gray-500">Check back soon for new events and activities.</p>
						</div>
					)}
				</div>
			</section>
			<EventPopup latestEvent={latestEvent} />
		</>
	);
}

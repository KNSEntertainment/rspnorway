"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import useFetchData from "@/hooks/useFetchData";
import { Calendar, MapPin, Clock, Bell } from "lucide-react";

export default function EventsAndNoticesPage() {
	const { data: events } = useFetchData("/api/events", "events");
	const { data: notices } = useFetchData("/api/notices", "notices");
	const [activeTab, setActiveTab] = useState("events"); // 'events' or 'notices'
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [selectedNotice, setSelectedNotice] = useState(null);

	const sortedEvents = events?.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime()) || [];
	const sortedNotices = notices?.sort((a, b) => new Date(b.noticedate).getTime() - new Date(a.noticedate).getTime()) || [];

	const formatDate = (dateString) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			return dateString;
		}
	};

	const formatEventDate = (dateString) => {
		try {
			const date = new Date(dateString);
			const day = date.getDate();
			const month = date.toLocaleString("default", { month: "short" });
			return { day, month };
		} catch {
			return { day: "—", month: "—" };
		}
	};

	// Event Detail View
	if (selectedEvent) {
		const { day, month } = formatEventDate(selectedEvent.eventdate);
		return (
			<div className="min-h-screen pt-24 md:pt-32">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					{/* Back Button */}
					<button onClick={() => setSelectedEvent(null)} className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to Events & Notices
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<Card className="shadow-2xl border-none bg-white overflow-hidden">
								<div className="relative h-96">
									{selectedEvent.eventposterUrl ? (
										<Image src={selectedEvent.eventposterUrl} alt={selectedEvent.eventname} fill className="object-cover" />
									) : (
										<div className="flex items-center justify-center h-full">
											<Calendar className="w-32 h-32" />
										</div>
									)}
								</div>
								<CardContent className="p-8">
									{/* Date Badge */}
									<div className="flex items-start gap-6 mb-6">
										<div className="bg-gradient-to-br  text-brand rounded-xl p-4 shadow-lg min-w-[100px] text-center">
											<div className="text-4xl font-bold">{day}</div>
											<div className="text-sm uppercase tracking-wider">{month}</div>
										</div>
										<div className="flex-1">
											<h1 className="text-4xl font-bold text-gray-800 mb-4">{selectedEvent.eventname}</h1>
											<div className="flex flex-wrap gap-4 text-gray-600">
												{selectedEvent.eventtime && (
													<div className="flex items-center gap-2">
														<Clock className="w-5 h-5 text-brand" />
														<span>{selectedEvent.eventtime}</span>
													</div>
												)}
												{selectedEvent.eventvenue && (
													<div className="flex items-center gap-2">
														<MapPin className="w-5 h-5" />
														<span>{selectedEvent.eventvenue}</span>
													</div>
												)}
											</div>
										</div>
									</div>

									{/* Event Description */}
									{selectedEvent.eventdescription && (
										<div className="prose prose-lg max-w-none mb-6">
											<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.eventdescription}</p>
										</div>
									)}

									{/* Event Details Grid */}
									<div className="grid md:grid-cols-2 gap-6 mt-8 p-6 bg-yellow-50 rounded-lg">
										{selectedEvent.eventvenue && (
											<div>
												<h3 className="text-sm font-semibold text-gray-500 mb-1">Venue</h3>
												<p className="text-gray-800">{selectedEvent.eventvenue}</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Other Events */}
						<div>
							<h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
								<Calendar className="w-6 h-6 mr-2" />
								Other Events
							</h3>
							<div className="space-y-4">
								{sortedEvents
									.filter((e) => e._id !== selectedEvent._id)
									.slice(0, 3)
									.map((event) => {
										const { day, month } = formatEventDate(event.eventdate);
										return (
											<Card key={event._id} className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setSelectedEvent(event)}>
												<CardContent className="p-4 flex gap-4">
													<div className="  text-brand rounded-lg p-3 text-center min-w-[60px]">
														<div className="text-2xl font-bold">{day}</div>
														<div className="text-xs uppercase">{month}</div>
													</div>
													<div>
														<h4 className="font-bold text-gray-800 line-clamp-2">{event.eventname}</h4>
														<p className="text-sm text-gray-600">{event.eventvenue}</p>
													</div>
												</CardContent>
											</Card>
										);
									})}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Notice Detail View
	if (selectedNotice) {
		return (
			<div className=" min-h-screen pt-24 md:pt-32">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					{/* Back Button */}
					<button onClick={() => setSelectedNotice(null)} className="flex items-center text -brand hover:text -brand font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to Events & Notices
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<Card className="shadow-2xl border-none bg-white overflow-hidden">
								{/* Notice Image */}
								<div className="relative h-96">
									{selectedNotice.noticeimage ? (
										<Image src={selectedNotice.noticeimage} alt={selectedNotice.noticetitle} fill className="object-cover" />
									) : (
										<div className="flex items-center justify-center h-full">
											<Bell className="w-32 h-32 text -brand" />
										</div>
									)}
								</div>

								<CardContent className="p-8">
									<div className="flex items-center gap-2 mb-6">
										<Calendar className="w-5 h-5 text" />
										<p className="text -brand font-medium">{formatDate(selectedNotice.noticedate)}</p>
									</div>

									<h1 className="text-4xl font-bold text-gray-800 mb-8">{selectedNotice.noticetitle}</h1>

									<div className="prose prose-lg max-w-none">
										<div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.notice}</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Other Notices */}
						<div>
							<h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
								<Bell className="w-6 h-6 text -brand mr-2" />
								Other Notices
							</h3>
							<div className="space-y-4">
								{sortedNotices
									.filter((n) => n._id !== selectedNotice._id)
									.slice(0, 3)
									.map((notice) => (
										<Card key={notice._id} className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setSelectedNotice(notice)}>
											<div className="bg -brand h-1" />
											<CardContent className="p-4">
												<div className="flex items-center gap-2 mb-2">
													<Calendar className="w-4 h-4 text -brand" />
													<p className="text -brand text-xs font-medium">{formatDate(notice.noticedate)}</p>
												</div>
												<h4 className="font-bold text-gray-800 line-clamp-2 mb-2">{notice.noticetitle}</h4>
												<p className="text-gray-600 text-sm line-clamp-2">{notice.notice}</p>
											</CardContent>
										</Card>
									))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Main Page - Events & Notices Grid
	return (
		<div className="min-h-screen mt-20 md:mt-24">
			<div className="container max-w-7xl mx-auto px-4 py-12 md:py-16">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold mb-6">
						Events & <span className="text-brand">Notices</span>
					</h1>
					<div className="w-24 h-1 mx-auto mb-6 bg-brand rounded-full"></div>
					<p className="text-gray-600 max-w-3xl mx-auto text-lg">Stay connected with our vibrant school community. Explore upcoming events and important announcements.</p>
				</div>

				{/* Tabs */}
				<div className="flex justify-center mb-12">
					<div className="inline-flex rounded-lg bg-gray-100 p-1">
						<button onClick={() => setActiveTab("events")} className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === "events" ? "bg-gradient-to-r from-blue-400 to-brand  text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`}>
							<Calendar className="w-5 h-5 inline mr-2" />
							Events
						</button>
						<button onClick={() => setActiveTab("notices")} className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === "notices" ? "bg-gradient-to-r from-brand to-blue-400  text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`}>
							<Bell className="w-5 h-5 inline mr-2" />
							Notices
						</button>
					</div>
				</div>

				{/* Events Section */}
				{activeTab === "events" && (
					<div className="animate-fadeIn">
						{sortedEvents && sortedEvents.length > 0 ? (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{sortedEvents.map((event) => {
									const { day, month } = formatEventDate(event.eventdate);
									return (
										<Card key={event._id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-none" onClick={() => setSelectedEvent(event)}>
											<div className="relative h-48 bg-gradient-to-br from-yellow-100 to -brand overflow-hidden">
												{event.eventposterUrl ? (
													<Image src={event.eventposterUrl} alt={event.eventname} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
												) : (
													<div className="flex items-center justify-center h-full">
														<Calendar className="w-20 h-20" />
													</div>
												)}
											</div>
											<CardContent className="p-6">
												{/* Date Badge */}
												<div className="flex items-start gap-4 mb-4">
													<div className="  text-brand rounded-lg p-3 shadow-lg text-center min-w-[70px]">
														<div className="text-3xl font-bold">{day}</div>
														<div className="text-xs uppercase tracking-wider">{month}</div>
													</div>
													<div className="flex-1">
														<h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text -brand transition-colors">{event.eventname}</h3>
													</div>
												</div>

												{/* Event Details */}
												<div className="space-y-2 text-sm text-gray-600">
													{event.eventtime && (
														<div className="flex items-center gap-2">
															<Clock className="w-4 h-4" />
															<span>{event.eventtime}</span>
														</div>
													)}
													{event.eventvenue && (
														<div className="flex items-center gap-2">
															<MapPin className="w-4 h-4 text -brand" />
															<span className="line-clamp-1">{event.eventvenue}</span>
														</div>
													)}
												</div>

												{event.eventdescription && <p className="text-gray-600 mt-4 line-clamp-3 text-sm leading-relaxed">{event.eventdescription}</p>}

												<div className="mt-6 pt-4 border-t border-gray-100">
													<span className="text -brand font-medium text-sm group-hover:text -brand inline-flex items-center">
														Learn more
														<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
														</svg>
													</span>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						) : (
							<div className="text-center py-20">
								<Calendar className="w-24 h-24 text-gray-300 mx-auto mb-4" />
								<h3 className="text-2xl font-medium text-gray-500 mb-2">No Events Scheduled</h3>
								<p className="text-gray-400">Check back soon for upcoming events!</p>
							</div>
						)}
					</div>
				)}

				{/* Notices Section */}
				{activeTab === "notices" && (
					<div className="animate-fadeIn">
						{sortedNotices && sortedNotices.length > 0 ? (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{sortedNotices.map((notice) => (
									<Card key={notice._id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-none" onClick={() => setSelectedNotice(notice)}>
										{/* Notice Image */}
										<div className="relative h-48 bg-gradient-to-br from -brand to-emerald-100 overflow-hidden">
											{notice.noticeimage ? (
												<Image src={notice.noticeimage} alt={notice.noticetitle} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
											) : (
												<div className="flex items-center justify-center h-full">
													<Bell className="w-20 h-20 text -brand" />
												</div>
											)}
										</div>

										<CardContent className="p-6">
											<div className="flex items-center gap-2 mb-4">
												<Calendar className="w-4 h-4 text -brand" />
												<p className="text -brand text-sm font-medium">{formatDate(notice.noticedate)}</p>
											</div>

											<h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text -brand transition-colors">{notice.noticetitle}</h3>

											<p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{notice.notice}</p>

											<div className="mt-6 pt-4 border-t border-gray-100">
												<span className="text -brand font-medium text-sm group-hover:text -brand inline-flex items-center">
													Read more
													<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</span>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className="text-center py-20">
								<Bell className="w-24 h-24 text-gray-300 mx-auto mb-4" />
								<h3 className="text-2xl font-medium text-gray-500 mb-2">No Notices Available</h3>
								<p className="text-gray-400">Check back later for updates and announcements.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

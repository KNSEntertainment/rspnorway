"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import useFetchData from "@/hooks/useFetchData";
import { Calendar, MapPin, Clock, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import GlobalLoading from "@/components/GlobalLoading";
import SectionHeader from "@/components/SectionHeader";

export default function EventsAndNoticesPage() {
	const { data: events, loading: eventsLoading } = useFetchData("/api/events", "events");
	const { data: notices, loading: noticesLoading } = useFetchData("/api/notices", "notices");
	const [activeTab, setActiveTab] = useState("events"); // 'events' or 'notices'
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [selectedNotice, setSelectedNotice] = useState(null);

	const t = useTranslations("notices");

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

	if ((activeTab === "events" && eventsLoading) || (activeTab === "notices" && noticesLoading)) {
		return <GlobalLoading />;
	}

	// Event Detail View
	if (selectedEvent) {
		const { day, month } = formatEventDate(selectedEvent.eventdate);
		return (
			<div className="min-h-screen pt-32 md:pt-40">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					{/* Back Button */}
					<button onClick={() => setSelectedEvent(null)} className="flex items-center text-gray-900 hover:text-brand font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						{t("back")}
					</button>

					<div className="grid lg:grid-cols-3 gap-8 md:py-6">
						<div className="lg:col-span-2">
							<Card className="md:shadow-md border-none bg-gray-50 overflow-hidden">
								<div className="relative h-64 md:h-96">
									{selectedEvent.eventposterUrl ? (
										<Image src={selectedEvent.eventposterUrl} alt={selectedEvent.eventname} fill className="object-cover" />
									) : (
										<div className="flex items-center justify-center h-full">
											<Calendar className="w-32 h-32" />
										</div>
									)}
								</div>
								<CardContent className="px-4 py-8 md:p-8">
									{/* Date Badge */}
									<div className="flex items-end gap-6 mb-6">
										<div className="bg-gradient-to-br  text-brand rounded-xl p-4 shadow-lg min-w-[70px] md:min-w-[100px] text-center">
											<div className="text-2xl md:text-4xl font-bold">{day}</div>
											<div className="text-sm uppercase tracking-wider">{month}</div>
										</div>
										<div className="flex-1">
											<h1 className="text-md md:text-2xl font-bold text-gray-800 mb-2">{selectedEvent.eventname}</h1>
											<div className="flex flex-col md:flex-row md:space-y-0 flex-wrap md:gap-4 text-gray-600">
												{selectedEvent.eventtime && (
													<div className="flex items-center gap-2">
														<Clock className="w-5 h-5 text-brand" />
														<span>{selectedEvent.eventtime}</span>
													</div>
												)}
												{selectedEvent.eventvenue && (
													<div className="flex items-center gap-2">
														<MapPin className="w-5 h-5 text-brand" />
														<span>{selectedEvent.eventvenue}</span>
													</div>
												)}
											</div>
										</div>
									</div>

									{/* Event Details Grid */}
									{selectedEvent.eventdescription && selectedEvent.eventdescription !== "" ? (
										<div className="grid md:grid-cols-2 gap-6 mt-2 md:mt-6 p-6">
											<div className="prose prose-lg max-w-none mb-6">
												<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.eventdescription}</p>
											</div>
										</div>
									) : (
										<p>Description will be available soon. Thank you for your patience.</p>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Other Events */}
						<div>
							<h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
								<Calendar className="w-6 h-6 mr-2" />
								{t("other_events")}
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
						{t("back")}
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
								{t("other_notices")}
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
		<div className="px-4">
			{/* Header */}
			<div className="text-center mb-8 md:mb-12">
				<SectionHeader heading={t("title")} />

				<p className="text-gray-600 max-w-3xl mx-auto text-lg">{t("description")}</p>
			</div>

			{/* Tabs */}
			<div className="flex justify-center mb-12 md:mb-12">
				<div className="inline-flex rounded-lg bg-gray-100 p-1">
					<button onClick={() => setActiveTab("events")} className={`px-4 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === "events" ? "bg-gradient-to-r from-blue-400 to-brand  text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`}>
						<Calendar className="w-5 h-5 inline mr-2" />
						{t("events_tab")}
					</button>
					<button onClick={() => setActiveTab("notices")} className={`px-4 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === "notices" ? "bg-gradient-to-r from-brand to-blue-400  text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`}>
						<Bell className="w-5 h-5 inline mr-2" />
						{t("notices_tab")}
					</button>
				</div>
			</div>

			{/* Events Section */}
			{activeTab === "events" && (
				<div className="animate-fadeIn">
					{sortedEvents && sortedEvents.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
							{sortedEvents.map((event) => {
								const { day, month } = formatEventDate(event.eventdate);
								return (
									<Card key={event._id} className="md:mx-4 group cursor-pointer md:hover:shadow-2xl md:transition-all md:duration-300 hover:-translate-y-1 overflow-hidden border-none" onClick={() => setSelectedEvent(event)}>
										<div className="relative h-32 md:h-48 bg-gradient-to-br from-yellow-100 to -brand overflow-hidden">
											{event.eventposterUrl ? (
												<Image src={event.eventposterUrl} alt={event.eventname} fill className="object-cover md:group-hover:scale-110 md:transition-transform md:duration-500" />
											) : (
												<div className="flex items-center justify-center h-full">
													<Calendar className="w-12 md:w-20 h-12 md:h-20" />
												</div>
											)}
										</div>
										<CardContent className="p-4 md:p-6">
											{/* Date Badge */}
											<div className="flex items-end gap-4 mb-4">
												<div className="  text-brand rounded-lg p-3 shadow-lg text-center md:min-w-[70px]">
													<div className="text-md md:text-3xl font-bold">{day}</div>
													<div className="text-xs uppercase tracking-wider">{month}</div>
												</div>
												<div className="flex-1">
													<h3 className="text-sm md:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text -brand transition-colors">{event.eventname}</h3>
												</div>
											</div>

											{/* Event Details */}
											<div className="space-y-1 md:space-y-2 text-sm text-gray-600">
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

											{event.eventdescription && <p className="text-gray-600 mt-2 line-clamp-3 text-sm leading-relaxed">{event.eventdescription}</p>}

											<div className="pt-1 md:pt-4 border-t border-gray-100">
												<span className="text -brand font-medium text-sm group-hover:text -brand inline-flex items-center">
													{t("learn_more")}
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
							<h3 className="text-2xl font-medium text-gray-500 mb-2">{t("no_events")}</h3>
							<p className="text-gray-400">{t("no_events_desc")}</p>
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
												{t("read_more")}
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
							<h3 className="text-2xl font-medium text-gray-500 mb-2">{t("no_notices")}</h3>
							<p className="text-gray-400">{t("no_notices_desc")}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

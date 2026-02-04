"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, MapPin, Clock, Bell, FileText } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
	eventdescription?: string;
	eventposterUrl?: string;
}

interface Notice {
	_id: string;
	noticetitle: string;
	noticedate: string;
	noticetime?: string;
	notice: string;
	noticeimage?: string;
}

interface Circular {
	_id: string;
	slug: string;
	circularTitle: Record<string, string>;
	circularDesc: Record<string, string>;
	circularAuthor?: Record<string, string>;
	circularMainPicture?: string;
	circularSecondPicture?: string;
	publicationStatus: string;
	circularPublishedAt?: string;
	createdAt: string;
}

interface Translations {
	title: string;
	description: string;
	events_tab: string;
	notices_tab: string;
	circulars_tab: string;
	back: string;
	other_events: string;
	other_notices: string;
	other_circulars: string;
	learn_more: string;
	read_more: string;
	no_events: string;
	no_events_desc: string;
	no_notices: string;
	no_notices_desc: string;
	no_circulars: string;
	no_circulars_desc: string;
}

interface Props {
	events: Event[];
	notices: Notice[];
	circulars: Circular[];
	translations: Translations;
	locale: string;
}

export default function UpdatesClient({ events, notices, circulars, translations: t, locale }: Props) {
	const [activeTab, setActiveTab] = useState("events");
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
	const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

	const sortedEvents = events?.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime()) || [];
	const sortedNotices = notices?.sort((a, b) => new Date(b.noticedate).getTime() - new Date(a.noticedate).getTime()) || [];
	const sortedCirculars = circulars?.filter((c) => c.publicationStatus === "published").sort((a, b) => new Date(b.circularPublishedAt || b.createdAt).getTime() - new Date(a.circularPublishedAt || a.createdAt).getTime()) || [];

	const formatDate = (dateString: string) => {
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

	const formatEventDate = (dateString: string) => {
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
			<div className="min-h-screen bg-neutral-50">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					<button onClick={() => setSelectedEvent(null)} className="flex items-center text-neutral-900 hover:text-brand font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						{t.back}
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content - Left Side */}
						<div className="lg:col-span-2">
							<Card className="shadow-lg border border-neutral-200 bg-white overflow-hidden">
								{/* Event Header */}
								<div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 border-b border-neutral-100">
									<div className="flex items-start gap-6">
										<div className="bg-gradient-to-br from-brand to-brand/80 text-white rounded-2xl p-4 shadow-md min-w-[80px] md:min-w-[100px] text-center flex-shrink-0">
											<div className="text-3xl md:text-4xl font-bold leading-none">{day}</div>
											<div className="text-sm md:text-base uppercase tracking-wider mt-1 opacity-90">{month}</div>
										</div>
										<div className="flex-1 min-w-0">
											<h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 leading-tight">{selectedEvent.eventname}</h1>
											<div className="flex flex-col gap-2.5 text-neutral-600">
												{selectedEvent.eventtime && (
													<div className="flex items-center gap-2.5">
														<Clock className="w-5 h-5 text-brand flex-shrink-0" />
														<span className="text-sm md:text-base">{selectedEvent.eventtime}</span>
													</div>
												)}
												{selectedEvent.eventvenue && (
													<div className="flex items-center gap-2.5">
														<MapPin className="w-5 h-5 text-brand flex-shrink-0" />
														<span className="text-sm md:text-base">{selectedEvent.eventvenue}</span>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								<CardContent className="p-6 md:p-8">
									{/* Event Poster */}
									<div className="relative w-full overflow-hidden">
										{selectedEvent.eventposterUrl ? (
											<Image src={selectedEvent.eventposterUrl} alt={selectedEvent.eventname} width={1200} height={800} className="w-full h-auto object-contain" priority />
										) : (
											<div className="flex items-center justify-center h-full">
												<Calendar className="w-24 h-24 text-neutral-300" />
											</div>
										)}
									</div>

									{/* Event Description */}
									<div className="mt-6">
										<h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
											<svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											About this event
										</h2>
										{selectedEvent.eventdescription && selectedEvent.eventdescription !== "" ? (
											<div className="prose prose-lg max-w-none">
												<p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.eventdescription}</p>
											</div>
										) : (
											<div className="bg-info-100 border border-info-500 rounded-lg p-4">
												<p className="text-info-700 text-center">Description will be available soon. Thank you for your patience.</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Right Side */}
						<div className="lg:col-span-1">
							<div className="sticky top-8">
								<h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
									<Calendar className="w-6 h-6 mr-2 text-brand" />
									{t.other_events}
								</h3>
								<div className="space-y-4">
									{sortedEvents
										.filter((e) => e._id !== selectedEvent._id)
										.slice(0, 3)
										.map((event) => {
											const { day, month } = formatEventDate(event.eventdate);
											return (
												<Card key={event._id} className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-neutral-200 bg-white hover:border-brand/50" onClick={() => setSelectedEvent(event)}>
													<CardContent className="p-4 flex gap-4">
														<div className="bg-gradient-to-br from-brand/10 to-brand/5 text-brand rounded-lg p-3 text-center min-w-[60px] flex-shrink-0">
															<div className="text-2xl font-bold leading-none">{day}</div>
															<div className="text-xs uppercase mt-1">{month}</div>
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-bold text-neutral-900 line-clamp-2 mb-1">{event.eventname}</h4>
															<p className="text-sm text-neutral-600 line-clamp-1">{event.eventvenue}</p>
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
			</div>
		);
	}

	// Notice Detail View
	if (selectedNotice) {
		return (
			<div className=" min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					<button onClick={() => setSelectedNotice(null)} className="flex items-center text -brand hover:text -brand font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						{t.back}
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<Card className="shadow-2xl border-none bg-white overflow-hidden">
								<CardContent className="p-8">
									<h1 className="text-4xl font-bold text-neutral-800 mb-4">{selectedNotice.noticetitle}</h1>

									<div className="flex items-center gap-4 mb-8">
										<div className="flex items-center gap-2">
											<Calendar className="w-5 h-5 text-brand" />
											<p className="text-brand font-medium">{formatDate(selectedNotice.noticedate)}</p>
										</div>
										{selectedNotice.noticetime && (
											<div className="flex items-center gap-2">
												<Clock className="w-5 h-5 text-brand" />
												<p className="text-brand font-medium">{selectedNotice.noticetime}</p>
											</div>
										)}
									</div>

									<div className="relative w-full overflow-hidden mb-8">
										{selectedNotice.noticeimage ? (
											<Image src={selectedNotice.noticeimage} alt={selectedNotice.noticetitle} width={1200} height={800} className="w-full h-auto object-contain" priority />
										) : (
											<div className="flex items-center justify-center py-12">
												<Bell className="w-32 h-32 text-brand" />
											</div>
										)}
									</div>

									<div className="prose prose-lg max-w-none">
										<div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.notice}</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<div>
							<h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
								<Bell className="w-6 h-6 text -brand mr-2" />
								{t.other_notices}
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
												<h4 className="font-bold text-neutral-800 line-clamp-2 mb-2">{notice.noticetitle}</h4>
												<p className="text-neutral-600 text-sm line-clamp-2">{notice.notice}</p>
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

	// Circular Detail View
	if (selectedCircular) {
		return (
			<div className=" min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					<button onClick={() => setSelectedCircular(null)} className="flex items-center text-brand hover:text-brand font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						{t.back}
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<Card className="shadow-2xl border-none bg-white overflow-hidden">
								<CardContent className="p-8">
									<h1 className="text-4xl font-bold text-neutral-800 mb-4">{selectedCircular.circularTitle[locale] || selectedCircular.circularTitle["en"] || "Circular"}</h1>

									<div className="flex items-center gap-2 mb-4">
										<Calendar className="w-5 h-5 text-brand" />
										<p className="text-brand font-medium">{formatDate(selectedCircular.circularPublishedAt || selectedCircular.createdAt)}</p>
									</div>

									{selectedCircular.circularAuthor && selectedCircular.circularAuthor[locale] && <p className="text-neutral-500 text-lg mb-8 italic">By {selectedCircular.circularAuthor[locale]}</p>}

									<div className="relative w-full overflow-hidden mb-8">
										{selectedCircular.circularMainPicture ? (
											<Image src={selectedCircular.circularMainPicture} alt={selectedCircular.circularTitle[locale] || selectedCircular.circularTitle["en"]} width={1200} height={800} className="w-full h-auto object-contain" priority />
										) : (
											<div className="flex items-center justify-center py-12 bg-gradient-to-br from-indigo-100 to-purple-100">
												<FileText className="w-32 h-32 text-brand" />
											</div>
										)}
									</div>

									<div className="prose prose-lg max-w-none">
										<div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{selectedCircular.circularDesc[locale] || selectedCircular.circularDesc["en"] || ""}</div>
									</div>

									{selectedCircular.circularSecondPicture && (
										<div className="relative h-96 mt-8 rounded-lg overflow-hidden">
											<Image src={selectedCircular.circularSecondPicture} alt="Additional image" fill className="object-cover" />
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div>
							<h3 className="text-xl font-bold text-neutral-800 mb-4 flex items-center">
								<FileText className="w-6 h-6 text-brand mr-2" />
								{t.other_circulars}
							</h3>
							<div className="space-y-4">
								{sortedCirculars
									.filter((c) => c._id !== selectedCircular._id)
									.slice(0, 3)
									.map((circular) => (
										<Card key={circular._id} className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setSelectedCircular(circular)}>
											<div className="bg-brand h-1" />
											<CardContent className="p-4">
												<div className="flex items-center gap-2 mb-2">
													<Calendar className="w-4 h-4 text-brand" />
													<p className="text-brand text-xs font-medium">{formatDate(circular.circularPublishedAt || circular.createdAt)}</p>
												</div>
												<h4 className="font-bold text-neutral-800 line-clamp-2 mb-2">{circular.circularTitle[locale] || circular.circularTitle["en"]}</h4>
												<p className="text-neutral-600 text-sm line-clamp-2">{circular.circularDesc[locale] || circular.circularDesc["en"]}</p>
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
		<div className="px-4 pb-8">
			<div className="text-center mb-8 md:mb-12">
				<SectionHeader heading={t.title} />
				<p className="text-neutral-600 max-w-3xl mx-auto text-lg">{t.description}</p>
			</div>

			<div className="flex justify-center mb-12 md:mb-12">
				<div className="inline-flex rounded-lg bg-neutral-100 p-1">
					<button onClick={() => setActiveTab("events")} className={`px-4 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === "events" ? "bg-gradient-to-r from-blue-400 to-brand  text-white shadow-lg" : "text-neutral-600 hover:text-neutral-800"}`}>
						<Calendar className="w-5 h-5 inline mr-2" />
						{t.events_tab}
					</button>
					<button onClick={() => setActiveTab("notices")} className={`px-4 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === "notices" ? "bg-gradient-to-r from-brand to-blue-400  text-white shadow-lg" : "text-neutral-600 hover:text-neutral-800"}`}>
						<Bell className="w-5 h-5 inline mr-2" />
						{t.notices_tab}
					</button>
					<button onClick={() => setActiveTab("circulars")} className={`px-4 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === "circulars" ? "bg-gradient-to-r from-blue-400 to-brand  text-white shadow-lg" : "text-neutral-600 hover:text-neutral-800"}`}>
						<FileText className="w-5 h-5 inline mr-2" />
						{t.circulars_tab}
					</button>
				</div>
			</div>

			{activeTab === "events" && (
				<div className="animate-fadeIn">
					{sortedEvents && sortedEvents.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
							{sortedEvents.map((event) => {
								const { day, month } = formatEventDate(event.eventdate);
								return (
									<Card key={event._id} className="md:mx-4 group cursor-pointer md:hover:shadow-2xl md:transition-all md:duration-300 hover:-translate-y-1 overflow-hidden border-none" onClick={() => setSelectedEvent(event)}>
										<div className="relative h-64 md:h-96 bg-gradient-to-br from-yellow-100 to -brand overflow-hidden">
											{event.eventposterUrl ? (
												<Image src={event.eventposterUrl} alt={event.eventname} fill className="object-cover object-top md:group-hover:scale-110 md:transition-transform md:duration-500" />
											) : (
												<div className="flex items-center justify-center h-full">
													<Calendar className="w-12 md:w-20 h-12 md:h-20" />
												</div>
											)}
										</div>
										<CardContent className="p-4 md:p-6">
											<div className="flex items-end gap-4 mb-4">
												<div className="  text-brand rounded-lg p-3 shadow-lg text-center md:min-w-[70px]">
													<div className="text-md md:text-3xl font-bold">{day}</div>
													<div className="text-xs uppercase tracking-wider">{month}</div>
												</div>
												<div className="flex-1">
													<h3 className="text-sm md:text-xl font-bold text-neutral-800 mb-2 line-clamp-2 group-hover:text -brand transition-colors">{event.eventname}</h3>
												</div>
											</div>

											<div className="space-y-1 md:space-y-2 text-sm text-neutral-600">
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

											{event.eventdescription && <p className="text-neutral-600 mt-2 line-clamp-3 text-sm leading-relaxed">{event.eventdescription}</p>}

											<div className="pt-1 md:pt-4 border-t border-neutral-100">
												<span className="text -brand font-medium text-sm group-hover:text -brand inline-flex items-center">
													{t.learn_more}
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
							<Calendar className="w-24 h-24 text-neutral-300 mx-auto mb-4" />
							<h3 className="text-2xl font-medium text-neutral-500 mb-2">{t.no_events}</h3>
							<p className="text-neutral-400">{t.no_events_desc}</p>
						</div>
					)}
				</div>
			)}

			{activeTab === "notices" && (
				<div className="animate-fadeIn">
					{sortedNotices && sortedNotices.length > 0 ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{sortedNotices.map((notice) => (
								<Card key={notice._id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-none" onClick={() => setSelectedNotice(notice)}>
									<div className="flex gap-4 p-4">
										<div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-brand to-emerald-100 rounded-lg overflow-hidden">
											{notice.noticeimage ? (
												<Image src={notice.noticeimage} alt={notice.noticetitle} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
											) : (
												<div className="flex items-center justify-center h-full">
													<Bell className="w-12 h-12 text-brand" />
												</div>
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-2">
												<Calendar className="w-3 h-3 text-brand" />
												<p className="text-brand text-xs font-medium">{formatDate(notice.noticedate)}</p>
											</div>
											<h3 className="text-2xl font-bold text-neutral-800 line-clamp-2 group-hover:text-brand transition-colors">{notice.noticetitle}</h3>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<Bell className="w-24 h-24 text-neutral-300 mx-auto mb-4" />
							<h3 className="text-2xl font-medium text-neutral-500 mb-2">{t.no_notices}</h3>
							<p className="text-neutral-400">{t.no_notices_desc}</p>
						</div>
					)}
				</div>
			)}

			{activeTab === "circulars" && (
				<div className="animate-fadeIn">
					{sortedCirculars && sortedCirculars.length > 0 ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{sortedCirculars.map((circular) => (
								<Card key={circular._id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-none" onClick={() => setSelectedCircular(circular)}>
									<div className="flex gap-4 p-4">
										<div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg overflow-hidden">
											{circular.circularMainPicture ? (
												<Image src={circular.circularMainPicture} alt={circular.circularTitle[locale] || circular.circularTitle["en"]} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
											) : (
												<div className="flex items-center justify-center h-full">
													<FileText className="w-12 h-12 text-brand" />
												</div>
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-2">
												<Calendar className="w-3 h-3 text-brand" />
												<p className="text-brand text-xs font-medium">{formatDate(circular.circularPublishedAt || circular.createdAt)}</p>
											</div>
											<h3 className="text-2xl font-bold text-neutral-800 line-clamp-2 group-hover:text-brand transition-colors">{circular.circularTitle[locale] || circular.circularTitle["en"] || "Circular"}</h3>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<FileText className="w-24 h-24 text-neutral-300 mx-auto mb-4" />
							<h3 className="text-2xl font-medium text-neutral-500 mb-2">{t.no_circulars}</h3>
							<p className="text-neutral-400">{t.no_circulars_desc}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, MapPin, Clock, Bell, FileText, Pencil } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
	eventdescription?: string;
	eventposterUrl?: string;
	eventposter2Url?: string;
	eventposter3Url?: string;
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
	view_detail: string;
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
	initialEventId?: string;
	initialNoticeId?: string;
	initialCircularId?: string;
}

export default function UpdatesClient({ 
	events, 
	notices, 
	circulars, 
	translations: t, 
	locale,
	initialEventId,
	initialNoticeId,
	initialCircularId 
}: Props) {
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
	const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

	// Auto-select item based on URL parameters
	useEffect(() => {
		if (initialEventId) {
			const event = events.find(e => e._id === initialEventId);
			if (event) setSelectedEvent(event);
		}
		if (initialNoticeId) {
			const notice = notices.find(n => n._id === initialNoticeId);
			if (notice) setSelectedNotice(notice);
		}
		if (initialCircularId) {
			const circular = circulars.find(c => c._id === initialCircularId);
			if (circular) setSelectedCircular(circular);
		}
	}, [initialEventId, initialNoticeId, initialCircularId, events, notices, circulars]);

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
		const eventImages = [selectedEvent.eventposterUrl, selectedEvent.eventposter2Url, selectedEvent.eventposter3Url].filter(Boolean) as string[];
		return (
			<div className="min-h-screen bg-light">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					<button onClick={() => setSelectedEvent(null)} className="flex items-center text-gray-900 hover:text-brand font-medium transition-colors duration-300 mb-6">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						{t.back}
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content - Left Side */}
						<div className="lg:col-span-2">
							<Card className="shadow-lg border border-light bg-white overflow-hidden">
								{/* Event Header */}
								<div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 border-b border-neutral-100">
									<div className="flex items-start gap-6">
										<div className="bg-gradient-to-br from-brand to-brand/80 text-white rounded-2xl p-4 shadow-md min-w-[80px] md:min-w-[100px] text-center flex-shrink-0">
											<div className="text-3xl md:text-4xl font-bold leading-none">{day}</div>
											<div className="text-sm md:text-base uppercase tracking-wider mt-1 opacity-90">{month}</div>
										</div>
										<div className="flex-1 min-w-0">
											<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{selectedEvent.eventname}</h1>
											<div className="flex flex-col gap-2.5 text-gray-900">
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
										{eventImages.length > 0 ? (
											<Image src={eventImages[0]} alt={selectedEvent.eventname} width={1200} height={800} className="w-full h-auto object-contain" priority />
										) : (
											<div className="flex items-center justify-center h-full">
												<Calendar className="w-24 h-24 text-neutral-300" />
											</div>
										)}
									</div>

									{/* Event Description */}
									<div className="mt-6">
										<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
											<svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											About this event
										</h2>
										{selectedEvent.eventdescription && selectedEvent.eventdescription !== "" ? (
											<div className="prose prose-lg max-w-none">
												<p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedEvent.eventdescription}</p>
											</div>
										) : (
											<div className="bg-brand/10 border border-brand0 rounded-lg p-4">
												<p className="text-brand text-center">Description will be available soon. Thank you for your patience.</p>
											</div>
										)}
									</div>

									{/* Remaining Event Images */}
									{eventImages.length > 1 && (
										<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
											{eventImages.slice(1).map((url, index) => (
												<div key={`${url}-${index}`} className="relative w-full overflow-hidden rounded-lg border border-neutral-100 bg-white">
													<Image src={url} alt={`${selectedEvent.eventname} ${index + 2}`} width={600} height={400} className="w-full h-auto object-contain" />
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Right Side */}
						<div className="lg:col-span-1">
							<div className="sticky top-8">
								<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
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
												<Card key={event._id} className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-light bg-white hover:border-brand/50" onClick={() => setSelectedEvent(event)}>
													<CardContent className="p-4 flex gap-4">
														<div className="bg-gradient-to-br from-brand/10 to-brand/5 text-brand rounded-lg p-3 text-center min-w-[60px] flex-shrink-0">
															<div className="text-2xl font-bold leading-none">{day}</div>
															<div className="text-xs uppercase mt-1">{month}</div>
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-bold text-gray-900 line-clamp-2 mb-1">{event.eventname}</h4>
															<p className="text-sm text-gray-900 line-clamp-1">{event.eventvenue}</p>
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
									<h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">{selectedNotice.noticetitle}</h1>

									<div className="flex items-center gap-4 mb-8">
										<div className="flex items-center gap-2">
											<Calendar className="w-5 h-5 text-brand" />
											<p className="text-gray-900 font-medium">{formatDate(selectedNotice.noticedate)}</p>
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
										<div className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedNotice.notice}</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<div>
							<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
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
												<h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{notice.noticetitle}</h4>
												<p className="text-gray-900 text-sm line-clamp-2">{notice.notice}</p>
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
									<h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">{selectedCircular.circularTitle[locale] || selectedCircular.circularTitle["en"] || "Circular"}</h1>

									<div className="flex flex-col md:flex-row gap-1 md:gap-4 mb-6 md:mb-12">
										{selectedCircular.circularAuthor && selectedCircular.circularAuthor[locale] && (
											<p className="flex items-center  gap-2 text-gray-900 text-lg">
												<Pencil className="w-5 h-5 text-brand" /> {selectedCircular.circularAuthor[locale]}
											</p>
										)}
										<div className="flex items-center gap-2">
											<Calendar className="w-5 h-5 text-brand" />
											<p className="text-gray-900 font-medium">{formatDate(selectedCircular.circularPublishedAt || selectedCircular.createdAt)}</p>
										</div>
									</div>

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
										<div className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedCircular.circularDesc[locale] || selectedCircular.circularDesc["en"] || ""}</div>
									</div>

									{selectedCircular.circularSecondPicture && (
										<div className="relative h-screen mt-8 rounded-lg overflow-hidden">
											<Image src={selectedCircular.circularSecondPicture} alt="Additional image" fill className="object-contain" />
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div>
							<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
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
												<h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{circular.circularTitle[locale] || circular.circularTitle["en"]}</h4>
												<p className="text-gray-900 text-sm line-clamp-2">{circular.circularDesc[locale] || circular.circularDesc["en"]}</p>
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

	// Main Page - Modern Layout with Enhanced Design
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50">
			<div className="container mx-auto px-4 pt-8 lg:pt-12">
				{/* Header Section */}
				<SectionHeader heading={t.title} subtitle={t.description} />
					
			

				{/* Content Grid - All Sections Visible */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Events Column */}
					<div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-brand to-brand/80 p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
											<Calendar className="w-6 h-6 text-white" />
										</div>
										<h2 className="text-xl font-bold text-white">{t.events_tab}</h2>
									</div>
									<div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
										<span className="text-white font-bold">{sortedEvents.length}</span>
									</div>
								</div>
							</div>
							
							<div className="p-6">
								{sortedEvents && sortedEvents.length > 0 ? (
									<div className="space-y-4">
										{sortedEvents.map((event, index) => {
											const { day, month } = formatEventDate(event.eventdate);
											return (
												<div 
													key={event._id} 
													className="group cursor-pointer rounded-xl border border-gray-200 hover:border-brand hover:shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-r from-gray-50 to-white hover:from-brand/5 hover:to-white"
													onClick={() => setSelectedEvent(event)}
													style={{ animationDelay: `${index * 100}ms` }}
												>
													<div className="p-4">
														<div className="flex gap-4">
															<div className="flex-shrink-0">
																<div className="bg-gradient-to-br from-brand to-brand/80 text-white rounded-xl p-3 text-center min-w-[60px] shadow-md">
																	<div className="text-xl font-bold leading-none">{day}</div>
																	<div className="text-xs uppercase mt-1 opacity-90">{month}</div>
																</div>
															</div>
															<div className="flex-1 min-w-0">
																<h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand transition-colors">
																	{event.eventname}
																</h3>
																<div className="space-y-1 text-sm text-gray-600">
																	{event.eventtime && (
																		<div className="flex items-center gap-2">
																			<Clock className="w-4 h-4 text-brand flex-shrink-0" />
																			<span>{event.eventtime}</span>
																		</div>
																	)}
																	{event.eventvenue && (
																		<div className="flex items-center gap-2">
																			<MapPin className="w-4 h-4 text-brand flex-shrink-0" />
																			<span className="line-clamp-1">{event.eventvenue}</span>
																		</div>
																	)}
																</div>
															</div>
														</div>
														{event.eventposterUrl && (
															<div className="mt-3 relative h-32 rounded-lg overflow-hidden">
																<Image 
																	src={event.eventposterUrl} 
																	alt={event.eventname} 
																	fill 
																	className="object-cover group-hover:scale-105 transition-transform duration-500" 
																/>
															</div>
														)}
														<div className="mt-3 pt-3 border-t border-gray-100">
															<span className="text-brand font-medium text-sm inline-flex items-center group-hover:gap-2 transition-all">
																{t.view_detail}
																<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
																</svg>
															</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
											<Calendar className="w-10 h-10 text-gray-400" />
										</div>
										<h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_events}</h3>
										<p className="text-gray-600 text-sm">{t.no_events_desc}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Notices Column */}
					<div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
											<Bell className="w-6 h-6 text-white" />
										</div>
										<h2 className="text-xl font-bold text-white">{t.notices_tab}</h2>
									</div>
									<div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
										<span className="text-white font-bold">{sortedNotices.length}</span>
									</div>
								</div>
							</div>
							
							<div className="p-6">
								{sortedNotices && sortedNotices.length > 0 ? (
									<div className="space-y-4">
										{sortedNotices.map((notice, index) => (
											<div 
												key={notice._id} 
												className="group cursor-pointer rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-r from-gray-50 to-white hover:from-emerald-50 hover:to-white"
												onClick={() => setSelectedNotice(notice)}
												style={{ animationDelay: `${index * 100}ms` }}
											>
												<div className="p-4">
													<div className="flex gap-4">
														<div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg overflow-hidden">
															{notice.noticeimage ? (
																<Image 
																	src={notice.noticeimage} 
																	alt={notice.noticetitle} 
																	fill 
																	className="object-cover group-hover:scale-110 transition-transform duration-500" 
																/>
															) : (
																<div className="flex items-center justify-center h-full">
																	<Bell className="w-8 h-8 text-emerald-500" />
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-2">
																<Calendar className="w-3 h-3 text-emerald-500" />
																<p className="text-emerald-600 text-xs font-medium uppercase tracking-wider">{formatDate(notice.noticedate)}</p>
															</div>
															<h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
																{notice.noticetitle}
															</h3>
															<p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{notice.notice}</p>
														</div>
													</div>
													<div className="mt-3 pt-3 border-t border-gray-100">
														<span className="text-emerald-600 font-medium text-sm inline-flex items-center group-hover:gap-2 transition-all">
															{t.view_detail}
															<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
															</svg>
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
											<Bell className="w-10 h-10 text-gray-400" />
										</div>
										<h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_notices}</h3>
										<p className="text-gray-600 text-sm">{t.no_notices_desc}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Circulars Column */}
					<div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							<div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
											<FileText className="w-6 h-6 text-white" />
										</div>
										<h2 className="text-xl font-bold text-white">{t.circulars_tab}</h2>
									</div>
									<div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
										<span className="text-white font-bold">{sortedCirculars.length}</span>
									</div>
								</div>
							</div>
							
							<div className="p-6">
								{sortedCirculars && sortedCirculars.length > 0 ? (
									<div className="space-y-4">
										{sortedCirculars.map((circular, index) => (
											<div 
												key={circular._id} 
												className="group cursor-pointer rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-white"
												onClick={() => setSelectedCircular(circular)}
												style={{ animationDelay: `${index * 100}ms` }}
											>
												<div className="p-4">
													<div className="flex gap-4">
														<div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-lg overflow-hidden">
															{circular.circularMainPicture ? (
																<Image 
																	src={circular.circularMainPicture} 
																	alt={circular.circularTitle[locale] || circular.circularTitle["en"]} 
																	fill 
																	className="object-cover group-hover:scale-110 transition-transform duration-500" 
																/>
															) : (
																<div className="flex items-center justify-center h-full">
																	<FileText className="w-8 h-8 text-indigo-500" />
																</div>
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-2">
																<Calendar className="w-3 h-3 text-indigo-500" />
																<p className="text-indigo-600 text-xs font-medium uppercase tracking-wider">
																	{formatDate(circular.circularPublishedAt || circular.createdAt)}
																</p>
															</div>
															<h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
																{circular.circularTitle[locale] || circular.circularTitle["en"] || "Circular"}
															</h3>
															<p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
																{circular.circularDesc[locale] || circular.circularDesc["en"]}
															</p>
														</div>
													</div>
													<div className="mt-3 pt-3 border-t border-gray-100">
														<span className="text-indigo-600 font-medium text-sm inline-flex items-center group-hover:gap-2 transition-all">
															{t.view_detail}
															<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
															</svg>
														</span>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
											<FileText className="w-10 h-10 text-gray-400" />
										</div>
										<h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_circulars}</h3>
										<p className="text-gray-600 text-sm">{t.no_circulars_desc}</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

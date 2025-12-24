import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import useFetchData from "@/hooks/useFetchData";

export default function Notices() {
	const { data: notices } = useFetchData("/api/notices", "notices");
	const [selectedNoticeId, setSelectedNoticeId] = useState(null);

	const sortedNotices = notices?.sort((a, b) => new Date(b.noticedate).getTime() - new Date(a.noticedate).getTime()) || [];

	// If we're on detail page, find the selected notice
	const selectedNotice = selectedNoticeId ? sortedNotices.find((notice) => notice.id === selectedNoticeId) : null;
	const isDetailPage = !!selectedNotice;

	// For detail page: remaining notices (excluding selected one)
	const remainingNotices = isDetailPage ? sortedNotices.filter((notice) => notice.id !== selectedNoticeId).slice(0, 3) : [];

	// For main page: latest and other notices
	const latestNotice = !isDetailPage ? sortedNotices[0] : null;
	const otherNotices = !isDetailPage ? sortedNotices.slice(1).slice(0, 3) : [];

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

	const handleReadMore = (notice) => {
		setSelectedNoticeId(notice.id);
	};

	const handleBackToNotices = () => {
		setSelectedNoticeId(null);
	};

	// Detail Page Layout
	if (isDetailPage && selectedNotice) {
		return (
			<div className="bg-gradient-to-b from-[#0094da] to-white min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-8">
					{/* Back Button */}
					<div className="mb-6">
						<button onClick={handleBackToNotices} className="flex items-center text-[#0094da] hover:text-[#0094da] font-medium transition-colors duration-300">
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Back to Notices
						</button>
					</div>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Left Column - Selected Notice Detail (2/3 width) */}
						<div className="lg:col-span-2">
							<Card className="shadow-xl border-none bg-white overflow-hidden">
								<div className="bg-gradient-to-r from-[#0094da] to-[#0094da] h-2" />

								{/* Notice Image */}
								<div className="relative h-64 md:h-96 bg-gradient-to-br from-[#0094da] to-[#0094da]">
									{selectedNotice.noticeimage ? (
										<Image src={selectedNotice.noticeimage} alt={selectedNotice.noticetitle} fill className="object-cover" />
									) : (
										<div className="flex items-center justify-center h-full">
											<div className="text-center">
												<svg className="w-24 h-24 text-[#0094da] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
												</svg>
												<p className="text-[#0094da] font-medium text-lg">Notice Details</p>
											</div>
										</div>
									)}
								</div>

								{/* Notice Content */}
								<CardContent className="p-8">
									<div className="flex items-center gap-2 mb-6">
										<svg className="w-5 h-5 text-[#0094da]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<p className="text-[#0094da] font-medium">{formatDate(selectedNotice.noticedate)}</p>
									</div>

									<h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 leading-tight">{selectedNotice.noticetitle}</h1>

									<div className="prose prose-lg prose-gray max-w-none">
										<div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNotice.notice}</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Right Column - Remaining Notices (1/3 width) */}
						<div className="lg:col-span-1">
							<div className="space-y-6">
								<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
									<svg className="w-6 h-6 text-[#0094da] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									Other Notices
								</h3>

								<div className="space-y-4">
									{remainingNotices.length > 0 ? (
										remainingNotices.map((notice, index) => (
											<Card key={notice.id || index} className="shadow-md hover:shadow-lg border-none bg-white transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => handleReadMore(notice)}>
												<div className="bg-[#0094da] h-1" />
												<CardContent className="p-4">
													<div className="flex items-center gap-2 mb-3">
														<svg className="w-4 h-4 text-[#0094da] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														<p className="text-[#0094da] text-xs font-medium">{formatDate(notice.noticedate)}</p>
													</div>

													<h4 className="text-md font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">{notice.noticetitle}</h4>

													<p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">{notice.notice}</p>
												</CardContent>
											</Card>
										))
									) : (
										<div className="text-center py-8">
											<p className="text-gray-500">No other notices available</p>
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

	// Main Notices Page Layout (Original)
	return (
		<div className="container max-w-7xl mx-auto bg-gray-100 pt-12">
			<div className="text-center mb-16">
				<h1 className="text-4xl font-bold mb-4">
					RSP <span className="text-[#0094da]">Notices</span>
				</h1>
				<div className="w-24 h-1 bg-[#0094da] mx-auto mb-6 rounded-full"></div>
				<p className="text-gray-600 max-w-2xl mx-auto text-lg">Stay updated with the latest announcements, events, and important notices for our RSP Norway community.</p>
			</div>

			{notices && notices.length > 0 ? (
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Latest Notice */}
					{latestNotice && (
						<div className="lg:col-span-2">
							<Card className="shadow-xl border-none bg-white overflow-hidden h-full">
								<div className="bg-gradient-to-r from-[#0094da] to-[#0094da] h-2" />

								<div className="relative h-64 md:h-80 bg-gradient-to-br from-[#0094da] to-[#0094da]">
									{latestNotice.noticeimage ? (
										<Image src={latestNotice.noticeimage} alt={latestNotice.noticetitle} fill className="object-cover" />
									) : (
										<div className="flex items-center justify-center h-full">
											<div className="text-center">
												<svg className="w-20 h-20 text-[#0094da] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
												</svg>
												<p className="text-[#0094da] font-medium">Latest Notice</p>
											</div>
										</div>
									)}
									<div className="absolute top-4 left-4">
										<span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">Latest</span>
									</div>
								</div>

								<CardContent className="p-8">
									<div className="flex items-center gap-2 mb-4">
										<svg className="w-5 h-5 text-[#0094da]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<p className="text-[#0094da] text-sm font-medium">{formatDate(latestNotice.noticedate)}</p>
									</div>

									<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">{latestNotice.noticetitle}</h2>

									<div className="prose prose-gray max-w-none">
										<p className="text-gray-700 text-lg leading-relaxed line-clamp-3">{latestNotice.notice}</p>
									</div>

									<div className="mt-8">
										<button onClick={() => handleReadMore(latestNotice)} className="bg-[#0094da] hover:bg-[#0094da] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-md hover:shadow-lg">
											Read More
										</button>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Other Notices */}
					<div className="lg:col-span-1">
						<div className="space-y-6">
							<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
								<svg className="w-6 h-6 text-[#0094da] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Other Notices
							</h3>

							<div className="space-y-4">
								{otherNotices.length > 0 ? (
									otherNotices.map((notice, index) => (
										<Card key={notice.id || index} className="shadow-md hover:shadow-lg border-none bg-white transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => handleReadMore(notice)}>
											<div className="bg-[#0094da] h-1" />
											<CardContent className="p-5">
												<div className="flex items-center gap-2 mb-3">
													<svg className="w-4 h-4 text-[#0094da] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													<p className="text-[#0094da] text-xs font-medium">{formatDate(notice.noticedate)}</p>
												</div>

												<h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 leading-tight">{notice.noticetitle}</h4>

												<p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{notice.notice}</p>

												<div className="mt-4 pt-3 border-t border-gray-100">
													<button
														className="text-[#0094da] text-sm font-medium hover:text-[#0094da] inline-flex items-center transition-colors duration-200"
														onClick={(e) => {
															e.stopPropagation();
															handleReadMore(notice);
														}}
													>
														Read more
														<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
														</svg>
													</button>
												</div>
											</CardContent>
										</Card>
									))
								) : (
									<div className="text-center py-8">
										<p className="text-gray-500">No other notices available</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center py-16">
					<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<h3 className="text-xl font-medium text-gray-500 mb-2">No Notices Available</h3>
					<p className="text-gray-400">Check back later for updates and announcements.</p>
				</div>
			)}
		</div>
	);
}

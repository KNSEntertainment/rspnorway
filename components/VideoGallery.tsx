"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ViewAllButton from "@/components/ViewAllButton";

interface Video {
	_id: string;
	url: string;
	thumbnail?: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	creator_en: string;
	creator_ne?: string;
	description_en?: string;
	description_ne?: string;
	description_no?: string;
	isYouTube?: boolean;
	title?: string;
	creator?: string;
}

export default function VideoGallery() {
	const tg = useTranslations("gallery");
	const locale = useLocale();
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

	// Fetch videos
	useEffect(() => {
		const fetchVideos = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				const res = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" });
				const data = await res.json();
				// Get latest 6 videos for better layout options
				setVideos((data.videos || []).slice(0, 6));
			} catch (error) {
				console.error("Failed to fetch videos:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, []);

	// Helper function to get localized title
	const getLocalizedTitle = (video: Video) => {
		const key = `title_${locale}` as keyof Video;
		return (video[key] as string) || video.title_en || video.title || "Untitled";
	};

	const getLocalizedCreator = (video: Video) => {
		if (locale === "ne") {
			return video.creator_ne || video.creator_en || video.creator || "PNSB-Norway";
		}
		return video.creator_en || video.creator || "PNSB-Norway";
	};

	const getYouTubeThumbnail = (url: string) => {
		const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
		return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
	};

	const getYouTubeEmbed = (url: string) => {
		const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
		return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
	};

	return (
		<section className="bg-gradient-to-br from-brand-50 to-gray-100">
			<div className="container mx-auto px-4 py-12 md:py-20">
				<div className="text-center mb-6 md:mb-8">
					<SectionHeader heading={tg("videoGalleryTitle")} />
				</div>

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="aspect-video bg-gray-200 rounded-xl animate-pulse"></div>
						))}
					</div>
				) : videos.length > 0 ? (
					<>
						{/* Adaptive Video Gallery Layout */}
						<div className="mb-12">
							{videos.length === 1 && (
								/* Single Video - Hero Showcase */
								<div className="max-w-5xl mx-auto">
									<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
										<div className="relative aspect-video">
											{videos[0].isYouTube ? activeVideoId === videos[0]._id ? <iframe src={getYouTubeEmbed(videos[0].url)} title={getLocalizedTitle(videos[0])} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={getYouTubeThumbnail(videos[0].url) || "/ghanti.jpeg"} alt={getLocalizedTitle(videos[0])} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" /> : activeVideoId === videos[0]._id ? <video src={videos[0].url} className="w-full h-full object-cover" controls autoPlay /> : <video src={videos[0].url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />}
											
											{activeVideoId !== videos[0]._id && (
												<>
													<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
													
											
													
													{/* Play Button */}
													<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(videos[0]._id)}>
														<div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl cursor-pointer">
															<Play className="w-10 h-10 text-brand ml-1" fill="currentColor" />
														</div>
													</div>
													
													{/* Video Info */}
													<div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
														<h3 className="text-3xl lg:text-4xl font-bold mb-3 hover:text-cyan-400 transition-colors duration-300">{getLocalizedTitle(videos[0])}</h3>
														<p className="text-lg text-white/90 mb-4">{getLocalizedCreator(videos[0])}</p>
														<button className="inline-flex items-center px-6 py-3 bg-brand hover:bg-cyan-600 rounded-lg font-semibold transition-all duration-300 group-hover:gap-2">
															Play Now
															<Play className="w-4 h-4 ml-2" />
														</button>
													</div>
												</>
											)}
											
											{activeVideoId === videos[0]._id && (
												<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200">
													✕
												</button>
											)}
										</div>
									</motion.div>
								</div>
							)}

							{videos.length === 2 && (
								/* Two Videos - Side by Side Showcase */
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
									{videos.map((video, index) => {
										const isActive = activeVideoId === video._id;
										return (
											<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
												<div className="relative aspect-video">
													{video.isYouTube ? isActive ? <iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : isActive ? <video src={video.url} className="w-full h-full object-cover" controls autoPlay /> : <video src={video.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
													
													{!isActive && (
														<>
															<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
													
															
															<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(video._id)}>
																<div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl cursor-pointer">
																	<Play className="w-8 h-8 text-brand ml-1" fill="currentColor" />
																</div>
															</div>
															
															<div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
																<h3 className="text-2xl lg:text-3xl font-bold mb-2 hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{getLocalizedTitle(video)}</h3>
																<p className="text-white/90">{getLocalizedCreator(video)}</p>
															</div>
														</>
													)}
													
													{isActive && (
														<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200">
															✕
														</button>
													)}
												</div>
											</motion.div>
										);
									})}
								</div>
							)}

							{videos.length === 3 && (
								/* Three Videos - Magazine Layout */
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
									{videos.map((video, index) => {
										const isActive = activeVideoId === video._id;
										return (
											<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
												<div className={`relative ${index === 0 ? 'aspect-video' : 'aspect-video'} overflow-hidden`}>
													{video.isYouTube ? isActive ? <iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : isActive ? <video src={video.url} className="w-full h-full object-cover" controls autoPlay /> : <video src={video.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
													
													{!isActive && (
														<>
															<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
															
															<div className="absolute top-4 left-4">
																<span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-brand font-semibold text-sm">
																	{index === 0 ? "Featured" : `Video ${index}`}
																</span>
															</div>
															
															<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(video._id)}>
																<div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl cursor-pointer">
																	<Play className="w-6 h-6 lg:w-8 lg:h-8 text-brand ml-1" fill="currentColor" />
																</div>
															</div>
															
															<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
																<h3 className={`font-bold mb-2 hover:text-cyan-400 transition-colors duration-300 line-clamp-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>{getLocalizedTitle(video)}</h3>
																<p className="text-white/90 text-sm">{getLocalizedCreator(video)}</p>
															</div>
														</>
													)}
													
													{isActive && (
														<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200">
															✕
														</button>
													)}
												</div>
											</motion.div>
										);
									})}
								</div>
							)}

							{videos.length === 4 && (
								/* Four Videos - 2x2 Grid */
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
									{videos.map((video, index) => {
										const isActive = activeVideoId === video._id;
										return (
											<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
												<div className="relative aspect-video">
													{video.isYouTube ? isActive ? <iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : isActive ? <video src={video.url} className="w-full h-full object-cover" controls autoPlay /> : <video src={video.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
													
													{!isActive && (
														<>
															<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
															
															<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(video._id)}>
																<div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl cursor-pointer">
																	<Play className="w-7 h-7 text-brand ml-1" fill="currentColor" />
																</div>
															</div>
															
															<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
																<h3 className="text-xl lg:text-2xl font-bold mb-2 hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{getLocalizedTitle(video)}</h3>
																<p className="text-white/90 text-sm">{getLocalizedCreator(video)}</p>
															</div>
														</>
													)}
													
													{isActive && (
														<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200">
															✕
														</button>
													)}
												</div>
											</motion.div>
										);
									})}
								</div>
							)}

							{videos.length >= 5 && (
								/* Five+ Videos - Grid Layout */
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{videos.map((video, index) => {
										const isActive = activeVideoId === video._id;
										return (
											<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
												<div className="relative aspect-video">
													{video.isYouTube ? isActive ? <iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : isActive ? <video src={video.url} className="w-full h-full object-cover" controls autoPlay /> : <video src={video.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
													
													{!isActive && (
														<>
															<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
															
															<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(video._id)}>
																<div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl cursor-pointer">
																	<Play className="w-6 h-6 text-brand ml-1" fill="currentColor" />
																</div>
															</div>
															
															<div className="absolute bottom-0 left-0 right-0 p-4 text-white">
																<h3 className="text-lg font-bold mb-1 hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{getLocalizedTitle(video)}</h3>
																<p className="text-white/90 text-xs">{getLocalizedCreator(video)}</p>
															</div>
														</>
													)}
													
													{isActive && (
														<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200">
															✕
														</button>
													)}
												</div>
											</motion.div>
										);
									})}
								</div>
							)}
						</div>

						{/* View All Button */}
						<div className="flex justify-center mt-8">
							<ViewAllButton href={`/${locale}/video-gallery`} label={tg("viewAllVideos")} />
						</div>
					</>
				) : (
					<div className="text-center py-12 text-gray-500">
						<p>{tg("noVideos")}</p>
					</div>
				)}
			</div>
		</section>
	);
}

"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

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
				// Get latest 2 videos
				setVideos((data.videos || []).slice(0, 2));
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
		<section className="container mx-auto px-4 md:py-12">
			<div className="text-center mb-8">
				<SectionHeader heading={tg("videoGalleryTitle")} />
			</div>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[...Array(2)].map((_, i) => (
						<div key={i} className="aspect-video bg-gray-200 rounded-xl animate-pulse"></div>
					))}
				</div>
			) : videos.length > 0 ? (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{videos.map((video, index) => {
							const isActive = activeVideoId === video._id;
							return (
								<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group w-full h-full relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => setActiveVideoId(isActive ? null : video._id)}>
									{/* Thumbnail */}
									<div className="relative w-full h-full">
										{video.isYouTube ? isActive ? <iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : isActive ? <video src={video.url} className="w-full h-full object-cover" controls autoPlay /> : <video src={video.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
										{/* Dark overlay */}
										{!isActive && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>}
										{/* Play button */}
										{!isActive && (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
													<Play className="w-8 h-8 md:w-10 md:h-10 text-brand ml-1" fill="currentColor" />
												</div>
											</div>
										)}
										{/* Video info overlay */}
										<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
											<h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{getLocalizedTitle(video)}</h3>
											<p className="text-white/90 text-sm">{getLocalizedCreator(video)}</p>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>

					{/* View All Button */}

					<div className="flex justify-center mt-8">
						<Link href={`/${locale}/video-gallery`} className="inline-flex items-center px-6 py-3 font-medium text-sm rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors duration-200 shadow-md hover:shadow-lg">
							{tg("viewAllVideos")}
							<svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
							</svg>
						</Link>
					</div>
				</>
			) : (
				<div className="text-center py-12 text-gray-500">
					<p>{tg("noVideos")}</p>
				</div>
			)}
		</section>
	);
}

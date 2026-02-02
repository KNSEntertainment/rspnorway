"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/SectionHeader";

interface Video {
	id: number;
	url: string;
	thumbnail: string;
	title: string;
	category: string;
	duration: string;
	creator: string;
}

const VideoGallery: React.FC = () => {
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [playingId, setPlayingId] = useState<number | null>(null);
	const [isMuted, setIsMuted] = useState<boolean>(true);
	const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
	const modalVideoRef = useRef<HTMLVideoElement | null>(null);
	const t = useTranslations("gallery");

	// Sample videos - replace with your database data
	const videos: Video[] = [
		{
			id: 1,
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
			thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
			title: "Cinematic Journey",
			category: "Documentary",
			duration: "2:45",
			creator: "Alex River",
		},
		{
			id: 2,
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
			thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d",
			title: "Urban Pulse",
			category: "Short Film",
			duration: "1:30",
			creator: "Maya Chen",
		},
		{
			id: 3,
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
			thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb",
			title: "Nature's Symphony",
			category: "Nature",
			duration: "3:15",
			creator: "Jordan Blake",
		},
		{
			id: 4,
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
			thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728",
			title: "Night Vibes",
			category: "Music Video",
			duration: "4:20",
			creator: "Sam Torres",
		},
		{
			id: 5,
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
			thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb",
			title: "Adventure Awaits",
			category: "Travel",
			duration: "2:10",
			creator: "Riley Park",
		},
		{
			id: 6,
			url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
			thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
			title: "Speed & Motion",
			category: "Action",
			duration: "1:55",
			creator: "Casey Morgan",
		},
	];

	const togglePlay = (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		const video = videoRefs.current[id];
		if (!video) return;

		if (playingId === id) {
			video.pause();
			setPlayingId(null);
		} else {
			// Pause any currently playing video
			if (playingId !== null && videoRefs.current[playingId]) {
				videoRefs.current[playingId]?.pause();
			}
			video.play();
			setPlayingId(id);
		}
	};

	const openModal = (video: Video) => {
		setSelectedVideo(video);
		setPlayingId(null);
		// Pause all grid videos
		Object.values(videoRefs.current).forEach((v) => v?.pause());
	};

	const closeModal = () => {
		setSelectedVideo(null);
		modalVideoRef.current?.pause();
	};

	useEffect(() => {
		if (selectedVideo && modalVideoRef.current) {
			modalVideoRef.current.play();
		}
	}, [selectedVideo]);

	return (
		<div
			style={{
				minHeight: "100vh",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Animated background grid */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
					backgroundSize: "100px 100px",
					opacity: 0.3,
					pointerEvents: "none",
				}}
			/>

			{/* Gradient orbs */}
			<div
				style={{
					position: "absolute",
					top: "10%",
					left: "10%",
					width: "500px",
					height: "500px",
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, transparent 70%)",
					filter: "blur(60px)",
					pointerEvents: "none",
					animation: "float 20s ease-in-out infinite",
				}}
			/>

			<div
				style={{
					position: "absolute",
					bottom: "20%",
					right: "15%",
					width: "400px",
					height: "400px",
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(255, 20, 147, 0.08) 0%, transparent 70%)",
					filter: "blur(60px)",
					pointerEvents: "none",
					animation: "float 25s ease-in-out infinite reverse",
				}}
			/>

			<div>
				{/* Header */}

				<header className="text-center mb-12">
					<SectionHeader heading={t("video_title")} />
					<p className="text-slate-600 mt-4 text-lg max-w-2xl mx-auto">{t("video_description")}</p>
				</header>

				{/* Video Grid */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
						gap: "32px",
					}}
				>
					{videos.map((video, index) => {
						const isPlaying = playingId === video.id;

						return (
							<div
								key={video.id}
								onClick={() => openModal(video)}
								style={{
									position: "relative",
									borderRadius: "20px",
									overflow: "hidden",
									cursor: "pointer",
									aspectRatio: "16/10",
									animation: `fadeInUp 0.6s ease-out ${index * 0.08}s backwards`,
									transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
									boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
									background: "#000",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "translateY(-12px)";
									e.currentTarget.style.boxShadow = "0 25px 70px rgba(138, 43, 226, 0.3)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.4)";
								}}
							>
								{/* Video Element */}
								<video
									ref={(el) => {
										videoRefs.current[video.id] = el;
									}}
									src={video.url}
									poster={video.thumbnail}
									loop
									muted={isMuted}
									playsInline
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = "scale(1.05)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = "scale(1)";
									}}
								/>

								{/* Gradient Overlays */}
								<div
									style={{
										position: "absolute",
										inset: 0,
										background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
										transition: "opacity 0.4s ease",
									}}
									className="video-overlay"
								/>

								{/* Duration Badge */}
								<div
									style={{
										position: "absolute",
										top: "20px",
										right: "20px",
										padding: "8px 16px",
										borderRadius: "8px",
										background: "rgba(0, 0, 0, 0.8)",
										backdropFilter: "blur(10px)",
										fontFamily: '"Space Mono", monospace',
										fontSize: "0.875rem",
										fontWeight: 700,
										color: "white",
										border: "1px solid rgba(255, 255, 255, 0.1)",
									}}
								>
									{video.duration}
								</div>

								{/* Play/Pause Button */}
								<button
									onClick={(e) => togglePlay(video.id, e)}
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%, -50%)",
										width: "80px",
										height: "80px",
										borderRadius: "50%",
										border: "3px solid white",
										background: isPlaying ? "rgba(0, 0, 0, 0.6)" : "rgba(138, 43, 226, 0.9)",
										backdropFilter: "blur(10px)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										opacity: isPlaying ? 0 : 1,
										transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
										zIndex: 2,
									}}
									className="play-btn"
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)";
										e.currentTarget.style.background = "rgba(138, 43, 226, 1)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
										e.currentTarget.style.background = isPlaying ? "rgba(0, 0, 0, 0.6)" : "rgba(138, 43, 226, 0.9)";
									}}
								>
									{isPlaying ? <Pause size={32} color="white" fill="white" /> : <Play size={32} color="white" fill="white" style={{ marginLeft: "4px" }} />}
								</button>

								{/* Video Info */}
								<div
									style={{
										position: "absolute",
										bottom: 0,
										left: 0,
										right: 0,
										padding: "28px",
										transform: "translateY(10px)",
										opacity: 0,
										transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
									}}
									className="video-info"
								>
									<div
										style={{
											fontSize: "0.75rem",
											color: "#8A2BE2",
											fontFamily: '"Space Mono", monospace',
											fontWeight: 700,
											textTransform: "uppercase",
											letterSpacing: "0.15em",
											marginBottom: "8px",
										}}
									>
										{video.category}
									</div>
									<h3
										style={{
											fontFamily: '"Bebas Neue", sans-serif',
											fontSize: "1.75rem",
											fontWeight: 700,
											color: "white",
											marginBottom: "6px",
											lineHeight: 1.1,
											letterSpacing: "0.05em",
										}}
									>
										{video.title}
									</h3>
									<p
										style={{
											fontFamily: '"Space Mono", monospace',
											fontSize: "0.8rem",
											color: "#999",
										}}
									>
										Created by {video.creator}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Fullscreen Modal */}
			{selectedVideo && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0, 0, 0, 0.98)",
						backdropFilter: "blur(20px)",
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "60px",
						animation: "fadeIn 0.3s ease-out",
					}}
					onClick={closeModal}
				>
					{/* Close Button */}
					<button
						onClick={closeModal}
						style={{
							position: "absolute",
							top: "32px",
							right: "32px",
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							border: "2px solid rgba(255, 255, 255, 0.2)",
							background: "rgba(0, 0, 0, 0.5)",
							backdropFilter: "blur(10px)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							transition: "all 0.3s ease",
							zIndex: 1001,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(138, 43, 226, 0.8)";
							e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
							e.currentTarget.style.borderColor = "rgba(138, 43, 226, 0.5)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
							e.currentTarget.style.transform = "rotate(0deg) scale(1)";
							e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
						}}
					>
						<X size={28} />
					</button>

					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							width: "100%",
							maxWidth: "1400px",
							animation: "scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
						}}
					>
						{/* Video Player */}
						<div
							style={{
								position: "relative",
								borderRadius: "16px",
								overflow: "hidden",
								boxShadow: "0 30px 100px rgba(138, 43, 226, 0.4)",
								marginBottom: "32px",
							}}
						>
							<video
								ref={modalVideoRef}
								src={selectedVideo.url}
								controls
								autoPlay
								muted={isMuted}
								style={{
									width: "100%",
									display: "block",
									background: "#000",
								}}
							/>
						</div>

						{/* Video Details */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: "40px",
							}}
						>
							<div>
								<div
									style={{
										fontSize: "0.875rem",
										color: "#8A2BE2",
										fontFamily: '"Space Mono", monospace',
										fontWeight: 700,
										textTransform: "uppercase",
										letterSpacing: "0.15em",
										marginBottom: "12px",
									}}
								>
									{selectedVideo.category}
								</div>

								<h2
									style={{
										fontFamily: '"Bebas Neue", sans-serif',
										fontSize: "3.5rem",
										fontWeight: 700,
										color: "white",
										marginBottom: "12px",
										lineHeight: 0.9,
										letterSpacing: "0.02em",
									}}
								>
									{selectedVideo.title}
								</h2>

								<p
									style={{
										fontFamily: '"Space Mono", monospace',
										fontSize: "1rem",
										color: "#999",
										marginBottom: "24px",
									}}
								>
									Created by {selectedVideo.creator}
								</p>
							</div>

							<div
								style={{
									display: "flex",
									gap: "12px",
									alignItems: "center",
								}}
							>
								<button
									onClick={() => setIsMuted(!isMuted)}
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "12px",
										border: "2px solid rgba(255, 255, 255, 0.2)",
										background: "rgba(255, 255, 255, 0.05)",
										color: "white",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
										transition: "all 0.3s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = "rgba(138, 43, 226, 0.3)";
										e.currentTarget.style.borderColor = "rgba(138, 43, 226, 0.5)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
										e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
									}}
								>
									{isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
								</button>

								<div
									style={{
										padding: "12px 20px",
										borderRadius: "12px",
										border: "2px solid rgba(255, 255, 255, 0.2)",
										background: "rgba(255, 255, 255, 0.05)",
										fontFamily: '"Space Mono", monospace',
										fontSize: "0.875rem",
										color: "white",
										fontWeight: 700,
									}}
								>
									{selectedVideo.duration}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        div:hover > .video-overlay {
          opacity: 0.7;
        }

        div:hover > .video-info {
          opacity: 1;
          transform: translateY(0);
        }

        div:hover > .play-btn {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        @media (max-width: 768px) {
          .play-btn {
            opacity: 1 !important;
          }
        }
      `}</style>
		</div>
	);
};

export default VideoGallery;

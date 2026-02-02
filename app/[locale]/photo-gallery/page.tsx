"use client";
import React, { useState, useEffect } from "react";
import { X, Heart, Share2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/SectionHeader";

interface GalleryItem {
	_id: string;
	media: string[];
	category: string;
	alt?: string;
}

interface Photo {
	id: string;
	url: string;
	title: string;
	category: string;
	photographer: string;
}

const PhotoGallery = () => {
	const t = useTranslations("gallery");
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPhotos = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				const res = await fetch(`${baseUrl}/api/gallery`, { cache: "no-store" });
				const data = await res.json();
				const galleryItems: GalleryItem[] = data.gallery || [];

				// Transform gallery items with media arrays into individual photos
				const transformedPhotos: Photo[] = galleryItems.flatMap((item, itemIndex) =>
					(item.media || []).map((url, mediaIndex) => ({
						id: `${item._id}-${mediaIndex}`,
						url: url,
						title: item.alt || `${item.category} Photo`,
						category: item.category,
						photographer: "RSP Norway",
					})),
				);

				setPhotos(transformedPhotos);
			} catch (error) {
				console.error("Failed to fetch photos:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPhotos();
	}, []);

	// Navigation functions
	const getCurrentPhotoIndex = () => {
		if (!selectedPhoto) return -1;
		return photos.findIndex((photo) => photo.id === selectedPhoto.id);
	};

	const navigateToPhoto = (direction: "prev" | "next") => {
		const currentIndex = getCurrentPhotoIndex();
		if (currentIndex === -1) return;

		let newIndex;
		if (direction === "prev") {
			newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
		} else {
			newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
		}
		setSelectedPhoto(photos[newIndex]);
	};

	// Keyboard navigation
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (!selectedPhoto) return;

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				navigateToPhoto("prev");
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				navigateToPhoto("next");
			} else if (e.key === "Escape") {
				setSelectedPhoto(null);
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [selectedPhoto, photos]);
	// const images = gallery.flatMap((item) => (item.media || []).map((src) => ({ src, alt: item.alt || "Gallery image" })));

	// Sample photos - replace with your database data
	// const photos = [
	// 	{ id: 1, url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba", title: "Golden Hour", category: "Nature", photographer: "Alex River" },
	// 	{ id: 2, url: "https://images.unsplash.com/photo-1682687221038-404cb8830901", title: "Urban Dreams", category: "Architecture", photographer: "Maya Chen" },
	// 	{ id: 3, url: "https://images.unsplash.com/photo-1682687221080-5cb261c645cb", title: "Serenity", category: "Landscape", photographer: "Jordan Blake" },
	// 	{ id: 4, url: "https://images.unsplash.com/photo-1682687982501-1e58ab814714", title: "City Lights", category: "Urban", photographer: "Sam Torres" },
	// 	{ id: 5, url: "https://images.unsplash.com/photo-1682687982167-d7fb3ed8541d", title: "Minimalist", category: "Abstract", photographer: "Riley Park" },

	// 	{ id: 8, url: "https://images.unsplash.com/photo-1682687218147-9806132dc697", title: "Mountain Peak", category: "Landscape", photographer: "Drew Knight" },
	// 	{ id: 9, url: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538", title: "Geometric", category: "Architecture", photographer: "Morgan Lee" },
	// ];

	return (
		<div>
			{loading ? (
				<div className="flex justify-center items-center min-h-screen">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
				</div>
			) : (
				<div>
					<header className="text-center mb-12">
						<SectionHeader heading={t("title")} />
						<p className="text-slate-600 mt-4 text-lg max-w-2xl mx-auto">{t("description")}</p>
					</header>

					{/* Masonry Grid */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "24px",
							gridAutoFlow: "dense",
						}}
					>
						{photos.map((photo: Photo, index: number) => {
							const isLarge = index % 5 === 0;
							const isTall = index % 7 === 0;

							return (
								<div
									key={photo.id}
									onClick={() => setSelectedPhoto(photo)}
									style={{
										gridColumn: isLarge ? "span 2" : "span 1",
										gridRow: isTall ? "span 2" : "span 1",
										position: "relative",
										borderRadius: "16px",
										overflow: "hidden",
										cursor: "pointer",
										aspectRatio: isLarge ? "16/9" : isTall ? "9/16" : "4/3",
										animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`,
										transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
										boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
										e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.5)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = "translateY(0) scale(1)";
										e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
									}}
								>
									{/* Image */}
									<img
										src={`${photo.url}?w=800&q=80`}
										alt={photo.title}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
											transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "scale(1.1)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "scale(1)";
										}}
									/>

									{/* Gradient Overlay */}
									<div
										style={{
											position: "absolute",
											inset: 0,
											background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)",
											opacity: 0,
											transition: "opacity 0.4s ease",
										}}
										className="overlay"
									/>

									{/* Info */}
									<div
										style={{
											position: "absolute",
											bottom: 0,
											left: 0,
											right: 0,
											padding: "24px",
											transform: "translateY(20px)",
											opacity: 0,
											transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
										}}
										className="info"
									>
										<div
											style={{
												fontSize: "0.75rem",
												color: "#4ECDC4",
												fontFamily: '"DM Sans", sans-serif',
												fontWeight: 600,
												textTransform: "uppercase",
												letterSpacing: "0.1em",
												marginBottom: "8px",
											}}
										>
											{photo.category}
										</div>
										<h3
											style={{
												fontFamily: '"Playfair Display", serif',
												fontSize: "1.5rem",
												fontWeight: 700,
												color: "white",
												marginBottom: "8px",
												lineHeight: 1.2,
											}}
										>
											{photo.title}
										</h3>
										<p
											style={{
												fontFamily: '"DM Sans", sans-serif',
												fontSize: "0.875rem",
												color: "#aaa",
												fontStyle: "italic",
											}}
										>
											by {photo.photographer}
										</p>
									</div>

									{/* Like Button */}
									<button
										style={{
											position: "absolute",
											top: "16px",
											right: "16px",
											width: "44px",
											height: "44px",
											borderRadius: "50%",
											border: "none",
											background: "rgba(255, 107, 107, 0.95)",
											backdropFilter: "blur(10px)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											cursor: "pointer",
											opacity: 0,
											transform: "scale(0.8)",
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
											zIndex: 2,
										}}
										className="like-btn"
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "scale(1.1)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "scale(1)";
										}}
									>
										<Heart
											size={20}
											fill="none"
											color="white"
											style={{
												transition: "all 0.2s ease",
											}}
										/>
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Lightbox Modal */}
			{selectedPhoto && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0, 0, 0, 0.96)",
						backdropFilter: "blur(20px)",
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "40px",
						animation: "fadeIn 0.3s ease-out",
					}}
					onClick={() => setSelectedPhoto(null)}
				>
					<button
						onClick={() => setSelectedPhoto(null)}
						style={{
							position: "absolute",
							top: "24px",
							right: "24px",
							width: "48px",
							height: "48px",
							borderRadius: "50%",
							border: "none",
							background: "rgba(255, 255, 255, 0.1)",
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
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
							e.currentTarget.style.transform = "rotate(90deg)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
							e.currentTarget.style.transform = "rotate(0deg)";
						}}
					>
						<X size={24} />
					</button>

					{/* Left Arrow */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToPhoto("prev");
						}}
						style={{
							position: "absolute",
							left: "24px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							border: "none",
							background: "rgba(255, 255, 255, 0.1)",
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
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1)";
						}}
					>
						<ChevronLeft size={28} />
					</button>

					{/* Right Arrow */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToPhoto("next");
						}}
						style={{
							position: "absolute",
							right: "24px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							border: "none",
							background: "rgba(255, 255, 255, 0.1)",
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
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1)";
						}}
					>
						<ChevronRight size={28} />
					</button>

					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							maxWidth: "1200px",
							maxHeight: "90vh",
							display: "flex",
							gap: "48px",
							alignItems: "center",
							animation: "scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
						}}
					>
						<img
							src={`${selectedPhoto.url}?w=1200&q=90`}
							alt={selectedPhoto.title}
							style={{
								maxWidth: "70%",
								maxHeight: "90vh",
								objectFit: "contain",
								borderRadius: "12px",
								boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
							}}
						/>

						<div
							style={{
								flex: 1,
								color: "white",
							}}
						>
							<div
								style={{
									fontSize: "0.875rem",
									color: "#4ECDC4",
									fontFamily: '"DM Sans", sans-serif',
									fontWeight: 600,
									textTransform: "uppercase",
									letterSpacing: "0.1em",
									marginBottom: "16px",
								}}
							>
								{selectedPhoto.category}
							</div>

							<h2
								style={{
									fontFamily: '"Playfair Display", serif',
									fontSize: "3rem",
									fontWeight: 700,
									marginBottom: "16px",
									lineHeight: 1.1,
								}}
							>
								{selectedPhoto.title}
							</h2>

							<p
								style={{
									fontFamily: '"DM Sans", sans-serif',
									fontSize: "1.125rem",
									color: "#aaa",
									fontStyle: "italic",
									marginBottom: "40px",
								}}
							>
								Photography by {selectedPhoto.photographer}
							</p>

							<div
								style={{
									display: "flex",
									gap: "12px",
								}}
							>
								<button
									style={{
										padding: "14px 24px",
										borderRadius: "12px",
										border: "2px solid rgba(255, 255, 255, 0.2)",
										background: "rgba(255, 255, 255, 0.05)",
										color: "white",
										fontFamily: '"DM Sans", sans-serif',
										fontSize: "0.875rem",
										fontWeight: 600,
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "8px",
										transition: "all 0.3s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
										e.currentTarget.style.transform = "translateY(-2px)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
										e.currentTarget.style.transform = "translateY(0)";
									}}
								>
									<Share2 size={18} /> Share
								</button>

								<button
									style={{
										padding: "14px 24px",
										borderRadius: "12px",
										border: "2px solid rgba(255, 255, 255, 0.2)",
										background: "rgba(255, 255, 255, 0.05)",
										color: "white",
										fontFamily: '"DM Sans", sans-serif',
										fontSize: "0.875rem",
										fontWeight: 600,
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "8px",
										transition: "all 0.3s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
										e.currentTarget.style.transform = "translateY(-2px)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
										e.currentTarget.style.transform = "translateY(0)";
									}}
								>
									<Download size={18} /> Download
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

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
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        div:hover > .overlay {
          opacity: 1;
        }

        div:hover > .info {
          opacity: 1;
          transform: translateY(0);
        }

        div:hover > .like-btn {
          opacity: 1;
          transform: scale(1);
        }

        @media (max-width: 768px) {
          div[style*="gridColumn"] {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
		</div>
	);
};

export default PhotoGallery;

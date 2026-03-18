"use client";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom, Fullscreen, Thumbnails } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useState, useRef, useEffect } from "react";
import { Folder, Images, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GalleryClient({ images }) {
	const t = useTranslations("gallery");
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	const [selectedAlbum, setSelectedAlbum] = useState(null);
	const scrollContainerRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	// Group images by alt text (album name)
	const albums = images.reduce((acc, img, idx) => {
		const albumName = img.alt || "Untitled Album";
		if (!acc[albumName]) {
			acc[albumName] = {
				name: albumName,
				photos: [],
				thumbnail: img.src,
			};
		}
		acc[albumName].photos.push({ ...img, originalIndex: idx });
		return acc;
	}, {});

	const albumsArray = Object.values(albums);
	const isSingleAlbum = albumsArray.length === 1;

	const checkScrollPosition = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
		}
	};

	useEffect(() => {
		checkScrollPosition();
		const handleScroll = () => checkScrollPosition();
		const container = scrollContainerRef.current;

		if (container) {
			container.addEventListener("scroll", handleScroll);
			window.addEventListener("resize", checkScrollPosition);
		}

		return () => {
			if (container) {
				container.removeEventListener("scroll", handleScroll);
			}
			window.removeEventListener("resize", checkScrollPosition);
		};
	}, [albumsArray]);

	const scroll = (direction) => {
		if (scrollContainerRef.current) {
			const scrollAmount = 400;
			const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
			scrollContainerRef.current.scrollTo({
				left: newScrollLeft,
				behavior: "smooth",
			});
		}
	};

	const handleAlbumClick = (album) => {
		setSelectedAlbum(album);
		setIndex(album.photos[0].originalIndex);
		setOpen(true);
	};

	// Get all images for lightbox
	const lightboxImages = selectedAlbum ? selectedAlbum.photos : images;

	return (
		<div className="w-full relative">
			{/* Navigation Arrows - Positioned absolutely at top right */}
			<div className="hidden absolute -top-16 right-0 md:flex gap-2 z-10">
				<button onClick={() => scroll("left")} disabled={!canScrollLeft} className={`p-2 rounded-full shadow-md transition-all duration-200 ${canScrollLeft ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-light text-gray-900 cursor-not-allowed"}`} aria-label="Scroll left">
					<ChevronLeft className="w-5 h-5" />
				</button>
				<button onClick={() => scroll("right")} disabled={!canScrollRight} className={`p-2 rounded-full shadow-md transition-all duration-200 ${canScrollRight ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-light text-gray-900 cursor-not-allowed"}`} aria-label="Scroll right">
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>

			{/* Horizontal Scroll Layout */}
			<div ref={scrollContainerRef} className={`flex overflow-x-auto gap-6 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar mt-12 ${isSingleAlbum ? "justify-center" : ""}`}>
				{albumsArray.map((album, i) => (
					<div key={i} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border border-gray-200 hover:border-brand flex-shrink-0 w-[85vw] sm:w-80 snap-start" onClick={() => handleAlbumClick(album)}>
						{/* Folder Icon Background */}
						<div className="absolute top-4 right-4 z-10">
							<div className="bg-white backdrop-blur-sm p-1.5 rounded-lg">
								<Folder className="w-5 h-5 text-brand" />
							</div>
						</div>

						{/* Thumbnail Image */}
						<div className="relative h-64 w-full overflow-hidden bg-gray-100">
							<Image src={album.thumbnail} alt={album.name} width={320} height={256} className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-110" />
							{/* Overlay on hover */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</div>

						{/* Album Info */}
						<div className="p-6">
							<h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-brand transition-colors">{album.name}</h3>
							<div className="flex items-center gap-2 text-gray-600">
								<Images className="w-4 h-4" />
								<span className="text-sm font-medium">
									{album.photos.length} {album.photos.length === 1 ? t("photo") : t("photos")}
								</span>
							</div>
						</div>

						{/* Bottom accent line */}
						<div className="h-1 bg-gradient-to-r from-brand to-success transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
					</div>
				))}
			</div>

			{/* Enhanced Lightbox */}
			<Lightbox
				open={open}
				close={() => {
					setOpen(false);
					setSelectedAlbum(null);
				}}
				slides={lightboxImages}
				index={selectedAlbum ? 0 : index}
				plugins={[Zoom, Fullscreen, Thumbnails]}
				animation={{ fade: 400, swipe: 250 }}
				styles={{
					container: { backgroundColor: "rgba(15, 23, 42, 0.95)" },
					thumbnailsContainer: { backgroundColor: "#0f172a" },
				}}
			/>

			<style jsx>{`
				.hide-scrollbar::-webkit-scrollbar {
					display: none;
				}
				.hide-scrollbar {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
			`}</style>
		</div>
	);
}

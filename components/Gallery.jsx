"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Fullscreen, ArrowLeft, ArrowRight } from "lucide-react";
import useFetchData from "@/hooks/useFetchData";

export default function Gallery() {
	const [activeFilter, setActiveFilter] = useState("All");
	const [zoomedIndex, setZoomedIndex] = useState(null); // index in allImages
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;
	const galleryRef = useRef(null);
	const { data: gallery, error, loading } = useFetchData("/api/gallery", "gallery");

	// Always define these before any useEffect or usage
	const filteredItems = activeFilter === "All" ? gallery : gallery.filter((item) => item.category === activeFilter);
	const allImages = filteredItems.flatMap((item) => item.media.map((image) => ({ image, item })));
	const totalPages = Math.ceil(allImages.length / itemsPerPage);
	const paginatedItems = allImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	// Keyboard navigation for zoomed modal
	useEffect(() => {
		if (zoomedIndex === null) return;
		const handleKeyDown = (event) => {
			if (event.key === "ArrowLeft") {
				setZoomedIndex((prev) => (prev > 0 ? prev - 1 : prev));
			} else if (event.key === "ArrowRight") {
				setZoomedIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : prev));
			} else if (event.key === "Escape") {
				setZoomedIndex(null);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [zoomedIndex, allImages.length]);

	// Click outside to close zoomed modal
	useEffect(() => {
		if (zoomedIndex === null) return;
		const handleClickOutside = (event) => {
			if (!event.target.closest(".zoomed-image")) {
				setZoomedIndex(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [zoomedIndex]);

	// (Removed duplicate declarations)

	// const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

	// const paginatedItems = filteredItems.flatMap((item) => item.media).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const handleFilterChange = (filter) => {
		setActiveFilter(filter);
		setCurrentPage(1); // Reset to first page on filter change
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	const handlePrevPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	if (loading) return <p>Loading Gallery...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<section id="gallery" className="py-6 md:py-16 bg-gray-100">
			<div className="container mx-auto px-2 sm:px-4">
				<>
					<h2 className="text-3xl font-bold text-center mb-6 sm:mb-12">
						Project <span className="text-[#0094da]">Gallery</span>
					</h2>
					<div className="w-24 h-1 bg-[#0094da] mx-auto my-6 rounded-full"></div>
				</>

				{/* Filter Buttons */}
				<div className="flex flex-wrap justify-center gap-4 mb-6">
					{["All", ...new Set(gallery.map((item) => item.category))].map((filter) => (
						<button key={filter} onClick={() => handleFilterChange(filter)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${activeFilter === filter ? "bg-[#0094da] text-slate-200" : "bg-white text-slate-800 hover:bg-[#0094da]"}`}>
							{filter}
						</button>
					))}
				</div>

				{/* Gallery Grid with Pagination */}
				<div ref={galleryRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
					{paginatedItems.map(({ image, item }, index) => {
						// Find the index in allImages for zoom navigation
						const globalIndex = (currentPage - 1) * itemsPerPage + index;
						return (
							<div key={`${item._id}-${index}`} className="relative overflow-hidden rounded-lg shadow-lg p-2 bg-white">
								<div className="group cursor-zoom-in" onClick={() => setZoomedIndex(globalIndex)}>
									<Image src={image} alt={item.alt || `Gallery image ${index + 1}`} width={400} height={400} className="w-full h-auto aspect-[4/3] object-cover rounded-lg" />
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
										<Fullscreen className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Pagination Controls */}
				{totalPages > 0 && (
					<div className="flex justify-center items-center gap-4 mt-6">
						<button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50">
							Previous
						</button>
						<span>
							Page {currentPage} of {totalPages}
						</span>
						<button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50">
							Next
						</button>
					</div>
				)}

				{/* Zoomed Image Modal with navigation */}
				{zoomedIndex !== null && allImages[zoomedIndex] && (
					<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
						<div className="relative zoomed-image max-w-6xl flex items-center">
							{/* Left Arrow */}
							<button onClick={() => setZoomedIndex((prev) => (prev > 0 ? prev - 1 : prev))} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-40 hover:bg-opacity-70 rounded-full text-white z-10" style={{ left: "-2.5rem" }} aria-label="Previous image" disabled={zoomedIndex === 0}>
								<ArrowLeft size={36} />
							</button>
							{/* Image */}
							<Image src={allImages[zoomedIndex].image || "/placeholder.jpg"} alt={allImages[zoomedIndex].item.alt || "alt"} width={700} height={700} className="w-full h-full object-contain" />
							{/* Right Arrow */}
							<button onClick={() => setZoomedIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : prev))} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-40 hover:bg-opacity-70 rounded-full text-white z-10" style={{ right: "-2.5rem" }} aria-label="Next image" disabled={zoomedIndex === allImages.length - 1}>
								<ArrowRight size={36} />
							</button>
							{/* Close Button */}
							<button onClick={() => setZoomedIndex(null)} className="absolute top-4 right-4 text-slate-200 text-2xl">
								&times;
							</button>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

// "use client";
// import Image from "next/image";
// import Lightbox from "yet-another-react-lightbox";
// import "yet-another-react-lightbox/styles.css";
// import { Zoom } from "yet-another-react-lightbox/plugins";
// import { useState } from "react";
// import { useTranslations } from "next-intl";

// export default function GalleryClient({ images }) {
// 	const [open, setOpen] = useState(false);
// 	const [index, setIndex] = useState(0);
// 	const t = useTranslations("gallery");

// 	return (
// 		<>
// 			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
// 				{images.map((img, i) => (
// 					<div
// 						key={i}
// 						className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer group transition-all duration-300 hover:scale-105 aspect-[4/3]"
// 						onClick={() => {
// 							setIndex(i);
// 							setOpen(true);
// 						}}
// 					>
// 						<Image src={img.src} alt={img.alt} width={200} height={200} className="w-full h-full object-cover object-center group-hover:brightness-75 transition-all duration-300" loading="lazy" />
// 						<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
// 							<span className="text-white text-lg font-semibold">{t("zoom_in")}</span>
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 			<Lightbox open={open} close={() => setOpen(false)} slides={images} index={index} plugins={[Zoom]} animation={{ fade: 300 }} />
// 		</>
// 	);
// }

"use client";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom, Fullscreen, Thumbnails } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Maximize2 } from "lucide-react";

export default function GalleryClient({ images }) {
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	const t = useTranslations("gallery");

	return (
		<div className="w-full">
			{/* Modern Bento Grid Layout */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
				{images.map((img, i) => {
					// Logic to make every 3rd or 6th image larger for a "Bento" look
					const isLarge = i === 0 || i === 6;
					const isWide = i === 3;

					return (
						<div
							key={i}
							className={`relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-500 
                                ${isLarge ? "md:row-span-2 md:col-span-2" : ""} 
                                ${isWide ? "md:col-span-2" : ""}
                                border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-400
                            `}
							onClick={() => {
								setIndex(i);
								setOpen(true);
							}}
						>
							{/* Blue Tint Overlay on Hover */}
							<div className="absolute inset-0 z-10 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
								<div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
									<Maximize2 className="text-white w-6 h-6" />
								</div>
							</div>

							<Image src={img.src} alt={img.alt || "Gallery Image"} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />

							{/* Subtle caption overlay for political context */}
							<div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
								<p className="text-white text-xs font-medium truncate">{img.alt}</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Enhanced Lightbox */}
			<Lightbox
				open={open}
				close={() => setOpen(false)}
				slides={images}
				index={index}
				plugins={[Zoom, Fullscreen, Thumbnails]}
				animation={{ fade: 400, swipe: 250 }}
				// Custom styles for the lightbox to match the blue theme
				styles={{
					container: { backgroundColor: "rgba(15, 23, 42, 0.95)" }, // Navy-900 background
					thumbnailsContainer: { backgroundColor: "#0f172a" },
				}}
			/>
		</div>
	);
}

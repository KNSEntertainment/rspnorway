// "use client";
// import Image from "next/image";
// import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState, useRef, useEffect } from "react";

// interface Blog {
// 	_id: string;
// 	blogTitle_en: string;
// 	blogTitle_ne?: string;
// 	blogTitle_no?: string;
// 	blogDate: string;
// 	blogMainPicture?: string;
// 	// Legacy field
// 	blogTitle?: string;
// }

// interface Translations {
// 	blogs_title: string;
// 	loading: string;
// 	view_all: string;
// }

// interface Props {
// 	blogs: Blog[];
// 	translations: Translations;
// 	locale: string;
// }

// export default function BlogsClient({ blogs, translations: t, locale }: Props) {
// 	const pathname = usePathname();
// 	const router = useRouter();
// 	const [navLoading, setNavLoading] = useState(false);
// 	const scrollContainerRef = useRef<HTMLDivElement>(null);
// 	const [canScrollLeft, setCanScrollLeft] = useState(false);
// 	const [canScrollRight, setCanScrollRight] = useState(false);

// 	// Helper function to get localized blog title
// 	const getLocalizedTitle = (blog: Blog): string => {
// 		const key = `blogTitle_${locale}` as keyof Blog;
// 		const localizedTitle = blog[key];
// 		return (typeof localizedTitle === "string" && localizedTitle) || blog.blogTitle_en || blog.blogTitle || "Untitled";
// 	};

// 	const checkScrollPosition = () => {
// 		if (scrollContainerRef.current) {
// 			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
// 			setCanScrollLeft(scrollLeft > 0);
// 			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
// 		}
// 	};

// 	useEffect(() => {
// 		checkScrollPosition();
// 		const handleScroll = () => checkScrollPosition();
// 		const container = scrollContainerRef.current;

// 		if (container) {
// 			container.addEventListener("scroll", handleScroll);
// 			// Check on resize as well
// 			window.addEventListener("resize", checkScrollPosition);
// 		}

// 		return () => {
// 			if (container) {
// 				container.removeEventListener("scroll", handleScroll);
// 			}
// 			window.removeEventListener("resize", checkScrollPosition);
// 		};
// 	}, [blogs]);

// 	const scroll = (direction: "left" | "right") => {
// 		if (scrollContainerRef.current) {
// 			const scrollAmount = 400;
// 			const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
// 			scrollContainerRef.current.scrollTo({
// 				left: newScrollLeft,
// 				behavior: "smooth",
// 			});
// 		}
// 	};

// 	return (
// 		<section id="blog" className="bg-gradient-to-br from-brand-100 to-gray-100">
// 			<div className="container mx-auto px-4 py-12">
// 				<div className="relative">
// 					<h2 className="text-3xl font-bold text-center mb-6">{t.blogs_title}</h2>
// 					{/* Navigation Arrows - Positioned absolutely at top right */}
// 					<div className="hidden absolute top-6 right-0 md:flex gap-2">
// 						<button onClick={() => scroll("left")} disabled={!canScrollLeft} className={`p-2 rounded-full shadow-md transition-all duration-200 ${canScrollLeft ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-light text-gray-900 cursor-not-allowed"}`} aria-label="Scroll left">
// 							<ChevronLeft className="w-5 h-5" />
// 						</button>
// 						<button onClick={() => scroll("right")} disabled={!canScrollRight} className={`p-2 rounded-full shadow-md transition-all duration-200 ${canScrollRight ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-light text-gray-900 cursor-not-allowed"}`} aria-label="Scroll right">
// 							<ChevronRight className="w-5 h-5" />
// 						</button>
// 					</div>
// 				</div>
// 				<div className="w-24 h-1 bg-brand mx-auto mb-4 md:mb-8 rounded-full"></div>

// 				{/* Loading overlay for navigation */}
// 				{navLoading && (
// 					<div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
// 						<div className="flex flex-col items-center">
// 							<svg className="animate-spin h-10 w-10 text-brand mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// 								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// 								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
// 							</svg>
// 							<span className="text-brand font-semibold">{t.loading}</span>
// 						</div>
// 					</div>
// 				)}

// 				<div ref={scrollContainerRef} className="flex overflow-x-auto gap-8 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
// 					{blogs &&
// 						blogs.map((blog) => (
// 							<div key={blog._id} className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] flex-shrink-0 w-80 snap-start">
// 								{/* Responsive flex: row on small, col on md+ */}
// 								<div className="flex flex-col h-full bg-white">
// 									{/* Image: small and left on mobile, top on md+ */}
// 									<div className="relative flex-shrink-0 w-full h-64 overflow-hidden">
// 										<Image src={blog?.blogMainPicture || "/ghanti.png"} alt={getLocalizedTitle(blog)} width={300} height={300} className="object-top object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
// 									</div>
// 									{/* Text: right on mobile, below on md+ */}
// 									<div className="flex flex-col justify-center p-6 space-y-2 w-full">
// 										<div className="flex items-center text-gray-900">
// 											<Calendar className="w-4 h-4 mr-2" />
// 											<span className="text-sm font-medium">{blog?.blogDate}</span>
// 										</div>
// 										<h1 className="text-lg md:text-xl font-bold mb-2 cursor-pointer group-hover:text-brand line-clamp-2">
// 											<button
// 												className="bg-transparent p-0 m-0 border-none text-left w-full hover:text-brand focus:outline-none"
// 												onClick={() => {
// 													setNavLoading(true);
// 													router.push(`/${locale}/blogs/${blog?._id}`);
// 												}}
// 												disabled={navLoading}
// 											>
// 												{getLocalizedTitle(blog)}
// 											</button>
// 										</h1>
// 									</div>
// 								</div>
// 							</div>
// 						))}
// 				</div>
// 				{pathname !== "/en/blogs" && (
// 					<div className="flex justify-center mt-6">
// 						<Link href="/en/blogs" className="inline-flex items-center px-5 py-2.5 font-medium text-sm rounded-lg bg-brand/90 text-white hover:bg-brand transition-colors duration-200">
// 							{t.view_all}
// 							<svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
// 								<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
// 							</svg>
// 						</Link>
// 					</div>
// 				)}
// 			</div>
// 			<style jsx>{`
// 				.hide-scrollbar::-webkit-scrollbar {
// 					display: none;
// 				}
// 				.hide-scrollbar {
// 					-ms-overflow-style: none;
// 					scrollbar-width: none;
// 				}
// 			`}</style>
// 		</section>
// 	);
// }

"use client";
import Image from "next/image";
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface Blog {
	_id: string;
	blogTitle_en: string;
	blogTitle_ne?: string;
	blogTitle_no?: string;
	blogDate: string;
	blogMainPicture?: string;
	// Legacy field
	blogTitle?: string;
}

interface Translations {
	blogs_title: string;
	loading: string;
	view_all: string;
}

interface Props {
	blogs: Blog[];
	translations: Translations;
	locale: string;
}

export default function BlogsClient({ blogs, translations: t, locale }: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const [navLoading, setNavLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const blogsPerPage = 4;

	// Helper function to get localized blog title
	const getLocalizedTitle = (blog: Blog): string => {
		const key = `blogTitle_${locale}` as keyof Blog;
		const localizedTitle = blog[key];
		return (typeof localizedTitle === "string" && localizedTitle) || blog.blogTitle_en || blog.blogTitle || "Untitled";
	};

	const totalPages = Math.ceil(blogs.length / blogsPerPage);
	const currentBlogs = blogs.slice(currentPage * blogsPerPage, (currentPage + 1) * blogsPerPage);

	const handleNavigation = (blogId: string) => {
		setNavLoading(true);
		router.push(`/${locale}/blogs/${blogId}`);
	};

	const nextPage = () => {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	const prevPage = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	return (
		<section id="blog" className="bg-gradient-to-br from-brand-100 to-gray-100">
			<div className="container mx-auto px-4 md:py-12">
				<div className="relative mb-8">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-2">{t.blogs_title}</h2>
					<div className="w-24 h-1 bg-brand mx-auto rounded-full"></div>

					{/* Navigation Arrows */}
					{totalPages > 1 && (
						<div className="absolute top-0 right-0 flex gap-2">
							<button onClick={prevPage} disabled={currentPage === 0} className={`p-2 rounded-full shadow-md transition-all duration-200 ${currentPage > 0 ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`} aria-label="Previous blogs">
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button onClick={nextPage} disabled={currentPage >= totalPages - 1} className={`p-2 rounded-full shadow-md transition-all duration-200 ${currentPage < totalPages - 1 ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`} aria-label="Next blogs">
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>
					)}
				</div>

				{/* Loading overlay */}
				{navLoading && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
						<div className="flex flex-col items-center">
							<svg className="animate-spin h-10 w-10 text-brand mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							<span className="text-brand font-semibold">{t.loading}</span>
						</div>
					</div>
				)}

				{/* Newspaper Grid Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{currentBlogs.map((blog, index) => {
						if (index === 0) {
							// Featured blog - large, spans full height on desktop
							return (
								<div key={blog._id} className="lg:row-span-3 group bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer" onClick={() => handleNavigation(blog._id)}>
									<div className="relative h-96 lg:h-full overflow-hidden">
										<Image src={blog?.blogMainPicture || "/ghanti.png"} alt={getLocalizedTitle(blog)} fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
										<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
										<div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
											<div className="flex items-center mb-3">
												<Calendar className="w-4 h-4 mr-2" />
												<span className="text-sm font-medium">{blog?.blogDate}</span>
											</div>
											<h3 className="text-2xl lg:text-3xl font-bold mb-4 line-clamp-2">{getLocalizedTitle(blog)}</h3>
											<button
												className="inline-flex items-center text-white font-semibold bg-brand/80 hover:bg-brand px-6 py-2.5 rounded-lg group-hover:gap-2 transition-all duration-300"
												onClick={(e) => {
													e.stopPropagation();
													handleNavigation(blog._id);
												}}
											>
												Read More
												<ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" />
											</button>
										</div>
									</div>
								</div>
							);
						} else {
							// Secondary blogs - compact horizontal cards
							return (
								<div key={blog._id} className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer" onClick={() => handleNavigation(blog._id)}>
									<div className="flex h-full">
										<div className="relative w-1/5 overflow-hidden flex-shrink-0">
											<Image src={blog?.blogMainPicture || "/ghanti.png"} alt={getLocalizedTitle(blog)} width={300} height={300} className="object-cover object-top w-full h-32" />
										</div>
										<div className="flex flex-col justify-between p-4 lg:p-5 w-3/5">
											<div>
												<div className="flex items-center text-gray-600 mb-2">
													<Calendar className="w-3.5 h-3.5 mr-1.5" />
													<span className="text-xs font-medium">{blog?.blogDate}</span>
												</div>
												<h3 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-brand transition-colors duration-300">{getLocalizedTitle(blog)}</h3>
											</div>
											<button
												className="inline-flex items-center text-sm text-brand font-semibold mt-3 group-hover:gap-1 transition-all duration-300"
												onClick={(e) => {
													e.stopPropagation();
													handleNavigation(blog._id);
												}}
											>
												Read
												<ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:ml-1.5 transition-all duration-300" />
											</button>
										</div>
									</div>
								</div>
							);
						}
					})}
				</div>

				{/* Page Indicators */}
				{totalPages > 1 && (
					<div className="flex justify-center gap-2 mb-6">
						{Array.from({ length: totalPages }).map((_, index) => (
							<button key={index} onClick={() => setCurrentPage(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentPage ? "w-8 bg-brand" : "w-2 bg-gray-300 hover:bg-gray-400"}`} aria-label={`Go to page ${index + 1}`} />
						))}
					</div>
				)}

				{/* View All Button */}
				{pathname !== `/${locale}/blogs` && (
					<div className="flex justify-center">
						<Link href={`/${locale}/blogs`} className="inline-flex items-center px-6 py-3 font-semibold text-sm rounded-lg bg-brand text-white hover:bg-brand/90 transition-all duration-200 shadow-md hover:shadow-lg">
							{t.view_all}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

"use client";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import ViewAllButton from "@/components/ViewAllButton";
import SectionHeader from "@/components/SectionHeader";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

interface Blog {
	_id: string;
	blogTitle_en: string;
	blogTitle_ne?: string;
	blogTitle_no?: string;
	blogDate: string;
	blogMainPicture?: string;
	blogAuthor?: string;
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
	const blogsPerPage = 6;

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
		<section className="py-20 bg-white">
			<div className="container mx-auto px-6">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<SectionHeader heading={t.blogs_title} />
					<p className="text-gray-600 mt-4 max-w-2xl mx-auto">
						Stay updated with the latest news, events, and stories from the Nepali community in Norway.
					</p>
				</motion.div>

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

				{/* Featured News Grid */}
				<div className="mb-12">
					{currentBlogs.length === 1 && (
						/* Single Blog - Hero */
						<div className="max-w-4xl mx-auto">
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6 }}
								className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
								onClick={() => handleNavigation(currentBlogs[0]._id)}
							>
								<div className="relative h-96 overflow-hidden">
									<Image src={currentBlogs[0]?.blogMainPicture || "/ghanti.png"} alt={getLocalizedTitle(currentBlogs[0])} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
									<div className="absolute bottom-0 left-0 right-0 p-8 text-white">
										<div className="flex items-center gap-4 mb-4">
											<span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium">Featured</span>
											<div className="flex items-center text-white/80">
												<Calendar className="w-4 h-4 mr-2" />
												<span className="text-sm">{currentBlogs[0]?.blogDate}</span>
											</div>
										</div>
										<h3 className="text-3xl font-bold mb-4">{getLocalizedTitle(currentBlogs[0])}</h3>
										<button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300">
											Read More
											<ArrowRight className="w-4 h-4 ml-2" />
										</button>
									</div>
								</div>
							</motion.div>
						</div>
					)}

					{currentBlogs.length >= 2 && (
						/* Multiple Blogs - Grid Layout */
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{currentBlogs.map((blog, index) => (
								<motion.div
									key={blog._id}
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: index * 0.1 }}
									className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
									onClick={() => handleNavigation(blog._id)}
								>
									<div className="relative h-48 overflow-hidden">
										<Image src={blog?.blogMainPicture || "/ghanti.png"} alt={getLocalizedTitle(blog)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
										{index === 0 && (
											<div className="absolute top-4 left-4">
												<span className="px-3 py-1 bg-blue-600 rounded-full text-white text-sm font-medium">Latest</span>
											</div>
										)}
									</div>
									<div className="p-6">
										<div className="flex items-center text-gray-500 text-sm mb-3">
											<Calendar className="w-4 h-4 mr-2" />
											<span>{blog?.blogDate}</span>
										</div>
										<h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
											{getLocalizedTitle(blog)}
										</h3>
										<div className="flex items-center justify-between">
											<span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors duration-300">
												Read Article
											</span>
											<ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
										</div>
									</div>
								</motion.div>
							))}
						</div>
					)}
				</div>

				{/* Navigation */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between mb-8">
						<button
							onClick={prevPage}
							disabled={currentPage === 0}
							className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
								currentPage > 0
									? "bg-blue-600 text-white hover:bg-blue-700"
									: "bg-gray-200 text-gray-400 cursor-not-allowed"
							}`}
						>
							Previous
						</button>

						<div className="flex gap-2">
							{Array.from({ length: totalPages }).map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentPage(index)}
									className={`h-2 rounded-full transition-all duration-300 ${
										index === currentPage ? "w-8 bg-blue-600" : "w-2 bg-gray-300 hover:bg-gray-400"
									}`}
									aria-label={`Go to page ${index + 1}`}
								/>
							))}
						</div>

						<button
							onClick={nextPage}
							disabled={currentPage >= totalPages - 1}
							className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
								currentPage < totalPages - 1
									? "bg-blue-600 text-white hover:bg-blue-700"
									: "bg-gray-200 text-gray-400 cursor-not-allowed"
							}`}
						>
							Next
						</button>
					</div>
				)}

				{/* View All Button */}
				{pathname !== `/${locale}/blogs` && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="flex justify-center"
					>
						<ViewAllButton href={`/${locale}/blogs`} label={t.view_all} />
					</motion.div>
				)}
			</div>
		</section>
	);
}

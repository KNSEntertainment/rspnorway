"use client";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ViewAllButton from "@/components/ViewAllButton";

interface Blog {
	_id: string;
	blogTitle_en?: string;
	blogTitle_ne?: string;
	blogTitle_no?: string;
	blogDate: string;
	blogMainPicture?: string;
	blogAuthor?: string;
	blogDesc_en?: string;
	blogDesc_ne?: string;
	blogDesc_no?: string;
	createdAt?: string;
	// Legacy fields
	blogTitle?: string;
	blogDesc?: string;
}

interface Translations {
	blogs_title: string;
	loading: string;
	view_all: string;
}

interface Props {
	blogs: Blog[];
	translations?: Translations;
	locale: string;
	isHomePage?: boolean;
}

export default function BlogsClient({ blogs, translations, locale, isHomePage = false }: Props) {
	const router = useRouter();
	const [navLoading, setNavLoading] = useState(false);

	// Helper function to get localized blog title with complete fallback
	const getLocalizedTitle = (blog: Blog): string => {
		if (!blog) return "Untitled";
		const key = `blogTitle_${locale}` as keyof Blog;
		const localizedTitle = blog[key];
		return (
			(typeof localizedTitle === "string" && localizedTitle.trim()) ||
			blog.blogTitle_en?.trim() ||
			blog.blogTitle_ne?.trim() ||
			blog.blogTitle_no?.trim() ||
			blog.blogTitle?.trim() ||
			"Untitled"
		);
	};

	// Helper function to get localized blog description with complete fallback
	const getLocalizedDescription = (blog: Blog): string => {
		if (!blog) return "";
		const key = `blogDesc_${locale}` as keyof Blog;
		const localizedDesc = blog[key];
		return (
			(typeof localizedDesc === "string" && localizedDesc.trim()) ||
			blog.blogDesc_en?.trim() ||
			blog.blogDesc_ne?.trim() ||
			blog.blogDesc_no?.trim() ||
			blog.blogDesc?.trim() ||
			""
		);
	};

	// Clean description for text preview (strips all HTML to prevent hydration errors and broken markup)
	const cleanDescription = (description?: string, maxLength = 200): string => {
		if (!description) return "";

		const plainText = description
			.replace(/<[^>]*>/g, " ")
			.replace(/&nbsp;/g, " ")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/\s+/g, " ")
			.trim();

		return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText;
	};

	// Deterministic date formatting that produces identical output on server and client
	const formatBlogDate = (dateStr?: string) => {
		if (!dateStr) return "";
		const str = String(dateStr).trim();
		const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (match) {
			return `${match[1]}-${match[2]}-${match[3]}`;
		}
		return str.slice(0, 10);
	};

	const handleNavigation = (blogId: string) => {
		if (navLoading) return;
		setNavLoading(true);
		router.push(`/${locale}/blogs/${blogId}`);
	};

	if (!blogs || blogs.length === 0) {
		return (
			<section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
				<div className="container mx-auto px-6 py-20 text-center">
					<h1 className="text-4xl font-light text-gray-900 mb-4">{translations?.blogs_title || "Blogs"}</h1>
					<p className="text-gray-500">No blogs available at the moment.</p>
				</div>
			</section>
		);
	}

	// On homepage, limit to the two latest blogs; on /blogs, show all
	const displayedBlogs = isHomePage ? blogs.slice(0, 2) : blogs;
	const featuredBlogs = displayedBlogs.slice(0, 2);
	const remainingBlogs = !isHomePage && blogs.length > 2 ? blogs.slice(2) : [];

	return (
		<section className="relative min-h-screen overflow-hidden">
			{/* Background Decorative Elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand/5 to-transparent rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 container mx-auto px-6 pb-20 pt-6">
				{/* Section Header */}
				<SectionHeader
					heading={translations?.blogs_title || "Blogs"}
					subtitle={isHomePage ? "Discover insights, stories, and updates from our community" : "Explore all insights, stories, and updates from our community"}
				/>

				{/* Featured Blogs Section (Top 2 latest) */}
				<div className="max-w-7xl mx-auto">
					<div className={`grid grid-cols-1 ${featuredBlogs.length > 1 ? "md:grid-cols-2" : "max-w-3xl mx-auto"} gap-8`}>
						{featuredBlogs.map((blog, index) => (
							<div
								key={blog._id}
								className="group relative bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-[420px] md:h-[460px]"
								onClick={() => handleNavigation(blog._id)}
							>
								{/* Card Border Gradient */}
								<div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>

								{/* Background Image */}
								<Image
									src={blog?.blogMainPicture || "/ghanti.png"}
									alt={getLocalizedTitle(blog)}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover transition-transform duration-700 group-hover:scale-105"
								/>

								{/* Image Overlay Gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10"></div>

								{/* Content Overlay */}
								<div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-20">
									{/* Category Badge */}
									<div className="mb-3">
										<div className={`${index === 0 ? "bg-brand/90" : "bg-emerald-600/90"} backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg inline-block`}>
											<span className="text-xs font-semibold text-white uppercase tracking-wider">
												{index === 0 ? "Latest" : "Featured"}
											</span>
										</div>
									</div>

									{/* Blog Title */}
									<h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-brand transition-colors duration-300 line-clamp-2">
										{getLocalizedTitle(blog)}
									</h2>

									{/* Blog Description Preview */}
									<p className="text-white/85 text-sm mb-4 line-clamp-2 leading-relaxed">
										{cleanDescription(getLocalizedDescription(blog), 180)}
									</p>

									{/* Blog Meta */}
									<div className="flex flex-wrap items-center gap-4 text-white/80 text-xs md:text-sm">
										{blog?.blogAuthor && (
											<div className="flex items-center gap-1.5">
												<User className="w-4 h-4 text-brand" />
												<span className="font-medium">{blog.blogAuthor}</span>
											</div>
										)}
										<div className="flex items-center gap-1.5">
											<Calendar className="w-4 h-4 text-brand" />
											<span suppressHydrationWarning>{formatBlogDate(blog?.blogDate || blog?.createdAt)}</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* All Remaining Blogs Grid (Displayed on /blogs page when more than 2 blogs exist) */}
				{!isHomePage && remainingBlogs.length > 0 && (
					<div className="max-w-7xl mx-auto mt-16">
						<div className="flex items-center gap-3 mb-8">
							<div className="h-6 w-1.5 bg-brand rounded-full"></div>
							<h3 className="text-2xl font-bold text-gray-900">More Articles</h3>
							<span className="text-sm text-gray-500 font-medium">({remainingBlogs.length})</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{remainingBlogs.map((blog) => (
								<div
									key={blog._id}
									className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col border border-gray-100 hover:border-brand/30"
									onClick={() => handleNavigation(blog._id)}
								>
									{/* Card Image */}
									<div className="relative h-52 w-full overflow-hidden bg-gray-100">
										<Image
											src={blog?.blogMainPicture || "/ghanti.png"}
											alt={getLocalizedTitle(blog)}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="object-cover transition-transform duration-500 group-hover:scale-105"
										/>
										<div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 z-10">
											<Calendar className="w-3 h-3" />
											<span suppressHydrationWarning>{formatBlogDate(blog?.blogDate || blog?.createdAt)}</span>
										</div>
									</div>

									{/* Card Content */}
									<div className="p-6 flex flex-col flex-grow justify-between">
										<div>
											{blog?.blogAuthor && (
												<div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
													<User className="w-3.5 h-3.5 text-brand" />
													<span>{blog.blogAuthor}</span>
												</div>
											)}
											<h4 className="text-lg font-bold text-gray-900 group-hover:text-brand transition-colors duration-200 line-clamp-2 mb-2 leading-snug">
												{getLocalizedTitle(blog)}
											</h4>
											<p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
												{cleanDescription(getLocalizedDescription(blog), 140)}
											</p>
										</div>

										<div className="pt-4 border-t border-gray-100 flex items-center justify-between text-brand text-sm font-semibold group-hover:translate-x-1 transition-transform duration-200">
											<span>Read Article</span>
											<ArrowRight className="w-4 h-4" />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Bottom Navigation: View All Blogs (Homepage Only) */}
				{isHomePage && (
					<div className="flex justify-center pt-12">
						<ViewAllButton
							href={`/${locale}/blogs`}
							label={translations?.view_all ? `${translations.view_all} Blogs` : "View All Blogs"}
						/>
					</div>
				)}
			</div>
		</section>
	);
}

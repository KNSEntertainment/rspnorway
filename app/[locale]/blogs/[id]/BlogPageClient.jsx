"use client";
import Image from "next/image";
import { Calendar, Pencil } from "lucide-react";
import BlogSidebar from "@/components/BlogSidebar";
import "@/styles/blog-styles.css";

export default function BlogPageClient({ blogData, blogsData }) {
	const locale = useLocale();
	const blog = blogData?.blog;
	const blogs = blogsData?.blogs || [];

	const getLocalizedTitle = (blog) => {
		if (!blog) return "";
		if (locale === "ne" && blog.blogTitle_ne) return blog.blogTitle_ne;
		if (locale === "no" && blog.blogTitle_no) return blog.blogTitle_no;
		return blog.blogTitle_en || blog.blogTitle || "";
	};

	const getLocalizedDesc = (blog) => {
		if (!blog) return "";
		if (locale === "ne" && blog.blogDesc_ne) return blog.blogDesc_ne;
		if (locale === "no" && blog.blogDesc_no) return blog.blogDesc_no;
		return blog.blogDesc_en || blog.blogDesc || "";
	};

	if (!blog || !blog._id) {
		return <p className="flex items-center justify-center w-full min-h-screen bg-red-50 mt-24">Blogs not found.</p>;
	}

	return (
		<div className="container grid grid-cols-1 lg:grid-cols-3 gap-12 py-12 px-4 mx-auto max-w-7xl">
			{/* Main Content */}
			<main className="lg:col-span-2">
				{/* Article Header */}
				<article className="prose prose-lg prose-gray max-w-none">
					{/* Blog Title */}
					<h1 className="mt-4 text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 text-center lg:text-left">
						{getLocalizedTitle(blog)}
					</h1>
					
					{/* Article Meta */}
					<div className="border-b border-gray-200 pb-6 mb-8">
						<div className="flex flex-row items-center justify-between gap-4">
							{/* Author Section */}
							<div className="flex items-center gap-1">
									<Pencil className="w-5 h-5" />
								<div>
									<p className="text-gray-700">{blog.blogAuthor || "PNSB-Norway"}</p>
								</div>
							</div>
							
							{/* Date Section */}
							<div className="flex items-center gap-1">
								<Calendar className="w-5 h-5" />
								<time dateTime={blog.createdAt}>
									{new Date(blog.createdAt).toLocaleDateString(locale, { 
										year: 'numeric', 
										month: 'long', 
										day: 'numeric' 
									})}
								</time>
							</div>
						</div>
					</div>

					{/* Featured Image */}
					<div className="mb-10">
						<div className="relative rounded-2xl overflow-hidden shadow-xl">
							<Image 
								src={blog.blogMainPicture || "/ghanti.png"} 
								alt={getLocalizedTitle(blog) || "Blog Image"} 
								width={500} 
								height={500} 
								className="w-full h-auto object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
						</div>
					</div>

					{/* Blog Content with Professional Typography */}
					<div className="blog-content">
						<div 
							dangerouslySetInnerHTML={{ __html: getLocalizedDesc(blog) }} 
						/>
						
						{blog.blogSecondPicture && (
							<div className="mt-12 mb-8">
								<div className="relative rounded-2xl overflow-hidden shadow-xl">
									<Image 
										src={blog.blogSecondPicture} 
										alt={getLocalizedTitle(blog) || "Blog Image"} 
										width={500} 
										height={500} 
										className="w-full h-auto object-cover"
									/>
								</div>
							</div>
						)}
					</div>
				</article>
			</main>

			{/* Sidebar with sticky behavior */}
			<aside className="lg:col-span-1 lg:sticky lg:top-24">
				<BlogSidebar blog={blog} blogs={blogs} locale={locale} />
			</aside>
		</div>
	);
}

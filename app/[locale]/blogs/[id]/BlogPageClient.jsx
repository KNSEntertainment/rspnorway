"use client";
import Image from "next/image";
import { Calendar, NotebookPen } from "lucide-react";
import BlogSidebar from "@/components/BlogSidebar";

export default function BlogPageClient({ blogData, blogsData }) {
	const blog = blogData?.blog;
	const blogs = blogsData?.blogs || [];

	if (!blog || !blog._id) {
		return <p className="flex items-center justify-center w-full min-h-screen bg-red-50 mt-24">Blogs not found.</p>;
	}

	return (
		<div className="container grid grid-cols-1 lg:grid-cols-3 gap-12 py-40 md:py-48 px-4 mx-auto">
			{/* Main Content */}
			<main className="lg:col-span-2">
				<h1 className="mt-4 text-xl md:text-3xl font-bold font-serif text-center">{blog.blogTitle}</h1>
				<div className="flex gap-12 justify-center  md:mt-4">
					<div className="flex gap-2">
						<NotebookPen className=" mt-4 text-brand" />
						<p className="mt-4 md:text-lg text-gray-700 max-w-3xl">{blog.blogAuthor ? blog.blogAuthor : "राष्ट्रिय स्वतन्त्र पार्टी"}</p>
					</div>
					<div className="flex gap-2">
						<Calendar className="mt-4 text-brand" />
						<p className="mt-4 md:text-lg text-gray-700">{new Date(blog.createdAt).toISOString().slice(0, 10)}</p>
					</div>
				</div>
				{/* Main Image */}
				<div className="mt-8 md:mt-12 px-4">
					<Image src={blog.blogMainPicture || "/placeholder.jpg"} alt={blog?.blogTitle || "Blog Image"} width={900} height={500} className="w-full rounded-lg shadow-md" />
				</div>
				{/* Blog Content */}
				<div className="mt-8">
					<div className="text-md md:text-lg text-gray-700 leading-relaxed mt-6 mb-2 md:mb-6" dangerouslySetInnerHTML={{ __html: blog.blogDesc }} />
					{blog.blogSecondPicture && (
						<div className="mt-6">
							<Image src={blog.blogSecondPicture} alt={blog?.blogTitle || "Blog Image"} width={900} height={500} className="w-full rounded-lg shadow-md" />
						</div>
					)}
				</div>
			</main>

			{/* Sidebar with sticky behavior */}
			<aside className="lg:col-span-1 lg:sticky lg:top-24">
				<BlogSidebar blog={blog} blogs={blogs} />
			</aside>
		</div>
	);
}

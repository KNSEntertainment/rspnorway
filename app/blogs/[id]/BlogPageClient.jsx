"use client";
import BlogSidebar from "@/components/BlogSidebar";
import Image from "next/image";
import useFetchData from "@/hooks/useFetchData";

export default function BlogPageClient({ blogData }) {
	const { data: blogs } = useFetchData("/api/blogs", "blogs");
	const blog = blogData?.blog;

	if (!blog || !blog._id) {
		return <p>Blog not found.</p>;
	}

	return (
		<div className="container flex flex-col lg:flex-row space-y-12 py-24 md:py-36 px-6 lg:px-12">
			{/* Main Content */}
			<main className="max-w-5xl mx-auto">
				<h1 className="mt-4 text-3xl md:text-5xl font-bold font-serif text-center">{blog.blogTitle}</h1>
				{/* Main Image */}
				<div className="mt-8 md:mt-12">
					<Image src={blog.blogMainPicture || "/placeholder.jpg"} alt={blog?.blogTitle || "Blog Image"} width={900} height={500} className="w-full rounded-lg shadow-md" />
				</div>
				{/* Blog Content */}
				<div className="mt-8">
					<h2 className="text-2xl md:text-3xl font-semibold">{blog.blogTitle}</h2>
					{blog.blogSecondPicture && (
						<div className="mt-6">
							<Image src={blog.blogSecondPicture} alt={blog?.blogTitle || "Blog Image"} width={900} height={500} className="w-full rounded-lg shadow-md" />
						</div>
					)}
					<div className="text-md md:text-lg text-gray-700 leading-relaxed mt-6 mb-2 md:mb-6" dangerouslySetInnerHTML={{ __html: blog.blogDesc }} />
				</div>
			</main>

			{/* Sidebar with sticky behavior */}
			<aside className="lg:sticky lg:top-24">
				<BlogSidebar blog={blog} blogs={blogs} />
			</aside>
		</div>
	);
}

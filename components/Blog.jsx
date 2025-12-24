"use client";
import Image from "next/image";
import { Calendar } from "lucide-react";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Blog() {
	const { data: blogs, loading } = useFetchData("/api/blogs", "blogs");
	const pathname = usePathname();

	if (loading) {
		return (
			<section id="blog" className="bg-white">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
					<h2 className="text-3xl font-bold text-center mb-6 sm:mb-12">
						Loading <span className="text-[#0094da]">Blogs</span>...
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Featured Article Skeleton */}
						<div className="flex flex-col justify-between mb-6 md:mb-0 h-96 sm:h-[400px] md:h-[745px] lg:h-[385px]">
							<h3 className="text-2xl font-bold mb-2">Featured</h3>
							<div className="group relative flex-1 overflow-hidden rounded-lg bg-gray-200 animate-pulse"></div>
						</div>

						{/* Recent Blogs Skeleton */}
						<div className="flex flex-col">
							<h3 className="text-2xl font-bold mb-2">Recent</h3>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{[...Array(4)].map((_, index) => (
									<div key={index} className="group bg-gray-200 rounded-lg shadow overflow-hidden animate-pulse">
										<div className="flex items-center p-3">
											<div className="relative w-20 h-20 flex-shrink-0 bg-gray-300 rounded"></div>
											<div className="ml-4 flex-1 space-y-2">
												<div className="h-4 bg-gray-300 rounded w-3/4"></div>
												<div className="h-3 bg-gray-300 rounded w-1/2"></div>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="mt-4 flex justify-end">
								<div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id="blog" className="">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
				<h2 className="text-3xl font-bold text-center mb-6">
					RSP Norway <span className="text-[#0094da]">Blogs</span>
				</h2>
				<div className="w-24 h-1 bg-[#0094da] mx-auto mb-6 md:mb-12 rounded-full"></div>

				<div className="mx-auto px-4 py-12">
					<div className="space-y-8">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{blogs &&
								blogs.map((blog) => (
									<div key={blog._id} className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]">
										<div className="relative w-full h-64 overflow-hidden">
											<Image src={blog?.blogMainPicture || "/placeholder.jpg"} alt={blog?.blogTitle || "Blog image"} width={500} height={500} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
										</div>
										<div className="p-6 space-y-2">
											<div className="flex items-center text-gray-500">
												<Calendar className="w-4 h-4 mr-2" />
												<span className="text-sm font-medium">{blog?.blogDate}</span>
											</div>
											<h1 className="text-xl md:text-2xl font-bold mb-2 cursor-pointer group-hover:text-[#0094da]">
												<Link href={`/blogs/${blog?._id}`}>{blog?.blogTitle}</Link>
											</h1>{" "}
										</div>
									</div>
								))}
						</div>
						{pathname !== "/blogs" && (
							<div className="flex justify-center">
								<Link href="/blogs" className="inline-flex items-center px-5 py-2.5 font-medium text-sm rounded-lg bg-[#0094da] text-white hover:bg-[#0094da] transition-colors duration-200">
									View All Blogs
									<svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

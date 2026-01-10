"use client";
import Image from "next/image";
import { Calendar } from "lucide-react";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function Blogs() {
	const { data: blogs, loading } = useFetchData("/api/blogs", "blogs");
	const pathname = usePathname();
	const router = useRouter();
	const [navLoading, setNavLoading] = useState(false);
	const t = useTranslations("blogs");
	const locale = useLocale();

	if (loading) {
		return (
			<section id="blogs" className="bg-white">
				<div className="container mx-auto px-4 lg:px-8 py-12 sm:py-16">
					<h2 className="text-3xl font-bold text-center mb-6">{t("blogs_title")}</h2>
					<div className="w-24 h-1 bg-brand mx-auto mb-6 md:mb-12 rounded-full"></div>
					<div className="mx-auto px-4 py-12">
						<div className="space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{[...Array(3)].map((_, idx) => (
									<div key={idx} className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 animate-pulse">
										<div className="relative w-full h-64 overflow-hidden bg-gray-200" />
										<div className="p-6 space-y-2">
											<div className="flex items-center text-gray-300">
												<div className="w-4 h-4 mr-2 bg-gray-300 rounded-full" />
												<div className="h-4 w-20 bg-gray-200 rounded" />
											</div>
											<div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
										</div>
									</div>
								))}
							</div>
							<div className="flex justify-center">
								<div className="inline-flex items-center px-5 py-2.5 font-medium text-sm rounded-lg bg-gray-200 text-gray-400 animate-pulse w-32 h-10" />
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id="blog" className="bg-gradient-to-br from-brand-100 to-gray-100">
			<div className="container mx-auto px-4 py-12">
				<h2 className="text-3xl font-bold text-center mb-6">{t("blogs_title")}</h2>
				<div className="w-24 h-1 bg-brand mx-auto mb-4 md:mb-8 rounded-full"></div>

				{/* Loading overlay for navigation */}
				{navLoading && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
						<div className="flex flex-col items-center">
							<svg className="animate-spin h-10 w-10 text-brand mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							<span className="text-brand font-semibold">{t("loading")}</span>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{blogs &&
						blogs.map((blog) => (
							<div key={blog._id} className="group bg-white rounded-xl shadow-sm overflow-hidden md:transition-all md:duration-300 md:hover:shadow-lg md:hover:translate-y-[-4px]">
								{/* Responsive flex: row on small, col on md+ */}
								<div className="flex flex-row md:flex-col h-32 md:h-full bg-white">
									{/* Image: small and left on mobile, top on md+ */}
									<div className="relative flex-shrink-0 w-28 h-full md:w-full md:h-64 overflow-hidden">
										<Image src={blog?.blogMainPicture || "/placeholder.jpg"} alt={blog?.blogTitle || "Blog image"} width={300} height={300} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
									</div>
									{/* Text: right on mobile, below on md+ */}
									<div className="flex flex-col justify-center p-4 md:p-6 space-y-2 w-full">
										<div className="flex items-center text-gray-500">
											<Calendar className="w-4 h-4 mr-2" />
											<span className="text-sm font-medium">{blog?.blogDate}</span>
										</div>
										<h1 className="text-base md:text-2xl font-bold mb-2 cursor-pointer group-hover:text-brand">
											<button
												className="bg-transparent p-0 m-0 border-none text-left w-full hover:text-brand focus:outline-none"
												onClick={() => {
													setNavLoading(true);
													router.push(`/${locale}/blogs/${blog?._id}`);
												}}
												disabled={navLoading}
											>
												{blog?.blogTitle}
											</button>
										</h1>
									</div>
								</div>
							</div>
						))}
				</div>
				{pathname !== "/en/blogs" && (
					<div className="flex justify-center mt-6">
						<Link href="/en/blogs" className="inline-flex items-center px-5 py-2.5 font-medium text-sm rounded-lg bg-brand text-white hover:bg-brand transition-colors duration-200">
							{t("view_all")}
							<svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
							</svg>
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

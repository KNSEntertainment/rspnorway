"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, BookOpen, Image as ImageIcon, Newspaper, User } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";

function SearchContent() {
	const searchParams = useSearchParams();
	const query = searchParams.get("q") || "";
	const [results, setResults] = useState({
		blogs: [],
		events: [],
		gallery: [],
		notices: [],
		testimonials: [],
		pages: [],
		users: [],
	});
	const { setLoading } = useLoading();

	useEffect(() => {
		if (query) {
			searchContent(query);
		} else {
			setLoading(false);
		}
	}, [query, setLoading, searchContent]);

	const searchContent = async (searchQuery) => {
		setLoading(true);

		try {
			const [blogsRes, eventsRes, galleryRes, noticesRes, testimonialsRes, usersRes] = await Promise.all([fetch("/api/blogs").then((res) => res.json()), fetch("/api/events").then((res) => res.json()), fetch("/api/gallery").then((res) => res.json()), fetch("/api/notices").then((res) => res.json()), fetch("/api/testimonials").then((res) => res.json()), fetch("/api/users").then((res) => res.json())]);

			const lowerQuery = searchQuery.toLowerCase().trim();

			// Handle both array and object responses
			const blogsArray = Array.isArray(blogsRes) ? blogsRes : blogsRes.blogs || [];
			const eventsArray = Array.isArray(eventsRes) ? eventsRes : eventsRes.events || [];
			const galleryArray = Array.isArray(galleryRes) ? galleryRes : galleryRes.gallery || [];
			const noticesArray = Array.isArray(noticesRes) ? noticesRes : noticesRes.notices || [];
			const testimonialsArray = Array.isArray(testimonialsRes) ? testimonialsRes : testimonialsRes.testimonials || [];
			const usersArray = Array.isArray(usersRes) ? usersRes : usersRes.users || [];

			// Search blogs
			const filteredBlogs = blogsArray.filter((blog) => {
				const titleMatch = (blog.blogTitle || blog.title)?.toLowerCase().trim().includes(lowerQuery);
				const contentMatch = (blog.blogDesc || blog.content)?.toLowerCase().trim().includes(lowerQuery);
				const authorMatch = (blog.blogAuthor || blog.author)?.toLowerCase().trim().includes(lowerQuery);
				return titleMatch || contentMatch || authorMatch;
			});

			// Search events
			const filteredEvents = eventsArray.filter((event) => {
				const titleMatch = event.title?.toLowerCase().trim().includes(lowerQuery);
				const descMatch = event.description?.toLowerCase().trim().includes(lowerQuery);
				const locMatch = event.location?.toLowerCase().trim().includes(lowerQuery);
				return titleMatch || descMatch || locMatch;
			});

			// Search gallery
			const filteredGallery = galleryArray.filter((item) => {
				const titleMatch = item.title?.toLowerCase().trim().includes(lowerQuery);
				const descMatch = item.description?.toLowerCase().trim().includes(lowerQuery);
				const catMatch = item.category?.toLowerCase().trim().includes(lowerQuery);
				return titleMatch || descMatch || catMatch;
			});

			// Search notices
			const filteredNotices = noticesArray.filter((notice) => {
				const titleMatch = notice.title?.toLowerCase().trim().includes(lowerQuery);
				const contentMatch = notice.content?.toLowerCase().trim().includes(lowerQuery);
				return titleMatch || contentMatch;
			});

			// Search testimonials
			const filteredTestimonials = testimonialsArray.filter((testimonial) => {
				const nameMatch = testimonial.name?.toLowerCase().trim().includes(lowerQuery);
				const reviewMatch = testimonial.review?.toLowerCase().trim().includes(lowerQuery);
				const positionMatch = testimonial.position?.toLowerCase().trim().includes(lowerQuery);
				return nameMatch || reviewMatch || positionMatch;
			});

			// Search users
			const filteredUsers = usersArray.filter((user) => {
				return [user.fullName, user.email, user.userName, user.role].map((v) => v?.toLowerCase?.() || "").some((v) => v.includes(lowerQuery));
			});

			// Static pages search
			const staticPages = [
				{ title: "About Us", href: "/about-us", keywords: ["about", "school", "history", "mission", "vision", "values"] },
				{ title: "Our Team", href: "/team", keywords: ["team", "staff", "member"] },
				{ title: "Contact Us", href: "/contact", keywords: ["contact", "reach", "email", "phone", "address", "location"] },
				{ title: "Gallery", href: "/gallery", keywords: ["gallery", "photos", "images", "pictures"] },
			];

			const matchedPages = staticPages.filter((page) => {
				const titleMatch = page.title.toLowerCase().includes(lowerQuery);
				const keywordMatch = page.keywords.some((keyword) => lowerQuery.includes(keyword) || keyword.includes(lowerQuery));
				return titleMatch || keywordMatch;
			});

			setResults({
				blogs: filteredBlogs,
				events: filteredEvents,
				gallery: filteredGallery,
				notices: filteredNotices,
				testimonials: filteredTestimonials,
				pages: matchedPages,
				users: filteredUsers,
			});
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			setLoading(false);
		}
	};

	const totalResults = results.blogs.length + results.events.length + results.gallery.length + results.notices.length + results.testimonials.length + results.pages.length + results.users.length;

	return (
		<div className="min-h-screen bg-gray-50 py-32 px-4">
			<div className="container mx-auto max-w-6xl">
				{/* Search Header */}
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
					{query && (
						<p className="text-gray-600 text-lg">
							Found <span className="font-semibold text-[#0094da]">{totalResults}</span> results for &quot;<span className="font-semibold">{query}</span>&quot;
						</p>
					)}
				</div>

				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0094da]"></div>
					</div>
				) : totalResults === 0 ? (
					<div className="text-center py-20">
						<Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
						<h2 className="text-2xl font-semibold text-gray-700 mb-2">No results found</h2>
						<p className="text-gray-600">Try searching with different keywords</p>
					</div>
				) : (
					<div className="space-y-8">
						{/* Users Section */}
						{results.users.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<User className="text-[#0094da]" />
									Users ({results.users.length})
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{results.users.map((user) => (
										<div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
											<h3 className="font-bold text-xl text-gray-900 mb-2">{user.fullName}</h3>
											<p className="text-gray-600 mb-1">Email: {user.email}</p>
											<p className="text-gray-600 mb-1">Role: {user.role}</p>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Blogs Section */}
						{results.blogs.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<Newspaper className="text-[#0094da]" />
									Blogs ({results.blogs.length})
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{results.blogs.map((blog) => (
										<Link key={blog._id} href={`/blogs/${blog._id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
											{(blog.blogMainPicture || blog.imageUrl) && (
												<div className="relative h-48 w-full">
													<Image src={blog.blogMainPicture || blog.imageUrl} alt={blog.blogTitle || blog.title} fill className="object-cover" />
												</div>
											)}
											<div className="p-4">
												<h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{blog.blogTitle || blog.title}</h3>
												<p className="text-gray-600 text-sm line-clamp-3">{(blog.blogDesc || blog.content)?.replace(/<[^>]*>/g, "")}</p>
												{(blog.blogAuthor || blog.author) && <p className="text-sm text-gray-500 mt-2">By {blog.blogAuthor || blog.author}</p>}
											</div>
										</Link>
									))}
								</div>
							</section>
						)}

						{/* Events Section */}
						{results.events.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<Calendar className="text-[#0094da]" />
									Events ({results.events.length})
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{results.events.map((event) => (
										<div key={event._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
											<h3 className="font-bold text-xl text-gray-900 mb-2">{event.title}</h3>
											<p className="text-gray-600 mb-3">{event.description}</p>
											{event.date && (
												<p className="text-sm text-gray-500 flex items-center gap-2">
													<Calendar size={16} />
													{new Date(event.date).toLocaleDateString()}
												</p>
											)}
											{event.location && <p className="text-sm text-gray-500 mt-1">Location: {event.location}</p>}
										</div>
									))}
								</div>
							</section>
						)}

						{/* Gallery Section */}
						{results.gallery.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<ImageIcon className="text-[#0094da]" />
									Gallery ({results.gallery.length})
								</h2>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{results.gallery.map((item) => (
										<Link key={item._id} href="/gallery" className="relative group overflow-hidden rounded-lg aspect-square">
											<Image src={item.imageUrl} alt={item.title || "Gallery image"} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
											<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
												<p className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-center px-2">{item.title}</p>
											</div>
										</Link>
									))}
								</div>
							</section>
						)}

						{/* Notices Section */}
						{results.notices.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<Newspaper className="text-[#0094da]" />
									Notices ({results.notices.length})
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{results.notices.map((notice) => (
										<div key={notice._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
											<h3 className="font-bold text-xl text-gray-900 mb-2">{notice.title}</h3>
											<p className="text-gray-600">{notice.content?.replace(/<[^>]*>/g, "")}</p>
											{notice.date && (
												<p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
													<Calendar size={16} />
													{new Date(notice.date).toLocaleDateString()}
												</p>
											)}
										</div>
									))}
								</div>
							</section>
						)}

						{/* Testimonials Section */}
						{results.testimonials.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<User className="text-[#0094da]" />
									Testimonials ({results.testimonials.length})
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{results.testimonials.map((testimonial) => (
										<div key={testimonial._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
											<p className="text-gray-600 italic mb-4">&quot;{testimonial.review}&quot;</p>
											<div className="border-t pt-4">
												<p className="font-bold text-gray-900">{testimonial.name}</p>
												{testimonial.position && <p className="text-sm text-gray-500">{testimonial.position}</p>}
											</div>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Pages Section */}
						{results.pages.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<BookOpen className="text-[#0094da]" />
									Pages ({results.pages.length})
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{results.pages.map((page, index) => (
										<Link key={index} href={page.href} className="block bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
											<h3 className="font-bold text-xl text-[#0094da] mb-2">{page.title}</h3>
											<p className="text-gray-600">Visit this page for more information</p>
										</Link>
									))}
								</div>
							</section>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gray-50 py-12">
					<div className="container mx-auto px-4">
						<div className="text-center">Loading search...</div>
					</div>
				</div>
			}
		>
			<SearchContent />
		</Suspense>
	);
}

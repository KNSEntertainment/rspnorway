"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, BookOpen, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";

function SearchContent() {
	const t = useTranslations("search");
	// Strict image URL validation
	function isValidImageUrl(url) {
		if (typeof url !== "string") return false;
		const trimmed = url.trim();
		if (!trimmed) return false;
		// Accept http(s) and root-relative URLs only, no whitespace
		if (/^(https?:\/\/|\/)[^\s]*$/.test(trimmed)) return true;
		return false;
	}
	const searchParams = useSearchParams();
	const query = searchParams.get("q") || "";
	const [setResults] = useState({
		events: [],
		gallery: [],
		notices: [],
		pages: [],
	});
	const [unifiedResults, setUnifiedResults] = useState([]);

	useEffect(() => {
		if (query) {
			searchContent(query);
		} else {
			// setLoading(false);
		}
	}, [query]);

	const searchContent = async (searchQuery) => {
		// setLoading(true);

		try {
			const [eventsRes, galleryRes, noticesRes] = await Promise.all([fetch("/api/events").then((res) => res.json()), fetch("/api/gallery").then((res) => res.json()), fetch("/api/notices").then((res) => res.json())]);

			const lowerQuery = searchQuery.toLowerCase().trim();

			// Handle both array and object responses
			const eventsArray = Array.isArray(eventsRes) ? eventsRes : eventsRes.events || [];
			const galleryArray = Array.isArray(galleryRes) ? galleryRes : galleryRes.gallery || [];
			const noticesArray = Array.isArray(noticesRes) ? noticesRes : noticesRes.notices || [];
			// Search blogs
			// const filteredBlogs = blogsArray.filter((blog) => {
			// 	const titleMatch = (blog.blogTitle || blog.title)?.toLowerCase().trim().includes(lowerQuery);
			// 	const contentMatch = (blog.blogDesc || blog.content)?.toLowerCase().trim().includes(lowerQuery);
			// 	const authorMatch = (blog.blogAuthor || blog.author)?.toLowerCase().trim().includes(lowerQuery);
			// 	return titleMatch || contentMatch || authorMatch;
			// });

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
				events: filteredEvents,
				gallery: filteredGallery,
				notices: filteredNotices,
				pages: matchedPages,
			});

			// Build unified results array for display
			const allResults = [
				...filteredEvents.map((item) => ({
					type: "Event",
					_id: item._id,
					title: item.title || item.eventname,
					description: item.description || item.eventdescription,
					image: item.eventposterUrl || item.imageUrl,
					url: `/events/${item._id}`,
					date: item.date || item.eventdate,
					meta: item.location || item.eventvenue,
				})),
				...filteredGallery.map((item) => ({
					type: "Gallery",
					_id: item._id,
					title: item.title,
					description: item.description,
					image: item.imageUrl || item.media,
					url: `/gallery`,
					date: item.date,
					meta: item.category,
				})),
				...filteredNotices.map((item) => ({
					type: "Notice",
					_id: item._id,
					title: item.title || item.noticetitle,
					description: item.content || item.notice,
					image: item.noticeimage,
					url: `/notices/${item._id}`,
					date: item.date || item.noticedate,
					meta: item.classGroup,
				})),

				...matchedPages.map((item) => ({
					type: "Page",
					_id: item.href,
					title: item.title,
					description: "Static page",
					image: null,
					url: item.href,
					date: null,
					meta: null,
				})),
			];
			setUnifiedResults(allResults);
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			// setLoading(false);
		}
	};

	const totalResults = unifiedResults.length;

	return (
		<div className="container mx-auto max-w-6xl">
			{/* Search Header */}
			<div className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t("resultsTitle")}</h1>
				{query && <p className="text-gray-600 text-lg">{t("resultsFound", { count: totalResults, query })}</p>}
			</div>

			{totalResults === 0 ? (
				<div className="text-center py-20">
					<Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">{t("noResults")}</h2>
					<p className="text-gray-600">{t("tryDifferentKeywords")}</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{unifiedResults.map((item) => {
						const typeIcon = {
							Event: <Calendar className="w-5 h-5 text-green-500" />,
							Gallery: <ImageIcon className="w-5 h-5 text-pink-500" />,
							Notice: <BookOpen className="w-5 h-5 text-orange-500" />,
							Page: <BookOpen className="w-5 h-5 text-cyan-500" />,
						}[item.type];

						const highlight = (text) => {
							if (!text || !query) return text;
							const regex = new RegExp(`(${query})`, "gi");
							return text.split(regex).map((part, i) =>
								part.toLowerCase() === query.toLowerCase() ? (
									<mark key={i} className="bg-yellow-200 px-1 rounded">
										{part}
									</mark>
								) : (
									part
								)
							);
						};

						const CardContent = (
							<div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full">
								<div className="flex items-center gap-2 px-4 pt-4">
									{typeIcon}
									<span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.type}</span>
								</div>
								{isValidImageUrl(item.image) && (
									<div className="relative h-40 w-full mt-2">
										<Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
									</div>
								)}
								<div className="p-4 flex-1 flex flex-col">
									<h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{highlight(item.title)}</h3>
									{item.description && <p className="text-gray-600 text-sm line-clamp-3 mb-2">{highlight(item.description.replace(/<[^>]*>/g, ""))}</p>}
									{item.meta && <p className="text-xs text-gray-500 mb-1">{item.meta}</p>}
									{item.date && <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</p>}
									{item.url && <span className="mt-2 inline-block text-brand font-semibold text-sm hover:underline">{t("viewDetails")}</span>}
								</div>
							</div>
						);

						return item.url ? (
							<Link key={item._id} href={item.url} className="h-full block focus:outline-brand">
								{CardContent}
							</Link>
						) : (
							<div key={item._id} className="h-full block cursor-default opacity-80">
								{CardContent}
							</div>
						);
					})}
				</div>
			)}
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

"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Search, Filter } from "lucide-react";
import Image from "next/image";
import { useLoading } from "@/context/LoadingContext";

interface Document {
	id: string;
	title: string;
	date: string;
	fileUrl: string;
	imageUrl?: string;
	category: string;
	downloadCount?: number;
}

export default function DownloadsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [showMobileFilter, setShowMobileFilter] = useState(false);

	const [documents, setDocuments] = useState<Document[]>([]);
	const { isLoading, setLoading } = useLoading();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDocuments = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch("/api/downloads");
				const data = await res.json();
				if (res.ok && data.success && Array.isArray(data.downloads)) {
					setDocuments(
						data.downloads.map(
							(doc: { _id: string; title: string; date: string; fileUrl: string; imageUrl?: string; category: string; downloadCount?: number }): Document => ({
								id: doc._id,
								title: doc.title,
								date: doc.date,
								fileUrl: doc.fileUrl,
								imageUrl: doc.imageUrl,
								category: doc.category,
								downloadCount: doc.downloadCount ?? 0,
							})
						)
					);
				} else {
					setError(data.error || "Failed to load documents");
				}
			} catch (err) {
				setError("Failed to load documents" + (err instanceof Error ? ": " + err.message : ""));
			} finally {
				setLoading(false);
			}
		};
		fetchDocuments();
	}, [setLoading]);

	const categories = ["All", ...Array.from(new Set(documents.map((doc) => doc.category)))];

	const handleDownload = async (fileUrl: string, title: string, id?: string) => {
		// Try to extract extension from fileUrl, fallback to .pdf
		let ext = ".pdf";
		const match = fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
		if (match && match[1]) {
			ext = "." + match[1];
		}
		// Allow Unicode (Nepali, English, etc.) and spaces, only remove slashes and control chars
		const safeTitle = title.replace(/[\\/:*?"<>|\r\n]+/g, "_") + ext;
		try {
			// Increment download count in backend
			if (id) {
				fetch(`/api/downloads/${id}/increment`, { method: "POST" });
			}
			const response = await fetch(fileUrl);
			if (!response.ok) throw new Error("Failed to fetch file");
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", safeTitle);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch {
			alert("Failed to download file.");
		}
	};

	const filteredDocuments = documents.filter((doc) => {
		const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	if (isLoading) {
		return (
			<div className="mt-16 md:mt-24 min-h-screen">
				<main className="container mx-auto px-4 py-8">
					<section className="container mx-auto md:px-4 py-8 mb-16">
						<h2 className="text-3xl text-center font-bold mb-6">
							Download <span className="mx-auto text-[#0094da]">Documents</span>
						</h2>
						<div className="w-24 h-1 mx-auto bg-[#0094da] mb-6 md:mb-12 rounded-full"></div>

						{/* Main Content */}
						<div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
							{/* Search and Filter Bar Skeleton */}
							<div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
								<div className="flex flex-col md:flex-row gap-2 md:gap-4">
									<div className="flex items-center w-full md:flex-1 min-w-0 relative">
										<div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse" />
										<div className="ml-2 md:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
									</div>
									<div className="w-full md:w-auto min-w-0">
										<div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0">
											{Array.from({ length: 4 }).map((_, i) => (
												<div key={i} className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
											))}
										</div>
									</div>
								</div>
							</div>

							{/* Documents Grid Skeleton */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="flex bg-white rounded-2xl shadow-md overflow-hidden max-h-[224px] group animate-pulse">
										<div className="hidden lg:flex w-48 h-full items-center justify-center bg-gray-200" />
										<div className="lg:hidden w-full max-h-48 h-[192px] flex items-center justify-center bg-gray-200" />
										<div className="p-6 flex flex-col justify-between flex-1">
											<div className="px-3 py-2 w-24 bg-gray-200 rounded-full mb-3" />
											<div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
											<div className="flex items-center text-sm text-gray-500 mb-4">
												<div className="w-4 h-4 bg-gray-200 rounded mr-2" />
												<div className="h-4 w-24 bg-gray-200 rounded" />
											</div>
											<div className="flex justify-between items-end">
												<div className="flex gap-3 w-fit">
													<div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 rounded-xl w-32" />
												</div>
												<div className="flex items-center text-xs text-gray-500 mb-2">
													<div className="w-4 h-4 bg-gray-200 rounded mr-1" />
													<div className="h-4 w-16 bg-gray-200 rounded" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>
				</main>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-24 min-h-screen flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
						<FileText size={40} className="text-red-400" />
					</div>
					<h3 className="text-2xl font-bold text-red-600 mb-2">{error}</h3>
					<p className="text-gray-500">Please try again later.</p>
				</div>
			</div>
		);
	}
	return (
		<div className="mt-16 md:mt-24 min-h-screen">
			<main className="container mx-auto px-4 py-8">
				<section className="container mx-auto md:px-4 py-8 mb-16">
					<h2 className="text-3xl text-center font-bold mb-6">
						Download <span className="mx-auto text-[#0094da]">Documents</span>
					</h2>
					<div className="w-24 h-1 mx-auto bg-[#0094da] mb-6 md:mb-12 rounded-full"></div>

					{/* Main Content */}
					<div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
						{/* Search and Filter Bar */}
						<div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
							<div className="flex flex-col md:flex-row gap-2 md:gap-4">
								{/* Search Input + Filter Icon for mobile */}
								<div className="flex items-center w-full md:flex-1 min-w-0 relative">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
									<input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
									{/* Filter icon for mobile */}
									<button type="button" className="ml-2 md:hidden flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Show filter categories" onClick={() => setShowMobileFilter((v) => !v)}>
										<Filter size={22} className="text-gray-500" />
									</button>
								</div>

								{/* Category Filter */}
								<div className="w-full md:w-auto min-w-0">
									{/* Dropdown for small screens (shown when filter icon clicked) */}
									{showMobileFilter && (
										<div className="block md:hidden mb-2 animate-fade-in">
											<select
												value={selectedCategory}
												onChange={(e) => {
													setSelectedCategory(e.target.value);
													setShowMobileFilter(false);
												}}
												className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												{categories.map((category) => (
													<option key={category} value={category}>
														{category}
													</option>
												))}
											</select>
										</div>
									)}
									{/* Buttons for medium and larger screens */}
									<div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0">
										{categories.map((category) => (
											<button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === category ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
												{category}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Documents Grid */}
						{filteredDocuments.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
								{filteredDocuments.map((doc) => (
									<div key={doc.id} className="flex bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden max-h-[224px] group">
										{doc.imageUrl && doc.imageUrl.trim() !== "" ? (
											<Image src={doc.imageUrl} alt={doc.title} width={350} height={350} className="text-white hidden lg:block object-fill w-48 h-full" />
										) : (
											<div className="hidden lg:flex w-48 h-full items-center justify-center bg-brand">
												<FileText size={48} className="text-blue-100" />
											</div>
										)}
										{/* Mobile fallback for both image and icon */}
										{!(doc.imageUrl && doc.imageUrl.trim() !== "") && (
											<div className="lg:hidden w-full max-h-48 h-[192px] flex items-center justify-center bg-brand">
												<FileText size={48} className="text-blue-100" />
											</div>
										)}

										{/* Document Info */}
										<div className="p-6 flex flex-col justify-between flex-1">
											<span className="px-3 py-1 w-fit bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">{doc.category}</span>
											<h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
											<div className="flex items-center text-sm text-gray-500 mb-4">
												<Calendar size={16} className="mr-2" />
												{doc.date}
											</div>

											<div className="flex justify-between items-end">
												{/* Action Buttons */}
												<div className="flex gap-3 w-fit">
													<button onClick={() => handleDownload(doc.fileUrl, doc.title, doc.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md">
														<Download size={18} />
														Download
													</button>
												</div>
												<div className="flex items-center text-xs text-gray-500 mb-2">
													<Download size={14} className="mr-1" />
													{doc.downloadCount ?? 0} downloads
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="bg-white rounded-2xl shadow-lg p-12 text-center">
								<div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
									<FileText size={40} className="text-gray-400" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">No documents found</h3>
								<p className="text-gray-500">Try adjusting your search or filter to find what you&apos;re looking for.</p>
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}

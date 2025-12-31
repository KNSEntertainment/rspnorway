"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Search } from "lucide-react";
import Image from "next/image";

interface Document {
	id: string;
	title: string;
	date: string;
	fileUrl: string;
	imageUrl?: string;
	category: string;
}

export default function DownloadsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
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
							(doc: { _id: string; title: string; date: string; fileUrl: string; imageUrl?: string; category: string }): Document => ({
								id: doc._id,
								title: doc.title,
								date: doc.date,
								fileUrl: doc.fileUrl,
								imageUrl: doc.imageUrl,
								category: doc.category,
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
	}, []);

	const categories = ["All", ...Array.from(new Set(documents.map((doc) => doc.category)))];

	const handleDownload = (fileUrl: string, title: string) => {
		const link = document.createElement("a");
		link.href = fileUrl;
		link.download = title;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const filteredDocuments = documents.filter((doc) => {
		const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	if (loading) {
		return (
			<div className="mt-24 min-h-screen flex items-center justify-center">
				<p className="text-lg text-gray-500">Loading documents...</p>
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
		<div className="mt-24 min-h-screen">
			<main className="container mx-auto px-4 py-8">
				<section className="container mx-auto px-4 py-8 mb-16">
					<h2 className="text-3xl text-center font-bold mb-6">
						Download <span className="mx-auto text-[#0094da]">Documents</span>
					</h2>
					<div className="w-24 h-1 mx-auto bg-[#0094da] mb-6 md:mb-12 rounded-full"></div>

					{/* Main Content */}
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
						{/* Search and Filter Bar */}
						<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
							<div className="flex flex-col md:flex-row gap-4">
								{/* Search Input */}
								<div className="flex-1 relative">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
									<input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
								</div>

								{/* Category Filter */}
								<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
									{categories.map((category) => (
										<button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === category ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
											{category}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Documents Grid */}
						{filteredDocuments.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredDocuments.map((doc) => (
									<div key={doc.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
										{doc.imageUrl && doc.imageUrl.trim() !== "" ? (
											<Image src={doc.imageUrl} alt={doc.title} width={350} height={350} className="text-white object-cover w-full max-h-48" />
										) : (
											<div className="w-full max-h-48 h-[192px] flex items-center justify-center bg-brand">
												<FileText size={48} className="text-blue-100" />
											</div>
										)}

										{/* Document Info */}
										<div className="p-6">
											<span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">{doc.category}</span>
											<h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
											<div className="flex items-center text-sm text-gray-500 mb-4">
												<Calendar size={16} className="mr-2" />
												{doc.date}
											</div>

											{/* Action Buttons */}
											<div className="flex gap-3">
												<button onClick={() => handleDownload(doc.fileUrl, doc.title)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md">
													<Download size={18} />
													Download
												</button>
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

						{/* Stats Footer */}
						{/* <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
								<div>
									<div className="text-4xl font-bold text-blue-600 mb-2">{documents.length}</div>
									<div className="text-gray-600 font-medium">Total Documents</div>
								</div>
								<div>
									<div className="text-4xl font-bold text-blue-600 mb-2">{categories.length - 1}</div>
									<div className="text-gray-600 font-medium">Categories</div>
								</div>
								<div>
									<div className="text-4xl font-bold text-blue-600 mb-2">{filteredDocuments.length}</div>
									<div className="text-gray-600 font-medium">Showing Results</div>
								</div>
							</div>
						</div> */}
					</div>
				</section>
			</main>
		</div>
	);
}

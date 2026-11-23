"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor"), {
	ssr: false,
	loading: () => <p className="text-sm text-gray-500 py-4">Loading editor...</p>,
});

const isEditorEmpty = (html) => {
	if (!html || typeof html !== "string") return true;
	if (/<(img|iframe|video|audio)/i.test(html)) return false;
	const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
	return text.length === 0;
};

const formatDateForInput = (dateStr) => {
	if (!dateStr) return "";
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr.slice(0, 10);
		return d.toISOString().split("T")[0];
	} catch {
		return typeof dateStr === "string" ? dateStr.slice(0, 10) : "";
	}
};

export default function BlogForm({ handleCloseBlogModal, blogToEdit = null }) {
	const [formData, setFormData] = useState({
		blogTitle_en: "",
		blogTitle_ne: "",
		blogTitle_no: "",
		blogDesc_en: "",
		blogDesc_ne: "",
		blogDesc_no: "",
		blogMainPicture: null,
		blogSecondPicture: null,
		blogDate: new Date().toISOString().split("T")[0],
	});

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("en");

	// Load existing blog or initialize default
	useEffect(() => {
		if (blogToEdit) {
			setFormData({
				blogTitle_en: blogToEdit.blogTitle_en || "",
				blogTitle_ne: blogToEdit.blogTitle_ne || "",
				blogTitle_no: blogToEdit.blogTitle_no || "",
				blogDesc_en: blogToEdit.blogDesc_en || "",
				blogDesc_ne: blogToEdit.blogDesc_ne || "",
				blogDesc_no: blogToEdit.blogDesc_no || "",
				blogDate: formatDateForInput(blogToEdit.blogDate) || new Date().toISOString().split("T")[0],
				blogMainPicture: null,
				blogSecondPicture: null,
			});

			// If English is empty but another language has content, switch to that tab by default
			if (!blogToEdit.blogTitle_en && !blogToEdit.blogDesc_en) {
				if (blogToEdit.blogTitle_ne || blogToEdit.blogDesc_ne) {
					setActiveTab("ne");
				} else if (blogToEdit.blogTitle_no || blogToEdit.blogDesc_no) {
					setActiveTab("no");
				}
			}
		} else {
			setFormData({
				blogTitle_en: "",
				blogTitle_ne: "",
				blogTitle_no: "",
				blogDesc_en: "",
				blogDesc_ne: "",
				blogDesc_no: "",
				blogMainPicture: null,
				blogSecondPicture: null,
				blogDate: new Date().toISOString().split("T")[0],
			});
			setActiveTab("en");
		}
	}, [blogToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		try {
			if (!formData.blogDate) {
				throw new Error("Please select a blog date.");
			}

			if (!blogToEdit && !formData.blogMainPicture) {
				throw new Error("Please select a main image for the blog.");
			}

			const hasEnTitle = Boolean(formData.blogTitle_en?.trim());
			const hasEnDesc = !isEditorEmpty(formData.blogDesc_en);
			const hasNeTitle = Boolean(formData.blogTitle_ne?.trim());
			const hasNeDesc = !isEditorEmpty(formData.blogDesc_ne);
			const hasNoTitle = Boolean(formData.blogTitle_no?.trim());
			const hasNoDesc = !isEditorEmpty(formData.blogDesc_no);

			const hasEn = hasEnTitle && hasEnDesc;
			const hasNe = hasNeTitle && hasNeDesc;
			const hasNo = hasNoTitle && hasNoDesc;

			if (!hasEn && !hasNe && !hasNo) {
				if (hasEnTitle && !hasEnDesc) {
					throw new Error("Please provide English content for the English title.");
				}
				if (hasNeTitle && !hasNeDesc) {
					throw new Error("Please provide Nepali content for the Nepali title.");
				}
				if (hasNoTitle && !hasNoDesc) {
					throw new Error("Please provide Norwegian content for the Norwegian title.");
				}
				throw new Error("Please provide both a title and content in at least one language (English, Nepali, or Norwegian).");
			}

			const form = new FormData();

			form.append("blogTitle_en", formData.blogTitle_en?.trim() || "");
			form.append("blogTitle_ne", formData.blogTitle_ne?.trim() || "");
			form.append("blogTitle_no", formData.blogTitle_no?.trim() || "");
			form.append("blogDesc_en", !isEditorEmpty(formData.blogDesc_en) ? formData.blogDesc_en.trim() : "");
			form.append("blogDesc_ne", !isEditorEmpty(formData.blogDesc_ne) ? formData.blogDesc_ne.trim() : "");
			form.append("blogDesc_no", !isEditorEmpty(formData.blogDesc_no) ? formData.blogDesc_no.trim() : "");
			form.append("blogDate", formData.blogDate);

			if (formData.blogMainPicture instanceof File) {
				form.append("blogMainPicture", formData.blogMainPicture);
			}

			if (formData.blogSecondPicture instanceof File) {
				form.append("blogSecondPicture", formData.blogSecondPicture);
			}

			const url = blogToEdit ? `/api/blogs/${blogToEdit._id}` : "/api/blogs/create";

			const response = await fetch(url, {
				method: blogToEdit ? "PUT" : "POST",
				body: form,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to save blog");
			}

			alert(blogToEdit ? "Blog updated successfully!" : "Blog created successfully!");
			handleCloseBlogModal();
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	const hasEnFilled = Boolean(formData.blogTitle_en?.trim() || !isEditorEmpty(formData.blogDesc_en));
	const hasNeFilled = Boolean(formData.blogTitle_ne?.trim() || !isEditorEmpty(formData.blogDesc_ne));
	const hasNoFilled = Boolean(formData.blogTitle_no?.trim() || !isEditorEmpty(formData.blogDesc_no));

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			)}

			{/* Date Field */}
			<div className="space-y-2">
				<Label htmlFor="blogDate" className="text-sm font-medium text-gray-700">
					Blog Date <span className="text-red-500">*</span>
				</Label>
				<Input
					id="blogDate"
					type="date"
					value={formData.blogDate}
					onChange={(e) => setFormData({ ...formData, blogDate: e.target.value })}
					className="w-full"
					required
				/>
			</div>

			{/* Image Upload Fields */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="blogMainPicture" className="text-sm font-medium text-gray-700">
						Main Image {blogToEdit ? "(Leave blank to keep existing)" : <span className="text-red-500">*</span>}
					</Label>
					<Input
						id="blogMainPicture"
						type="file"
						accept="image/*"
						onChange={(e) => setFormData({ ...formData, blogMainPicture: e.target.files?.[0] || null })}
						className="w-full"
					/>
					{blogToEdit?.blogMainPicture && !formData.blogMainPicture && (
						<p className="text-xs text-gray-500 truncate">Current: {blogToEdit.blogMainPicture.split("/").pop()}</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="blogSecondPicture" className="text-sm font-medium text-gray-700">
						Secondary Image (Optional)
					</Label>
					<Input
						id="blogSecondPicture"
						type="file"
						accept="image/*"
						onChange={(e) => setFormData({ ...formData, blogSecondPicture: e.target.files?.[0] || null })}
						className="w-full"
					/>
					{blogToEdit?.blogSecondPicture && !formData.blogSecondPicture && (
						<p className="text-xs text-gray-500 truncate">Current: {blogToEdit.blogSecondPicture.split("/").pop()}</p>
					)}
				</div>
			</div>

			{/* Language Tabs */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Blog Content (Multi-language)</CardTitle>
					<CardDescription>
						Provide content in at least one language. You can write in English, Nepali, Norwegian, or any combination.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="en" className="flex items-center gap-1.5">
								English
								{hasEnFilled && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
							</TabsTrigger>
							<TabsTrigger value="ne" className="flex items-center gap-1.5">
								नेपाली
								{hasNeFilled && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
							</TabsTrigger>
							<TabsTrigger value="no" className="flex items-center gap-1.5">
								Norsk
								{hasNoFilled && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
							</TabsTrigger>
						</TabsList>
						
						{/* English Content */}
						<TabsContent value="en" className="space-y-4 pt-2">
							<div className="space-y-2">
								<Label htmlFor="title-en" className="text-sm font-medium text-gray-700">
									Title (English)
								</Label>
								<Input
									id="title-en"
									value={formData.blogTitle_en}
									onChange={(e) => setFormData((p) => ({ ...p, blogTitle_en: e.target.value }))}
									placeholder="Enter blog title in English"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700">
									Content (English)
								</Label>
								<Editor 
									value={formData.blogDesc_en} 
									onChange={(val) => setFormData((p) => ({ ...p, blogDesc_en: val }))} 
									placeholder="Write blog content in English..." 
								/>
							</div>
						</TabsContent>
						
						{/* Nepali Content */}
						<TabsContent value="ne" className="space-y-4 pt-2">
							<div className="space-y-2">
								<Label htmlFor="title-ne" className="text-sm font-medium text-gray-700">
									शीर्षक (नेपाली)
								</Label>
								<Input
									id="title-ne"
									value={formData.blogTitle_ne}
									onChange={(e) => setFormData((p) => ({ ...p, blogTitle_ne: e.target.value }))}
									placeholder="नेपालीमा ब्लग शीर्षक लेख्नुहोस्"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700">
									सामग्री (नेपाली)
								</Label>
								<Editor 
									value={formData.blogDesc_ne} 
									onChange={(val) => setFormData((p) => ({ ...p, blogDesc_ne: val }))} 
									placeholder="नेपालीमा ब्लग सामग्री लेख्नुहोस्..." 
								/>
							</div>
						</TabsContent>
						
						{/* Norwegian Content */}
						<TabsContent value="no" className="space-y-4 pt-2">
							<div className="space-y-2">
								<Label htmlFor="title-no" className="text-sm font-medium text-gray-700">
									Tittel (Norsk)
								</Label>
								<Input
									id="title-no"
									value={formData.blogTitle_no}
									onChange={(e) => setFormData((p) => ({ ...p, blogTitle_no: e.target.value }))}
									placeholder="Skriv bloggtittel på norsk"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700">
									Innhold (Norsk)
								</Label>
								<Editor 
									value={formData.blogDesc_no} 
									onChange={(val) => setFormData((p) => ({ ...p, blogDesc_no: val }))} 
									placeholder="Skriv blogginnhold på norsk..." 
								/>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Action Buttons */}
			<div className="flex justify-end space-x-4 pt-4">
				<Button 
					type="button" 
					variant="outline" 
					onClick={handleCloseBlogModal}
					disabled={submitting}
				>
					Cancel
				</Button>
				<Button 
					type="submit" 
					disabled={submitting}
					className="bg-brand hover:bg-red-700 text-white"
				>
					{submitting ? "Saving..." : blogToEdit ? "Update Blog" : "Create Blog"}
				</Button>
			</div>
		</form>
	);
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor"), {
	ssr: false,
	loading: () => <p>Loading editor...</p>,
});

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
		blogDate: "",
	});

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("en");

	// Load existing blog
	useEffect(() => {
		if (blogToEdit) {
			setFormData({
				blogTitle_en: blogToEdit.blogTitle_en || "",
				blogTitle_ne: blogToEdit.blogTitle_ne || "",
				blogTitle_no: blogToEdit.blogTitle_no || "",
				blogDesc_en: blogToEdit.blogDesc_en || "",
				blogDesc_ne: blogToEdit.blogDesc_ne || "",
				blogDesc_no: blogToEdit.blogDesc_no || "",
				blogDate: blogToEdit.blogDate || "",
				blogMainPicture: null,
				blogSecondPicture: null,
			});
		}
	}, [blogToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		try {
			const form = new FormData();

			Object.keys(formData).forEach((key) => {
				if (formData[key]) {
					form.append(key, formData[key]);
				}
			});

			const url = blogToEdit ? `/api/blogs/${blogToEdit._id}` : "/api/blogs/create";

			const response = await fetch(url, {
				method: blogToEdit ? "PUT" : "POST",
				body: form,
			});

			const result = await response.json();

			if (!response.ok) throw new Error(result.error);

			alert("Success!");
			handleCloseBlogModal();
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};


	const getDesc = () => {
		if (activeTab === "en") return formData.blogDesc_en;
		if (activeTab === "ne") return formData.blogDesc_ne;
		return formData.blogDesc_no;
	};

	const setDesc = (value) => {
		if (activeTab === "en") {
			setFormData((p) => ({ ...p, blogDesc_en: value }));
		} else if (activeTab === "ne") {
			setFormData((p) => ({ ...p, blogDesc_ne: value }));
		} else {
			setFormData((p) => ({ ...p, blogDesc_no: value }));
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{error}
				</div>
			)}

			{/* Date Field */}
			<div className="space-y-2">
				<Label htmlFor="blogDate" className="text-sm font-medium text-gray-700">
					Blog Date
				</Label>
				<Input
					id="blogDate"
					type="date"
					value={formData.blogDate}
					onChange={(e) => setFormData({ ...formData, blogDate: e.target.value })}
					className="w-full"
				/>
			</div>

			{/* Image Upload Fields */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="blogMainPicture" className="text-sm font-medium text-gray-700">
						Main Image
					</Label>
					<Input
						id="blogMainPicture"
						type="file"
						accept="image/*"
						onChange={(e) => setFormData({ ...formData, blogMainPicture: e.target.files[0] })}
						className="w-full"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="blogSecondPicture" className="text-sm font-medium text-gray-700">
						Secondary Image
					</Label>
					<Input
						id="blogSecondPicture"
						type="file"
						accept="image/*"
						onChange={(e) => setFormData({ ...formData, blogSecondPicture: e.target.files[0] })}
						className="w-full"
					/>
				</div>
			</div>

			{/* Language Tabs */}
			<Card>
				<CardHeader>
					<CardTitle>Blog Content (Multi-language)</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="en">English</TabsTrigger>
							<TabsTrigger value="ne">नेपाली</TabsTrigger>
							<TabsTrigger value="no">Norsk</TabsTrigger>
						</TabsList>
						
						<TabsContent value="en" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title-en" className="text-sm font-medium text-gray-700">
									Title (English)
								</Label>
								<Input
									id="title-en"
									value={formData.blogTitle_en}
									onChange={(e) => setFormData({ ...formData, blogTitle_en: e.target.value })}
									placeholder="Enter blog title in English"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700">
									Content (English)
								</Label>
								<Editor 
									value={getDesc()} 
									onChange={setDesc} 
									placeholder="Write blog content in English..." 
								/>
							</div>
						</TabsContent>
						
						<TabsContent value="ne" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title-ne" className="text-sm font-medium text-gray-700">
									शीर्षक (नेपाली)
								</Label>
								<Input
									id="title-ne"
									value={formData.blogTitle_ne}
									onChange={(e) => setFormData({ ...formData, blogTitle_ne: e.target.value })}
									placeholder="नेपालीमा ब्लग शीर्षक लेख्नुहोस्"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700">
									सामग्री (नेपाली)
								</Label>
								<Editor 
									value={getDesc()} 
									onChange={setDesc} 
									placeholder="नेपालीमा ब्लग सामग्री लेख्नुहोस्..." 
								/>
							</div>
						</TabsContent>
						
						<TabsContent value="no" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title-no" className="text-sm font-medium text-gray-700">
									Tittel (Norsk)
								</Label>
								<Input
									id="title-no"
									value={formData.blogTitle_no}
									onChange={(e) => setFormData({ ...formData, blogTitle_no: e.target.value })}
									placeholder="Skriv bloggtittel på norsk"
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700">
									Innhold (Norsk)
								</Label>
								<Editor 
									value={getDesc()} 
									onChange={setDesc} 
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

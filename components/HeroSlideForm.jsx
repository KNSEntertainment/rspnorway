"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Upload } from "lucide-react";
import Image from "next/image";

export default function HeroSlideForm({ slide, onClose, onSuccess }) {
	const [formData, setFormData] = useState({
		title: {
			en: slide?.title?.en || slide?.title || "",
			no: slide?.title?.no || "",
			ne: slide?.title?.ne || "",
		},
		description: {
			en: slide?.description?.en || slide?.description || "",
			no: slide?.description?.no || "",
			ne: slide?.description?.ne || "",
		},
		image: slide?.image || "",
		primaryLink: slide?.primaryLink || "",
		primaryButton: {
			en: slide?.primaryButton?.en || slide?.primaryButton || "",
			no: slide?.primaryButton?.no || "",
			ne: slide?.primaryButton?.ne || "",
		},
		secondaryLink: slide?.secondaryLink || "",
		secondaryButton: {
			en: slide?.secondaryButton?.en || slide?.secondaryButton || "",
			no: slide?.secondaryButton?.no || "",
			ne: slide?.secondaryButton?.ne || "",
		},
		isActive: slide?.isActive !== undefined ? slide.isActive : true,
		order: slide?.order || 0,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(slide?.image || "");
	const [uploadingImage, setUploadingImage] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		// Handle nested locale fields (e.g., "title.en", "description.no")
		if (name.includes('.')) {
			const [parentField, locale] = name.split('.');
			setFormData(prev => ({
				...prev,
				[parentField]: {
					...prev[parentField],
					[locale]: type === "checkbox" ? checked : value
				}
			}));
		} else {
			// Handle regular fields
			setFormData(prev => ({
				...prev,
				[name]: type === "checkbox" ? checked : value
			}));
		}
	};

	const handleImageUpload = async (file) => {
		if (!file) return;

		setUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', 'hero_slides');

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const result = await response.json();
			setImagePreview(result.url);
			setFormData(prev => ({
				...prev,
				image: result.url
			}));
		} catch (error) {
			console.error('Upload error:', error);
			setError('Failed to upload image');
		} finally {
			setUploadingImage(false);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Upload image if new file is selected
			let finalFormData = { ...formData };
			if (imageFile) {
				await handleImageUpload(imageFile);
				// Ensure the uploaded image URL is included
				finalFormData = {
					...formData,
					image: formData.image // This should be updated by handleImageUpload
				};
			}
			
			// Debug: Log what we're sending
			console.log("Submitting slide data:", finalFormData);

			const url = slide ? `/api/hero/${slide._id}` : "/api/hero";
			const method = slide ? "PUT" : "POST";
			
			let response;
			
			if (slide) {
				// Update existing slide
				response = await fetch(url, {
					method,
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(finalFormData),
				});
			} else {
				// Create new slide - need to get existing slides first
				const heroResponse = await fetch("/api/hero");
				const heroData = await heroResponse.json();
				const existingSlides = heroData.slides || [];
				
				// Add new slide with proper order
				const newSlide = {
					...finalFormData,
					order: existingSlides.length,
				};
				
				const updatedSlides = [...existingSlides, newSlide];
				
				response = await fetch("/api/hero", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ slides: updatedSlides }),
				});
			}

			if (!response.ok) {
				throw new Error(slide ? "Failed to update slide" : "Failed to create slide");
			}

			onSuccess();
		} catch (error) {
			console.error("Error saving slide:", error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>
							{slide ? "Edit Hero Slide" : "Create New Hero Slide"}
						</DialogTitle>
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Title Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Title *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="title.en">English *</Label>
								<Input
									id="title.en"
									name="title.en"
									value={formData.title.en}
									onChange={handleChange}
									required
									placeholder="Enter slide title (English)"
								/>
							</div>
							<div>
								<Label htmlFor="title.no">Norwegian *</Label>
								<Input
									id="title.no"
									name="title.no"
									value={formData.title.no}
									onChange={handleChange}
									required
									placeholder="Enter slide title (Norwegian)"
								/>
							</div>
							<div>
								<Label htmlFor="title.ne">Nepali *</Label>
								<Input
									id="title.ne"
									name="title.ne"
									value={formData.title.ne}
									onChange={handleChange}
									required
									placeholder="Enter slide title (Nepali)"
								/>
							</div>
						</div>
					</div>

					{/* Image Upload */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Hero Image *</Label>
						
						{/* Image Preview */}
						{imagePreview && (
							<div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
								<Image
									src={imagePreview}
									alt="Hero slide preview"
									fill
									className="object-cover"
								/>
								{imageFile && (
									<div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
										New Image
									</div>
								)}
							</div>
						)}

						{/* File Upload */}
						<div className="flex items-center justify-center w-full">
							<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="w-8 h-8 mb-4 text-gray-500" />
									<p className="mb-2 text-sm text-gray-500">
										<span className="font-semibold">Click to upload</span> or drag and drop
									</p>
									<p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
								</div>
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleFileChange}
									disabled={uploadingImage || loading}
								/>
							</label>
						</div>

						{uploadingImage && (
							<div className="text-center text-sm text-blue-600">
								Uploading image...
							</div>
						)}

						{/* Hidden field for form validation */}
						<input
							type="hidden"
							name="image"
							value={formData.image}
							onChange={handleChange}
							required
						/>
					</div>

					{/* Description Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Description *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="description.en">English *</Label>
								<Textarea
									id="description.en"
									name="description.en"
									value={formData.description.en}
									onChange={handleChange}
									required
									placeholder="Enter slide description (English)"
									rows={3}
								/>
							</div>
							<div>
								<Label htmlFor="description.no">Norwegian *</Label>
								<Textarea
									id="description.no"
									name="description.no"
									value={formData.description.no}
									onChange={handleChange}
									required
									placeholder="Enter slide description (Norwegian)"
									rows={3}
								/>
							</div>
							<div>
								<Label htmlFor="description.ne">Nepali *</Label>
								<Textarea
									id="description.ne"
									name="description.ne"
									value={formData.description.ne}
									onChange={handleChange}
									required
									placeholder="Enter slide description (Nepali)"
									rows={3}
								/>
							</div>
						</div>
					</div>

					{/* Primary Button Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Primary Button *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="primaryButton.en">English Text *</Label>
								<Input
									id="primaryButton.en"
									name="primaryButton.en"
									value={formData.primaryButton.en}
									onChange={handleChange}
									required
									placeholder="e.g., Become a Member"
								/>
							</div>
							<div>
								<Label htmlFor="primaryButton.no">Norwegian Text *</Label>
								<Input
									id="primaryButton.no"
									name="primaryButton.no"
									value={formData.primaryButton.no}
									onChange={handleChange}
									required
									placeholder="e.g., Bli Medlem"
								/>
							</div>
							<div>
								<Label htmlFor="primaryButton.ne">Nepali Text *</Label>
								<Input
									id="primaryButton.ne"
									name="primaryButton.ne"
									value={formData.primaryButton.ne}
									onChange={handleChange}
									required
									placeholder="e.g., \u0938\u0926\u0938\u094d\u092f \u092c\u0928\u094d\u0928\u0941\u0939\u094b\u0938\u094d"
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="primaryLink">Primary Button Link *</Label>
							<Input
								id="primaryLink"
								name="primaryLink"
								value={formData.primaryLink}
								onChange={handleChange}
								required
								placeholder="e.g., /membership"
							/>
						</div>
					</div>

					{/* Secondary Button Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Secondary Button *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="secondaryButton.en">English Text *</Label>
								<Input
									id="secondaryButton.en"
									name="secondaryButton.en"
									value={formData.secondaryButton.en}
									onChange={handleChange}
									required
									placeholder="e.g., Explore RSP"
								/>
							</div>
							<div>
								<Label htmlFor="secondaryButton.no">Norwegian Text *</Label>
								<Input
									id="secondaryButton.no"
									name="secondaryButton.no"
									value={formData.secondaryButton.no}
									onChange={handleChange}
									required
									placeholder="e.g., Utforsk RSP"
								/>
							</div>
							<div>
								<Label htmlFor="secondaryButton.ne">Nepali Text *</Label>
								<Input
									id="secondaryButton.ne"
									name="secondaryButton.ne"
									value={formData.secondaryButton.ne}
									onChange={handleChange}
									required
									placeholder="e.g., RSP \u0905\u0928\u0941\u0938\u0928\u094d\u0926\u0930\u094d\u0917 \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d"
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="secondaryLink">Secondary Button Link *</Label>
							<Input
								id="secondaryLink"
								name="secondaryLink"
								value={formData.secondaryLink}
								onChange={handleChange}
								required
								placeholder="e.g., /about-us"
							/>
						</div>
					</div>

					{slide && (
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="isActive"
								name="isActive"
								checked={formData.isActive}
								onChange={handleChange}
								className="rounded border-gray-300"
							/>
							<Label htmlFor="isActive">Active (show on website)</Label>
						</div>
					)}

					{error && (
						<div className="text-red-600 text-sm">{error}</div>
					)}

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : (slide ? "Update Slide" : "Create Slide")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

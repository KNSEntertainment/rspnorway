"use client";
import React, { useState } from "react";
import { X, Upload, Video as VideoIcon } from "lucide-react";
import Image from "next/image";

interface Video {
	_id?: string;
	title: string;
	category: string;
	duration?: string;
	description: string;
	creator: string;
	url?: string;
	thumbnail?: string;
}

interface VideoFormProps {
	videoToEdit?: Video;
	onClose: () => void;
}

export default function VideoForm({ videoToEdit, onClose }: VideoFormProps) {
	const [formData, setFormData] = useState({
		title: videoToEdit?.title || "",
		category: videoToEdit?.category || "",
		duration: videoToEdit?.duration || "",
		description: videoToEdit?.description || "",
		creator: videoToEdit?.creator || "RSP Norway",
	});
	const [videoFile, setVideoFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [videoPreview, setVideoPreview] = useState(videoToEdit?.url || "");
	const [thumbnailPreview, setThumbnailPreview] = useState(videoToEdit?.thumbnail || "");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setVideoFile(file);
			const url = URL.createObjectURL(file);
			setVideoPreview(url);
		}
	};

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
			const url = URL.createObjectURL(file);
			setThumbnailPreview(url);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const data = new FormData();
			data.append("title", formData.title);
			data.append("category", formData.category);
			data.append("duration", formData.duration);
			data.append("description", formData.description);
			data.append("creator", formData.creator);

			if (videoFile) {
				data.append("video", videoFile);
			}
			if (thumbnailFile) {
				data.append("thumbnail", thumbnailFile);
			}

			const url = videoToEdit ? `/api/videos/${videoToEdit._id}` : "/api/videos/create";
			const method = videoToEdit ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				body: data,
			});

			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to save video");
			}

			alert(videoToEdit ? "Video updated successfully!" : "Video uploaded successfully!");
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && <div className="mb-4 p-3 bg-error-100 border border-error-500 text-error-700 rounded">{error}</div>}

			{/* Video Upload */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">Video File {!videoToEdit && <span className="text-red-500">*</span>}</label>
				<div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand transition">
					<input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="video-upload" />
					<label htmlFor="video-upload" className="cursor-pointer">
						<VideoIcon size={48} className="mx-auto mb-2 text-neutral-400" />
						<p className="text-sm text-neutral-600">Click to upload video</p>
						<p className="text-xs text-neutral-400 mt-1">MP4, MOV, AVI (Max 100MB)</p>
					</label>
				</div>
				{videoPreview && (
					<div className="mt-3">
						<video src={videoPreview} controls className="w-full rounded-lg max-h-64" />
					</div>
				)}
			</div>

			{/* Thumbnail Upload */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">Thumbnail (Optional)</label>
				<div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-brand transition">
					<input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" id="thumbnail-upload" />
					<label htmlFor="thumbnail-upload" className="cursor-pointer">
						<Upload size={32} className="mx-auto mb-2 text-neutral-400" />
						<p className="text-xs text-neutral-600">Upload thumbnail image</p>
					</label>
				</div>
				{thumbnailPreview && (
					<div className="mt-3">
						<Image src={thumbnailPreview} alt="Thumbnail" width={400} height={200} className="w-full rounded-lg max-h-48 object-cover" />
					</div>
				)}
			</div>

			{/* Title */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">
					Title <span className="text-red-500">*</span>
				</label>
				<input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Enter video title" />
			</div>

			{/* Category */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">
					Category <span className="text-red-500">*</span>
				</label>
				<select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent">
					<option value="">Select category</option>
					<option value="Documentary">Documentary</option>
					<option value="Short Film">Short Film</option>
					<option value="Nature">Nature</option>
					<option value="Music Video">Music Video</option>
					<option value="Travel">Travel</option>
					<option value="Action">Action</option>
					<option value="Events">Events</option>
					<option value="Educational">Educational</option>
					<option value="Other">Other</option>
				</select>
			</div>

			{/* Duration */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">Duration (e.g., 2:45)</label>
				<input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="2:45" />
			</div>

			{/* Creator */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">Creator/Author</label>
				<input type="text" name="creator" value={formData.creator} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="RSP Norway" />
			</div>

			{/* Description */}
			<div>
				<label className="block text-sm font-medium text-neutral-700 mb-2">Description (Optional)</label>
				<textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent" placeholder="Enter video description..." />
			</div>

			{/* Buttons */}
			<div className="flex justify-end gap-3 pt-4 border-t">
				<button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50">
					Cancel
				</button>
				<button type="submit" disabled={loading || (!videoFile && !videoToEdit) || !formData.title || !formData.category} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? "Uploading..." : videoToEdit ? "Update Video" : "Upload Video"}
				</button>
			</div>
		</form>
	);
}

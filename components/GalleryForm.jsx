import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import useFetchData from "@/hooks/useFetchData";

export default function GalleryForm({ handleCloseGalleryModal, galleryToEdit }) {
	const [formData, setFormData] = useState({
		media: [],
		category: "",
		alt: "",
		classId: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const { data: classes } = useFetchData("/api/classes", "classes");

	useEffect(() => {
		if (galleryToEdit) {
			const normalizedClassId = galleryToEdit.classId?._id || galleryToEdit.classId || "";
			setFormData({
				media: [],
				category: galleryToEdit.category || galleryToEdit.classLabel || "",
				alt: galleryToEdit.alt || galleryToEdit.classLabel || galleryToEdit.category,
				classId: normalizedClassId ? normalizedClassId.toString() : "",
			});
		}
	}, [galleryToEdit]);

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		if (files.length > 6) {
			alert("You can only upload up to 6 images.");
			return;
		}
		setFormData({ ...formData, media: files });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			form.append("category", formData.category);
			form.append("alt", formData.category);
			if (formData.classId) {
				form.append("classId", formData.classId);
			}

			formData.media.forEach((file) => {
				form.append("media", file);
			});

			const url = galleryToEdit ? `/api/gallery/${galleryToEdit._id}` : "/api/gallery/create";
			const method = galleryToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${galleryToEdit ? "update" : "create"} gallery item`);
			}

			if (result.success) {
				setFormData({
					media: [],
					category: "",
					alt: "",
					classId: "",
				});
				alert(`Gallery item ${galleryToEdit ? "updated" : "created"} successfully!`);
				handleCloseGalleryModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${galleryToEdit ? "updating" : "creating"} gallery item:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

			<div>
				<label htmlFor="media" className="block mb-2 font-bold">
					Media Files (Max 6)
				</label>
				<input type="file" id="media" multiple onChange={handleFileChange} className="w-full p-2 border rounded" accept="image/*" required={!galleryToEdit} />
			</div>
			<div>
				<label htmlFor="category" className="block mb-2 font-bold">
					Enter Tag - meaningful category for images
				</label>
				<input type="text" id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded" placeholder="e.g. Field trip" required={!formData.classId} />
			</div>

			<div>
				<label htmlFor="class" className="block mb-2 font-bold">
					Assign Class (optional)
				</label>
				<select id="class" value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full p-2 border rounded">
					<option value="">No class tag</option>
					{Array.isArray(classes) &&
						classes.map((cls) => {
							const value = cls?._id?.toString ? cls._id.toString() : "";
							return (
								<option key={value || cls.name} value={value}>
									{cls.name}
								</option>
							);
						})}
				</select>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
					{submitting ? `${galleryToEdit ? "Updating" : "Creating"} Gallery Item...` : `${galleryToEdit ? "Update" : "Create"} Gallery Item`}
				</button>
				<Button variant="outline" onClick={handleCloseGalleryModal}>
					Close
				</Button>
			</div>
		</form>
	);
}

// import { Button } from "@/components/ui/button";
// import { useState, useEffect } from "react";

// export default function GalleryForm({ handleCloseGalleryModal, galleryToEdit }) {
// 	const [formData, setFormData] = useState({
// 		media: null,
// 		category: "",
// 		alt: "",
// 	});
// 	const [submitting, setSubmitting] = useState(false);
// 	const [error, setError] = useState("");

// 	useEffect(() => {
// 		if (galleryToEdit) {
// 			setFormData({
// 				media: null,
// 				category: galleryToEdit.category,
// 				alt: galleryToEdit.category,
// 			});
// 		}
// 	}, [galleryToEdit]);

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		setError("");
// 		setSubmitting(true);

// 		try {
// 			const form = new FormData();
// 			form.append("category", formData.category);
// 			form.append("alt", formData.category);
// 			if (formData.media) {
// 				form.append("media", formData.media);
// 			}

// 			const url = galleryToEdit ? `/api/gallery/${galleryToEdit._id}` : "/api/gallery/create";
// 			const method = galleryToEdit ? "PUT" : "POST";

// 			const response = await fetch(url, {
// 				method: method,
// 				body: form,
// 			});

// 			const result = await response.json();
// 			if (!response.ok) {
// 				throw new Error(result.error || `Failed to ${galleryToEdit ? "update" : "create"} gallery item`);
// 			}

// 			if (result.success) {
// 				setFormData({
// 					media: null,
// 					category: "",
// 					alt: "",
// 				});
// 				// Reset media input
// 				const mediaInput = document.getElementById("media");
// 				if (mediaInput) {
// 					mediaInput.value = "";
// 				}
// 				alert(`Gallery item ${galleryToEdit ? "updated" : "created"} successfully!`);
// 				handleCloseGalleryModal();
// 			}
// 		} catch (error) {
// 			setError(error.message);
// 			console.error(`Error ${galleryToEdit ? "updating" : "creating"} gallery item:`, error);
// 		} finally {
// 			setSubmitting(false);
// 		}
// 	};

// 	return (
// 		<form onSubmit={handleSubmit} className="space-y-4">
// 			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

// 			<div>
// 				<label htmlFor="media" className="block mb-2 font-bold">
// 					Media File
// 				</label>
// 				<input type="file" id="media" onChange={(e) => setFormData({ ...formData, media: e.target.files[0] })} className="w-full p-2 border rounded" accept="image/*" required={!galleryToEdit} />
// 			</div>
// 			<div>
// 				<label htmlFor="category" className="block mb-2 font-bold">
// 					Enter Tag - meaningful category for image/s
// 				</label>
// 				<input type="text" id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded" required />
// 			</div>
// 			{/* <div>
// 				<label htmlFor="alt" className="block mb-2 font-bold">
// 					Alt Text - repeat tag with lowercase
// 				</label>
// 				<input type="text" id="alt" value={formData.alt} onChange={(e) => setFormData({ ...formData, alt: e.target.value })} className="w-full p-2 border rounded" required />
// 			</div> */}
// 			<div className="grid grid-cols-2 gap-2">
// 				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
// 					{submitting ? `${galleryToEdit ? "Updating" : "Creating"} Gallery Item...` : `${galleryToEdit ? "Update" : "Create"} Gallery Item`}
// 				</button>
// 				<Button variant="outline" onClick={handleCloseGalleryModal}>
// 					Close
// 				</Button>
// 			</div>
// 		</form>
// 	);
// }

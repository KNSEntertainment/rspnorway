import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function TestimonialForm({ handleCloseTestimonialModal, testimonialToEdit = null }) {
	const [formData, setFormData] = useState({
		audiencename: "",
		audienceaddress: "",
		audiencetestimony: "",
		audienceimage: null,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (testimonialToEdit) {
			setFormData({
				...testimonialToEdit,
				audienceimage: null,
			});
		}
	}, [testimonialToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();

			Object.keys(formData).forEach((key) => {
				if (key !== "audienceimage" || (key === "audienceimage" && formData[key])) {
					form.append(key, formData[key]);
				}
			});

			const url = testimonialToEdit ? `/api/testimonials/${testimonialToEdit._id}` : "/api/testimonials/create";
			const method = testimonialToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${testimonialToEdit ? "update" : "create"} testimonial`);
			}

			if (result.success) {
				setFormData({
					audiencename: "",
					audienceaddress: "",
					audiencetestimony: "",
					audienceimage: null,
				});
				// Reset image input
				const audienceImageInput = document.getElementById("audienceimage");
				if (audienceImageInput) {
					audienceImageInput.value = "";
				}
				alert(`Testimonial ${testimonialToEdit ? "updated" : "created"} successfully!`);
				handleCloseTestimonialModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${testimonialToEdit ? "updating" : "creating"} testimonial:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
			<div>
				<label htmlFor="audiencename" className="block mb-2 font-bold">
					Name
				</label>
				<input type="text" id="audiencename" value={formData.audiencename} onChange={(e) => setFormData({ ...formData, audiencename: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="audienceaddress" className="block mb-2 font-bold">
					Address
				</label>
				<input type="text" id="audienceaddress" value={formData.audienceaddress} onChange={(e) => setFormData({ ...formData, audienceaddress: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="audiencetestimony" className="block mb-2 font-bold">
					Message
				</label>
				<textarea id="audiencetestimony" value={formData.audiencetestimony} onChange={(e) => setFormData({ ...formData, audiencetestimony: e.target.value })} className="w-full p-2 border rounded" rows="4" required></textarea>
			</div>
			<div>
				<label htmlFor="audienceimage" className="block mb-2 font-bold">
					Photo
				</label>
				<input type="file" id="audienceimage" onChange={(e) => setFormData({ ...formData, audienceimage: e.target.files[0] })} className="w-full p-2 border rounded" required />
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
					{submitting ? `${testimonialToEdit ? "Updating" : "Creating"} testimonial...` : `${testimonialToEdit ? "Update" : "Create"} testimonial`}
				</button>
				<Button variant="outline" onClick={handleCloseTestimonialModal}>
					Close
				</Button>
			</div>
		</form>
	);
}

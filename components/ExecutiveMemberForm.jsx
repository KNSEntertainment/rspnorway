import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function ExecutiveMemberForm({ handleCloseModal, memberToEdit = null }) {
	const [formData, setFormData] = useState({
		name: "",
		position: "",
		phone: "",
		email: "",
		order: 0,
		isActive: true,
		image: null,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (memberToEdit) {
			setFormData({
				name: memberToEdit.name || "",
				position: memberToEdit.position || "",
				phone: memberToEdit.phone || "",
				email: memberToEdit.email || "",
				order: memberToEdit.order || 0,
				isActive: memberToEdit.isActive !== undefined ? memberToEdit.isActive : true,
				image: null,
			});
		}
	}, [memberToEdit]);

	const handleChange = (e) => {
		const { name, value, type, checked, files } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			Object.keys(formData).forEach((key) => {
				if (formData[key] !== null && formData[key] !== undefined) {
					form.append(key, formData[key]);
				}
			});

			const url = memberToEdit ? `/api/executive-members/${memberToEdit._id}` : "/api/executive-members/create";
			const method = memberToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${memberToEdit ? "update" : "create"} member`);
			}

			if (result.success) {
				setFormData({
					name: "",
					position: "",
					phone: "",
					email: "",
					order: 0,
					isActive: true,
					image: null,
				});
				handleCloseModal();
				window.location.reload();
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					<p>{error}</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
						Full Name *
					</label>
					<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="John Doe" />
				</div>

				<div>
					<label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
						Position
					</label>
					<input type="text" id="position" name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="President" />
				</div>

				<div>
					<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
						Phone Number *
					</label>
					<input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="+47 123 45 678" />
				</div>

				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
						Email Address *
					</label>
					<input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="john@example.com" />
				</div>

				<div>
					<label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
						Display Order
					</label>
					<input type="number" id="order" name="order" value={formData.order} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="0" />
					<p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
				</div>

				<div>
					<label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
						Profile Picture
					</label>
					<input type="file" id="image" name="image" onChange={handleChange} accept="image/*" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" />
					{memberToEdit?.imageUrl && <p className="text-xs text-gray-500 mt-1">Current image exists. Upload new image to replace.</p>}
				</div>
			</div>

			<div className="flex items-center">
				<input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded" />
				<label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
					Active (Display on website)
				</label>
			</div>

			<div className="flex justify-end gap-3 pt-4 border-t">
				<Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting} className="bg-brand hover:bg-brand/90">
					{submitting ? (memberToEdit ? "Updating..." : "Creating...") : memberToEdit ? "Update Member" : "Add Member"}
				</Button>
			</div>
		</form>
	);
}

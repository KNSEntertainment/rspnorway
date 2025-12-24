import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function HeroForm({ handleCloseHeroModal, HeroToEdit = null }) {
	const [formData, setFormData] = useState({
		mainheading: "",
		subheading: "",
		heroimage: null,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (HeroToEdit) {
			setFormData({
				...HeroToEdit,
				heroimage: null,
			});
		}
	}, [HeroToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();

			Object.keys(formData).forEach((key) => {
				if (key !== "heroimage" || (key === "heroimage" && formData[key])) {
					form.append(key, formData[key]);
				}
			});

			const url = HeroToEdit ? `/api/Heros/${HeroToEdit._id}` : "/api/Heros/create";
			const method = HeroToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${HeroToEdit ? "update" : "create"} Hero Content`);
			}

			if (result.success) {
				setFormData({
					mainheading: "",
					subheading: "",
					heroimage: null,
				});
				// Reset image input
				const heroimageInput = document.getElementById("heroimage");
				if (heroimageInput) {
					heroimageInput.value = "";
				}
				alert(`Hero ${HeroToEdit ? "updated" : "created"} successfully!`);
				handleCloseHeroModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${HeroToEdit ? "updating" : "creating"} Hero:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
			<div>
				<label htmlFor="mainheading" className="block mb-2 font-bold">
					Main Heading
				</label>
				<input type="text" id="mainheading" value={formData.mainheading} onChange={(e) => setFormData({ ...formData, mainheading: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="subheading" className="block mb-2 font-bold">
					Sub Heading
				</label>
				<input type="text" id="subheading" value={formData.subheading} onChange={(e) => setFormData({ ...formData, subheading: e.target.value })} className="w-full p-2 border rounded" required />
			</div>

			<div>
				<label htmlFor="heroimage" className="block mb-2 font-bold">
					Background Image
				</label>
				<input type="file" id="heroimage" onChange={(e) => setFormData({ ...formData, heroimage: e.target.files[0] })} className="w-full p-2 border rounded" required />
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
					{submitting ? `${HeroToEdit ? "Updating" : "Creating"} Hero...` : `${HeroToEdit ? "Update" : "Create"} Hero`}
				</button>
				<Button variant="outline" onClick={handleCloseHeroModal}>
					Close
				</Button>
			</div>
		</form>
	);
}

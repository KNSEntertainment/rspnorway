import { useEffect, useState } from "react";

export default function ArtistForm({ handleCloseArtistModal, artistToEdit = null }) {
	const [formData, setFormData] = useState({
		name: "",
		genre: "",
		image: "",
		bio: "",
		totalsongs: null,
		rating: null,
		popularSongs: [],
		socialMedia: {
			facebook: "",
			instagram: "",
		},
		performanceCount: null,
		contact: "",
		featured: false,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (artistToEdit) {
			setFormData({
				...artistToEdit,
				image: null,
			});
		}
	}, [artistToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			// form.append("name", formData.name);
			// form.append("genre", formData.genre);
			// if (formData.image) {
			// 	form.append("image", formData.image);
			// }
			// form.append("bio", formData.bio);

			// if (formData.totalsongs !== null) {
			// 	form.append("totalsongs", formData.totalsongs);
			// }
			// if (formData.rating !== null) {
			// 	form.append("rating", formData.rating);
			// }

			// if (formData.popularSongs.length > 0) {
			// 	form.append("popularSongs", JSON.stringify(formData.popularSongs));
			// }

			// form.append("facebook", formData.socialMedia.facebook);
			// form.append("instagram", formData.socialMedia.instagram);

			// if (formData.performanceCount !== null) {
			// 	form.append("performanceCount", formData.performanceCount);
			// }

			// form.append("contact", formData.contact);
			// form.append("featured", formData.featured); // Boolean

			// console.log("form", form);
			// const response = await fetch("/api/artists/create", {
			// 	method: "POST",
			// 	body: form,
			// });

			Object.keys(formData).forEach((key) => {
				if (key !== "image" || (key === "image" && formData[key])) {
					form.append(key, formData[key]);
				}
			});

			const url = artistToEdit ? `/api/artists/${artistToEdit._id}` : "/api/artists/create";
			const method = artistToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			console.log("result", result);

			if (!response.ok) {
				throw new Error(result.error || `Failed to ${artistToEdit ? "update" : "create"} artist`);
			}

			if (result.success) {
				setFormData({
					name: "",
					genre: "",
					image: "",
					bio: "",
					totalsongs: null,
					rating: null,
					popularSongs: [],
					socialMedia: {
						facebook: "",
						instagram: "",
					},
					performanceCount: null,
					contact: "",
					featured: false,
				});
				// const image = document.getElementById("image");
				// if (image) {
				// 	image.value = "";
				// }
				alert(`Artist ${artistToEdit ? "updated" : "created"} successfully!`);
				handleCloseArtistModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${artistToEdit ? "updating" : "creating"} artist:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
			<div>
				<label htmlFor="name" className="block mb-2 font-bold">
					Artist Name
				</label>
				<input type="text" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="genre" className="block mb-2 font-bold">
					Genre
				</label>
				<input type="text" id="genre" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="image" className="block mb-2 font-bold">
					Artist Image
				</label>
				<input type="file" id="image" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="bio" className="block mb-2 font-bold">
					Bio
				</label>
				<textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="totalsongs" className="block mb-2 font-bold">
					Total Songs
				</label>
				<input type="number" id="totalsongs" value={formData.totalsongs || ""} onChange={(e) => setFormData({ ...formData, totalsongs: e.target.value })} className="w-full p-2 border rounded" />
			</div>
			<div>
				<label htmlFor="totalsongs" className="block mb-2 font-bold">
					Performance Count
				</label>
				<input type="number" id="performanceCount" value={formData.performanceCount || ""} onChange={(e) => setFormData({ ...formData, performanceCount: e.target.value })} className="w-full p-2 border rounded" />
			</div>
			<div>
				<label htmlFor="rating" className="block mb-2 font-bold">
					Rating (0 to 5)
				</label>
				<input type="number" id="rating" value={formData.rating || ""} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full p-2 border rounded" step="0.1" min="0" max="5" />
			</div>
			<div>
				<label htmlFor="facebook" className="block mb-2 font-bold">
					Facebook
				</label>
				<input
					type="url"
					id="facebook"
					value={formData?.socialMedia?.facebook}
					onChange={(e) =>
						setFormData({
							...formData,
							socialMedia: {
								...formData.socialMedia,
								facebook: e.target.value,
							},
						})
					}
					className="w-full p-2 border rounded"
				/>
			</div>
			<div>
				<label htmlFor="instagram" className="block mb-2 font-bold">
					Instagram
				</label>
				<input
					type="url"
					id="instagram"
					value={formData?.socialMedia?.instagram}
					onChange={(e) =>
						setFormData({
							...formData,
							socialMedia: {
								...formData.socialMedia,
								instagram: e.target.value,
							},
						})
					}
					className="w-full p-2 border rounded"
				/>
			</div>
			<div>
				<label htmlFor="contact" className="block mb-2 font-bold">
					Contact
				</label>
				<input type="text" id="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div className="flex items-center">
				<input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
				<label htmlFor="featured" className="ml-2">
					Featured
				</label>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
					{submitting ? `${artistToEdit ? "Updating" : "Creating"} Artist...` : `${artistToEdit ? "Update" : "Create"} Artist`}
				</button>
				<button type="button" onClick={handleCloseArtistModal} className="w-full p-1.5 rounded border text-red-600 font-bold hover:bg-gray-100">
					Close
				</button>
			</div>
		</form>
	);
}

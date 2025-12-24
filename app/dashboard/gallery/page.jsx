"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import GalleryForm from "@/components/GalleryForm";
import useFetchData from "@/hooks/useFetchData";

export default function GalleryPage() {
	const [openGalleryModal, setOpenGalleryModal] = useState(false);
	const [galleryToEdit, setGalleryToEdit] = useState(null);

	const { data: gallery, error, loading, mutate } = useFetchData("/api/gallery", "gallery");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleEdit = (item) => {
		setGalleryToEdit(item);
		setOpenGalleryModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this gallery item?")) {
			try {
				const response = await fetch(`/api/gallery/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete gallery item");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting gallery item:", error);
				alert("Failed to delete gallery item. Please try again.");
			}
		}
	};

	const handleCloseGalleryModal = () => {
		setOpenGalleryModal(false);
		setGalleryToEdit(null);
		mutate();
	};

	const handleCreateGallery = () => {
		setGalleryToEdit(null);
		setOpenGalleryModal(true);
	};

	return (
		<div className="max-w-3xl">
			<div className="text-right">
				<button onClick={handleCreateGallery} className="bg-red-800 text-slate-200 font-bold px-4 py-2 my-4">
					Create Gallery Item
				</button>
			</div>
			<div className=" bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Media</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Class</TableHead>
							<TableHead>Alt</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{gallery && gallery.length > 0 ? (
							gallery.map((item) => (
								<TableRow key={item._id}>
									<TableCell>
										<Image src={item?.media[0] || "/placeholder.jpg"} width={200} height={200} alt={item.alt || "Gallery item"} className="w-16 h-16 rounded-full object-cover" />{" "}
									</TableCell>
									<TableCell>{item?.category}</TableCell>
									<TableCell>{item?.classLabel || item?.classId?.name || "—"}</TableCell>
									<TableCell>{item?.alt}</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
												<Pencil className="w-6 h-6 text-blue-700" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
												<Trash2 className="w-6 h-6 text-red-700" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No gallery items found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{openGalleryModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-lg font-bold text-slate-200 bg-red-700 p-4 mb-6 text-center">{galleryToEdit ? "Edit Gallery Item" : "Create Gallery Item"}</h2>
						<GalleryForm handleCloseGalleryModal={handleCloseGalleryModal} galleryToEdit={galleryToEdit} />
					</div>
				</div>
			)}
		</div>
	);
}

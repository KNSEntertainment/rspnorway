"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import HeroForm from "@/components/HeroForm";

export default function HerosPage() {
	const [openHeroModal, setOpenHeroModal] = useState(false);
	const [HeroToEdit, setHeroToEdit] = useState(null);
	const { data: Heros, error, loading, mutate } = useFetchData("/api/Heros", "Heros");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleEdit = (Hero) => {
		setHeroToEdit(Hero);
		setOpenHeroModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this testimony?")) {
			try {
				const response = await fetch(`/api/Heros/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete testimony");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting testimony:", error);
				alert("Failed to delete testimony. Please try again.");
			}
		}
	};

	const handleCloseHeroModal = () => {
		setOpenHeroModal(false);
		setHeroToEdit(null);
		mutate();
	};

	const handleCreateHero = () => {
		setHeroToEdit(null);
		setOpenHeroModal(true);
	};

	return (
		<div className="max-w-4xl">
			<div className="text-right">
				<button onClick={handleCreateHero} className="bg-red-800 text-slate-200 font-bold px-4 py-2 my-4">
					Create Hero
				</button>
			</div>
			<div className=" bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Main Heading</TableHead>
							<TableHead>Sub Heading</TableHead>
							<TableHead>Background Image</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Heros.length > 0 ? (
							Heros.map((Hero) => (
								<TableRow key={Hero._id}>
									<TableCell className="w-96 font-semibold">{Hero.mainheading}</TableCell>
									<TableCell className="w-96">{Hero.subheading}</TableCell>
									<TableCell className="w-96">
										<Image src={Hero.heroimage || "/placeholder.jpg"} width={200} height={200} alt={Hero.audiencename || "alt"} className="w-96 h-48 object-cover" />
									</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(Hero)}>
												<Pencil className="w-6 h-6 text-blue-700" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(Hero._id)}>
												<Trash2 className="w-6 h-6 text-red-700" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No hero content defined yet. Please define one.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{openHeroModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white p-6 rounded-lg shadow-lg w-96">
						<h2 className="text-lg font-bold text-slate-200 bg-red-700 p-4 mb-6 text-center">{HeroToEdit ? "Edit Hero" : "Create Hero"}</h2>
						<HeroForm handleCloseHeroModal={handleCloseHeroModal} HeroToEdit={HeroToEdit} fetchHeros={Heros} />
					</div>
				</div>
			)}
		</div>
	);
}

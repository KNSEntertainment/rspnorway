"use client";

import React, { useMemo, useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus } from "lucide-react";
import RegisterForm from "@/components/RegisterForm";

export default function ParentsPage() {
	const [openModal, setOpenModal] = useState(false);
	const { data: users, error, loading, mutate } = useFetchData("/api/users", "users");

	const parents = useMemo(() => users.filter((u) => (u.role || "") === "parent"), [users]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleDelete = async (id) => {
		if (!id) return;
		const confirmed = window.confirm("Delete this parent account?");
		if (!confirmed) return;
		try {
			const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
			if (!response.ok) {
				throw new Error("Failed to delete parent");
			}
			await mutate();
		} catch (err) {
			console.error("Error deleting parent:", err);
			alert("Failed to delete parent. Please try again.");
		}
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		mutate();
	};

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-semibold text-slate-900">Parents</h1>
				<button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-red-800 text-slate-100 font-semibold px-4 py-2 rounded-md hover:bg-red-900 transition">
					<UserPlus className="w-4 h-4" />
					Add Parent
				</button>
			</div>

			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Username</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{parents.length > 0 ? (
							parents.map((parent) => (
								<TableRow key={parent._id}>
									<TableCell className="font-semibold">{parent.fullName || "-"}</TableCell>
									<TableCell>{parent.userName || "-"}</TableCell>
									<TableCell>{parent.email || "-"}</TableCell>
									<TableCell>
										<Button variant="ghost" size="icon" onClick={() => handleDelete(parent._id)}>
											<Trash2 className="w-5 h-5 text-red-700" />
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="text-center text-sm text-gray-600 py-6">
									No parents found. Use &quot;Add Parent&quot; to create one.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{openModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
					<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
						<h2 className="text-lg font-bold text-slate-200 bg-red-700 p-4 mb-6 text-center">Add Parent</h2>
						<RegisterForm handleCloseUserModal={handleCloseModal} />
					</div>
				</div>
			)}
		</div>
	);
}

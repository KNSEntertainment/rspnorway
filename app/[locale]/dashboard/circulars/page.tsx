"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import CircularForm from "@/components/CircularForm";

export default function CircularsPage() {
	const [circulars, setCirculars] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [selectedCircular, setSelectedCircular] = useState(null);

	const fetchCirculars = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/circulars");
			const data = await response.json();
			if (data.success) {
				setCirculars(data.circulars);
			}
		} catch (error) {
			console.error("Error fetching circulars:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCirculars();
	}, []);

	const handleEdit = (circular: any) => {
		setSelectedCircular(circular);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this circular?")) return;

		try {
			const response = await fetch(`/api/circulars/${id}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (data.success) {
				fetchCirculars();
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error("Error deleting circular:", error);
			alert("Failed to delete circular");
		}
	};

	const handleCloseForm = () => {
		setShowForm(false);
		setSelectedCircular(null);
	};

	const handleFormSuccess = () => {
		fetchCirculars();
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
			published: "default",
			draft: "secondary",
			archived: "outline",
		};
		return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-3xl">Circulars Management</CardTitle>
							<CardDescription className="mt-2">Create and manage circulars with multi-language support</CardDescription>
						</div>
						<Button onClick={() => setShowForm(true)} className="gap-2">
							<Plus className="h-4 w-4" />
							Add Circular
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-8">Loading circulars...</div>
					) : circulars.length === 0 ? (
						<div className="text-center py-8 text-gray-500">No circulars found. Click "Add Circular" to create your first circular.</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title (EN)</TableHead>
									<TableHead>Author (EN)</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Published Date</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{circulars.map((circular: any) => (
									<TableRow key={circular._id}>
										<TableCell className="font-medium">{circular.circularTitle?.en || "No title"}</TableCell>
										<TableCell>{circular.circularAuthor?.en || "N/A"}</TableCell>
										<TableCell>{getStatusBadge(circular.publicationStatus)}</TableCell>
										<TableCell>{circular.circularPublishedAt ? new Date(circular.circularPublishedAt).toLocaleDateString() : "Not set"}</TableCell>
										<TableCell>{new Date(circular.createdAt).toLocaleDateString()}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button variant="outline" size="sm" onClick={() => handleEdit(circular)} className="gap-1">
													<Pencil className="h-3 w-3" />
													Edit
												</Button>
												<Button variant="destructive" size="sm" onClick={() => handleDelete(circular._id)} className="gap-1">
													<Trash2 className="h-3 w-3" />
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{showForm && <CircularForm circular={selectedCircular} onClose={handleCloseForm} onSuccess={handleFormSuccess} />}
		</div>
	);
}

"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const emptyForm = { name: "", slug: "", description: "", room: "", homeroom: false, order: 0 };

export default function ClassesPage() {
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [form, setForm] = useState(emptyForm);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState(null);

	const fetchClasses = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/classes");
			const data = await res.json();
			if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to load classes");
			setClasses(data.classes || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClasses();
	}, []);

	const resetForm = () => {
		setForm(emptyForm);
		setEditingId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			const method = editingId ? "PUT" : "POST";
			const url = editingId ? `/api/classes/${editingId}` : "/api/classes";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...form, order: Number(form.order) || 0 }),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) throw new Error(data?.error || "Save failed");
			resetForm();
			fetchClasses();
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (cls) => {
		setEditingId(cls._id);
		setForm({
			name: cls.name || "",
			slug: cls.slug || "",
			description: cls.description || "",
			room: cls.room || "",
			homeroom: !!cls.homeroom,
			order: cls.order ?? 0,
		});
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this class?")) return;
		try {
			const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) throw new Error(data?.error || "Delete failed");
			fetchClasses();
		} catch (err) {
			alert(err.message);
		}
	};

	return (
		<div className="max-w-4xl space-y-6">
			<div className="bg-white p-4 rounded-lg shadow border border-gray-100">
				<h2 className="text-lg font-semibold mb-3">{editingId ? "Edit Class" : "Add Class"}</h2>
				{error && <div className="text-sm text-red-600 mb-2">{error}</div>}
				<form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
					<label className="space-y-1">
						<span className="text-sm font-medium text-gray-700">Name</span>
						<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded border border-gray-200 p-2" placeholder="Pre School" />
					</label>
					<label className="space-y-1">
						<span className="text-sm font-medium text-gray-700">Slug (optional)</span>
						<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded border border-gray-200 p-2" placeholder="pre-school" />
					</label>
					<label className="space-y-1">
						<span className="text-sm font-medium text-gray-700">Room</span>
						<input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full rounded border border-gray-200 p-2" placeholder="Room 101" />
					</label>
					<label className="space-y-1 flex items-center gap-2 pt-6">
						<input type="checkbox" checked={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.checked })} className="h-4 w-4 text-[#0094da] focus:ring-[#0094da] border-gray-300 rounded" />
						<span className="text-sm font-medium text-gray-700">Homeroom</span>
					</label>
					<label className="space-y-1 md:col-span-2">
						<span className="text-sm font-medium text-gray-700">Description (optional)</span>
						<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded border border-gray-200 p-2" rows={2} />
					</label>
					<label className="space-y-1">
						<span className="text-sm font-medium text-gray-700">Order</span>
						<input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full rounded border border-gray-200 p-2" />
					</label>
					<div className="flex items-center gap-2 md:col-span-2">
						<Button type="submit" disabled={submitting} className="bg-[#0094da] hover:bg-[#0094da] text-white">
							{submitting ? "Saving..." : editingId ? "Update" : "Create"}
						</Button>
						<Button type="button" variant="outline" onClick={resetForm}>
							Reset
						</Button>
					</div>
				</form>
			</div>

			<div className="bg-white rounded-lg shadow border border-gray-100">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Room</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Order</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5}>Loading...</TableCell>
							</TableRow>
						) : classes.length ? (
							classes.map((cls) => (
								<TableRow key={cls._id}>
									<TableCell>
										<div>
											<p className="font-medium text-gray-900">{cls.name}</p>
											<p className="text-xs text-gray-500 truncate max-w-[200px]">{cls.description}</p>
										</div>
									</TableCell>
									<TableCell>{cls.room || "-"}</TableCell>
									<TableCell>
										<span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${cls.homeroom ? "bg-[#0094da] text-[#0094da]" : "bg-gray-100 text-gray-600"}`}>{cls.homeroom ? "Homeroom" : "Subject"}</span>
									</TableCell>
									<TableCell>{cls.order}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(cls)}>
												<Pencil className="h-4 w-4 text-blue-700" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(cls._id)}>
												<Trash2 className="h-4 w-4 text-red-700" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center text-sm text-gray-600">
									No classes yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

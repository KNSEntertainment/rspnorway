"use client";

import React, { useMemo, useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ClassRoutinesPage() {
	const { data: classes, loading: classesLoading, error: classesError } = useFetchData("/api/classes", "classes");
	const { data: teachers, loading: teachersLoading, error: teachersError } = useFetchData("/api/teachers", "teachers");
	const { data: routines, loading: routinesLoading, error: routinesError, mutate } = useFetchData("/api/routines", "routines");

	const [draft, setDraft] = useState({ classId: "", teacherId: "", day: days[0], subject: "", startTime: "08:00", endTime: "09:00", room: "" });
	const loading = classesLoading || teachersLoading || routinesLoading;
	const error = classesError || teachersError || routinesError;

	const classOptions = useMemo(() => (Array.isArray(classes) ? classes : []), [classes]);
	const teacherOptions = useMemo(() => (Array.isArray(teachers) ? teachers.map((t) => ({ id: t._id || t.id, name: `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || "Teacher" })) : []), [teachers]);

	const grouped = useMemo(() => {
		const byClass = {};
		(routines || []).forEach((r) => {
			const key = r.classId || "uncategorized";
			if (!byClass[key]) byClass[key] = [];
			byClass[key].push(r);
		});
		return byClass;
	}, [routines]);

	const handleAdd = (e) => {
		e?.preventDefault?.();
		if (!draft.classId || !draft.teacherId || !draft.subject?.trim()) return;
		const payload = {
			classId: draft.classId,
			teacherId: draft.teacherId,
			day: draft.day,
			subject: draft.subject.trim(),
			startTime: draft.startTime,
			endTime: draft.endTime,
			room: draft.room.trim() || undefined,
		};
		fetch("/api/routines", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
			.then((res) => res.json())
			.then((data) => {
				if (!data?.success) throw new Error(data?.error || "Failed to save routine");
				mutate();
				setDraft((prev) => ({ ...prev, subject: "", startTime: "08:00", endTime: "09:00", room: "" }));
			})
			.catch((err) => {
				console.error(err);
				alert(err.message || "Failed to save routine");
			});
	};

	const handleDelete = async (id) => {
		if (!id) return;
		const confirmed = window.confirm("Delete this routine block?");
		if (!confirmed) return;
		try {
			const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
			const data = await res.json();
			if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to delete routine");
			mutate();
		} catch (err) {
			console.error(err);
			alert(err.message || "Failed to delete routine");
		}
	};

	const resolveClassName = (classId) => classOptions.find((c) => String(c._id || c.id) === String(classId))?.name || "Class";
	const resolveTeacherName = (teacherId) => teacherOptions.find((t) => String(t.id) === String(teacherId))?.name || "Teacher";

	return (
		<div className="space-y-6 max-w-6xl">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-slate-500">Create and manage class routines. Saved routines feed teacher/parent dashboards.</p>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-4 border border-gray-100">
				<h2 className="text-lg font-semibold text-slate-900 mb-4">Add routine block</h2>
				{loading && <p className="text-sm text-gray-600">Loading classes and teachers…</p>}
				{error && <p className="text-sm text-red-600">{error}</p>}
				<form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleAdd}>
					<div className="space-y-1">
						<label className="text-sm text-slate-700">Class</label>
						<Select value={draft.classId} onValueChange={(val) => setDraft((prev) => ({ ...prev, classId: val }))}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select class" />
							</SelectTrigger>
							<SelectContent>
								{classOptions.map((cls) => (
									<SelectItem key={cls._id || cls.id} value={String(cls._id || cls.id)}>
										{cls.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<label className="text-sm text-slate-700">Teacher</label>
						<Select value={draft.teacherId} onValueChange={(val) => setDraft((prev) => ({ ...prev, teacherId: val }))}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Assign teacher" />
							</SelectTrigger>
							<SelectContent>
								{teacherOptions.map((t) => (
									<SelectItem key={t.id} value={String(t.id)}>
										{t.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<label className="text-sm text-slate-700">Day</label>
						<Select value={draft.day} onValueChange={(val) => setDraft((prev) => ({ ...prev, day: val }))}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{days.map((d) => (
									<SelectItem key={d} value={d}>
										{d}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<label className="text-sm text-slate-700">Subject</label>
						<Input value={draft.subject} onChange={(e) => setDraft((prev) => ({ ...prev, subject: e.target.value }))} placeholder="e.g., Mathematics" />
					</div>

					<div className="space-y-1">
						<label className="text-sm text-slate-700">Start</label>
						<Input type="time" value={draft.startTime} onChange={(e) => setDraft((prev) => ({ ...prev, startTime: e.target.value }))} />
					</div>

					<div className="space-y-1">
						<label className="text-sm text-slate-700">End</label>
						<Input type="time" value={draft.endTime} onChange={(e) => setDraft((prev) => ({ ...prev, endTime: e.target.value }))} />
					</div>

					<div className="space-y-1">
						<label className="text-sm text-slate-700">Room / Location (optional)</label>
						<Input value={draft.room} onChange={(e) => setDraft((prev) => ({ ...prev, room: e.target.value }))} placeholder="e.g., Room 201" />
					</div>

					<div className="flex items-end">
						<Button type="submit" className="w-full md:w-auto">
							Add block
						</Button>
					</div>
				</form>
			</div>

			<div className="space-y-4">
				{Object.keys(grouped).length === 0 ? (
					<p className="text-sm text-gray-600">No routine blocks yet. Add a block to preview a class timetable.</p>
				) : (
					Object.entries(grouped).map(([classId, items]) => (
						<div key={classId} className="bg-white rounded-lg shadow border border-gray-100">
							<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
								<h3 className="text-base font-semibold text-slate-900">{resolveClassName(classId)}</h3>
								<p className="text-xs text-slate-500">Draft view — wire API to persist.</p>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Day</TableHead>
										<TableHead>Time</TableHead>
										<TableHead>Subject</TableHead>
										<TableHead>Teacher</TableHead>
										<TableHead>Room</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{items
										.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
										.map((r) => (
											<TableRow key={r._id || r.id}>
												<TableCell>{r.day}</TableCell>
												<TableCell>
													{r.startTime} – {r.endTime}
												</TableCell>
												<TableCell>{r.subject}</TableCell>
												<TableCell>{resolveTeacherName(r.teacherId)}</TableCell>
												<TableCell>{r.room || ""}</TableCell>
												<TableCell className="w-16 text-right">
													<Button variant="ghost" size="icon" onClick={() => handleDelete(r._id || r.id)}>
														<Trash2 className="w-4 h-4 text-red-600" />
													</Button>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</div>
					))
				)}
			</div>
		</div>
	);
}

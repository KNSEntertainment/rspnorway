"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, MessageSquare, Loader2 } from "lucide-react";

interface Student {
	_id?: string;
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	classGroup?: string;
}

interface Teacher {
	_id: string;
	firstName: string;
	lastName: string;
	subjects?: string[];
	classIds?: (string | { name: string })[];
}

interface AppointmentModalProps {
	isOpen: boolean;
	onClose: (refresh?: boolean) => void;
	students: Student[];
	preSelectedStudentId?: string;
}

export default function AppointmentModal({ isOpen, onClose, students = [], preSelectedStudentId }: AppointmentModalProps) {
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [selectedStudentId, setSelectedStudentId] = useState(preSelectedStudentId || "");

	// Form state
	const [formData, setFormData] = useState({
		teacherId: "",
		date: "",
		time: "",
		topic: "",
	});

	useEffect(() => {
		if (isOpen) {
			fetchTeachers();
			if (preSelectedStudentId) {
				setSelectedStudentId(preSelectedStudentId);
			} else if (students.length > 0) {
				// Default to first student if none selected
				const firstId = students[0]._id || students[0].id;
				if (firstId) setSelectedStudentId(firstId);
			}
		}
	}, [isOpen, preSelectedStudentId, students]);

	const fetchTeachers = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/teachers");
			const data = await res.json();
			if (data.success) {
				setTeachers(data.teachers);
			} else {
				setError("Failed to load teachers");
			}
		} catch {
			setError("Failed to load teachers");
		} finally {
			setLoading(false);
		}
	};

	const selectedStudent = useMemo(() => {
		return students.find((s) => (s._id || s.id) === selectedStudentId);
	}, [students, selectedStudentId]);

	const filteredTeachers = useMemo(() => {
		if (!selectedStudent || !teachers.length) return [];
		const studentClass = (selectedStudent.classGroup || "").trim().toLowerCase();

		return teachers.filter((t) => {
			if (!t.classIds || !Array.isArray(t.classIds)) return false;
			// Check if any of the teacher's classes match the student's class
			return t.classIds.some((c) => {
				const className = typeof c === "string" ? c : (c as { name: string }).name || "";
				return className.trim().toLowerCase() === studentClass;
			});
		});
	}, [selectedStudent, teachers]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		try {
			const res = await fetch("/api/appointments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					studentId: selectedStudentId,
					teacherId: formData.teacherId,
					date: formData.date,
					time: formData.time,
					topic: formData.topic,
				}),
			});
			const data = await res.json();
			if (data.success) {
				onClose(true); // true indicates success/refresh needed
			} else {
				setError(data.error || "Failed to book appointment");
			}
		} catch {
			setError("An error occurred. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
				<div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
					<h2 className="text-lg font-semibold text-gray-900">Book Appointment</h2>
					<button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				<div className="p-6">
					{error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Student Selection */}
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700">For Child</label>
							<select className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0094da]" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={submitting}>
								{students.map((s) => (
									<option key={s._id || s.id} value={s._id || s.id}>
										{s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim()} ({s.classGroup || "No Class"})
									</option>
								))}
							</select>
						</div>

						{/* Teacher Selection */}
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700">Select Teacher</label>
							{loading ? (
								<div className="text-sm text-gray-400 py-2">Loading teachers...</div>
							) : filteredTeachers.length === 0 ? (
								<div className="text-sm text-amber-600 py-2 bg-amber-50 px-3 rounded-lg border border-amber-100">
									No teachers found for {selectedStudent?.firstName || "this student"}&apos;s class ({selectedStudent?.classGroup || "unassigned"}).
								</div>
							) : (
								<select className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0094da]" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} required disabled={filteredTeachers.length === 0}>
									<option value="">Choose a teacher...</option>
									{filteredTeachers.map((t) => (
										<option key={t._id} value={t._id}>
											{t.firstName} {t.lastName} ({t.subjects?.join(", ")})
										</option>
									))}
								</select>
							)}
						</div>

						{/* Date & Time */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<label className="text-sm font-medium text-gray-700">Date</label>
								<div className="relative">
									<Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
									<input type="date" className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0094da]" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split("T")[0]} required />
								</div>
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium text-gray-700">Time</label>
								<div className="relative">
									<Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
									<input type="time" className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0094da]" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
								</div>
							</div>
						</div>

						{/* Topic */}
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700">Topic</label>
							<div className="relative">
								<MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
								<input type="text" className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0094da]" placeholder="e.g. Math progress, Behavioral check-in" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} required />
							</div>
						</div>

						<div className="pt-4">
							<button type="submit" disabled={submitting || filteredTeachers.length === 0} className="w-full h-12 bg-[#0094da] hover:bg-[#0094da] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition">
								{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Appointment"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

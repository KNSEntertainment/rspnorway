"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

function formatDate(value?: string) {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleDateString();
}

export default function StudentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;
	const [student, setStudent] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");
	const [admitting, setAdmitting] = useState(false);

	useEffect(() => {
		let ignore = false;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/students?id=${id}`);
				const data = await res.json();
				if (!res.ok || !data?.success) {
					throw new Error(data?.error || "Failed to load student");
				}
				if (!ignore) setStudent(data.student || null);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load student";
				setError(message);
				toast({ title: "Load failed", description: message });
			} finally {
				if (!ignore) setLoading(false);
			}
		};
		if (id) load();
		return () => {
			ignore = true;
		};
	}, [id]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900">Student detail</h1>
					<p className="text-sm text-gray-500">Record for {student ? `${student.firstName} ${student.lastName}` : "..."}</p>
				</div>
				<button className="text-sm font-semibold text-gray-600" onClick={() => router.back()}>
					← Back
				</button>
			</div>

			{loading ? (
				<div className="rounded-lg border border-gray-200 bg-white p-4 text-gray-600">Loading…</div>
			) : error ? (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
			) : !student ? (
				<div className="rounded-lg border border-gray-200 bg-white p-4 text-gray-600">Student not found.</div>
			) : (
				<div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
					{/* Header Card */}
					<div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-[#0094da] to-blue-50 p-6 border-b border-gray-100">
						<div className="flex-shrink-0">
							{student.photoUrl ? (
								<img src={student.photoUrl} alt="Student photo" className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" style={{ background: "#f3f4f6" }} />
							) : (
								<div className="h-32 w-32 rounded-full flex items-center justify-center bg-gray-100 border-4 border-white text-gray-400 text-4xl font-bold shadow-lg">
									<span>{student.firstName?.[0] || "?"}</span>
								</div>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-2">
								<h2 className="text-2xl font-bold text-gray-900 truncate">
									{student.firstName} {student.lastName}
								</h2>
								{student.status && <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${student.status === "active" ? "bg-[#0094da] text-[#0094da]" : student.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span>}
							</div>
							<div className="text-gray-600 text-sm mb-1">
								Class: <span className="font-medium text-gray-800">{student.classGroup || "-"}</span>
							</div>
							<div className="text-gray-600 text-sm">
								Enrolled: <span className="font-medium text-gray-800">{formatDate(student.enrollmentDate)}</span>
							</div>
						</div>
					</div>
					{/* Info Grid */}
					<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-white">
						<div>
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</h3>
							<p className="text-gray-900 font-medium">{formatDate(student.dob)}</p>
						</div>
						<div>
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Guardian</h3>
							<p className="text-gray-900 font-medium">{student.guardianName || "-"}</p>
						</div>
						<div>
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Contacts</h3>
							<div className="text-gray-800 text-sm space-y-1">
								{student.guardianPhone && <div>📞 {student.guardianPhone}</div>}
								{student.guardianEmail && <div>✉️ {student.guardianEmail}</div>}
								<div>Emergency: {student.emergencyContact || "-"}</div>
							</div>
						</div>
						<div>
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Transport</h3>
							<p className="text-gray-900 font-medium">{student.transportRoute || "-"}</p>
						</div>
						<div>
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Pickup Person</h3>
							<p className="text-gray-900 font-medium">{student.pickupPerson || "-"}</p>
						</div>
						<div>
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Allergies</h3>
							<p className="text-gray-900 font-medium">{student.allergies || "None"}</p>
						</div>
						<div className="md:col-span-2">
							<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Medical Notes</h3>
							<p className="text-gray-900 font-medium">{student.medicalNotes || "None"}</p>
						</div>
					</div>
					{/* Actions */}
					<div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
						<Link href={`/dashboard/students?id=${id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition">
							Edit
						</Link>
						{student.status === "pending" && (
							<button
								className="rounded-lg bg-[#0094da] px-4 py-2 text-white font-semibold hover:bg-[#0094da] disabled:opacity-50"
								disabled={admitting}
								onClick={async () => {
									setAdmitting(true);
									try {
										if (!student) throw new Error("Student data not loaded");
										const updatedStudent = { ...student, status: "active" };
										const res = await fetch("/api/students", {
											method: "PUT",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ id, student: updatedStudent }),
										});
										const data = await res.json();
										if (!res.ok || !data?.success) {
											throw new Error(data?.error || "Failed to admit student");
										}
										toast({ title: "Student admitted", description: "Status updated to active." });
										// Redirect to students list after admit
										router.push("/dashboard/students");
									} catch (err) {
										const message = err instanceof Error ? err.message : "Failed to admit student";
										toast({ title: "Admit failed", description: message });
									} finally {
										setAdmitting(false);
									}
								}}
							>
								{admitting ? "Admitting..." : "Admit Now"}
							</button>
						)}
					</div>
					{/* (Removed duplicate action buttons and extra closing div) */}
				</div>
			)}
		</div>
	);
}

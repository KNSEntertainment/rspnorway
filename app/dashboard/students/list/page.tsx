"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

const columns = [
	{ key: "name", label: "Student" },
	{ key: "classGroup", label: "Class" },
	{ key: "enrollmentDate", label: "Enrolled" },
	{ key: "guardian", label: "Guardian" },
	{ key: "contacts", label: "Contacts" },
	{ key: "transportRoute", label: "Transport" },
];

function formatDate(value?: string) {
	if (!value) return "-";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleDateString();
}

export default function StudentsListPage() {
	const [students, setStudents] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [search, setSearch] = useState("");
	const [classFilter, setClassFilter] = useState("");

	// Get status filter from query params
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			setStatusFilter(params.get("status"));
		}
	}, []);

	useEffect(() => {
		let ignore = false;
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch("/api/students");
				const data = await res.json();
				if (!res.ok || !data?.success) {
					throw new Error(data?.error || "Failed to load students");
				}
				let filtered = data.students || [];
				if (statusFilter) {
					filtered = filtered.filter((s: any) => s.status === statusFilter);
				} else {
					filtered = filtered.filter((s: any) => s.status === "active");
				}
				if (!ignore) setStudents(filtered);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load students";
				setError(message);
				toast({ title: "Load failed", description: message });
			} finally {
				if (!ignore) setLoading(false);
			}
		};
		load();
		return () => {
			ignore = true;
		};
	}, [statusFilter]);

	const filtered = useMemo(() => {
		return students.filter((s) => {
			const matchesSearch = `${s.firstName} ${s.lastName} ${s.guardianName} ${s.guardianEmail} ${s.guardianPhone}`.toLowerCase().includes(search.toLowerCase());
			const matchesClass = classFilter ? s.classGroup?.toLowerCase() === classFilter.toLowerCase() : true;
			return matchesSearch && matchesClass;
		});
	}, [students, search, classFilter]);

	const exportRows = useMemo<Record<string, string>[]>(
		() =>
			filtered.map((s) => ({
				Student: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
				Class: s.classGroup || "",
				"Enrollment Date": formatDate(s.enrollmentDate),
				Guardian: s.guardianName || "",
				Contacts: [s.guardianPhone, s.guardianEmail].filter(Boolean).join(" | "),
				Transport: s.transportRoute || "",
				Allergies: s.allergies || "None",
				"Medical Notes": s.medicalNotes || "None",
			})),
		[filtered]
	);

	const handleExportExcel = async () => {
		try {
			const XLSX = await import("xlsx");
			const sheet = XLSX.utils.json_to_sheet(exportRows);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, sheet, "Students");
			XLSX.writeFile(wb, "students.xlsx");
		} catch {
			toast({ title: "Export failed", description: "Could not generate Excel." });
		}
	};

	const handlePrint = () => {
		const filterLabel = classFilter ? classFilter : "All classes";
		const html = `
			<html>
			<head>
				<title>Students</title>
				<style>
					body { font-family: Arial, sans-serif; padding: 16px; }
					table { width: 100%; border-collapse: collapse; }
					th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
					th { background: #f3f4f6; text-align: left; }
				</style>
			</head>
			<body>
				<div style="text-align: center; margin-bottom: 12px;">
					<h1 style="margin: 0; font-size: 18px;">RSP Norway School</h1>
					<div style="margin: 0 0 4px 0; font-size: 12px; color: #4b5563;">Kathmandu, Nepal</div>
					<h2 style="margin: 8px 0 2px 0; font-size: 16px;">Student List</h2>
					<div style="margin: 0; font-size: 12px; color: #4b5563;">Filter: ${filterLabel}</div>
				</div>
				<table>
					<thead>
						<tr>${Object.keys(exportRows[0] || {})
							.map((h) => `<th>${h}</th>`)
							.join("")}</tr>
					</thead>
					<tbody>
						${exportRows
							.map(
								(row) =>
									`<tr>${Object.keys(row)
										.map((h) => `<td>${row[h] || ""}</td>`)
										.join("")}</tr>`
							)
							.join("")}
					</tbody>
				</table>
			</body>
			</html>`;
		const w = window.open("", "printwin");
		if (!w) return;
		w.document.write(html);
		w.document.close();
		w.focus();
		w.print();
		w.close();
	};

	const classOptions = useMemo(() => {
		const set = new Set<string>();
		students.forEach((s) => {
			if (s.classGroup) set.add(s.classGroup);
		});
		return Array.from(set).sort();
	}, [students]);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold text-gray-900">Students</h1>
					<p className="text-sm text-gray-500">Search, filter, and browse enrolled students.</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button onClick={handleExportExcel} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50">
						Export Excel
					</button>
					<button onClick={handlePrint} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50">
						Print
					</button>
					<Link href="/dashboard/students" className="rounded-lg bg-[#0094da] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0094da]">
						+ Add students
					</Link>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<div className="sm:col-span-2">
					<label className="text-sm font-semibold text-gray-800">Search</label>
					<input className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" placeholder="Search by name or guardian" value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div>
					<label className="text-sm font-semibold text-gray-800">Class</label>
					<select className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
						<option value="">All classes</option>
						{classOptions.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-gray-200 text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							{columns.map((col) => (
								<th key={col.key} scope="col" className="px-4 py-3 font-semibold text-gray-700">
									{col.label}
								</th>
							))}
							<th className="px-4 py-3 font-semibold text-gray-700 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 bg-white">
						{loading ? (
							<tr>
								<td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-500">
									Loading students…
								</td>
							</tr>
						) : filtered.length === 0 ? (
							<tr>
								<td colSpan={columns.length + 1} className="px-4 py-10 text-center text-gray-500">
									{error ? error : "No students found."}
								</td>
							</tr>
						) : (
							filtered.map((s) => (
								<tr key={s._id} className="hover:bg-gray-50">
									<td className="px-4 py-3 font-semibold text-gray-900">
										{s.firstName} {s.lastName}
									</td>
									<td className="px-4 py-3 text-gray-700">{s.classGroup || "-"}</td>
									<td className="px-4 py-3 text-gray-700">{formatDate(s.enrollmentDate)}</td>
									<td className="px-4 py-3 text-gray-700">{s.guardianName || "-"}</td>
									<td className="px-4 py-3 text-gray-700">
										<div className="space-y-1 text-xs text-gray-700">
											{s.guardianPhone ? <div>📞 {s.guardianPhone}</div> : null}
											{s.guardianEmail ? <div>✉️ {s.guardianEmail}</div> : null}
										</div>
									</td>
									<td className="px-4 py-3 text-gray-700">{s.transportRoute || "-"}</td>
									<td className="px-4 py-3 text-right text-sm font-semibold text-[#0094da]">
										<Link href={`/dashboard/students/${s._id}`}>View</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

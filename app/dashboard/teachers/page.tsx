"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]";
const labelClass = "text-sm font-semibold text-gray-800";
const sectionCardClass = "rounded-xl border border-gray-100 bg-white shadow-sm p-5";

const requiredFields = ["firstName", "lastName", "email", "phone", "employeeId", "designation"] as const;

type TeacherForm = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	employeeId: string;
	designation: string;
	subjects: string;
	classIds: string[];
	yearsOfExperience: string;
	qualifications: string;
	bio: string;
	address: string;
	dateOfBirth: string;
	hireDate: string;
	emergencyContactName: string;
	emergencyContactPhone: string;
	status: string;
	avatarUrl: string;
};

const emptyForm: TeacherForm = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	employeeId: "",
	designation: "",
	subjects: "",
	classIds: [],
	yearsOfExperience: "",
	qualifications: "",
	bio: "",
	address: "",
	dateOfBirth: "",
	hireDate: "",
	emergencyContactName: "",
	emergencyContactPhone: "",
	status: "pending",
	avatarUrl: "",
};

export default function TeachersAdminPage() {
	const router = useRouter();
	const [form, setForm] = useState<TeacherForm>(emptyForm);
	const [saving, setSaving] = useState(false);
	const [teachers, setTeachers] = useState<any[]>([]);
	const [classes, setClasses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");

	const canSubmit = useMemo(() => requiredFields.every((f) => form[f]), [form]);

	useEffect(() => {
		let ignore = false;
		(async () => {
			try {
				setError("");
				const [teacherRes, classRes] = await Promise.all([fetch("/api/teachers"), fetch("/api/classes")]);
				const teacherData = await teacherRes.json();
				const classData = await classRes.json();
				if (!ignore) {
					if (!teacherRes.ok || !teacherData?.success) {
						throw new Error(teacherData?.error || "Failed to load teachers");
					}
					if (!classRes.ok || !classData?.success) {
						throw new Error(classData?.error || "Failed to load classes");
					}
					setTeachers(teacherData.teachers || []);
					setClasses(classData.classes || []);
					// Auto-generate next Employee ID
					const empIds = (teacherData.teachers || []).map((t: any) => t.employeeId).filter((id: string) => /^EMP-\d{3}$/.test(id));
					let maxNum = 0;
					empIds.forEach((id: string) => {
						const num = parseInt(id.replace("EMP-", ""), 10);
						if (!isNaN(num) && num > maxNum) maxNum = num;
					});
					const nextId = `EMP-${String(maxNum + 1).padStart(3, "0")}`;
					setForm((prev) => ({ ...prev, employeeId: nextId }));
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load data";
				if (!ignore) setError(message);
			} finally {
				if (!ignore) setLoading(false);
			}
		})();
		return () => {
			ignore = true;
		};
	}, []);

	const handleChange = (key: keyof TeacherForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		// Prevent manual change of employeeId
		if (key === "employeeId") return;
		const value = event.target.value;
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const toggleClassId = (id: string) => {
		setForm((prev) => {
			const has = prev.classIds.includes(id);
			return { ...prev, classIds: has ? prev.classIds.filter((x) => x !== id) : [...prev.classIds, id] };
		});
	};

	const handleSubmit = async () => {
		if (!canSubmit) {
			toast({ title: "Missing fields", description: "Please fill all required fields." });
			return;
		}
		setSaving(true);
		try {
			const payload = {
				...form,
				subjects: form.subjects
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean),
				yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
			};
			const res = await fetch("/api/teachers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Failed to create teacher");
			}
			toast({ title: "Teacher added", description: "Invite email sent." });
			setForm(emptyForm);
			setTeachers((prev) => [data.teacher, ...prev]);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to save teacher";
			toast({ title: "Save failed", description: message });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="p-6">Loading teachers...</div>;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="border-b border-gray-100 bg-white">
				<div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-500">Teachers</p>
						<h1 className="text-2xl font-semibold text-gray-900">Add and manage teachers</h1>
						<p className="text-sm text-gray-500">New teachers receive an invite email to set their password.</p>
					</div>
					<button className="text-sm text-[#0094da] hover:underline" onClick={() => router.push("/dashboard")}>
						Back to dashboard
					</button>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
				{error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

				<section className={sectionCardClass}>
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-900">New teacher</h2>
						<span className="text-xs rounded-full bg-amber-50 px-2 py-1 text-amber-700 border border-amber-100">Invite sent on save</span>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<label className={labelClass}>First name *</label>
							<input className={inputClass} value={form.firstName} onChange={handleChange("firstName")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Last name *</label>
							<input className={inputClass} value={form.lastName} onChange={handleChange("lastName")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Email (username) *</label>
							<input className={inputClass} type="email" value={form.email} onChange={handleChange("email")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Phone *</label>
							<input className={inputClass} value={form.phone} onChange={handleChange("phone")} placeholder="+977-98..." />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Employee ID *</label>
							<input className={inputClass} value={form.employeeId} placeholder="EMP-001" readOnly />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Designation *</label>
							<input className={inputClass} value={form.designation} onChange={handleChange("designation")} placeholder="Class Teacher" />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Subjects (comma separated)</label>
							<input className={inputClass} value={form.subjects} onChange={handleChange("subjects")} placeholder="English, Math" />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Classes (assign)</label>
							<div className="flex flex-wrap gap-2">
								{classes.map((cls) => {
									const checked = form.classIds.includes(cls._id);
									return (
										<label key={cls._id} className="flex items-center gap-2 text-sm text-gray-700">
											<input type="checkbox" checked={checked} onChange={() => toggleClassId(cls._id)} />
											{cls.name}
										</label>
									);
								})}
							</div>
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Years of experience</label>
							<input className={inputClass} type="number" min="0" value={form.yearsOfExperience} onChange={handleChange("yearsOfExperience")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Qualifications</label>
							<input className={inputClass} value={form.qualifications} onChange={handleChange("qualifications")} placeholder="B.Ed, M.Ed" />
						</div>
						<div className="space-y-1 md:col-span-2">
							<label className={labelClass}>Bio</label>
							<textarea className={inputClass} rows={2} value={form.bio} onChange={handleChange("bio")} placeholder="Short bio" />
						</div>
						<div className="space-y-1 md:col-span-2">
							<label className={labelClass}>Address</label>
							<input className={inputClass} value={form.address} onChange={handleChange("address")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Date of birth</label>
							<input className={inputClass} type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Hire date</label>
							<input className={inputClass} type="date" value={form.hireDate} onChange={handleChange("hireDate")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Emergency contact name</label>
							<input className={inputClass} value={form.emergencyContactName} onChange={handleChange("emergencyContactName")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Emergency contact phone</label>
							<input className={inputClass} value={form.emergencyContactPhone} onChange={handleChange("emergencyContactPhone")} />
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Status</label>
							<select className={inputClass} value={form.status} onChange={handleChange("status")}>
								<option value="pending">Pending</option>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
						</div>
						<div className="space-y-1">
							<label className={labelClass}>Avatar URL</label>
							<input className={inputClass} value={form.avatarUrl} onChange={handleChange("avatarUrl")} placeholder="https://..." />
						</div>
					</div>
					<div className="mt-6 flex justify-end">
						<button className="rounded-lg bg-[#0094da] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0094da] disabled:opacity-50" onClick={handleSubmit} disabled={saving || !canSubmit}>
							{saving ? "Saving..." : "Save & send invite"}
						</button>
					</div>
				</section>

				<section className={sectionCardClass}>
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Teachers</h2>
					<div className="overflow-auto">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-gray-50 text-gray-600">
								<tr>
									<th className="px-3 py-2">Name</th>
									<th className="px-3 py-2">Email</th>
									<th className="px-3 py-2">Designation</th>
									<th className="px-3 py-2">Classes</th>
									<th className="px-3 py-2">Status</th>
									<th className="px-3 py-2">Created</th>
								</tr>
							</thead>
							<tbody>
								{teachers.map((t) => (
									<tr key={t._id} className="border-b border-gray-100">
										<td className="px-3 py-2 font-semibold text-gray-900">
											{t.firstName} {t.lastName}
										</td>
										<td className="px-3 py-2 text-gray-700">{t.email}</td>
										<td className="px-3 py-2 text-gray-700">{t.designation}</td>
										<td className="px-3 py-2 text-gray-700">
											{Array.isArray(t.classIds) && t.classIds.length
												? t.classIds
														.map((c: any) => c?.name || "")
														.filter(Boolean)
														.join(", ")
												: "—"}
										</td>
										<td className="px-3 py-2 text-gray-700 capitalize">{t.status || "pending"}</td>
										<td className="px-3 py-2 text-gray-500">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</main>
		</div>
	);
}

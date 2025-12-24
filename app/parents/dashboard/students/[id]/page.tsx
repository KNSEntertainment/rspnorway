"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]";
const labelClass = "text-sm font-semibold text-gray-800";

export default function ParentStudentDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [student, setStudent] = useState<any>(null);
	const [form, setForm] = useState({ address: "", guardianPhone: "", guardianEmail: "", emergencyContact: "", pickupPerson: "", transportRoute: "" });
	const [originalForm, setOriginalForm] = useState({ address: "", guardianPhone: "", guardianEmail: "", emergencyContact: "", pickupPerson: "", transportRoute: "" });
	const [error, setError] = useState<string>("");

	const canSave = useMemo(() => form.address.trim() && form.guardianPhone.trim() && form.emergencyContact.trim(), [form.address, form.guardianPhone, form.emergencyContact]);
	const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(originalForm), [form, originalForm]);

	useEffect(() => {
		let ignore = false;
		const load = async () => {
			if (!id) return;
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/students?id=${id}`);
				const data = await res.json();
				if (!res.ok || !data?.success || !data.student) {
					throw new Error(data?.error || "Student not found");
				}
				if (ignore) return;
				setStudent(data.student);
				const nextForm = {
					address: data.student.address || "",
					guardianPhone: data.student.guardianPhone || "",
					guardianEmail: data.student.guardianEmail || "",
					emergencyContact: data.student.emergencyContact || "",
					pickupPerson: data.student.pickupPerson || "",
					transportRoute: data.student.transportRoute || "",
				};
				setForm(nextForm);
				setOriginalForm(nextForm);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load student";
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
	}, [id]);

	const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }));
	};

	const handleSave = async () => {
		if (!student || !id) return;
		if (!canSave) {
			toast({ title: "Missing info", description: "Address, phone, and emergency contact are required." });
			return;
		}

		setSaving(true);
		try {
			const payload = {
				id,
				student: {
					firstName: student.firstName,
					lastName: student.lastName,
					dob: student.dob,
					gender: student.gender,
					guardianName: student.guardianName,
					guardianPhone: form.guardianPhone.trim(),
					guardianEmail: form.guardianEmail.trim() || undefined,
					address: form.address.trim(),
					classGroup: student.classGroup,
					enrollmentDate: student.enrollmentDate,
					allergies: student.allergies,
					medicalNotes: student.medicalNotes,
					transportRoute: student.transportRoute,
					pickupPerson: form.pickupPerson.trim(),
					emergencyContact: form.emergencyContact.trim(),
				},
			};

			const res = await fetch("/api/students", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				throw new Error(data?.error || "Update failed");
			}
			setStudent(data.student);
			setOriginalForm({
				address: data.student.address || "",
				guardianPhone: data.student.guardianPhone || "",
				guardianEmail: data.student.guardianEmail || "",
				emergencyContact: data.student.emergencyContact || "",
				pickupPerson: data.student.pickupPerson || "",
				transportRoute: data.student.transportRoute || "",
			});
			toast({ title: "Saved", description: "Student contact info updated." });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to save";
			toast({ title: "Save failed", description: message });
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 pt-28 px-4">
			<div className="mx-auto max-w-3xl space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs text-gray-500">Student profile</p>
						<h1 className="text-2xl font-semibold text-gray-900">{student ? `${student.firstName} ${student.lastName}` : "Loading..."}</h1>
					</div>
					<button onClick={() => router.back()} className="text-sm font-semibold text-[#0094da] hover:underline">
						Back to Dashboard
					</button>
				</div>

				{loading ? (
					<div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-600">Loading...</div>
				) : error ? (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
				) : !student ? (
					<div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-600">Student not found.</div>
				) : (
					<div className="space-y-6">
						<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<p className="text-xs text-gray-500">Name</p>
									<p className="text-base font-semibold text-gray-900">
										{student.firstName} {student.lastName}
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">Class</p>
									<p className="text-base font-semibold text-gray-900">{student.classGroup || "-"}</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">Guardian</p>
									<p className="text-base font-semibold text-gray-900">{student.guardianName}</p>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-lg font-semibold text-gray-900">Contact & Address</h2>
									<p className="text-sm text-gray-500">Update your contact details for this student.</p>
								</div>
								<button onClick={handleSave} disabled={!canSave || saving || !isDirty} className="rounded-full bg-[#0094da] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0094da] disabled:opacity-50">
									{saving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
								</button>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1">
									<label className={labelClass}>Address</label>
									<textarea value={form.address} onChange={handleChange("address")} rows={3} className={`${inputClass} resize-none`} />
								</div>
								<div className="space-y-1">
									<label className={labelClass}>Guardian phone</label>
									<input value={form.guardianPhone} onChange={handleChange("guardianPhone")} className={inputClass} />
								</div>
								<div className="space-y-1">
									<label className={labelClass}>Guardian email</label>
									<input type="email" value={form.guardianEmail} onChange={handleChange("guardianEmail")} className={inputClass} />
								</div>
								<div className="space-y-1">
									<label className={labelClass}>Emergency contact</label>
									<input value={form.emergencyContact} onChange={handleChange("emergencyContact")} className={inputClass} />
								</div>
								<div className="space-y-1">
									<label className={labelClass}>Pickup person</label>
									<input value={form.pickupPerson} onChange={handleChange("pickupPerson")} className={inputClass} />
								</div>
								<div className="space-y-1">
									<label className={labelClass}>Transport route</label>
									<input value={form.transportRoute} disabled readOnly className={`${inputClass} bg-gray-50 text-gray-600`} />
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

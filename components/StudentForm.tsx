import React, { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { uploadPhoto } from "@/utils/photoUploadService";
import Image from "next/image";

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]";
const labelClass = "text-sm font-semibold text-gray-800";
const sectionCardClass = "rounded-xl border border-gray-100 bg-white shadow-sm p-5";

type StudentFormData = {
	firstName: string;
	lastName: string;
	dob: string;
	gender: string;
	guardianName: string;
	guardianPhone: string;
	guardianEmail: string;
	address: string;
	classGroup: string;
	enrollmentDate: string;
	allergies: string;
	medicalNotes: string;
	transportRoute: string;
	pickupPerson: string;
	emergencyContact: string;
	photoUrl: string;
};

type StudentFormProps = {
	initialValues?: Partial<StudentFormData>;
	onSubmit: (formData: StudentFormData) => Promise<void | boolean>;
	submitLabel?: string;
	loading?: boolean;
	resetOnSubmit?: boolean;
	isEditing?: boolean;
};

function emptyFormState(): StudentFormData {
	return {
		firstName: "",
		lastName: "",
		dob: "",
		gender: "",
		guardianName: "",
		guardianPhone: "",
		guardianEmail: "",
		address: "",
		classGroup: "",
		enrollmentDate: "",
		allergies: "",
		medicalNotes: "",
		transportRoute: "",
		pickupPerson: "",
		emergencyContact: "",
		photoUrl: "",
	};
}

export default function StudentForm({ initialValues = {}, onSubmit, submitLabel = "Save student", loading = false, resetOnSubmit = false, isEditing = false }: StudentFormProps) {
	const [form, setForm] = useState<StudentFormData>({ ...emptyFormState(), ...initialValues });
	const [photoPreview, setPhotoPreview] = useState<string | null>(form.photoUrl || null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [resetKey, setResetKey] = useState(0);
	const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
	const [classesLoading, setClassesLoading] = useState(false);
	const [classesError, setClassesError] = useState<string>("");

	// Fetch classes from API with robust error handling
	useEffect(() => {
		let ignore = false;
		setClassesLoading(true);
		setClassesError("");
		(async () => {
			try {
				const res = await fetch("/api/classes");
				if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
				const data = await res.json();
				if (!ignore) {
					if (data.success && Array.isArray(data.classes)) {
						setClasses(data.classes);
					} else {
						setClassesError(data.error || "Could not load classes");
					}
				}
			} catch (err: unknown) {
				if (!ignore) setClassesError(err instanceof Error ? err.message : "Could not load classes");
			} finally {
				if (!ignore) setClassesLoading(false);
			}
		})();
		return () => {
			ignore = true;
		};
	}, []);

	// Update form state when initialValues or resetKey change
	useEffect(() => {
		setForm({ ...emptyFormState(), ...initialValues });
	}, [initialValues, resetKey]);

	useEffect(() => {
		setPhotoPreview(initialValues.photoUrl || null);
	}, [initialValues.photoUrl]);

	const handleChange = (field: keyof StudentFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setForm((prev) => ({ ...prev, [field]: event.target.value }));
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setPhotoPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let photoUrl = form.photoUrl;
		if (photoPreview && photoPreview !== form.photoUrl) {
			try {
				photoUrl = await uploadPhoto(photoPreview);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Photo upload failed";
				toast({ title: "Photo upload failed", description: message });
			}
		}
		const result = await onSubmit({ ...form, photoUrl });
		if (resetOnSubmit && result !== false) {
			setResetKey((k) => k + 1);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8" key={resetKey}>
			<section className={sectionCardClass}>
				{/* Top Save/Update button */}
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
					<button className="rounded-lg bg-[#0094da] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0094da] disabled:opacity-50" type="submit" disabled={loading}>
						{loading ? "Saving..." : submitLabel}
					</button>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-1">
						<label className={labelClass}>First name *</label>
						<input className={inputClass} placeholder="Ava" value={form.firstName} onChange={handleChange("firstName")} required />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Last name *</label>
						<input className={inputClass} placeholder="Johnson" value={form.lastName} onChange={handleChange("lastName")} required />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Date of birth *</label>
						<input type="date" className={inputClass} value={form.dob} onChange={handleChange("dob")} required />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Gender</label>
						<select className={inputClass} value={form.gender} onChange={handleChange("gender")}>
							<option value="">Select gender</option>
							<option>Female</option>
							<option>Male</option>
							<option>Non-binary</option>
							<option>Prefer not to say</option>
						</select>
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Class</label>
						<select className={inputClass} value={form.classGroup} onChange={handleChange("classGroup")} required disabled={classesLoading || !!classesError}>
							<option value="">{classesLoading ? "Loading classes…" : classesError ? "Could not load classes" : "Select class"}</option>
							{!classesLoading &&
								!classesError &&
								classes.map((c) => (
									<option key={c._id} value={c.name}>
										{c.name}
									</option>
								))}
						</select>
						{classesError && <div className="text-xs text-red-600 mt-1">{classesError}. Please try again later or contact admin.</div>}
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Enrollment date *</label>
						<input type="date" className={inputClass} value={form.enrollmentDate} onChange={handleChange("enrollmentDate")} required />
					</div>
					<div className="space-y-1 md:col-span-2">
						<label className={labelClass}>Home address *</label>
						<input className={inputClass} placeholder="123 Maple St, Springfield" value={form.address} onChange={handleChange("address")} required />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Guardian name *</label>
						<input className={inputClass} placeholder="Emily Johnson" value={form.guardianName} onChange={handleChange("guardianName")} required />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Guardian phone *</label>
						<input className={inputClass} placeholder="+1-555-123-4567" value={form.guardianPhone} onChange={handleChange("guardianPhone")} required />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Guardian email</label>
						<input type="email" className={inputClass} placeholder="guardian@example.com" value={form.guardianEmail} onChange={handleChange("guardianEmail")} />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Emergency contact *</label>
						<input className={inputClass} placeholder="+1-555-987-6543" value={form.emergencyContact} onChange={handleChange("emergencyContact")} required />
					</div>
					<div className="space-y-1 md:col-span-2">
						<label className={labelClass}>Authorized pickup person</label>
						<input className={inputClass} placeholder="Grandma Sarah" value={form.pickupPerson} onChange={handleChange("pickupPerson")} />
					</div>
					<div className="space-y-1 md:col-span-2">
						<label className={labelClass}>Allergies</label>
						<textarea className={inputClass} rows={2} placeholder="Peanuts" value={form.allergies} onChange={handleChange("allergies")} />
					</div>
					<div className="space-y-1 md:col-span-2">
						<label className={labelClass}>Medical notes</label>
						<textarea className={inputClass} rows={2} placeholder="Carries epi-pen" value={form.medicalNotes} onChange={handleChange("medicalNotes")} />
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Transport route</label>
						<select className={inputClass} value={form.transportRoute} onChange={handleChange("transportRoute")}>
							<option value="">Select route</option>
							<option>Route A</option>
							<option>Route B</option>
							<option>Route C</option>
						</select>
					</div>
					<div className="space-y-1">
						<label className={labelClass}>Photo</label>
						<div className="flex flex-col">
							<div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">{photoPreview ? <Image src={photoPreview} alt="Preview" className="h-full w-full object-cover" width={128} height={128} /> : <span className="text-gray-500 text-sm">No photo selected</span>}</div>
							<button type="button" onClick={handleUploadClick} className="mt-2 rounded bg-[#0094da] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0094da] w-fit self-baseline">
								{isEditing ? "Change Photo" : "Upload Photo"}
							</button>
							<input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
						</div>
					</div>
				</div>
				<div className="mt-6 flex justify-end">
					<button className="rounded-lg bg-[#0094da] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0094da] disabled:opacity-50" type="submit" disabled={loading}>
						{loading ? "Saving..." : submitLabel}
					</button>
				</div>
			</section>
		</form>
	);
}

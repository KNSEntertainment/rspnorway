"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Shield, ArrowUpCircle } from "lucide-react";

export const STANDARD_HIERARCHY_ROLES = [
	{ title: "President", label: "President / Chairperson (अध्यक्ष)", defaultOrder: 1 },
	{ title: "Senior Vice President", label: "Senior Vice President (वरिष्ठ उपाध्यक्ष)", defaultOrder: 2 },
	{ title: "Vice President", label: "Vice President (उपाध्यक्ष)", defaultOrder: 3 },
	{ title: "General Secretary", label: "General Secretary (महासचिव)", defaultOrder: 4 },
	{ title: "Secretary", label: "Secretary (सचिव)", defaultOrder: 5 },
	{ title: "Treasurer", label: "Treasurer (कोषाध्यक्ष)", defaultOrder: 6 },
	{ title: "Joint Secretary", label: "Joint Secretary (सह-सचिव)", defaultOrder: 7 },
	{ title: "Joint Treasurer", label: "Joint Treasurer (सह-कोषाध्यक्ष)", defaultOrder: 8 },
	{ title: "Department Head", label: "Department Head / Coordinator (विभाग प्रमुख / संयोजक)", defaultOrder: 9 },
	{ title: "Executive Member", label: "Executive Member (कार्यसमिति सदस्य)", defaultOrder: 10 },
	{ title: "Advisory Board Member", label: "Advisory Board Member (सल्लाहकार समिति सदस्य)", defaultOrder: 11 },
];

/**
 * @param {{
 *   handleCloseModal?: () => void;
 *   memberToEdit?: any;
 *   onSuccess?: () => void;
 *   existingMembers?: any[];
 * }} props
 */
export default function ExecutiveMemberForm({ handleCloseModal, memberToEdit, onSuccess, existingMembers = [] }) {
	const [formData, setFormData] = useState({
		name: "",
		position: "",
		department: "",
		subdepartment: "",
		phone: "",
		email: "",
		order: 10,
		isActive: true,
		image: null,
	});
	const [selectedPreset, setSelectedPreset] = useState("");
	const [departments, setDepartments] = useState([]);
	const [availableSubdepartments, setAvailableSubdepartments] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const fetchDepartments = useCallback(async () => {
		try {
			const response = await fetch("/api/departments");
			const data = await response.json();
			if (data.success) {
				setDepartments(data.departments);

				if (memberToEdit?.department) {
					const selectedDept = data.departments.find((d) => d.name === memberToEdit.department);
					if (selectedDept) {
						setAvailableSubdepartments(selectedDept.subdepartments || []);
					}
				}
			}
		} catch (err) {
			console.error("Error fetching departments:", err);
		}
	}, [memberToEdit?.department]);

	useEffect(() => {
		fetchDepartments();
	}, [fetchDepartments]);

	useEffect(() => {
		if (memberToEdit) {
			const currentPosition = memberToEdit.position || "";
			const matchedPreset = STANDARD_HIERARCHY_ROLES.find((r) => r.title.toLowerCase() === currentPosition.toLowerCase());

			setFormData({
				name: memberToEdit.name || "",
				position: currentPosition,
				department: memberToEdit.department || "",
				subdepartment: memberToEdit.subdepartment || "",
				phone: memberToEdit.phone || "",
				email: memberToEdit.email || "",
				order: memberToEdit.order !== undefined && memberToEdit.order !== null ? memberToEdit.order : 10,
				isActive: memberToEdit.isActive !== undefined ? memberToEdit.isActive : true,
				image: null,
			});

			setSelectedPreset(matchedPreset ? matchedPreset.title : currentPosition ? "custom" : "");
		} else {
			// For a new member, calculate next default order based on existing members
			const nextOrder = existingMembers.length > 0 ? Math.max(...existingMembers.map((m) => (typeof m.order === "number" ? m.order : 0))) + 1 : 1;

			setFormData((prev) => ({
				...prev,
				order: nextOrder,
			}));
		}
	}, [memberToEdit, existingMembers]);

	const handleRolePresetChange = (e) => {
		const val = e.target.value;
		setSelectedPreset(val);

		if (val && val !== "custom") {
			const found = STANDARD_HIERARCHY_ROLES.find((r) => r.title === val);
			if (found) {
				setFormData((prev) => ({
					...prev,
					position: found.title,
					// Suggest the default order for this position
					order: found.defaultOrder,
				}));
			}
		} else if (val === "custom") {
			// keep existing position or empty
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked, files } = e.target;

		if (name === "department") {
			const selectedDept = departments.find((d) => d.name === value);
			setAvailableSubdepartments(selectedDept?.subdepartments || []);
			setFormData((prev) => ({
				...prev,
				department: value,
				subdepartment: "",
			}));
		} else if (name === "position") {
			setFormData((prev) => ({
				...prev,
				position: value,
			}));
			// Check if it matches a preset
			const match = STANDARD_HIERARCHY_ROLES.find((r) => r.title.toLowerCase() === value.toLowerCase());
			setSelectedPreset(match ? match.title : "custom");
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : type === "file" ? files[0] : type === "number" ? (value === "" ? "" : Number(value)) : value,
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			Object.keys(formData).forEach((key) => {
				if (formData[key] !== null && formData[key] !== undefined) {
					form.append(key, formData[key]);
				}
			});

			const url = memberToEdit ? `/api/executive-members/${memberToEdit._id}` : "/api/executive-members/create";
			const method = memberToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${memberToEdit ? "update" : "create"} member`);
			}

			if (result.success) {
				setFormData({
					name: "",
					position: "",
					department: "",
					subdepartment: "",
					phone: "",
					email: "",
					order: 10,
					isActive: true,
					image: null,
				});

				if (typeof onSuccess === "function") {
					onSuccess(result.member);
				} else if (typeof handleCloseModal === "function") {
					handleCloseModal();
					window.location.reload();
				}
			}
		} catch (err) {
			setError(err.message || "An error occurred");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
					<p>{error}</p>
				</div>
			)}

			{/* Organizational Hierarchy Info Banner */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-2.5">
				<Shield className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
				<div>
					<p className="font-semibold text-brand">Organizational Hierarchy & Ordering</p>
					<p className="text-gray-700 mt-0.5">Assign standard leadership roles and fine-tune display order. Lower numbers appear first to visitors (e.g., Rank 1 = President, Rank 2 = Senior VP).</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Full Name */}
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
						Full Name *
					</label>
					<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g., Suresh Shrestha" />
				</div>

				{/* Standard Hierarchy Role Preset */}
				<div>
					<label htmlFor="rolePreset" className="block text-sm font-medium text-gray-900 mb-1">
						Organizational Hierarchy Role
					</label>
					<select id="rolePreset" value={selectedPreset} onChange={handleRolePresetChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand bg-white">
						<option value="">Select standard hierarchy position...</option>
						{STANDARD_HIERARCHY_ROLES.map((role) => (
							<option key={role.title} value={role.title}>
								{role.defaultOrder}. {role.label}
							</option>
						))}
						<option value="custom">Other / Custom Position...</option>
					</select>
				</div>

				{/* Exact Position Title */}
				<div>
					<label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-1">
						Position Title
					</label>
					<input type="text" id="position" name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. President, Vice President, etc." />
					<p className="text-xs text-gray-500 mt-1">This title will be displayed to visitors on their profile card.</p>
				</div>

				{/* Hierarchy Rank / Order */}
				<div>
					<div className="flex items-center justify-between mb-1">
						<label htmlFor="order" className="block text-sm font-medium text-gray-900">
							Hierarchy Rank / Display Order *
						</label>
						<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-brand">Rank #{formData.order || 0}</span>
					</div>
					<div className="flex gap-2">
						<input type="number" id="order" name="order" min="1" value={formData.order} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand font-mono text-sm" placeholder="1" />
						<Button type="button" variant="outline" size="sm" onClick={() => setFormData((prev) => ({ ...prev, order: 1 }))} className="text-xs whitespace-nowrap" title="Make top rank (President)">
							<ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
							Top (#1)
						</Button>
					</div>
					<p className="text-xs text-gray-500 mt-1">Determines the sorting order shown to visitors. 1 is highest priority.</p>
				</div>

				{/* Department */}
				<div>
					<label htmlFor="department" className="block text-sm font-medium text-gray-900 mb-1">
						Department
					</label>
					<select id="department" name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand bg-white">
						<option value="">Select Department (Optional)</option>
						{departments.map((dept) => (
							<option key={dept._id} value={dept.name}>
								{dept.name}
							</option>
						))}
					</select>
				</div>

				{/* Subdepartment */}
				<div>
					<label htmlFor="subdepartment" className="block text-sm font-medium text-gray-900 mb-1">
						Subdepartment
					</label>
					<select id="subdepartment" name="subdepartment" value={formData.subdepartment} onChange={handleChange} disabled={!formData.department || availableSubdepartments.length === 0} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
						<option value="">Select Subdepartment</option>
						{availableSubdepartments.map((subdept, index) => (
							<option key={index} value={subdept}>
								{subdept}
							</option>
						))}
					</select>
				</div>

				{/* Phone Number */}
				<div>
					<label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">
						Phone Number *
					</label>
					<input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="+47 123 45 678" />
				</div>

				{/* Email Address */}
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
						Email Address *
					</label>
					<input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand" placeholder="user@example.com" />
				</div>

				{/* Profile Picture */}
				<div className="md:col-span-2">
					<label htmlFor="image" className="block text-sm font-medium text-gray-900 mb-1">
						Profile Picture
					</label>
					<input type="file" id="image" name="image" onChange={handleChange} accept="image/*" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand text-sm" />
					{memberToEdit?.imageUrl && <p className="text-xs text-gray-500 mt-1">Current image exists. Upload a new image to replace it.</p>}
				</div>
			</div>

			{/* Active Checkbox */}
			<div className="flex items-center gap-2">
				<input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer" />
				<label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
					Active (Display on website to visitors)
				</label>
			</div>

			{/* Form Action Buttons */}
			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
				<Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting} className="bg-brand hover:bg-brand/90 text-white font-medium">
					{submitting ? (memberToEdit ? "Updating..." : "Creating...") : memberToEdit ? "Update Member" : "Add Member"}
				</Button>
			</div>
		</form>
	);
}

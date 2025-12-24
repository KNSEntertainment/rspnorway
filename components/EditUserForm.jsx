"use client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function EditUserForm({ user, onClose, onSuccess }) {
	const [formData, setFormData] = useState({
		fullName: user.fullName || "",
		email: user.email || "",
		userName: user.userName || "",
		role: user.role || "parent",
		phone: user.phone || "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [resetLoading, setResetLoading] = useState(false);
	const [resetMessage, setResetMessage] = useState("");
	const handleResetPassword = async () => {
		setResetLoading(true);
		setResetMessage("");
		setError("");
		try {
			const res = await fetch(`/api/users/${user._id}/reset-password`, { method: "POST" });
			const result = await res.json();
			if (!res.ok || !result.success) {
				setError(result.error || "Failed to send reset email");
			} else {
				setResetMessage("Password reset email sent.");
			}
		} catch (err) {
			setError("Unexpected error. Please try again.", err);
		} finally {
			setResetLoading(false);
		}
	};

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await fetch(`/api/users/${user._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			const result = await res.json();
			if (!res.ok || !result.success) {
				setError(result.error || "Failed to update user");
			} else {
				if (onSuccess) onSuccess();
				if (onClose) onClose();
			}
		} catch (err) {
			setError("Unexpected error. Please try again.", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="edit-fullName">Full Name</Label>
				<Input id="edit-fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
			</div>
			<div>
				<Label htmlFor="edit-email">Email</Label>
				<Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleChange} />
			</div>
			<div>
				<Label htmlFor="edit-userName">Username</Label>
				<Input id="edit-userName" name="userName" value={formData.userName} onChange={handleChange} />
			</div>
			<div>
				<Label htmlFor="edit-role">Role</Label>
				<select id="edit-role" name="role" value={formData.role} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2">
					<option value="admin">Admin</option>
					<option value="parent">Parent</option>
					<option value="teacher">Teacher</option>
				</select>
			</div>
			<div>
				<Label htmlFor="edit-phone">Phone</Label>
				<Input id="edit-phone" name="phone" value={formData.phone} onChange={handleChange} />
			</div>
			<div className="flex items-center gap-4 mt-2">
				<Button type="button" variant="secondary" onClick={handleResetPassword} disabled={resetLoading}>
					{resetLoading ? "Sending..." : "Reset Password"}
				</Button>
				{resetMessage && <span className="text-[#0094da] text-sm">{resetMessage}</span>}
			</div>
			{error && <p className="text-red-600">{error}</p>}
			<div className="flex justify-between mt-6">
				<Button type="submit" className="bg-[#0094da] hover:bg-[#0094da]" disabled={loading}>
					{loading ? "Saving..." : "Save Changes"}
				</Button>
				<Button type="button" variant="outline" onClick={onClose}>
					Cancel
				</Button>
			</div>
		</form>
	);
}

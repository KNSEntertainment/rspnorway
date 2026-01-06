"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const { isLoading, setLoading } = useLoading();

	function TokenField() {
		const searchParams = useSearchParams();
		const token = searchParams.get("token") || "";
		return <input type="hidden" name="token" value={token} />;
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		if (!password || !confirmPassword) {
			setError("Please fill in all fields.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setLoading(true);
		// Get token from searchParams inside TokenField
		const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
		const token = searchParams ? searchParams.get("token") || "" : "";
		try {
			const res = await fetch("/api/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});
			const result = await res.json();
			if (!res.ok || !result.success) {
				setError(result.error || "Failed to reset password");
			} else {
				setMessage("Password reset successful. You can now log in.");
			}
		} catch (err) {
			setError("Unexpected error. Please try again.", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto pt-48 min-h-screen p-6 bg-white">
			<h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Suspense fallback={null}>
					<TokenField />
				</Suspense>
				<div>
					<label className="block mb-1 font-semibold">New Password</label>
					<input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>
				<div>
					<label className="block mb-1 font-semibold">Confirm Password</label>
					<input type="password" className="w-full border rounded px-3 py-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
				</div>
				{error && <p className="text-red-600">{error}</p>}
				{message && <p className="text-[#0094da]">{message}</p>}
				<button type="submit" className="w-full bg-[#0094da] text-white py-2 rounded font-bold mt-4" disabled={isLoading}>
					{isLoading ? "Resetting..." : "Reset Password"}
				</button>
			</form>
		</div>
	);
}

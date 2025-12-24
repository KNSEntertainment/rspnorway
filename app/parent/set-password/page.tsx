"use client";

import React, { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";

function ParentSetPasswordPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const emailFromQuery = searchParams.get("email") || "";
	const [email, setEmail] = useState(emailFromQuery);
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const isValid = useMemo(() => email.trim().length > 3 && password.length >= 8 && password === confirm, [email, password, confirm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) {
			toast({ title: "Check form", description: "Please ensure email and matching passwords (8+ chars)." });
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch("/api/parents/set-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim(), password }),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				const message = data?.error || "Could not set password.";
				toast({ title: "Failed", description: message });
				return;
			}
			toast({ title: "Password set", description: "You can now sign in with your email." });
			setPassword("");
			setConfirm("");
			router.push(`/user?email=${encodeURIComponent(email.trim())}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unexpected error.";
			toast({ title: "Failed", description: message });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 pt-28">
			<header className="border-b border-gray-100 bg-white">
				<div className="mx-auto max-w-xl px-4 py-6">
					<h1 className="text-2xl font-semibold text-gray-900">Set Your Password</h1>
					<p className="text-sm text-gray-500">Create a password to access the parent dashboard.</p>
				</div>
			</header>
			<main className="mx-auto max-w-xl px-4 py-8">
				<form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<div className="space-y-1">
						<label className="text-sm font-semibold text-gray-800">Parent email</label>
						<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-semibold text-gray-800">New password</label>
						<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-semibold text-gray-800">Confirm password</label>
						<input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" minLength={8} required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" />
					</div>
					<button type="submit" disabled={!isValid || submitting} className="w-full rounded-lg bg-[#0094da] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0094da] disabled:opacity-50">
						{submitting ? "Setting..." : "Set password"}
					</button>
					<p className="text-xs text-gray-500">Use at least 8 characters. Your username is your email address.</p>
				</form>
			</main>
		</div>
	);
}

export default function ParentSetPasswordPage() {
	return (
		<Suspense fallback={<div className="p-6">Loading...</div>}>
			<ParentSetPasswordPageContent />
		</Suspense>
	);
}

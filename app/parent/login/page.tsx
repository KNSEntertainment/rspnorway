"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function ParentLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const isValid = useMemo(() => email.trim().length > 3 && password.length >= 1, [email, password]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;
		setSubmitting(true);
		try {
			const res = await fetch("/api/user/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim(), password }),
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				const message = data?.error || "Invalid credentials.";
				toast({ title: "Login failed", description: message });
				return;
			}
			toast({ title: "Welcome", description: "Signed in successfully." });
			const role = data?.user?.role;
			router.push(role === "parent" ? "/parents/dashboard" : "/dashboard");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unexpected error.";
			toast({ title: "Login failed", description: message });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="border-b border-gray-100 bg-white">
				<div className="mx-auto max-w-xl px-4 py-6">
					<h1 className="text-2xl font-semibold text-gray-900">Parent Login</h1>
					<p className="text-sm text-gray-500">Sign in with your email and password.</p>
				</div>
			</header>
			<main className="mx-auto max-w-xl px-4 py-8">
				<form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<div className="space-y-1">
						<label className="text-sm font-semibold text-gray-800">Email</label>
						<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-semibold text-gray-800">Password</label>
						<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#0094da] focus:outline-none focus:ring-1 focus:ring-[#0094da]" />
					</div>
					<button type="submit" disabled={!isValid || submitting} className="w-full rounded-lg bg-[#0094da] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0094da] disabled:opacity-50">
						{submitting ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</main>
		</div>
	);
}

"use client";

import React, { useState, useCallback, memo, useEffect, Suspense } from "react";
import { Eye, EyeOff, Lock, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs"; // Import Tabs components
import { useRouter, useSearchParams } from "next/navigation";

const InputField = memo(({ id, icon: Icon, name, value, onChange, ...props }) => (
	<div className="relative">
		<Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
		<Input id={id} name={name} value={value} onChange={onChange} {...props} className="pl-10" />
	</div>
));

InputField.displayName = "Input_Fields_User_Auth_Form";

function AuthFormContent() {
	const router = useRouter();
	// Session state
	const [checkingSession, setCheckingSession] = useState(true);
	useEffect(() => {
		let ignore = false;
		const checkSession = async () => {
			try {
				const res = await fetch("/api/auth/me");
				if (!res.ok) throw new Error("Not logged in");
				const data = await res.json();
				if (data?.user?.email && !ignore) {
					// Redirect based on role
					const role = data.user.role;
					const target = role === "parent" ? "/parents/dashboard" : role === "teacher" ? "/teachers/dashboard" : "/dashboard";
					if (typeof window !== "undefined") {
						window.location.href = target;
					} else {
						router.replace(target);
					}
				}
			} catch {
				// Not logged in, show form
			} finally {
				if (!ignore) setCheckingSession(false);
			}
		};
		checkSession();
		return () => {
			ignore = true;
		};
	}, [router]);
	const searchParams = useSearchParams();
	const initialEmail = searchParams.get("email") || "";
	const initialToken = searchParams.get("token") || "";
	const [formData, setFormData] = useState({
		fullName: "",
		email: initialEmail,
		userName: "",
		password: "",
	});
	const [inviteToken, setInviteToken] = useState(initialToken);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const hasInvite = Boolean(inviteToken);

	useEffect(() => {
		const email = searchParams.get("email") || "";
		const token = searchParams.get("token") || "";
		setFormData((prev) => (prev.email === email ? prev : { ...prev, email }));
		setInviteToken(token);
	}, [searchParams]);

	// Optimized input change handler
	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			if (prev[name] === value) return prev; // Avoid unnecessary state updates
			return { ...prev, [name]: value };
		});
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		try {
			setSubmitting(true);
			const response = await fetch("/api/user/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
				}),
			});

			const result = await response.json();
			if (result?.success) {
				const role = result?.user?.role;
				const target = role === "parent" ? "/parents/dashboard" : role === "teacher" ? "/teachers/dashboard" : "/dashboard";
				if (typeof window !== "undefined") {
					window.location.href = target;
				} else {
					router.push(target);
				}
			} else {
				const message = result?.error || result?.message || `Login failed (${response.status})`;
				setError(message || "Login failed. Please try again.");
			}
		} catch (error) {
			console.error("Login error:", error);
			setError(error.message || "An unexpected error occurred. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleSetPassword = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!formData.password || formData.password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (formData.password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		try {
			setSubmitting(true);
			const response = await fetch("/api/user/set-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: formData.email, token: inviteToken, password: formData.password }),
			});
			const result = await response.json();
			if (result?.success) {
				setSuccess("Password set. You can now log in.");
				setInviteToken("");
				setConfirmPassword("");
				setFormData((prev) => ({ ...prev, password: "" }));
				setTimeout(() => {
					router.push(`/user?email=${encodeURIComponent(formData.email)}`);
				}, 800);
			} else {
				const message = result?.error || result?.message || `Failed to set password (${response.status})`;
				setError(message);
			}
		} catch (err) {
			setError(err?.message || "Unexpected error. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancel = useCallback(() => {
		setFormData({
			fullName: "",
			email: "",
			userName: "",
			password: "",
		});
		setError("");
		router.push("/");
	}, [router]);

	// Password visibility toggle
	const togglePasswordVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	if (checkingSession) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
				<span className="text-gray-500">Checking session...</span>
			</div>
		);
	}
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="bg-[#0094da] text-slate-200 rounded-t-lg text-center">
					<CardTitle className="text-2xl font-bold">{hasInvite ? "Set Password" : "Login"}</CardTitle>
				</CardHeader>
				<CardContent className="mt-6">
					{error && <p className="text-red-500 mb-4 text-center">{error}</p>}
					{success && (
						<p className="mb-4 flex items-center justify-center gap-2 text-[#0094da] text-sm">
							<CheckCircle2 className="h-4 w-4" /> {success}
						</p>
					)}
					{hasInvite ? (
						<form onSubmit={handleSetPassword} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="set-email">Email</Label>
								<InputField id="set-email" icon={Mail} name="email" type="email" value={formData.email} onChange={handleInputChange} readOnly />
							</div>
							<div className="space-y-2">
								<Label htmlFor="set-password">New Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
									<Input id="set-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter new password" value={formData.password} onChange={handleInputChange} className="pl-10 pr-10" />
									<button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirm-password">Confirm Password</Label>
								<Input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
							</div>
							<div className="mt-6 flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCancel}>
									Cancel
								</Button>
								<Button type="submit" className="bg-[#0094da] hover:bg-orange-400" disabled={submitting}>
									{submitting ? "Saving..." : "Set password"}
								</Button>
							</div>
						</form>
					) : (
						<Tabs defaultValue="login" className="w-full">
							<TabsContent value="login">
								<form onSubmit={handleLogin}>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="login-email">Email</Label>
											<InputField id="login-email" icon={Mail} name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} />
										</div>
										<div className="space-y-2">
											<Label htmlFor="login-password">Password</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
												<Input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleInputChange} className="pl-10 pr-10" />
												<button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
													{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
												</button>
											</div>
										</div>
									</div>
									<div className="mt-6 flex justify-between">
										<Button type="button" variant="outline" onClick={handleCancel}>
											Cancel
										</Button>
										<Button type="submit" className="bg-[#0094da] hover:bg-orange-400" disabled={submitting}>
											{submitting ? "Logging in..." : "Login"}
										</Button>
									</div>
								</form>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function AuthForm() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AuthFormContent />
		</Suspense>
	);
}

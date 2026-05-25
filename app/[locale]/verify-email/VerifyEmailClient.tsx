"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useLocale } from "next-intl";

interface Translations {
	title: string;
	subtitle: string;
	verifying: string;
	success: string;
	successMessage: string;
	error: string;
	invalidToken: string;
	expiredToken: string;
	redirecting: string;
	goToLogin: string;
	goToMembership: string;
	setPassword: string;
	newPassword: string;
	confirmPassword: string;
	passwordMismatch: string;
	passwordTooShort: string;
	passwordSetSuccess: string;
	passwordSetMessage: string;
}

interface Props {
	translations: Translations;
}

export default function VerifyEmailClient({ translations: t }: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const locale = useLocale();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "verified" | "passwordSet" | "error">("loading");
	const [message, setMessage] = useState("");
	const [setupToken, setSetupToken] = useState("");
	const [countdown, setCountdown] = useState(3);

	// Password form state
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);

	const verifyEmail = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "verify",
					token,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setStatus("error");
				if (response.status === 400 && data.error?.includes("expired")) {
					setMessage(t.expiredToken);
				} else {
					setMessage(data.error || t.error);
				}
				return;
			}

			setStatus("verified");
			setSetupToken(data.setupToken || "");
			setMessage(t.successMessage);

		} catch (error) {
			setStatus("error");
			setMessage(error instanceof Error ? error.message : t.error);
		}
	}, [token, t.expiredToken, t.error, t.successMessage]);

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage(t.invalidToken);
			return;
		}

		verifyEmail();
	}, [token, t.invalidToken, verifyEmail]);

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		setPasswordError("");
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError("");

		if (formData.password.length < 6) {
			setPasswordError(t.passwordTooShort);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setPasswordError(t.passwordMismatch);
			return;
		}

		setPasswordLoading(true);

		try {
			const response = await fetch("/api/set-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token: setupToken,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setPasswordError(data.error || t.error);
				setPasswordLoading(false);
				return;
			}

			setStatus("passwordSet");
			setMessage(t.passwordSetMessage);

			// Start countdown for redirect
			const interval = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						router.push(`/${locale}/login`);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

		} catch (error) {
			setPasswordError(error instanceof Error ? error.message : t.error);
			setPasswordLoading(false);
		}
	};

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
					<div className="flex justify-center mb-4">
						<Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">{t.verifying}</h2>
					<p className="text-gray-600">Please wait while we verify your email address...</p>
				</div>
			</div>
		);
	}

	if (status === "verified") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
					<div className="text-center mb-6">
						<div className="flex justify-center mb-4">
							<CheckCircle className="w-16 h-16 text-green-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
						<p className="text-gray-600 mb-6">{message}</p>
					</div>

					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Set Your Password</h3>
						<p className="text-gray-600 mb-6">Choose a secure password for your account.</p>

						<form onSubmit={handlePasswordSubmit} className="space-y-4">
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									{t.newPassword}
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										id="password"
										name="password"
										value={formData.password}
										onChange={handlePasswordChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
										disabled={passwordLoading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
									{t.confirmPassword}
								</label>
								<div className="relative">
									<input
										type={showConfirmPassword ? "text" : "password"}
										id="confirmPassword"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handlePasswordChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
										disabled={passwordLoading}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							{passwordError && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
									{passwordError}
								</div>
							)}

							<button
								type="submit"
								disabled={passwordLoading}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{passwordLoading ? "Setting Password..." : t.setPassword}
							</button>
						</form>
					</div>
				</div>
			</div>
		);
	}

	if (status === "passwordSet") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
					<div className="flex justify-center mb-4">
						<CheckCircle className="w-16 h-16 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">{t.passwordSetSuccess}</h2>
					<p className="text-gray-600 mb-4">{message}</p>
					<p className="text-sm text-gray-500 mb-4">
						{t.redirecting} {countdown}...
					</p>
					<button 
						onClick={() => router.push(`/${locale}/login`)} 
						className="mt-4 text-blue-600 hover:text-blue-700 underline font-medium"
					>
						{t.goToLogin}
					</button>
				</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
					<div className="flex justify-center mb-4">
						<XCircle className="w-16 h-16 text-red-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
					<p className="text-gray-600 mb-6">{message}</p>
					<div className="space-y-3">
						<button 
							onClick={() => router.push(`/${locale}/login`)} 
							className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
						>
							{t.goToLogin}
						</button>
						<button 
							onClick={() => router.push(`/${locale}/membership`)} 
							className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
						>
							{t.goToMembership}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return null;
}

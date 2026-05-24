"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
}

interface Props {
	translations: Translations;
}

export default function VerifyEmailClient({ translations: t }: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");
	const [countdown, setCountdown] = useState(3);

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage(t.invalidToken);
			return;
		}

		verifyEmail();
	}, [token]);

	const verifyEmail = async () => {
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

			setStatus("success");
			setMessage(t.successMessage);

			// Start countdown for redirect
			const interval = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						// Redirect to membership page after successful verification
						router.push("/en/membership");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

		} catch (error) {
			setStatus("error");
			setMessage(error instanceof Error ? error.message : t.error);
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

	if (status === "success") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
					<div className="flex justify-center mb-4">
						<CheckCircle className="w-16 h-16 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
					<p className="text-gray-600 mb-4">{message}</p>
					<p className="text-sm text-gray-500 mb-4">
						{t.redirecting} {countdown}...
					</p>
					<button 
						onClick={() => router.push("/en/membership")} 
						className="mt-4 text-blue-600 hover:text-blue-700 underline font-medium"
					>
						{t.goToMembership}
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
							onClick={() => router.push("/en/login")} 
							className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
						>
							{t.goToLogin}
						</button>
						<button 
							onClick={() => router.push("/en/membership")} 
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

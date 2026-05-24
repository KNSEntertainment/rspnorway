"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./button";

interface CaptchaProps {
	onVerify: (isValid: boolean, captchaId?: string) => void;
	onError?: (error: string) => void;
	className?: string;
}

export default function Captcha({ onVerify, onError, className = "" }: CaptchaProps) {
	const [userInput, setUserInput] = useState("");
	const [captchaId, setCaptchaId] = useState("");
	const [captchaSvg, setCaptchaSvg] = useState("");
	const [isVerified, setIsVerified] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch new captcha from server
	const fetchCaptcha = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/captcha/generate');
			
			if (!response.ok) {
				throw new Error('Failed to generate captcha');
			}
			
			const svg = await response.text();
			const newCaptchaId = response.headers.get('Captcha-ID');
			
			if (!newCaptchaId) {
				throw new Error('No captcha ID received');
			}
			
			setCaptchaSvg(svg);
			setCaptchaId(newCaptchaId);
			setUserInput("");
			setIsVerified(false);
			onVerify(false, newCaptchaId);
		} catch (error) {
			console.error('Captcha fetch error:', error);
			onError?.('Failed to load captcha');
		} finally {
			setIsLoading(false);
		}
	}, [onVerify, onError]);

	// Initialize captcha on mount
	useEffect(() => {
		fetchCaptcha();
	}, [fetchCaptcha]);

	// Refresh captcha
	const refreshCaptcha = () => {
		fetchCaptcha();
	};

	// Validate captcha
	const validateCaptcha = async (value: string) => {
		if (!captchaId || value.length !== 6) {
			setIsVerified(false);
			onVerify(false, captchaId);
			return;
		}

		try {
			const response = await fetch('/api/captcha/validate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					captchaId,
					userInput: value
				})
			});

			const result = await response.json();

			if (response.ok) {
				setIsVerified(result.valid);
				onVerify(result.valid, captchaId);
			} else {
				setIsVerified(false);
				onVerify(false, captchaId);
				onError?.(result.error || 'Validation failed');
			}
		} catch (error) {
			console.error('Captcha validation error:', error);
			setIsVerified(false);
			onVerify(false, captchaId);
			onError?.('Failed to validate captcha');
		}
	};

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUserInput(value);
		
		if (value.length === 6) {
			validateCaptcha(value);
		} else {
			setIsVerified(false);
			onVerify(false, captchaId);
		}
	};

	return (
		<div className={`space-y-3 ${className}`}>
			<div className="flex items-center space-x-3">
				{captchaSvg ? (
					<div 
						dangerouslySetInnerHTML={{ __html: captchaSvg }}
						className="border border-gray-300 rounded bg-gray-50"
					/>
				) : (
					<div className="w-[180px] h-[60px] border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
						<div className="text-gray-500 text-sm">Loading...</div>
					</div>
				)}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={refreshCaptcha}
					disabled={isLoading}
					className="px-3 py-1"
				>
					🔄 Refresh
				</Button>
			</div>
			<div className="flex items-center space-x-3">
				<input
					type="text"
					value={userInput}
					onChange={handleInputChange}
					placeholder="Enter captcha code"
					maxLength={6}
					className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				{isVerified && (
					<div className="text-green-600 font-semibold">✓ Verified</div>
				)}
			</div>
		</div>
	);
}

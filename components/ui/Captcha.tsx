"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./button";

interface CaptchaProps {
	onVerify: (isValid: boolean, captchaId?: string, userInput?: string) => void;
	onError?: (error: string) => void;
	className?: string;
}

export default function Captcha({ onVerify, onError, className = "" }: CaptchaProps) {
	const [userInput, setUserInput] = useState("");
	const [captchaId, setCaptchaId] = useState("");
	const [captchaSvg, setCaptchaSvg] = useState("");
	const [isVerified, setIsVerified] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	
	// Use refs to prevent stale closures and infinite re-renders
	const onVerifyRef = useRef(onVerify);
	const onErrorRef = useRef(onError);
	
	// Update refs when props change
	useEffect(() => {
		onVerifyRef.current = onVerify;
		onErrorRef.current = onError;
	});

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
			onVerifyRef.current(false, newCaptchaId, "");
		} catch (error) {
			console.error('Captcha fetch error:', error);
			onErrorRef.current?.('Failed to load captcha');
		} finally {
			setIsLoading(false);
		}
	}, []); // Empty dependency array - fetchCaptcha never changes

	// Initialize captcha on mount
	useEffect(() => {
		fetchCaptcha();
	}, [fetchCaptcha]);

	// Refresh captcha
	const refreshCaptcha = () => {
		fetchCaptcha();
	};

	
	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUserInput(value);
		
		// Don't auto-validate - just notify parent of the input
		if (value.length === 6) {
			onVerifyRef.current(true, captchaId, value); // Assume valid for form submission
		} else {
			setIsVerified(false);
			onVerifyRef.current(false, captchaId, value);
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

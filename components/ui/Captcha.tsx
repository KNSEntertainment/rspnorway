"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./button";

interface CaptchaProps {
	onVerify: (isValid: boolean) => void;
	onError?: (error: string) => void;
	className?: string;
}

export default function Captcha({ onVerify, onError, className = "" }: CaptchaProps) {
	const [userInput, setUserInput] = useState("");
	const [captchaId, setCaptchaId] = useState("");
	const [captchaSvg, setCaptchaSvg] = useState("");
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
			// Don't call onVerify on initial load to prevent error message showing
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
		setIsVerified(false);
		fetchCaptcha();
	};

	
	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUserInput(value);
		
		// Clear any previous verification state when user starts typing
		if (value.length > 0 && value.length < 6) {
			setIsVerified(false);
			// Don't call onVerify here - let the parent handle the validation logic
		}
	};

	
	// Auto-verify when input reaches 6 characters
	useEffect(() => {
		if (userInput.length === 6 && captchaId) {
			const verifyCaptcha = async () => {
				try {
					const response = await fetch('/api/captcha/validate', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ captchaId, userInput }),
					});

					if (response.ok) {
						const result = await response.json();
						setIsVerified(result.valid);
						if (result.valid) {
							onVerifyRef.current(true);
						} else {
							onErrorRef.current?.('Invalid captcha. Please try again.');
							onVerifyRef.current(false);
						}
					} else {
						const errorData = await response.json();
						setIsVerified(false);
						
						// If captcha expired or not found, auto-refresh
						if (errorData.error?.includes('expired') || errorData.error?.includes('not found')) {
							onErrorRef.current?.('Captcha expired. Generating new one...');
							fetchCaptcha(); // Auto-refresh on expired/missing captcha
						} else {
							onErrorRef.current?.(errorData.error || 'Invalid captcha. Please try again.');
						}
						onVerifyRef.current(false);
					}
				} catch (error) {
					console.error('Captcha verification error:', error);
					setIsVerified(false);
					onErrorRef.current?.('Verification failed. Please try again.');
					onVerifyRef.current(false);
				}
			};
			
			verifyCaptcha();
		} else if (userInput.length < 6) {
			setIsVerified(false);
		}
	}, [userInput, captchaId, fetchCaptcha]);

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
			</div>
		</div>
	);
}

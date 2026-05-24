"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";

interface CaptchaProps {
	onVerify: (isValid: boolean) => void;
	onError?: (error: string) => void;
	className?: string;
}

export default function Captcha({ onVerify, className = "" }: CaptchaProps) {
	const [userInput, setUserInput] = useState("");
	const [captchaText, setCaptchaText] = useState("");
	const [isVerified, setIsVerified] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Generate random captcha text
	const generateCaptchaText = () => {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
		let text = "";
		for (let i = 0; i < 6; i++) {
			text += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return text;
	};

	// Draw captcha on canvas
	const drawCaptcha = (text: string) => {
		if (!canvasRef.current) return;
		
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		// Set background
		ctx.fillStyle = "#f3f4f6";
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		// Draw noise lines
		for (let i = 0; i < 5; i++) {
			ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
			ctx.beginPath();
			ctx.moveTo(Math.random() * canvasRef.current.width, Math.random() * canvasRef.current.height);
			ctx.lineTo(Math.random() * canvasRef.current.width, Math.random() * canvasRef.current.height);
			ctx.stroke();
		}

		// Draw noise dots
		for (let i = 0; i < 30; i++) {
			ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
			ctx.beginPath();
			ctx.arc(Math.random() * canvasRef.current.width, Math.random() * canvasRef.current.height, 1, 0, 2 * Math.PI);
			ctx.fill();
		}

		// Draw text
		ctx.font = "bold 24px Arial";
		ctx.fillStyle = "#1f2937";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		// Draw each character with slight rotation and position variation
		for (let i = 0; i < text.length; i++) {
			ctx.save();
			const x = 20 + i * 25;
			const y = 30 + Math.random() * 10 - 5;
			ctx.translate(x, y);
			ctx.rotate((Math.random() - 0.5) * 0.3);
			ctx.fillText(text[i], 0, 0);
			ctx.restore();
		}
	};

	// Initialize captcha
	useEffect(() => {
		const text = generateCaptchaText();
		setCaptchaText(text);
		drawCaptcha(text);
	}, []);

	// Refresh captcha
	const refreshCaptcha = () => {
		const text = generateCaptchaText();
		setCaptchaText(text);
		setUserInput("");
		setIsVerified(false);
		drawCaptcha(text);
		onVerify(false);
	};

	
	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUserInput(value);
		
		if (value.length === 6) {
			if (value.toLowerCase() === captchaText.toLowerCase()) {
				setIsVerified(true);
				onVerify(true);
			} else {
				setIsVerified(false);
				onVerify(false);
			}
		} else {
			setIsVerified(false);
			onVerify(false);
		}
	};

	return (
		<div className={`space-y-3 ${className}`}>
			<div className="flex items-center space-x-3">
				<canvas
					ref={canvasRef}
					width={180}
					height={60}
					className="border border-gray-300 rounded bg-gray-50"
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={refreshCaptcha}
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

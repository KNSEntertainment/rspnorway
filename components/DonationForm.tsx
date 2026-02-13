"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function DonationForm() {
	const { data: session } = useSession();
	const [amount, setAmount] = useState<number>(500);
	const [customAmount, setCustomAmount] = useState<string>("");
	const [donorName, setDonorName] = useState(session?.user?.fullName || "");
	const [donorEmail, setDonorEmail] = useState(session?.user?.email || "");
	const [donorPhone, setDonorPhone] = useState("");
	const [message, setMessage] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [loading, setLoading] = useState(false);

	const handlePresetClick = (presetAmount: number) => {
		setAmount(presetAmount);
		setCustomAmount("");
	};

	const handleCustomAmountChange = (value: string) => {
		setCustomAmount(value);
		const numValue = parseInt(value);
		if (!isNaN(numValue) && numValue > 0) {
			setAmount(numValue);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (amount < 50) {
			toast.error("Minimum donation amount is 50 NOK");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/donations/create-checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount,
					donorName: isAnonymous ? "Anonymous" : donorName,
					donorEmail,
					donorPhone,
					message,
					isAnonymous,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create checkout session");
			}

			// Redirect to Stripe Checkout
			window.location.href = data.url;
		} catch (error) {
			console.error("Donation error:", error);
			toast.error(error instanceof Error ? error.message : "Failed to process donation");
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto shadow-xl border-0">
			<CardHeader className="bg-gradient-to-r from-brand to-blue-700 text-white">
				<div className="flex items-center gap-3">
					<Heart className="w-8 h-8" />
					<div>
						<CardTitle className="text-2xl">Support PNSB-Norway</CardTitle>
						<CardDescription className="text-white/90">Your contribution makes a difference</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Preset Amounts */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">Select Amount (NOK)</label>
						<div className="grid grid-cols-3 gap-3">
							{PRESET_AMOUNTS.map((presetAmount) => (
								<button key={presetAmount} type="button" onClick={() => handlePresetClick(presetAmount)} className={`text-sm md:text-xl py-3 px-2 md:px-4 rounded-lg border-2 font-semibold transition-all ${amount === presetAmount && !customAmount ? "border-brand bg-brand text-white" : "border-gray-300 text-gray-900 hover:border-brand"}`}>
									{presetAmount} NOK
								</button>
							))}
						</div>
					</div>

					{/* Custom Amount */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">Or Enter Custom Amount</label>
						<div className="relative">
							<input type="number" min="50" value={customAmount} onChange={(e) => handleCustomAmountChange(e.target.value)} placeholder="Enter amount in NOK" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" />
							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">NOK</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">Minimum donation: 50 NOK</p>
					</div>

					{/* Anonymous Donation */}
					<div className="flex items-center gap-3 p-4 bg-light rounded-lg">
						<input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-brand rounded focus:ring-brand" />
						<label htmlFor="anonymous" className="text-sm text-gray-900 cursor-pointer">
							Make this donation anonymous
						</label>
					</div>

					{/* Donor Information */}
					{!isAnonymous && (
						<div className="space-y-4 p-4 bg-light rounded-lg">
							<h3 className="font-semibold text-gray-900">Your Information</h3>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									Full Name <span className="text-red-500">*</span>
								</label>
								<input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder="Enter your full name" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									Email <span className="text-red-500">*</span>
								</label>
								<input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder="your@email.com" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">Phone (Optional)</label>
								<input type="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder="+47 123 45 678" />
							</div>
						</div>
					)}

					{/* Message */}
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-2">Message (Optional)</label>
						<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900 resize-none" placeholder="Leave a message of support..." />
					</div>

					{/* Submit Button */}
					<Button type="submit" disabled={loading || amount < 50} className="w-full py-6 text-lg bg-brand hover:bg-brand/90 text-white">
						{loading ? (
							<>
								<Loader2 className="w-5 h-5 mr-2 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<Heart className="w-5 h-5 mr-2" />
								Donate {amount} NOK
							</>
						)}
					</Button>

					<p className="text-xs text-center text-gray-500">Secure payment powered by Stripe. Your donation supports PNSB-Norway&apos;s mission and activities.</p>
				</form>
			</CardContent>
		</Card>
	);
}

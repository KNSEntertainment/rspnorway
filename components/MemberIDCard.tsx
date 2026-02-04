"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, CreditCard } from "lucide-react";
import Image from "next/image";

interface MemberIDCardProps {
	memberData: {
		_id: string;
		fullName: string;
		email: string;
		phone?: string;
		profilePhoto?: string;
		nationalMembershipNo?: string;
		membershipType: string;
		city?: string;
		province?: string;
		createdAt: string;
	};
	logo?: string;
}

export default function MemberIDCard({ memberData, logo }: MemberIDCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	// Generate membership number from last 6 digits of _id
	const membershipNumber = memberData._id.slice(-6).toUpperCase();

	console.log("MemberIDCard - _id:", memberData._id);
	console.log("MemberIDCard - membershipNumber:", membershipNumber);
	console.log("MemberIDCard - logo:", logo);

	const handleDownload = async () => {
		if (!cardRef.current) return;

		try {
			// Dynamically import html2canvas only when needed
			const html2canvas = (await import("html2canvas")).default;

			const canvas = await html2canvas(cardRef.current, {
				scale: 3,
				backgroundColor: "#ffffff",
				logging: false,
			});

			// Convert to blob and download
			canvas.toBlob((blob) => {
				if (blob) {
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.download = `RSP-Norway-ID-${memberData.fullName.replace(/\s+/g, "-")}.png`;
					link.href = url;
					link.click();
					URL.revokeObjectURL(url);
				}
			});
		} catch (error) {
			console.error("Error generating ID card:", error);
			alert("Failed to generate ID card. Please try again.");
		}
	};

	const handlePrint = () => {
		window.print();
	};

	// QR code contains only the membership number
	const qrData = membershipNumber;

	// Format membership date
	const membershipDate = new Date(memberData.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<div className="space-y-4">
			{/* Action Buttons */}
			<div className="flex gap-3 print:hidden">
				<Button onClick={handleDownload} className="bg-brand hover:bg-brand/90 text-white">
					<Download className="w-4 h-4 mr-2" />
					Download ID Card
				</Button>
				<Button onClick={handlePrint} variant="outline" className="border-brand text-brand hover:bg-brand/10">
					<CreditCard className="w-4 h-4 mr-2" />
					Print ID Card
				</Button>
			</div>

			{/* ID Card - Front */}
			<div ref={cardRef} className="relative w-full max-w-[400px] mx-auto" style={{ aspectRatio: "1.586" }}>
				{/* Card Container */}
				<div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-brand">
					{/* Header Section */}
					<div className="bg-gradient-to-r from-brand to-blue-700 text-white px-6 py-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-bold mt-0.5">RSP Norway</h2>
								<h3 className="text-xs font-semibold tracking-wide">MEMBER ID CARD</h3>
								<p className="text-[10px] text-white font-semibold">Membership No. {membershipNumber}</p>
							</div>
							{/* Logo */}
							<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">{logo ? <Image src={logo} alt="RSP Norway Logo" width={48} height={48} className="w-full h-full object-contain p-1" /> : <span className="text-brand font-bold text-lg">RSP</span>}</div>
						</div>
					</div>

					{/* Content Section */}
					<div className="px-6 py-4">
						{/* Membership Number - TOP LEFT */}

						{/* Photo and QR Code Row */}
						<div className="flex items-start justify-between mb-3">
							{/* Member Photo */}
							<div className="flex-shrink-0">
								<div className="w-20 h-20 rounded-lg overflow-hidden bg-light border-2 border-brand/20">
									{memberData.profilePhoto ? (
										<Image src={memberData.profilePhoto} alt={memberData.fullName} width={80} height={80} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/20 to-brand/10">
											<span className="text-2xl font-bold text-brand">{memberData.fullName.charAt(0)}</span>
										</div>
									)}
								</div>
							</div>

							{/* QR Code */}
							<div className="flex-shrink-0">
								<div className="bg-white p-1.5 rounded-lg border-2 border-light">
									<QRCodeSVG value={qrData} size={64} level="H" includeMargin={false} />
								</div>
							</div>
						</div>

						{/* Member Details */}
						<div className="space-y-2">
							{/* Name */}
							<div>
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Full Name</p>
								<p className="text-sm font-bold text-gray-900 truncate">{memberData.fullName}</p>
							</div>

							{/* Two Column Layout */}
							<div className="grid grid-cols-2 gap-2">
								{/* Type */}
								<div>
									<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Type</p>
									<p className="text-xs font-semibold text-gray-900 capitalize">{memberData.membershipType}</p>
								</div>

								{/* Location */}
								{(memberData.city || memberData.province) && (
									<div>
										<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Location</p>
										<p className="text-xs font-semibold text-gray-900">{memberData.city || memberData.province}</p>
									</div>
								)}
							</div>

							{/* Membership Date */}
							<div>
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Membership Date</p>
								<p className="text-xs font-semibold text-gray-900">{membershipDate}</p>
							</div>
						</div>
					</div>

					{/* Footer Section with Signature */}
					<div className="bg-gradient-to-r from-success to-emerald-600 px-6 py-3">
						<div className="flex items-center justify-between text-white">
							<div className="flex items-center gap-1">
								<div className="w-2 h-2 bg-white rounded-full"></div>
								<p className="text-[11px] font-semibold">VERIFIED MEMBER</p>
							</div>
							<div className="text-right">
								<div className="h-6 flex items-end">
									<div className="border-b-2 border-white w-24"></div>
								</div>
								<p className="text-[9px] font-semibold mt-0.5">President&apos;s Signature</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ID Card - Back (for printing) */}
			<div className="hidden print:block w-full max-w-[400px] mx-auto mt-8" style={{ aspectRatio: "1.586" }}>
				<div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-brand">
					{/* Header */}
					<div className="bg-gradient-to-r from-brand to-blue-700 text-white px-6 py-3 text-center">
						<h3 className="text-sm font-bold">Emergency Contact & Guidelines</h3>
					</div>

					{/* Content */}
					<div className="px-6 py-4 space-y-3">
						{/* Emergency Contact */}
						<div>
							<p className="text-xs font-bold text-gray-900 mb-2">Emergency Contact</p>
							{memberData.email && (
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-semibold text-gray-500">Email:</span>
									<span className="text-[10px] text-gray-900">{memberData.email}</span>
								</div>
							)}
							{memberData.phone && (
								<div className="flex items-center gap-2 mt-1">
									<span className="text-[10px] font-semibold text-gray-500">Phone:</span>
									<span className="text-[10px] text-gray-900">{memberData.phone}</span>
								</div>
							)}
						</div>

						{/* Guidelines */}
						<div>
							<p className="text-xs font-bold text-gray-900 mb-2">Member Guidelines</p>
							<ul className="text-[9px] text-gray-700 space-y-1 list-disc list-inside">
								<li>This card is non-transferable</li>
								<li>Report lost or stolen cards immediately</li>
								<li>Valid for active memberships only</li>
								<li>Present this card at RSP Norway events</li>
							</ul>
						</div>

						{/* Organization Info */}
						<div className="border-t border-light pt-3">
							<p className="text-[10px] font-bold text-brand mb-1">RSP Norway</p>
							<p className="text-[9px] text-gray-600">Rastriya Swatantra Party - Norway Chapter</p>
							<p className="text-[9px] text-gray-600 mt-1">www.rspnorway.org</p>
							<p className="text-[9px] text-gray-600">info@rspnorway.org</p>
						</div>
					</div>

					{/* Footer */}
					<div className="bg-gradient-to-r from-success to-emerald-600 px-6 py-3">
						<div className="flex items-center justify-between text-white">
							<p className="text-[10px] font-semibold">Issued: {membershipDate}</p>
							<div className="text-right">
								<div className="h-6 flex items-end">
									<div className="border-b-2 border-white w-24"></div>
								</div>
								<p className="text-[9px] font-semibold mt-0.5">President&apos;s Signature</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Print Styles */}
			<style jsx global>{`
				@media print {
					body * {
						visibility: hidden;
					}
					#id-card-container,
					#id-card-container * {
						visibility: visible;
					}
					#id-card-container {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
					}
					@page {
						size: A4;
						margin: 20mm;
					}
				}
			`}</style>
		</div>
	);
}

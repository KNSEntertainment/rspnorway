"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { CreditCard, Globe, Mail } from "lucide-react";
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
	locale?: string;
}

export default function MemberIDCard({ memberData, logo, locale = "en" }: MemberIDCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	// Generate membership number from last 6 digits of _id
	const membershipNumber = memberData._id.slice(-6).toUpperCase();

	console.log("MemberIDCard - _id:", memberData._id);
	console.log("MemberIDCard - membershipNumber:", membershipNumber);
	console.log("MemberIDCard - logo:", logo);

	const handlePrint = () => {
		window.print();
	};

	// QR code contains the member profile URL with locale prefix
	const baseUrl = process.env.NEXTAUTH_URL || "https://www.rspnorway.org";
	const qrData = `${baseUrl}/${locale}/members/${memberData._id}`;

	console.log("MemberIDCard - QR Code URL:", qrData);
	console.log("MemberIDCard - Base URL:", baseUrl);
	console.log("MemberIDCard - Locale:", locale);

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
				<Button onClick={handlePrint} variant="outline" className="border-brand text-brand hover:bg-brand/10">
					<CreditCard className="w-4 h-4 mr-2" />
					Print ID Card
				</Button>
			</div>

			{/* ID Card - Front */}
			<div ref={cardRef} className="relative w-full max-w-[300px] mx-auto">
				{/* Card Container */}
				<div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-brand">
					{/* Header Section */}
					<div className="relative bg-gradient-to-r from-brand to-blue-700 text-white px-6 pt-4 pb-8">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-bold mt-0.5">PNSB-Norway</h2>
								<p className="text-[10px] text-white font-semibold">Oslo, Norway</p>
								<h3 className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white shadow-md px-2 py-1 rounded-2xl text-xs font-semibold tracking-wide text-brand">MEMBERSHIP CARD</h3>
							</div>
							{/* Logo */}
							<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">{logo ? <Image src={logo} alt="PNSB-Norway Logo" width={48} height={48} className="w-full h-full object-contain p-1" /> : <span className="text-brand font-bold text-lg">RSP</span>}</div>
						</div>
					</div>

					{/* Content Section */}
					<div className="px-6 py-5">
						{/* Membership Number - TOP LEFT */}

						<div className="w-full flex justify-center mt-2 mb-4">
							<div className="w-20 h-20 rounded-full overflow-hidden bg-light border-2 border-brand/20">
								{memberData.profilePhoto ? (
									<Image src={memberData.profilePhoto} alt={memberData.fullName} width={80} height={80} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/20 to-brand/10">
										<span className="text-2xl font-bold text-brand">{memberData.fullName.charAt(0)}</span>
									</div>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							{/* Name */}
							<div>
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Full Name</p>
								<p className="text-sm font-bold text-gray-900 truncate">{memberData.fullName}</p>
							</div>

							{/* Membership Date */}
							<div>
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Member Since</p>
								<p className="text-xs font-semibold text-gray-900">{membershipDate}</p>
							</div>

							{/* Contact Information */}
							<div className="space-y-1">
								{memberData.phone && (
									<div>
										<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Contact</p>
										<p className="text-xs font-semibold text-gray-900">{memberData.phone}</p>
									</div>
								)}
							</div>

							{/* Address */}
							<div>
								{(memberData.city || memberData.province) && (
									<div>
										<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Address</p>
										<p className="text-xs font-semibold text-gray-900">{[memberData.city, memberData.province].filter(Boolean).join(", ")}</p>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="flex justify-between px-6">
						<div className="flex flex-col">
							<p className="py-2 text-[10px] font-light text-gray-600">
								Membership No. <br />
								<span className="font-semibold">{membershipNumber}</span>
							</p>
							<p className="py-2 text-[10px] font-light text-gray-600">
								Member Since <br />
								<span className="font-semibold">{membershipDate}</span>
							</p>
						</div>
						{/* QR Code with Signature */}
						<div className="w-fit flex-shrink-0">
							<div className="bg-white p-1.5 rounded-lg border-2 border-light">
								<QRCodeSVG value={qrData} size={64} level="H" includeMargin={false} />
							</div>
							{/* Signature below QR */}
							<div className="my-2 text-center">
								<div className="border-b border-gray-400 w-16 mx-auto"></div>
								<p className="text-xs text-gray-600 mt-0.5">President</p>
							</div>
						</div>
					</div>

					{/* Footer Section with Contact Info */}
					<div className="bg-gradient-to-r from-success to-emerald-600 px-6 py-4">
						<div className="text-white space-y-2">
							{/* RSP Norway Contact Information */}
							<div className="grid grid-cols-2 gap-1 text-xs">
								<div className="flex items-center">
									<Mail className="inline-block w-3 h-3 mr-1" />
									<p>info@pnsbnorway.org</p>
								</div>
								<div className="flex items-center">
									<Globe className="inline-block w-3 h-3 mr-1" />
									<p>www.rspnorway.org</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ID Card - Back (for printing) */}
			<div className="hidden print:block w-full max-w-[450px] mx-auto mt-8" style={{ aspectRatio: "1.4" }}>
				<div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-brand">
					{/* Header */}
					<div className="bg-gradient-to-r from-brand to-blue-700 text-white px-8 py-4 text-center">
						<h3 className="text-sm font-bold">Emergency Contact & Guidelines</h3>
					</div>

					{/* Main Content */}
					<div className="px-8 py-6 space-y-4">
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
								<li>Present this card at PNSB-Norway events</li>
							</ul>
						</div>

						{/* Organization Info */}
						<div className="border-t border-light pt-3">
							<p className="text-[10px] font-bold text-brand mb-1">PNSB-Norway</p>
							<p className="text-[9px] text-gray-600">Rastriya Swatantra Party - Norway Chapter</p>
							<p className="text-[9px] text-gray-600 mt-1">www.rspnorway.org</p>
							<p className="text-[9px] text-gray-600">info@pnsbnorway.org</p>
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

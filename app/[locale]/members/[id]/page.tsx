import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import User from "@/models/User.Model";
import Event from "@/models/Event.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, User as UserIcon, Briefcase, Heart, MapPin, Building, ShieldCheck, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MemberAttendanceCard from "@/components/MemberAttendanceCard";

interface MemberDoc {
	_id: unknown;
	fullName?: string;
	name?: string;
	email: string;
	phone?: string;
	address?: string;
	city?: string;
	province?: string;
	skills?: string;
	membershipType?: string;
	membershipStatus?: string;
	position?: string;
	department?: string;
	subdepartment?: string;
	nationalMembershipNo?: string;
	profilePhoto?: string;
	imageUrl?: string;
	volunteerInterest?: string[];
	permissionPhotos?: boolean;
	permissionEmail?: boolean;
	permissionPhone?: boolean;
	createdAt?: Date | string;
	[key: string]: unknown;
}

interface EventDoc {
	_id: unknown;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
	[key: string]: unknown;
}

interface RegistrationDoc {
	eventId: unknown;
	checkedIn: boolean;
	checkedInAt?: Date | string;
	[key: string]: unknown;
}

export default async function MemberDetailsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
	const { id, locale } = await params;

	try {
		await connectDB();
		
		// 1. Try to find as regular member first
		let member: MemberDoc | null = (await Membership.findById(id).lean()) as MemberDoc | null;
		let isExecutiveMember = false;
		
		// 2. If not found as regular member, try as executive member
		if (!member) {
			member = (await ExecutiveMember.findById(id).lean()) as MemberDoc | null;
			isExecutiveMember = Boolean(member);
		}

		// 3. If still not found, check if it's an Admin User
		if (!member) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const user: any = await User.findById(id).lean();
			if (user) {
				member = {
					_id: user._id,
					fullName: user.fullName,
					name: user.fullName,
					email: user.email,
					phone: user.phone,
					membershipType: "executive",
					membershipStatus: "approved",
					position: user.role === "treasurer" ? "Treasurer" : "Executive Member",
					createdAt: user.createdAt,
				};
				isExecutiveMember = true;
			}
		}

		if (!member || (!isExecutiveMember && member.membershipStatus !== "approved")) {
			notFound();
		}

		const memberData = member;

		// Permissions
		const showPhoto = isExecutiveMember || memberData.permissionPhotos;
		const showEmail = isExecutiveMember || memberData.permissionEmail;
		const showPhone = isExecutiveMember || memberData.permissionPhone;

		// Session check for admin controls
		const session = await getServerSession(authOptions);
		const isAdmin = session?.user?.role === "admin" || session?.user?.role === "treasurer";

		// Fetch upcoming events for attendance checking
		const rawEvents = (await Event.find().sort({ createdAt: -1 }).limit(3).lean()) as unknown as EventDoc[];
		const serializedEvents = rawEvents.map((e) => ({
			_id: (e._id as object).toString(),
			eventname: e.eventname || "Community Event",
			eventdate: e.eventdate || "TBD",
			eventtime: e.eventtime || "",
			eventvenue: e.eventvenue || "",
		}));

		// Fetch existing registrations for this member across these events
		const eventObjectIds = rawEvents.map((e) => e._id);
		const rawRegs = (await EventRegistration.find({
			eventId: { $in: eventObjectIds },
			$or: [{ email: memberData.email }, { userId: id }],
		}).lean()) as unknown as RegistrationDoc[];

		const serializedRegs = rawRegs.map((r) => ({
			eventId: (r.eventId as object).toString(),
			checkedIn: Boolean(r.checkedIn),
			checkedInAt: r.checkedInAt ? new Date(r.checkedInAt).toISOString() : undefined,
		}));

		const displayName = isExecutiveMember ? (memberData.name || memberData.fullName || "Member") : (memberData.fullName || "Member");
		const displayPhoto = isExecutiveMember ? (memberData.imageUrl || memberData.profilePhoto) : memberData.profilePhoto;
		const memberTypeLabel = isExecutiveMember
			? (memberData.position || "Executive Member")
			: `${(memberData.membershipType || "general").charAt(0).toUpperCase() + (memberData.membershipType || "general").slice(1)} Member`;

		return (
			<div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Top Navigation */}
					<div className="flex items-center justify-between">
						<Link href={`/${locale}/members`}>
							<Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 text-slate-700 text-xs">
								&larr; Back to Members
							</Button>
						</Link>

						<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
							<ShieldCheck className="w-4 h-4 text-emerald-600" />
							<span>Verified Active Member</span>
						</div>
					</div>

					{/* Member Profile Card */}
					<Card className="overflow-hidden border border-slate-200/80 shadow-sm rounded-2xl bg-white">
						{/* Header with Subtle Gradient */}
						<div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-brand text-white p-6 sm:p-8">
							<div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
								{showPhoto && displayPhoto ? (
									<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg flex-shrink-0">
										<Image
											src={displayPhoto}
											alt={displayName}
											fill
											className="object-cover"
										/>
									</div>
								) : (
									<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 border-4 border-white/20 flex items-center justify-center shadow-lg text-white text-3xl font-bold flex-shrink-0">
										{displayName.charAt(0).toUpperCase()}
									</div>
								)}

								<div className="text-center sm:text-left space-y-1">
									<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
										<h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
										<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
											Approved
										</span>
									</div>
									<p className="text-slate-300 text-sm">{memberTypeLabel}</p>
									<p className="text-xs text-slate-400">PNSB-Norway Verified Credential</p>
								</div>
							</div>
						</div>

						{/* Content */}
						<CardContent className="p-6 space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{/* Left Column - Contact Details */}
								<div className="space-y-4">
									<h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
										<UserIcon className="w-4 h-4 text-brand" />
										Contact & Identification
									</h3>
									<div className="space-y-2.5 text-xs">
										{showEmail && memberData.email && (
											<div className="flex items-center gap-2.5 text-slate-700">
												<Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
												<span className="truncate">{memberData.email}</span>
											</div>
										)}
										{showPhone && memberData.phone && (
											<div className="flex items-center gap-2.5 text-slate-700">
												<Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
												<span>{memberData.phone}</span>
											</div>
										)}
										{memberData.createdAt && (
											<div className="flex items-center gap-2.5 text-slate-700">
												<Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
												<span>Registered: {new Date(memberData.createdAt).toLocaleDateString()}</span>
											</div>
										)}
										{memberData.address && (
											<div className="flex items-center gap-2.5 text-slate-700">
												<MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
												<span>{memberData.address}</span>
											</div>
										)}
									</div>

									{memberData.skills && (
										<div className="pt-2">
											<h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
												<Briefcase className="w-3.5 h-3.5 text-brand" />
												Skills & Expertise
											</h4>
											<p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
												{memberData.skills}
											</p>
										</div>
									)}
								</div>

								{/* Right Column - Membership Info */}
								<div className="space-y-4">
									<h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
										{isExecutiveMember ? (
											<Building className="w-4 h-4 text-purple-600" />
										) : (
											<Heart className="w-4 h-4 text-brand" />
										)}
										{isExecutiveMember ? "Executive Details" : "Membership Details"}
									</h3>
									<div className="space-y-2.5 text-xs">
										{isExecutiveMember ? (
											<>
												<div className="flex items-center justify-between py-1 border-b border-slate-100">
													<span className="text-slate-500">Designation:</span>
													<span className="font-semibold text-slate-900">{memberData.position || "Executive Member"}</span>
												</div>
												{memberData.department && (
													<div className="flex items-center justify-between py-1 border-b border-slate-100">
														<span className="text-slate-500">Department:</span>
														<span className="font-medium text-slate-900">{memberData.department}</span>
													</div>
												)}
												<div className="flex items-center justify-between py-1 border-b border-slate-100">
													<span className="text-slate-500">Role Authority:</span>
													<span className="font-medium text-emerald-700">Executive Board / Admin</span>
												</div>
											</>
										) : (
											<>
												<div className="flex items-center justify-between py-1 border-b border-slate-100">
													<span className="text-slate-500">Tier:</span>
													<span className="font-semibold text-slate-900 capitalize">{memberData.membershipType || "General"}</span>
												</div>
												<div className="flex items-center justify-between py-1 border-b border-slate-100">
													<span className="text-slate-500">Status:</span>
													<span className="font-semibold text-emerald-700 capitalize">{memberData.membershipStatus || "Approved"}</span>
												</div>
												{memberData.nationalMembershipNo && (
													<div className="flex items-center justify-between py-1 border-b border-slate-100">
														<span className="text-slate-500">Membership Number:</span>
														<span className="font-mono font-semibold text-slate-900">{memberData.nationalMembershipNo}</span>
													</div>
												)}
											</>
										)}
									</div>

									{memberData.volunteerInterest && memberData.volunteerInterest.length > 0 && (
										<div className="pt-2">
											<h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
												<Heart className="w-3.5 h-3.5 text-rose-500" />
												Volunteer Areas
											</h4>
											<div className="flex flex-wrap gap-1.5">
												{memberData.volunteerInterest.map((interest, index) => (
													<Badge key={index} variant="outline" className="text-[11px] bg-slate-50 text-slate-700 border-slate-200">
														{interest}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Event Attendance & Live Check-in Section */}
							<div className="pt-6 border-t border-slate-100 space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
											<CheckCircle2 className="w-4 h-4" />
										</div>
										<div>
											<h3 className="text-sm font-bold text-slate-900">Event Attendance & Verification</h3>
											<p className="text-xs text-slate-500">Scan ID card QR code to verify or register for scheduled events</p>
										</div>
									</div>
									{isAdmin && (
										<span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
											Admin Desk Mode
										</span>
									)}
								</div>

								<MemberAttendanceCard
									memberId={id}
									memberEmail={memberData.email || ""}
									memberName={displayName}
									events={serializedEvents}
									initialRegistrations={serializedRegs}
									isAdmin={isAdmin}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error fetching member details:", error);
		notFound();
	}
}
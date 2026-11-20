"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
	User, 
	Mail, 
	Phone, 
	Calendar, 
	Shield, 
	CheckCircle2, 
	Clock, 
	XCircle, 
	Users, 
	Camera, 
	Upload, 
	AlertCircle, 
	Settings, 
	CreditCard,
	MapPin,
	Briefcase,
	Award,
	Heart,
	ExternalLink,
	ShieldCheck,
	Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
	AlertDialog, 
	AlertDialogAction, 
	AlertDialogContent, 
	AlertDialogDescription, 
	AlertDialogFooter, 
	AlertDialogHeader, 
	AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Membership } from "@/types";

interface Translations {
	title: string;
	personalInfo: string;
	fullName: string;
	email: string;
	phone: string;
	username: string;
	memberSince: string;
	accountType: string;
	admin: string;
	member: string;
	logout: string;
	editProfile: string;
	membershipDetails: string;
	membershipStatus: string;
	membershipType: string;
	approved: string;
	pending: string;
	blocked: string;
	general: string;
	active: string;
	loading: string;
}

interface Props {
	translations: Translations;
}

export default function ProfileClient({ translations: t }: Props) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams();
	const locale = (params.locale as string) || "en";
	const [membershipData, setMembershipData] = useState<Membership | null>(null);
	const [loading, setLoading] = useState(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [profilePhoto, setProfilePhoto] = useState<string>("");
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
	const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
	const [showSizeAlert, setShowSizeAlert] = useState(false);
	const [alertFileInfo, setAlertFileInfo] = useState<{ name: string; size: number } | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleDeleteAccount = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch("/api/user/delete-account", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: session?.user?.email,
				}),
			});

			if (response.ok) {
				// Send notification email
				await fetch("/api/email/account-deletion-notification", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: session?.user?.email,
						name: session?.user?.fullName || session?.user?.email || "User",
					}),
				});

				toast({
					title: "Account Deleted",
					description: "Your account has been permanently deleted. You will be redirected to the home page.",
				});

				// Sign out and redirect to home
				setTimeout(() => {
					signOut({ callbackUrl: "/" });
				}, 2000);
			} else {
				throw new Error("Failed to delete account");
			}
		} catch (error) {
			console.error("Delete account error:", error);
			toast({
				title: "Error",
				description: "Failed to delete account. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push(`/${locale}/login`);
			return;
		}

		// Fetch membership data including profile photo
		if (session?.user?.email) {
			fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`)
				.then((res) => res.json())
				.then((data) => {
					const memberData = Array.isArray(data) ? data[0] : data;
					if (memberData) {
						setMembershipData(memberData);
						if (memberData.profilePhoto) {
							setProfilePhoto(memberData.profilePhoto);
						}
					}
					setLoading(false);
				})
				.catch(() => setLoading(false));
		} else {
			setLoading(false);
		}

		// Fallback timeout to ensure loading state resolves even if API hangs
		const loadingTimeout = setTimeout(() => {
			setLoading(false);
		}, 5000);

		return () => clearTimeout(loadingTimeout);
	}, [status, session, router, locale]);

	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Store file info for display
		setSelectedFileName(file.name);
		setSelectedFileSize(file.size);

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast({
				title: "Invalid File",
				description: "Please select an image file (JPG, PNG, etc.)",
				variant: "destructive",
			});
			setSelectedFileName(null);
			setSelectedFileSize(null);
			return;
		}

		// Validate file size (300KB)
		const maxSize = 300 * 1024;
		if (file.size > maxSize) {
			const fileSizeKB = Math.round(file.size / 1024);
			setAlertFileInfo({ name: file.name, size: fileSizeKB });
			setShowSizeAlert(true);
			setSelectedFileName(null);
			setSelectedFileSize(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			return;
		}

		setUploading(true);

		try {
			const formData = new FormData();
			formData.append("photo", file);

			const response = await fetch("/api/users/profile-photo", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to upload photo");
			}

			setProfilePhoto(data.profilePhoto);
			setSelectedFileName(null);
			setSelectedFileSize(null);

			// Refresh membership data
			if (session?.user?.email) {
				const membershipResponse = await fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`);
				const membershipData = await membershipResponse.json();
				const memberData = Array.isArray(membershipData) ? membershipData[0] : membershipData;
				if (memberData) {
					setMembershipData(memberData);
				}
			}

			toast({
				title: "Success",
				description: "Profile photo updated successfully",
			});
		} catch (error: unknown) {
			console.error("Upload error:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to upload photo",
				variant: "destructive",
			});
		} finally {
			setUploading(false);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
				<div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand"></div>
				<p className="text-sm font-medium text-slate-500 animate-pulse">{t.loading}...</p>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	const username = session.user.email?.split("@")[0] || "N/A";
	const isAdmin = session.user.role === "admin" || session.user.role === "treasurer";

	const getStatusBadge = (membershipStatus?: string) => {
		switch (membershipStatus) {
			case "approved":
				return (
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
						<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
						{t.approved}
					</span>
				);
			case "blocked":
				return (
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
						<XCircle className="w-3.5 h-3.5 text-rose-600" />
						{t.blocked}
					</span>
				);
			case "pending":
			default:
				return (
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
						<Clock className="w-3.5 h-3.5 text-amber-600" />
						{t.pending}
					</span>
				);
		}
	};

	const formatDate = (date: string) => {
		try {
			return new Date(date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			return date;
		}
	};

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Admin Notice if viewing from admin account */}
			{isAdmin && (
				<div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 text-white text-xs">
					<div className="flex items-center gap-2">
						<Shield className="w-4 h-4 text-brand" />
						<span>You are signed in as an <strong>{session.user.role}</strong> viewing your personal member record.</span>
					</div>
					<Link
						href={`/${locale}/dashboard`}
						className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
					>
						<span>Open Admin Console</span>
						<ExternalLink className="w-3.5 h-3.5" />
					</Link>
				</div>
			)}

			{/* Executive Profile Hero Header Card */}
			<div className="relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
				{/* Top Accent Gradient Bar */}
				<div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-brand/80 relative" />

				<div className="px-6 pb-6 pt-0">
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14">
						{/* Avatar and Name */}
						<div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
							<div className="relative group">
								<div className="w-28 h-28 rounded-2xl border-4 border-white bg-slate-100 shadow-md overflow-hidden relative flex items-center justify-center flex-shrink-0">
									{profilePhoto ? (
										<Image
											src={profilePhoto}
											alt="Profile photo"
											width={112}
											height={112}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-gradient-to-br from-brand to-slate-800 flex items-center justify-center text-white text-3xl font-bold">
											{session.user.fullName?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "M"}
										</div>
									)}

									{/* Upload overlay trigger */}
									<button
										onClick={() => fileInputRef.current?.click()}
										disabled={uploading}
										className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
										title="Change profile photo"
									>
										{uploading ? (
											<div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white" />
										) : (
											<>
												<Camera className="w-6 h-6 mb-1" />
												<span className="text-[10px] font-medium">Update</span>
											</>
										)}
									</button>
								</div>

								{/* Mobile/visible camera button */}
								<button
									onClick={() => fileInputRef.current?.click()}
									disabled={uploading}
									className="sm:hidden absolute -bottom-1 -right-1 p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm"
								>
									<Camera className="w-4 h-4" />
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handlePhotoUpload}
									className="hidden"
								/>
							</div>

							<div className="space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<h1 className="text-xl md:text-2xl font-bold text-slate-900">
										{session.user.fullName || "Community Member"}
									</h1>
									{getStatusBadge(membershipData?.membershipStatus || "pending")}
								</div>
								<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
									<span>@{username}</span>
									<span>•</span>
									<span className="capitalize">{session.user.role === "admin" ? t.admin : t.member}</span>
									{membershipData?.membershipType && (
										<>
											<span>•</span>
											<span className="capitalize font-medium text-brand">
												{membershipData.membershipType} Tier
											</span>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-wrap items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading}
								className="text-xs h-9 border-slate-200 hover:bg-slate-50 text-slate-700"
							>
								<Upload className="w-3.5 h-3.5 mr-1.5" />
								{uploading ? "Uploading..." : "Change Photo"}
							</Button>

							<Link href={`/${locale}/profile/idcard`}>
								<Button
									variant="outline"
									size="sm"
									className="text-xs h-9 border-slate-200 hover:bg-slate-50 text-slate-700"
								>
									<CreditCard className="w-3.5 h-3.5 mr-1.5" />
									Digital ID
								</Button>
							</Link>

							<Link href={`/${locale}/profile/settings`}>
								<Button
									size="sm"
									className="text-xs h-9 bg-slate-900 hover:bg-slate-800 text-white"
								>
									<Settings className="w-3.5 h-3.5 mr-1.5" />
									Settings
								</Button>
							</Link>
						</div>
					</div>

					{/* File selection status note */}
					{selectedFileName && selectedFileSize && (
						<div className="mt-4 px-3 py-1.5 rounded-lg bg-brand/5 border border-brand/20 text-xs text-brand font-medium flex items-center justify-between">
							<span>Selected: {selectedFileName} ({Math.round(selectedFileSize / 1024)}KB)</span>
							<span className="text-[10px] text-slate-500">Max allowed: 300KB</span>
						</div>
					)}
				</div>
			</div>

			{/* Quick Member Metrics Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
					<div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						{t.membershipStatus}
					</div>
					<div className="mt-2 flex items-center justify-between">
						<div>{getStatusBadge(membershipData?.membershipStatus || "pending")}</div>
						<ShieldCheck className="w-4 h-4 text-slate-400" />
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
					<div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						{t.membershipType}
					</div>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-sm font-semibold text-slate-900 capitalize">
							{membershipData?.membershipType === "general" ? t.general : t.active}
						</span>
						<Award className="w-4 h-4 text-slate-400" />
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
					<div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						{t.memberSince}
					</div>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-sm font-semibold text-slate-900">
							{membershipData ? formatDate(membershipData.createdAt) : "Active"}
						</span>
						<Calendar className="w-4 h-4 text-slate-400" />
					</div>
				</div>

				<div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
					<div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						National Reg No
					</div>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-sm font-semibold text-slate-900 font-mono">
							{membershipData?.nationalMembershipNo || "Pending"}
						</span>
						<CreditCard className="w-4 h-4 text-slate-400" />
					</div>
				</div>
			</div>

			{/* Bento Details Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Personal Information Card */}
				<div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
					<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
								<User className="w-4 h-4" />
							</div>
							<h3 className="text-sm font-bold text-slate-900">{t.personalInfo}</h3>
						</div>
						<Link
							href={`/${locale}/profile/settings`}
							className="text-xs font-semibold text-brand hover:underline"
						>
							Edit
						</Link>
					</div>

					<div className="p-6 divide-y divide-slate-100">
						<div className="py-3 first:pt-0 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<User className="w-3.5 h-3.5 text-slate-400" />
								{t.fullName}
							</span>
							<span className="text-sm font-semibold text-slate-900 text-right">
								{session.user.fullName || "N/A"}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<User className="w-3.5 h-3.5 text-slate-400" />
								{t.username}
							</span>
							<span className="text-sm font-mono text-slate-800 text-right">
								@{username}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<Mail className="w-3.5 h-3.5 text-slate-400" />
								{t.email}
							</span>
							<span className="text-sm text-slate-800 text-right truncate max-w-[200px]">
								{session.user.email}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<Phone className="w-3.5 h-3.5 text-slate-400" />
								{t.phone}
							</span>
							<span className="text-sm font-semibold text-slate-900 text-right">
								{session.user.phone || "Not provided"}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<Shield className="w-3.5 h-3.5 text-slate-400" />
								{t.accountType}
							</span>
							<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
								{session.user.role}
							</span>
						</div>
					</div>
				</div>

				{/* Membership & Regional Details Card */}
				<div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
					<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
								<Users className="w-4 h-4" />
							</div>
							<h3 className="text-sm font-bold text-slate-900">{t.membershipDetails}</h3>
						</div>
						<span className="text-xs font-medium text-slate-400">Norway Registry</span>
					</div>

					<div className="p-6 divide-y divide-slate-100">
						<div className="py-3 first:pt-0 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<MapPin className="w-3.5 h-3.5 text-slate-400" />
								City (Norway)
							</span>
							<span className="text-sm font-semibold text-slate-900 text-right">
								{membershipData?.city || "Not provided"}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<MapPin className="w-3.5 h-3.5 text-slate-400" />
								Province (Nepal)
							</span>
							<span className="text-sm font-semibold text-slate-900 text-right capitalize">
								{membershipData?.province || "N/A"}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<MapPin className="w-3.5 h-3.5 text-slate-400" />
								District (Nepal)
							</span>
							<span className="text-sm font-semibold text-slate-900 text-right capitalize">
								{membershipData?.district || "N/A"}
							</span>
						</div>

						<div className="py-3 flex items-center justify-between gap-4">
							<span className="text-xs font-medium text-slate-500 flex items-center gap-2">
								<Briefcase className="w-3.5 h-3.5 text-slate-400" />
								Profession
							</span>
							<span className="text-sm font-semibold text-slate-900 text-right">
								{membershipData?.profession || "Member"}
							</span>
						</div>

						{membershipData?.skills && (
							<div className="py-3">
								<span className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-2">
									<Award className="w-3.5 h-3.5 text-slate-400" />
									Skills & Expertise
								</span>
								<p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
									{membershipData.skills}
								</p>
							</div>
						)}

						{membershipData?.volunteerInterest && membershipData.volunteerInterest.length > 0 && (
							<div className="py-3 last:pb-0">
								<span className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-2">
									<Heart className="w-3.5 h-3.5 text-slate-400" />
									Volunteer Areas
								</span>
								<div className="flex flex-wrap gap-1.5">
									{membershipData.volunteerInterest.map((interest: string, index: number) => (
										<span
											key={index}
											className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
										>
											{interest}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Account Security & Danger Zone */}
			<div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<h4 className="text-sm font-bold text-slate-900">Account Credentials & Data</h4>
					<p className="text-xs text-slate-500">
						Manage password authentication, security preferences, or permanently delete your account.
					</p>
				</div>
				<div className="flex items-center gap-2 flex-shrink-0">
					<Link href={`/${locale}/profile/settings`}>
						<Button variant="outline" size="sm" className="text-xs h-9">
							<Settings className="w-3.5 h-3.5 mr-1.5" />
							Security Settings
						</Button>
					</Link>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowDeleteDialog(true)}
						className="text-xs h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
					>
						<Trash2 className="w-3.5 h-3.5 mr-1.5" />
						Delete Account
					</Button>
				</div>
			</div>

			{/* File Size Alert Dialog */}
			<AlertDialog open={showSizeAlert} onOpenChange={setShowSizeAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-rose-600">
							<AlertCircle className="w-5 h-5" />
							File Too Large
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-3 pt-2 text-sm text-slate-600">
							{alertFileInfo && (
								<>
									<div>
										The selected file <strong className="text-slate-900">{alertFileInfo.name}</strong> is{" "}
										<strong className="text-rose-600">{alertFileInfo.size}KB</strong>.
									</div>
									<div>
										Maximum allowed photo size is <strong>300KB</strong>.
									</div>
									<div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1 text-xs">
										<p className="font-semibold text-slate-800">💡 Tips to reduce image size:</p>
										<ul className="list-disc ml-4 space-y-0.5 text-slate-600">
											<li>
												Compress for free with{" "}
												<a
													href="https://tinypng.com"
													target="_blank"
													rel="noopener noreferrer"
													className="text-brand font-semibold hover:underline"
												>
													TinyPNG
												</a>
											</li>
											<li>Export as JPG/JPEG for a smaller footprint.</li>
										</ul>
									</div>
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setShowSizeAlert(false)}>
							Got it
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Account Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-rose-600">Delete Account</AlertDialogTitle>
						<AlertDialogDescription className="text-sm text-slate-600">
							Are you sure you want to delete your account? This action is <strong>permanent and cannot be undone</strong>. 
							All your data, including profile information, membership records, and activity history will be permanently deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							onClick={() => setShowDeleteDialog(false)}
							variant="outline"
							className="mr-2"
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDeleteAccount}
							className="bg-rose-600 hover:bg-rose-700 text-white"
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete Forever"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
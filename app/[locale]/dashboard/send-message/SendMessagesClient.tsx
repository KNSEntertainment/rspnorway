"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Send, Users, AlertTriangle, Info, Calendar, Mail, Upload, X, Loader2, Eye, AlertCircle, Check, RefreshCw, UserCheck, Search, CheckSquare, Square, ShieldCheck, Paperclip, ExternalLink, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface ExecutiveMemberOption {
	_id: string;
	name: string;
	fullName?: string;
	email: string;
	position?: string;
	department?: string;
	imageUrl?: string;
	phone?: string;
}

interface MessageFormData {
	title: string;
	content: string;
	type: "general" | "announcement" | "alert" | "update" | "reminder";
	priority: "low" | "medium" | "high" | "urgent";
	recipientType: "all" | "executive" | "general" | "individual" | "specific";
	expiresAt: string;
	attachments: File[];
}

interface SentAdminMessage {
	_id: string;
	title: string;
	content: string;
	type: string;
	priority: string;
	recipientType: string;
	recipientDetails?: Array<{ id: string; name: string; email: string; position?: string }>;
	recipientEmails?: string[];
	attachments?: Array<{ filename: string; url: string; fileType?: string; size?: number }>;
	senderName?: string;
	senderPosition?: string;
	emailSent?: boolean;
	emailSentAt?: string;
	emailSentCount?: number;
	createdAt: string;
}

export default function SendMessagesClient() {
	const { data: session, status } = useSession();
	const { toast } = useToast();

	const [formData, setFormData] = useState<MessageFormData>({
		title: "",
		content: "",
		type: "general",
		priority: "medium",
		recipientType: "executive",
		expiresAt: "",
		attachments: [],
	});

	const [sendEmail, setSendEmail] = useState(true);
	const [sentMessages, setSentMessages] = useState<SentAdminMessage[]>([]);
	const [isLoadingSent, setIsLoadingSent] = useState(false);
	const [resendingId, setResendingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	// User permission & profile states
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isAdminUser, setIsAdminUser] = useState(false);
	const [userPosition, setUserPosition] = useState<string>("");
	const [userFullName, setUserFullName] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);

	// Executive members selection state
	const [executiveMembers, setExecutiveMembers] = useState<ExecutiveMemberOption[]>([]);
	const [isLoadingExecs, setIsLoadingExecs] = useState(false);
	const [selectedIndividualId, setSelectedIndividualId] = useState<string>("");
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const [memberSearchQuery, setMemberSearchQuery] = useState<string>("");

	// Fetch executive members list for recipient selection
	const fetchExecutiveMembers = useCallback(async () => {
		try {
			setIsLoadingExecs(true);
			const res = await fetch("/api/executive-members?all=true");
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data)) {
					setExecutiveMembers(data);
				}
			}
		} catch (err) {
			console.error("Error fetching executive members list:", err);
		} finally {
			setIsLoadingExecs(false);
		}
	}, []);

	// Fetch sent messages history
	const fetchSentMessages = useCallback(async () => {
		try {
			setIsLoadingSent(true);
			const res = await fetch("/api/messages?sent=true");
			if (res.ok) {
				const data = await res.json();
				setSentMessages(data.messages || []);
			}
		} catch (err) {
			console.error("Error fetching sent messages:", err);
		} finally {
			setIsLoadingSent(false);
		}
	}, []);

	// Check user authorization (Admin or Executive Member with ANY position)
	const checkUserAccess = useCallback(async () => {
		try {
			if (!session?.user?.email) return;

			let admin = session.user.role === "admin";
			let executive = session.user.membershipType === "executive" || admin || session.user.role === "treasurer";
			let position = (session.user as { position?: string }).position || (admin ? "Administrator" : "");
			let fullName = session.user.fullName || (session.user as { name?: string }).name || "";

			// Also verify with membership & user APIs
			try {
				const [membershipResponse, userResponse] = await Promise.all([fetch("/api/membership?email=" + encodeURIComponent(session.user.email)), fetch("/api/users?email=" + encodeURIComponent(session.user.email)).catch(() => null)]);

				if (userResponse && userResponse.ok) {
					const userData = await userResponse.json();
					const u = Array.isArray(userData) ? userData[0] : userData;
					if (u && (u.role === "admin" || u.role === "treasurer")) {
						admin = u.role === "admin";
						executive = true;
						position = u.role === "treasurer" ? "Treasurer" : "Administrator";
						if (u.fullName) fullName = u.fullName;
					}
				}

				if (membershipResponse && membershipResponse.ok) {
					const memberData = await membershipResponse.json();
					if (memberData && (memberData.membershipType === "executive" || memberData.position)) {
						executive = true;
						if (memberData.position) position = memberData.position;
						if (memberData.fullName) fullName = memberData.fullName;
					}
				}
			} catch (fetchErr) {
				console.error("Non-critical check error:", fetchErr);
			}

			const allowed = admin || executive;
			setIsAdminUser(admin);
			setIsAuthorized(allowed);
			setUserPosition(position || (admin ? "Administrator" : "Executive Member"));
			setUserFullName(fullName || session.user.email);

			if (allowed) {
				// Default non-admins to "executive" recipients
				if (!admin) {
					setFormData((prev) => ({ ...prev, recipientType: "executive" }));
				}
				fetchSentMessages();
				fetchExecutiveMembers();
			}
		} catch (error) {
			console.error("Error checking user access:", error);
		} finally {
			setIsLoading(false);
		}
	}, [session, fetchSentMessages, fetchExecutiveMembers]);

	useEffect(() => {
		if (status === "authenticated") {
			checkUserAccess();
		} else if (status === "unauthenticated") {
			setIsLoading(false);
		}
	}, [status, checkUserAccess]);

	// Filter executive members to exclude current logged-in member
	const otherExecutiveMembers = useMemo(() => {
		const currentEmail = session?.user?.email?.toLowerCase().trim();
		return executiveMembers.filter((m) => m.email && m.email.toLowerCase().trim() !== currentEmail).sort((a, b) => (a.name || a.fullName || "").localeCompare(b.name || b.fullName || ""));
	}, [executiveMembers, session?.user?.email]);

	// Filtered list for group selection search
	const filteredGroupMembers = useMemo(() => {
		if (!memberSearchQuery.trim()) return otherExecutiveMembers;
		const query = memberSearchQuery.toLowerCase().trim();
		return otherExecutiveMembers.filter((m) => (m.name || m.fullName || "").toLowerCase().includes(query) || (m.position || "").toLowerCase().includes(query) || (m.email || "").toLowerCase().includes(query));
	}, [otherExecutiveMembers, memberSearchQuery]);

	// Selected individual member object
	const selectedIndividualMember = useMemo(() => {
		return otherExecutiveMembers.find((m) => m._id === selectedIndividualId);
	}, [otherExecutiveMembers, selectedIndividualId]);

	// Selected group members objects
	const selectedGroupMembers = useMemo(() => {
		const idSet = new Set(selectedGroupIds);
		return otherExecutiveMembers.filter((m) => idSet.has(m._id));
	}, [otherExecutiveMembers, selectedGroupIds]);

	// Group selection helpers
	const toggleGroupMember = (id: string) => {
		setSelectedGroupIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
	};

	const selectAllGroupMembers = () => {
		setSelectedGroupIds(filteredGroupMembers.map((m) => m._id));
	};

	const clearGroupSelection = () => {
		setSelectedGroupIds([]);
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "announcement":
				return <Mail className="h-4 w-4" />;
			case "alert":
				return <AlertTriangle className="h-4 w-4" />;
			case "update":
				return <Info className="h-4 w-4" />;
			case "reminder":
				return <Calendar className="h-4 w-4" />;
			default:
				return <Mail className="h-4 w-4" />;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "bg-red-100 text-red-800 border-red-200";
			case "high":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "low":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "announcement":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "alert":
				return "bg-red-100 text-red-800 border-red-200";
			case "update":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "reminder":
				return "bg-amber-100 text-amber-800 border-amber-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const handleInputChange = (field: keyof MessageFormData, value: string | File[]) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const currentSize = formData.attachments.reduce((total, file) => total + file.size, 0);
		const newFilesSize = files.reduce((total, file) => total + file.size, 0);
		const totalSize = currentSize + newFilesSize;
		const maxSize = 5 * 1024 * 1024; // 5MB

		if (totalSize > maxSize) {
			toast({
				title: "File Size Limit Exceeded",
				description: "Total attachment size cannot exceed 5MB. Please remove some files.",
				variant: "destructive",
			});
			return;
		}

		setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }));
	};

	const removeAttachment = (index: number) => {
		setFormData((prev) => ({
			...prev,
			attachments: prev.attachments.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.content.trim()) {
			toast({
				title: "Error",
				description: "Message title and content are required.",
				variant: "destructive",
			});
			return;
		}

		// Validate recipient selection
		if (formData.recipientType === "individual") {
			if (!selectedIndividualId || !selectedIndividualMember) {
				toast({
					title: "Recipient Required",
					description: "Please select an executive member to send this message to.",
					variant: "destructive",
				});
				return;
			}
		}

		if (formData.recipientType === "specific") {
			if (selectedGroupIds.length === 0) {
				toast({
					title: "Recipients Required",
					description: "Please select at least one executive member to send this message to.",
					variant: "destructive",
				});
				return;
			}
		}

		setIsSubmitting(true);

		try {
			const submitData = new FormData();
			submitData.append("title", formData.title);
			submitData.append("content", formData.content);
			submitData.append("type", formData.type);
			submitData.append("priority", formData.priority);
			submitData.append("recipientType", formData.recipientType);
			submitData.append("sendEmail", String(sendEmail));

			if (formData.expiresAt) {
				submitData.append("expiresAt", formData.expiresAt);
			}

			// Add attachments
			formData.attachments.forEach((file, index) => {
				submitData.append(`attachment${index}`, file);
			});

			// Individual recipient payload
			if (formData.recipientType === "individual" && selectedIndividualMember) {
				const detail = {
					id: selectedIndividualMember._id,
					name: selectedIndividualMember.name || selectedIndividualMember.fullName || "Executive Member",
					email: selectedIndividualMember.email,
					position: selectedIndividualMember.position || "Executive Member",
				};
				submitData.append("recipientDetails", JSON.stringify([detail]));
				submitData.append("recipientEmails", JSON.stringify([selectedIndividualMember.email]));
			}

			// Specific multiple recipients payload
			if (formData.recipientType === "specific" && selectedGroupMembers.length > 0) {
				const details = selectedGroupMembers.map((m) => ({
					id: m._id,
					name: m.name || m.fullName || "Executive Member",
					email: m.email,
					position: m.position || "Executive Member",
				}));
				submitData.append("recipientDetails", JSON.stringify(details));
				submitData.append("recipientEmails", JSON.stringify(selectedGroupMembers.map((m) => m.email)));
			}

			const response = await fetch("/api/messages", {
				method: "POST",
				body: submitData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to send message");
			}

			const result = await response.json();

			if (result.emailNotificationSent) {
				toast({
					title: "Message & Email Sent",
					description: `Delivered to member portal and emailed to ${result.emailSentCount || 0} recipient(s).`,
				});
			} else {
				toast({
					title: "Message Sent",
					description: "Your message has been posted to the recipient's portal successfully.",
				});
			}

			fetchSentMessages();

			// Reset form
			setFormData({
				title: "",
				content: "",
				type: "general",
				priority: "medium",
				recipientType: isAdminUser ? "executive" : "executive",
				expiresAt: "",
				attachments: [],
			});
			setSelectedIndividualId("");
			setSelectedGroupIds([]);
			setMemberSearchQuery("");
		} catch (error) {
			console.error("Error sending message:", error);
			toast({
				title: "Error Sending Message",
				description: error instanceof Error ? error.message : "Failed to send message",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendEmail = async (messageId?: string) => {
		setResendingId(messageId || "latest");
		try {
			const res = await fetch("/api/messages/resend", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(messageId ? { messageId } : {}),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to send email");
			}
			toast({
				title: "Email Delivered",
				description: data.message || `Delivered to ${data.sentCount} recipients.`,
			});
			fetchSentMessages();
		} catch (err) {
			console.error("Error sending email:", err);
			toast({
				title: "Error Sending Email",
				description: err instanceof Error ? err.message : "Failed to send email",
				variant: "destructive",
			});
		} finally {
			setResendingId(null);
		}
	};

	const handleDeleteMessage = async (messageId: string, title: string) => {
		const confirmed = window.confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently delete the message and remove any attached files from Cloudinary. (Sent email notifications cannot be recalled).`);
		if (!confirmed) return;

		setDeletingId(messageId);
		try {
			const res = await fetch(`/api/messages/${messageId}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to delete message");
			}
			toast({
				title: "Message & Attachments Deleted",
				description: data.message || "Message and linked Cloudinary attachments were deleted successfully.",
			});
			setSentMessages((prev) => prev.filter((m) => m._id !== messageId));
		} catch (err) {
			console.error("Error deleting message:", err);
			toast({
				title: "Deletion Failed",
				description: err instanceof Error ? err.message : "Failed to delete message",
				variant: "destructive",
			});
		} finally {
			setDeletingId(null);
		}
	};

	// const formatDate = (dateString: string) => {
	// 	if (!dateString) return "No expiration";
	// 	const date = new Date(dateString);
	// 	return date.toLocaleDateString("en-US", {
	// 		year: "numeric",
	// 		month: "short",
	// 		day: "numeric",
	// 	});
	// };

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<Loader2 className="h-8 w-8 animate-spin text-brand" />
			</div>
		);
	}

	if (!session) {
		return (
			<div className="max-w-4xl mx-auto">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Please log in with an Executive Member or Admin account to access messaging.</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!isAuthorized) {
		return (
			<div className="max-w-4xl mx-auto">
				<Alert className="border-amber-200 bg-amber-50 text-amber-900">
					<AlertCircle className="h-4 w-4 text-amber-600" />
					<AlertDescription>Access restricted. You need an Executive Membership (with any position) or Administrator account to send messages.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header Banner */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-brand/10 via-brand/5 to-white p-5 rounded-2xl border border-brand/20">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Send Messages</h1>
						<Badge className="bg-brand text-white border-0 text-xs">
							<ShieldCheck className="h-3 w-3 mr-1" />
							Executive Access
						</Badge>
					</div>
					<p className="text-sm text-gray-600 mt-1">Broadcast announcements to all executive members or send direct messages to individual executive committee members.</p>
				</div>
				<div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs self-start sm:self-auto">
					<div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs flex-shrink-0">{userFullName?.[0]?.toUpperCase() || "E"}</div>
					<div className="min-w-0">
						<div className="text-xs font-bold text-gray-900 truncate">{userFullName}</div>
						<div className="text-[11px] text-brand font-medium truncate">{userPosition || "Executive Member"}</div>
					</div>
				</div>
			</div>

			{/* Compose Form */}
			<Card className="border-gray-200 shadow-xs">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg font-bold flex items-center gap-2">
						<Send className="h-5 w-5 text-brand" />
						Compose Message
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title */}
						<div>
							<Label htmlFor="title" className="text-sm font-semibold text-gray-900">
								Message Title *
							</Label>
							<Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="e.g., Executive Meeting Agenda & Decision Items" required className="mt-1.5" />
						</div>

						{/* Content */}
						<div>
							<Label htmlFor="content" className="text-sm font-semibold text-gray-900">
								Message Content *
							</Label>
							<Textarea id="content" value={formData.content} onChange={(e) => handleInputChange("content", e.target.value)} placeholder="Write your announcement, decision, or update here..." required rows={7} className="mt-1.5 resize-none" />
							<div className="flex justify-between items-center text-xs text-gray-500 mt-1">
								<span>{formData.content.length} characters</span>
								<span>Supports multi-line text and announcements</span>
							</div>
						</div>

						{/* Type and Priority */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label className="text-sm font-semibold text-gray-900">Message Type</Label>
								<Select value={formData.type} onValueChange={(value: "general" | "announcement" | "alert" | "update" | "reminder") => handleInputChange("type", value)}>
									<SelectTrigger className="mt-1.5">
										<SelectValue placeholder="Select message type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="general">General Message</SelectItem>
										<SelectItem value="announcement">Announcement</SelectItem>
										<SelectItem value="alert">Alert / Urgent Notice</SelectItem>
										<SelectItem value="update">Progress Update</SelectItem>
										<SelectItem value="reminder">Reminder / Follow-up</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label className="text-sm font-semibold text-gray-900">Priority Level</Label>
								<Select value={formData.priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => handleInputChange("priority", value)}>
									<SelectTrigger className="mt-1.5">
										<SelectValue placeholder="Select priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low Priority</SelectItem>
										<SelectItem value="medium">Medium Priority (Standard)</SelectItem>
										<SelectItem value="high">High Priority</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Recipient Selection */}
						<div className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
							<div>
								<Label className="text-sm font-bold text-gray-900">Send To (Recipients) *</Label>
								<p className="text-xs text-gray-500 mt-0.5">Choose whether to broadcast to all executive members or select individual recipients.</p>
							</div>

							<Select
								value={formData.recipientType}
								onValueChange={(value: "all" | "executive" | "general" | "individual" | "specific") => {
									handleInputChange("recipientType", value);
								}}
							>
								<SelectTrigger className="bg-white">
									<SelectValue placeholder="Select recipients" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="executive">
										<span className="font-medium">All Executive Members (Bulk Broadcast)</span>
									</SelectItem>
									<SelectItem value="individual">
										<span className="font-medium">Individual Executive Member (Direct Message)</span>
									</SelectItem>
									<SelectItem value="specific">
										<span className="font-medium">Selected Executive Members (Multiple Specific)</span>
									</SelectItem>
									{isAdminUser && (
										<>
											<SelectItem value="all">
												<span>All Members (Executive & General) [Admin only]</span>
											</SelectItem>
											<SelectItem value="general">
												<span>General Members Only [Admin only]</span>
											</SelectItem>
										</>
									)}
								</SelectContent>
							</Select>

							{/* INDIVIDUAL RECIPIENT PICKER */}
							{formData.recipientType === "individual" && (
								<div className="mt-3 space-y-2 pt-2 border-t border-slate-200">
									<Label className="text-xs font-semibold text-gray-700">Select Executive Member Recipient:</Label>

									{isLoadingExecs ? (
										<div className="flex items-center gap-2 text-xs text-gray-500 py-2">
											<Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
											Loading executive members list...
										</div>
									) : otherExecutiveMembers.length === 0 ? (
										<p className="text-xs text-amber-700 py-1">No other executive members found in the directory.</p>
									) : (
										<Select value={selectedIndividualId} onValueChange={(val) => setSelectedIndividualId(val)}>
											<SelectTrigger className="bg-white text-sm">
												<SelectValue placeholder="-- Choose an executive member --" />
											</SelectTrigger>
											<SelectContent className="max-h-64">
												{otherExecutiveMembers.map((m) => (
													<SelectItem key={m._id} value={m._id}>
														<div className="flex items-center gap-2">
															<span className="font-medium text-gray-900">{m.name || m.fullName}</span>
															<span className="text-xs text-brand bg-brand/10 px-1.5 py-0.5 rounded">{m.position || "Executive Member"}</span>
															<span className="text-xs text-gray-400">({m.email})</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}

									{/* Selected Preview Card */}
									{selectedIndividualMember && (
										<div className="flex items-center justify-between p-3 bg-white rounded-lg border border-brand/30 shadow-2xs mt-2">
											<div className="flex items-center gap-3">
												<div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs flex-shrink-0">{(selectedIndividualMember.name || selectedIndividualMember.fullName || "E")[0].toUpperCase()}</div>
												<div>
													<div className="text-sm font-bold text-gray-900 flex items-center gap-2">
														{selectedIndividualMember.name || selectedIndividualMember.fullName}
														<Badge variant="outline" className="text-[11px] text-brand border-brand/30 font-medium">
															{selectedIndividualMember.position || "Executive Member"}
														</Badge>
													</div>
													<div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
														<Mail className="h-3 w-3" />
														{selectedIndividualMember.email}
													</div>
												</div>
											</div>
											<Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIndividualId("")} className="text-xs text-gray-400 hover:text-red-600">
												<X className="h-4 w-4" />
											</Button>
										</div>
									)}
								</div>
							)}

							{/* SPECIFIC GROUP PICKER */}
							{formData.recipientType === "specific" && (
								<div className="mt-3 space-y-3 pt-2 border-t border-slate-200">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
										<Label className="text-xs font-semibold text-gray-700">Select Executive Members ({selectedGroupIds.length} selected):</Label>
										<div className="flex items-center gap-2 text-xs">
											<Button type="button" variant="ghost" size="sm" onClick={selectAllGroupMembers} className="h-7 text-xs text-brand hover:text-brand hover:bg-brand/10 px-2">
												Select All
											</Button>
											<span className="text-gray-300">|</span>
											<Button type="button" variant="ghost" size="sm" onClick={clearGroupSelection} className="h-7 text-xs text-gray-500 hover:text-gray-900 px-2">
												Clear All
											</Button>
										</div>
									</div>

									{/* Search Filter */}
									<div className="relative">
										<Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
										<Input value={memberSearchQuery} onChange={(e) => setMemberSearchQuery(e.target.value)} placeholder="Search by name, position or email..." className="pl-8 text-xs bg-white h-8" />
									</div>

									{/* Checklist Container */}
									<div className="max-h-56 overflow-y-auto space-y-1 bg-white p-2 rounded-lg border border-gray-200 divide-y divide-gray-100">
										{filteredGroupMembers.length === 0 ? (
											<div className="text-center py-4 text-xs text-gray-400">No matching executive members found.</div>
										) : (
											filteredGroupMembers.map((m) => {
												const isChecked = selectedGroupIds.includes(m._id);
												return (
													<div key={m._id} onClick={() => toggleGroupMember(m._id)} className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isChecked ? "bg-brand/5 border border-brand/20" : "hover:bg-slate-50"}`}>
														<div className="flex items-center gap-2.5 min-w-0">
															{isChecked ? <CheckSquare className="h-4 w-4 text-brand flex-shrink-0" /> : <Square className="h-4 w-4 text-gray-300 flex-shrink-0" />}
															<div className="min-w-0">
																<div className="text-xs font-bold text-gray-900 truncate">{m.name || m.fullName}</div>
																<div className="text-[11px] text-gray-500 truncate flex items-center gap-1.5">
																	<span>{m.position || "Executive Member"}</span>
																	<span>•</span>
																	<span>{m.email}</span>
																</div>
															</div>
														</div>
														<Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0 font-normal">
															{m.position || "Executive"}
														</Badge>
													</div>
												);
											})
										)}
									</div>

									{/* Selected Chips */}
									{selectedGroupMembers.length > 0 && (
										<div className="flex flex-wrap gap-1.5 pt-1">
											{selectedGroupMembers.map((m) => (
												<span key={m._id} className="inline-flex items-center gap-1 text-xs bg-white text-gray-800 border border-brand/30 px-2 py-0.5 rounded-full shadow-2xs">
													<span className="font-semibold text-brand">{m.name || m.fullName}</span>
													<span className="text-[10px] text-gray-500">({m.position || "Exec"})</span>
													<button type="button" onClick={() => toggleGroupMember(m._id)} className="text-gray-400 hover:text-red-500 ml-0.5">
														<X className="h-3 w-3" />
													</button>
												</span>
											))}
										</div>
									)}
								</div>
							)}

							{/* BULK EXECUTIVE BANNER */}
							{formData.recipientType === "executive" && (
								<div className="flex items-center gap-2 p-2.5 bg-blue-50/80 rounded-lg border border-blue-200 text-xs text-blue-800 mt-2">
									<Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
									<span>
										This message will be broadcast to <strong>all active executive committee members</strong> ({otherExecutiveMembers.length + 1} members).
									</span>
								</div>
							)}
						</div>

						{/* Expiration Date */}
						<div>
							<Label htmlFor="expiresAt" className="text-sm font-semibold text-gray-900">
								Expiration Date (Optional)
							</Label>
							<Input id="expiresAt" type="date" value={formData.expiresAt} onChange={(e) => handleInputChange("expiresAt", e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-1.5" />
							<p className="text-xs text-gray-500 mt-1">Message will be automatically archived after this date. Leave blank for no expiration.</p>
						</div>

						{/* Attachments */}
						<div>
							<Label className="text-sm font-semibold text-gray-900">Attachments</Label>
							<div className="mt-1.5">
								<div className="border-2 border-dashed border-gray-200 hover:border-brand/40 rounded-xl p-4 text-center transition-colors">
									<Upload className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
									<p className="text-xs text-gray-600 mb-2">Attach PDF, images, or documents (max 5 MB total)</p>
									<Input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
									<Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()} className="text-xs">
										Select Files
									</Button>
								</div>

								{formData.attachments.length > 0 && (
									<div className="mt-3 space-y-2">
										<div className="flex justify-between items-center text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
											<span>Total: {(formData.attachments.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB / 5 MB</span>
											<span>{formData.attachments.length} file(s) attached</span>
										</div>

										{formData.attachments.map((file, index) => (
											<div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-200">
												<div className="flex items-center gap-2 truncate">
													<Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
													<span className="font-medium text-gray-800 truncate">{file.name}</span>
													<span className="text-gray-400 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
												</div>
												<Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
													<X className="h-3.5 w-3.5" />
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Email Notification Option */}
						<div className="flex items-start gap-3 p-4 bg-brand/5 rounded-xl border border-brand/20">
							<input type="checkbox" id="sendEmail" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer" />
							<div className="cursor-pointer" onClick={() => setSendEmail(!sendEmail)}>
								<Label htmlFor="sendEmail" className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-1.5">
									<Mail className="h-4 w-4 text-brand" />
									Deliver as direct email notification
								</Label>
								<p className="text-xs text-gray-600 mt-0.5">When enabled, the email service will instantly deliver this message to the recipients&apos; private email inboxes in addition to their portal messages.</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 pt-2">
							<Dialog open={showPreview} onOpenChange={setShowPreview}>
								<DialogTrigger asChild>
									<Button type="button" variant="outline" className="flex items-center gap-2 text-sm">
										<Eye className="h-4 w-4" />
										Preview Message
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Message Preview</DialogTitle>
										<DialogDescription>Review your message details before sending to executive members.</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 pt-2">
										<div className="flex flex-wrap items-center gap-2">
											{getTypeIcon(formData.type)}
											<h3 className="text-lg font-bold text-gray-900">{formData.title || "Untitled Message"}</h3>
											<Badge className={getPriorityColor(formData.priority)}>{formData.priority}</Badge>
											<Badge className={getTypeColor(formData.type)}>{formData.type}</Badge>
										</div>

										<div className="p-3 bg-slate-50 rounded-lg text-xs text-gray-600 space-y-1 border border-slate-200">
											<div>
												<span className="font-semibold text-gray-800">Sender:</span> {userFullName} ({userPosition || "Executive Member"})
											</div>
											<div>
												<span className="font-semibold text-gray-800">Recipients:</span> {formData.recipientType === "executive" ? `All Executive Members (${otherExecutiveMembers.length + 1} members)` : formData.recipientType === "individual" ? (selectedIndividualMember ? `${selectedIndividualMember.name || selectedIndividualMember.fullName} (${selectedIndividualMember.position || "Exec"}) - ${selectedIndividualMember.email}` : "None selected") : formData.recipientType === "specific" ? `${selectedGroupMembers.length} Executive Member(s): ${selectedGroupMembers.map((m) => m.name || m.fullName).join(", ")}` : formData.recipientType}
											</div>
											<div>
												<span className="font-semibold text-gray-800">Email Delivery:</span> {sendEmail ? "Enabled (Email will be sent to recipients)" : "Portal only (No email sent)"}
											</div>
										</div>

										<div className="whitespace-pre-wrap text-sm text-gray-800 p-4 bg-white rounded-lg border border-gray-100 max-h-60 overflow-y-auto">{formData.content || "No message content."}</div>

										{formData.attachments.length > 0 && (
											<div className="text-xs text-gray-500">
												<span className="font-semibold">Attachments:</span> {formData.attachments.map((a) => a.name).join(", ")}
											</div>
										)}
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setShowPreview(false)}>
											Back to Edit
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							<Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()} className="bg-brand hover:bg-brand/90 text-white font-semibold flex items-center gap-2">
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Sending Message...
									</>
								) : (
									<>
										<Send className="h-4 w-4" />
										Send Message
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Sent Messages History */}
			<Card className="border-gray-200 shadow-xs">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<div>
						<CardTitle className="text-lg font-bold flex items-center gap-2">
							<Mail className="h-5 w-5 text-brand" />
							Sent Messages History
						</CardTitle>
						<p className="text-xs text-gray-500 mt-0.5">Review past messages dispatched by executive leadership and resend emails when needed.</p>
					</div>
					<Button variant="outline" size="sm" onClick={fetchSentMessages} disabled={isLoadingSent} className="text-xs h-8">
						<RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingSent ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</CardHeader>
				<CardContent>
					{isLoadingSent && sentMessages.length === 0 ? (
						<div className="flex items-center justify-center py-10">
							<Loader2 className="h-6 w-6 animate-spin text-brand" />
						</div>
					) : sentMessages.length > 0 ? (
						<div className="divide-y divide-gray-100">
							{sentMessages.map((msg) => {
								const isIndividual = msg.recipientType === "individual";
								const isSpecific = msg.recipientType === "specific";
								const recipientLabel = isIndividual ? (msg.recipientDetails?.[0]?.name ? `Direct to: ${msg.recipientDetails[0].name} (${msg.recipientDetails[0].position || "Exec"})` : "Direct Executive Message") : isSpecific ? `${msg.recipientDetails?.length || msg.recipientEmails?.length || "Selected"} Executive Members` : `${msg.recipientType} Members`;

								return (
									<div key={msg._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div className="space-y-1.5 min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">{msg.title}</h4>
												<Badge variant="outline" className={`text-xs capitalize ${isIndividual ? "bg-purple-50 text-purple-700 border-purple-200" : isSpecific ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
													{recipientLabel}
												</Badge>
												<Badge className={`text-xs ${getPriorityColor(msg.priority)}`}>{msg.priority}</Badge>
											</div>

											<p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{msg.content}</p>

											<div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
												{msg.senderName && (
													<span className="text-gray-600 font-medium flex items-center gap-1">
														<UserCheck className="h-3 w-3 text-gray-400" />
														From: {msg.senderName} {msg.senderPosition ? `(${msg.senderPosition})` : ""}
													</span>
												)}
												<span>
													Sent:{" "}
													{new Date(msg.createdAt).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
												{msg.emailSent ? (
													<span className="text-emerald-700 font-medium inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
														<Check className="h-3 w-3" /> Emailed to {msg.emailSentCount || 1} recipient(s)
													</span>
												) : (
													<span className="text-amber-700 font-medium inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
														<AlertCircle className="h-3 w-3" /> Portal only (not emailed)
													</span>
												)}
											</div>

											{/* Attachments list with clickable links */}
											{Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
												<div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
													<span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
														<Paperclip className="h-3 w-3 text-brand" />
														Attachments ({msg.attachments.length}):
													</span>
													{msg.attachments.map((att, idx) => {
														const isPdf = att.filename?.toLowerCase().endsWith(".pdf") || att.fileType?.includes("pdf");
														const isImg = att.filename?.match(/\.(jpg|jpeg|png|webp|gif)$/i) || att.fileType?.startsWith("image");
														return (
															<a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 hover:bg-brand/10 text-slate-700 hover:text-brand border border-slate-200 transition-colors shadow-2xs" title={`Click to open ${att.filename} in new tab`}>
																{isPdf ? <FileText className="h-3.5 w-3.5 text-red-500 flex-shrink-0" /> : isImg ? <ImageIcon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" /> : <Paperclip className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
																<span className="max-w-[180px] truncate">{att.filename}</span>
																{att.size ? <span className="text-[10px] text-gray-400">({(att.size / 1024).toFixed(0)} KB)</span> : null}
																<ExternalLink className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
															</a>
														);
													})}
												</div>
											)}
										</div>

										<div className="flex items-center gap-2 flex-shrink-0 self-start md:self-auto">
											<Button variant={msg.emailSent ? "outline" : "default"} size="sm" disabled={resendingId === msg._id} onClick={() => handleResendEmail(msg._id)} className={`text-xs font-semibold ${msg.emailSent ? "hover:border-brand hover:text-brand" : "bg-brand hover:bg-brand/90 text-white"}`}>
												{resendingId === msg._id ? (
													<>
														<Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
														Sending...
													</>
												) : (
													<>
														<Mail className="h-3.5 w-3.5 mr-1.5" />
														{msg.emailSent ? "Resend Email" : "Send as Email"}
													</>
												)}
											</Button>

											<Button variant="outline" size="sm" disabled={deletingId === msg._id} onClick={() => handleDeleteMessage(msg._id, msg.title)} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 hover:border-red-200" title="Delete message and its Cloudinary attachments">
												{deletingId === msg._id ? (
													<>
														<Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
														Deleting...
													</>
												) : (
													<>
														<Trash2 className="h-3.5 w-3.5 mr-1" />
														Delete
													</>
												)}
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500 text-sm">No messages sent yet. Compose a message above to get started.</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

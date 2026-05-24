"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { 
	Send, 
	Users, 
	AlertTriangle, 
	Info, 
	Calendar, 
	Mail, 
	Upload, 
	X, 
	Loader2,
	Eye,
	AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface MessageFormData {
	title: string;
	content: string;
	type: "announcement" | "reminder" | "update" | "alert" | "general";
	priority: "low" | "medium" | "high" | "urgent";
	recipientType: "all" | "executive" | "general";
	expiresAt: string;
	attachments: File[];
}

export default function SendMessagesClient() {
	const { data: session, status } = useSession();
	const { toast } = useToast();
	
	const [formData, setFormData] = useState<MessageFormData>({
		title: "",
		content: "",
		type: "general",
		priority: "medium",
		recipientType: "all",
		expiresAt: "",
		attachments: [],
	});
	
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const checkAdminStatus = useCallback(async () => {
		try {
			// Check both Users collection (for admin role) and Membership collection (for executive role)
			const [membershipResponse, userResponse] = await Promise.all([
				fetch("/api/membership?email=" + session?.user?.email),
				fetch("/api/users?email=" + session?.user?.email)
			]);

			let isAdminUser = false;
			let isExecutiveMember = false;

			// Check Users collection for admin role
			if (userResponse.ok) {
				const userData = await userResponse.json();
				// Handle different response formats
				const user = Array.isArray(userData) ? userData[0] : userData;
				if (user && user.role === "admin") {
					isAdminUser = true;
				}
			}

			// Check Membership collection for executive role
			if (membershipResponse.ok) {
				const memberData = await membershipResponse.json();
				if (memberData && memberData.membershipType === "executive") {
					isExecutiveMember = true;
				}
			}

			// User can send messages if they are admin in Users collection OR executive member
			setIsAdmin(isAdminUser || isExecutiveMember);

		} catch (error) {
			console.error("Error checking admin status:", error);
		} finally {
			setIsLoading(false);
		}
	}, [session?.user?.email]);

	// Check if user is admin
	useEffect(() => {
		if (status === "authenticated") {
			checkAdminStatus();
		}
	}, [status, checkAdminStatus]);

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
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		
		// Calculate total size including existing attachments
		const currentSize = formData.attachments.reduce((total, file) => total + file.size, 0);
		const newFilesSize = files.reduce((total, file) => total + file.size, 0);
		const totalSize = currentSize + newFilesSize;
		
		// 5MB = 5 * 1024 * 1024 bytes
		const maxSize = 5 * 1024 * 1024;
		
		if (totalSize > maxSize) {
			toast({
				title: "File Size Limit Exceeded",
				description: "Total attachment size cannot exceed 5MB. Please remove some files.",
				variant: "destructive",
			});
			return;
		}
		
		setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
	};

	const removeAttachment = (index: number) => {
		setFormData(prev => ({
			...prev,
			attachments: prev.attachments.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!formData.title.trim() || !formData.content.trim()) {
			toast({
				title: "Error",
				description: "Title and content are required",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Create FormData for file uploads
			const submitData = new FormData();
			submitData.append("title", formData.title);
			submitData.append("content", formData.content);
			submitData.append("type", formData.type);
			submitData.append("priority", formData.priority);
			submitData.append("recipientType", formData.recipientType);
			
			if (formData.expiresAt) {
				submitData.append("expiresAt", formData.expiresAt);
			}

			// Add files
			formData.attachments.forEach((file, index) => {
				submitData.append(`attachment${index}`, file);
			});

			const response = await fetch("/api/messages", {
				method: "POST",
				body: submitData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to send message");
			}

			await response.json();

			toast({
				title: "Message Sent",
				description: "Your message has been sent successfully to the recipients.",
			});

			// Reset form
			setFormData({
				title: "",
				content: "",
				type: "general",
				priority: "medium",
				recipientType: "all",
				expiresAt: "",
				attachments: [],
			});

		} catch (error) {
			console.error("Error sending message:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to send message",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "No expiration";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-center min-h-64">
					<Loader2 className="h-8 w-8 animate-spin text-brand" />
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="max-w-4xl mx-auto">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Please log in to access the admin panel.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="max-w-4xl mx-auto">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Access denied. You need executive membership to send messages.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Send Messages</h1>
				<p className="text-gray-600">
					Send announcements, updates, and important information to PNSB-Norway members.
				</p>
			</div>

			{/* Message Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Send className="h-5 w-5" />
						Compose Message
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title */}
						<div>
							<Label htmlFor="title" className="text-base font-medium">
								Message Title *
							</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => handleInputChange("title", e.target.value)}
								placeholder="Enter message title"
								required
								className="mt-1"
							/>
						</div>

						{/* Content */}
						<div>
							<Label htmlFor="content" className="text-base font-medium">
								Message Content *
							</Label>
							<Textarea
								id="content"
								value={formData.content}
								onChange={(e) => handleInputChange("content", e.target.value)}
								placeholder="Type your message here..."
								required
								rows={8}
								className="mt-1 resize-none"
							/>
							<p className="text-sm text-gray-500 mt-1">
								{formData.content.length} characters
							</p>
						</div>

						{/* Type and Priority */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label className="text-base font-medium">Message Type</Label>
								<Select
									value={formData.type}
									onValueChange={(value: "general" | "announcement" | "alert" | "update" | "reminder") => handleInputChange("type", value)}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select message type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="general">General</SelectItem>
										<SelectItem value="announcement">Announcement</SelectItem>
										<SelectItem value="alert">Alert</SelectItem>
										<SelectItem value="update">Update</SelectItem>
										<SelectItem value="reminder">Reminder</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label className="text-base font-medium">Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={(value: "low" | "medium" | "high" | "urgent") => handleInputChange("priority", value)}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Recipient Type */}
						<div>
							<Label className="text-base font-medium">Send To</Label>
							<Select
								value={formData.recipientType}
								onValueChange={(value: "all" | "executive" | "general") => handleInputChange("recipientType", value)}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Select recipients" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Members</SelectItem>
									<SelectItem value="executive">Executive Members Only</SelectItem>
									<SelectItem value="general">General Members Only</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Expiration Date */}
						<div>
							<Label htmlFor="expiresAt" className="text-base font-medium">
								Expiration Date (Optional)
							</Label>
							<Input
								id="expiresAt"
								type="date"
								value={formData.expiresAt}
								onChange={(e) => handleInputChange("expiresAt", e.target.value)}
								min={new Date().toISOString().split('T')[0]}
								className="mt-1"
							/>
							<p className="text-sm text-gray-500 mt-1">
								Message will be hidden after this date. Leave empty for no expiration.
							</p>
						</div>

						{/* File Attachments */}
						<div>
							<Label className="text-base font-medium">Attachments</Label>
							<div className="mt-1">
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
									<Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p className="text-sm text-gray-600 mb-2">
										Drag and drop files here, or click to select
									</p>
									<Input
										type="file"
										multiple
										onChange={handleFileChange}
										className="hidden"
										id="file-upload"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => document.getElementById('file-upload')?.click()}
									>
										Select Files
									</Button>
								</div>

								{formData.attachments.length > 0 && (
									<div className="mt-4 space-y-2">
										{/* Size indicator */}
										<div className="flex justify-between items-center p-2 bg-blue-50 rounded">
											<span className="text-sm text-blue-800">
												Total size: {(formData.attachments.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB / 5 MB
											</span>
											<span className="text-sm text-blue-600">
												{((5 - (formData.attachments.reduce((total, file) => total + file.size, 0) / 1024 / 1024)) * 1024).toFixed(0)} KB remaining
											</span>
										</div>
										
										{formData.attachments.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 bg-gray-50 rounded"
											>
												<div className="flex items-center gap-2">
													<Users className="h-4 w-4 text-gray-500" />
													<span className="text-sm">{file.name}</span>
													<span className="text-xs text-gray-500">
														({(file.size / 1024).toFixed(1)} KB)
													</span>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeAttachment(index)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<Dialog open={showPreview} onOpenChange={setShowPreview}>
								<DialogTrigger asChild>
									<Button type="button" variant="outline">
										<Eye className="h-4 w-4 mr-2" />
										Preview Message
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Message Preview</DialogTitle>
										<DialogDescription>
											Review your message before sending
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="flex items-center gap-2">
											{getTypeIcon(formData.type)}
											<h3 className="text-lg font-semibold">{formData.title || "Untitled"}</h3>
											<Badge className={getPriorityColor(formData.priority)}>
												{formData.priority}
											</Badge>
											<Badge className={getTypeColor(formData.type)}>
												{formData.type}
											</Badge>
										</div>
										<div className="whitespace-pre-wrap text-gray-700">
											{formData.content || "No content"}
										</div>
										<div className="text-sm text-gray-500 border-t pt-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<span className="font-medium">Recipients:</span> {formData.recipientType}
												</div>
												<div>
													<span className="font-medium">Expires:</span> {formatDate(formData.expiresAt)}
												</div>
											</div>
											{formData.attachments.length > 0 && (
												<div className="mt-2">
													<span className="font-medium">Attachments:</span> {formData.attachments.length} file(s)
												</div>
											)}
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setShowPreview(false)}>
											Edit Message
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							<Button
								type="submit"
								disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Sending...
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Send Message
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

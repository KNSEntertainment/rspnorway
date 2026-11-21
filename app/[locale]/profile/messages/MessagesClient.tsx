"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Mail, Bell, AlertTriangle, Info, Calendar, User, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ChevronsUpDown, Loader2, CheckCircle, FileText, Archive, Send, Paperclip, ExternalLink, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
	_id: string;
	title: string;
	content: string;
	type: "announcement" | "reminder" | "update" | "alert" | "general";
	priority: "low" | "medium" | "high" | "urgent";
	recipientType: "all" | "executive" | "general" | "specific" | "individual";
	sentBy?: {
		_id?: string;
		fullName?: string;
		email?: string;
	};
	senderName?: string;
	senderPosition?: string;
	isActive: boolean;
	expiresAt: string | null;
	readBy: Array<{
		memberId: string;
		readAt: string;
	}>;
	attachments?: Array<{
		filename: string;
		url: string;
		fileType?: string;
		size?: number;
	}>;
	createdAt: string;
	updatedAt: string;
}

interface Pagination {
	currentPage: number;
	totalPages: number;
	totalMessages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export default function MessagesClient() {
	const { data: session, status } = useSession();
	const { toast } = useToast();
	const locale = useLocale() || "en";

	const isExecutive = Boolean(session?.user?.membershipType === "executive" || session?.user?.role === "admin" || session?.user?.role === "treasurer");

	const [messages, setMessages] = useState<Message[]>([]);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		type: "all",
		priority: "all",
		unread: false,
		search: "",
	});
	const [currentPage, setCurrentPage] = useState(1);
	// Collapsible messages state: set of expanded message IDs (empty initially so all messages start collapsed)
	const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());

	// Reset expanded messages whenever page or filters change
	useEffect(() => {
		setExpandedMessageIds(new Set());
	}, [currentPage, filters]);

	const toggleMessage = (id: string) => {
		setExpandedMessageIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const allExpanded = messages.length > 0 && messages.every((m) => expandedMessageIds.has(m._id));

	const toggleExpandAll = () => {
		if (allExpanded) {
			setExpandedMessageIds(new Set());
		} else {
			setExpandedMessageIds(new Set(messages.map((m) => m._id)));
		}
	};

	const fetchMessages = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: "10",
			});

			if (filters.type && filters.type !== "all") params.append("type", filters.type);
			if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
			if (filters.unread) params.append("unread", "true");

			const response = await fetch(`/api/messages?${params.toString()}`);

			if (!response.ok) {
				throw new Error("Failed to fetch messages");
			}

			const data = await response.json();
			setMessages(data.messages || []);
			setPagination(data.pagination || null);
		} catch (error) {
			console.error("Error fetching messages:", error);
			setError("Failed to load messages");
			toast({
				title: "Error",
				description: "Failed to load messages",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, filters, toast]);

	// Fetch messages
	useEffect(() => {
		if (status === "authenticated") {
			fetchMessages();
		}
	}, [status, fetchMessages]);

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "announcement":
				return <Bell className="h-4 w-4" />;
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

	const isMessageRead = (message: Message) => {
		const userAny = session?.user as { _id?: string; id?: string; email?: string } | undefined;
		return message.readBy.some((read) => read.memberId === userAny?._id || read.memberId === userAny?.id || read.memberId === userAny?.email);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleFilterChange = (key: string, value: string | boolean) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setCurrentPage(1); // Reset to first page when filters change
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-center min-h-64">
					<Loader2 className="h-8 w-8 animate-spin text-brand" />
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="max-w-6xl mx-auto">
				<Alert>
					<Mail className="h-4 w-4" />
					<AlertDescription>Please log in to view your messages.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
					<p className="text-gray-600">View announcements, updates, and messages from PNSB-Norway leadership and members.</p>
				</div>
				{isExecutive && (
					<Link href={`/${locale}/profile/send-message`}>
						<Button className="bg-brand hover:bg-brand/90 text-white flex items-center gap-2">
							<Send className="h-4 w-4" />
							Send Message
						</Button>
					</Link>
				)}
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filter Messages
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
							<Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
								<SelectTrigger>
									<SelectValue placeholder="All types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All types</SelectItem>
									<SelectItem value="announcement">Announcements</SelectItem>
									<SelectItem value="alert">Alerts</SelectItem>
									<SelectItem value="update">Updates</SelectItem>
									<SelectItem value="reminder">Reminders</SelectItem>
									<SelectItem value="general">General</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
							<Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
								<SelectTrigger>
									<SelectValue placeholder="All priorities" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All priorities</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
							<Select value={filters.unread ? "unread" : "all"} onValueChange={(value) => handleFilterChange("unread", value === "unread")}>
								<SelectTrigger>
									<SelectValue placeholder="All messages" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All messages</SelectItem>
									<SelectItem value="unread">Unread only</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-end">
							<Button
								onClick={() => {
									setFilters({ type: "all", priority: "all", unread: false, search: "" });
									setCurrentPage(1);
								}}
								variant="outline"
								className="w-full"
							>
								Clear Filters
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Messages List */}
			{error ? (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : messages.length === 0 ? (
				<Card>
					<CardContent className="text-center py-12">
						<Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
						<p className="text-gray-600">{filters.type !== "all" || filters.priority !== "all" || filters.unread ? "Try adjusting your filters to see more messages." : "You don't have any messages yet."}</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{/* Expand/Collapse All Toolbar */}
					<div className="flex items-center justify-between px-1 text-xs text-gray-500">
						<span>
							Showing {messages.length} message{messages.length === 1 ? "" : "s"} &bull; Click any message to expand or collapse
						</span>
						<Button variant="ghost" size="sm" onClick={toggleExpandAll} className="h-8 px-2.5 text-xs font-semibold text-brand hover:text-brand/80 hover:bg-brand/10 flex items-center gap-1.5">
							<ChevronsUpDown className="h-3.5 w-3.5" />
							{allExpanded ? "Collapse All" : "Expand All"}
						</Button>
					</div>

					{/* Message Cards */}
					{messages.map((message) => {
						const isExpanded = expandedMessageIds.has(message._id);
						const isRead = isMessageRead(message);
						const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;
						const senderDisplay = message.senderName || message.sentBy?.fullName || "PNSB-Norway Admin";
						const positionDisplay = message.senderPosition ? ` (${message.senderPosition})` : "";

						return (
							<Card key={message._id} className={`transition-all border border-gray-200 overflow-hidden shadow-xs hover:shadow-sm ${!isRead ? "border-l-4 border-l-brand bg-brand/[0.01]" : ""}`}>
								{/* Clickable Header for Collapsing/Expanding */}
								<div
									onClick={() => toggleMessage(message._id)}
									className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none transition-colors ${isExpanded ? "bg-slate-50/70 border-b border-gray-100" : "hover:bg-slate-50/60"}`}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											toggleMessage(message._id);
										}
									}}
									aria-expanded={isExpanded}
								>
									<div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
										{/* Read / Unread Indicator */}
										<div className="flex-shrink-0 mt-0.5 sm:mt-0">
											{!isRead ? (
												<span title="Unread message" className="relative flex h-2.5 w-2.5">
													<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
													<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
												</span>
											) : (
												<CheckCircle className="h-4 w-4 text-gray-400" />
											)}
										</div>

										{/* Type Icon */}
										<div className="flex-shrink-0 p-1.5 rounded-lg bg-gray-100 text-gray-600">{getTypeIcon(message.type)}</div>

										{/* Title, Badges & Snippet */}
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<h3 className={`text-sm sm:text-base truncate ${!isRead ? "text-gray-900 font-bold" : "text-gray-800 font-semibold"}`}>{message.title}</h3>
												<Badge className={`text-[11px] px-2 py-0.5 border ${getPriorityColor(message.priority)}`}>{message.priority}</Badge>
												<Badge className={`text-[11px] px-2 py-0.5 border ${getTypeColor(message.type)}`}>{message.type}</Badge>
												{hasAttachments && (
													<span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
														<Paperclip className="h-3 w-3 text-gray-500" />
														{message.attachments!.length}
													</span>
												)}
											</div>

											{/* Snippet preview when collapsed */}
											{!isExpanded && <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-normal">{message.content}</p>}

											{/* Sender & Date summary */}
											<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
												<span className="flex items-center gap-1 text-gray-600 font-medium">
													<User className="h-3 w-3 text-gray-400" />
													{senderDisplay}
													{positionDisplay}
												</span>
												<span className="flex items-center gap-1 text-gray-400">
													<Calendar className="h-3 w-3 text-gray-400" />
													{formatDate(message.createdAt)}
												</span>
											</div>
										</div>
									</div>

									{/* Expand/Collapse Toggle Button */}
									<div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-center ml-2">
										<Button
											variant="ghost"
											size="sm"
											className="h-8 px-2.5 text-xs text-gray-600 hover:text-brand hover:bg-brand/10"
											onClick={(e) => {
												e.stopPropagation();
												toggleMessage(message._id);
											}}
										>
											<span className="hidden sm:inline mr-1 font-medium">{isExpanded ? "Collapse" : "Read"}</span>
											{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
										</Button>
									</div>
								</div>

								{/* Expanded Message Content */}
								{isExpanded && (
									<CardContent className="p-5 sm:p-6 space-y-5 bg-white">
										{/* Full Content */}
										<div className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-4 rounded-xl border border-gray-100">{message.content}</div>

										{/* Attachments Section */}
										{hasAttachments && (
											<div className="space-y-2 pt-1">
												<h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
													<Paperclip className="h-3.5 w-3.5 text-brand" />
													Attachments ({message.attachments!.length})
												</h4>
												<div className="flex flex-wrap gap-2.5">
													{message.attachments!.map((attachment, index) => {
														const filename = attachment.filename || `Attachment-${index + 1}`;
														const isPdf = filename.toLowerCase().endsWith(".pdf") || attachment.fileType?.includes("pdf");
														const isImg = filename.match(/\.(jpg|jpeg|png|webp|gif)$/i) || attachment.fileType?.startsWith("image");

														return (
															<a key={index} href={attachment.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-brand/10 text-slate-700 hover:text-brand border border-slate-200 hover:border-brand/30 transition-all shadow-2xs group" title={`Click to open ${filename} in a new tab`}>
																{isPdf ? <FileText className="h-4 w-4 text-red-500 flex-shrink-0" /> : isImg ? <ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" /> : <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />}
																<span className="font-medium max-w-[200px] truncate">{filename}</span>
																{attachment.size ? <span className="text-[11px] text-gray-400 group-hover:text-brand/70">({(attachment.size / 1024).toFixed(0)} KB)</span> : null}
																<ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-brand flex-shrink-0 ml-0.5" />
															</a>
														);
													})}
												</div>
											</div>
										)}

										{/* Details Footer */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
											<div className="flex flex-wrap items-center gap-4">
												<div className="flex items-center gap-1.5">
													<User className="h-3.5 w-3.5 text-gray-400" />
													<span>
														From: <strong>{senderDisplay}</strong>
														{positionDisplay}
													</span>
												</div>
												{message.sentBy?.email && <span className="text-gray-400">({message.sentBy.email})</span>}
												<div className="flex items-center gap-1.5">
													<Calendar className="h-3.5 w-3.5 text-gray-400" />
													<span>Sent: {formatDate(message.createdAt)}</span>
												</div>
											</div>

											<div className="flex items-center gap-3">
												{message.expiresAt && (
													<div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
														<Archive className="h-3.5 w-3.5" />
														<span>Expires: {formatDate(message.expiresAt)}</span>
													</div>
												)}
												<Button variant="ghost" size="sm" onClick={() => toggleMessage(message._id)} className="text-xs text-gray-500 hover:text-gray-700 h-7 px-2">
													Collapse
												</Button>
											</div>
										</div>
									</CardContent>
								)}
							</Card>
						);
					})}
				</div>
			)}

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-600">
								Showing {(pagination.currentPage - 1) * 10 + 1} to {Math.min(pagination.currentPage * 10, pagination.totalMessages)} of {pagination.totalMessages} messages
							</div>
							<div className="flex items-center gap-2">
								<Button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev} variant="outline" size="sm">
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<span className="text-sm text-gray-600">
									Page {pagination.currentPage} of {pagination.totalPages}
								</span>
								<Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} variant="outline" size="sm">
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

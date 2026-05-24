"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { 
	Mail, 
	Bell, 
	AlertTriangle, 
	Info, 
	Calendar, 
	User, 
	Filter,
	ChevronLeft,
	ChevronRight,
	Loader2,
	CheckCircle,
	Circle,
	FileText,
	Archive
} from "lucide-react";
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
	recipientType: "all" | "executive" | "general" | "specific";
	sentBy: {
		_id: string;
		fullName: string;
		email: string;
	};
	isActive: boolean;
	expiresAt: string | null;
	readBy: Array<{
		memberId: string;
		readAt: string;
	}>;
	attachments: Array<{
		filename: string;
		url: string;
		fileType: string;
		size: number;
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
		return message.readBy.some(read => 
			read.memberId === session?.user?.id || 
			read.memberId === session?.user?.email
		);
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
		setFilters(prev => ({ ...prev, [key]: value }));
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
					<AlertDescription>
						Please log in to view your messages.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
				<p className="text-gray-600">
					View important announcements and updates from PNSB-Norway administrators.
				</p>
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
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Type
							</label>
							<Select
								value={filters.type}
								onValueChange={(value) => handleFilterChange("type", value)}
							>
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
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Priority
							</label>
							<Select
								value={filters.priority}
								onValueChange={(value) => handleFilterChange("priority", value)}
							>
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
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Status
							</label>
							<Select
								value={filters.unread ? "unread" : "all"}
								onValueChange={(value) => handleFilterChange("unread", value === "unread")}
							>
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
						<p className="text-gray-600">
							{filters.type !== "all" || filters.priority !== "all" || filters.unread
								? "Try adjusting your filters to see more messages."
								: "You don't have any messages yet."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{messages.map((message) => (
						<Card key={message._id} className={`transition-all hover:shadow-md ${
							!isMessageRead(message) ? "border-l-4 border-l-brand" : ""
						}`}>
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-3">
										{!isMessageRead(message) ? (
											<Circle className="h-5 w-5 text-brand fill-current" />
										) : (
											<CheckCircle className="h-5 w-5 text-gray-400" />
										)}
										<div className="flex items-center gap-2">
											{getTypeIcon(message.type)}
											<span className="font-semibold text-lg">{message.title}</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge className={getPriorityColor(message.priority)}>
											{message.priority}
										</Badge>
										<Badge className={getTypeColor(message.type)}>
											{message.type}
										</Badge>
									</div>
								</div>

								<div className="mb-4">
									<p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
								</div>

								{message.attachments && message.attachments.length > 0 && (
									<div className="mb-4">
										<h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
										<div className="space-y-2">
											{message.attachments.map((attachment, index) => (
												<div key={index} className="flex items-center gap-2 text-sm">
													<FileText className="h-4 w-4 text-gray-500" />
													<a
														href={attachment.url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:text-blue-800 underline"
													>
														{attachment.filename}
													</a>
													<span className="text-gray-500">
														({(attachment.size / 1024).toFixed(1)} KB)
													</span>
												</div>
											))}
										</div>
									</div>
								)}

								<div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-1">
											<User className="h-4 w-4" />
											<span>{message.sentBy?.fullName || "PNSB-Norway Admin"}</span>
										</div>
										<div className="flex items-center gap-1">
											<Calendar className="h-4 w-4" />
											<span>{formatDate(message.createdAt)}</span>
										</div>
									</div>
									{message.expiresAt && (
										<div className="flex items-center gap-1">
											<Archive className="h-4 w-4" />
											<span>Expires: {formatDate(message.expiresAt)}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-600">
								Showing {((pagination.currentPage - 1) * 10) + 1} to{" "}
								{Math.min(pagination.currentPage * 10, pagination.totalMessages)} of{" "}
								{pagination.totalMessages} messages
							</div>
							<div className="flex items-center gap-2">
								<Button
									onClick={() => handlePageChange(pagination.currentPage - 1)}
									disabled={!pagination.hasPrev}
									variant="outline"
									size="sm"
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<span className="text-sm text-gray-600">
									Page {pagination.currentPage} of {pagination.totalPages}
								</span>
								<Button
									onClick={() => handlePageChange(pagination.currentPage + 1)}
									disabled={!pagination.hasNext}
									variant="outline"
									size="sm"
								>
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

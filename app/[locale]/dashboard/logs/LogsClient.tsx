"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useSession } from "next-auth/react";
import { format, formatDistanceToNow } from "date-fns";
import { Activity, LogIn, Compass, Users, ShieldAlert, Search, RefreshCw, Download, Trash2, Eye, Laptop, Smartphone, Tablet, ExternalLink, CheckCircle2, XCircle, AlertTriangle, User, ChevronLeft, ChevronRight, X, ArrowUpRight, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface LogItem {
	_id: string;
	userId?: string;
	userName: string;
	userEmail: string;
	userRole: string;
	membershipType: string;
	action: string;
	category: string;
	description: string;
	path?: string;
	pageTitle?: string;
	referrer?: string;
	ipAddress?: string;
	userAgent?: string;
	browser: string;
	os: string;
	device: "desktop" | "mobile" | "tablet" | "unknown";
	status: "success" | "failed" | "warning" | "info";
	metadata?: Record<string, unknown>;
	createdAt: string;
}

interface StatsData {
	totalLogins: number;
	totalPageViews: number;
	failedLogins: number;
	todayLogins: number;
	uniqueUsersCount: number;
	membershipBreakdown: Record<string, number>;
}

export default function LogsClient() {
	// const { data: session } = useSession();
	const { toast } = useToast();

	// State
	const [activeTab, setActiveTab] = useState<"logins" | "pages" | "all" | "journeys">("logins");
	const [logs, setLogs] = useState<LogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [actionFilter, setActionFilter] = useState("all");
	const [membershipFilter, setMembershipFilter] = useState("all");
	const [timeRange, setTimeRange] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	// Stats
	const [stats, setStats] = useState<StatsData>({
		totalLogins: 0,
		totalPageViews: 0,
		failedLogins: 0,
		todayLogins: 0,
		uniqueUsersCount: 0,
		membershipBreakdown: {},
	});

	// Dialogs
	const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
	const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
	const [purgeDays, setPurgeDays] = useState("30");
	const [purging, setPurging] = useState(false);

	// Fetch logs from API
	const fetchLogs = useCallback(
		async (isRefresh = false) => {
			if (isRefresh) setRefreshing(true);
			else setLoading(true);

			try {
				const params = new URLSearchParams();
				params.set("page", currentPage.toString());
				params.set("limit", pageSize.toString());

				if (searchQuery.trim()) params.set("search", searchQuery.trim());
				if (timeRange && timeRange !== "all") params.set("timeRange", timeRange);
				if (membershipFilter && membershipFilter !== "all") params.set("membershipType", membershipFilter);
				if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

				if (selectedUserEmail) {
					params.set("userEmail", selectedUserEmail);
				}

				// Tab specific default filter
				if (activeTab === "logins") {
					params.set("category", "auth");
				} else if (activeTab === "pages") {
					params.set("action", "PAGE_VIEW");
				} else if (actionFilter && actionFilter !== "all") {
					params.set("action", actionFilter);
				}

				const res = await fetch(`/api/logs?${params.toString()}`);
				if (!res.ok) {
					throw new Error("Failed to load logs");
				}

				const data = await res.json();
				if (data.success) {
					setLogs(data.logs || []);
					setTotalCount(data.pagination?.total || 0);
					setTotalPages(data.pagination?.totalPages || 1);
					if (data.stats) {
						setStats(data.stats);
					}
				}
			} catch (err) {
				console.error("Error fetching logs:", err);
				toast({
					title: "Failed to load logs",
					description: "Could not retrieve log data from the server. Please try again.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[activeTab, currentPage, pageSize, searchQuery, actionFilter, membershipFilter, timeRange, statusFilter, selectedUserEmail, toast],
	);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	// Reset page on filter changes
	const handleFilterChange = (setter: (v: string) => void) => (val: string) => {
		setter(val);
		setCurrentPage(1);
	};

	// Reset all filters
	const resetFilters = () => {
		setSearchQuery("");
		setActionFilter("all");
		setMembershipFilter("all");
		setTimeRange("all");
		setStatusFilter("all");
		setSelectedUserEmail(null);
		setCurrentPage(1);
	};

	// Purge Logs Handler
	const handlePurge = async () => {
		setPurging(true);
		try {
			let query = "";
			if (purgeDays === "all") {
				query = "clearAll=true";
			} else {
				query = `olderThanDays=${purgeDays}`;
			}

			const res = await fetch(`/api/logs?${query}`, { method: "DELETE" });
			const data = await res.json();

			if (res.ok && data.success) {
				toast({
					title: "Logs Purged",
					description: data.message || "Logs have been purged successfully.",
				});
				setPurgeDialogOpen(false);
				fetchLogs(true);
			} else {
				throw new Error(data.error || "Failed to purge logs");
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Error purging logs";
			toast({
				title: "Purge Failed",
				description: msg,
				variant: "destructive",
			});
		} finally {
			setPurging(false);
		}
	};

	// CSV Export Handler
	const handleExportCSV = () => {
		if (!logs.length) {
			toast({
				title: "No logs to export",
				description: "There are no log records matching your current criteria.",
			});
			return;
		}

		const headers = ["Date & Time", "User Name", "User Email", "Membership Type", "Role", "Action", "Category", "Description", "Path / URL", "IP Address", "Device", "Browser", "OS", "Status"];

		const rows = logs.map((log) => [`"${log.createdAt}"`, `"${(log.userName || "").replace(/"/g, '""')}"`, `"${(log.userEmail || "").replace(/"/g, '""')}"`, `"${(log.membershipType || "none").replace(/"/g, '""')}"`, `"${(log.userRole || "").replace(/"/g, '""')}"`, `"${(log.action || "").replace(/"/g, '""')}"`, `"${(log.category || "").replace(/"/g, '""')}"`, `"${(log.description || "").replace(/"/g, '""')}"`, `"${(log.path || "").replace(/"/g, '""')}"`, `"${(log.ipAddress || "").replace(/"/g, '""')}"`, `"${(log.device || "").replace(/"/g, '""')}"`, `"${(log.browser || "").replace(/"/g, '""')}"`, `"${(log.os || "").replace(/"/g, '""')}"`, `"${(log.status || "").replace(/"/g, '""')}"`]);

		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `activity_logs_${format(new Date(), "yyyy-MM-dd_HHmm")}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast({
			title: "Export Successful",
			description: `Exported ${logs.length} log records to CSV.`,
		});
	};

	// Membership Badge Styler
	const renderMembershipBadge = (type?: string) => {
		const norm = (type || "").toLowerCase();
		if (norm === "executive") {
			return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 font-medium text-[11px] px-2 py-0.5">Executive</Badge>;
		}
		if (norm === "general") {
			return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 font-medium text-[11px] px-2 py-0.5">General</Badge>;
		}
		if (norm === "admin" || norm === "treasurer") {
			return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-medium text-[11px] px-2 py-0.5 capitalize">{norm}</Badge>;
		}
		return (
			<Badge variant="outline" className="text-slate-500 text-[11px] font-normal">
				{type || "None"}
			</Badge>
		);
	};

	// Action Badge Styler
	const renderActionBadge = (action: string) => {
		switch (action) {
			case "LOGIN":
				return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Login</Badge>;
			case "LOGIN_FAILED":
				return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">Failed Login</Badge>;
			case "LOGOUT":
				return <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">Logout</Badge>;
			case "PAGE_VIEW":
				return <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs">Page Visit</Badge>;
			case "PROFILE_UPDATE":
				return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Profile Update</Badge>;
			case "PASSWORD_CHANGE":
				return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">Password Change</Badge>;
			case "SEND_MESSAGE":
				return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Broadcast Message</Badge>;
			case "EVENT_REGISTRATION":
				return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">Event Signup</Badge>;
			case "EVENT_CHECKIN":
				return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">Event Check-in</Badge>;
			default:
				return (
					<Badge variant="outline" className="text-slate-600 text-xs">
						{action}
					</Badge>
				);
		}
	};

	// Device Icon Helper
	const renderDeviceIcon = (device: string) => {
		switch (device) {
			case "mobile":
				return <Smartphone className="w-3.5 h-3.5 text-slate-400" />;
			case "tablet":
				return <Tablet className="w-3.5 h-3.5 text-slate-400" />;
			default:
				return <Laptop className="w-3.5 h-3.5 text-slate-400" />;
		}
	};

	// Format Timestamp with Relative
	const formatDateTime = (isoDate: string) => {
		try {
			const date = new Date(isoDate);
			return {
				full: format(date, "MMM d, yyyy · HH:mm"),
				relative: formatDistanceToNow(date, { addSuffix: true }),
			};
		} catch {
			return { full: isoDate, relative: "" };
		}
	};

	// User Journeys Aggregated
	const aggregatedUsers = useMemo(() => {
		const userMap = new Map<
			string,
			{
				email: string;
				name: string;
				membershipType: string;
				lastSeen: string;
				loginCount: number;
				pageViewCount: number;
				activityCount: number;
			}
		>();

		logs.forEach((item) => {
			const email = item.userEmail || "anonymous";
			if (!userMap.has(email)) {
				userMap.set(email, {
					email: item.userEmail || "Anonymous",
					name: item.userName || "Guest",
					membershipType: item.membershipType || "none",
					lastSeen: item.createdAt,
					loginCount: 0,
					pageViewCount: 0,
					activityCount: 0,
				});
			}

			const record = userMap.get(email)!;
			record.activityCount += 1;
			if (item.action === "LOGIN") record.loginCount += 1;
			if (item.action === "PAGE_VIEW") record.pageViewCount += 1;
			if (new Date(item.createdAt) > new Date(record.lastSeen)) {
				record.lastSeen = item.createdAt;
			}
		});

		return Array.from(userMap.values());
	}, [logs]);

	return (
		<div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
							<Activity className="w-5 h-5" />
						</div>
						<div>
							<h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Activity & Login Logs</h1>
							<p className="text-xs md:text-sm text-slate-500">Monitor real-time user logins, membership activities, page visit history, and security events.</p>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => fetchLogs(true)} disabled={refreshing} className="gap-2 h-9 text-xs">
						<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand" : ""}`} />
						<span>{refreshing ? "Refreshing..." : "Refresh"}</span>
					</Button>

					<Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!logs.length} className="gap-2 h-9 text-xs">
						<Download className="w-3.5 h-3.5" />
						<span>Export CSV</span>
					</Button>

					<Button variant="outline" size="sm" onClick={() => setPurgeDialogOpen(true)} className="gap-2 h-9 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
						<Trash2 className="w-3.5 h-3.5" />
						<span>Purge Logs</span>
					</Button>
				</div>
			</div>

			{/* Filter Active Alert when a user is isolated */}
			{selectedUserEmail && (
				<div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-900 text-xs">
					<div className="flex items-center gap-2">
						<User className="w-4 h-4 text-indigo-600" />
						<span>
							Showing isolated audit trail for: <strong>{selectedUserEmail}</strong>
						</span>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectedUserEmail(null);
							setCurrentPage(1);
						}}
						className="h-7 text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
					>
						<X className="w-3.5 h-3.5 mr-1" />
						Clear User Filter
					</Button>
				</div>
			)}

			{/* KPI Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Logins */}
				<Card className="border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
					<CardContent className="p-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Logins</p>
							<div className="flex items-baseline gap-2 mt-1">
								<h3 className="text-2xl font-bold text-slate-900">{stats.totalLogins.toLocaleString()}</h3>
								<span className="text-xs font-semibold text-emerald-600">+{stats.todayLogins} today</span>
							</div>
							<p className="text-[11px] text-slate-400 mt-1">
								Exec: {stats.membershipBreakdown?.executive || 0} · General: {stats.membershipBreakdown?.general || 0}
							</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
							<LogIn className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>

				{/* Page Views */}
				<Card className="border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
					<CardContent className="p-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Page Visits</p>
							<div className="flex items-baseline gap-2 mt-1">
								<h3 className="text-2xl font-bold text-slate-900">{stats.totalPageViews.toLocaleString()}</h3>
							</div>
							<p className="text-[11px] text-slate-400 mt-1">Real-time navigation trails</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
							<Compass className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>

				{/* Unique Users */}
				<Card className="border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
					<CardContent className="p-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tracked Accounts</p>
							<div className="flex items-baseline gap-2 mt-1">
								<h3 className="text-2xl font-bold text-slate-900">{stats.uniqueUsersCount.toLocaleString()}</h3>
							</div>
							<p className="text-[11px] text-slate-400 mt-1">Members & Administrators</p>
						</div>
						<div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
							<Users className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>

				{/* Security & Failed Logins */}
				<Card className="border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
					<CardContent className="p-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Failed Logins</p>
							<div className="flex items-baseline gap-2 mt-1">
								<h3 className={`text-2xl font-bold ${stats.failedLogins > 0 ? "text-amber-600" : "text-slate-900"}`}>{stats.failedLogins}</h3>
							</div>
							<p className="text-[11px] text-slate-400 mt-1">{stats.failedLogins === 0 ? "Clean authentication state" : "Rejected password attempts"}</p>
						</div>
						<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.failedLogins > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
							<ShieldAlert className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Tabs Navigation */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
					<button
						onClick={() => {
							setActiveTab("logins");
							setCurrentPage(1);
						}}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "logins" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"}`}
					>
						<LogIn className="w-3.5 h-3.5 text-emerald-600" />
						<span>Login History</span>
					</button>

					<button
						onClick={() => {
							setActiveTab("pages");
							setCurrentPage(1);
						}}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "pages" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"}`}
					>
						<Compass className="w-3.5 h-3.5 text-sky-600" />
						<span>Pages Visited</span>
					</button>

					<button
						onClick={() => {
							setActiveTab("all");
							setCurrentPage(1);
						}}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"}`}
					>
						<Activity className="w-3.5 h-3.5 text-purple-600" />
						<span>All Activities</span>
					</button>

					<button
						onClick={() => {
							setActiveTab("journeys");
							setCurrentPage(1);
						}}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "journeys" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"}`}
					>
						<History className="w-3.5 h-3.5 text-indigo-600" />
						<span>User Journeys</span>
					</button>
				</div>

				<div className="text-xs text-slate-500 text-right">
					Showing <span className="font-semibold text-slate-800">{totalCount}</span> total entries
				</div>
			</div>

			{/* Filters Bar */}
			<Card className="border border-slate-200 shadow-2xs">
				<CardContent className="p-3 md:p-4 space-y-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
						{/* Search Input */}
						<div className="relative lg:col-span-2">
							<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
							<Input
								placeholder="Search user, email, page or action..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-9 pr-8 text-xs h-9 bg-slate-50/60 focus:bg-white"
							/>
							{searchQuery && (
								<button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
									<X className="w-3.5 h-3.5" />
								</button>
							)}
						</div>

						{/* Membership Type Filter */}
						<Select value={membershipFilter} onValueChange={handleFilterChange(setMembershipFilter)}>
							<SelectTrigger className="h-9 text-xs bg-slate-50/60">
								<SelectValue placeholder="Membership Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Memberships</SelectItem>
								<SelectItem value="executive">Executive Member</SelectItem>
								<SelectItem value="general">General Member</SelectItem>
								<SelectItem value="admin">Admin / Board</SelectItem>
							</SelectContent>
						</Select>

						{/* Time Range Filter */}
						<Select value={timeRange} onValueChange={handleFilterChange(setTimeRange)}>
							<SelectTrigger className="h-9 text-xs bg-slate-50/60">
								<SelectValue placeholder="Time Period" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Time</SelectItem>
								<SelectItem value="today">Today</SelectItem>
								<SelectItem value="24h">Past 24 Hours</SelectItem>
								<SelectItem value="7d">Past 7 Days</SelectItem>
								<SelectItem value="30d">Past 30 Days</SelectItem>
							</SelectContent>
						</Select>

						{/* Action Filter (Only in 'all' tab) or Status */}
						{activeTab === "all" ? (
							<Select value={actionFilter} onValueChange={handleFilterChange(setActionFilter)}>
								<SelectTrigger className="h-9 text-xs bg-slate-50/60">
									<SelectValue placeholder="Action Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Actions</SelectItem>
									<SelectItem value="LOGIN">Logins</SelectItem>
									<SelectItem value="LOGIN_FAILED">Failed Logins</SelectItem>
									<SelectItem value="LOGOUT">Logouts</SelectItem>
									<SelectItem value="PAGE_VIEW">Page Views</SelectItem>
									<SelectItem value="PROFILE_UPDATE">Profile Updates</SelectItem>
									<SelectItem value="PASSWORD_CHANGE">Password Changes</SelectItem>
									<SelectItem value="SEND_MESSAGE">Broadcast Messages</SelectItem>
									<SelectItem value="EVENT_REGISTRATION">Event Registrations</SelectItem>
									<SelectItem value="EVENT_CHECKIN">Event Check-ins</SelectItem>
								</SelectContent>
							</Select>
						) : (
							<Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
								<SelectTrigger className="h-9 text-xs bg-slate-50/60">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="success">Success</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
									<SelectItem value="warning">Warning</SelectItem>
								</SelectContent>
							</Select>
						)}
					</div>

					{(searchQuery || membershipFilter !== "all" || timeRange !== "all" || statusFilter !== "all" || actionFilter !== "all" || selectedUserEmail) && (
						<div className="flex items-center justify-between pt-1 text-xs">
							<span className="text-slate-500">Filters active</span>
							<button onClick={resetFilters} className="text-brand hover:underline font-medium">
								Reset all filters
							</button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Content Area Based on Active Tab */}
			{loading ? (
				<div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl border border-slate-200 p-8 space-y-3">
					<div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600" />
					<p className="text-xs text-slate-500 animate-pulse">Loading activity logs...</p>
				</div>
			) : logs.length === 0 ? (
				<div className="flex flex-col items-center justify-center min-h-[260px] bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
					<div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
						<Activity className="w-6 h-6" />
					</div>
					<h3 className="text-sm font-semibold text-slate-800">No activity logs found</h3>
					<p className="text-xs text-slate-500 max-w-sm mt-1">No entries match your search criteria or date filter. Try clearing your filters or refreshing.</p>
					<Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 text-xs h-8">
						Clear Filters
					</Button>
				</div>
			) : activeTab === "journeys" ? (
				/* USER JOURNEYS VIEW */
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{aggregatedUsers.map((user) => (
							<Card key={user.email} className="border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-sm">
								<CardContent className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-center gap-2.5 min-w-0">
											<div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</div>
											<div className="min-w-0">
												<h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
												<p className="text-[11px] text-slate-500 truncate">{user.email}</p>
											</div>
										</div>
										{renderMembershipBadge(user.membershipType)}
									</div>

									<div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
										<div className="bg-slate-50 rounded-lg p-2">
											<p className="text-[10px] text-slate-400 uppercase">Logins</p>
											<p className="text-xs font-bold text-slate-800">{user.loginCount}</p>
										</div>
										<div className="bg-slate-50 rounded-lg p-2">
											<p className="text-[10px] text-slate-400 uppercase">Page Views</p>
											<p className="text-xs font-bold text-slate-800">{user.pageViewCount}</p>
										</div>
										<div className="bg-slate-50 rounded-lg p-2">
											<p className="text-[10px] text-slate-400 uppercase">Actions</p>
											<p className="text-xs font-bold text-slate-800">{user.activityCount}</p>
										</div>
									</div>

									<div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-1">
										<span>Last active: {formatDateTime(user.lastSeen).relative}</span>
										<button
											onClick={() => {
												setSelectedUserEmail(user.email);
												setActiveTab("all");
												setCurrentPage(1);
											}}
											className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
										>
											<span>View Timeline</span>
											<ArrowUpRight className="w-3 h-3" />
										</button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			) : activeTab === "logins" ? (
				/* LOGIN HISTORY VIEW */
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader className="bg-slate-50/75">
								<TableRow>
									<TableHead className="text-xs font-semibold text-slate-700">User / Member</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Membership</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Login Date & Time</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Device & Browser</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">IP Address</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700 text-right">Details</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log) => {
									const dt = formatDateTime(log.createdAt);
									const isFailed = log.action === "LOGIN_FAILED" || log.status === "failed";
									return (
										<TableRow key={log._id} className="hover:bg-slate-50/70 transition-colors">
											{/* User info */}
											<TableCell className="py-3">
												<div className="flex items-center gap-2.5">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${isFailed ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{log.userName?.[0]?.toUpperCase() || log.userEmail?.[0]?.toUpperCase() || "U"}</div>
													<div className="min-w-0 max-w-[200px]">
														<p className="text-xs font-semibold text-slate-900 truncate">{log.userName || "Unknown User"}</p>
														<p className="text-[11px] text-slate-500 truncate">{log.userEmail || "No Email"}</p>
													</div>
												</div>
											</TableCell>

											{/* Membership type */}
											<TableCell className="py-3">{renderMembershipBadge(log.membershipType)}</TableCell>

											{/* Date and Time */}
											<TableCell className="py-3">
												<div>
													<p className="text-xs font-medium text-slate-900">{dt.full}</p>
													<p className="text-[11px] text-slate-400">{dt.relative}</p>
												</div>
											</TableCell>

											{/* Device and Browser */}
											<TableCell className="py-3">
												<div className="flex items-center gap-1.5 text-xs text-slate-700">
													{renderDeviceIcon(log.device)}
													<span className="capitalize">{log.browser}</span>
													<span className="text-slate-400">·</span>
													<span className="text-slate-500 text-[11px]">{log.os}</span>
												</div>
											</TableCell>

											{/* IP Address */}
											<TableCell className="py-3">
												<span className="inline-block font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">{log.ipAddress || "Unknown"}</span>
											</TableCell>

											{/* Status */}
											<TableCell className="py-3">
												{isFailed ? (
													<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
														<XCircle className="w-3 h-3" />
														<span>Failed</span>
													</span>
												) : (
													<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
														<CheckCircle2 className="w-3 h-3" />
														<span>Success</span>
													</span>
												)}
											</TableCell>

											{/* Action button */}
											<TableCell className="py-3 text-right">
												<Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-7 w-7 p-0 rounded-md text-slate-500 hover:text-indigo-600">
													<Eye className="w-3.5 h-3.5" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</div>
			) : activeTab === "pages" ? (
				/* PAGE VISITS VIEW */
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader className="bg-slate-50/75">
								<TableRow>
									<TableHead className="text-xs font-semibold text-slate-700">User / Member</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Membership</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Page Visited</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Page Title</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Visited Date & Time</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Device</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700 text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log) => {
									const dt = formatDateTime(log.createdAt);
									return (
										<TableRow key={log._id} className="hover:bg-slate-50/70 transition-colors">
											{/* User info */}
											<TableCell className="py-3">
												<div className="min-w-0 max-w-[180px]">
													<p className="text-xs font-semibold text-slate-900 truncate">{log.userName || "Member"}</p>
													<p className="text-[11px] text-slate-500 truncate">{log.userEmail}</p>
												</div>
											</TableCell>

											{/* Membership */}
											<TableCell className="py-3">{renderMembershipBadge(log.membershipType)}</TableCell>

											{/* Page Visited Path */}
											<TableCell className="py-3">
												<a href={log.path || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200 transition-colors max-w-[240px] truncate" title={log.path}>
													<span className="truncate">{log.path || "/"}</span>
													<ExternalLink className="w-3 h-3 flex-shrink-0" />
												</a>
											</TableCell>

											{/* Page Title */}
											<TableCell className="py-3">
												<p className="text-xs text-slate-600 max-w-[200px] truncate">{log.pageTitle || "—"}</p>
											</TableCell>

											{/* Timestamp */}
											<TableCell className="py-3">
												<div>
													<p className="text-xs font-medium text-slate-900">{dt.full}</p>
													<p className="text-[11px] text-slate-400">{dt.relative}</p>
												</div>
											</TableCell>

											{/* Device */}
											<TableCell className="py-3">
												<div className="flex items-center gap-1.5 text-xs text-slate-600">
													{renderDeviceIcon(log.device)}
													<span className="capitalize">{log.browser}</span>
												</div>
											</TableCell>

											{/* Inspect */}
											<TableCell className="py-3 text-right">
												<Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-7 w-7 p-0 rounded-md text-slate-500 hover:text-indigo-600">
													<Eye className="w-3.5 h-3.5" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</div>
			) : (
				/* ALL ACTIVITIES AUDIT VIEW */
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader className="bg-slate-50/75">
								<TableRow>
									<TableHead className="text-xs font-semibold text-slate-700">Action</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">User / Member</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Description</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Membership</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Date & Time</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700">Client / IP</TableHead>
									<TableHead className="text-xs font-semibold text-slate-700 text-right">Inspect</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log) => {
									const dt = formatDateTime(log.createdAt);
									return (
										<TableRow key={log._id} className="hover:bg-slate-50/70 transition-colors">
											{/* Action Badge */}
											<TableCell className="py-3">{renderActionBadge(log.action)}</TableCell>

											{/* User info */}
											<TableCell className="py-3">
												<div className="min-w-0 max-w-[160px]">
													<p className="text-xs font-semibold text-slate-900 truncate">{log.userName || "System"}</p>
													<p className="text-[11px] text-slate-500 truncate">{log.userEmail}</p>
												</div>
											</TableCell>

											{/* Description */}
											<TableCell className="py-3">
												<p className="text-xs text-slate-800 line-clamp-2 max-w-[340px]">{log.description}</p>
											</TableCell>

											{/* Membership */}
											<TableCell className="py-3">{renderMembershipBadge(log.membershipType)}</TableCell>

											{/* Timestamp */}
											<TableCell className="py-3">
												<div>
													<p className="text-xs font-medium text-slate-900">{dt.full}</p>
													<p className="text-[11px] text-slate-400">{dt.relative}</p>
												</div>
											</TableCell>

											{/* IP / Device */}
											<TableCell className="py-3">
												<div className="flex items-center gap-1.5 text-xs text-slate-600">
													{renderDeviceIcon(log.device)}
													<span className="font-mono text-[11px]">{log.ipAddress || "—"}</span>
												</div>
											</TableCell>

											{/* Action button */}
											<TableCell className="py-3 text-right">
												<Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-7 w-7 p-0 rounded-md text-slate-500 hover:text-indigo-600">
													<Eye className="w-3.5 h-3.5" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
					<div className="text-xs text-slate-500">
						Page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages}</span> (Total: {totalCount} records)
					</div>

					<div className="flex items-center gap-2">
						<Select
							value={pageSize.toString()}
							onValueChange={(val) => {
								setPageSize(parseInt(val, 10));
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="h-8 text-xs w-[110px] bg-white">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="15">15 per page</SelectItem>
								<SelectItem value="25">25 per page</SelectItem>
								<SelectItem value="50">50 per page</SelectItem>
								<SelectItem value="100">100 per page</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="h-8 px-2.5 text-xs">
							<ChevronLeft className="w-3.5 h-3.5 mr-1" />
							Previous
						</Button>

						<Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-8 px-2.5 text-xs">
							Next
							<ChevronRight className="w-3.5 h-3.5 ml-1" />
						</Button>
					</div>
				</div>
			)}

			{/* LOG DETAIL MODAL */}
			<Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
				<DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
							<Activity className="w-4 h-4 text-indigo-600" />
							<span>Activity Log Details</span>
						</DialogTitle>
						<DialogDescription className="text-xs text-slate-500">Comprehensive safe audit data for this event.</DialogDescription>
					</DialogHeader>

					{selectedLog && (
						<div className="space-y-4 text-xs py-2">
							{/* Action & Status Header */}
							<div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">Action</p>
									<div className="mt-0.5">{renderActionBadge(selectedLog.action)}</div>
								</div>
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">Category</p>
									<span className="font-semibold text-slate-800 capitalize">{selectedLog.category}</span>
								</div>
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">Status</p>
									<span className="capitalize font-semibold text-slate-800">{selectedLog.status}</span>
								</div>
							</div>

							{/* Description */}
							<div>
								<p className="font-semibold text-slate-700 mb-1">Description:</p>
								<div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 text-slate-800">{selectedLog.description}</div>
							</div>

							{/* User Information */}
							<div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-lg border border-slate-200">
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">User Name</p>
									<p className="font-semibold text-slate-900">{selectedLog.userName || "Anonymous"}</p>
								</div>
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">User Email</p>
									<p className="font-mono text-slate-800 truncate">{selectedLog.userEmail || "—"}</p>
								</div>
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">Membership Type</p>
									<div className="mt-0.5">{renderMembershipBadge(selectedLog.membershipType)}</div>
								</div>
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">System Role</p>
									<p className="font-semibold text-slate-800 capitalize">{selectedLog.userRole || "—"}</p>
								</div>
							</div>

							{/* Navigation / Path */}
							{selectedLog.path && (
								<div className="p-3 bg-sky-50/60 rounded-lg border border-sky-100">
									<p className="text-[10px] text-sky-800 uppercase font-semibold">Path Visited</p>
									<p className="font-mono text-sky-900 mt-0.5 break-all">{selectedLog.path}</p>
									{selectedLog.pageTitle && <p className="text-slate-500 mt-1">Title: {selectedLog.pageTitle}</p>}
								</div>
							)}

							{/* Technical Details */}
							<div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-lg border border-slate-200">
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">IP Address</p>
									<p className="font-mono text-slate-800">{selectedLog.ipAddress || "Unknown"}</p>
								</div>
								<div>
									<p className="text-[10px] text-slate-400 uppercase font-semibold">Device & Browser</p>
									<p className="text-slate-800">
										{selectedLog.browser} on {selectedLog.os} ({selectedLog.device})
									</p>
								</div>
								<div className="col-span-2">
									<p className="text-[10px] text-slate-400 uppercase font-semibold">Date & Time</p>
									<p className="text-slate-800">
										{formatDateTime(selectedLog.createdAt).full} ({formatDateTime(selectedLog.createdAt).relative})
									</p>
								</div>
							</div>

							{/* Safe Metadata Payload */}
							{selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
								<div>
									<p className="font-semibold text-slate-700 mb-1">Additional Safe Metadata:</p>
									<pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px] font-mono">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
								</div>
							)}
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" size="sm" onClick={() => setSelectedLog(null)} className="text-xs">
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* PURGE LOGS DIALOG */}
			<Dialog open={purgeDialogOpen} onOpenChange={setPurgeDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-rose-600 text-base">
							<Trash2 className="w-4 h-4" />
							<span>Purge Old Activity Logs</span>
						</DialogTitle>
						<DialogDescription className="text-xs text-slate-500">Permanently remove past logs to save database storage while keeping recent records intact.</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 py-2 text-xs">
						<label className="font-semibold text-slate-700">Select Purge Retention Policy:</label>
						<Select value={purgeDays} onValueChange={setPurgeDays}>
							<SelectTrigger className="h-9 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="30">Delete logs older than 30 days</SelectItem>
								<SelectItem value="60">Delete logs older than 60 days</SelectItem>
								<SelectItem value="90">Delete logs older than 90 days</SelectItem>
								<SelectItem value="all">Delete all logs (Clear Entire Audit History)</SelectItem>
							</SelectContent>
						</Select>

						{purgeDays === "all" && (
							<div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
								<AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
								<span>Warning: Clearing all logs will wipe all historical login records and page view statistics.</span>
							</div>
						)}
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" size="sm" onClick={() => setPurgeDialogOpen(false)} disabled={purging} className="text-xs">
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handlePurge} disabled={purging} className="text-xs bg-rose-600 hover:bg-rose-700">
							{purging ? "Purging..." : "Confirm Purge"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Receipt, Upload, Download, Plus, Eye, Edit, Trash2, Search, Filter, FileText, Image as ImageIcon, CheckCircle, Clock, AlertCircle, XCircle, CreditCard, Banknote, Building, Smartphone, FileCheck, FolderOpen, Users, Target, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FinancialCategoriesManager from "@/components/FinancialCategoriesManager";
import FinancialSyncButton from "@/components/FinancialSyncButton";
import FinancialDebugButton from "@/components/FinancialDebugButton";

interface ReceiptFile {
	filename: string;
	originalName: string;
	url: string;
	publicId: string;
	size: number;
	mimeType: string;
	uploadedAt: string;
}

interface FinancialTransaction {
	_id: string;
	type: "income" | "expense";
	category: string;
	subcategory?: string;
	amount: number;
	description: string;
	date: string;
	paymentMethod: string;
	referenceNumber?: string;
	relatedTo: string;
	relatedId?: string;
	eventId?: string;
	budgetId?: string;
	receiptFiles: ReceiptFile[];
	status: "pending" | "verified" | "reconciled" | "disputed";
	verifiedBy?: string;
	verifiedAt?: string;
	notes?: string;
	createdBy: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

interface FinancialCategory {
	_id: string;
	name: string;
	type: "income" | "expense";
	description?: string;
	color: string;
	icon: string;
	subcategories: Array<{
		name: string;
		description?: string;
	}>;
	isActive: boolean;
	createdBy: string;
	createdAt: string;
}

interface Budget {
	_id: string;
	category: string;
	allocated: number;
	spent: number;
	remaining: number;
	percentage: number;
	description: string;
	period: string;
	year: number;
}

interface FinancialSummary {
	totalIncome: number;
	totalExpenses: number;
	netIncome: number;
	pendingTransactions: number;
	verifiedTransactions: number;
	disputedTransactions: number;
	monthlyIncome: number;
	monthlyExpenses: number;
	weeklyIncome: number;
	weeklyExpenses: number;
}

export default function FinancialManagementPage() {
	const { data: session } = useSession();
	const { toast } = useToast();

	const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
	const [categories, setCategories] = useState<FinancialCategory[]>([]);
	const [events, setEvents] = useState<{ _id: string; eventname: string; eventdate: string }[]>([]);
	const [summary, setSummary] = useState<FinancialSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
	const [viewingTransaction, setViewingTransaction] = useState<FinancialTransaction | null>(null);
	const [uploadedFiles, setUploadedFiles] = useState<ReceiptFile[]>([]);
	const [newReceiptPreview, setNewReceiptPreview] = useState<string | null>(null);

	// Filters
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	// Budget state
	const [budgets, setBudgets] = useState<Budget[]>([]);

	// Form state
	const [formData, setFormData] = useState({
		type: "",
		category: "",
		subcategory: "",
		amount: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
		paymentMethod: "",
		referenceNumber: "",
		relatedTo: "",
		eventId: "",
		notes: "",
		tags: "",
		budgetId: "",
	});

	const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("income");
	const [creatingCategory, setCreatingCategory] = useState(false);

	const fetchTransactions = useCallback(async () => {
		try {
			const params = new URLSearchParams();
			if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
			if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
			if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
			if (startDate) params.append("startDate", startDate);
			if (endDate) params.append("endDate", endDate);
			if (search) params.append("search", search);

			const response = await fetch(`/api/financial-transactions?${params}`);
			if (response.ok) {
				const data = await response.json();
				setTransactions(data.transactions || []);
			}
		} catch (error) {
			console.error("Error fetching transactions:", error);
		}
	}, [typeFilter, categoryFilter, statusFilter, startDate, endDate, search]);

	const fetchCategories = useCallback(async () => {
		try {
			const response = await fetch("/api/financial-categories");
			if (response.ok) {
				const data = await response.json();
				setCategories(data || []);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	}, []);

	const fetchEvents = useCallback(async () => {
		try {
			const response = await fetch("/api/events");
			if (response.ok) {
				const data = await response.json();
				setEvents(data.events || []);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	}, []);

	const fetchSummary = useCallback(async () => {
		try {
			const params = new URLSearchParams();
			if (startDate) params.append("startDate", startDate);
			if (endDate) params.append("endDate", endDate);

			const response = await fetch(`/api/financial-transactions/summary?${params}`);
			if (response.ok) {
				const data = await response.json();
				setSummary(data);
			}
		} catch (error) {
			console.error("Error fetching summary:", error);
		}
	}, [startDate, endDate]);

	const fetchBudgets = useCallback(async () => {
		try {
			const response = await fetch("/api/finances/budgets");
			if (response.ok) {
				const data = await response.json();
				setBudgets(data);
			}
		} catch (error) {
			console.error("Error fetching budgets:", error);
		}
	}, []);

	useEffect(() => {
		if (session?.user?.role === "admin") {
			setLoading(true);
			Promise.all([fetchTransactions(), fetchCategories(), fetchEvents(), fetchSummary(), fetchBudgets()]).finally(() => setLoading(false));
		}
	}, [session, fetchTransactions, fetchCategories, fetchEvents, fetchSummary, fetchBudgets]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("nb-NO", {
			style: "currency",
			currency: "NOK",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "verified":
				return (
					<Badge className="bg-green-100 text-green-800">
						<CheckCircle className="w-3 h-3 mr-1" />
						Verified
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-yellow-100 text-yellow-800">
						<Clock className="w-3 h-3 mr-1" />
						Pending
					</Badge>
				);
			case "reconciled":
				return (
					<Badge className="bg-blue-100 text-blue-800">
						<FileCheck className="w-3 h-3 mr-1" />
						Reconciled
					</Badge>
				);
			case "disputed":
				return (
					<Badge className="bg-red-100 text-red-800">
						<XCircle className="w-3 h-3 mr-1" />
						Disputed
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	const getPaymentIcon = (method: string) => {
		switch (method) {
			case "cash":
				return <Banknote className="w-4 h-4" />;
			case "bank_transfer":
				return <Building className="w-4 h-4" />;
			case "card":
				return <CreditCard className="w-4 h-4" />;
			case "online":
				return <Smartphone className="w-4 h-4" />;
			default:
				return <DollarSign className="w-4 h-4" />;
		}
	};

	const getRelatedIcon = (relatedTo: string) => {
		switch (relatedTo) {
			case "event":
				return <Building2 className="w-4 h-4" />;
			case "donation":
				return <Target className="w-4 h-4" />;
			case "membership":
				return <Users className="w-4 h-4" />;
			default:
				return <FolderOpen className="w-4 h-4" />;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const { budgetId, eventId, ...restFormData } = formData;
			console.log("Creating transaction with full formData:", formData);
			console.log("Extracted budgetId:", budgetId);
			console.log("Extracted eventId:", eventId);

			const payload = {
				...restFormData,
				amount: parseFloat(formData.amount),
				receiptFiles: uploadedFiles,
				tags: formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean),
				...(budgetId && budgetId !== "none" && { budgetId }),
				...(eventId && { eventId }),
			};

			console.log("Final payload:", payload);
			console.log("Payload budgetId:", payload.budgetId);
			console.log("Payload eventId:", payload.eventId);

			const response = await fetch("/api/financial-transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				toast({
					title: "Success",
					description: "Transaction created successfully",
				});
				setShowAddDialog(false);
				setFormData({
					type: "",
					category: "",
					subcategory: "",
					amount: "",
					description: "",
					date: new Date().toISOString().split("T")[0],
					paymentMethod: "",
					referenceNumber: "",
					relatedTo: "",
					eventId: "",
					notes: "",
					tags: "",
					budgetId: "",
				});
				setUploadedFiles([]);
				fetchTransactions();
				fetchSummary();
			} else {
				const error = await response.json();
				toast({
					title: "Error",
					description: error.error || "Failed to create transaction",
					variant: "destructive",
				});
			}
		} catch {
			toast({
				title: "Error",
				description: "Failed to create transaction",
				variant: "destructive",
			});
		}
	};

	const handleFileUpload = async (files: FileList) => {
		const uploadPromises = Array.from(files).map(async (file) => {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/financial-transactions/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				return await response.json();
			}
			throw new Error(`Failed to upload ${file.name}`);
		});

		try {
			const results = await Promise.all(uploadPromises);
			setUploadedFiles((prev) => [...prev, ...results]);
			toast({
				title: "Success",
				description: `${results.length} file(s) uploaded successfully`,
			});
		} catch {
			toast({
				title: "Error",
				description: "Failed to upload some files",
				variant: "destructive",
			});
		}
	};

	const handleFileReplace = async (file: File, oldPublicId?: string | null) => {
		try {
			// Create preview for the new file
			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setNewReceiptPreview(reader.result as string);
				};
				reader.readAsDataURL(file);
			} else {
				setNewReceiptPreview(null);
			}

			const formData = new FormData();
			formData.append("file", file);
			if (oldPublicId) {
				formData.append("oldPublicId", oldPublicId);
			}

			const response = await fetch("/api/financial-transactions/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();

				// Update the editing transaction with the new file
				if (editingTransaction) {
					setEditingTransaction({
						...editingTransaction,
						receiptFiles: [result],
					});
				}

				// Clear the preview after successful upload
				setNewReceiptPreview(null);

				toast({
					title: "Receipt Updated",
					description: "Receipt has been successfully uploaded and updated.",
				});
			} else {
				throw new Error("Failed to upload file");
			}
		} catch {
			toast({
				title: "Error",
				description: "Failed to upload receipt",
				variant: "destructive",
			});
			// Clear preview on error
			setNewReceiptPreview(null);
		}
	};

	const createNewCategory = async () => {
		if (!newCategoryName.trim()) return;
		setCreatingCategory(true);
		try {
			const response = await fetch("/api/financial-categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: newCategoryName.trim(),
					type: newCategoryType,
				}),
			});

			if (response.ok) {
				const category = await response.json();
				if (editingTransaction) {
					setEditingTransaction({
						...editingTransaction,
						category: category.name,
						subcategory: "",
					});
				} else {
					setFormData((prev) => ({ ...prev, category: category.name, subcategory: "" }));
				}
				setShowNewCategoryDialog(false);
				setNewCategoryName("");
				fetchCategories();
				toast({
					title: "Success",
					description: "Category created successfully",
				});
			} else {
				const error = await response.json();
				toast({
					title: "Error",
					description: error.error || "Failed to create category",
					variant: "destructive",
				});
			}
		} catch {
			toast({
				title: "Error",
				description: "Failed to create category",
				variant: "destructive",
			});
		} finally {
			setCreatingCategory(false);
		}
	};

	const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
		try {
			const response = await fetch(`/api/financial-transactions/${transactionId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				toast({
					title: "Success",
					description: "Transaction status updated",
				});
				fetchTransactions();
				fetchSummary();
			}
		} catch {
			toast({
				title: "Error",
				description: "Failed to update status",
				variant: "destructive",
			});
		}
	};

	const handleDelete = async (transactionId: string) => {
		if (!window.confirm("Are you sure you want to delete this transaction?")) return;

		try {
			const response = await fetch(`/api/financial-transactions/${transactionId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast({
					title: "Success",
					description: "Transaction deleted successfully",
				});
				fetchTransactions();
				fetchSummary();
			}
		} catch {
			toast({
				title: "Error",
				description: "Failed to delete transaction",
				variant: "destructive",
			});
		}
	};

	if (session?.user?.role !== "admin") {
		return (
			<div className="text-center py-12">
				<AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
				<h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
				<p className="text-gray-600 mb-6">You need admin privileges to access financial management.</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader className="pb-2">
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-full"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
						<Receipt className="h-8 w-8 text-emerald-600" />
						Financial Management
					</h1>
					<p className="text-gray-600 mt-1">Manage daily transactions, receipts, and financial records</p>
				</div>
				<div className="flex items-center gap-2">
					<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
						<DialogTrigger asChild>
							<Button className="bg-brand hover:bg-brand/90">
								<Plus className="h-4 w-4 mr-2" />
								Add Transaction
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Add New Transaction</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="type">Transaction Type *</Label>
										<Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
											<SelectTrigger>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="income">Income</SelectItem>
												<SelectItem value="expense">Expense</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="category">Category *</Label>
										<Select
											value={formData.category}
											onValueChange={(value) => {
												if (value === "__add_new__") {
													setNewCategoryType(formData.type as "income" | "expense");
													setShowNewCategoryDialog(true);
												} else {
													setFormData((prev) => ({ ...prev, category: value, subcategory: "" }));
												}
											}}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
											<SelectContent>
												{formData.type ? (
													<>
														{categories
															.filter((cat) => cat.type === formData.type)
															.map((cat) => (
																<SelectItem key={`${cat._id}-${cat.name}`} value={cat.name}>
																	{cat.name}
																</SelectItem>
															))}
														<SelectSeparator />
														<SelectItem value="__add_new__" className="text-brand font-medium">
															+ Add new category
														</SelectItem>
													</>
												) : (
													<div className="p-2 text-center text-sm text-gray-500">Please select transaction type first</div>
												)}
											</SelectContent>
										</Select>
									</div>
									{formData.category && (
										<div>
											<Label htmlFor="subcategory">Subcategory</Label>
											<Select value={formData.subcategory} onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}>
												<SelectTrigger>
													<SelectValue placeholder="Select subcategory (optional)" />
												</SelectTrigger>
												<SelectContent>
													{categories
														.find((cat) => cat.name === formData.category && cat.type === formData.type)
														?.subcategories.map((sub) => (
															<SelectItem key={sub.name} value={sub.name}>
																{sub.name}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
										</div>
									)}
									<div>
										<Label htmlFor="amount">Amount (NOK) *</Label>
										<Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))} required />
									</div>
									<div>
										<Label htmlFor="date">Date *</Label>
										<Input id="date" type="date" value={formData.date} onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} required />
									</div>
									<div>
										<Label htmlFor="paymentMethod">Payment Method *</Label>
										<Select value={formData.paymentMethod} onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}>
											<SelectTrigger>
												<SelectValue placeholder="Select method" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="cash">Cash</SelectItem>
												<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
												<SelectItem value="card">Card</SelectItem>
												<SelectItem value="online">Vipps</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="relatedTo">Related To *</Label>
										<Select value={formData.relatedTo} onValueChange={(value) => setFormData((prev) => ({ ...prev, relatedTo: value }))}>
											<SelectTrigger>
												<SelectValue placeholder="Select relation" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="event">Event</SelectItem>
												<SelectItem value="donation">Donation</SelectItem>
												<SelectItem value="membership">Membership</SelectItem>
												<SelectItem value="operational">Operational</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>
									{formData.relatedTo === "event" && (
										<div>
											<Label htmlFor="eventId">Event *</Label>
											<Select value={formData.eventId} onValueChange={(value) => setFormData((prev) => ({ ...prev, eventId: value }))}>
												<SelectTrigger>
													<SelectValue placeholder="Select event" />
												</SelectTrigger>
												<SelectContent>
													{events.map((event) => (
														<SelectItem key={event._id} value={event._id}>
															{event.eventname} - {new Date(event.eventdate).toLocaleDateString()}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
									{formData.type === "expense" && (
										<div>
											<Label htmlFor="budgetId">Budget (Optional)</Label>
											<Select value={formData.budgetId} onValueChange={(value) => setFormData((prev) => ({ ...prev, budgetId: value }))}>
												<SelectTrigger>
													<SelectValue placeholder="Select budget to track against" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">No budget</SelectItem>
													{budgets.map((budget, index) => (
														<SelectItem key={`budget-${budget.category}-${budget._id || index}`} value={budget._id || `budget-${index}`}>
															{budget.category} ({formatCurrency(budget.remaining)} remaining)
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</div>
								<div>
									<Label htmlFor="description">Description *</Label>
									<Textarea id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} required />
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="referenceNumber">Reference Number</Label>
										<Input id="referenceNumber" value={formData.referenceNumber} onChange={(e) => setFormData((prev) => ({ ...prev, referenceNumber: e.target.value }))} />
									</div>
									<div>
										<Label htmlFor="tags">Tags (comma-separated)</Label>
										<Input id="tags" value={formData.tags} onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))} placeholder="e.g., urgent, monthly, event-related" />
									</div>
								</div>
								<div>
									<Label htmlFor="notes">Notes</Label>
									<Textarea id="notes" value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} />
								</div>
								<div>
									<Label>Receipts/Documents</Label>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
										<input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} className="hidden" id="file-upload" />
										<label htmlFor="file-upload" className="cursor-pointer">
											<Upload className="mx-auto h-12 w-12 text-gray-400" />
											<p className="mt-2 text-sm text-gray-600">Click to upload receipts, bills, or payment proofs</p>
											<p className="text-xs text-gray-500">Images, PDFs, Word, Excel files (Max 10MB each)</p>
										</label>
									</div>
									{uploadedFiles.length > 0 && (
										<div className="mt-2 space-y-1">
											{uploadedFiles.map((file, index) => (
												<div key={`upload-${index}-${file.filename || "file"}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
													<span className="text-sm">{file.originalName}</span>
													<Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									)}
								</div>
								<div className="flex justify-end gap-2">
									<Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
										Cancel
									</Button>
									<Button type="submit">Create Transaction</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Summary Cards */}
			{summary && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-emerald-800">Total Income</CardTitle>
							<TrendingUp className="h-4 w-4 text-emerald-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-emerald-900">{formatCurrency(summary.totalIncome)}</div>
							<div className="text-xs text-emerald-700 mt-1">{formatCurrency(summary.monthlyIncome)} this month</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
							<TrendingDown className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-900">{formatCurrency(summary.totalExpenses)}</div>
							<div className="text-xs text-red-700 mt-1">{formatCurrency(summary.monthlyExpenses)} this month</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-blue-800">Net Income</CardTitle>
							<DollarSign className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-blue-900">{formatCurrency(summary.netIncome)}</div>
							<div className="text-xs text-blue-700 mt-1">{summary.netIncome >= 0 ? "Positive" : "Negative"} balance</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-purple-800">Pending Review</CardTitle>
							<Clock className="h-4 w-4 text-purple-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-purple-900">{summary.pendingTransactions}</div>
							<div className="text-xs text-purple-700 mt-1">{summary.disputedTransactions} disputed</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
						<div>
							<Label>Search</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
							</div>
						</div>
						<div>
							<Label>Type</Label>
							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All types</SelectItem>
									<SelectItem value="income">Income</SelectItem>
									<SelectItem value="expense">Expense</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Category</Label>
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All categories</SelectItem>
									{categories.map((cat) => (
										<SelectItem key={`${cat._id}-${cat.name}`} value={cat.name}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Status</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="verified">Verified</SelectItem>
									<SelectItem value="reconciled">Reconciled</SelectItem>
									<SelectItem value="disputed">Disputed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Start Date</Label>
							<Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						</div>
						<div>
							<Label>End Date</Label>
							<Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Content Tabs */}
			<Tabs defaultValue="transactions" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="transactions">Transactions</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
				</TabsList>

				<TabsContent value="transactions">
					{/* Transactions Table */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Transactions ({transactions.length})
								</span>
								<Button variant="outline" size="sm">
									<Download className="h-4 w-4 mr-2" />
									Export
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b">
											<th className="text-left p-2">Date</th>
											<th className="text-left p-2">Description</th>
											<th className="text-left p-2">Amount</th>
											<th className="text-left p-2">Status</th>
											<th className="text-left p-2">Actions</th>
										</tr>
									</thead>
									<tbody>
										{transactions.length > 0 ? (
											transactions.map((transaction) => (
												<tr key={transaction._id} className="border-b hover:bg-gray-50">
													<td className="p-2">{formatDate(transaction.date)}</td>
													<td className="p-2 max-w-xs truncate">{transaction.description}</td>
													<td className={`p-2 font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>{formatCurrency(transaction.amount)}</td>

													<td className="p-2">{getStatusBadge(transaction.status)}</td>

													<td className="p-2">
														<div className="flex items-center gap-1">
															<Button variant="ghost" size="sm" onClick={() => setViewingTransaction(transaction)}>
																<Eye className="h-4 w-4" />
															</Button>
															<Button variant="ghost" size="sm" onClick={() => setEditingTransaction(transaction)}>
																<Edit className="h-4 w-4" />
															</Button>
															{transaction.status === "pending" && (
																<Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(transaction._id, "verified")}>
																	<CheckCircle className="h-4 w-4" />
																</Button>
															)}
															<Button variant="ghost" size="sm" onClick={() => handleDelete(transaction._id)}>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan={9} className="text-center py-8 text-gray-500">
													No transactions found
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* View Transaction Modal */}
				{viewingTransaction && (
					<Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
						<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Transaction Details</DialogTitle>
							</DialogHeader>
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h3 className="font-semibold mb-2">Basic Information</h3>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-gray-600">Type:</span>
												<Badge className={viewingTransaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{viewingTransaction.type}</Badge>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Category:</span>
												<span>{viewingTransaction.category}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Amount:</span>
												<span className={`font-semibold ${viewingTransaction.type === "income" ? "text-green-600" : "text-red-600"}`}>{formatCurrency(viewingTransaction.amount)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Date:</span>
												<span>{formatDate(viewingTransaction.date)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Status:</span>
												{getStatusBadge(viewingTransaction.status)}
											</div>
										</div>
									</div>
									<div>
										<h3 className="font-semibold mb-2">Payment Information</h3>
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-gray-600">Payment Method:</span>
												<div className="flex items-center gap-1">
													{getPaymentIcon(viewingTransaction.paymentMethod)}
													<span>{viewingTransaction.paymentMethod}</span>
												</div>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Reference:</span>
												<span>{viewingTransaction.referenceNumber || "N/A"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Related To:</span>
												<div className="flex items-center gap-1">
													{getRelatedIcon(viewingTransaction.relatedTo)}
													<span>{viewingTransaction.relatedTo}</span>
												</div>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Created By:</span>
												<span>{viewingTransaction.createdBy}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Created At:</span>
												<span>{formatDate(viewingTransaction.createdAt)}</span>
											</div>
										</div>
									</div>
								</div>
								<div>
									<h3 className="font-semibold mb-2">Description</h3>
									<p className="text-gray-700">{viewingTransaction.description}</p>
								</div>
								{viewingTransaction.notes && (
									<div>
										<h3 className="font-semibold mb-2">Notes</h3>
										<p className="text-gray-700">{viewingTransaction.notes}</p>
									</div>
								)}
								{viewingTransaction.tags.length > 0 && (
									<div>
										<h3 className="font-semibold mb-2">Tags</h3>
										<div className="flex flex-wrap gap-2">
											{viewingTransaction.tags.map((tag) => (
												<Badge key={tag} variant="secondary">
													{tag}
												</Badge>
											))}
										</div>
									</div>
								)}
								{viewingTransaction.receiptFiles.length > 0 && (
									<div>
										<h3 className="font-semibold mb-2">Receipts & Documents</h3>
										<div className="space-y-4">
											{viewingTransaction.receiptFiles.map((file, index) => (
												<div key={`view-${index}-${file.filename || "file"}`} className="border rounded-lg overflow-hidden">
													<div className="p-3 bg-gray-50 border-b">
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																{file.mimeType && file.mimeType.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-blue-600" /* eslint-disable-next-line jsx-a11y/alt-text */ /> : <FileText className="h-4 w-4 text-gray-600" />}
																<span className="text-sm font-medium">{file.originalName}</span>
															</div>
															<div className="flex items-center gap-2">
																<span className="text-xs text-gray-500">
																	{(file.size / 1024).toFixed(1)} KB • {formatDate(file.uploadedAt)}
																</span>
																<Button variant="outline" size="sm" asChild>
																	<a href={file.url} target="_blank" rel="noopener noreferrer" download>
																		<Download className="h-4 w-4" />
																	</a>
																</Button>
															</div>
														</div>
													</div>
													{file.mimeType && file.mimeType.startsWith("image/") ? (
														<div className="p-4 bg-gray-100">
															<Image src={file.url} alt={`Receipt: ${file.originalName}`} className="object-contain rounded-lg shadow-sm mx-auto" style={{ maxHeight: "400px" }} width={600} height={400} />
														</div>
													) : (
														<div className="p-4 text-center text-gray-500">
															<FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
															<p className="text-sm">Document preview not available</p>
															<Button variant="outline" size="sm" asChild className="mt-2">
																<a href={file.url} target="_blank" rel="noopener noreferrer">
																	<Eye className="h-4 w-4 mr-2" />
																	View Document
																</a>
															</Button>
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}
								<div className="flex justify-end gap-2">
									<Button variant="outline" onClick={() => setViewingTransaction(null)}>
										Close
									</Button>
									{viewingTransaction.status === "pending" && (
										<Button
											onClick={() => {
												handleStatusUpdate(viewingTransaction._id, "verified");
												setViewingTransaction(null);
											}}
										>
											Verify Transaction
										</Button>
									)}
								</div>
							</div>
						</DialogContent>
					</Dialog>
				)}

				{/* Edit Transaction Modal */}
				{editingTransaction && (
					<Dialog
						open={!!editingTransaction}
						onOpenChange={(open) => {
							if (!open) {
								setEditingTransaction(null);
								setNewReceiptPreview(null);
							}
						}}
					>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Edit Transaction</DialogTitle>
							</DialogHeader>
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label>Type</Label>
										<Select value={editingTransaction.type} disabled>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="income">Income</SelectItem>
												<SelectItem value="expense">Expense</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>Category</Label>
										<Select
											value={editingTransaction.category}
											onValueChange={(value) => {
												if (value === "__add_new__") {
													setNewCategoryType(editingTransaction.type);
													setShowNewCategoryDialog(true);
												} else {
													setEditingTransaction({
														...editingTransaction,
														category: value,
														subcategory: "",
													});
												}
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{categories
													.filter((cat) => cat.type === editingTransaction.type)
													.map((category) => (
														<SelectItem key={`${category._id}-${category.name}`} value={category.name}>
															{category.name}
														</SelectItem>
													))}
												<SelectSeparator />
												<SelectItem value="__add_new__" className="text-brand font-medium">
													+ Add new category
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									{editingTransaction.category && categories.find((cat) => cat.name === editingTransaction.category && cat.type === editingTransaction.type)?.subcategories.length ? (
										<div>
											<Label>Subcategory</Label>
											<Select
												value={editingTransaction.subcategory || ""}
												onValueChange={(value) =>
													setEditingTransaction({
														...editingTransaction,
														subcategory: value,
													})
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select subcategory (optional)" />
												</SelectTrigger>
												<SelectContent>
													{categories
														.find((cat) => cat.name === editingTransaction.category && cat.type === editingTransaction.type)
														?.subcategories.map((sub) => (
															<SelectItem key={sub.name} value={sub.name}>
																{sub.name}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
										</div>
									) : editingTransaction.subcategory ? (
										<div>
											<Label>Subcategory</Label>
											<Input value={editingTransaction.subcategory} disabled />
										</div>
									) : null}
									<div>
										<Label>Amount (NOK)</Label>
										<Input
											type="number"
											value={editingTransaction.amount}
											onChange={(e) =>
												setEditingTransaction({
													...editingTransaction,
													amount: parseFloat(e.target.value) || 0,
												})
											}
										/>
									</div>
									<div>
										<Label>Date</Label>
										<Input
											type="date"
											value={editingTransaction.date}
											onChange={(e) =>
												setEditingTransaction({
													...editingTransaction,
													date: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label>Payment Method</Label>
										<Select
											value={editingTransaction.paymentMethod}
											onValueChange={(value) =>
												setEditingTransaction({
													...editingTransaction,
													paymentMethod: value,
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="cash">Cash</SelectItem>
												<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
												<SelectItem value="card">Card</SelectItem>
												<SelectItem value="online">Vipps</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>Status</Label>
										<Select
											value={editingTransaction.status}
											onValueChange={(value) =>
												setEditingTransaction({
													...editingTransaction,
													status: value as "pending" | "verified" | "reconciled" | "disputed",
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="verified">Verified</SelectItem>
												<SelectItem value="reconciled">Reconciled</SelectItem>
												<SelectItem value="disputed">Disputed</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div>
									<Label>Description</Label>
									<Textarea
										value={editingTransaction.description}
										onChange={(e) =>
											setEditingTransaction({
												...editingTransaction,
												description: e.target.value,
											})
										}
										rows={3}
									/>
								</div>

								<div>
									<Label>Notes</Label>
									<Textarea
										value={editingTransaction.notes || ""}
										onChange={(e) =>
											setEditingTransaction({
												...editingTransaction,
												notes: e.target.value,
											})
										}
										rows={2}
									/>
								</div>

								{/* Receipt Upload Section */}
								<div>
									<Label>Receipts & Documents</Label>
									<div className="space-y-4">
										{/* Show existing receipts with preview */}
										{editingTransaction.receiptFiles && editingTransaction.receiptFiles.length > 0 && (
											<div className="space-y-4">
												<p className="text-sm text-gray-600">Current receipts:</p>
												{editingTransaction.receiptFiles.map((file, index) => {
													console.log("Processing file for preview:", { file, index, mimeType: file.mimeType });
													return (
														<div key={`edit-${index}-${file.filename || "file"}`} className="border rounded-lg p-4">
															<div className="flex items-start justify-between mb-3">
																<div className="flex items-center gap-2">
																	{file.mimeType && file.mimeType.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-blue-600" /* eslint-disable-next-line jsx-a11y/alt-text */ /> : <FileText className="h-4 w-4 text-gray-600" />}
																	<span className="text-sm font-medium">{file.originalName}</span>
																</div>
																<div className="flex items-center gap-2">
																	<Button variant="outline" size="sm" asChild>
																		<a href={file.url} target="_blank" rel="noopener noreferrer">
																			<Eye className="h-4 w-4" />
																		</a>
																	</Button>
																</div>
															</div>

															{/* Image preview for existing receipts */}
															{file.mimeType && file.mimeType.startsWith("image/") && (
																<div className="mt-3">
																	<p className="text-xs text-gray-500 mb-2">Current receipt preview:</p>
																	<div className="relative inline-block">
																		<Image
																			src={file.url}
																			alt={file.originalName || "Image"}
																			width={600}
																			height={400}
																			className="max-w-full h-auto max-h-48 rounded border object-contain"
																			onError={(e) => {
																				console.error("Image failed to load:", file.url);
																				(e.target as HTMLImageElement).style.display = "none";
																				const nextElement = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
																				if (nextElement) {
																					nextElement.style.display = "block";
																				}
																			}}
																			onLoad={() => {
																				console.log("Image loaded successfully:", file.url);
																			}}
																		/>
																		<div className="hidden p-4 border rounded bg-gray-50 text-center">
																			<ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" /* eslint-disable-next-line jsx-a11y/alt-text */ />
																			<p className="text-sm text-gray-600">Image preview unavailable</p>
																			<a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs underline">
																				Open in new tab
																			</a>
																		</div>
																		<div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">Current</div>
																	</div>
																</div>
															)}

															<div className="text-xs text-gray-500 mt-2">
																{(file.size / 1024).toFixed(1)} KB • {formatDate(file.uploadedAt)}
															</div>
														</div>
													);
												})}
											</div>
										)}

										{/* Add new receipt with preview */}
										<div>
											<p className="text-sm text-gray-600 mb-2">Add/Replace receipt:</p>
											<Input
												type="file"
												accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
														handleFileReplace(file, editingTransaction.receiptFiles?.[0]?.publicId || null);
													}
												}}
											/>

											{/* Preview for newly uploaded image */}
											{newReceiptPreview && (
												<div className="mt-4">
													<p className="text-xs text-gray-500 mb-2">New receipt preview (will replace current):</p>
													<div className="relative inline-block">
														<Image src={newReceiptPreview} alt="New receipt preview" width={600} height={400} className="max-w-full h-auto max-h-48 rounded border object-contain" />
														<div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">New</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="flex justify-end gap-2">
									<Button variant="outline" onClick={() => setEditingTransaction(null)}>
										Cancel
									</Button>
									<Button
										onClick={() => {
											// Update transaction
											fetch(`/api/financial-transactions/${editingTransaction._id}`, {
												method: "PUT",
												headers: { "Content-Type": "application/json" },
												body: JSON.stringify(editingTransaction),
											}).then(() => {
												fetchTransactions();
												fetchSummary();
												setEditingTransaction(null);
												toast({
													title: "Transaction Updated",
													description: "Transaction has been successfully updated.",
												});
											});
										}}
									>
										Update Transaction
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				)}

				{/* New Category Dialog */}
				<Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Add New Category</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="newCategoryName">Category Name *</Label>
								<Input id="newCategoryName" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Enter category name" autoFocus />
							</div>
							<div>
								<Label>Type</Label>
								<Input value={newCategoryType} disabled className="capitalize" />
							</div>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowNewCategoryDialog(false);
										setNewCategoryName("");
									}}
								>
									Cancel
								</Button>
								<Button onClick={createNewCategory} disabled={creatingCategory || !newCategoryName.trim()}>
									{creatingCategory ? "Creating..." : "Create Category"}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				<TabsContent value="categories">
					<div className="space-y-6">
						<FinancialCategoriesManager />
						<FinancialSyncButton />
						<FinancialDebugButton />
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

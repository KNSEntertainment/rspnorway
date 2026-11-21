"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Edit,
	Trash2,
	Mail,
	Phone,
	Upload,
	GripVertical,
	ChevronUp,
	ChevronDown,
	ChevronsUp,
	ChevronsDown,
	Sparkles,
	Save,
	LayoutGrid,
	ListOrdered,
	Shield,
	Crown,
	CheckCircle2,
	X,
	Search,
} from "lucide-react";
import ExecutiveMemberForm from "@/components/ExecutiveMemberForm";
import ExecutiveMemberBulkUpload from "@/components/ExecutiveMemberBulkUpload";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Member {
	_id: string;
	name: string;
	fullName?: string;
	email: string;
	phone: string;
	position?: string;
	department?: string;
	subdepartment?: string;
	imageUrl?: string;
	order?: number;
	isActive?: boolean;
	source?: string;
	membershipStatus?: string;
	createdAt?: string;
}

// Hierarchy priority helper for smart auto-sort
function getHierarchyPriority(position: string = ""): number {
	const pos = position.toLowerCase().trim();
	if (!pos) return 99;

	if (pos.includes("senior vice president") || pos.includes("वरिष्ठ उपाध्यक्ष")) return 2;
	if (pos.includes("vice president") || pos.includes("उपाध्यक्ष")) return 3;
	if (pos.includes("president") || pos.includes("chair") || pos.includes("अध्यक्ष") || pos.includes("सभापति")) return 1;
	if (pos.includes("general secretary") || pos.includes("महासचिव")) return 4;
	if (pos.includes("joint secretary") || pos.includes("सह-सचिव") || pos.includes("उप-सचिव")) return 7;
	if (pos.includes("secretary") || pos.includes("सचिव")) return 5;
	if (pos.includes("joint treasurer") || pos.includes("सह-कोषाध्यक्ष")) return 8;
	if (pos.includes("treasurer") || pos.includes("कोषाध्यक्ष")) return 6;
	if (pos.includes("head") || pos.includes("coordinator") || pos.includes("प्रमुख") || pos.includes("संयोजक")) return 9;
	if (pos.includes("advisor") || pos.includes("सल्लाहकार")) return 11;
	if (pos.includes("member") || pos.includes("सदस्य")) return 10;
	return 20;
}

export default function ExecutiveMembersAdmin() {
	const locale = useLocale();
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingOrder, setSavingOrder] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [viewMode, setViewMode] = useState<"hierarchy" | "grid">("hierarchy");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	// Modals
	const [showModal, setShowModal] = useState(false);
	const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
	const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

	// Drag and Drop state
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const parseOrder = (val: unknown): number => {
		if (val === null || val === undefined || val === "") return 0;
		const n = Number(val);
		return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
	};

	const fetchMembers = useCallback(async () => {
		try {
			const response = await fetch("/api/executive-members?all=true");
			const data = await response.json();
			if (Array.isArray(data)) {
				// Sort by order ascending. If unranked (order <= 0), sort by recognized hierarchy role priority
				const sorted = [...data].sort((a, b) => {
					const orderA = parseOrder(a.order);
					const orderB = parseOrder(b.order);
					if (orderA > 0 && orderB > 0) {
						if (orderA !== orderB) return orderA - orderB;
					}
					if (orderA > 0 && orderB === 0) return -1;
					if (orderA === 0 && orderB > 0) return 1;

					const prioA = getHierarchyPriority(a.position);
					const prioB = getHierarchyPriority(b.position);
					if (prioA !== prioB) return prioA - prioB;
					return (a.name || "").localeCompare(b.name || "");
				});
				setMembers(sorted);
			}
		} catch (error) {
			console.error("Error fetching executive members:", error);
			showStatus("error", "Failed to load executive members.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMembers();
	}, [fetchMembers]);

	const showStatus = (type: "success" | "error", text: string) => {
		setStatusMessage({ type, text });
		setTimeout(() => setStatusMessage(null), 4000);
	};

	// Save the current order array to the backend
	const saveHierarchyOrder = async (orderedList: Member[] = members) => {
		setSavingOrder(true);
		try {
			const orderedIds = orderedList.map((m) => m._id);
			const membersPayload = orderedList.map((m, idx) => ({
				_id: m._id,
				id: m._id,
				order: idx + 1,
			}));
			const response = await fetch("/api/executive-members/reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderedIds, members: membersPayload }),
			});

			const data = await response.json();
			if (response.ok && data.success) {
				setHasUnsavedChanges(false);
				showStatus("success", "Organizational hierarchy order saved successfully!");
				// Update members with fresh database state
				if (Array.isArray(data.members)) {
					setMembers(data.members);
				}
			} else {
				throw new Error(data.error || "Failed to update hierarchy order.");
			}
		} catch (error: unknown) {
			console.error("Error saving hierarchy order:", error);
			const errMsg = error instanceof Error ? error.message : "Failed to save hierarchy order.";
			showStatus("error", errMsg);
		} finally {
			setSavingOrder(false);
		}
	};

	// Reorder helper
	const moveMember = (fromIndex: number, toIndex: number) => {
		if (toIndex < 0 || toIndex >= members.length || fromIndex === toIndex) return;

		const updated = [...members];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);

		// Recalibrate display orders (1-based)
		const renumbered = updated.map((m, idx) => ({
			...m,
			order: idx + 1,
		}));

		setMembers(renumbered);
		setHasUnsavedChanges(true);
		// Auto-save on movement
		saveHierarchyOrder(renumbered);
	};

	// Move to extreme top
	const moveToTop = (index: number) => {
		moveMember(index, 0);
	};

	// Move to extreme bottom
	const moveToBottom = (index: number) => {
		moveMember(index, members.length - 1);
	};

	// Smart auto-sort by standard hierarchy roles
	const handleSmartAutoSort = () => {
		const sorted = [...members].sort((a, b) => {
			const priorityA = getHierarchyPriority(a.position);
			const priorityB = getHierarchyPriority(b.position);
			if (priorityA !== priorityB) return priorityA - priorityB;
			return (a.name || "").localeCompare(b.name || "");
		});

		const renumbered = sorted.map((m, idx) => ({
			...m,
			order: idx + 1,
		}));

		setMembers(renumbered);
		setHasUnsavedChanges(true);
		saveHierarchyOrder(renumbered);
		showStatus("success", "Automatically organized by standard organizational hierarchy!");
	};

	// HTML5 Drag and Drop Handlers
	const handleDragStart = (e: React.DragEvent, index: number) => {
		e.dataTransfer.setData("text/plain", index.toString());
		e.dataTransfer.effectAllowed = "move";
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		if (dragOverIndex !== index) {
			setDragOverIndex(index);
		}
	};

	const handleDrop = (e: React.DragEvent, targetIndex: number) => {
		e.preventDefault();
		const sourceIndexStr = e.dataTransfer.getData("text/plain");
		const sourceIndex = parseInt(sourceIndexStr, 10);

		if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
			moveMember(sourceIndex, targetIndex);
		}
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	// Modal Handlers
	const handleAddMember = () => {
		setMemberToEdit(null);
		setShowModal(true);
	};

	const handleEditMember = (member: Member) => {
		setMemberToEdit(member);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setMemberToEdit(null);
	};

	const handleFormSuccess = () => {
		setShowModal(false);
		setMemberToEdit(null);
		fetchMembers();
		showStatus("success", memberToEdit ? "Executive member updated successfully." : "New executive member added successfully.");
	};

	const handleDeleteMember = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete "${name}" from executive leadership?`)) return;

		try {
			const response = await fetch(`/api/executive-members/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchMembers();
				showStatus("success", `Deleted ${name} successfully.`);
			} else {
				const res = await response.json();
				throw new Error(res.error || "Failed to delete member.");
			}
		} catch (error: unknown) {
			console.error("Error deleting member:", error);
			const errMsg = error instanceof Error ? error.message : "Failed to delete member.";
			showStatus("error", errMsg);
		}
	};

	// Filtered list based on search query
	const displayMembers = searchQuery
		? members.filter(
				(m) =>
					m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(m.position && m.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
					m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase()))
		  )
		: members;

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
				<div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-brand"></div>
				<p className="text-gray-500 font-medium">Loading executive leadership...</p>
			</div>
		);
	}

	return (
		<section className="container mx-auto px-4 py-6 max-w-7xl">
			{/* Status Toast Message */}
			{statusMessage && (
				<div
					className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
						statusMessage.type === "success"
							? "bg-green-50 border-green-200 text-green-800"
							: "bg-red-50 border-red-200 text-red-800"
					}`}
				>
					<CheckCircle2 className="w-5 h-5 flex-shrink-0" />
					<span className="text-sm font-medium">{statusMessage.text}</span>
					<button onClick={() => setStatusMessage(null)} className="ml-2 hover:opacity-75">
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
				<div>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-50 text-brand rounded-lg">
							<Shield className="w-6 h-6" />
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Executive Members</h1>
							<p className="text-gray-600 text-sm mt-0.5">
								Manage organization hierarchy, positions, and leadership order.
							</p>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5">
					<Button
						onClick={handleSmartAutoSort}
						variant="outline"
						size="sm"
						className="border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-brand text-xs font-medium"
						title="Auto-organize hierarchy by standard leadership roles (President -> VP -> Gen Sec -> Treasurer -> Members)"
					>
						<Sparkles className="w-4 h-4 mr-1.5 text-brand" />
						Auto-Sort Hierarchy
					</Button>

					<Button
						onClick={() => setShowBulkUploadModal(!showBulkUploadModal)}
						variant="outline"
						size="sm"
						className="text-xs font-medium text-gray-700"
					>
						<Upload className="w-4 h-4 mr-1.5" />
						{showBulkUploadModal ? "Close Bulk Upload" : "Bulk Upload"}
					</Button>

					<Button onClick={handleAddMember} size="sm" className="bg-brand hover:bg-brand/90 text-white text-xs font-medium">
						<Plus className="w-4 h-4 mr-1.5" />
						Add Member
					</Button>
				</div>
			</div>

			{/* Bulk Upload Section */}
			{showBulkUploadModal && (
				<div className="mb-6">
					<ExecutiveMemberBulkUpload
						onClose={() => setShowBulkUploadModal(false)}
						onSuccess={() => {
							setShowBulkUploadModal(false);
							fetchMembers();
							showStatus("success", "Bulk members uploaded successfully.");
						}}
					/>
				</div>
			)}

			{/* Hierarchy Guidance & View Controls */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					{/* Search input */}
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search executive members by name, position, department..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
						/>
						{searchQuery && (
							<button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
								<X className="w-4 h-4" />
							</button>
						)}
					</div>

					{/* View Mode Toggle & Order Save */}
					<div className="flex items-center gap-3">
						<div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
							<button
								onClick={() => setViewMode("hierarchy")}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
									viewMode === "hierarchy" ? "bg-white text-brand shadow-sm" : "text-gray-600 hover:text-gray-900"
								}`}
								title="Hierarchy list view with drag-and-drop reordering"
							>
								<ListOrdered className="w-3.5 h-3.5" />
								<span>Hierarchy View</span>
							</button>
							<button
								onClick={() => setViewMode("grid")}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
									viewMode === "grid" ? "bg-white text-brand shadow-sm" : "text-gray-600 hover:text-gray-900"
								}`}
								title="Visual card grid view"
							>
								<LayoutGrid className="w-3.5 h-3.5" />
								<span>Grid View</span>
							</button>
						</div>

						{hasUnsavedChanges && (
							<Button
								onClick={() => saveHierarchyOrder()}
								disabled={savingOrder}
								size="sm"
								className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
							>
								<Save className="w-3.5 h-3.5 mr-1.5" />
								{savingOrder ? "Saving..." : "Save Order"}
							</Button>
						)}
					</div>
				</div>

				{viewMode === "hierarchy" && (
					<div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
						<p className="flex items-center gap-1.5">
							<span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
							Drag any row by its handle (<GripVertical className="w-3 h-3 inline text-gray-400" />) or use the Up/Down buttons to adjust hierarchy. Changes are auto-saved.
						</p>
						<span className="font-semibold text-gray-700">{displayMembers.length} Leaders</span>
					</div>
				)}
			</div>

			{/* Empty State */}
			{displayMembers.length === 0 && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
					<div className="max-w-md mx-auto">
						<div className="w-16 h-16 bg-blue-50 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
							<Shield className="w-8 h-8" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">No Executive Members Found</h3>
						<p className="text-gray-600 mb-6 text-sm">
							{searchQuery
								? "No executive members match your search criteria. Try a different query."
								: "No executive members found. Members who registered through the public membership form with 'Executive' or members added manually will appear here."}
						</p>
						<div className="flex justify-center gap-3">
							{searchQuery ? (
								<Button variant="outline" onClick={() => setSearchQuery("")}>
									Clear Search
								</Button>
							) : (
								<div className="flex flex-wrap items-center justify-center gap-3">
									<Link href={`/${locale}/dashboard/memberships`}>
										<Button variant="outline">
											View Membership Applications
										</Button>
									</Link>
									<Button onClick={handleAddMember} className="bg-brand hover:bg-brand/90 text-white">
										<Plus className="w-4 h-4 mr-2" />
										Add First Member
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Hierarchy View (Reorderable List) */}
			{viewMode === "hierarchy" && displayMembers.length > 0 && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
					{displayMembers.map((member, index) => {
						const isTopRank = (member.order ?? index + 1) === 1;
						const isSecondRank = (member.order ?? index + 1) === 2 || (member.order ?? index + 1) === 3;
						const isDragging = draggedIndex === index;
						const isOver = dragOverIndex === index;

						return (
							<div
								key={member._id}
								draggable={!searchQuery} // Disable dragging during search filtering
								onDragStart={(e) => handleDragStart(e, index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDrop={(e) => handleDrop(e, index)}
								onDragEnd={handleDragEnd}
								className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 transition-all duration-150 ${
									isDragging ? "opacity-40 bg-gray-50 scale-[0.99]" : ""
								} ${isOver ? "border-t-2 border-brand bg-blue-50/40" : "hover:bg-gray-50/80"}`}
							>
								{/* Left Part: Drag Handle, Rank Badge, Avatar, Info */}
								<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
									{/* Drag Handle */}
									<div
										className={`p-1.5 rounded text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing ${
											searchQuery ? "opacity-30 cursor-not-allowed" : ""
										}`}
										title={searchQuery ? "Clear search to reorder by dragging" : "Drag to reorder hierarchy"}
									>
										<GripVertical className="w-5 h-5" />
									</div>

									{/* Hierarchy Rank Badge */}
									<div className="flex items-center justify-center">
										{isTopRank ? (
											<div
												className="flex items-center justify-center gap-1 w-12 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs"
												title="Rank #1: Top Leadership"
											>
												<Crown className="w-3.5 h-3.5 text-amber-600" />
												<span>#1</span>
											</div>
										) : isSecondRank ? (
											<div
												className="flex items-center justify-center w-12 h-8 rounded-lg bg-blue-100 border border-blue-200 text-brand text-xs font-bold"
												title={`Rank #${member.order ?? index + 1}`}
											>
												#{member.order ?? index + 1}
											</div>
										) : (
											<div
												className="flex items-center justify-center w-12 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold"
												title={`Rank #${member.order ?? index + 1}`}
											>
												#{member.order ?? index + 1}
											</div>
										)}
									</div>

									{/* Avatar / Photo */}
									<div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-xs">
										{member.imageUrl && !member.imageUrl.startsWith("data:") ? (
											<Image
												src={member.imageUrl}
												alt={member.name}
												width={48}
												height={48}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-blue-600 text-white font-bold text-lg">
												{member.name.charAt(0).toUpperCase()}
											</div>
										)}
									</div>

									{/* Member Info */}
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2 flex-wrap">
											<h3 className="text-base font-bold text-gray-900 truncate">{member.name}</h3>
											{member.isActive === false && (
												<span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
													Inactive
												</span>
											)}
										</div>

										<div className="flex items-center gap-2 flex-wrap mt-0.5">
											{member.position ? (
												<span className="text-xs font-semibold text-brand px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
													{member.position}
												</span>
											) : (
												<span className="text-xs text-gray-400 italic">No position title</span>
											)}

											{member.department && (
												<span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
													{member.department}
													{member.subdepartment ? ` • ${member.subdepartment}` : ""}
												</span>
											)}
										</div>

										<div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
											{member.email && (
												<a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:text-brand truncate">
													<Mail className="w-3.5 h-3.5" />
													<span className="truncate">{member.email}</span>
												</a>
											)}
											{member.phone && (
												<a href={`tel:${member.phone}`} className="hidden md:flex items-center gap-1 hover:text-brand">
													<Phone className="w-3.5 h-3.5" />
													<span>{member.phone}</span>
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Right Part: Direct Rank Input, Reorder Buttons & Action Buttons */}
								<div className="flex items-center justify-end gap-2 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
									{/* Reorder Buttons (Move Up, Down, Top, Bottom) */}
									<div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
										<button
											onClick={() => moveToTop(index)}
											disabled={index === 0 || !!searchQuery}
											className="p-1 text-gray-500 hover:text-brand disabled:opacity-30 disabled:hover:text-gray-500"
											title="Send to Top (#1)"
										>
											<ChevronsUp className="w-4 h-4" />
										</button>
										<button
											onClick={() => moveMember(index, index - 1)}
											disabled={index === 0 || !!searchQuery}
											className="p-1 text-gray-500 hover:text-brand disabled:opacity-30 disabled:hover:text-gray-500"
											title="Move Up"
										>
											<ChevronUp className="w-4 h-4" />
										</button>
										<button
											onClick={() => moveMember(index, index + 1)}
											disabled={index === members.length - 1 || !!searchQuery}
											className="p-1 text-gray-500 hover:text-brand disabled:opacity-30 disabled:hover:text-gray-500"
											title="Move Down"
										>
											<ChevronDown className="w-4 h-4" />
										</button>
										<button
											onClick={() => moveToBottom(index)}
											disabled={index === members.length - 1 || !!searchQuery}
											className="p-1 text-gray-500 hover:text-brand disabled:opacity-30 disabled:hover:text-gray-500"
											title="Send to Bottom"
										>
											<ChevronsDown className="w-4 h-4" />
										</button>
									</div>

									{/* Action Buttons: Edit, Delete */}
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleEditMember(member)}
										className="h-8 px-2.5 text-xs text-gray-700 hover:text-brand hover:border-brand"
										title="Edit member details"
									>
										<Edit className="w-3.5 h-3.5 mr-1" />
										Edit
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteMember(member._id, member.name)}
										className="h-8 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
										title="Delete member"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Card Grid View */}
			{viewMode === "grid" && displayMembers.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{displayMembers.map((member, index) => {
						const isTopRank = (member.order ?? index + 1) === 1;

						return (
							<div
								key={member._id}
								className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col"
							>
								{/* Hierarchy Rank Badge on Card */}
								<div className="absolute top-3 left-3 z-10">
									{isTopRank ? (
										<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
											<Crown className="w-3.5 h-3.5" />
											#1 Leadership
										</span>
									) : (
										<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900/80 backdrop-blur-xs text-white shadow-md">
											Rank #{member.order ?? index + 1}
										</span>
									)}
								</div>

								{/* Photo */}
								<div className="aspect-square overflow-hidden bg-gray-100 relative">
									{member.imageUrl && !member.imageUrl.startsWith("data:") ? (
										<Image
											src={member.imageUrl}
											alt={member.name}
											width={400}
											height={400}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-blue-600">
											<span className="text-white text-6xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
										</div>
									)}
								</div>

								{/* Content */}
								<div className="p-5 flex flex-col flex-1">
									<h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>

									{member.position && (
										<p className="text-sm font-semibold text-brand mb-2">{member.position}</p>
									)}

									{member.department && (
										<span className="inline-block self-start text-xs text-gray-600 bg-gray-100 rounded px-2 py-0.5 mb-3">
											{member.department}
											{member.subdepartment ? ` • ${member.subdepartment}` : ""}
										</span>
									)}

									<div className="space-y-1.5 mb-4 text-xs text-gray-600 mt-auto">
										{member.phone && (
											<a href={`tel:${member.phone}`} className="flex items-center gap-2 hover:text-brand">
												<Phone className="w-3.5 h-3.5 text-gray-400" />
												<span>{member.phone}</span>
											</a>
										)}
										{member.email && (
											<a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-brand break-all">
												<Mail className="w-3.5 h-3.5 text-gray-400" />
												<span>{member.email}</span>
											</a>
										)}
									</div>

									{/* Card Footer Actions */}
									<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
										<div className="flex items-center bg-gray-50 rounded p-1 border border-gray-200">
											<button
												onClick={() => moveMember(index, index - 1)}
												disabled={index === 0}
												className="p-1 text-gray-500 hover:text-brand disabled:opacity-30"
												title="Move Up"
											>
												<ChevronUp className="w-4 h-4" />
											</button>
											<button
												onClick={() => moveMember(index, index + 1)}
												disabled={index === members.length - 1}
												className="p-1 text-gray-500 hover:text-brand disabled:opacity-30"
												title="Move Down"
											>
												<ChevronDown className="w-4 h-4" />
											</button>
										</div>

										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditMember(member)}
											className="flex-1 text-xs"
										>
											<Edit className="w-3.5 h-3.5 mr-1" />
											Edit
										</Button>

										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteMember(member._id, member.name)}
											className="text-red-600 hover:bg-red-50 text-xs px-2.5"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Add / Edit Member Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
						<div className="flex items-center justify-between p-5 border-b border-gray-200">
							<div className="flex items-center gap-2.5">
								<div className="p-2 bg-blue-50 text-brand rounded-lg">
									<Shield className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-gray-900">
										{memberToEdit ? `Edit Member: ${memberToEdit.name}` : "Add New Executive Member"}
									</h2>
									<p className="text-xs text-gray-500">Configure details, role, and organizational hierarchy rank</p>
								</div>
							</div>
							<button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-6">
							<ExecutiveMemberForm
								handleCloseModal={handleCloseModal}
								memberToEdit={memberToEdit}
								onSuccess={handleFormSuccess}
								existingMembers={members}
							/>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}

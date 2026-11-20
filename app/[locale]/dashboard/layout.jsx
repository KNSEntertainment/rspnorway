"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { ActiveMenuProvider, useActiveMenu } from "@/context/ActiveMenuContext";
import { getDashboardMenuItems } from "@/components/DashboardMenuItems";
import { 
	Shield, 
	Search, 
	X, 
	Menu, 
	ChevronRight, 
	UserCheck, 
	LogOut, 
	SlidersHorizontal
} from "lucide-react";

function DashboardLayoutContent({ children }) {
	const { activeMenu, setActiveMenu } = useActiveMenu();
	const router = useRouter();
	const locale = useLocale() || "en";
	const { data: session, status } = useSession();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const allMenuItems = useMemo(() => getDashboardMenuItems(locale), [locale]);

	// Protect dashboard: redirect if not authenticated or not admin/treasurer
	if (status === "loading") {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-4">
				<div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand"></div>
				<p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard console...</p>
			</div>
		);
	}
	if (!session) {
		router.replace(`/${locale}/login`);
		return null;
	}
	if (session.user.role !== "admin" && session.user.role !== "treasurer") {
		router.replace(`/${locale}/profile`);
		return null;
	}

	const role = session.user.role;

	// Filter menu items by role
	const visibleMenuItems = allMenuItems.filter((item) => {
		if (!item.roles) return role === "admin";
		return item.roles.includes(role);
	});

	// Filter by search query if user types in search
	const filteredItems = searchQuery.trim()
		? visibleMenuItems.filter(
				(item) =>
					item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.category.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: visibleMenuItems;

	// Group filtered items by category
	const categories = [
		"Core",
		"Community & People",
		"Events & Programs",
		"Content & Media",
		"Finances & Operations",
		"Communications & Settings",
	];

	const groupedItems = categories
		.map((cat) => ({
			category: cat,
			items: filteredItems.filter((item) => item.category === cat),
		}))
		.filter((group) => group.items.length > 0);

	// Find current active item details for breadcrumbs
	const currentActiveItem = visibleMenuItems.find((i) => i.id === activeMenu) || visibleMenuItems[0];
	const ActiveIcon = currentActiveItem?.icon || SlidersHorizontal;

	const renderNavList = (isMobile = false) => (
		<div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-sm">
			{groupedItems.map((group) => (
				<div key={group.category} className="space-y-1">
					<div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
						{group.category}
					</div>
					<div className="space-y-0.5">
						{group.items.map((item) => {
							const Icon = item.icon;
							const isActive = activeMenu === item.id;
							return (
								<Link
									key={item.id}
									href={item.href}
									onClick={() => {
										setActiveMenu(item.id);
										if (isMobile) setMobileOpen(false);
									}}
									className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
										isActive
											? "bg-brand/10 text-brand font-semibold shadow-xs"
											: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
									}`}
								>
									{isActive && (
										<span className="absolute left-1.5 top-2 bottom-2 w-1 rounded-full bg-brand" />
									)}
									<span
										className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
											isActive
												? "bg-brand text-white shadow-xs"
												: "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800"
										}`}
									>
										<Icon className="w-4 h-4" />
									</span>
									<span className="truncate">{item.label}</span>
								</Link>
							);
						})}
					</div>
				</div>
			))}

			{groupedItems.length === 0 && (
				<div className="py-8 text-center text-slate-400 text-xs">
					No matching tools found for &quot;{searchQuery}&quot;
				</div>
			)}
		</div>
	);

	const renderUserFooter = () => (
		<div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
			<div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
				<div className="w-8 h-8 rounded-full bg-brand text-white font-semibold flex items-center justify-center text-xs flex-shrink-0">
					{session.user.fullName?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "A"}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-semibold text-slate-900 truncate">{session.user.fullName || "Administrator"}</p>
					<p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
				</div>
			</div>

			<div className="mt-2 flex items-center gap-1.5 pt-1">
				<Link
					href={`/${locale}/profile`}
					className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-brand hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors"
					title="View Member Profile"
				>
					<UserCheck className="w-3.5 h-3.5" />
					<span>Member View</span>
				</Link>
				<button
					onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
					className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
					title="Sign Out"
				>
					<LogOut className="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
	);

	return (
		<div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-180px)]">
			{/* Mobile Top App Bar */}
			<div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200/80 bg-white sticky top-0 z-30">
				<div className="flex items-center gap-2.5 min-w-0">
					<button
						type="button"
						onClick={() => setMobileOpen(true)}
						aria-label="Open sidebar menu"
						className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
					>
						<Menu className="w-5 h-5" />
					</button>
					<div className="flex items-center gap-2 truncate">
						<span className="w-6 h-6 rounded-md bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
							<ActiveIcon className="w-3.5 h-3.5" />
						</span>
						<span className="text-sm font-semibold text-slate-900 truncate">
							{currentActiveItem?.label || "Admin Console"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
						{role}
					</span>
				</div>
			</div>

			{/* Main Layout Container */}
			<div className="flex flex-1 min-h-0">
				{/* Desktop Sidebar */}
				<aside className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 bg-white border-r border-slate-200/80">
					{/* Sidebar Brand Header */}
					<div className="p-4 border-b border-slate-200/80">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
									<Shield className="w-4 h-4 text-brand" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-slate-900 leading-tight">Admin Console</h2>
									<p className="text-[11px] text-slate-500">PNSB Norway Platform</p>
								</div>
							</div>
							<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-semibold">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span className="capitalize">{role}</span>
							</div>
						</div>

						{/* Quick Search */}
						<div className="relative">
							<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Filter 24 tools..."
								className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							)}
						</div>
					</div>

					{/* Navigation List */}
					{renderNavList(false)}

					{/* Logged in User Bar */}
					{renderUserFooter()}
				</aside>

				{/* Mobile Drawer */}
				{mobileOpen && (
					<div className="fixed inset-0 z-50 lg:hidden flex">
						{/* Backdrop */}
						<div
							className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
							onClick={() => setMobileOpen(false)}
						/>

						{/* Drawer Panel */}
						<div className="relative w-80 max-w-[85vw] bg-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
							<div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
										<Shield className="w-4 h-4 text-brand" />
									</div>
									<div>
										<h2 className="text-sm font-bold text-slate-900">Admin Console</h2>
										<p className="text-[11px] text-slate-500">PNSB Norway Platform</p>
									</div>
								</div>
								<button
									onClick={() => setMobileOpen(false)}
									className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Quick Search */}
							<div className="p-3 border-b border-slate-100">
								<div className="relative">
									<Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Filter tools..."
										className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30"
									/>
									{searchQuery && (
										<button
											onClick={() => setSearchQuery("")}
											className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									)}
								</div>
							</div>

							{/* Mobile Nav List */}
							{renderNavList(true)}

							{/* Mobile User Footer */}
							{renderUserFooter()}
						</div>
					</div>
				)}

				{/* Main Content Workspace Canvas */}
				<div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
					{/* Desktop Breadcrumb Header */}
					<div className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200/80">
						<div className="flex items-center gap-2 text-xs text-slate-500">
							<Link href={`/${locale}/dashboard`} className="hover:text-slate-900 transition-colors">
								Console
							</Link>
							<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
							<span className="font-semibold text-slate-800">{currentActiveItem?.label}</span>
							<span className="text-slate-300">/</span>
							<span className="text-[11px] text-slate-400">{currentActiveItem?.category}</span>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
								Role: <strong className="text-slate-800 capitalize">{role}</strong>
							</span>
						</div>
					</div>

					{/* Child View */}
					<main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
				</div>
			</div>
			<Toaster />
		</div>
	);
}

export default function DashboardLayout({ children }) {
	return (
		<ActiveMenuProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</ActiveMenuProvider>
	);
}
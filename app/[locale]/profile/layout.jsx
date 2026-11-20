"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Toaster } from "@/components/ui/toaster";
import { useSession, signOut } from "next-auth/react";
import { getMemberMenuItems } from "@/components/MemberMenuItems";
import { 
	UserCheck, 
	X, 
	Menu, 
	ChevronRight, 
	LayoutDashboard, 
	LogOut, 
	ShieldCheck,
	Sparkles
} from "lucide-react";

function ProfileLayoutContent({ children }) {
	const router = useRouter();
	const pathname = usePathname() || "";
	const locale = useLocale() || "en";
	const [mobileOpen, setMobileOpen] = useState(false);
	const { data: session, status } = useSession();

	const memberMenuItems = useMemo(
		() => getMemberMenuItems(locale, session?.user?.membershipType),
		[locale, session?.user?.membershipType]
	);

	// Protect profile: redirect if not authenticated
	if (status === "loading") {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-4">
				<div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-brand"></div>
				<p className="text-sm font-medium text-slate-500 animate-pulse">Loading member portal...</p>
			</div>
		);
	}
	if (!session) {
		router.replace(`/${locale}/login`);
		return null;
	}

	const membershipType = session.user?.membershipType || "general";
	const isAdminOrTreasurer = session.user?.role === "admin" || session.user?.role === "treasurer";

	// Group member menu items by category
	const categories = ["Account", "Engagement", "Executive", "Security"];
	const groupedItems = categories
		.map((cat) => ({
			category: cat,
			items: memberMenuItems.filter((item) => item.category === cat),
		}))
		.filter((group) => group.items.length > 0);

	// Find active item
	const currentActiveItem = memberMenuItems.find((item) => {
		if (item.href === `/${locale}/profile`) {
			return pathname === `/${locale}/profile` || pathname === `/profile`;
		}
		return pathname.startsWith(item.href);
	}) || memberMenuItems[0];

	const ActiveIcon = currentActiveItem?.icon || UserCheck;

	const renderNavList = (isMobile = false) => (
		<div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-sm">
			{groupedItems.map((group) => (
				<div key={group.category} className="space-y-1">
					<div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
						{group.category}
					</div>
					<div className="space-y-0.5">
						{group.items.map((item) => {
							const Icon = item.icon;
							const isActive =
								item.href === `/${locale}/profile`
									? pathname === `/${locale}/profile` || pathname === `/profile`
									: pathname.startsWith(item.href);

							return (
								<Link
									key={item.id}
									href={item.href}
									onClick={() => {
										if (isMobile) setMobileOpen(false);
									}}
									className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
										isActive
											? "bg-brand/10 text-brand font-semibold shadow-xs"
											: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
									}`}
								>
									{isActive && (
										<span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-brand" />
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
									<div className="min-w-0 flex-1">
										<div className="truncate">{item.label}</div>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);

	const renderUserFooter = () => (
		<div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
			<div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
				<div className="w-8 h-8 rounded-full bg-brand text-white font-semibold flex items-center justify-center text-xs flex-shrink-0">
					{session.user.fullName?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "M"}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-semibold text-slate-900 truncate">{session.user.fullName || "Member"}</p>
					<p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
				</div>
			</div>

			<div className="mt-2 flex items-center gap-1.5 pt-1">
				{isAdminOrTreasurer && (
					<Link
						href={`/${locale}/dashboard`}
						className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-brand hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors"
						title="Open Admin Dashboard"
					>
						<LayoutDashboard className="w-3.5 h-3.5" />
						<span>Admin Console</span>
					</Link>
				)}
				<button
					onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
					className={`flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors ${
						!isAdminOrTreasurer ? "w-full" : ""
					}`}
					title="Sign Out"
				>
					<LogOut className="w-3.5 h-3.5 mr-1" />
					<span>Sign Out</span>
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
							{currentActiveItem?.label || "Member Portal"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand capitalize">
						{membershipType} Member
					</span>
				</div>
			</div>

			{/* Main Layout Container */}
			<div className="flex flex-1 min-h-0">
				{/* Desktop Sidebar */}
				<aside className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 bg-white border-r border-slate-200/80">
					{/* Sidebar Brand Header */}
					<div className="p-4 border-b border-slate-200/80">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shadow-xs">
									<UserCheck className="w-4 h-4" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-slate-900 leading-tight">Member Portal</h2>
									<p className="text-[11px] text-slate-500">PNSB Norway Community</p>
								</div>
							</div>
							<div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-semibold capitalize">
								<Sparkles className="w-3 h-3" />
								<span>{membershipType}</span>
							</div>
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
									<div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center">
										<UserCheck className="w-4 h-4" />
									</div>
									<div>
										<h2 className="text-sm font-bold text-slate-900">Member Portal</h2>
										<p className="text-[11px] text-slate-500">PNSB Norway Community</p>
									</div>
								</div>
								<button
									onClick={() => setMobileOpen(false)}
									className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
								>
									<X className="w-5 h-5" />
								</button>
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
							<Link href={`/${locale}/profile`} className="hover:text-slate-900 transition-colors">
								Member Area
							</Link>
							<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
							<span className="font-semibold text-slate-800">{currentActiveItem?.label}</span>
							<span className="text-slate-300">/</span>
							<span className="text-[11px] text-slate-400">{currentActiveItem?.category}</span>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
								<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
								<span>Verified Account</span>
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

export default function ProfileLayout({ children }) {
	return <ProfileLayoutContent>{children}</ProfileLayoutContent>;
}
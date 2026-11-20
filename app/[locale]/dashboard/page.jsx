"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useActiveMenu } from "@/context/ActiveMenuContext";
import { getDashboardMenuItems } from "@/components/DashboardMenuItems";
import { 
	Search, 
	ArrowRight, 
	SlidersHorizontal, 
	Activity, 
	ShieldCheck, 
	Sparkles, 
	Users, 
	Calendar, 
	TrendingUp, 
	X
} from "lucide-react";

export default function DashboardGrid() {
	const { setActiveMenu } = useActiveMenu();
	const { data: session } = useSession();
	const locale = useLocale() || "en";

	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");

	const allItems = useMemo(() => getDashboardMenuItems(locale), [locale]);

	const role = session?.user?.role || "admin";

	const visibleItems = useMemo(() => {
		return allItems.filter((item) => {
			if (!item.roles) return role === "admin";
			return item.roles.includes(role);
		});
	}, [allItems, role]);

	// Filter by search and category
	const filteredItems = useMemo(() => {
		return visibleItems.filter((item) => {
			const matchesCategory = activeCategory === "All" || item.category === activeCategory;
			const query = searchQuery.trim().toLowerCase();
			const matchesSearch =
				!query ||
				item.label.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				item.category.toLowerCase().includes(query);

			return matchesCategory && matchesSearch;
		});
	}, [visibleItems, activeCategory, searchQuery]);

	// Summary stats
	const stats = [
		{
			label: "Community Members",
			description: "Manage registrations & accounts",
			href: `/${locale}/dashboard/memberships`,
			menuId: "memberships",
			icon: Users,
			badge: "Registry",
		},
		{
			label: "Active Events",
			description: "Schedules, tickets & check-in",
			href: `/${locale}/dashboard/events`,
			menuId: "events",
			icon: Calendar,
			badge: "Programs",
		},
		{
			label: "Financial Analytics",
			description: "Budgets, revenues & reports",
			href: `/${locale}/dashboard/finances`,
			menuId: "finances",
			icon: TrendingUp,
			badge: "Finances",
		},
		{
			label: "Security & Access",
			description: "System roles & credentials",
			href: `/${locale}/dashboard/users`,
			menuId: "users",
			icon: ShieldCheck,
			badge: "Security",
		},
	];

	const categories = [
		"All",
		"Community & People",
		"Events & Programs",
		"Content & Media",
		"Finances & Operations",
		"Communications & Settings",
	];

	const todayFormatted = new Date().toLocaleDateString(locale === "no" ? "nb-NO" : "en-US", {
		weekday: "long",
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			{/* Executive Hero Banner */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8 shadow-sm">
				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="space-y-2 max-w-2xl">
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand/20 text-sky-300 border border-brand/30">
								<Activity className="w-3.5 h-3.5 text-brand" />
								<span>Admin Console Live</span>
							</span>
							<span className="text-xs text-slate-400">• {todayFormatted}</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							Welcome back, {session?.user?.fullName || "Administrator"}
						</h1>
						<p className="text-sm text-slate-300 leading-relaxed">
							Welcome to the central administrative command center. Oversee community members, manage registrations, publish notices, track events, and monitor organization finances.
						</p>
					</div>

					<div className="flex flex-row md:flex-col items-start md:items-end gap-2 flex-shrink-0">
						<div className="px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2">
							<Sparkles className="w-3.5 h-3.5 text-amber-400" />
							<span>Active Role: <strong className="text-white capitalize">{role}</strong></span>
						</div>
						<div className="text-xs text-slate-400">
							{visibleItems.length} active management modules
						</div>
					</div>
				</div>

				{/* Subtle geometric background decoration */}
				<div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-brand/10 to-transparent pointer-events-none" />
				<div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
			</div>

			{/* Operational KPI / Quick Action Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<Link
							key={stat.label}
							href={stat.href}
							onClick={() => setActiveMenu(stat.menuId)}
							className="group p-4 bg-white border border-slate-200/80 rounded-xl hover:border-brand/40 hover:shadow-sm transition-all duration-150 flex items-start justify-between"
						>
							<div className="space-y-1">
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
									{stat.badge}
								</span>
								<h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand transition-colors pt-1">
									{stat.label}
								</h3>
								<p className="text-xs text-slate-500">{stat.description}</p>
							</div>
							<div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-brand/10 text-slate-500 group-hover:text-brand flex items-center justify-center transition-colors flex-shrink-0">
								<Icon className="w-4 h-4" />
							</div>
						</Link>
					);
				})}
			</div>

			{/* Search & Category Filter Section */}
			<div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
				<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
					{/* Search Bar */}
					<div className="relative flex-1 max-w-md">
						<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search modules (e.g., donations, users, blogs)..."
							className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>

					{/* Result count */}
					<div className="text-xs text-slate-500 flex items-center gap-1.5 self-center sm:self-auto">
						<SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
						<span>
							Showing <strong>{filteredItems.length}</strong> of {visibleItems.length} modules
						</span>
					</div>
				</div>

				{/* Category Pills */}
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
					{categories.map((cat) => {
						const isSelected = activeCategory === cat;
						const count =
							cat === "All"
								? visibleItems.length
								: visibleItems.filter((i) => i.category === cat).length;

						if (count === 0 && cat !== "All") return null;

						return (
							<button
								key={cat}
								onClick={() => setActiveCategory(cat)}
								className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
									isSelected
										? "bg-slate-900 text-white shadow-2xs"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
								}`}
							>
								<span>{cat}</span>
								<span
									className={`text-[10px] px-1.5 py-0.2 rounded-full ${
										isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
									}`}
								>
									{count}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Management Modules Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.id}
							href={item.href}
							onClick={() => setActiveMenu(item.id)}
							className="group relative bg-white border border-slate-200/80 hover:border-brand/40 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
						>
							<div>
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-brand group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0 shadow-2xs">
										<Icon className="w-5 h-5" />
									</div>
									<span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
										{item.category}
									</span>
								</div>

								<h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand transition-colors">
									{item.label}
								</h3>
								<p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
									{item.description}
								</p>
							</div>

							<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-brand transition-colors">
								<span>Access tool</span>
								<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
							</div>
						</Link>
					);
				})}
			</div>

			{filteredItems.length === 0 && (
				<div className="text-center py-12 bg-white rounded-xl border border-slate-200/80 p-8 space-y-3">
					<SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto" />
					<h3 className="text-sm font-semibold text-slate-700">No matching modules found</h3>
					<p className="text-xs text-slate-500">
						Try clearing your search query or selecting a different category filter.
					</p>
					<button
						onClick={() => {
							setSearchQuery("");
							setActiveCategory("All");
						}}
						className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
					>
						Reset filters
					</button>
				</div>
			)}
		</div>
	);
}
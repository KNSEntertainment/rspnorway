"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { menuItems } from "@/components/dashboardMenuItems";
import { useSession } from "next-auth/react";

import { ActiveMenuProvider, useActiveMenu } from "@/context/ActiveMenuContext";

function DashboardLayoutContent({ children }) {
	const { activeMenu } = useActiveMenu();
	const router = useRouter();
	const [profileOpen, setProfileOpen] = useState(false);
	const { data: session, status } = useSession();

	// Protect dashboard: redirect if not authenticated
	if (status === "loading") {
		return (
			<div className="flex items-center justify-center h-screen w-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
				<span>Loading...</span>
			</div>
		);
	}
	if (!session) {
		router.replace("/login");
		return null;
	}

	return (
		<div
			className="mx-auto flex flex-col md:flex-row h-screen overflow-hidden pt-24"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#admin-profile-menu"))) {
					setProfileOpen(false);
				}
			}}
		>
			{/* Sidebar */}
			<div className="hidden md:flex w-64 flex-col bg-slate-800 shadow-lg">
				<nav className="flex-1 overflow-y-auto no-scrollbar">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeMenu === item.id;
						return (
							<Link
								key={item.id}
								href={item.href}
								className={`w-full flex items-center px-4 py-4 text-sm transition-colors duration-200
									${isActive ? "bg-brand text-white font-semibold shadow border-r-4 border-black" : "text-slate-200 hover:text-black hover:bg-gray-100"}
								`}
								style={isActive ? { boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.10)" } : {}}
							>
								<Icon className="w-5 h-5 mr-3 flex-shrink-0" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Content Area */}
			<main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-6 no-scrollbar">{children}</main>
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

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import { ActiveMenuProvider, useActiveMenu } from "@/context/ActiveMenuContext";
import { BookImage, Settings, GalleryThumbnails, LayoutDashboard, Book, Newspaper, User, Download, Users, VideoIcon, Bell, FileText, Layers, Mail } from "lucide-react";

function DashboardLayoutContent({ children }) {
	const { activeMenu } = useActiveMenu();
	const router = useRouter();
	const [profileOpen, setProfileOpen] = useState(false);
	const { data: session, status } = useSession();

	const menuItems = [
		{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brand", href: "/en/dashboard" },
		{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-red-900", href: "/en/dashboard/contactmessages" },
		{ id: "memberships", label: "Memberships", icon: Users, color: "bg-blue-600", href: "/en/dashboard/memberships" },
		{ id: "departments", label: "Departments", icon: Layers, color: "bg-teal-600", href: "/en/dashboard/departments" },
		{ id: "executive-members", label: "Executive Members", icon: Users, color: "bg-cyan-600", href: "/en/dashboard/executive-members" },
		{ id: "events", label: "Events", icon: BookImage, color: "bg-purple-500", href: "/en/dashboard/events" },
		{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-orange-700", href: "/en/dashboard/blogs" },
		{ id: "notices", label: "Notices", icon: Bell, color: "bg-blue-600", href: "/en/dashboard/notices" },
		{ id: "circulars", label: "Circulars", icon: FileText, color: "bg-indigo-600", href: "/en/dashboard/circulars" },
		{ id: "videos", label: "Videos", icon: VideoIcon, color: "bg-purple-600", href: "/en/dashboard/videos" },
		{ id: "gallery", label: "Gallery", icon: GalleryThumbnails, color: "bg-orange-500", href: "/en/dashboard/gallery" },
		{ id: "downloads", label: "Downloads", icon: Download, color: "bg-red-500", href: "/en/dashboard/downloads" },
		{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-pink-600", href: "/en/dashboard/subscribers" },
		{ id: "users", label: "Users", icon: User, color: "bg-green-700", href: "/en/dashboard/users" },
		{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-gray-500", href: "/en/dashboard/settings" },
	];

	// Protect dashboard: redirect if not authenticated or not admin
	if (status === "loading") {
		return (
			<div className="flex flex-col space-y-6 items-center justify-center min-h-screen w-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
				<div>Loading...</div>
			</div>
		);
	}
	if (!session) {
		router.replace("/en/login");
		return null;
	}
	// Redirect non-admin users to profile page
	if (session.user.role !== "admin") {
		router.replace("/en/profile");
		return null;
	}

	return (
		<div
			className="flex flex-col pl-4 md:flex-row overflow-hidden"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#admin-profile-menu"))) {
					setProfileOpen(false);
				}
			}}
		>
			{/* Sidebar */}
			<div className="hidden my-12 md:flex w-64 h-auto bg-brand/20 flex-col shadow-lg">
				<nav className="overflow-y-hidden no-scrollbar">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeMenu === item.id;
						return (
							<Link
								key={item.id}
								href={item.href}
								className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200
									${isActive ? "bg-brand text-white font-semibold shadow border-l-2 border-black" : "text-black hover:text-brand hover:bg-gray-100"}
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
			<main className="flex-1 mt-8 overflow-x-auto overflow-y-auto p-6 no-scrollbar">{children}</main>
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

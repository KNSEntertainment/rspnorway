"use client";
import Link from "next/link";
import { useActiveMenu } from "@/context/ActiveMenuContext";
import { BookImage, Settings, GalleryThumbnails, LayoutDashboard, Book, Newspaper, User, Download, Users, VideoIcon, Bell, FileText, Layers, Mail } from "lucide-react";

export default function DashboardGrid() {
	const { setActiveMenu } = useActiveMenu();
	const menuItems = [
		{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brand", href: "/en/dashboard" },
		{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-brand-700", href: "/en/dashboard/contactmessages" },
		{ id: "memberships", label: "Memberships", icon: Users, color: "bg-brand-600", href: "/en/dashboard/memberships" },
		{ id: "departments", label: "Departments", icon: Layers, color: "bg-brand-600", href: "/en/dashboard/departments" },
		{ id: "executive-members", label: "Executive Members", icon: Users, color: "bg-brand-600", href: "/en/dashboard/executive-members" },
		{ id: "events", label: "Events", icon: BookImage, color: "bg-brand-600", href: "/en/dashboard/events" },
		{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-brand-700", href: "/en/dashboard/blogs" },
		{ id: "notices", label: "Notices", icon: Bell, color: "bg-brand-600", href: "/en/dashboard/notices" },
		{ id: "circulars", label: "Circulars", icon: FileText, color: "bg-brand-600", href: "/en/dashboard/circulars" },
		{ id: "videos", label: "Videos", icon: VideoIcon, color: "bg-brand-600", href: "/en/dashboard/videos" },
		{ id: "gallery", label: "Gallery", icon: GalleryThumbnails, color: "bg-brand-600", href: "/en/dashboard/gallery" },
		{ id: "downloads", label: "Downloads", icon: Download, color: "bg-red-500", href: "/en/dashboard/downloads" },
		{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-brand-600", href: "/en/dashboard/subscribers" },
		{ id: "users", label: "Users", icon: User, color: "bg-success-700", href: "/en/dashboard/users" },
		{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-neutral-500", href: "/en/dashboard/settings" },
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{menuItems.map((item) => (
				<Link key={item.label} href={item.href} className="group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105" onClick={() => setActiveMenu(item.id)}>
					<div className={`${item.color} p-6 h-auto`}>
						<div className="flex items-center justify-between">
							<div className="text-neutral-200">
								<h2 className="text-xl font-semibold mb-2">{item.label}</h2>
								<p className="text-neutral-200/80">View {item.label.toLowerCase()}</p>
							</div>
							<item.icon className="w-8 h-8 text-neutral-200 opacity-80 group-hover:opacity-100 transition-opacity" />
						</div>
					</div>
					<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
				</Link>
			))}
		</div>
	);
}

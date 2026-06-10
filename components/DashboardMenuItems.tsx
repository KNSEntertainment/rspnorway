import { BookImage, Settings, GalleryThumbnails, LayoutDashboard, Book, Newspaper, User, Download, Video, FileText, Bell, Layers, Users, Mail, DollarSign, Image, Heart, HandHelping, Send, TrendingUp, Receipt, LucideIcon } from "lucide-react";

export interface MenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
	href: string;
	roles?: string[];
}

export const menuItems: MenuItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brand", href: "/en/dashboard", roles: ["admin", "treasurer"] },
	{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-orange-600", href: "/en/dashboard/blogs", roles: ["admin"] },
	{ id: "causes", label: "Causes", icon: Heart, color: "bg-blue-600", href: "/en/dashboard/causes", roles: ["admin"] },
	{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-blue-600", href: "/en/dashboard/contactmessages", roles: ["admin"] },
	{ id: "circulars", label: "Circulars", icon: FileText, color: "bg-teal-600", href: "/en/dashboard/circulars", roles: ["admin"] },
	{ id: "departments", label: "Departments", icon: Layers, color: "bg-indigo-600", href: "/en/dashboard/departments", roles: ["admin"] },
	{ id: "donations", label: "Donations", icon: DollarSign, color: "bg-green-600", href: "/en/dashboard/donations", roles: ["admin"] },
	{ id: "finances", label: "Financial Analytics", icon: TrendingUp, color: "bg-emerald-600", href: "/en/dashboard/finances", roles: ["admin", "treasurer"] },
	{ id: "financial-management", label: "Financial Management", icon: Receipt, color: "bg-blue-600", href: "/en/dashboard/financial-management", roles: ["admin", "treasurer"] },
	{ id: "downloads", label: "Downloads", icon: Download, color: "bg-rose-600", href: "/en/dashboard/downloads", roles: ["admin"] },
	{ id: "events", label: "Events", icon: BookImage, color: "bg-pink-600", href: "/en/dashboard/events", roles: ["admin"] },
	{ id: "executive-contributions", label: "Executive Contributions", icon: DollarSign, color: "bg-emerald-600", href: "/en/dashboard/executive-contributions", roles: ["admin", "treasurer"] },
	{ id: "executive-members", label: "Executive Members", icon: Users, color: "bg-cyan-600", href: "/en/dashboard/executive-members", roles: ["admin"] },
	{ id: "gallery", label: "Gallery", icon: GalleryThumbnails, color: "bg-emerald-600", href: "/en/dashboard/gallery", roles: ["admin"] },
	{ id: "hero", label: "Hero Section", icon: Image, color: "bg-gradient-to-r from-purple-600 to-pink-600", href: "/en/dashboard/hero", roles: ["admin"] },
	{ id: "memberships", label: "Memberships", icon: Users, color: "bg-purple-600", href: "/en/dashboard/memberships", roles: ["admin"] },
	{ id: "notices", label: "Notices", icon: Bell, color: "bg-amber-600", href: "/en/dashboard/notices", roles: ["admin"] },
	{ id: "send-messages", label: "Send Messages", icon: Send, color: "bg-blue-500", href: "/en/dashboard/send-message", roles: ["admin"] },
	{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-slate-600", href: "/en/dashboard/settings", roles: ["admin"] },
	{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-violet-600", href: "/en/dashboard/subscribers", roles: ["admin"] },
	{ id: "users", label: "Users", icon: User, color: "bg-success", href: "/en/dashboard/users", roles: ["admin"] },
	{ id: "videos", label: "Videos", icon: Video, color: "bg-red-600", href: "/en/dashboard/videos", roles: ["admin"] },
	{ id: "volunteers", label: "Volunteers", icon: HandHelping, color: "bg-orange-600", href: "/en/dashboard/volunteers", roles: ["admin"] },
];

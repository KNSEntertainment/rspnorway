import { BookImage, Settings, GalleryThumbnails, LayoutDashboard, Book, Newspaper, User, Download, Video, FileText, Bell, Layers, Users, Mail } from "lucide-react";

export const menuItems = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brand", href: "/en/dashboard" },
	{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-brand-700", href: "/en/dashboard/contactmessages" },
	{ id: "memberships", label: "Memberships", icon: Users, color: "bg-brand-600", href: "/en/dashboard/memberships" },
	{ id: "departments", label: "Departments", icon: Layers, color: "bg-brand-600", href: "/en/dashboard/departments" },
	{ id: "executive-members", label: "Executive Members", icon: Users, color: "bg-brand-600", href: "/en/dashboard/executive-members" },
	{ id: "events", label: "Events", icon: BookImage, color: "bg-brand-600", href: "/en/dashboard/events" },
	{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-brand-700", href: "/en/dashboard/blogs" },
	{ id: "notices", label: "Notices", icon: Bell, color: "bg-brand-600", href: "/en/dashboard/notices" },
	{ id: "circulars", label: "Circulars", icon: FileText, color: "bg-brand-600", href: "/en/dashboard/circulars" },
	{ id: "gallery", label: "Gallery", icon: GalleryThumbnails, color: "bg-brand-600", href: "/en/dashboard/gallery" },
	{ id: "videos", label: "Videos", icon: Video, color: "bg-brand-600", href: "/en/dashboard/videos" },
	{ id: "downloads", label: "Downloads", icon: Download, color: "bg-red-500", href: "/en/dashboard/downloads" },
	{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-brand-600", href: "/en/dashboard/subscribers" },
	{ id: "users", label: "Users", icon: User, color: "bg-success-700", href: "/en/dashboard/users" },
	{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-neutral-500", href: "/en/dashboard/settings" },
];

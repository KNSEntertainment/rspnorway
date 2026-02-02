import { BookImage, Settings, GalleryThumbnails, LayoutDashboard, Book, Newspaper, User, Download, Video, FileText, Bell } from "lucide-react";

export const menuItems = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brand", href: "/en/dashboard" },
	{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-red-900", href: "/en/dashboard/contactmessages" },
	{ id: "events", label: "Events", icon: BookImage, color: "bg-purple-500", href: "/en/dashboard/events" },
	{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-orange-700", href: "/en/dashboard/blogs" },
	{ id: "notices", label: "Notices", icon: Bell, color: "bg-blue-600", href: "/en/dashboard/notices" },
	{ id: "circulars", label: "Circulars", icon: FileText, color: "bg-indigo-600", href: "/en/dashboard/circulars" },
	{ id: "gallery", label: "Gallery", icon: GalleryThumbnails, color: "bg-orange-500", href: "/en/dashboard/gallery" },
	{ id: "videos", label: "Videos", icon: Video, color: "bg-purple-600", href: "/en/dashboard/videos" },
	{ id: "downloads", label: "Downloads", icon: Download, color: "bg-red-500", href: "/en/dashboard/downloads" },
	{ id: "users", label: "Users", icon: User, color: "bg-green-700", href: "/en/dashboard/users" },
	{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-gray-500", href: "/en/dashboard/settings" },
];

"use client";
import Link from "next/link";
import { useActiveMenu } from "@/context/ActiveMenuContext";
import { Calendar, MessageSquare, Mail, Image, Settings, LayoutDashboard, Book, Newspaper, User } from "lucide-react";

export default function DashboardGrid() {
	const { setActiveMenu } = useActiveMenu();

	const menuItems = [
		{ name: "Hero", icon: Calendar, href: "/dashboard/hero", id: "hero", color: "bg-blue-900" },
		{ name: "Students", icon: Calendar, href: "/dashboard/students", id: "students", color: "bg-blue-900" },
		{ name: "Teachers", icon: Calendar, href: "/dashboard/teachers", id: "teachers", color: "bg-blue-900" },
		{ name: "Parents", icon: Calendar, href: "/dashboard/parents", id: "parents", color: "bg-blue-900" },
		{ name: "Contact Messages", icon: Book, href: "/dashboard/contactmessages", id: "contactmessages", color: "bg-red-900" },
		{ name: "Appointments", icon: Book, href: "/dashboard/appointments", id: "appointments", color: "bg-[#0094da]" },
		{ name: "Events", icon: Calendar, href: "/dashboard/events", id: "events", color: "bg-purple-500" },
		{ name: "Blogs", icon: Newspaper, href: "/dashboard/blogs", id: "blogs", color: "bg-orange-700" },
		{ name: "Testimonials", icon: MessageSquare, href: "/dashboard/testimonials", id: "testimonials", color: "bg-yellow-800" },
		{ name: "Gallery", icon: Image, href: "/dashboard/gallery", id: "gallery", color: "bg-orange-500" },
		{ name: "Users", icon: User, href: "/dashboard/users", id: "users", color: "bg-[#0094da]" },
		{ name: "Notices", icon: MessageSquare, href: "/dashboard/notices", id: "notices", color: "bg-yellow-800" },
		{ name: "Subscribers", icon: Mail, href: "/dashboard/subscribers", id: "subscribers", color: "bg-[#0094da]" },
		{ name: "Profile Settings", icon: Settings, href: "/dashboard/settings", id: "settings", color: "bg-gray-500" },
	];

	return (
		<div className="max-w-[1400px] sm:p-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				<Link href="/dashboard" className="md:hidden group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105" onClick={() => setActiveMenu("dashboard")}>
					<div className="bg-[#0094da] p-6 h-full">
						<div className="flex items-center justify-between">
							<div className="text-slate-200">
								<h2 className="text-xl font-semibold mb-2">Dashboard</h2>
								<p className="text-slate-200/80">View dashboard</p>
							</div>
							<LayoutDashboard className="w-8 h-8 text-slate-200 opacity-80 group-hover:opacity-100 transition-opacity" />
						</div>
					</div>
					<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
				</Link>
				{menuItems.map((item) => (
					<Link key={item.name} href={item.href} className="group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105" onClick={() => setActiveMenu(item.id)}>
						<div className={`${item.color} p-6 h-full`}>
							<div className="flex items-center justify-between">
								<div className="text-slate-200">
									<h2 className="text-xl font-semibold mb-2">{item.name}</h2>
									<p className="text-slate-200/80">View {item.name.toLowerCase()}</p>
								</div>
								<item.icon className="w-8 h-8 text-slate-200 opacity-80 group-hover:opacity-100 transition-opacity" />
							</div>
						</div>
						<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
					</Link>
				))}
			</div>
		</div>
	);
}

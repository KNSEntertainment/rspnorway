import { 
	BookImage, 
	Settings, 
	GalleryThumbnails, 
	LayoutDashboard, 
	Book, 
	Newspaper, 
	User, 
	Download, 
	Video, 
	FileText, 
	Bell, 
	Layers, 
	Users, 
	Mail, 
	DollarSign, 
	Image, 
	Heart, 
	HandHelping, 
	Send, 
	TrendingUp, 
	Receipt, 
	ScanLine, 
	CreditCard,
	LucideIcon 
} from "lucide-react";

export type DashboardCategory = 
	| "Core" 
	| "Community & People" 
	| "Events & Programs" 
	| "Content & Media" 
	| "Finances & Operations" 
	| "Communications & Settings";

export interface MenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
	href: string;
	category: DashboardCategory;
	description: string;
	roles?: string[];
}

export const getDashboardMenuItems = (locale = "en"): MenuItem[] => [
	// Core
	{ 
		id: "dashboard", 
		label: "Dashboard", 
		icon: LayoutDashboard, 
		color: "text-brand bg-brand/10", 
		href: `/${locale}/dashboard`, 
		category: "Core",
		description: "Overview metrics, quick tools and system summary",
		roles: ["admin", "treasurer"] 
	},
	{ 
		id: "idcard", 
		label: "My ID Card", 
		icon: CreditCard, 
		color: "text-brand bg-brand/10", 
		href: `/${locale}/profile/idcard`, 
		category: "Core",
		description: "Official Executive digital card & QR pass",
		roles: ["admin", "treasurer"] 
	},

	// Community & People
	{ 
		id: "memberships", 
		label: "Memberships", 
		icon: Users, 
		color: "text-purple-600 bg-purple-50", 
		href: `/${locale}/dashboard/memberships`, 
		category: "Community & People",
		description: "Review member registrations, approvals and renewals",
		roles: ["admin"] 
	},
	{ 
		id: "users", 
		label: "Users", 
		icon: User, 
		color: "text-emerald-600 bg-emerald-50", 
		href: `/${locale}/dashboard/users`, 
		category: "Community & People",
		description: "Manage accounts, credentials and administrative roles",
		roles: ["admin"] 
	},
	{ 
		id: "executive-members", 
		label: "Executive Members", 
		icon: Users, 
		color: "text-sky-600 bg-sky-50", 
		href: `/${locale}/dashboard/executive-members`, 
		category: "Community & People",
		description: "Board members, designations and committee hierarchy",
		roles: ["admin"] 
	},
	{ 
		id: "volunteers", 
		label: "Volunteers", 
		icon: HandHelping, 
		color: "text-amber-600 bg-amber-50", 
		href: `/${locale}/dashboard/volunteers`, 
		category: "Community & People",
		description: "Volunteer registry, signups and assigned areas",
		roles: ["admin"] 
	},
	{ 
		id: "subscribers", 
		label: "Subscribers", 
		icon: Mail, 
		color: "text-indigo-600 bg-indigo-50", 
		href: `/${locale}/dashboard/subscribers`, 
		category: "Community & People",
		description: "Newsletter subscribers and email marketing list",
		roles: ["admin"] 
	},

	// Events & Programs
	{ 
		id: "events", 
		label: "Events", 
		icon: BookImage, 
		color: "text-rose-600 bg-rose-50", 
		href: `/${locale}/dashboard/events`, 
		category: "Events & Programs",
		description: "Create and manage community events and ticketing",
		roles: ["admin"] 
	},
	{ 
		id: "checkin", 
		label: "Event Check-in", 
		icon: ScanLine, 
		color: "text-teal-600 bg-teal-50", 
		href: `/${locale}/dashboard/checkin`, 
		category: "Events & Programs",
		description: "Scan QR codes and verify attendee check-ins live",
		roles: ["admin"] 
	},
	{ 
		id: "causes", 
		label: "Causes", 
		icon: Heart, 
		color: "text-red-600 bg-red-50", 
		href: `/${locale}/dashboard/causes`, 
		category: "Events & Programs",
		description: "Charity initiatives and fundraising campaigns",
		roles: ["admin"] 
	},

	// Content & Media
	{ 
		id: "blogs", 
		label: "Blogs", 
		icon: Newspaper, 
		color: "text-orange-600 bg-orange-50", 
		href: `/${locale}/dashboard/blogs`, 
		category: "Content & Media",
		description: "Publish news, opinion pieces and member stories",
		roles: ["admin"] 
	},
	{ 
		id: "notices", 
		label: "Notices", 
		icon: Bell, 
		color: "text-amber-600 bg-amber-50", 
		href: `/${locale}/dashboard/notices`, 
		category: "Content & Media",
		description: "Official community notices, circulars and alerts",
		roles: ["admin"] 
	},
	{ 
		id: "circulars", 
		label: "Circulars", 
		icon: FileText, 
		color: "text-cyan-600 bg-cyan-50", 
		href: `/${locale}/dashboard/circulars`, 
		category: "Content & Media",
		description: "Formal notices, directives and organizational memos",
		roles: ["admin"] 
	},
	{ 
		id: "gallery", 
		label: "Gallery", 
		icon: GalleryThumbnails, 
		color: "text-emerald-600 bg-emerald-50", 
		href: `/${locale}/dashboard/gallery`, 
		category: "Content & Media",
		description: "Photo albums and event memories archive",
		roles: ["admin"] 
	},
	{ 
		id: "videos", 
		label: "Videos", 
		icon: Video, 
		color: "text-red-600 bg-red-50", 
		href: `/${locale}/dashboard/videos`, 
		category: "Content & Media",
		description: "Curated community video streams and recordings",
		roles: ["admin"] 
	},
	{ 
		id: "downloads", 
		label: "Downloads", 
		icon: Download, 
		color: "text-blue-600 bg-blue-50", 
		href: `/${locale}/dashboard/downloads`, 
		category: "Content & Media",
		description: "Public forms, guidelines, bylaws and documents",
		roles: ["admin"] 
	},
	{ 
		id: "hero", 
		label: "Hero Section", 
		icon: Image, 
		color: "text-purple-600 bg-purple-50", 
		href: `/${locale}/dashboard/hero`, 
		category: "Content & Media",
		description: "Manage homepage carousel slides, banners and CTA buttons",
		roles: ["admin"] 
	},
	{ 
		id: "departments", 
		label: "Departments", 
		icon: Layers, 
		color: "text-indigo-600 bg-indigo-50", 
		href: `/${locale}/dashboard/departments`, 
		category: "Content & Media",
		description: "Department profiles, leadership and mandates",
		roles: ["admin"] 
	},

	// Finances & Operations
	{ 
		id: "finances", 
		label: "Financial Analytics", 
		icon: TrendingUp, 
		color: "text-emerald-600 bg-emerald-50", 
		href: `/${locale}/dashboard/finances`, 
		category: "Finances & Operations",
		description: "Revenue charts, fiscal reports and budget tracking",
		roles: ["admin", "treasurer"] 
	},
	{ 
		id: "financial-management", 
		label: "Financial Management", 
		icon: Receipt, 
		color: "text-blue-600 bg-blue-50", 
		href: `/${locale}/dashboard/financial-management`, 
		category: "Finances & Operations",
		description: "Expense entries, invoices and transaction registers",
		roles: ["admin", "treasurer"] 
	},
	{ 
		id: "donations", 
		label: "Donations", 
		icon: DollarSign, 
		color: "text-green-600 bg-green-50", 
		href: `/${locale}/dashboard/donations`, 
		category: "Finances & Operations",
		description: "Online contributions, Stripe receipts and donor data",
		roles: ["admin", "treasurer"] 
	},
	{ 
		id: "executive-contributions", 
		label: "Executive Contributions", 
		icon: DollarSign, 
		color: "text-teal-600 bg-teal-50", 
		href: `/${locale}/dashboard/executive-contributions`, 
		category: "Finances & Operations",
		description: "Executive member levies, monthly dues and tracking",
		roles: ["admin", "treasurer"] 
	},

	// Communications & Settings
	{ 
		id: "send-messages", 
		label: "Send Messages", 
		icon: Send, 
		color: "text-sky-600 bg-sky-50", 
		href: `/${locale}/dashboard/send-message`, 
		category: "Communications & Settings",
		description: "Broadcast announcements and bulk member emails",
		roles: ["admin", "executive", "treasurer"] 
	},
	{ 
		id: "contactmessages", 
		label: "Contact Messages", 
		icon: Book, 
		color: "text-blue-600 bg-blue-50", 
		href: `/${locale}/dashboard/contactmessages`, 
		category: "Communications & Settings",
		description: "Public contact inquiries, questions and replies",
		roles: ["admin"] 
	},
	{ 
		id: "settings", 
		label: "Profile Settings", 
		icon: Settings, 
		color: "text-slate-600 bg-slate-100", 
		href: `/${locale}/dashboard/settings`, 
		category: "Communications & Settings",
		description: "Security credentials, passwords and account options",
		roles: ["admin"] 
	},
];

// Static export for backward compatibility
export const menuItems: MenuItem[] = getDashboardMenuItems("en");
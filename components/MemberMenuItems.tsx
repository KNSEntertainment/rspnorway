import { User, Settings, Lock, Mail, Wallet, Calendar, LucideIcon } from "lucide-react";

export interface MemberMenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
}

export const memberMenuItems: MemberMenuItem[] = [
	{ id: "profile", label: "Profile", icon: User, href: "/profile" },
	{ id: "messages", label: "Messages", icon: Mail, href: "/profile/messages" },
	{ id: "idcard", label: "ID Card", icon: Mail, href: "/profile/idcard" },
	{ id: "my-donations", label: "My Donations", icon: Wallet, href: "/profile/my-donations" },
	{ id: "my-events", label: "My Events", icon: Calendar, href: "/profile/my-events" },
	{ id: "settings", label: "Settings", icon: Settings, href: "/profile/settings" },
	{ id: "privacy", label: "Privacy", icon: Lock, href: "/profile/privacy" },
];

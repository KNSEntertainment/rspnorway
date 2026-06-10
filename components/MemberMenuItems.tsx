import { User, Settings, Lock, Mail, Wallet, Calendar, TrendingUp, LucideIcon } from "lucide-react";

export interface MemberMenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
}

export const getMemberMenuItems = (locale: string, membershipType?: string): MemberMenuItem[] => {
	const items: MemberMenuItem[] = [
		{ id: "profile", label: "Profile", icon: User, href: `/${locale}/profile` },
		{ id: "messages", label: "Messages", icon: Mail, href: `/${locale}/profile/messages` },
		{ id: "idcard", label: "ID Card", icon: Mail, href: `/${locale}/profile/idcard` },
		{ id: "my-donations", label: "My Donations", icon: Wallet, href: `/${locale}/profile/my-donations` },
		{ id: "my-events", label: "My Events", icon: Calendar, href: `/${locale}/profile/my-events` },
		{ id: "settings", label: "Settings", icon: Settings, href: `/${locale}/profile/settings` },
		{ id: "privacy", label: "Privacy", icon: Lock, href: `/${locale}/profile/privacy` },
	];

	if (membershipType === "executive") {
		items.splice(2, 0, { id: "finances", label: "Finances", icon: TrendingUp, href: `/${locale}/profile/finances` });
	}

	return items;
};

// Legacy export for backward compatibility
export const memberMenuItems = getMemberMenuItems("en");

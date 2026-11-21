import { 
	User, 
	Settings, 
	Lock, 
	Mail, 
	Wallet, 
	Calendar, 
	TrendingUp, 
	DollarSign, 
	CreditCard,
	Send,
	LucideIcon 
} from "lucide-react";

export type MemberCategory = "Account" | "Engagement" | "Executive" | "Security";

export interface MemberMenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
	category: MemberCategory;
	description: string;
}

export const getMemberMenuItems = (locale: string, membershipType?: string): MemberMenuItem[] => {
	const items: MemberMenuItem[] = [
		{ 
			id: "profile", 
			label: "Profile", 
			icon: User, 
			href: `/${locale}/profile`,
			category: "Account",
			description: "Personal details, membership status & info"
		},
		{ 
			id: "idcard", 
			label: "Digital ID Card", 
			icon: CreditCard, 
			href: `/${locale}/profile/idcard`,
			category: "Account",
			description: "Official digital membership credential & QR"
		},
		{ 
			id: "messages", 
			label: "Messages", 
			icon: Mail, 
			href: `/${locale}/profile/messages`,
			category: "Engagement",
			description: "Direct notifications & community broadcasts"
		},
		{ 
			id: "my-events", 
			label: "My Events", 
			icon: Calendar, 
			href: `/${locale}/profile/my-events`,
			category: "Engagement",
			description: "Registered events, tickets & attendance passes"
		},
		{ 
			id: "my-donations", 
			label: "My Donations", 
			icon: Wallet, 
			href: `/${locale}/profile/my-donations`,
			category: "Engagement",
			description: "Contribution receipts and donation records"
		},
		{ 
			id: "settings", 
			label: "Settings", 
			icon: Settings, 
			href: `/${locale}/profile/settings`,
			category: "Security",
			description: "Update contact info & change password"
		},
		{ 
			id: "privacy", 
			label: "Privacy", 
			icon: Lock, 
			href: `/${locale}/profile/privacy`,
			category: "Security",
			description: "Privacy preferences & account data"
		},
	];

	if (membershipType === "executive") {
		// Insert executive items under Executive category
		items.splice(3, 0, 
			{ 
				id: "finances", 
				label: "Finances", 
				icon: TrendingUp, 
				href: `/${locale}/profile/finances`,
				category: "Executive",
				description: "Executive budget oversight & financial reports"
			},
			{ 
				id: "contributions", 
				label: "Contributions", 
				icon: DollarSign, 
				href: `/${locale}/profile/contributions`,
				category: "Executive",
				description: "Executive monthly dues and contribution register"
			},
			{ 
				id: "send-message", 
				label: "Send Message", 
				icon: Send, 
				href: `/${locale}/profile/send-message`,
				category: "Executive",
				description: "Message executive members individually or in bulk"
			}
		);
	}

	return items;
};

// Legacy export for backward compatibility
export const memberMenuItems = getMemberMenuItems("en");
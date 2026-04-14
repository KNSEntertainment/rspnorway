"use client";

import { useState } from "react";
import { usePathname, Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { useLocale } from "next-intl";

type NavItem = {
	href: string;
	title: string;
};

type MobileMenuProps = {
	navItems: NavItem[];
};

export default function MobileMenu({ navItems }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const locale = useLocale();

	return (
		<>
			{/* Toggle Button */}
			<button onClick={() => setIsOpen((v) => !v)} className="lg:hidden btn-glass">
				{isOpen ? <X size={18} /> : <Menu size={18} />}
			</button>

			{/* Menu */}
			{isOpen && (
				<div className="absolute top-full left-0 w-full bg-white shadow-lg z-50">
					<div className="flex flex-col p-4 gap-2">
						{navItems.map((item) => {
							const isActive = pathname === item.href || pathname.endsWith(item.href);

							return (
								<Link key={item.href} href={item.href} locale={locale} className={`px-3 py-2 rounded-md ${isActive ? "bg-brand text-white" : "text-gray-800 hover:bg-gray-100"}`} onClick={() => setIsOpen(false)}>
									{item.title}
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
}

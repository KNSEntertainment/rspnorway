import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import SocialMediaLinks from "./SocialMediaLinks";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface MobileMenuProps {
	navItems: {
		title: string;
		href: string;
		dropdownItems?: { title: string; href: string }[];
	}[];
	isScrolled: boolean;
	pathname: string;
	closeMenu: () => void;
}

const MobileMenu = ({ navItems, closeMenu, pathname }: MobileMenuProps) => {
	const t = useTranslations("navigation");
	const tr = useTranslations("footer");
	const locale = useLocale();
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const toggleDropdown = (href: string) => {
		setOpenDropdown(openDropdown === href ? null : href);
	};

	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={() => closeMenu()} style={{ top: 0, left: 0, right: 0, bottom: 0 }} />
			<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: "easeOut" }} className="fixed top-0 bottom-0 right-0 w-[75%] max-w-md bg-gradient-to-br from-brand via-brand to-emerald-600 z-[110] overflow-y-auto" style={{ height: "100vh" }}>
				<div className="pt-12 px-8 h-full min-h-full flex flex-col">
					<nav className="flex flex-col gap-2" role="navigation">
						{navItems.map((item, idx) => {
							const hasDropdown = !!item.dropdownItems?.length;
							const isOpen = openDropdown === item.href;
							const isActive = pathname === item.href;
							const isChildActive = hasDropdown && item.dropdownItems?.some((child) => pathname === child.href);

							return (
								<motion.div key={item.href} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1, duration: 0.3 }}>
									{hasDropdown ? (
										<div>
											<button onClick={() => toggleDropdown(item.href)} className={`w-full flex items-center justify-between px-6 py-3 text-xl font-semibold rounded-2xl transition-all duration-200 ${isActive || isChildActive ? "text-white bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"}`}>
												<span>{item.title}</span>
												<ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
											</button>

											<AnimatePresence>
												{isOpen && (
													<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
														<div className="ml-4 mt-1 space-y-1">
															{item.dropdownItems!.map((child) => {
																const isChildItemActive = pathname === child.href;
																return (
																	<Link key={child.href} href={`/${locale}${child.href}`} onClick={() => closeMenu()} className={`block px-6 py-2 text-lg font-medium rounded-xl transition-all duration-200 ${isChildItemActive ? "text-white bg-white/20" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
																		{child.title}
																	</Link>
																);
															})}
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									) : (
										<Link href={`/${locale}${item.href}`} onClick={() => closeMenu()} className={`block px-6 py-3 text-xl font-semibold rounded-2xl transition-all duration-200 ${isActive ? "text-white bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"}`}>
											{item.title}
										</Link>
									)}
								</motion.div>
							);
						})}
					</nav>

					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }} className="mt-6 pt-4 border-t border-white/20">
						<p className="text-white/90 text-lg font-medium mb-4 px-6">{t("contact")}</p>

						<a href="tel:+4796800984" className="block px-6 py-2 text-white hover:bg-white/10 rounded-xl transition-all duration-200">
							📞 {tr("phone_small_device")}
						</a>

						<a href="mailto:info@rspnorway.org" className="block px-6 py-2 text-white hover:bg-white/10 rounded-xl transition-all duration-200 mt-2">
							✉️ info@rspnorway.org
						</a>
					</motion.div>

					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.3 }} className="mt-6 pt-4 border-t border-white/20">
						<div className="px-6">
							<p className="text-white/90 text-lg font-medium mb-4">{t("follow_us")}</p>
							<SocialMediaLinks />
						</div>
					</motion.div>

					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.3 }} className="mt-6 px-6 space-y-2">
						<Link href={`/${locale}/donate`} onClick={() => closeMenu()} className="flex items-center justify-center gap-2 w-full px-4 py-2 md:py-3 text-center text-lg font-bold text-white bg-success rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
							{t("donate") || "Donate Now"}
						</Link>
						<Link href={`/${locale}/membership`} onClick={() => closeMenu()} className="block w-full px-4 py-2 md:py-3 text-center text-lg font-bold text-brand bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
							{t("become_a_member") || "Become Member"}
						</Link>
					</motion.div>
				</div>
			</motion.div>

			<button onClick={() => closeMenu()} className="fixed top-4 right-4 z-[120] hover:bg-white/10 backdrop-blur-md rounded-full p-1 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
				<X size={24} className="text-gray-100 shadow-sm" />
			</button>
		</>
	);
};

export default MobileMenu;

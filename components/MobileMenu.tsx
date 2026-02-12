import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import SocialMediaLinks from "./SocialMediaLinks";
import { X } from "lucide-react";

interface MobileMenuProps {
	navItems: { title: string; href: string }[];
	isScrolled: boolean;
	pathname: string;
	closeMenu: () => void;
}

const MobileMenu = ({ navItems, closeMenu }: MobileMenuProps) => {
	const t = useTranslations("navigation");
	const tr = useTranslations("footer");
	const locale = useLocale();
	return (
		<>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onClick={() => closeMenu()} style={{ top: 0, left: 0, right: 0, bottom: 0 }} />
			<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: "easeOut" }} className="fixed top-0 bottom-0 right-0 w-[75%] max-w-md bg-gradient-to-br from-brand via-brand to-emerald-600 z-[110] overflow-y-auto" style={{ height: "100vh" }}>
				<div className="pt-8 px-8 h-full min-h-full flex flex-col">
					<nav className="flex flex-col gap-2" role="navigation">
						{navItems.map((item, idx) => (
							<motion.div key={item.href} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1, duration: 0.3 }}>
								<Link href={`/${locale}${item.href}`} onClick={() => closeMenu()} className="block px-6 py-1 text-xl font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200">
									{item.title}
								</Link>
							</motion.div>
						))}
					</nav>

					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }} className="mt-6 pt-4 border-t border-white/20">
						<p className="text-white/90 text-lg font-medium mb-4 px-6">{t("contact")}</p>
						<a href="tel:+4796800984" className="block px-6 text-white hover:bg-white/10 rounded-xl transition-all duration-200">
							📞 {tr("phone_small_device")}
						</a>
						<a href="mailto:info@rspnorway.org" className="block px-6 text-white hover:bg-white/10 rounded-xl transition-all duration-200 mt-2">
							✉️ info@rspnorway.org
						</a>
					</motion.div>
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.3 }} className="mt-6 pt-4 border-t border-white/20">
						<div className="px-6">
							<p className="text-white/90 text-lg font-medium mb-4">{t("follow_us")}</p>

							<SocialMediaLinks />
						</div>
					</motion.div>
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.3 }} className="mt-8 px-6 space-y-3">
						<Link href={`/${locale}/donate`} onClick={() => closeMenu()} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center text-lg font-bold text-white bg-success rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
							{t("donate") || "Donate Now"}
						</Link>
						<Link href={`/${locale}/membership`} onClick={() => closeMenu()} className="block w-full px-4 py-3 text-center text-lg font-bold text-brand bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
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

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X, Phone, Mail, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import SearchModal from "@/components/SearchModal";
import { useTranslations, useLocale } from "next-intl";
import SocialMediaLinks from "./SocialMediaLinks";
import LanguageSelector from "./LanguageSelector";
import MobileMenu from "./MobileMenu";
import LoggedInUser from "./LoggedInUser";

export default function Header() {
	const pathname = usePathname();
	const locale = useLocale();
	const t = useTranslations("navigation");
	const tr = useTranslations("footer");

	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	const { data: session } = useSession();
	const user = session?.user;

	/* Stable nav items */
	const navItems = useMemo(
		() => [
			{
				title: t("home"),
				href: "/",
				dropdown: [
					{ title: t("about"), href: "/about-us" },
					{ title: t("members"), href: "/members" },
				],
			},
			{
				title: t("updates"),
				href: "/updates",
				dropdown: [
					{ title: t("events"), href: "/events" },
					{ title: t("notices"), href: "/notices" },
					{ title: t("circulars"), href: "/circulars" },
				],
			},
			{ title: t("gallery"), href: "/gallery" },
			{ title: t("contact"), href: "/contact" },
		],
		[t],
	);

	/* Scroll behavior */
	useEffect(() => {
		let ticking = false;

		const onScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					const currentScrollY = window.scrollY;

					setIsScrolled(currentScrollY > 10);

					if (currentScrollY < 150) {
						setIsVisible(true);
					} else if (currentScrollY > lastScrollY) {
						setIsVisible(false);
					} else {
						setIsVisible(true);
					}

					setLastScrollY(currentScrollY);
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [lastScrollY]);

	return (
		<div className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
			{/* Top Bar */}
			<section className="h-11 border-b bg-light/95 backdrop-blur-md">
				<div className="container mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
					<div className="flex items-center gap-6 text-sm font-medium">
						<a href="tel:+4796800984" className="flex items-center gap-2 hover:opacity-75">
							<Phone size={16} />
							{tr("phone_small_device")}
						</a>

						<a href="mailto:info@rspnorway.org" className="hidden md:flex items-center gap-2 hover:opacity-75">
							<Mail size={16} />
							info@rspnorway.org
						</a>

						<SocialMediaLinks />
					</div>

					<LanguageSelector />
				</div>
			</section>

			{/* Main Header */}
			<header className="bg-gradient-to-r from-brand via-brand to-emerald-600">
				<div className="container mx-auto px-4 lg:px-6 h-16 md:h-24 flex items-center justify-between">
					{/* Logo */}
					<Link href="/" locale={locale} className="flex items-center gap-3">
						<Image src="/rsp-norway-logo.png" alt="Logo" width={40} height={40} className="h-10 md:h-12 w-auto" priority />
						<div className="hidden md:flex flex-col text-white leading-5">
							<span className="font-bold">{t("pnsb")}</span>
							<span>{t("norway")}</span>
						</div>
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
						{navItems.map((item) => {
							const isActive = pathname === item.href || pathname.endsWith(item.href);
							const hasDropdown = !!item.dropdown;
							const isOpen = activeDropdown === item.href;

							return (
								<div key={item.href} className="relative" onMouseEnter={() => hasDropdown && setActiveDropdown(item.href)} onMouseLeave={() => hasDropdown && setActiveDropdown(null)}>
									{/* Main Button */}
									{hasDropdown ? (
										<button
											className={`
							px-3 py-2 rounded-lg font-semibold flex items-center gap-1
							${isActive ? "bg-white text-brand" : "text-white/90 hover:bg-white hover:text-brand"}
						`}
										>
											{item.title}
											<ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
										</button>
									) : (
										<Link
											href={item.href}
											locale={locale}
											className={`
							px-3 py-2 rounded-lg font-semibold
							${isActive ? "bg-white text-brand" : "text-white/90 hover:bg-white hover:text-brand"}
						`}
										>
											{item.title}
										</Link>
									)}

									{/* Dropdown */}
									<AnimatePresence>
										{hasDropdown && isOpen && (
											<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
												{item.dropdown.map((sub) => {
													const isSubActive = pathname === sub.href;

													return (
														<Link
															key={sub.href}
															href={sub.href}
															locale={locale}
															className={`
											block px-4 py-2 text-sm font-medium
											${isSubActive ? "bg-brand text-white" : "text-gray-800 hover:bg-brand/10 hover:text-brand"}
										`}
															onClick={() => setActiveDropdown(null)}
														>
															{sub.title}
														</Link>
													);
												})}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							);
						})}
					</nav>

					{/* Right Side */}
					<div className="flex items-center gap-2">
						{/* Search */}
						<button onClick={() => setIsModalOpen(true)} className="btn-glass">
							<Search size={24} />
						</button>

						{/* Donate */}
						<Link href="/donate" locale={locale} className="hidden sm:flex btn-success">
							<span className="hidden md:inline">{t("donate")}</span>
						</Link>

						{/* User */}
						{user ? (
							<LoggedInUser user={user} />
						) : (
							<Link href="/login" locale={locale} className="hidden sm:flex btn-white">
								{t("login")}
							</Link>
						)}

						{/* Mobile Menu */}
						<button onClick={() => setIsMenuOpen((v) => !v)} className="lg:hidden btn-glass">
							{isMenuOpen ? <X size={18} /> : <Menu size={18} />}
						</button>
					</div>
				</div>
			</header>

			{/* Mobile Menu */}
			<AnimatePresence>{isMenuOpen && <MobileMenu navItems={navItems} pathname={pathname} closeMenu={() => setIsMenuOpen(false)} user={user} isScrolled={isScrolled} />}</AnimatePresence>

			{/* Search Modal */}
			{isModalOpen && <SearchModal placeholder={t("search_placeholder")} closeModal={() => setIsModalOpen(false)} />}
		</div>
	);
}

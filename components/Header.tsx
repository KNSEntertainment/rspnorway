"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X, Phone, Mail, CoinsIcon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import SearchModal from "@/components/SearchModal";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import SocialMediaLinks from "./SocialMediaLinks";
import LanguageSelector from "./LanguageSelector";
import MobileMenu from "./MobileMenu";
import LoggedInUser from "./LoggedInUser";

/* ---------------------------------- */
/* Constants */
/* ---------------------------------- */

/* ---------------------------------- */
/* Nav Item */
/* ---------------------------------- */

// interface NavItemProps {
// 	title: string;
// 	href: string;
// 	isScrolled: boolean;
// 	pathname: string;
// 	dropdownItems?: { title: string; href: string }[];
// 	activeDropdown: string | null;
// 	setActiveDropdown: (dropdown: string | null) => void;
// }

// function NavItem({ title, href, pathname, dropdownItems, activeDropdown, setActiveDropdown }: NavItemProps) {
// 	const isActive = pathname === href;
// 	const hasDropdown = !!dropdownItems?.length;
// 	// Check if any child item in dropdown is active
// 	const isChildActive = hasDropdown && dropdownItems?.some((item) => pathname === item.href);
// 	const isOpen = activeDropdown === href;
// 	const dropdownRef = useRef<HTMLDivElement>(null);

// 	useEffect(() => {
// 		const handleClickOutside = (event: MouseEvent) => {
// 			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// 				setActiveDropdown(null);
// 			}
// 		};

// 		if (isOpen) {
// 			document.addEventListener("mousedown", handleClickOutside);
// 		}

// 		return () => {
// 			document.removeEventListener("mousedown", handleClickOutside);
// 		};
// 	}, [isOpen, setActiveDropdown]);

// 	const handleMouseEnter = () => {
// 		if (!hasDropdown) return;
// 		setActiveDropdown(href);
// 	};

// 	const handleMouseLeave = () => {
// 		if (!hasDropdown) return;
// 		setActiveDropdown(null);
// 	};

// 	return (
// 		<div ref={dropdownRef} className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
// 			{hasDropdown ? (
// 				<button
// 					aria-haspopup="menu"
// 					aria-expanded={isOpen}
// 					onClick={(e) => {
// 						e.stopPropagation();
// 						setActiveDropdown(isOpen ? null : href);
// 					}}
// 					className={`
//             relative px-4 py-2 flex items-center gap-2 rounded-lg
//             transition-all duration-300 text-lg font-semibold tracking-wide
//             ${isActive || isChildActive ? "bg-white text-brand" : "text-white/90 hover:bg-white hover:text-brand"}
//             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
//           `}
// 				>
// 					{title}
// 					<ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
// 				</button>
// 			) : (
// 				<Link
// 					href={href}
// 					onClick={() => setActiveDropdown(null)}
// 					className={`
//             relative px-4 py-2 block text-lg font-semibold tracking-wide rounded-lg
//             transition-all duration-300
//             ${isActive ? "bg-white text-brand" : "text-white/90 hover:bg-white hover:text-brand"}
//             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
//           `}
// 				>
// 					{title}
// 				</Link>
// 			)}

// 			<AnimatePresence>
// 				{hasDropdown && isOpen && (
// 					<motion.div
// 						initial={{ opacity: 0, y: -10 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						exit={{ opacity: 0, y: -10 }}
// 						transition={{ duration: 0.2 }}
// 						role="menu"
// 						className="
//               absolute -translate-x-1/2 top-full mt-2 w-48 rounded-md
//               bg-white/95 backdrop-blur-xl
//               shadow-[0_20px_60px_rgba(0,0,0,0.12)]
//               ring-1 ring-black/5 overflow-hidden z-50
//               before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-brand before:to-emerald-500
//               py-2
//             "
// 					>
// 						{dropdownItems!.map((item, idx) => {
// 							const isDropdownItemActive = pathname === item.href;
// 							return (
// 								<Link
// 									key={item.href}
// 									href={item.href}
// 									role="menuitem"
// 									onClick={() => setActiveDropdown(null)}
// 									className={`
//                   block px-4 py-2 text-lg font-medium
//                   ${isDropdownItemActive ? "bg-brand text-white" : "text-gray-900 hover:bg-brand/5 hover:text-brand"}
//                   transition-all duration-200
//                   ${idx !== 0 ? "border-t border-neutral-100" : ""}
//                 `}
// 								>
// 									{item.title}
// 								</Link>
// 							);
// 						})}
// 					</motion.div>
// 				)}
// 			</AnimatePresence>
// 		</div>
// 	);
// }

/* ---------------------------------- */
/* Header */
/* ---------------------------------- */

export default function Header() {
	const pathname = usePathname();
	const t = useTranslations("navigation");
	const tr = useTranslations("footer");

	const navItems = [
		{
			title: t("home"),
			href: "/",
			dropdownItems: [
				{ title: t("about"), href: "/about-us" },
				{ title: t("members"), href: "/members" },
			],
		},

		{
			title: t("updates"),
			href: "/updates",
		},
		{
			title: t("gallery"),
			href: "/gallery",
			dropdownItems: [
				{ title: t("photos"), href: "/photo-gallery" },
				{ title: t("videos"), href: "/video-gallery" },
			],
		},
		{ title: t("downloads"), href: "/downloads" },
		{ title: t("contact"), href: "/contact" },
	];

	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	// const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { data: session } = useSession();
	const user = session?.user;

	// Wrapper function to manage hover delays
	// const handleDropdownChange = (newDropdown: string | null) => {
	// 	if (hoverTimeoutRef.current) {
	// 		clearTimeout(hoverTimeoutRef.current);
	// 	}

	// 	if (newDropdown === null) {
	// 		// Delay closing
	// 		hoverTimeoutRef.current = setTimeout(() => {
	// 			setActiveDropdown(null);
	// 		}, 200);
	// 	} else if (activeDropdown === null) {
	// 		// Delay opening from closed state
	// 		hoverTimeoutRef.current = setTimeout(() => {
	// 			setActiveDropdown(newDropdown);
	// 		}, 150);
	// 	} else {
	// 		// Instant switch between dropdowns
	// 		setActiveDropdown(newDropdown);
	// 	}
	// };

	/* ---------------------------------- */
	/* Effects */
	/* ---------------------------------- */

	useEffect(() => {
		const onScroll = () => {
			const currentScrollY = window.scrollY;
			const scrollThreshold = 150; // Only hide after scrolling 150px down

			// Set isScrolled state
			setIsScrolled(currentScrollY > 10);

			// Determine scroll direction and visibility
			if (currentScrollY < scrollThreshold) {
				// Near top of page, always show
				setIsVisible(true);
			} else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
				// Scrolling down past threshold, hide navbar
				setIsVisible(false);
			} else if (currentScrollY < lastScrollY) {
				// Scrolling up, show navbar
				setIsVisible(true);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, [lastScrollY]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = () => {
			setActiveDropdown(null);
		};

		if (activeDropdown) {
			document.addEventListener("click", handleClickOutside);
		}

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [activeDropdown]);

	/* ---------------------------------- */
	/* Render */
	/* ---------------------------------- */

	return (
		<div className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
			{/* Utility Bar */}
			{/* <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-11 border-b bg-light/95 backdrop-blur-md"> */}
			<section className="h-11 border-b bg-light/95 backdrop-blur-md">
				<div className="container mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
					<div className="flex items-center gap-6 text-sm font-medium">
						<a href="tel:+4796800984" className="hover:opacity-75 transition-opacity duration-200 flex items-center gap-2" aria-label="Call us">
							{/* <span className="sm:inline">📞</span> */}
							<Phone size={16} />
							{tr("phone_small_device")}
						</a>
						<a href="mailto:info@rspnorway.org" className="hidden md:flex items-center gap-2 hover:opacity-75 transition-opacity duration-200" aria-label="Email us">
							{/* <span>✉️</span> */}
							<Mail size={16} />
							info@rspnorway.org
						</a>
						<SocialMediaLinks />
					</div>
					<div className="flex items-center gap-4">
						<LanguageSelector />
					</div>
				</div>
			</section>

			{/* Main Header */}
			{/* <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="bg-gradient-to-r from-brand via-brand to-emerald-600"> */}
			<header className="bg-gradient-to-r from-brand via-brand to-emerald-600">
				<div className="container mx-auto px-4 lg:px-6 h-16 md:h-24 flex items-center justify-between border-b border-brand">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 rounded-lg">
						<div className="relative">
							<Image src="/rsp-norway-logo.png" alt="PNSB-Norway" width={48} height={48} className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105" fetchPriority="high" priority />
						</div>
						<div className="flex flex-col leading-3">
							<span className="hidden md:block text-xl font-bold text-white">{t("pnsb")}</span>
							<span className="hidden md:block text-md text-white">{t("norway")}</span>
						</div>
					</Link>

					{/* Desktop Nav - Centered */}
					{/* <nav className="hidden lg:flex items-center gap-2 justify-center" role="navigation">
						{navItems.map((item) => (
							<NavItem key={item.href} {...item} isScrolled={isScrolled} pathname={pathname} activeDropdown={activeDropdown} setActiveDropdown={handleDropdownChange} />
						))}
					</nav> */}

					<div className="flex items-center gap-3 justify-end">
						{/* Search */}
						<button onClick={() => setIsModalOpen(true)} aria-label="Open search" className="h-8 md:h-11 w-8 md:w-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
							<Search size={19} />
						</button>

						{/* Donate Button */}
						<Link href="/donate" className="hidden md:flex items-center gap-2 px-4 md:px-6 py-1 md:py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 bg-success text-white shadow-md hover:shadow-lg">
							<CoinsIcon className="w-5 h-5" /> {t("donate")}
						</Link>

						{user ? (
							<LoggedInUser user={user} />
						) : (
							<Link href="/login" className="px-4 md:px-6 py-1 md:py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 bg-white text-brand shadow-md hover:shadow-lg">
								{t("login")}
							</Link>
						)}

						<button className="h-8 md:h-11 w-8 md:w-11 rounded-xl flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm" onClick={() => setIsMenuOpen((v) => !v)} aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen}>
							<AnimatePresence mode="wait">
								{isMenuOpen ? (
									<motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
										<X size={22} />
									</motion.div>
								) : (
									<motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
										<Menu size={22} />
									</motion.div>
								)}
							</AnimatePresence>
						</button>
					</div>
				</div>
				{/* </motion.header> */}
			</header>

			{/* Mobile Menu */}
			<AnimatePresence>{isMenuOpen && <MobileMenu navItems={navItems} isScrolled={isScrolled} pathname={pathname} closeMenu={() => setIsMenuOpen(false)} />}</AnimatePresence>

			{/* Search */}
			{isModalOpen && <SearchModal placeholder={t("search_placeholder")} closeModal={() => setIsModalOpen(false)} />}
		</div>
	);
}

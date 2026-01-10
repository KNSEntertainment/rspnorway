"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X, ChevronDown, LogOut, Phone, Mail, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import SearchModal from "@/components/SearchModal";
import { useTranslations, useLocale } from "next-intl";
import Flag from "@/components/ui/Flag";
import { usePathname, useRouter } from "@/i18n/navigation";
import SocialMediaLinks from "./SocialMediaLinks";

/* ---------------------------------- */
/* Constants */
/* ---------------------------------- */

const LANGUAGES: { code: string; flag: "np" | "no" | "gb"; label: string }[] = [
	{ code: "ne", flag: "np", label: "नेपाली" },
	{ code: "no", flag: "no", label: "Norsk" },
	{ code: "en", flag: "gb", label: "English" },
];

/* ---------------------------------- */
/* Nav Item */
/* ---------------------------------- */

interface NavItemProps {
	title: string;
	href: string;
	isScrolled: boolean;
	pathname: string;
	dropdownItems?: { title: string; href: string }[];
	activeDropdown: string | null;
	setActiveDropdown: (dropdown: string | null) => void;
}

function NavItem({ title, href, isScrolled, pathname, dropdownItems, activeDropdown, setActiveDropdown }: NavItemProps) {
	const isActive = pathname === href;
	const hasDropdown = !!dropdownItems?.length;
	const isOpen = activeDropdown === href;

	return (
		<div className="relative group">
			{hasDropdown ? (
				<button
					aria-haspopup="menu"
					aria-expanded={isOpen}
					onClick={(e) => {
						e.stopPropagation();
						setActiveDropdown(isOpen ? null : href);
					}}
					className={`
            relative px-4 py-2 flex items-center gap-2
            transition-all duration-300 font-medium tracking-wide
            ${isScrolled ? "text-neutral-700 hover:text-brand" : "text-white/90 hover:text-white"}
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
            ${isActive ? "text-brand" : ""}
          `}
				>
					<span className="relative">
						{title}
						<span className={`absolute -bottom-1 left-0 h-0.5 bg-current transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
					</span>
					<ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
				</button>
			) : (
				<Link
					href={href}
					onClick={() => setActiveDropdown(null)}
					className={`
            relative px-4 py-2 block font-medium tracking-wide
            transition-all duration-300
            ${isScrolled ? "text-neutral-700 hover:text-brand" : "text-white/90 hover:text-white"}
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
            ${isActive ? "text-brand" : ""}
          `}
				>
					<span className="relative">
						{title}
						<span className={`absolute -bottom-1 left-0 h-0.5 bg-current transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
					</span>
				</Link>
			)}

			<AnimatePresence>
				{hasDropdown && isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						role="menu"
						className="
              absolute left-1/2 -translate-x-1/2 mt-4 w-56 rounded-2xl
              bg-white/95 backdrop-blur-xl
              shadow-[0_20px_60px_rgba(0,0,0,0.12)]
              ring-1 ring-black/5 overflow-hidden z-50
              before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-brand before:to-emerald-500
            "
					>
						{dropdownItems!.map((item, idx) => (
							<Link
								key={item.href}
								href={item.href}
								role="menuitem"
								onClick={() => setActiveDropdown(null)}
								className={`
                  block px-5 py-3.5 text-sm font-medium text-neutral-700 
                  hover:bg-brand/5 hover:text-brand transition-all duration-200
                  ${idx !== 0 ? "border-t border-neutral-100" : ""}
                `}
							>
								{item.title}
							</Link>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

/* ---------------------------------- */
/* Header */
/* ---------------------------------- */

export default function Header() {
	const router = useRouter();
	const pathname = usePathname();
	const locale = useLocale();
	const t = useTranslations("navigation");
	const tr = useTranslations("footer");

	const { data: session } = useSession();
	const user = session?.user;
	const avatarInitial = typeof user?.email === "string" && user.email ? user.email.charAt(0).toUpperCase() : "U";

	const navItems = [
		{ title: t("about"), href: "/about-us" },
		{ title: t("notices"), href: "/notices" },
		{ title: t("gallery"), href: "/gallery" },
		{ title: t("downloads"), href: "/downloads" },
		{ title: t("contact"), href: "/contact" },
	];

	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [showLangDropdown, setShowLangDropdown] = useState(false);
	const [showUserDropdown, setShowUserDropdown] = useState(false);

	const langRef = useRef<HTMLDivElement>(null);
	const userRef = useRef<HTMLDivElement>(null);

	/* ---------------------------------- */
	/* Effects */
	/* ---------------------------------- */

	useEffect(() => {
		const onScroll = () => setIsScrolled(window.scrollY > 10);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		const close = (e: MouseEvent) => {
			if (!langRef.current?.contains(e.target as Node) && !userRef.current?.contains(e.target as Node)) {
				setShowLangDropdown(false);
				setShowUserDropdown(false);
				setActiveDropdown(null);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);

	const handleLocaleChange = (code: string) => {
		if (code === locale) return;
		localStorage.setItem("locale", code);
		setShowLangDropdown(false);
		router.replace(pathname, { locale: code });
	};

	/* ---------------------------------- */
	/* Render */
	/* ---------------------------------- */

	return (
		<div className="fixed inset-x-0 top-0 z-50">
			{/* Utility Bar */}
			<motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`h-11 border-b transition-colors duration-500 ${isScrolled ? "bg-gradient-to-r from-brand via-brand to-emerald-600" : "bg-neutral-50/95 backdrop-blur-md"}`}>
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
					</div>
					<div className="flex items-center gap-4">
						<SocialMediaLinks />
						<div ref={langRef} className="relative">
							<button
								onClick={() => setShowLangDropdown((v) => !v)}
								aria-label="Select language"
								aria-expanded={showLangDropdown}
								className={`
                  flex items-center gap-2 rounded-lg border px-3 py-1.5 
                  font-medium text-sm transition-all duration-200
                  hover:scale-105 active:scale-95
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
				  bg-white ${isScrolled ? "shadow-sm" : ""}
                `}
							>
								<Flag country={LANGUAGES.find((l) => l.code === locale)?.flag as "no" | "np" | "gb"} size={20} />
								<ChevronDown size={14} className={`transition-transform duration-300 ${showLangDropdown ? "rotate-180" : ""}`} />
							</button>
							<AnimatePresence>
								{showLangDropdown && (
									<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden">
										{LANGUAGES.map((l, idx) => (
											<button
												key={l.code}
												onClick={() => handleLocaleChange(l.code)}
												className={`
                          flex w-full items-center gap-3 px-4 py-3 
                          hover:bg-brand/5 transition-all duration-200
                          font-medium text-sm text-neutral-700 hover:text-brand
                          ${idx !== 0 ? "border-t border-neutral-100" : ""}
                          ${l.code === locale ? "bg-brand/5 text-brand" : ""}
                        `}
											>
												<Flag country={l.flag} size={20} />
												{l.label}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</motion.section>

			{/* Main Header */}
			<motion.header
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className={`
		  transition-colors duration-500
		  ${isScrolled ? "bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]" : "bg-gradient-to-r from-brand via-brand to-emerald-600"}
        `}
			>
				<div className="container mx-auto px-4 lg:px-6 h-16 md:h-24 flex items-center justify-between border-b border-brand">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 rounded-lg">
						<div className="relative">
							<Image src="/rsp-norway-logo.png" alt="RSP Norway" width={180} height={72} className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105" />
						</div>
						<div className="flex flex-col leading-3">
							<span className={`hidden md:block text-xl font-bold ${isScrolled ? "text-brand" : "text-white"}`}>{t("rsp")}</span>
							<span className={`hidden md:block text-md ${isScrolled ? "text-brand" : "text-white"}`}>{t("norway")}</span>
						</div>
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden lg:flex items-center gap-2" role="navigation">
						{navItems.map((item) => (
							<NavItem key={item.href} {...item} isScrolled={isScrolled} pathname={pathname} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
						))}
					</nav>

					{/* Actions */}
					<div className="flex items-center gap-3">
						<button
							onClick={() => setIsModalOpen(true)}
							aria-label="Open search"
							className={`
                h-8 md:h-11 w-8 md:w-11 rounded-xl flex items-center justify-center
                transition-all duration-300 hover:scale-105 active:scale-95
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
                ${isScrolled ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700" : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"}
              `}
						>
							<Search size={19} />
						</button>

						{user ? (
							<div ref={userRef} className="relative">
								<button onClick={() => setShowUserDropdown((v) => !v)} aria-label="User menu" aria-expanded={showUserDropdown} className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-emerald-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2">
									{avatarInitial}
								</button>
								<AnimatePresence>
									{showUserDropdown && (
										<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden">
											<div className="px-5 py-4 border-b border-neutral-100">
												<p className="font-semibold text-neutral-900 truncate">{user.email}</p>
												<p className="text-xs text-neutral-500 mt-1">Signed in</p>
											</div>
											<Link href="/dashboard" className="flex items-center gap-3 px-5 py-3.5 text-brand hover:bg-brand/10 w-full transition-all duration-200 font-medium">
												<LayoutDashboard size={18} />
												Dashboard
											</Link>
											<button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-5 py-3.5 text-red-600 hover:bg-red-50 w-full transition-all duration-200 font-medium">
												<LogOut size={18} />
												Sign Out
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						) : (
							<Link
								href="/login"
								className={`
                  px-4 md:px-6 py-1 md:py-2.5 rounded-xl font-semibold tracking-wide
                  transition-all duration-300 hover:scale-105 active:scale-95
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
                  ${isScrolled ? "bg-gradient-to-r from-brand to-emerald-600 text-white shadow-md hover:shadow-lg" : "bg-white text-brand shadow-md hover:shadow-lg"}
                `}
							>
								{t("login")}
							</Link>
						)}

						<button
							className={`
                lg:hidden h-8 md:h-11 w-8 md:w-11 rounded-xl flex items-center justify-center
                transition-all duration-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2
                ${isScrolled ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700" : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"}
              `}
							onClick={() => setIsMenuOpen((v) => !v)}
							aria-label={isMenuOpen ? "Close menu" : "Open menu"}
							aria-expanded={isMenuOpen}
						>
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
			</motion.header>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<>
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)} />
						<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: "easeOut" }} className="fixed inset-y-0 right-0 w-[75%] max-w-md bg-gradient-to-br from-brand via-brand to-emerald-600 z-50 overflow-y-auto">
							<div className="py-12 px-8 h-full min-h-full flex flex-col">
								<nav className="flex flex-col gap-2" role="navigation">
									{navItems.map((item, idx) => (
										<motion.div key={item.href} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1, duration: 0.3 }}>
											<Link href={item.href} onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-2xl font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200">
												{item.title}
											</Link>
										</motion.div>
									))}
								</nav>

								<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.3 }} className="mt-12 pt-8 border-t border-white/20">
									<p className="text-white/60 text-sm font-medium mb-4 px-6">Contact Us</p>
									<a href="tel:+4796800984" className="block px-6 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-200">
										📞 {tr("phone_small_device")}
									</a>
									<a href="mailto:info@rspnorway.org" className="block px-6 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-200 mt-2">
										✉️ info@rspnorway.org
									</a>
								</motion.div>
								<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.3 }} className="mt-8 px-6">
									<Link href="/membership" onClick={() => setIsMenuOpen(false)} className="block w-full px-6 py-4 text-center text-lg font-bold text-brand bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
										{t("become_a_member") || "Become a Member"}
									</Link>
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Search */}
			{isModalOpen && <SearchModal placeholder={t("search_placeholder")} closeModal={() => setIsModalOpen(false)} />}
		</div>
	);
}

"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Menu, Search, X, ChevronDown, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import SearchModal from "@/components/SearchModal";
import { useTranslations, useLocale } from "next-intl";
import Flag from "@/components/ui/Flag";
import { usePathname, useRouter } from "@/i18n/navigation";
import SocialMediaLinks from "./SocialMediaLinks";

const LANGUAGES = [
	{ code: "ne", flag: "np", label: "नेपाली" },
	{ code: "no", flag: "no", label: "Norsk" },
	{ code: "en", flag: "gb", label: "English" },
];

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
	const hasDropdown = Array.isArray(dropdownItems) && dropdownItems.length > 0;
	const isDropdownOpen = activeDropdown === href;
	const handleDropdownClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isDropdownOpen) {
			setActiveDropdown(null);
		} else {
			setActiveDropdown(href);
		}
	};
	return (
		<div className="relative">
			{hasDropdown ? (
				<button onClick={handleDropdownClick} className={`flex items-center gap-1 border-b border-transparent hover:border-b hover:border-b-yellow-400 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"} ${isActive ? "border-b-2 border-brand" : ""}`}>
					{title}
					<ChevronDown size={16} className={isDropdownOpen ? "transform rotate-180 transition-transform" : "transition-transform"} />
				</button>
			) : (
				<Link href={href} className={`border-b border-transparent hover:border-b hover:border-b-yellow-400 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"} ${isActive ? "border-b-2 border-brand" : ""}`} onClick={() => setActiveDropdown(null)}>
					{title}
				</Link>
			)}
			{hasDropdown && isDropdownOpen && (
				<div className="absolute z-50 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
					{dropdownItems!.map((item) => (
						<Link key={item.href} href={item.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setActiveDropdown(null)}>
							{item.title}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

export default function MenuHeader() {
	const router = useRouter();
	const pathname = usePathname(); // This returns pathname WITHOUT locale prefix
	const locale = useLocale(); // This is the proper way to get current locale with next-intl

	const [showLangDropdown, setShowLangDropdown] = useState(false);
	const langDropdownRef = useRef<HTMLDivElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleMenu = () => setIsMenuOpen((v) => !v);
	const { data: session } = useSession();
	const user = session?.user;
	const avatarInitial = typeof user?.email === "string" && user.email ? user.email.charAt(0).toUpperCase() : "U";
	const t = useTranslations("navigation");
	const tr = useTranslations("footer");

	// Build navItems WITHOUT locale prefix - next-intl Link component handles this automatically
	const navItems = [
		{ title: t("about"), href: "/about-us" },
		{ title: t("notices"), href: "/notices" },
		{ title: t("gallery"), href: "/gallery" },
		{ title: t("downloads"), href: "/downloads" },
		{ title: t("contact"), href: "/contact" },
	];

	const mobileNavItems = navItems;
	const [isScrolled, setIsScrolled] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const userDropdownRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showUserDropdown) return;
		function handleClickOutside(event: MouseEvent) {
			if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
				setShowUserDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showUserDropdown]);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (!showLangDropdown) return;
		function handleClickOutside(event: MouseEvent) {
			if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
				setShowLangDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showLangDropdown]);

	function handleSignOut() {
		signOut({ callbackUrl: "/" });
	}

	function openModal() {
		setIsModalOpen(true);
	}

	function closeModal() {
		setIsModalOpen(false);
	}

	function handleHeaderClick() {
		setActiveDropdown(null);
		setShowUserDropdown(false);
		setShowLangDropdown(false);
	}

	// Fixed locale change function - use next-intl's router properly
	const handleLocaleChange = (code: string) => {
		if (code === locale) return;

		// Store in localStorage
		if (typeof window !== "undefined") {
			localStorage.setItem("locale", code);
		}

		setShowLangDropdown(false);

		// Use next-intl router's replace with locale option
		// pathname is already without locale prefix, so just pass it directly
		router.replace(pathname, { locale: code });
	};

	return (
		<div
			className={`fixed w-full left-0 z-50 transition-all duration-300 bg-transparent`}
			style={{
				top: 0,
				transitionProperty: "height, box-shadow, background-color",
			}}
		>
			{/* Top header */}
			<section className={`w-full h-10 p-[5px] border-b border-gray-300 shadow-sm transition-colors duration-500 will-change-[background-color] ${isScrolled ? "bg-brand" : "bg-gradient-to-r from-gray-50 to-gray-100"}`}>
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center">
						{/* ...existing code for top header left and right sections... */}
						<div className="flex items-center gap-4 md:gap-6">
							<a href="tel:+4796800984" className="flex items-center gap-2 text-gray-700 hover:text-brand transition-colors group">
								<svg className={`w-4 h-4 ${isScrolled ? "text-white" : "text-brand"} group-hover:scale-110 transition-transform`} fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
								</svg>
								<span className={`inline text-sm font-medium ${isScrolled ? "text-white" : "text-gray-900"}`}>{tr("phone_small_device")}</span>
							</a>
							<a href="mailto:info@rspnorway.org" className="hidden md:flex items-center gap-2 text-gray-700 hover:text-brand transition-colors group">
								<svg className={`w-4 h-4 ${isScrolled ? "text-white" : "text-brand"} group-hover:scale-110 transition-transform`} fill="currentColor" viewBox="0 0 20 20">
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
								</svg>
								<span className={`text-sm font-medium ${isScrolled ? "text-white" : "text-gray-900"}`}>info@rspnorway.org</span>
							</a>
						</div>
						<div className="flex items-center gap-3 md:gap-4">
							<SocialMediaLinks />
							<div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
							<div className="relative select-none" ref={langDropdownRef}>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowLangDropdown((v) => !v);
									}}
									className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1 hover:border-brand hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all duration-200"
									aria-label="Change language"
								>
									{(() => {
										const flagCode = LANGUAGES.find((l) => l.code === locale)?.flag;
										return <Flag country={flagCode as "no" | "np" | "gb"} size={20} />;
									})()}
									<span className="hidden sm:inline text-sm font-medium text-gray-700">{LANGUAGES.find((l) => l.code === locale)?.label}</span>
									<ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${showLangDropdown ? "rotate-180" : ""}`} />
								</button>
								{showLangDropdown && (
									<>
										<div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowLangDropdown(false)} />
										<div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
											<div className="py-1">
												{LANGUAGES.map((lang) => (
													<button
														key={lang.code}
														onClick={(e) => {
															e.stopPropagation();
															handleLocaleChange(lang.code);
														}}
														className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${locale === lang.code ? "bg-brand/10 text-brand font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
													>
														<Flag country={lang.flag as "no" | "np" | "gb"} size={20} />
														<span className="text-sm">{lang.label}</span>
														{locale === lang.code && (
															<svg className="ml-auto w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20">
																<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
															</svg>
														)}
													</button>
												))}
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main nav bar */}
			<motion.header ref={headerRef} className={`w-full z-40 transition-colors duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-brand"}`} style={{}} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} onClick={handleHeaderClick}>
				<div className="container mx-auto p-4 flex justify-between items-center">
					{/* ...existing code for nav bar... */}
					<Link href="/" className="flex items-center space-x-4 cursor-pointer group">
						<Image src="/rsp-norway-logo.png" alt="RSP Norway Logo" width={200} height={200} className="w-auto h-12 md:h-16 rounded-md" />
						<span className={`hidden md:block leading-3 text-2xl font-bold ${isScrolled ? "text-black" : "text-white group-hover:text-slate-100"} transition-colors duration-200`}>
							<span className="text-2xl font-bold">{t("rsp")} </span>
							<br />
							<span className="text-md font-thin">{t("norway")} </span>
						</span>
					</Link>
					<div className="flex gap-6 items-center">
						<nav className="hidden md:flex items-center space-x-6 font-medium text-md lg:text-lg">
							{navItems.map((item) => (
								<NavItem key={item.href || item.title} title={item.title} href={item.href} isScrolled={isScrolled} pathname={pathname} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
							))}
						</nav>
					</div>
					<div className="flex gap-4 md:gap-6 items-center">
						<button
							onClick={(e) => {
								e.stopPropagation();
								openModal();
							}}
							className="border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200"
							aria-label={t("search_placeholder")}
						>
							<span className={`border-b border-transparent hover:border-b hover:border-b-red-700 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`}>
								<Search />
							</span>
						</button>
						{user ? (
							<div className="relative" ref={userDropdownRef}>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowUserDropdown(!showUserDropdown);
										setActiveDropdown(null);
									}}
									className={`flex items-center gap-2 p-1 rounded-full ${isScrolled ? "bg-brand text-black hover:bg-brand" : "bg-white/20 text-white hover:bg-white/30"} transition-colors duration-200`}
								>
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-brand flex items-center justify-center text-white font-semibold shadow-sm">{avatarInitial}</div>
								</button>
								{showUserDropdown && (
									<div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden z-50">
										{/* ...existing code for user dropdown... */}
										<div className="p-4 bg-gradient-to-br from-brand/5 to-transparent border-b border-gray-100">
											<div className="flex items-center gap-3 mb-3">
												<div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-lg">{user?.name?.charAt(0).toUpperCase()}</div>
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-gray-900 truncate">{user?.name}</p>
													<p className="text-sm text-gray-500 truncate">{user?.email}</p>
												</div>
											</div>
										</div>
										<div className="py-2">
											<button
												onClick={() => {
													setShowUserDropdown(false);
													// Navigate to profile
												}}
												className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												<User size={18} className="text-gray-400" />
												<span>My Profile</span>
											</button>
											<button
												onClick={() => {
													setShowUserDropdown(false);
													// Navigate to settings
												}}
												className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												<Settings size={18} className="text-gray-400" />
												<span>Settings</span>
											</button>
											<Link
												href="/membership"
												onClick={() => {
													setShowUserDropdown(false);
												}}
												className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm  hover:bg-gray-50 ${isScrolled ? "text-white bg-brand" : "text-gray-700"} transition-colors`}
											>
												<User size={18} className="text-gray-400" />
												<span>Become a Member</span>
											</Link>
										</div>
										<div className="border-t border-gray-100"></div>
										<div className="py-2">
											<button
												onClick={() => {
													setShowUserDropdown(false);
													handleSignOut();
												}}
												className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
											>
												<LogOut size={18} />
												<span className="font-medium">Sign Out</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="flex gap-2">
								<Link href="/login" className={`hidden sm:block px-4 py-2 rounded-md bg-gray-700 text-white font-medium hover:bg-gray-900  transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
									{t("login")}
								</Link>
								<Link href="/membership" className={`px-4 py-2 rounded-md text-brand bg-gray-100 font-medium hover:bg-white transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
									{t("become_a_member")}
								</Link>
							</div>
						)}
						<div
							className="md:hidden cursor-pointer ml-4"
							onClick={(e) => {
								e.stopPropagation();
								toggleMenu();
								setActiveDropdown(null);
							}}
						>
							{isMenuOpen ? <X className={`${isScrolled ? "text-black" : "text-slate-700"}`} style={{ height: "32px", width: "32px" }} /> : <Menu className={`${isScrolled ? "text-black" : "text-white"}`} style={{ height: "32px", width: "32px" }} />}
						</div>
					</div>
				</div>
				<AnimatePresence>
					{isMenuOpen && (
						<motion.div className="md:hidden" initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ duration: 0.3 }}>
							<div className="fixed right-0 w-[60%] h-full bg-brand/90 backdrop-blur-sm shadow-lg z-50">
								<nav className="flex flex-col items-center text-xl font-semibold py-24">
									{mobileNavItems.map((item) => (
										<Link key={item.href} href={item.href} className="text-gray-300 hover:bg-slate-100 w-full text-center hover:text-red-600 transition-colors duration-300 py-2" onClick={toggleMenu}>
											{item.title}
										</Link>
									))}
									<div className="mt-12 text-slate-300 text-center">
										<p className="text-md underline">For Enquiry</p>
										<p>Send us a message</p>
									</div>
									<div className="mt-8 flex gap-2">
										<Link href="https://www.facebook.com/profile.php?id=61577689933528" className={`border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 text-white hover:text-slate-100`} aria-label="Facebook" onClick={() => setActiveDropdown(null)}>
											<Facebook />
										</Link>
										<Link href="#" className={`border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 text-white hover:text-slate-100`} aria-label="Instagram" onClick={() => setActiveDropdown(null)}>
											<Instagram />
										</Link>
									</div>
								</nav>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.header>

			{/* Animated search bar below nav */}
			<div
				className={`w-full transition-all duration-300 ${isModalOpen ? "h-20 opacity-100" : "h-0 opacity-0 overflow-hidden"}`}
				style={{
					transitionProperty: "height, opacity",
					transitionDuration: "300ms, 300ms",
					transitionDelay: isModalOpen ? "0ms, 150ms" : "0ms, 0ms",
				}}
			>
				{isModalOpen && <SearchModal closeModal={closeModal} placeholder={t("search_placeholder")} />}
			</div>
		</div>
	);
}

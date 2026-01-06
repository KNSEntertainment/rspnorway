"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Menu, Search, X, ChevronDown, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchModal from "@/components/SearchModal";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface NavItemProps {
	title: string;
	href: string;
	isScrolled: boolean;
	pathname: string;
	dropdownItems?: { title: string; href: string }[];
	activeDropdown: string | null;
	setActiveDropdown: (dropdown: string | null) => void;
}

type HeaderProps = {
	isMenuOpen: boolean;
	toggleMenu: () => void;
};

const NavItem = ({ title, href, isScrolled, pathname, dropdownItems, activeDropdown, setActiveDropdown }: NavItemProps) => {
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
				<button onClick={handleDropdownClick} className={`flex items-center gap-1 border-b border-transparent hover:border-b hover:border-b-yellow-400 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"} ${isActive ? "border-b-2 border-[#0094da]" : ""}`}>
					{title}
					<ChevronDown size={16} className={isDropdownOpen ? "transform rotate-180 transition-transform" : "transition-transform"} />
				</button>
			) : (
				<Link href={href} className={`border-b border-transparent hover:border-b hover:border-b-yellow-400 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"} ${isActive ? "border-b-2 border-[#0094da]" : ""}`} onClick={() => setActiveDropdown(null)}>
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
};

export default function Header({ isMenuOpen, toggleMenu }: HeaderProps) {
	const { data: session } = useSession();
	const user = session?.user;
	const avatarInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
	const navItems = [
		{ title: "Home", href: "/" },
		{ title: "About Us", href: "/about-us" },
		{
			title: "Events",
			href: "/events-notices",
			dropdownItems: [
				{ title: "Upcoming Events", href: "/events-notices" },
				{ title: "Past Events", href: "/events-notices/past" },
			],
		},
		{ title: "Gallery", href: "/gallery" },
		{ title: "Circulars", href: "/circulars" },
		{ title: "Downloads", href: "/downloads" },
		{ title: "Contact", href: "/contact" },
	];
	const mobileNavItems = navItems;

	const [isScrolled, setIsScrolled] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const userDropdownRef = useRef<HTMLDivElement>(null);
	// Collapse user dropdown when clicking outside
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
	const pathname = usePathname();
	const headerRef = useRef<HTMLDivElement>(null);

	const t = useTranslations("home");

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
	}

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			{/* Push-down search bar */}
			<div className={`w-full transition-all duration-300 ${isModalOpen ? "h-auto" : "h-0 overflow-hidden"}`} style={{ zIndex: 60, position: "relative" }}>
				{isModalOpen && <SearchModal closeModal={closeModal} />}
			</div>
			<motion.header ref={headerRef} className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-[#0094da]"}`} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} onClick={handleHeaderClick}>
				<div className="container mx-auto p-4 flex justify-between items-center">
					<Link href="/" className="flex items-center space-x-4 cursor-pointer group">
						<Image src="/rsp-norway-logo.png" alt="RSP Norway Logo" width={200} height={200} className="w-auto h-12 md:h-16 rounded-md" />
						<span className={`hidden md:block leading-3 text-2xl font-bold ${isScrolled ? "text-black" : "text-white group-hover:text-slate-100"} transition-colors duration-200`}>
							<span className="text-2xl font-bold">RSP </span>
							<br />
							<span className="text-md font-thin">Norway </span>
						</span>
					</Link>

					<div className="flex gap-6 items-center">
						<nav className="hidden md:flex items-center space-x-6">
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
							aria-label="Search"
						>
							<span className={`border-b border-transparent hover:border-b hover:border-b-red-700 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`}>
								<Search />
							</span>
						</button>
						<Link href="https://www.facebook.com/Magicchalk2023" className={`hidden sm:block border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`} aria-label="Facebook" onClick={() => setActiveDropdown(null)}>
							<Facebook />
						</Link>
						<Link href="https://www.instagram.com/magic_chalk_edu/" className={`hidden sm:block border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`} aria-label="Instagram" onClick={() => setActiveDropdown(null)}>
							<Instagram />
						</Link>

						{user ? (
							<div className="relative" ref={userDropdownRef}>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowUserDropdown(!showUserDropdown);
										setActiveDropdown(null);
									}}
									className={`flex items-center gap-2 p-1 rounded-full ${isScrolled ? "bg-[#0094da] text-black hover:bg-[#0094da]" : "bg-white/20 text-white hover:bg-white/30"} transition-colors duration-200`}
								>
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-brand flex items-center justify-center text-white font-semibold shadow-sm">{avatarInitial}</div>
								</button>

								{showUserDropdown && (
									<div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden z-50">
										{/* User Info Section */}
										<div className="p-4 bg-gradient-to-br from-brand/5 to-transparent border-b border-gray-100">
											<div className="flex items-center gap-3 mb-3">
												<div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-lg">{user?.name?.charAt(0).toUpperCase()}</div>
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-gray-900 truncate">{user?.name}</p>
													<p className="text-sm text-gray-500 truncate">{user?.email}</p>
												</div>
											</div>
										</div>

										{/* Menu Items */}
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
											<button
												onClick={() => {
													setShowUserDropdown(false);
													// Navigate to settings
												}}
												className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												<User size={18} className="text-gray-400" />
												<span>Become a Member</span>
											</button>
										</div>

										{/* Divider */}
										<div className="border-t border-gray-100"></div>

										{/* Sign Out */}
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
								<Link href="/login" className={`hidden sm:block px-4 py-2 rounded-md bg-brand text-white font-medium hover:bg-brand/90 transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
									Login
								</Link>
								<Link href="/membership" className={`px-4 py-2 rounded-md text-[#007bbd] bg-gray-200 font-medium hover:bg-brand hover:text-white transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
									{/* Become a Member */}
									{t("welcome_message")}
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
							<div className="fixed right-0 w-full h-full bg-[#0094da]">
								<nav className="flex flex-col items-center text-xl font-semibold py-24">
									{mobileNavItems.map((item) => (
										<NavLink key={item.href} href={item.href} onClick={toggleMenu}>
											{item.title}
										</NavLink>
									))}
									<div className="mt-12 text-slate-300 text-center">
										<p className="text-md underline">For Enquiry</p>
										<p>Send us a message</p>
									</div>
									<div className="mt-8 flex gap-2">
										<Link href="https://www.facebook.com/Magicchalk2023" className={`border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`} aria-label="Facebook" onClick={() => setActiveDropdown(null)}>
											<Facebook />
										</Link>
										<Link href="https://www.instagram.com/magic_chalk_edu/" className={`border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`} aria-label="Instagram" onClick={() => setActiveDropdown(null)}>
											<Instagram />
										</Link>
									</div>
								</nav>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.header>
		</>
	);
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
	return (
		<a href={href} className="text-gray-300 hover:bg-slate-100 w-full text-center hover:text-red-600 transition-colors duration-300 py-2" onClick={onClick}>
			{children}
		</a>
	);
}

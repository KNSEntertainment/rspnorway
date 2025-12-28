"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Menu, Search, X, ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchModal from "@/components/SearchModal";
import { usePathname } from "next/navigation";

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
		{ title: "Circulars", href: "/notices" },
		{ title: "Contact", href: "/contact" },
	];
	const mobileNavItems = navItems;

	const [isScrolled, setIsScrolled] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [user, setUser] = useState<{ email: string; role?: string } | null>(null);
	const pathname = usePathname();
	const headerRef = useRef<HTMLDivElement>(null);

	const avatarInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
	const avatarLabel = user?.email || "User";

	function handleSignOut() {
		setUser(null);
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
							<div className="relative">
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowUserDropdown(!showUserDropdown);
										setActiveDropdown(null);
									}}
									className={`flex items-center gap-2 px-3 py-2 rounded-full ${isScrolled ? "bg-[#0094da] text-[#0094da] hover:bg-[#0094da]" : "bg-white/20 text-white hover:bg-white/30"} transition-colors duration-200`}
								>
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-[#0094da] flex items-center justify-center text-white font-semibold shadow-sm">{avatarInitial}</div>
									<span className="hidden md:inline font-medium">{avatarLabel}</span>
									<ChevronDown size={16} className={showUserDropdown ? "transform rotate-180 transition-transform" : "transition-transform"} />
								</button>

								{showUserDropdown && (
									<div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
										<button
											onClick={() => {
												setShowUserDropdown(false);
												handleSignOut();
											}}
											className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
										>
											<LogOut size={16} />
											Sign Out
										</button>
									</div>
								)}
							</div>
						) : (
							<div className="flex gap-2">
								<Link href="/user" className={`hidden sm:block px-4 py-2 rounded-md bg-[#007bbd] text-white font-medium hover:bg-[#0760b9] transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
									Login
								</Link>
								<Link href="#" className={`px-4 py-2 rounded-md text-[#007bbd] bg-white font-medium hover:bg-white/80 transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
									Join us
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

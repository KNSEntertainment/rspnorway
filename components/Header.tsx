"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Menu, Search, X, ChevronDown, User, LogOut } from "lucide-react";
import Image from "next/image";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import SearchModal from "@/components/SearchModal";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
	isMenuOpen: boolean;
	toggleMenu: () => void;
}

interface NavItemProps {
	title: string;
	href: string;
	isScrolled: boolean;
	pathname: string;
	dropdownItems?: { title: string; href: string }[];
	activeDropdown: string | null;
	setActiveDropdown: (dropdown: string | null) => void;
}

const NavItem = ({ title, href, isScrolled, pathname, dropdownItems, activeDropdown, setActiveDropdown }: NavItemProps) => {
	const isActive = pathname === href;
	const isDropdownOpen = activeDropdown === href;

	const handleDropdownClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent event from bubbling up

		if (isDropdownOpen) {
			setActiveDropdown(null);
		} else {
			setActiveDropdown(href);
		}
	};

	return (
		<div className="relative">
			{dropdownItems ? (
				<button onClick={handleDropdownClick} className={`flex items-center gap-1 border-b border-transparent hover:border-b hover:border-b-yellow-400 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"} ${isActive ? "border-b-2 border-[#0094da]" : ""}`}>
					{title}
					<ChevronDown size={16} className={isDropdownOpen ? "transform rotate-180 transition-transform" : "transition-transform"} />
				</button>
			) : (
				<Link href={href} className={`border-b border-transparent hover:border-b hover:border-b-yellow-400 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"} ${isActive ? "border-b-2 border-[#0094da]" : ""}`} onClick={() => setActiveDropdown(null)}>
					{title}
				</Link>
			)}

			{dropdownItems && isDropdownOpen && (
				<div className="absolute z-50 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
					{dropdownItems.map((item) => (
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
	interface Setting {
		companyLogo?: string;
		name?: string;
		about?: string;
		address?: string;
		email?: string;
		phone?: string;
		mobile?: string;
		facebook?: string;
		youtube?: string;
		instagram?: string;
		linkedin?: string;
		businessHoursMF?: string;
	}
	const { data } = useFetchData("/api/settings", "settings");
	const settings = (data ?? []) as Setting[];
	const [isScrolled, setIsScrolled] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [user, setUser] = useState<{ email: string; role?: string; children?: { id: string; name: string; classGroup: string | null }[] } | null>(null);
	const pathname = usePathname();
	const headerRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	// Close dropdown when clicking anywhere on the page
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
				setActiveDropdown(null);
				setShowUserDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await fetch("/api/auth/me");
				if (!res.ok) {
					setUser(null);
					return;
				}
				const data = await res.json();
				setUser(data?.user || null);
			} catch (error) {
				setUser(null);
				console.error("Failed to fetch user:", error);
			}
		};

		fetchUser();
	}, []);

	// Close dropdown when route changes
	useEffect(() => {
		setActiveDropdown(null);
		setShowUserDropdown(false);
	}, [pathname]);

	const navItems = [
		{
			title: "About Us",
			href: "/about-us",
			dropdownItems: [
				{ title: "Our School", href: "/about-us" },
				{ title: "Our Team", href: "/teachers" },
				{ title: "Our Curriculum", href: "/curriculum" },
			],
		},
		{
			title: "Academics",
			href: "/programs",
			dropdownItems: [{ title: "Explore Programs", href: "/programs" }],
		},
		{
			title: "Admissions",
			href: "/admission",
			dropdownItems: [
				{ title: "Enroll Now", href: "/admission" },
				{ title: "Book School Tour", href: "/school-tour-form" },
			],
		},
		{
			title: "School Life",
			href: "/school-life",
			dropdownItems: [
				{ title: "Events and Notices", href: "/events-notices" },
				{ title: "Gallery", href: "/gallery" },
			],
		},
		{ title: "Blog", href: "/blogs" },
		{ title: "Contact Us", href: "/contact" },
	];

	const mobileNavItems = [
		{ title: "About Us", href: "/about-us" },
		{ title: "Our Team", href: "/teachers" },
		{ title: "Our Curriculum", href: "/curriculum" },
		{ title: "Explore Programs", href: "/programs" },
		{ title: "Enroll Now", href: "/admission" },
		{ title: "Book School Tour", href: "/school-tour-form" },
		{ title: "Events and Notices", href: "/events-notices" },
		{ title: "Gallery", href: "/gallery" },
		{ title: "Blog", href: "/blogs" },
		{ title: "Contact Us", href: "/contact" },
	];

	// Handle header click to close any open dropdown
	const handleHeaderClick = () => {
		if (activeDropdown) {
			setActiveDropdown(null);
		}
		if (showUserDropdown) {
			setShowUserDropdown(false);
		}
	};

	const dashboardHref = user?.role === "parent" ? "/parents/dashboard" : "/dashboard";
	const roleLabel = user?.role === "parent" ? "Parent" : user?.role === "teacher" ? "Teacher" : user?.role === "admin" ? "Administrator" : "User";
	const avatarInitial = user?.email?.charAt(0).toUpperCase() || "?";
	const avatarLabel = user?.email?.split("@")[0] || "Profile";

	const handleSignOut = async () => {
		try {
			await fetch("/api/logout", { method: "POST" });
			setUser(null);
			router.push("/");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<motion.header ref={headerRef} className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-[#0094da]"}`} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} onClick={handleHeaderClick}>
			<div className="container mx-auto p-4 flex justify-between items-center">
				<Link href="/" className="flex items-center space-x-4 cursor-pointer group">
					<Image src="/rsp-norway-logo.png" alt="RSP Norway Logo" width={200} height={200} className="w-auto h-12 md:h-16 rounded-md" />
				</Link>

				<div className="flex gap-6 items-center">
					<nav className="hidden md:flex items-center space-x-6">
						{navItems.map((item) => (
							<NavItem key={item.href} title={item.title} href={item.href} isScrolled={isScrolled} pathname={pathname} dropdownItems={item.dropdownItems} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
						))}
					</nav>
				</div>

				<div className="flex gap-4 md:gap-6 items-center">
					{isModalOpen && <SearchModal closeModal={closeModal} />}
					<button
						onClick={(e) => {
							e.stopPropagation(); // Prevent event from closing dropdowns
							openModal();
						}}
						className="border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200"
						aria-label="Search"
					>
						<span className={`border-b border-transparent hover:border-b hover:border-b-red-700 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`}>
							<Search />
						</span>
					</button>
					<Link href="https://www.facebook.com/Magicchalk2023" className={`border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`} aria-label="Facebook" onClick={() => setActiveDropdown(null)}>
						<Facebook />
					</Link>
					<Link href="https://www.instagram.com/magic_chalk_edu/" className={`border-b border-transparent hover:border-b hover:scale-110 transition-transform duration-200 ${isScrolled ? "text-black" : "text-white hover:text-slate-100"}`} aria-label="Instagram" onClick={() => setActiveDropdown(null)}>
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
									<div className="px-4 py-3 border-b border-gray-100">
										<p className="text-sm font-semibold text-gray-900">{user.email}</p>
										<p className="text-xs text-gray-500 mt-1">{roleLabel}</p>
									</div>
									{user.role === "parent" && user.children && user.children.length > 0 && (
										<div className="border-b border-gray-100">
											<p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500">Children</p>
											<ul className="max-h-40 overflow-y-auto">
												{user.children.map((child) => (
													<li key={child.id} className="px-4 py-2 text-sm text-gray-800 flex justify-between hover:bg-gray-50">
														<Link href={`/parents/dashboard?studentId=${child.id}`} className="font-medium" onClick={() => setShowUserDropdown(false)}>
															{child.name}
														</Link>
														<span className="text-xs text-gray-500">{child.classGroup || ""}</span>
													</li>
												))}
											</ul>
										</div>
									)}
									<Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowUserDropdown(false)}>
										<User size={16} />
										Dashboard
									</Link>
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
						<Link href="/user" className={`px-4 py-2 rounded-md bg-[#007bbd] text-white font-medium hover:bg-[#0760b9] transition-colors duration-200`} onClick={() => setActiveDropdown(null)}>
							Login
						</Link>
					)}{" "}
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
									<p className="text-md underline">For Admission Enquiry</p>
									<p>Call: 01-5454294</p>
								</div>
							</nav>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
	return (
		<a href={href} className="text-gray-300 hover:bg-slate-100 w-full text-center hover:text-red-600 transition-colors duration-300 py-2" onClick={onClick}>
			{children}
		</a>
	);
}

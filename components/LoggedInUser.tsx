import React, { useRef, useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";

interface SessionUser {
	name?: string | null;
	email?: string | null;
	image?: string | null;
	role?: string;
	// [key: string]: any;
}

const LoggedInUser = ({ user }: { user: SessionUser }) => {
	const userRef = useRef<HTMLDivElement>(null);
	const avatarInitial = typeof user?.email === "string" && user.email ? user.email.charAt(0).toUpperCase() : "U";
	const [showUserDropdown, setShowUserDropdown] = useState(false);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userRef.current && !userRef.current.contains(event.target as Node)) {
				setShowUserDropdown(false);
			}
		};

		if (showUserDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showUserDropdown]);

	return (
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
						{user.role === "admin" ? (
							<Link href="/en/dashboard" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-brand hover:bg-brand/10 w-full transition-all duration-200 font-medium">
								<LayoutDashboard size={18} />
								Dashboard
							</Link>
						) : (
							<Link href="/en/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-brand hover:bg-brand/10 w-full transition-all duration-200 font-medium">
								<User size={18} />
								My Profile
							</Link>
						)}
						<button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-5 py-3.5 text-error-600 hover:bg-error-50 w-full transition-all duration-200 font-medium">
							<LogOut size={18} />
							Sign Out
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default LoggedInUser;

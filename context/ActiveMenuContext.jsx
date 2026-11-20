"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const ActiveMenuContext = createContext({
	activeMenu: "dashboard",
	setActiveMenu: () => {},
});

export const useActiveMenu = () => useContext(ActiveMenuContext);

export const ActiveMenuProvider = ({ children }) => {
	const [activeMenu, setActiveMenu] = useState("dashboard");
	const pathname = usePathname() || "";

	useEffect(() => {
		// Extract menu id from pathname for any locale (e.g. /en/dashboard/blogs or /dashboard/blogs)
		let menuId = "dashboard";
		if (pathname.includes("/dashboard")) {
			const parts = pathname.split("/").filter(Boolean);
			const dashIndex = parts.indexOf("dashboard");
			if (dashIndex !== -1 && parts[dashIndex + 1]) {
				menuId = parts[dashIndex + 1];
			}
		}
		setActiveMenu(menuId);
	}, [pathname]);

	return <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>{children}</ActiveMenuContext.Provider>;
};
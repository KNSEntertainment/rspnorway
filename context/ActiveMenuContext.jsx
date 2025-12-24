"use client";

import React, { createContext, useContext, useState } from "react";

const ActiveMenuContext = createContext({
	activeMenu: "dashboard",
	setActiveMenu: (menu) => {},
});

export const useActiveMenu = () => useContext(ActiveMenuContext);

export const ActiveMenuProvider = ({ children }) => {
	const [activeMenu, setActiveMenu] = useState("dashboard");

	return <ActiveMenuContext.Provider value={{ activeMenu, setActiveMenu }}>{children}</ActiveMenuContext.Provider>;
};

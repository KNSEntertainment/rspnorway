"use client";
import Header from "@/components/Header";
import { useState } from "react";

export default function MenuHeader() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleMenu = () => setIsMenuOpen((open) => !open);

	return <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />;
}

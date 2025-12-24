"use client";
import localFont from "next/font/local";
import "./globals.css";
import { ActiveMenuProvider } from "@/context/ActiveMenuContext";
import GoToTopButton from "@/components/GoToTopBottom";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { ProfileProvider } from "@/context/ProfileContext";
import { usePathname } from "next/navigation";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();
	const isDashboard = pathname?.startsWith("/dashboard");

	const toggleMenu = () => {
		setIsMenuOpen((prev) => !prev);
	};
	return (
		<html lang="en">
			<AuthProvider>
				<ProfileProvider>
					<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
						{!isDashboard && <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />}

						<ActiveMenuProvider>{children}</ActiveMenuProvider>
						{!isDashboard && <GoToTopButton />}
						<Toaster position="bottom-right" reverseOrder={false} />
						{!isDashboard && <Footer />}
					</body>
				</ProfileProvider>
			</AuthProvider>
		</html>
	);
}

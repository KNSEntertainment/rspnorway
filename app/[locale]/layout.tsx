import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import ClientLayout from "./ClientLayout";
import { LoadingProvider } from "@/context/LoadingContext";
import { NextIntlClientProvider } from "next-intl";
import MenuHeader from "@/components/MenuHeader";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import LoadingWrapperClient from "./LoadingWrapper.client";

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

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ClientLayout>
					<NextIntlClientProvider>
						<MenuHeader />
						<LoadingProvider>
							<LoadingWrapperClient>{children}</LoadingWrapperClient>
							<Footer />
						</LoadingProvider>
					</NextIntlClientProvider>
				</ClientLayout>
			</body>
		</html>
	);
}

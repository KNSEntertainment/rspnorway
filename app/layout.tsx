export default function RootLayout({ children }: { children: React.ReactNode }) {
	// Root layout should only handle locale routing
	// HTML structure is handled by [locale]/layout.tsx
	return children;
}

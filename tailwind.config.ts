import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				// Primary Brand Color - Your main theme color
				brand: {
					50: "#e6f6fd",
					100: "#b3e5fa",
					200: "#80d4f7",
					300: "#4dc3f4",
					400: "#1ab2f1",
					500: "#0094da", // DEFAULT - Your current brand color
					600: "#0077ae",
					700: "#005a82",
					800: "#003d57",
					900: "#00202b",
					DEFAULT: "#0094da",
				},
				
				// Neutral/Gray - Simplified to essential shades
				neutral: {
					50: "#f9fafb",   // Light backgrounds
					100: "#f3f4f6",  // Subtle backgrounds
					200: "#e5e7eb",  // Borders, dividers
					300: "#d1d5db",  // Disabled borders
					400: "#9ca3af",  // Disabled text
					500: "#6b7280",  // Muted text
					600: "#4b5563",  // Secondary text
					700: "#374151",  // Primary text
					800: "#1f2937",  // Dark text
					900: "#111827",  // Darkest text
				},
				
				// Semantic Colors - Minimal set
				success: {
					50: "#f0fdf4",
					100: "#dcfce7",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
				},
				error: {
					50: "#fef2f2",
					100: "#fee2e2",
					500: "#ef4444",
					600: "#dc2626",
					700: "#b91c1c",
				},
				warning: {
					50: "#fffbeb",
					100: "#fef3c7",
					500: "#f59e0b",
					600: "#d97706",
					700: "#b45309",
				},
				info: {
					50: "#eff6ff",
					100: "#dbeafe",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
				},
				
				// Shadcn UI compatibility (keep these for component library)
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				scroll: {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(-100%)" },
				},
				"spin-reverse": {
					from: { transform: "rotate(360deg)" },
					to: { transform: "rotate(0deg)" },
				},
			},
			animation: {
				scroll: "scroll 20s linear infinite",
				"spin-slow": "spin 2s linear infinite",
				"spin-reverse": "spin-reverse 1s linear infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

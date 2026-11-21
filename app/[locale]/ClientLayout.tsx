"use client";

import { Suspense } from "react";
import AuthProvider from "@/context/AuthProvider";
import ActivityTracker from "@/components/ActivityTracker";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<Suspense fallback={null}>
				<ActivityTracker />
			</Suspense>
			{children}
		</AuthProvider>
	);
}

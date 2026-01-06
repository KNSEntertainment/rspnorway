"use client";
import { useLoading } from "@/context/LoadingContext";
import GlobalLoading from "@/components/GlobalLoading";

export default function LoadingWrapperClient({ children }: { children: React.ReactNode }) {
	const { isLoading } = useLoading();
	return (
		<>
			{isLoading && <GlobalLoading />}
			{children}
		</>
	);
}

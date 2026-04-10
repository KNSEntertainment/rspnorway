"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

interface OptimizedClientLayoutProps {
  children: React.ReactNode;
}

export default function OptimizedClientLayout({ children }: OptimizedClientLayoutProps) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Only render progress bar on client-side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't show progress bar on dashboard pages to reduce JavaScript overhead
  const shouldShowProgressBar = isClient && !pathname?.includes('/dashboard');

  return (
    <>
      {shouldShowProgressBar && <ProgressBar />}
      {children}
    </>
  );
}

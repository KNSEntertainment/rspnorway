"use client";

import { useEffect } from "react";

export default function PerformanceMonitor() {

  useEffect(() => {
    // Only run in production and in browser
    if (typeof window === "undefined" || process.env.NODE_ENV !== "production") {
      return;
    }

    const measurePerformance = () => {
      try {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        // First Contentful Paint
        const fcpEntry = paint.find((entry) => entry.name === "first-contentful-paint");
        const fcp = fcpEntry ? fcpEntry.startTime : null;

        // Time to First Byte
        const ttfb = navigation.responseStart - navigation.requestStart;

        // Load Time
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;

        // Largest Contentful Paint (needs observer)
        let lcp = null;
        if ("PerformanceObserver" in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        }

        // Cumulative Layout Shift (needs observer)
        let clsValue = 0;
        if ("PerformanceObserver" in window) {
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
              if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
                clsValue += layoutShiftEntry.value;
              }
            }
          });
          clsObserver.observe({ entryTypes: ["layout-shift"] });
        }

        // First Input Delay (needs observer)
        if ("PerformanceObserver" in window) {
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const performanceEntry = entry as PerformanceEntry & { processingStart?: number };
              if (performanceEntry.processingStart) {
                const fid = performanceEntry.processingStart - entry.startTime;
                console.log("FID:", `${Math.round(fid)}ms`);
                break; // Only need the first one
              }
            }
          });
          fidObserver.observe({ entryTypes: ["first-input"] });
        }

        
        // Log metrics for debugging
        console.log("Performance Metrics:", {
          fcp: fcp ? `${Math.round(fcp)}ms` : "N/A",
          lcp: lcp ? `${Math.round(lcp)}ms` : "N/A",
          ttfb: `${Math.round(ttfb)}ms`,
          loadTime: `${Math.round(loadTime)}ms`,
          cls: clsValue.toFixed(3),
        });
      } catch (error) {
        console.error("Error measuring performance:", error);
      }
    };

    // Wait for page to fully load
    if (document.readyState === "complete") {
      setTimeout(measurePerformance, 0);
    } else {
      window.addEventListener("load", () => {
        setTimeout(measurePerformance, 0);
      });
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}

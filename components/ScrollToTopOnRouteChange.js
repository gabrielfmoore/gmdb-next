"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Run twice to win against segment-level restoration timing.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, searchParams]);

  return null;
}

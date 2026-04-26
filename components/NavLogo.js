"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INTRO_MS = 2600;

export function NavLogo() {
  const pathname = usePathname();
  const [playIntro, setPlayIntro] = useState(pathname === "/");
  const shouldReplayOnHome = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playIntro) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPlayIntro(false);
      timerRef.current = null;
    }, INTRO_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playIntro]);

  useEffect(() => {
    if (pathname === "/" && shouldReplayOnHome.current) {
      shouldReplayOnHome.current = false;
      // Force restart by toggling off then on next frame.
      setPlayIntro(false);
      requestAnimationFrame(() => setPlayIntro(true));
    }
  }, [pathname]);

  return (
    <Link
      href="/"
      className={`logo${playIntro ? " logo--intro" : ""}`}
      onClick={() => {
        if (pathname !== "/") shouldReplayOnHome.current = true;
      }}
    >
      GMDB
    </Link>
  );
}

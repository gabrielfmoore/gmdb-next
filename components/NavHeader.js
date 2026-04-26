"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { SearchBar } from "@/components/SearchBar";

const INTRO_MS = 2600;

export function NavHeader() {
  const pathname = usePathname();
  const [playIntro, setPlayIntro] = useState(pathname === "/");
  const pendingReplay = useRef(false);
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
    if (pathname === "/" && pendingReplay.current) {
      pendingReplay.current = false;
      setPlayIntro(false);
      requestAnimationFrame(() => setPlayIntro(true));
    }
  }, [pathname]);

  return (
    <nav className={playIntro ? "nav--intro" : ""}>
      <div className="nav-el max-w-[1240px] mx-auto">
        <Link
          href="/"
          className={`logo${playIntro ? " logo--intro" : ""}`}
          onClick={() => {
            if (pathname !== "/") pendingReplay.current = true;
          }}
        >
          GMDB
        </Link>
        <Suspense fallback={<div className={`search-form${playIntro ? " search-form--intro" : ""}`} />}>
          <SearchBar intro={playIntro} />
        </Suspense>
      </div>
    </nav>
  );
}

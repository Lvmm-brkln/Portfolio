"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

const navItems: Array<{ href: string; label: string }> = [
  { href: "/", label: "Photography" },
  { href: "/ai-visuals", label: "AI Visuals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // Initialiser de façon stable (SSR == client premier rendu) pour éviter les warnings hydration.
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const condenseAt = 26;
    const relaxAt = 18;
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const y = window.scrollY;

      setIsCondensed((prev) => {
        if (!prev && y > condenseAt) return true;
        if (prev && y < relaxAt) return false;
        return prev;
      });
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b backdrop-blur-md transition-[padding,border-color,background-color] duration-300",
        isCondensed
          ? "border-black/10 bg-background/86"
          : "border-black/5 bg-background/72",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 transition-[padding] duration-300",
          isCondensed ? "py-3" : "py-4",
        ].join(" ")}
      >
        <Link
          href="/"
          className={[
            "font-serif tracking-tight text-foreground transition-[font-size,letter-spacing] duration-300",
            isCondensed ? "text-lg" : "text-xl",
          ].join(" ")}
          aria-label={`${site.name} home`}
        >
          {site.name}
        </Link>

        <nav className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "relative pb-0.5 transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-foreground/62 hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300",
                    isActive ? "scale-x-100 bg-foreground/80" : "scale-x-0 bg-foreground/45",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


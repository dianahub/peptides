"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SITE_NAME } from "@/lib/config";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavSearch } from "./NavSearch";

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/videos" as const, label: t("videos") },
    { href: "/topics" as const, label: t("topics") },
    { href: "/research" as const, label: t("research") },
    { href: "/consultation" as const, label: t("consultation") },
    { href: "/about" as const, label: t("about") },
  ];

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "linear-gradient(115deg, #10263c 0%, #1c3f63 55%, #2b5f8c 100%)",
        borderBottom: "1px solid rgba(207,159,63,0.5)",
        boxShadow: "0 10px 30px -14px rgba(16,38,60,0.65)",
      }}
    >
      <nav
        className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-6"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            href="/"
            className="font-serif font-medium text-2xl text-white tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
          >
            Futurotek Health
          </Link>
          <a
            href="https://futurotekhealth.com"
            className="text-xs text-white/50 hover:text-white/80 transition-colors hidden sm:block whitespace-nowrap"
          >
            {t("mainSite")}
          </a>
        </div>

        <a
          href="tel:+12026400054"
          className="hidden lg:flex flex-col items-end text-white/80 hover:text-white transition-colors"
        >
          <span className="text-[11px] uppercase tracking-[0.12em] text-white/60">
            {t("referralLine")}
          </span>
          <span className="text-sm tabular-nums">+1 (202) 640-0054</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-1 items-center" role="list">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            const isCta = href === "/consultation";
            const className = isCta
              ? "px-3 py-1.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold text-gold hover:text-amber-300 ml-2"
              : `px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isActive ? "text-white" : "text-white/80 hover:text-white"
                }`;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="hidden lg:block ml-3">
            <NavSearch variant="desktop" />
          </li>
          <li className="ml-3">
            <LocaleSwitcher />
          </li>
        </ul>

        {/* Mobile burger */}
        <div className="md:hidden flex items-center gap-3">
          <LocaleSwitcher />
          <button
            className="p-2 rounded text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-white/10 px-4 pb-4" style={{ background: "#10263c" }}>
          <a
            href="tel:+12026400054"
            className="flex items-center gap-2 py-3 border-b border-white/10 text-white/70 hover:text-white text-sm transition-colors"
          >
            <span className="text-[11px] uppercase tracking-wider text-white/50">{t("referralLine")}</span>
            <span className="tabular-nums">+1 (202) 640-0054</span>
          </a>
          <div className="pt-3 pb-1 border-b border-white/10">
            <NavSearch variant="mobile" onNavigate={() => setOpen(false)} />
          </div>
          <ul className="flex flex-col gap-1 pt-2" role="list">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    pathname === href ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

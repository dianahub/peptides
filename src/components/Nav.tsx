"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/videos", label: "Videos" },
  { href: "/topics", label: "Topics" },
  { href: "/consultation", label: "Free Consultation" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <nav
        className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-semibold text-lg text-teal-700 tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
        >
          {SITE_NAME}
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex gap-1" role="list">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  pathname === href
                    ? "bg-teal-50 text-teal-700"
                    : "text-stone-600 hover:text-teal-700 hover:bg-stone-50"
                } ${
                  href === "/consultation"
                    ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white ml-2"
                    : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded text-stone-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-stone-100 bg-white px-4 pb-4"
        >
          <ul className="flex flex-col gap-1 pt-2" role="list">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    pathname === href
                      ? "bg-teal-50 text-teal-700"
                      : "text-stone-600 hover:text-teal-700 hover:bg-stone-50"
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

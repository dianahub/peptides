import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{ background: "#d6e0ec", borderColor: "rgba(20,48,77,0.16)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Affiliate disclosure */}
        <p className="text-xs text-navy-soft mb-4">
          <strong className="text-navy">Affiliate disclosure:</strong> I am an independent affiliate
          of The Longevity Consultants and may receive compensation if you
          request a consultation through me.
        </p>

        {/* Site-wide disclaimer */}
        <p className="text-sm text-navy-soft mb-6">
          The content on this site is for educational purposes only. It is not
          medical advice and does not diagnose, treat, cure, or prevent any
          condition. Always speak with a licensed healthcare professional before
          making health decisions.{" "}
          <Link
            href="/disclaimer"
            className="underline hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded transition-colors"
          >
            Full disclaimer
          </Link>
        </p>

        {/* Footer nav */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-soft">
            {[
              { href: "/", label: "Home" },
              { href: "/videos", label: "Videos" },
              { href: "/topics", label: "Topics" },
              { href: "/consultation", label: "Free Consultation" },
              { href: "/about", label: "About" },
              { href: "/disclaimer", label: "Disclaimer" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-navy-soft/70 mt-6">
          © 2026 {SITE_NAME}. Independent affiliate site.
          Not affiliated with or endorsed by The Longevity Consultants.
        </p>
      </div>
    </footer>
  );
}

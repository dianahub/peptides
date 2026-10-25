export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs text-navy-soft border-l-2 pl-3 ${className}`}
      style={{ borderColor: "rgba(20,48,77,0.25)" }}
      role="note"
    >
      <strong className="text-navy">Affiliate disclosure:</strong> I am an independent affiliate of
      The Longevity Consultants and may receive compensation if you request a
      consultation through me.
    </p>
  );
}

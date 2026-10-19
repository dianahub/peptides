export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-sm text-stone-600 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 ${className}`}
      role="note"
    >
      <strong>Affiliate disclosure:</strong> I am an independent affiliate of
      The Longevity Consultants and may receive compensation if you request a
      consultation through me.
    </p>
  );
}

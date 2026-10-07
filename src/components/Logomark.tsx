/** Two overlapping cards: the brand mark. Back card `secondary` at 50%, front card `primary`. */
export function Logomark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="7" y="3" width="15" height="19" rx="3" className="fill-secondary" opacity="0.5" />
      <rect x="2" y="6.5" width="15" height="19" rx="3" className="fill-primary" />
    </svg>
  )
}

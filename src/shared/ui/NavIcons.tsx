import type { ReactNode } from 'react'

function NavIcon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function DecksIcon({ size = 16 }: { size?: number }) {
  return (
    <NavIcon size={size}>
      <rect x="5.6" y="1.8" width="9" height="10.4" rx="1.6" />
      <rect x="1.6" y="4.4" width="9" height="10.4" rx="1.6" />
    </NavIcon>
  )
}

export function MaintenanceIcon({ size = 16 }: { size?: number }) {
  return (
    <NavIcon size={size}>
      <rect x="3" y="2.2" width="10" height="12.2" rx="1.8" />
      <line x1="5.5" y1="1.5" x2="5.5" y2="3.3" strokeWidth="1.6" />
      <line x1="10.5" y1="1.5" x2="10.5" y2="3.3" strokeWidth="1.6" />
      <polyline points="5.5,7.8 6.8,9.1 10,5.9" />
      <line x1="5.5" y1="11.3" x2="10.5" y2="11.3" />
    </NavIcon>
  )
}

export function ConverterIcon({ size = 16 }: { size?: number }) {
  return (
    <NavIcon size={size}>
      <line x1="3" y1="5" x2="11" y2="5" />
      <polyline points="8.5,2.2 11,5 8.5,7.8" />
      <line x1="13" y1="11" x2="5" y2="11" />
      <polyline points="7.5,8.2 5,11 7.5,13.8" />
    </NavIcon>
  )
}

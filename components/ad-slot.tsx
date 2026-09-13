'use client'

import { Megaphone } from 'lucide-react'

export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  return <div className="ad-slot" aria-label="Advertisement area">
    <Megaphone className="size-5" />
    <span className="ad-label">Sponsored</span>
    <span className="ad-content">{label}</span>
  </div>
}

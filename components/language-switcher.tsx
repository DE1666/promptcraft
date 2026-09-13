'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { languages, type Lang } from '@/lib/translations'

export function LanguageSwitcher({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = languages.find(l => l.code === lang) ?? languages[0]
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return <div className="lang-switcher" ref={ref}>
    <button className="lang-current" onClick={() => setOpen(!open)} aria-label="Select language" aria-expanded={open}>
      <Globe />
      <span className="lang-flag">{current.flag}</span>
      <span>{current.code.toUpperCase()}</span>
      <ChevronDown style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
    </button>
    {open && <div className="lang-menu" role="menu">
      {languages.map(l => <button key={l.code} className={l.code === lang ? 'active' : ''} onClick={() => { onChange(l.code); setOpen(false) }} role="menuitem">
        <span className="lang-flag">{l.flag}</span>
        <span>{l.label}</span>
      </button>)}
    </div>}
  </div>
}

'use client'

import { Check, Sparkles, Zap, Building2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { t, type Lang } from '@/lib/translations'

export function PricingModal({ open, onOpenChange, lang, currentPlan, onSelectPlan }: { open: boolean; onOpenChange: (open: boolean) => void; lang: Lang; currentPlan: string; onSelectPlan: (plan: string) => void }) {
  const plans = [
    { id: 'free', name: t(lang, 'pricing.free'), price: '$0', desc: t(lang, 'pricing.freeDesc'), features: [t(lang, 'pricing.freeF1'), t(lang, 'pricing.freeF2'), t(lang, 'pricing.freeF3')], icon: Sparkles, btnClass: 'free' },
    { id: 'pro', name: t(lang, 'pricing.pro'), price: '$19', desc: t(lang, 'pricing.proDesc'), features: [t(lang, 'pricing.proF1'), t(lang, 'pricing.proF2'), t(lang, 'pricing.proF3')], icon: Zap, btnClass: 'pro' },
    { id: 'enterprise', name: t(lang, 'pricing.enterprise'), price: 'Custom', desc: t(lang, 'pricing.enterpriseDesc'), features: [t(lang, 'pricing.enterpriseF1'), t(lang, 'pricing.enterpriseF2'), t(lang, 'pricing.enterpriseF3')], icon: Building2, btnClass: 'enterprise' },
  ]
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-3xl p-6">
      <DialogHeader>
        <DialogTitle><span className="flex items-center gap-2"><Sparkles className="size-5 text-primary" />{t(lang, 'pricing.title')}</span></DialogTitle>
        <DialogDescription>{t(lang, 'pricing.desc')}</DialogDescription>
      </DialogHeader>
      <div className="pricing-modal">
        <div className="pricing-grid">
          {plans.map(plan => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id
            return <div key={plan.id} className={`pricing-card ${plan.id}`}>
              <div className="flex items-center gap-2"><Icon className="size-5 text-primary" /><span className="pricing-card-name">{plan.name}</span></div>
              <div className="pricing-card-price">{plan.price}{plan.price !== 'Custom' && <small>{t(lang, 'pricing.month')}</small>}</div>
              <p className="pricing-card-desc">{plan.desc}</p>
              <ul className="pricing-card-features">{plan.features.map((f, i) => <li key={i}><Check />{f}</li>)}</ul>
              {isCurrent ? <Button variant="outline" className="pricing-card-btn" disabled>{t(lang, 'pricing.current')}</Button>
                : plan.id === 'enterprise' ? <Button variant="outline" className={`pricing-card-btn ${plan.btnClass}`} onClick={() => { onSelectPlan(plan.id); onOpenChange(false) }}>{t(lang, 'pricing.contact')}</Button>
                : <Button className={`pricing-card-btn ${plan.btnClass}`} onClick={() => { onSelectPlan(plan.id); onOpenChange(false) }}>{t(lang, 'pricing.choose')}</Button>}
            </div>
          })}
        </div>
      </div>
    </DialogContent>
  </Dialog>
}

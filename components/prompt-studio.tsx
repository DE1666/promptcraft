'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, AudioLines, BookOpen, ChevronRight, CircleHelp, Command, CreditCard, History, Layers3, LogOut, RotateCcw, Sparkles, WandSparkles, Zap, Copy, Check, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PromptBuilder } from '@/components/prompt-builder'
import { PromptOutput } from '@/components/prompt-output'
import { categoryIcons, HistoryDrawer, TemplateLibrary, TrendingRecipes } from '@/components/prompt-library'
import { buildPrompt, categories, initialResult, initialSettings, recipes, settingsForCategory, settingsForRecipe, type Category, type PromptResult, type Recipe, type Settings } from '@/lib/prompt-engine'
import { t, isRTL, type Lang } from '@/lib/translations'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AuthProvider, useAuthWithIncrement } from '@/components/auth-provider'
import { AdSlot } from '@/components/ad-slot'
import { PricingModal } from '@/components/pricing-modal'
import { LimitModal } from '@/components/limit-modal'

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
}

function StudioInner() {
  const auth = useAuthWithIncrement()
  const [lang, setLang] = useState<Lang>('en')
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [result, setResult] = useState<PromptResult | null>(initialResult)
  const [history, setHistory] = useState<PromptResult[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [limitOpen, setLimitOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const request = useRef(0)
  const busy = useRef(false)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr' }, [lang])

  const cancelGeneration = () => { request.current++; if (timer.current) clearTimeout(timer.current); busy.current = false; setLoading(false) }
  const generate = (variant = 0, input = settings) => {
    if (!input.idea.trim() || busy.current) return
    if (auth.isLimited) { setLimitOpen(true); return }
    busy.current = true
    setLoading(true)
    const version = ++request.current
    timer.current = setTimeout(() => {
      if (version !== request.current) return
      const next: PromptResult = { id: crypto.randomUUID(), settings: { ...input, flags: [...input.flags] }, ...buildPrompt(input, variant), variant, createdAt: new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
      setResult(next)
      setHistory(current => [next, ...current])
      setLoading(false)
      busy.current = false
      if (auth.user) auth.incrementUsage()
      toast.success(variant ? 'A fresh perspective, ready to explore.' : 'Your super-prompt is ready.')
    }, 650)
  }
  const selectCategory = (category: Category) => { cancelGeneration(); setSettings(settingsForCategory(category)) }
  const selectRecipe = (recipe: Recipe) => { cancelGeneration(); setSettings(settingsForRecipe(recipe)); toast.success(`"${recipe.title}" loaded. Make it yours.`); document.getElementById('studio-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const enhance = () => {
    const sample = recipes.find(recipe => recipe.category === settings.category)!
    if (!settings.idea.trim()) { setSettings({ ...settings, idea: sample.idea }); toast.success('A little inspiration to get you started.'); return }
    const detail = settings.category === 'visual' || settings.category === 'flux' ? ' Use a strong focal point, layered depth, and an intentional color palette.' : settings.category === 'code' || settings.category === 'cursor' ? ' Prioritize responsive layouts, accessible interactions, and clear loading and error states.' : ' Focus on a specific audience, a tangible benefit, and a clear next step.'
    if (!settings.idea.includes(detail.trim())) setSettings({ ...settings, idea: `${settings.idea.trim()}${detail}`.slice(0, 2000) })
    toast.success('Added a little more creative direction.')
  }
  const clear = () => { cancelGeneration(); setSettings(settingsForCategory(settings.category)); setResult(null); toast('A fresh canvas. What will you create?') }
  const save = () => {
    if (!result) return
    const saved = favorites.includes(result.id)
    setFavorites(current => saved ? current.filter(id => id !== result.id) : [...current, result.id])
    if (!saved) setHistory(current => current.some(item => item.id === result.id) ? current : [result, ...current])
    toast.success(saved ? 'Removed from favorites.' : 'Saved to your session favorites.')
  }
  const dirty = result ? JSON.stringify(result.settings) !== JSON.stringify(settings) : false

  const handleCopy = async () => {
    if (!result) return
    try { await navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  return <div className="app-shell">
    <a href="#studio-workspace" className="skip-link">Skip to prompt builder</a>
    <header className="site-header"><div className="header-inner">
      <a href="/" className="brand" aria-label="AI Prompt Generator home"><span className="brand-logo"><AudioLines strokeWidth={2.5} /></span><span>promptcraft<span className="brand-period">.</span></span><Badge variant="outline">STUDIO</Badge></a>
      <nav aria-label="Main navigation"><span className="nav-current"><WandSparkles className="size-4" />{t(lang, 'nav.studio')}</span><Button variant="ghost" onClick={() => setTemplatesOpen(true)}><Layers3 data-icon="inline-start" />{t(lang, 'nav.templates')}</Button><Button variant="ghost" onClick={() => setPricingOpen(true)}><CreditCard data-icon="inline-start" />{t(lang, 'nav.pricing')}</Button></nav>
      <div className="header-right">
        <LanguageSwitcher lang={lang} onChange={setLang} />
        {auth.user ? (
          <div className="user-menu">
            <img src={auth.user.user_metadata?.avatar_url ?? '/placeholder-user.jpg'} alt={auth.user.email ?? 'User'} className="user-avatar" />
          </div>
        ) : (
          <button className="signin-btn" onClick={auth.signInWithGoogle}><GoogleIcon />{t(lang, 'nav.signin')}</button>
        )}
        <span className="local-indicator"><i />{t(lang, 'hero.aside')}</span>
        <Button variant="outline" size="icon" className="help-button" aria-label="How it works" onClick={() => setHelpOpen(true)}><CircleHelp /></Button>
      </div>
    </div></header>

    <main className="main-container">
      <div className="breadcrumb"><span>Workspace</span><ChevronRight className="size-3" /><span>{t(lang, 'nav.studio')}</span></div>
      <section className="hero"><div><div className="hero-eyebrow"><Sparkles className="size-3.5" />{t(lang, 'hero.eyebrow')}</div><h1>{t(lang, 'hero.title1')} <span>{t(lang, 'hero.title2')}</span></h1><p>{t(lang, 'hero.desc')}</p></div><div className="hero-aside"><div className="engine-stack"><span><Command /></span><span><AudioLines /></span><span><Zap /></span><span><Sparkles /></span></div><p>{t(lang, 'hero.aside')}<br /><span>{t(lang, 'hero.aside2')}</span></p></div></section>

      <div className="workspace-toolbar" id="studio-workspace">
        <ToggleGroup className="category-switcher" value={[settings.category]} onValueChange={value => value.length > 0 && selectCategory(value[0] as Category)} aria-label="Prompt category" spacing={0}>
          {Object.entries(categories).map(([key, category]) => { const Icon = categoryIcons[key as Category]; return <ToggleGroupItem key={key} value={key}><Icon data-icon="inline-start" /><span>{t(lang, `cat.${key}` as string) === `cat.${key}` ? category.label : t(lang, `cat.${key}` as string)}</span></ToggleGroupItem> })}
        </ToggleGroup>
        <div className="workspace-actions">
          <Button variant="ghost" size="sm" onClick={clear} aria-label="Clear canvas"><RotateCcw data-icon="inline-start" /><span>{t(lang, 'action.clear')}</span></Button>
          <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)} aria-label="View saved prompts and history"><History data-icon="inline-start" /><span>{t(lang, 'action.history')}{history.length ? ` (${history.length})` : ''}</span></Button>
          <Button variant="outline" size="sm" className="pro-templates" onClick={() => setTemplatesOpen(true)}><Sparkles data-icon="inline-start" /><span>{t(lang, 'action.proTemplates')}</span></Button>
          <Button variant="outline" size="sm" className="pricing-btn" onClick={() => setPricingOpen(true)}><CreditCard data-icon="inline-start" /><span>{t(lang, 'nav.pricing')}</span></Button>
        </div>
      </div>

      {auth.user && (
        <div className="usage-bar" style={{ marginBottom: 12 }}>
          {auth.plan === 'free' ? <>
            <span>{auth.usageRemaining} {t(lang, 'usage.remaining')}</span>
            <div className="usage-bar-track"><div className="usage-bar-fill" style={{ width: `${(auth.usageCount / 5) * 100}%` }} /></div>
          </> : <span className="usage-bar unlimited">{t(lang, 'usage.unlimited')}</span>}
        </div>
      )}

      <div className="studio-grid">
        <PromptBuilder settings={settings} onChange={setSettings} onGenerate={() => generate()} onEnhance={enhance} loading={loading} lang={lang} />
        <PromptOutput result={result} loading={loading} dirty={dirty} saved={!!result && favorites.includes(result.id)} onSave={save} onRegenerate={() => result && generate(result.variant + 1, result.settings)} lang={lang} onCopy={handleCopy} />
      </div>

      <div className="workspace-footnote"><span><span className="mini-status-dot" /> Your creativity. A better starting point.</span><span>Crafted locally. No API key needed.<span className="footnote-divider">/</span>Session-only history</span></div>

      {auth.plan === 'free' && <AdSlot label="Google AdSense — Your ad here" />}

      <TrendingRecipes onSelect={selectRecipe} onBrowse={() => setTemplatesOpen(true)} />

      {auth.plan === 'free' && <AdSlot label="Google AdSense — Your ad here" />}

      <footer className="site-footer"><div className="footer-brand"><AudioLines className="size-4" /><span>A little craft goes a long way.</span></div><p>Made for the way you create.</p><button onClick={() => setHelpOpen(true)}>The art of a good prompt <ArrowUpRight className="size-3.5" /></button></footer>
    </main>

    {/* Sticky mobile action bar */}
    <div className="sticky-mobile-actions">
      <button className="sticky-generate" disabled={!settings.idea.trim() || loading} onClick={() => generate()}>
        {loading ? <LoaderCircle className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
        {loading ? t(lang, 'builder.crafting') : t(lang, 'builder.generateShort')}
      </button>
      <button className="sticky-copy" disabled={!result || loading} onClick={handleCopy} aria-label={t(lang, 'output.copy')}>
        {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
      </button>
    </div>

    <TemplateLibrary open={templatesOpen} onOpenChange={setTemplatesOpen} onSelect={selectRecipe} />
    <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} history={history} favorites={favorites} onRestore={item => { cancelGeneration(); setSettings(item.settings); setResult(item) }} onDelete={id => { setHistory(items => items.filter(item => item.id !== id)); setFavorites(items => items.filter(item => item !== id)); toast('Prompt removed from history.') }} />
    <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} lang={lang} currentPlan={auth.plan} onSelectPlan={(p) => { toast.success(`Plan selected: ${p}. Checkout coming soon.`) }} />
    <LimitModal open={limitOpen} onOpenChange={setLimitOpen} lang={lang} onSignIn={auth.signInWithGoogle} onUpgrade={() => { setLimitOpen(false); setPricingOpen(true) }} />
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent className="sm:max-w-lg p-6"><DialogHeader><DialogTitle><span className="flex items-center gap-2"><BookOpen className="size-5 text-primary" />A little structure changes everything.</span></DialogTitle><DialogDescription>PromptCraft turns your brief into a reusable, structured prompt. It is a local template engine, not a connected AI model.</DialogDescription></DialogHeader><ol className="help-steps"><li><strong>01 · Start with your idea</strong><p>Describe the subject, audience, or outcome. Specifics are your superpower.</p></li><li><strong>02 · Find your direction</strong><p>Choose a category, engine, style, and detail level. Fine-tune with advanced options.</p></li><li><strong>03 · Make it happen</strong><p>Generate, copy, and paste your prompt into your favorite AI tool. Try a variant for a fresh approach.</p></li></ol><p className="text-xs text-muted-foreground">Prompt strength is a structural heuristic, not a prediction of model quality. Favorites and history reset when you reload; export TXT or JSON to keep your work.</p></DialogContent></Dialog>
    <Toaster theme="dark" position="bottom-right" richColors />
  </div>
}

export function PromptStudio() {
  return <AuthProvider><StudioInner /></AuthProvider>
}

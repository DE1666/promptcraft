'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, AudioLines, BookOpen, ChevronRight, CircleHelp, Command, History, Layers3, RotateCcw, Sparkles, WandSparkles, Zap } from 'lucide-react'
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

export function PromptStudio() {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [result, setResult] = useState<PromptResult | null>(initialResult)
  const [history, setHistory] = useState<PromptResult[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const request = useRef(0)
  const busy = useRef(false)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const cancelGeneration = () => { request.current++; if (timer.current) clearTimeout(timer.current); busy.current = false; setLoading(false) }
  const generate = (variant = 0, input = settings) => {
    if (!input.idea.trim() || busy.current) return
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
      toast.success(variant ? 'A fresh perspective, ready to explore.' : 'Your super-prompt is ready.')
    }, 650)
  }
  const selectCategory = (category: Category) => { cancelGeneration(); setSettings(settingsForCategory(category)) }
  const selectRecipe = (recipe: Recipe) => { cancelGeneration(); setSettings(settingsForRecipe(recipe)); toast.success(`“${recipe.title}” loaded. Make it yours.`); document.getElementById('studio-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const enhance = () => {
    const sample = recipes.find(recipe => recipe.category === settings.category)!
    if (!settings.idea.trim()) { setSettings({ ...settings, idea: sample.idea }); toast.success('A little inspiration to get you started.'); return }
    const detail = settings.category === 'visual' ? ' Use a strong focal point, layered depth, and an intentional color palette.' : settings.category === 'code' ? ' Prioritize responsive layouts, accessible interactions, and clear loading and error states.' : ' Focus on a specific audience, a tangible benefit, and a clear next step.'
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
  return <div className="app-shell">
    <a href="#studio-workspace" className="skip-link">Skip to prompt builder</a>
    <header className="site-header"><div className="header-inner"><a href="/" className="brand" aria-label="PromptCraft home"><span className="brand-logo"><AudioLines strokeWidth={2.5} /></span><span>promptcraft<span className="brand-period">.</span></span><Badge variant="outline">STUDIO</Badge></a><nav aria-label="Main navigation"><span className="nav-current"><WandSparkles className="size-4" />Prompt studio</span><Button variant="ghost" onClick={() => setTemplatesOpen(true)}><Layers3 data-icon="inline-start" />Templates</Button></nav><div className="header-right"><span className="local-indicator"><i />Made for your imagination</span><Button variant="outline" size="icon" className="help-button" aria-label="How PromptCraft works" onClick={() => setHelpOpen(true)}><CircleHelp /></Button></div></div></header>
    <main className="main-container"><div className="breadcrumb"><span>Workspace</span><ChevronRight className="size-3" /><span>Prompt studio</span></div>
      <section className="hero"><div><div className="hero-eyebrow"><Sparkles className="size-3.5" />LESS GUESSWORK. MORE POSSIBILITY.</div><h1>Your idea. <span>Supercharged.</span></h1><p>Turn a spark of inspiration into a prompt that gets it right.</p></div><div className="hero-aside"><div className="engine-stack"><span><Command /></span><span><AudioLines /></span><span><Zap /></span><span><Sparkles /></span></div><p>One studio. Endless possibilities.<br /><span>Built for your favorite AI engines.</span></p></div></section>
      <div className="workspace-toolbar" id="studio-workspace"><ToggleGroup className="category-switcher" value={[settings.category]} onValueChange={value => value.length > 0 && selectCategory(value[0] as Category)} aria-label="Prompt category" spacing={0}>{Object.entries(categories).map(([key, category]) => { const Icon = categoryIcons[key as Category]; return <ToggleGroupItem key={key} value={key}><Icon data-icon="inline-start" /><span>{category.label}</span></ToggleGroupItem> })}</ToggleGroup><div className="workspace-actions"><Button variant="ghost" size="sm" onClick={clear} aria-label="Clear canvas"><RotateCcw data-icon="inline-start" /><span>Clear canvas</span></Button><Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)} aria-label="View saved prompts and history"><History data-icon="inline-start" /><span>History{history.length ? ` (${history.length})` : ''}</span></Button><Button variant="outline" size="sm" className="pro-templates" onClick={() => setTemplatesOpen(true)}><Sparkles data-icon="inline-start" /><span>Pro templates</span></Button></div></div>
      <div className="studio-grid"><PromptBuilder settings={settings} onChange={setSettings} onGenerate={() => generate()} onEnhance={enhance} loading={loading} /><PromptOutput result={result} loading={loading} dirty={dirty} saved={!!result && favorites.includes(result.id)} onSave={save} onRegenerate={() => result && generate(result.variant + 1, result.settings)} /></div>
      <div className="workspace-footnote"><span><span className="mini-status-dot" /> Your creativity. A better starting point.</span><span>Crafted locally. No API key needed.<span className="footnote-divider">/</span>Session-only history</span></div>
      <TrendingRecipes onSelect={selectRecipe} onBrowse={() => setTemplatesOpen(true)} />
      <footer className="site-footer"><div className="footer-brand"><AudioLines className="size-4" /><span>A little craft goes a long way.</span></div><p>Made for the way you create.</p><button onClick={() => setHelpOpen(true)}>The art of a good prompt <ArrowUpRight className="size-3.5" /></button></footer>
    </main>
    <TemplateLibrary open={templatesOpen} onOpenChange={setTemplatesOpen} onSelect={selectRecipe} /><HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} history={history} favorites={favorites} onRestore={item => { cancelGeneration(); setSettings(item.settings); setResult(item) }} onDelete={id => { setHistory(items => items.filter(item => item.id !== id)); setFavorites(items => items.filter(item => item !== id)); toast('Prompt removed from history.') }} />
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent className="sm:max-w-lg p-6"><DialogHeader><DialogTitle><span className="flex items-center gap-2"><BookOpen className="size-5 text-primary" />A little structure changes everything.</span></DialogTitle><DialogDescription>PromptCraft turns your brief into a reusable, structured prompt. It is a local template engine, not a connected AI model.</DialogDescription></DialogHeader><ol className="help-steps"><li><strong>01 · Start with your idea</strong><p>Describe the subject, audience, or outcome. Specifics are your superpower.</p></li><li><strong>02 · Find your direction</strong><p>Choose a category, engine, style, and detail level. Fine-tune with advanced options.</p></li><li><strong>03 · Make it happen</strong><p>Generate, copy, and paste your prompt into your favorite AI tool. Try a variant for a fresh approach.</p></li></ol><p className="text-xs text-muted-foreground">Prompt strength is a structural heuristic, not a prediction of model quality. Favorites and history reset when you reload; export TXT or JSON to keep your work.</p></DialogContent></Dialog>
    <Toaster theme="dark" position="bottom-right" richColors />
  </div>
}

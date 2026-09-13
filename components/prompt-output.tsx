'use client'

import { useState } from 'react'
import { Bookmark, Check, ChevronDown, Copy, Download, FileJson, FileText, Lightbulb, Maximize2, RotateCw, Sparkles, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { exportPrompt, type PromptResult } from '@/lib/prompt-engine'
import { t, type Lang } from '@/lib/translations'
import { cn } from '@/lib/utils'

function PromptText({ text }: { text: string }) {
  return <div className="prompt-code">{text.split('\n\n').map((block, i) => { const [heading, ...lines] = block.split('\n'); return <div className="prompt-block" key={i}><div className="code-heading"><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{heading}</div><p>{lines.join('\n')}</p></div> })}</div>
}

export function PromptOutput({ result, loading, saved, dirty, onSave, onRegenerate, lang, onCopy }: { result: PromptResult | null; loading: boolean; saved: boolean; dirty: boolean; onSave: () => void; onRegenerate: () => void; lang: Lang; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const copy = async () => { if (!result) return; try { await navigator.clipboard.writeText(result.text); setCopied(true); toast.success('Prompt copied. Go create something great.'); setTimeout(() => setCopied(false), 2000); onCopy?.() } catch { toast.error('Clipboard access was blocked. Export your prompt as TXT instead.') } }
  return <section className="studio-panel output-panel" aria-labelledby="output-title" aria-busy={loading}>
    <div className="panel-heading"><div className="flex items-center gap-2.5"><Terminal className="size-4 text-muted-foreground" /><h2 id="output-title">{t(lang, 'output.title')}</h2></div><div className="flex items-center gap-2"><span className={cn('output-status', loading && 'is-loading')}><i />{loading ? t(lang, 'output.crafting') : result ? dirty ? t(lang, 'output.changes') : t(lang, 'output.ready') : t(lang, 'output.empty')}</span><Button variant="ghost" size="icon-xs" aria-label="Expand prompt" onClick={() => setExpanded(true)} disabled={!result}><Maximize2 /></Button></div></div>
    <div className="output-content"><div className="output-meta"><Badge variant="outline"><Sparkles data-icon="inline-start" />{result?.settings.engine ?? 'Your next great idea'}</Badge><span>{t(lang, 'output.structured').toUpperCase()} {result && <span className="version-label">v{result.variant + 1}.0</span>}</span></div>
      <div className={cn('code-window', loading && 'generating')} tabIndex={0} aria-label="Generated prompt text">{result ? <PromptText text={result.text} /> : <div className="output-empty"><Sparkles className="size-9" /><h3>{t(lang, 'output.emptyTitle')}</h3><p>{t(lang, 'output.emptyDesc')}</p></div>}</div>
      <div className="quality-row"><div className="quality-icon"><Sparkles className="size-4" /></div><div className="quality-label"><strong>{t(lang, 'output.strength')} <span title="Heuristic based on idea length, selected detail level, and options. Not a model-evaluated quality score.">ⓘ</span></strong><span>{result ? 'Clarity, context & creative direction' : 'Add context to make your idea stronger'}</span></div><div className="quality-score"><strong>{result?.score ?? '—'}<small>/100</small></strong><span>{result ? 'Well structured' : 'Awaiting prompt'}</span></div></div>
      <div className="strength-track"><div style={{ width: `${result?.score ?? 0}%` }} /></div>
      <div className="output-actions"><Button onClick={copy} disabled={!result || loading} className="copy-button flex-1 h-10">{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? t(lang, 'output.copied') : t(lang, 'output.copy')}</Button><Button variant="outline" size="icon" className="size-10" aria-label={saved ? 'Remove from favorites' : 'Save to favorites'} title={saved ? 'Remove from favorites' : 'Save to favorites'} disabled={!result || loading} onClick={onSave}><Bookmark className={cn(saved && 'fill-current')} /></Button><DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" className="h-10" disabled={!result || loading} />}><Download data-icon="inline-start" /><span className="export-label">{t(lang, 'output.export')}</span><ChevronDown data-icon="inline-end" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => result && exportPrompt(result, 'txt')}><FileText />Plain text (.txt)</DropdownMenuItem><DropdownMenuItem onClick={() => result && exportPrompt(result, 'json')}><FileJson />Structured JSON (.json)</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div>
      <div className="output-bottom"><Button variant="ghost" size="xs" onClick={onRegenerate} disabled={!result || loading}><RotateCw data-icon="inline-start" />{t(lang, 'output.regenerate')}</Button><span>{result ? `${result.text.trim().split(/\s+/).length} words · ~${Math.ceil(result.text.length / 4)} tokens` : 'Your words, amplified'}</span></div>
    </div><div className="output-tip"><Lightbulb className="size-4 shrink-0" /><p><strong>Pro tip:</strong> The more specific your idea, the more extraordinary your result.</p></div>
    <Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="sm:max-w-3xl p-6"><DialogHeader><DialogTitle>{t(lang, 'output.title')}</DialogTitle><DialogDescription>{result?.settings.engine} · Select the text or copy it below.</DialogDescription></DialogHeader><div className="max-h-[65vh] overflow-y-auto">{result && <PromptText text={result.text} />}</div><Button onClick={copy}><Copy data-icon="inline-start" />{t(lang, 'output.copy')}</Button></DialogContent></Dialog>
  </section>
}

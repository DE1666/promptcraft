'use client'

import { ArrowRight, ChevronDown, Info, LoaderCircle, SlidersHorizontal, Sparkles, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { categories, type Settings } from '@/lib/prompt-engine'

export function PromptBuilder({ settings, onChange, onGenerate, onEnhance, loading }: { settings: Settings; onChange: (settings: Settings) => void; onGenerate: () => void; onEnhance: () => void; loading: boolean }) {
  const config = categories[settings.category]
  const update = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })
  return <section className="studio-panel builder-panel" aria-labelledby="builder-title">
    <div className="panel-heading"><div className="flex items-center gap-2.5"><SlidersHorizontal className="size-4 text-muted-foreground" /><h2 id="builder-title">Prompt builder</h2></div><span className="step-label">01 <span>/ CREATE</span></span></div>
    <form onSubmit={(e) => { e.preventDefault(); onGenerate() }} className="builder-form">
      <FieldGroup className="gap-5">
        <Field>
          <div className="flex items-center justify-between"><FieldLabel htmlFor="idea">What do you want to create?</FieldLabel><span className="tiny-label">Start with a spark.</span></div>
          <div className="idea-container"><Textarea id="idea" maxLength={2000} value={settings.idea} onChange={(e) => update({ idea: e.target.value })} placeholder="An idea, a scene, a product. Let your imagination lead…" className="idea-textarea" onKeyDown={(e) => { if (e.nativeEvent.isComposing || e.keyCode === 229) return; if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onGenerate() } }} />
            <div className="idea-footer"><Button type="button" variant="ghost" size="xs" onClick={onEnhance}><WandSparkles data-icon="inline-start" />Magic enhance</Button><span>{settings.idea.length}<span className="text-muted-foreground"> / 2,000</span></span></div>
          </div>
        </Field>
        <FieldGroup className="engine-fields">
          <Field><FieldLabel htmlFor="engine">Target engine <Info className="size-3 text-muted-foreground" aria-hidden="true" /></FieldLabel><Select value={settings.engine} onValueChange={(value) => value && update({ engine: value })}><SelectTrigger id="engine" className="w-full h-10"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{config.engines.map(engine => <SelectItem key={engine} value={engine}>{engine}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
          <Field><FieldLabel htmlFor="style">Style & tone</FieldLabel><Select value={settings.style} onValueChange={(value) => value && update({ style: value })}><SelectTrigger id="style" className="w-full h-10"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{config.styles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
        </FieldGroup>
        <Field className="detail-field"><div className="flex items-center justify-between"><FieldLabel id="detail-label">Output detail</FieldLabel><Badge variant="secondary">{['Minimal', 'Standard', 'Comprehensive'][settings.detail]}</Badge></div><Slider aria-labelledby="detail-label" aria-valuetext={['Minimal', 'Standard', 'Comprehensive specification'][settings.detail]} value={[settings.detail]} min={0} max={2} step={1} onValueChange={(value) => update({ detail: Array.isArray(value) ? value[0] : value })} /><div className="slider-labels"><span>Minimal</span><span>Standard</span><span>Comprehensive</span></div></Field>
        <FieldSet className="advanced-fields"><FieldLegend variant="label"><span className="flex items-center gap-2"><ChevronDown className="size-3.5" />Advanced options <span className="tiny-label">Fine-tune your output</span></span></FieldLegend><div className="flag-options">{config.flags.map(flag => <Field key={flag} orientation="horizontal" className="w-auto gap-2"><Checkbox id={`flag-${flag.toLowerCase().replaceAll(' ', '-')}`} aria-label={flag} checked={settings.flags.includes(flag)} onCheckedChange={(checked) => update({ flags: checked ? [...settings.flags, flag] : settings.flags.filter(f => f !== flag) })} /><FieldLabel htmlFor={`flag-${flag.toLowerCase().replaceAll(' ', '-')}`}>{flag}</FieldLabel></Field>)}</div>
          {settings.category === 'visual' && settings.flags.includes('Aspect ratio') && <div className="ratio-row"><span>Aspect ratio</span><ToggleGroup aria-label="Aspect ratio" value={[settings.ratio]} onValueChange={(value) => value.length > 0 && update({ ratio: value[0] })} spacing={1} size="sm" variant="outline">{['1:1', '16:9', '9:16', '4:3'].map(ratio => <ToggleGroupItem key={ratio} value={ratio}>{ratio}</ToggleGroupItem>)}</ToggleGroup></div>}
          {settings.category === 'visual' && settings.flags.includes('Negative prompt') && <Field className="negative-field"><FieldLabel htmlFor="negative">Exclude from your image</FieldLabel><Input id="negative" value={settings.negative} onChange={(e) => update({ negative: e.target.value })} maxLength={500} placeholder="Blur, watermarks, unwanted details…" /></Field>}
        </FieldSet>
      </FieldGroup>
      <div className="generate-wrap"><Button type="submit" className="generate-button w-full h-12" disabled={!settings.idea.trim() || loading}>{loading ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Sparkles data-icon="inline-start" />}{loading ? 'Crafting your super-prompt…' : 'Generate super-prompt'}{!loading && <ArrowRight data-icon="inline-end" className="ml-auto" />}</Button><p><span className="inline-flex items-center gap-1"><Sparkles className="size-3" /> A little structure. A lot more possibility.</span><kbd>⌘ ↵</kbd></p></div>
    </form>
  </section>
}

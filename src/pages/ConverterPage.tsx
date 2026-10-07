import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { PAGE_META } from '@/lib/pageMeta'
import { usePageMeta } from '@/lib/usePageMeta'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import collections from '@/data/collections.json'
import { cn } from '@/lib/utils'
import { convertDecklist } from '@/lib/convertDecklist'
import type { Condition, ConvertDecklistResult, Language } from '@/lib/types'

const conditions: Condition[] = ['M', 'NM', 'SP', 'MP', 'HP', 'D']
const languages: Language[] = ['PTEN', 'PT', 'EN']

const conditionTitles: Record<Condition, string> = {
  M: 'Mint',
  NM: 'Near Mint',
  SP: 'Slightly Played',
  MP: 'Moderately Played',
  HP: 'Heavily Played',
  D: 'Damaged',
}

type PillClasses = { selected: string; unselected: string }

// Full class names so Tailwind can see them. Selected = solid fill with dark text, unselected = hollow outline.
const conditionPillClasses: Record<Condition, PillClasses> = {
  M: {
    selected: 'border-quality-mint bg-quality-mint text-surface-000',
    unselected: 'border-quality-mint bg-transparent text-quality-mint',
  },
  NM: {
    selected: 'border-quality-near-mint bg-quality-near-mint text-surface-000',
    unselected: 'border-quality-near-mint bg-transparent text-quality-near-mint',
  },
  SP: {
    selected: 'border-quality-slightly-played bg-quality-slightly-played text-surface-000',
    unselected: 'border-quality-slightly-played bg-transparent text-quality-slightly-played',
  },
  MP: {
    selected: 'border-quality-moderately-played bg-quality-moderately-played text-surface-000',
    unselected: 'border-quality-moderately-played bg-transparent text-quality-moderately-played',
  },
  HP: {
    selected: 'border-quality-heavily-played bg-quality-heavily-played text-surface-000',
    unselected: 'border-quality-heavily-played bg-transparent text-quality-heavily-played',
  },
  D: {
    selected: 'border-quality-damaged bg-quality-damaged text-surface-000',
    unselected: 'border-quality-damaged bg-transparent text-quality-damaged',
  },
}

const defaultPillClasses: PillClasses = {
  selected: 'border-secondary bg-secondary text-surface-000',
  unselected: 'border-border bg-transparent text-ink',
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  pillClassesFor,
  titleFor,
  pillClassName,
}: {
  label: string
  options: T[]
  value: T
  onChange: (value: T) => void
  pillClassesFor?: (option: T) => PillClasses
  titleFor?: (option: T) => string
  pillClassName?: string
}) {
  const labelId = useId()
  const optionRefs = useRef<(HTMLElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step === undefined) return

    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next])
    optionRefs.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-space-4">
      {/* Not <Label>: it renders a <label>, which is wrong for a radiogroup caption */}
      <span id={labelId} className="font-display text-h2 select-none">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-space-3">
        {options.map((option, index) => {
          const selected = option === value
          const classes = pillClassesFor ? pillClassesFor(option) : defaultPillClasses

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              title={titleFor?.(option)}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              className={cn(
                // h-9.5: 38px DS pill, above the 24px minimum target size (WCAG 2.5.8).
                // Unselected is a hollow outline, never reduced opacity (which would cut text contrast).
                'inline-flex h-9.5 cursor-pointer items-center justify-center rounded-md border-[1.5px] text-ui font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink-faint focus-visible:ring-offset-2 focus-visible:ring-offset-surface-000',
                pillClassName,
                selected ? classes.selected : classes.unselected,
              )}
              onClick={() => onChange(option)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MarketplaceResult({ title, text }: { title: string; text: string }) {
  const headingId = useId()
  const toast = useToast()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado')
    } catch {
      toast.error('Não foi possível copiar')
    }
  }

  return (
    <div className="flex flex-col gap-space-6">
      <div className="flex items-center justify-between">
        <h2 id={headingId} className="text-h2">
          {title}
        </h2>
        <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!text}>
          Copiar
        </Button>
      </div>
      <Textarea
        aria-labelledby={headingId}
        value={text}
        readOnly
        placeholder="O resultado aparecerá aqui…"
        className="h-55 resize-none overflow-y-auto p-space-7 leading-[1.7]"
      />
    </div>
  )
}

export default function ConverterPage() {
  usePageMeta(PAGE_META.converter)
  const unresolvedHeadingId = useId()
  const [decklistInput, setDecklistInput] = useState('')
  const [condition, setCondition] = useState<Condition>('NM')
  const [language, setLanguage] = useState<Language>('PTEN')
  const [result, setResult] = useState<ConvertDecklistResult | null>(null)

  function handleConvert() {
    setResult(convertDecklist(decklistInput, collections, condition, language))
  }

  return (
    <PageLayout
      title="Conversor"
      subtitle="Cole sua decklist e converta pro formato aceito pelas lojas parceiras."
    >
      <section className="grid items-start gap-[clamp(28px,4vw,48px)] md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
        <div className="flex flex-col gap-space-6">
          <Label htmlFor="decklist" className="font-display text-h2">
            Decklist
          </Label>
          <Textarea
            id="decklist"
            value={decklistInput}
            onChange={(event) => setDecklistInput(event.target.value)}
            placeholder="Cole sua decklist aqui…"
            className="h-65 resize-none overflow-y-auto p-space-7 leading-[1.7]"
          />
          <Button onClick={handleConvert} className="h-auto self-start px-6 py-space-4 text-body-strong">
            Converter
          </Button>
        </div>

        <div className="flex flex-col gap-space-10">
          <PillGroup
            label="Qualidade"
            options={conditions}
            value={condition}
            onChange={setCondition}
            pillClassesFor={(option) => conditionPillClasses[option]}
            titleFor={(option) => conditionTitles[option]}
            pillClassName="w-9.5"
          />
          <PillGroup
            label="Idioma"
            options={languages}
            value={language}
            onChange={setLanguage}
            pillClassName="px-3.5"
          />
        </div>
      </section>

      <section className="grid gap-space-10 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
        <MarketplaceResult title="Liga Pokemon" text={result?.ligaPokemon ?? ''} />
        <MarketplaceResult title="MYPCards" text={result?.mypCards ?? ''} />
      </section>

      {result && result.unresolvedCards.length > 0 && (
        <section
          aria-labelledby={unresolvedHeadingId}
          className="flex flex-col gap-space-6 rounded-2xl border border-danger bg-danger-tint p-space-8"
        >
          <h2 id={unresolvedHeadingId} className="text-h2 text-danger-soft">
            Cartas não resolvidas
          </h2>
          <ul className="flex flex-col gap-space-1 text-body">
            {result.unresolvedCards.map((card, index) => (
              <li key={index} className="text-ink-muted">
                <span className="font-mono text-ink">{card.line}</span> — {card.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageLayout>
  )
}

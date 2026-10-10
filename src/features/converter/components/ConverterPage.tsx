import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { PageLayout } from '@/shared/layout/PageLayout'
import { Button } from '@/shared/ui/Button'
import { Label } from '@/shared/ui/Label'
import { Textarea } from '@/shared/ui/Textarea'
import { useToast } from '@/shared/hooks/useToast'
import collections from '@/shared/data/collections.json'
import { cn } from '@/shared/lib/utils'
import { convertDecklist } from '@/features/converter/lib/convertDecklist'
import { CONDITIONS, LANGUAGES, type Condition, type ConvertDecklistResult, type Language } from '@/shared/types/domain'

// Tooltip and color tone of each quality. The tone names the `quality-<tone>` theme color.
const QUALITY: Record<Condition, { title: string; tone: string }> = {
  M: { title: 'Mint', tone: 'mint' },
  NM: { title: 'Near Mint', tone: 'near-mint' },
  SP: { title: 'Slightly Played', tone: 'slightly-played' },
  MP: { title: 'Moderately Played', tone: 'moderately-played' },
  HP: { title: 'Heavily Played', tone: 'heavily-played' },
  D: { title: 'Damaged', tone: 'damaged' },
}

type PillAppearance = { title?: string; tone?: string }

// Selected = solid fill with dark text, unselected = hollow outline. Tone classes are generated from the
// `@source inline` list in index.css, so the class names are built here and still reach Tailwind.
function toneClasses(tone: string | undefined, selected: boolean): string {
  if (!tone) {
    return selected ? 'border-secondary bg-secondary text-surface-000' : 'border-border bg-transparent text-ink'
  }
  return selected
    ? `border-quality-${tone} bg-quality-${tone} text-surface-000`
    : `border-quality-${tone} bg-transparent text-quality-${tone}`
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  appearance,
  pillClassName,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  /** Tooltip and tone per option. An option without an entry uses the brand color. */
  appearance?: Partial<Record<T, PillAppearance>>
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
          const look = appearance?.[option]

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              title={look?.title}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              className={cn(
                // h-9.5: 38px DS pill, above the 24px minimum target size (WCAG 2.5.8).
                // Unselected is a hollow outline, never reduced opacity (which would cut text contrast).
                'inline-flex h-9.5 cursor-pointer items-center justify-center rounded-md status-border text-ui font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink-faint focus-visible:ring-offset-2 focus-visible:ring-offset-surface-000',
                pillClassName,
                toneClasses(look?.tone, selected),
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
    <PageLayout title="Conversor" subtitle="Cole sua decklist e converta pro formato aceito pelas lojas parceiras.">
      {/* One-off values of this page, no tokens: the fluid column gap and the 260–360px side column from md. */}
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
            options={CONDITIONS}
            value={condition}
            onChange={setCondition}
            appearance={QUALITY}
            pillClassName="w-9.5"
          />
          <PillGroup
            label="Idioma"
            options={LANGUAGES}
            value={language}
            onChange={setLanguage}
            pillClassName="px-3.5"
          />
        </div>
      </section>

      <section className="grid gap-space-10 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
        <MarketplaceResult title="Liga Pokémon" text={result?.ligaPokemon ?? ''} />
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
                <span className="font-body text-ink">{card.line}</span> — {card.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageLayout>
  )
}

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
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

const conditionColorClasses: Record<Condition, string> = {
  M: 'bg-green-700 text-white',
  NM: 'bg-lime-700 text-white',
  SP: 'bg-yellow-700 text-white',
  MP: 'bg-amber-700 text-white',
  HP: 'bg-orange-700 text-white',
  D: 'bg-red-700 text-white',
}

const languageFlags: Record<Language, string> = {
  PT: '🇧🇷',
  EN: '🇺🇸',
  PTEN: '🇧🇷🇺🇸',
}

function BadgeGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  renderContent,
  classNameFor,
}: {
  label: string
  options: T[]
  value: T
  onChange: (value: T) => void
  renderContent?: (option: T) => ReactNode
  classNameFor?: (option: T, selected: boolean) => string
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
    <div className="flex flex-col gap-2">
      {/* Not <Label>: it renders a <label>, which is wrong for a radiogroup caption */}
      <span id={labelId} className="text-sm leading-none font-medium select-none">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const selected = option === value

          return (
            <Badge
              key={option}
              variant="ghost"
              render={
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                />
              }
              className={cn(
                'cursor-pointer border focus-visible:ring-ring',
                // Unselected is signalled by a neutral fill, never by opacity (which would cut text contrast).
                selected
                  ? cn('border-foreground', classNameFor ? classNameFor(option, selected) : 'bg-primary text-primary-foreground')
                  : 'border-control bg-muted text-foreground',
              )}
              onClick={() => onChange(option)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {renderContent ? renderContent(option) : option}
            </Badge>
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
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id={headingId} className="text-sm font-medium">
          {title}
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={handleCopy}
          disabled={!text}
        >
          Copiar
        </Button>
      </div>
      <Textarea
        aria-labelledby={headingId}
        value={text}
        readOnly
        className="h-48 resize-none overflow-y-auto"
      />
    </div>
  )
}

export default function ConverterPage() {
  usePageMeta(PAGE_META.converter)
  const [decklistInput, setDecklistInput] = useState('')
  const [condition, setCondition] = useState<Condition>('NM')
  const [language, setLanguage] = useState<Language>('PTEN')
  const [result, setResult] = useState<ConvertDecklistResult | null>(null)

  function handleConvert() {
    setResult(convertDecklist(decklistInput, collections, condition, language))
  }

  return (
    <PageLayout title="Conversor">
      <section className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="decklist">Decklist</Label>
          <Textarea
            id="decklist"
            value={decklistInput}
            onChange={(event) => setDecklistInput(event.target.value)}
            placeholder="3 Abra MEG 53"
            className="h-40 resize-none overflow-y-auto"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <BadgeGroup
            label="Qualidade"
            options={conditions}
            value={condition}
            onChange={setCondition}
            classNameFor={(option) => conditionColorClasses[option]}
          />
          <BadgeGroup
            label="Idioma"
            options={languages}
            value={language}
            onChange={setLanguage}
            renderContent={(option) => (
              <>
                <span aria-hidden="true">{languageFlags[option]}</span> {option}
              </>
            )}
          />
        </div>
      </section>

      <Button onClick={handleConvert} className="cursor-pointer self-start">
        Converter
      </Button>

      <section className="flex flex-col gap-6 md:flex-row">
        <MarketplaceResult title="Liga Pokemon" text={result?.ligaPokemon ?? ''} />
        <MarketplaceResult title="MYPCards" text={result?.mypCards ?? ''} />
      </section>

      {result && result.unresolvedCards.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-destructive">Cartas não resolvidas</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {result.unresolvedCards.map((card, index) => (
              <li key={index} className="text-muted-foreground">
                <span className="font-mono">{card.line}</span> — {card.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageLayout>
  )
}

import { useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import config from '@/data/config.json'
import { cn } from '@/lib/utils'
import { convertDecklist } from '@/lib/convertDecklist'
import type { AppConfig, Condition, ConvertDecklistResult, Language } from '@/lib/types'

const { collections, languages } = config as AppConfig

const conditions: Condition[] = ['M', 'NM', 'SP', 'MP', 'HP', 'D']

const conditionColorClasses: Record<Condition, string> = {
  M: 'bg-green-600 text-white',
  NM: 'bg-lime-600 text-white',
  SP: 'bg-yellow-500 text-black',
  MP: 'bg-amber-600 text-white',
  HP: 'bg-orange-600 text-white',
  D: 'bg-red-600 text-white',
}

const languageFlags: Record<Language, string> = {
  PT: '🇧🇷',
  EN: '🇺🇸',
  PTEN: '🇧🇷🇺🇸',
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
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
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value

          return (
            <Badge
              key={option}
              variant="ghost"
              className={cn(
                'cursor-pointer border',
                selected ? 'border-primary/40' : 'border-transparent opacity-60',
                classNameFor ? classNameFor(option, selected) : 'bg-muted text-foreground',
              )}
              onClick={() => onChange(option)}
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
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => copyToClipboard(text)}
          disabled={!text}
        >
          Copiar
        </Button>
      </div>
      <Textarea value={text} readOnly className="h-48 resize-none overflow-y-auto" />
    </div>
  )
}

export default function App() {
  const [decklistInput, setDecklistInput] = useState('')
  const [condition, setCondition] = useState<Condition>('NM')
  const [language, setLanguage] = useState<Language>('PTEN')
  const [result, setResult] = useState<ConvertDecklistResult | null>(null)

  function handleConvert() {
    setResult(convertDecklist(decklistInput, collections, condition, language))
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">tcg-mp-converter</h1>

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
              <span title={option}>
                {languageFlags[option]} {option}
              </span>
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
    </main>
  )
}

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import collections from '@/data/collections.json'
import { convertDecklist } from '@/lib/convertDecklist'
import type { Condition, ConvertDecklistResult, Language } from '@/lib/types'

const conditions: Condition[] = ['M', 'NM', 'SP', 'MP', 'HP', 'D']
const languages: Language[] = ['PTEN', 'PT', 'EN']

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

function MarketplaceResult({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)} disabled={!text}>
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

      <section className="flex flex-col gap-2">
        <Label htmlFor="decklist">Decklist</Label>
        <Textarea
          id="decklist"
          value={decklistInput}
          onChange={(event) => setDecklistInput(event.target.value)}
          placeholder="3 Abra MEG 53"
          className="h-40 resize-none overflow-y-auto"
        />
        <Button onClick={handleConvert} className="self-start">
          Converter
        </Button>
      </section>

      <section className="flex gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="condition">Qualidade</Label>
          <Select value={condition} onValueChange={(value) => setCondition(value as Condition)}>
            <SelectTrigger id="condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="language">Idioma</Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="flex gap-6">
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

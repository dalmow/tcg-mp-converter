import { useEffect, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import { Command, CommandItem, CommandList } from '@/shared/ui/Command'
import { Input } from '@/shared/ui/Input'
import type { CardSuggestion } from '@/features/decks/lib/rowLogic'

interface CardComboboxProps extends Omit<ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string
  suggestions: CardSuggestion[]
  onValueChange: (value: string) => void
  onPick: (suggestion: CardSuggestion) => void
}

/** Free-text input with a list of known cards. Typing stays valid; picking fills the whole text. */
export function CardCombobox({ value, suggestions, onValueChange, onPick, ...inputProps }: CardComboboxProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  // The option highlighted by cmdk, tracked so the input can point at it with aria-activedescendant.
  const [highlighted, setHighlighted] = useState('')
  const activeKey = suggestions.some((s) => s.key === highlighted) ? highlighted : suggestions[0]?.key
  const showList = open && suggestions.length > 0
  // cmdk generates the ids of its listbox and options; read them back for aria-controls / aria-activedescendant.
  const [ids, setIds] = useState<{ list?: string; active?: string }>({})
  const suggestionCount = suggestions.length
  const activeIndex = suggestions.findIndex((suggestion) => suggestion.key === activeKey)
  useEffect(() => {
    const element = root.current
    if (!showList || !element) return setIds({})
    setIds({
      list: element.querySelector('[role="listbox"]')?.id || undefined,
      active: element.querySelectorAll('[role="option"]')[activeIndex]?.id || undefined,
    })
    // Depends on the key, index and count, not on `suggestions`: that array is new on every render and would loop.
  }, [showList, activeKey, activeIndex, suggestionCount])

  return (
    <Command
      ref={root}
      shouldFilter={false}
      value={activeKey ?? ''}
      onValueChange={setHighlighted}
      className="relative size-auto overflow-visible rounded-none! bg-transparent p-0!"
    >
      <Input
        {...inputProps}
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? ids.list : undefined}
        aria-activedescendant={showList ? ids.active : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      />
      {/* Always mounted: a live region that appears already filled is often not announced. */}
      <span role="status" className="sr-only">
        {showList ? `${suggestionCount} ${suggestionCount === 1 ? 'sugestão' : 'sugestões'}` : ''}
      </span>
      {showList && (
        // Keeps focus on the input so the blur handler does not close the list before the pick.
        <CommandList
          className="absolute top-full z-20 mt-space-1 w-full rounded-lg border border-border-faint bg-surface-200 shadow-dropdown"
          onMouseDown={(event) => event.preventDefault()}
        >
          {suggestions.map((suggestion) => (
            <CommandItem
              key={suggestion.key}
              value={suggestion.key}
              onSelect={() => {
                onPick(suggestion)
                setOpen(false)
              }}
            >
              {suggestion.displayName}
            </CommandItem>
          ))}
        </CommandList>
      )}
    </Command>
  )
}

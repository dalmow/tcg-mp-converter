import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Command, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import type { CardSuggestion } from './rowLogic'

interface CardComboboxProps extends Omit<ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string
  suggestions: CardSuggestion[]
  onValueChange: (value: string) => void
  onPick: (suggestion: CardSuggestion) => void
}

/** Free-text input with a list of known cards. Typing stays valid; picking fills the whole text. */
export function CardCombobox({ value, suggestions, onValueChange, onPick, ...inputProps }: CardComboboxProps) {
  const [open, setOpen] = useState(false)
  const showList = open && suggestions.length > 0

  return (
    <Command shouldFilter={false} className="relative size-auto overflow-visible rounded-none! bg-transparent p-0">
      <Input
        {...inputProps}
        role="combobox"
        aria-expanded={showList}
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
      {showList && (
        // Keeps focus on the input so the blur handler does not close the list before the pick.
        <CommandList
          className="absolute top-full z-20 mt-1 w-full rounded-lg border border-panel-border bg-popover shadow-md"
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

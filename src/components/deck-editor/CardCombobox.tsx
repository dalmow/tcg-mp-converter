import { useEffect, useRef, useState } from 'react'
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
  const root = useRef<HTMLDivElement>(null)
  // cmdk generates the id of its listbox; read it back so the input can reference it with aria-controls.
  const [listId, setListId] = useState<string>()
  // The option highlighted by cmdk, tracked so the input can point at it with aria-activedescendant.
  const [highlighted, setHighlighted] = useState('')
  const activeKey = suggestions.some((s) => s.key === highlighted) ? highlighted : suggestions[0]?.key
  const showList = open && suggestions.length > 0
  const [activeId, setActiveId] = useState<string>()
  // cmdk generates the ids of its listbox and options; read them back for aria-controls / aria-activedescendant.
  useEffect(() => {
    const element = root.current
    setListId(showList ? (element?.querySelector('[role="listbox"]')?.id ?? undefined) : undefined)
    const index = suggestions.findIndex((suggestion) => suggestion.key === activeKey)
    setActiveId(showList ? element?.querySelectorAll('[role="option"]')[index]?.id : undefined)
  }, [showList, activeKey, suggestions])

  return (
    <Command
      ref={root}
      shouldFilter={false}
      value={activeKey ?? ''}
      onValueChange={setHighlighted}
      className="relative size-auto overflow-visible rounded-none! bg-transparent p-0"
    >
      <Input
        {...inputProps}
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-activedescendant={showList ? activeId : undefined}
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
        <span role="status" className="sr-only">
          {`${suggestions.length} ${suggestions.length === 1 ? 'sugestão' : 'sugestões'}`}
        </span>
      )}
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

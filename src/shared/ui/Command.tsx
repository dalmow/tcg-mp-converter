'use client'

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/shared/lib/utils'

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn('flex size-full flex-col overflow-hidden rounded-lg! bg-surface-200 p-space-1 text-ink', className)}
      {...props}
    />
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'no-scrollbar max-h-72 scroll-py-space-1 overflow-x-hidden overflow-y-auto outline-none',
        className,
      )}
      {...props}
    />
  )
}

function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-default items-center gap-space-3 rounded-sm px-space-3 py-space-2 text-body outline-hidden select-none data-selected:bg-secondary-tint-strong data-selected:text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  )
}

export { Command, CommandList, CommandItem }

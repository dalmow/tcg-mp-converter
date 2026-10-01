import { buttonVariants } from '@/components/ui/button'

export const navLinkClass = (isActive: boolean) =>
  buttonVariants({ variant: isActive ? 'secondary' : 'ghost' })

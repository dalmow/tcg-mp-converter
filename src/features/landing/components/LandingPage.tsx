import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Logomark } from '@/shared/ui/Logomark'
import { MAIN_CONTENT_ID } from '@/shared/layout/mainContent'
import { ConverterIcon, DecksIcon, MaintenanceIcon } from '@/shared/ui/NavIcons'
import { Panel } from '@/shared/ui/Panel'
import { buttonVariants } from '@/shared/ui/buttonVariants'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { SITE_NAME } from '@/shared/lib/site'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'

const SECTION_X = 'px-[clamp(20px,4vw,40px)]'
const CONTAINER = 'mx-auto max-w-[1240px]'

interface Feature {
  title: string
  description: string
  Icon: typeof DecksIcon
}

const FEATURES: Feature[] = [
  {
    title: 'Decks',
    description:
      'Organize suas 60 cartas por Pokémon, Treinador e Energia, com contagem automática pra fechar o deck certinho.',
    Icon: DecksIcon,
  },
  {
    title: 'Manutenção',
    description:
      'Veja o que ainda falta comprar, carta por carta, com base no que você já marcou como adquirido. Ah, e essas cartas são compartilhadas, então ao criar um novo deck, você já sabe o que tem comprado.',
    Icon: MaintenanceIcon,
  },
  {
    title: 'Conversor',
    description:
      'Converta sua lista pros formatos da Liga Pokémon e MYPCards, ajustando qualidade das cartas (M a D) e idioma.',
    Icon: ConverterIcon,
  },
]

function IllustrationLine({ width }: { width: string }) {
  return <div className="h-2 rounded-xs bg-border" style={{ width }} />
}

function IllustrationRow({ label, progress }: { label: string; progress: string }) {
  return (
    <div className="flex items-center justify-between text-caption text-ink-muted">
      <span>{label}</span>
      <span className="relative h-1 w-12 overflow-hidden rounded-pill bg-border">
        <span className="absolute inset-y-0 left-0 rounded-pill bg-secondary" style={{ width: progress }} />
      </span>
    </div>
  )
}

/* Illustration dimensions/offsets are one-off artwork values with no matching token. */
/** Decorative stacked cards: static markup with sample text, never real user data. */
function HeroIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[340px] w-full max-w-[380px]">
      <div className="absolute top-0 right-0 box-border w-[250px] rotate-4 rounded-2xl border border-primary/50 bg-surface-100 p-space-8 shadow-modal">
        <div className="mb-space-5 flex items-center justify-between">
          <span className="text-caption font-bold text-ink-muted">Liga Pokémon</span>
          <span className="rounded-pill border border-secondary-border-soft px-space-3 py-space-1 text-micro-label text-secondary">
            Copiar
          </span>
        </div>
        <div className="flex flex-col gap-space-2">
          <IllustrationLine width="92%" />
          <IllustrationLine width="78%" />
          <IllustrationLine width="85%" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 box-border w-[270px] -rotate-3 rounded-3xl border border-border bg-surface-200 p-space-9 shadow-modal">
        <div className="mb-space-6 flex items-center justify-between">
          <div className="flex items-center gap-space-3">
            <span className="size-2 rounded-pill bg-danger" />
            <span className="text-body-strong tracking-wide">ALAKAZAM</span>
          </div>
          <span className="text-caption text-ink-muted">60/60</span>
        </div>
        <div className="flex flex-col gap-space-4">
          <IllustrationRow label="4× Abra MEG 53" progress="50%" />
          <IllustrationRow label="4× Kadabra MEG 55" progress="25%" />
          <IllustrationRow label="4× Ordem da chefia" progress="0%" />
        </div>
        <div className="mt-space-6 border-t border-border-faint pt-space-5 text-caption font-semibold text-danger">
          faltam 57 cartas
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, Icon }: Feature) {
  return (
    <Panel className="gap-space-7 rounded-3xl bg-surface-100 p-space-10">
      <div className="flex size-11 items-center justify-center rounded-lg border border-secondary-border-soft bg-secondary-tint-strong text-secondary">
        <Icon size={22} />
      </div>
      <h3 className="text-modal-title">{title}</h3>
      <p className="text-body text-ink-muted">{description}</p>
    </Panel>
  )
}

function Section({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn(SECTION_X, className)}>{children}</section>
}

function Hero() {
  return (
    <Section className="pt-[clamp(56px,8vw,96px)] pb-[clamp(64px,8vw,96px)]">
      <div className={cn(CONTAINER, 'flex flex-wrap items-center gap-14')}>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-space-9">
          <span className="inline-flex self-start rounded-pill border border-secondary-border-soft bg-secondary-tint-strong px-space-5 py-space-2 text-ui text-secondary">
            Para jogadores de Pokémon TCG
          </span>
          <h1 className="font-display text-[length:clamp(34px,4.2vw,52px)] leading-[1.08] font-bold tracking-[-0.02em]">
            Monte, converta e mantenha em ordem seus decks favoritos
          </h1>
          <p className="max-w-[52ch] text-modal-title leading-[1.6] font-normal text-ink-muted">
            O PTCG Tools nasceu de um jogador para outros jogadores cansados do trabalho manual. Hoje você monta seus
            decks, converte a lista para o formato das lojas brasileiras — facilitando a compra — e mantém sob controle
            as cartas que já tem.
          </p>
        </div>
        <div className="flex min-w-0 flex-[1_1_380px] justify-center">
          <HeroIllustration />
        </div>
      </div>
    </Section>
  )
}

function ToolsSection() {
  return (
    <Section className="scroll-mt-[88px] pb-[clamp(72px,8vw,112px)]">
      <div className={CONTAINER}>
        <div className="mb-space-12 flex max-w-[560px] flex-col gap-space-5">
          <h2 className="font-display text-[length:clamp(24px,2.6vw,32px)] leading-[1.2] font-bold tracking-[-0.01em]">
            Várias ferramentas, um fluxo só
          </h2>
          <p className="text-h2 leading-[1.6] font-normal text-ink-muted">
            Cada parte do PTCG Tools resolve uma etapa de montar e manter seus decks físicos.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-space-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </Section>
  )
}

function ClosingCta() {
  return (
    <Section className="pb-[clamp(80px,9vw,120px)]">
      <div
        className={cn(
          CONTAINER,
          'relative flex flex-col items-center gap-space-8 overflow-hidden rounded-4xl border border-border bg-surface-100 p-[clamp(40px,6vw,64px)] text-center',
        )}
      >
        {/* Glow is a decorative one-off: size/offset have no token. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[120px] left-1/2 h-[280px] w-[480px] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--color-secondary-tint-strong),transparent)]"
        />
        <h2 className="relative max-w-[30ch] font-display text-[length:clamp(24px,3vw,34px)] leading-[1.2] font-bold">
          Pronto pro próximo torneio?
        </h2>
        <Link
          to={ROUTES.decks}
          className={cn(
            buttonVariants({ variant: 'primary' }),
            'relative h-auto gap-space-3 rounded-md px-space-10 py-space-6 text-h2',
          )}
        >
          Abrir meus decks
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </Section>
  )
}

function LandingFooter() {
  return (
    <footer className={cn('border-t border-border-faint py-space-10', SECTION_X)}>
      <div className={cn(CONTAINER, 'flex flex-wrap items-center justify-between gap-space-7')}>
        <div className="flex items-center gap-space-3 font-display text-wordmark">
          <Logomark size={20} />
          {SITE_NAME}
        </div>
        <span className="text-caption text-ink-faint">© 2026 dalm.dev</span>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  usePageMeta(PAGE_META.home)

  return (
    <>
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <ToolsSection />
        <ClosingCta />
      </main>
      <LandingFooter />
    </>
  )
}

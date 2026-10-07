import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Logomark } from '@/components/Logomark'
import { MAIN_CONTENT_ID } from '@/components/mainContent'
import { ConverterIcon, DecksIcon, MaintenanceIcon } from '@/components/navIcons'
import { Panel } from '@/components/Panel'
import { buttonVariants } from '@/components/ui/button'
import { PAGE_META } from '@/lib/pageMeta'
import { SITE_NAME } from '@/lib/site'
import { usePageMeta } from '@/lib/usePageMeta'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/routes'

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
    <div className="flex items-center justify-between text-[12px] text-ink-muted">
      <span>{label}</span>
      <span className="relative h-1 w-[46px] overflow-hidden rounded-pill bg-border">
        <span className="absolute inset-y-0 left-0 rounded-pill bg-secondary" style={{ width: progress }} />
      </span>
    </div>
  )
}

/** Decorative stacked cards: static markup with sample text, never real user data. */
function HeroIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[340px] w-full max-w-[380px]">
      <div className="absolute top-0 right-0 box-border w-[250px] rotate-[4deg] rounded-2xl border border-primary/50 bg-surface-100 p-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="mb-space-5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-ink-muted">Liga Pokémon</span>
          <span className="rounded-pill border border-secondary-border-soft px-2 py-[3px] text-micro-label text-secondary">
            Copiar
          </span>
        </div>
        <div className="flex flex-col gap-[7px]">
          <IllustrationLine width="92%" />
          <IllustrationLine width="78%" />
          <IllustrationLine width="85%" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 box-border w-[270px] -rotate-[3deg] rounded-3xl border border-border bg-surface-200 p-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <div className="mb-space-6 flex items-center justify-between">
          <div className="flex items-center gap-space-3">
            <span className="size-2 rounded-pill bg-danger" />
            <span className="text-body-strong tracking-[0.02em]">ALAKAZAM</span>
          </div>
          <span className="text-caption text-ink-muted">60/60</span>
        </div>
        <div className="flex flex-col gap-space-4">
          <IllustrationRow label="4× Abra MEG 53" progress="50%" />
          <IllustrationRow label="4× Kadabra MEG 55" progress="25%" />
          <IllustrationRow label="4× Ordem da chefia" progress="0%" />
        </div>
        <div className="mt-space-6 border-t border-border-faint pt-space-5 text-[12px] font-semibold text-danger">
          faltam 57 cartas
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, Icon }: Feature) {
  return (
    <Panel className="gap-space-7 rounded-3xl bg-surface-100 p-[28px]">
      <div className="flex size-11 items-center justify-center rounded-lg border border-secondary-border-soft bg-secondary-tint-strong text-secondary">
        <Icon size={22} />
      </div>
      <h3 className="text-[17px] font-bold">{title}</h3>
      <p className="text-body text-ink-muted">{description}</p>
    </Panel>
  )
}

function Section({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn(SECTION_X, className)}>{children}</section>
}

export default function LandingPage() {
  usePageMeta(PAGE_META.home)

  return (
    <>
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        <Section className="pt-[clamp(56px,8vw,96px)] pb-[clamp(64px,8vw,96px)]">
          <div className={cn(CONTAINER, 'flex flex-wrap items-center gap-14')}>
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-space-9">
              <span className="inline-flex self-start rounded-pill border border-secondary-border-soft bg-secondary-tint-strong px-space-5 py-space-2 text-[13px] font-semibold text-secondary">
                Para jogadores de Pokémon TCG
              </span>
              <h1 className="font-display text-[length:clamp(34px,4.2vw,52px)] leading-[1.08] font-bold tracking-[-0.02em]">
                Monte, converta e mantenha em ordem seus decks favoritos
              </h1>
              <p className="max-w-[52ch] text-[17px] leading-[1.6] text-ink-muted">
                O PTCG Tools nasceu de um jogador para outros jogadores cansados do trabalho manual. Hoje você monta
                seus decks, converte a lista para o formato das lojas brasileiras — facilitando a compra — e mantém
                sob controle as cartas que já tem.
              </p>
            </div>
            <div className="flex min-w-0 flex-[1_1_380px] justify-center">
              <HeroIllustration />
            </div>
          </div>
        </Section>

        <Section className="scroll-mt-[88px] pb-[clamp(72px,8vw,112px)]">
          <div className={CONTAINER}>
            <div className="mb-space-12 flex max-w-[560px] flex-col gap-space-5">
              <h2 className="font-display text-[length:clamp(24px,2.6vw,32px)] leading-[1.2] font-bold tracking-[-0.01em]">
                Várias ferramentas, um fluxo só
              </h2>
              <p className="text-[15px] leading-[1.6] text-ink-muted">
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

        <Section className="pb-[clamp(80px,9vw,120px)]">
          <div
            className={cn(
              CONTAINER,
              'relative flex flex-col items-center gap-space-8 overflow-hidden rounded-[24px] border border-border bg-surface-100 p-[clamp(40px,6vw,64px)] text-center',
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-[120px] left-1/2 h-[280px] w-[480px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(100,233,238,0.14),transparent)]"
            />
            <h2 className="relative max-w-[30ch] font-display text-[length:clamp(24px,3vw,34px)] leading-[1.2] font-bold">
              Pronto pro próximo torneio?
            </h2>
            <Link
              to={ROUTES.decks}
              className={cn(
                buttonVariants({ variant: 'primary' }),
                'relative h-auto gap-space-3 rounded-md px-[28px] py-space-6 text-[15px] font-bold',
              )}
            >
              Abrir meus decks
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </Section>
      </main>

      <footer className={cn('border-t border-border-faint py-space-10', SECTION_X)}>
        <div className={cn(CONTAINER, 'flex flex-wrap items-center justify-between gap-space-7')}>
          <div className="flex items-center gap-space-3 font-display text-[16px] font-bold">
            <Logomark size={20} />
            {SITE_NAME}
          </div>
          <span className="text-[12px] text-ink-faint">© 2026 dalm.dev</span>
        </div>
      </footer>
    </>
  )
}

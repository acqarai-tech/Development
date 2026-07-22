import {
  Calculator,
  Broadcast,
  MapTrifold,
  ChartLineUp,
  ArrowsLeftRight,
  Database,
  ChatCircleDots,
  ChartLine,
} from '@phosphor-icons/react'
import Reveal from './Reveal'

const CAPABILITIES = [
  {
    title: 'Instant Property Valuation',
    desc: 'RICS-aligned fair-price estimates for any Dubai property, backed by real comparables.',
    Icon: Calculator,
  },
  {
    title: 'Live Market Signals',
    desc: 'Continuous monitoring across multiple data sources, flagged by severity so nothing slips past you.',
    Icon: Broadcast,
  },
  {
    title: 'Area Intelligence',
    desc: 'Buy, Watch, or Hold scoring for every monitored area, updated continuously.',
    Icon: MapTrifold,
  },
  {
    title: 'Investment Analysis',
    desc: 'Rental yield, appreciation, and risk breakdowns for any property or area.',
    Icon: ChartLineUp,
  },
  {
    title: 'Off-Plan vs. Secondary',
    desc: 'See where the real opportunity is, whether a project is mid-payment-plan or already handed over.',
    Icon: ArrowsLeftRight,
  },
  {
    title: 'Real DLD Transaction Data',
    desc: '365K+ actual transactions across Dubai — not third-party estimates.',
    Icon: Database,
  },
  {
    title: 'Conversational AI Chat',
    desc: 'Ask in plain English, get a straight buy, sell, or invest answer.',
    Icon: ChatCircleDots,
  },
  {
    title: 'Price Forecasting',
    desc: '6-month and 3-year outlook models for any property or area.',
    Icon: ChartLine,
  },
]

export default function Capabilities() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <Reveal className="mx-auto max-w-[672px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark">
            What ACQAR can do
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">
            Everything under one AI agent.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c, i) => (
            <Reveal
              key={c.title}
              delay={Math.min(i * 60, 300)}
              className="group flex flex-col items-center rounded-[20px] border border-accent/20 bg-white px-6 py-7 text-center shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-white shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-110">
                <c.Icon weight="duotone" size={24} className="text-accent" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-[-0.02em] text-ink">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {c.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

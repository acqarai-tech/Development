import { useState } from 'react'
import { Sparkle, ArrowUp } from '@phosphor-icons/react'
import DeveloperMarquee from './DeveloperMarquee'
import Reveal from './Reveal'
import Plasma from './Plasma'
import TypingPlaceholder from './TypingPlaceholder'

export default function Hero() {
  const [query, setQuery] = useState('')

  return (
    <section className="grain relative overflow-hidden pt-24 pb-10 text-center">
      {/* Live moving background — WebGL plasma/fluid effect, tinted to brand copper, mouse-reactive */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 pointer-events-auto">
          <Plasma color="#b87333" speed={0.5} scale={1.3} opacity={0.16} mouseInteractive />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/60 to-cream" />
      </div>

      <div className="mx-auto max-w-[900px] px-6">
        <Reveal className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark shadow-xs backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          AI-Powered · Real-Time · Dubai Only
        </Reveal>

        <Reveal
          as="h1"
          delay={80}
          className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl md:text-[4.5rem]"
        >
          Real Estate AI Agent{' '}
          <span className="bg-gradient-to-r from-accent via-[#c98a4a] to-accent-dark bg-clip-text text-transparent">
            in Your Pocket.
          </span>
        </Reveal>

        <Reveal
          delay={160}
          className="mx-auto mt-6 max-w-[620px] text-base leading-relaxed text-muted sm:text-lg"
        >
          Ask ACQAR anything about a Dubai property and get a straight Buy, Sell, or
          Invest answer in 3 steps. Free for Dubai brokers.
        </Reveal>

        <Reveal delay={240} as="form" className="mx-auto mt-9 max-w-[640px]" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-2 rounded-full border border-line bg-white p-2 shadow-[var(--shadow-md)] transition-shadow focus-within:shadow-[var(--shadow-lg)]">
            <Sparkle weight="fill" size={18} className="ml-2 shrink-0 text-accent" />
            <div className="relative w-full">
              {query === '' && (
                <TypingPlaceholder
                  text="Is 3 bedroom townhouse a good investment in Damac Hills?"
                  mobileText="Fair price in Damac Hills?"
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate px-1 py-2.5 text-sm text-muted sm:text-base"
                />
              )}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent px-1 py-2.5 text-sm text-ink focus:outline-none sm:text-base"
              />
            </div>
            <button
              type="submit"
              aria-label="Ask ACQAR"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:brightness-105 active:scale-90"
            >
              <ArrowUp weight="bold" size={17} />
            </button>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <DeveloperMarquee />
        </Reveal>
      </div>
    </section>
  )
}

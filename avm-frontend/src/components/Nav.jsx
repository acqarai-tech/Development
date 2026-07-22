import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { List, X } from '@phosphor-icons/react'
import acqarLogo from '../assets/acqar-logo.webp'

function Logo() {
  return <img src={acqarLogo} alt="ACQAR" className="h-6 w-auto sm:h-7" />
}

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#for-brokers', label: 'For Brokers' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rowRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const update = () => setHeaderHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-cream/85 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? 'shadow-[var(--shadow-sm)]' : ''
      }`}
    >
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <div ref={rowRef} className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-ink/80 md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="cursor-pointer transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a href="#" className="hidden cursor-pointer text-sm text-ink/80 transition-colors hover:text-ink sm:inline">Log in</a>
            <a
              href="https://acqar.com"
              className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-95"
            >
              Get Free Access
            </a>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
              >
                {menuOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
              </button>
            </Dialog.Trigger>
          </div>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay
            className="nav-overlay fixed inset-x-0 bottom-0 z-40 bg-ink/20 md:hidden"
            style={{ top: headerHeight }}
          />
          <Dialog.Content
            className="nav-drawer fixed inset-x-0 z-50 border-t border-line bg-cream px-6 py-4 shadow-[var(--shadow-lg)] md:hidden"
            style={{ top: headerHeight }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
            <Dialog.Description className="sr-only">
              Links to jump to sections of the ACQAR landing page
            </Dialog.Description>
            <div className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <Dialog.Close key={l.href} asChild>
                  <a
                    href={l.href}
                    className="cursor-pointer rounded-lg px-2 py-3 text-base text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    {l.label}
                  </a>
                </Dialog.Close>
              ))}
              <Dialog.Close asChild>
                <a
                  href="https://beta.acqar.com/chat"
                  className="cursor-pointer rounded-lg px-2 py-3 text-base text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  Log in
                </a>
              </Dialog.Close>
              <a
                href="https://beta.acqar.com/chat"
                className="mt-2 cursor-pointer rounded-full bg-accent px-4 py-3 text-center text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all duration-200 active:scale-95"
              >
                Get Free Access
              </a>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  )
}

import { useEffect, useState } from 'react'

export default function TypingPlaceholder({ text, mobileText, speed = 45, startDelay = 400, className = '' }) {
  const [count, setCount] = useState(0)
  const [activeText, setActiveText] = useState(text)

  useEffect(() => {
    if (!mobileText) return
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setActiveText(mq.matches ? mobileText : text)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [text, mobileText])

  useEffect(() => {
    setCount(0)
    let tick

    const startTimer = setTimeout(() => {
      tick = setInterval(() => {
        setCount((c) => {
          if (c >= activeText.length) {
            clearInterval(tick)
            return c
          }
          return c + 1
        })
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      clearInterval(tick)
    }
  }, [activeText, speed, startDelay])

  return (
    <span className={className}>
      {activeText.slice(0, count)}
      <span className="typing-cursor" aria-hidden>|</span>
    </span>
  )
}

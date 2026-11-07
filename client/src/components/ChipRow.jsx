import { useState } from 'react'

export default function ChipRow({ chips, copyText }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="chip-row">
      {chips.map((chip, i) => (
        <button
          key={chip}
          type="button"
          className={i === 0 ? 'chip chip-primary' : 'chip'}
        >
          {chip}
        </button>
      ))}
      <button type="button" className="chip" onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

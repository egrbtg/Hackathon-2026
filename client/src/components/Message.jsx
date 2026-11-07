import ChipRow from './ChipRow'
import ResultsList from './ResultsList'

const EXAMPLE = 'TRN-042 swapped SFP, link up, no traffic'

export default function Message({ message, resultsProps, onExample }) {
  const { role, text, chips, kind, query } = message

  if (kind === 'results') {
    return (
      <div className="message message-bot message-wide">
        <ResultsList query={query} {...resultsProps} />
      </div>
    )
  }

  return (
    <div className={`message message-${role}`}>
      <p>{text}</p>
      {chips && <ChipRow chips={chips} copyText={text} />}
      {kind === 'welcome' && (
        <button type="button" className="example" onClick={() => onExample(EXAMPLE)}>
          Try: “{EXAMPLE}”
        </button>
      )}
    </div>
  )
}

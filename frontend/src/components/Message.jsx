import ChipRow from './ChipRow'

export default function Message({ message }) {
  const { role, text, chips } = message
  return (
    <div className={`message message-${role}`}>
      <p>{text}</p>
      {chips && <ChipRow chips={chips} copyText={text} />}
    </div>
  )
}

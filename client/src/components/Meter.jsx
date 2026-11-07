export default function Meter({ label, value }) {
  const pct = Math.round(value * 100)
  return (
    <span className="meter">
      <span className="meter-label">{label}</span>
      <span className="meter-track" aria-hidden="true">
        <span className="meter-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="meter-value">{pct}%</span>
    </span>
  )
}

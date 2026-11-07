const LABELS = {
  valid: 'Valid',
  outdated: 'Outdated',
  conflicting: 'Conflicting advice',
}

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>
}

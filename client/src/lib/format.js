const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso) {
  return iso ? dateFmt.format(new Date(iso)) : ''
}

const SOURCE_LABELS = { teams: 'Teams chat', email: 'Email', ticket: 'Ticket' }

export function sourceLabel(sourceType) {
  return SOURCE_LABELS[sourceType] ?? sourceType
}

/** "teams:thread-trn042:seq-8" -> "Teams chat · message 8" */
export function pointerLabel(pointer) {
  const seq = pointer.key.match(/:seq-(\d+)$/)
  const type = sourceLabel(pointer.sourceType)
  return seq ? `${type} · message ${seq[1]}` : type
}

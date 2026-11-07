import { useEffect, useRef } from 'react'
import { useSituationSearch, sortHits } from '../api/hooks'
import StatusBadge from './StatusBadge'
import Meter from './Meter'
import { Loading, LoadError } from './LoadState'

const SORTS = [
  ['score', 'Best match'],
  ['relevancy', 'Relevancy'],
  ['recency', 'Recency'],
]

export default function ResultsList({ query, sort, onSortChange, selectedId, onSelect }) {
  const search = useSituationSearch(query)
  const ref = useRef(null)

  // Bring results into view once they arrive
  useEffect(() => {
    if (search.isSuccess) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [search.isSuccess])

  if (search.isLoading) return <Loading>Searching past situations…</Loading>
  if (search.error) {
    return <LoadError what="results" error={search.error} onRetry={() => search.refetch()} />
  }

  const hits = sortHits(search.data?.results ?? [], sort)
  if (hits.length === 0) {
    return (
      <p>
        No similar situations found. Try adding the unit ID or what you've already tried.
      </p>
    )
  }

  return (
    <div ref={ref} className="results">
      <div className="results-head">
        <p>
          {hits.length} similar situation{hits.length === 1 ? '' : 's'}
        </p>
        <div className="segmented" role="group" aria-label="Sort by">
          {SORTS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => onSortChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ol className="hit-list">
        {hits.map((hit) => (
          <li key={hit.id}>
            <button
              type="button"
              className="hit"
              aria-current={hit.id === selectedId || undefined}
              onClick={() => onSelect(hit.id)}
            >
              <span className="hit-top">
                <span className="hit-id">{hit.id}</span>
                <StatusBadge status={hit.status} />
              </span>
              <span className="hit-summary">{hit.summary}</span>
              <span className="meters">
                <Meter label="Relevancy" value={hit.relevancy} />
                <Meter label="Recency" value={hit.recency} />
              </span>
              {hit.why?.length > 0 && (
                <span className="why">
                  {hit.why.map((w) => (
                    <span key={w} className="why-chip">
                      {w}
                    </span>
                  ))}
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

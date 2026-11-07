// Shared loading and error states for anything backed by a React Query hook.
export function Loading({ children }) {
  return (
    <p className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      {children}
    </p>
  )
}

export function LoadError({ what, error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p>
        Couldn't load {what}. {error?.message}
      </p>
      <button type="button" className="link-button" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}

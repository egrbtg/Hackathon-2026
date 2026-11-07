export default function ChatHeader({ title }) {
  return (
    <header className="chat-header">
      <span className="status-dot" aria-hidden="true" />
      <h1>{title}</h1>
    </header>
  )
}

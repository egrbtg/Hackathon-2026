import { useState } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import Composer from './Composer'

const SEED = [
  { id: 1, role: 'user', text: 'Placeholder...' },
  {
    id: 2,
    role: 'bot',
    text: 'Placeholder:',
    chips: ['Placeholder', 'Placeholder'],
  },
  { id: 3, role: 'bot', text: 'Placeholder...' },
]

export default function ChatWindow() {
  const [messages, setMessages] = useState(SEED)
  const [draft, setDraft] = useState('')

  function send() {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }])
    setDraft('')
  }

  return (
    <section className="chat" aria-label="Chat">
      <ChatHeader title="Placeholder" />
      <MessageList messages={messages} />
      <Composer value={draft} onChange={setDraft} onSend={send} />
    </section>
  )
}

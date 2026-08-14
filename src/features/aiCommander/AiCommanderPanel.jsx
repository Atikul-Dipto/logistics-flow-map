import { useState } from 'react'
import Drawer from '../../layout/Drawer'
import { useOps } from '../../context/OpsDataContext'
import { useToast } from '../../hooks/useToast'
import { matchQuestion } from './matchQuestion'
import { buildAnswer } from './answers'
import { Sparkle } from '../../icons'
import './AiCommanderPanel.css'

const CHIPS = [
  'Why are deliveries delayed today?',
  'Which hub is causing today’s delay?',
  'What’s driving SLA risk right now?',
  'Where is COD outstanding highest?',
  'Which carrier is underperforming?',
  'Summarize today’s network health.',
]

export default function AiCommanderPanel({ open, onClose }) {
  const { opsData, hubOps, exceptions, loading } = useOps()
  const toast = useToast()
  const [thread, setThread] = useState([])
  const [input, setInput] = useState('')

  const ask = (question) => {
    if (loading || !question.trim()) return
    const intentId = matchQuestion(question)
    const answer = buildAnswer(intentId, { opsData, hubOps, exceptions })
    setThread((prev) => [...prev, { question, answer }])
    setInput('')
  }

  return (
    <Drawer open={open} onClose={onClose} title="AI Logistics Commander" icon={<Sparkle className="icon" />} width={440}>
      <div className="ai-commander">
        <div className="ai-commander__badge">Simulated · grounded in live network data, not a live GPS feed</div>

        {thread.length === 0 && (
          <div className="ai-commander__chips">
            {CHIPS.map((c) => (
              <button key={c} className="ai-commander__chip" onClick={() => ask(c)} disabled={loading}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="ai-commander__thread">
          {thread.map((t, i) => (
            <div key={i} className="ai-commander__entry">
              <div className="ai-commander__question">{t.question}</div>
              <div className="ai-commander__answer">
                <p className="ai-commander__headline">{t.answer.headline}</p>
                {t.answer.bullets.length > 0 && (
                  <ul>
                    {t.answer.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
                {t.answer.actions.length > 0 && (
                  <div className="ai-commander__actions">
                    {t.answer.actions.map((a) => (
                      <button key={a} onClick={() => toast(`${a} — queued (Phase 2 workflow).`)}>
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          className="ai-commander__input-row"
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? 'Loading network data…' : 'Ask about delays, SLA risk, carriers, COD…'}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Ask
          </button>
        </form>
      </div>
    </Drawer>
  )
}

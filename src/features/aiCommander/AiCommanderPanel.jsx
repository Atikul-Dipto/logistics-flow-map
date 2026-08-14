import { useState } from 'react'
import { Link } from 'react-router-dom'
import Drawer from '../../layout/Drawer'
import { useOps } from '../../context/OpsDataContext'
import { useToast } from '../../hooks/useToast'
import { matchQuestion } from './matchQuestion'
import { buildAnswer } from './answers'
import { CHIPS } from './chips'
import { Sparkle } from '../../icons'
import './AiCommanderPanel.css'

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
        <Link to="/ai-intelligence" className="ai-commander__full-link" onClick={onClose}>
          Open full AI Intelligence — Q&amp;A history, what-if simulation, confirmable actions →
        </Link>

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
                      <button key={a} onClick={() => toast(`${a} — queued (simulated workflow).`)}>
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

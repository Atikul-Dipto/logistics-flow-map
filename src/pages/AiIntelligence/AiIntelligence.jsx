import { useMemo, useState } from 'react'
import { useOps } from '../../context/OpsDataContext'
import { useToast } from '../../hooks/useToast'
import { matchQuestion } from '../../features/aiCommander/matchQuestion'
import { buildAnswer } from '../../features/aiCommander/answers'
import { CHIPS } from '../../features/aiCommander/chips'
import { LiveTracking, Sparkle } from '../../icons'
import '../shared.css'
import './AiIntelligence.css'

export default function AiIntelligence() {
  const { opsData, hubOps, exceptions, loading } = useOps()
  const toast = useToast()

  const [thread, setThread] = useState([])
  const [input, setInput] = useState('')
  const [weatherSlider, setWeatherSlider] = useState(0)
  const [carrierSlider, setCarrierSlider] = useState(0)
  const [resolvedIds, setResolvedIds] = useState(new Set())

  const ask = (question) => {
    if (loading || !question.trim()) return
    const intentId = matchQuestion(question)
    const answer = buildAnswer(intentId, { opsData, hubOps, exceptions })
    setThread((prev) => [...prev, { question, answer }])
    setInput('')
  }

  const simulation = useMemo(() => {
    if (!opsData || !hubOps.length) return null
    const totalShipments = opsData.total_shipments
    const networkOnTime = opsData.hub_stats.reduce((s, h) => s + h.on_time_rate * h.shipment_count, 0) / totalShipments
    const totalSlaRisk = hubOps.reduce((s, h) => s + h.slaRiskCount, 0)

    const weatherEntry = opsData.network_delay_reasons.breakdown.find((b) => b.reason === 'Weather disruption')
    const weatherReduced = weatherEntry ? Math.round(weatherEntry.count * (weatherSlider / 100)) : 0
    const onTimeGainFromWeather = weatherReduced / totalShipments

    const sorted = [...opsData.carrier_stats].sort((a, b) => a.on_time_rate - b.on_time_rate)
    const worst = sorted[0]
    const best = sorted[sorted.length - 1]
    const shiftedVolume = worst ? Math.round(worst.shipment_count * (carrierSlider / 100)) : 0
    const onTimeGainFromCarrier = worst && best ? (shiftedVolume * (best.on_time_rate - worst.on_time_rate)) / totalShipments : 0

    const projectedOnTime = Math.min(0.99, networkOnTime + onTimeGainFromWeather + onTimeGainFromCarrier)
    const slaRiskReduction = Math.round(totalSlaRisk * ((onTimeGainFromWeather + onTimeGainFromCarrier) / Math.max(0.01, 1 - networkOnTime)))
    const projectedSlaRisk = Math.max(0, totalSlaRisk - slaRiskReduction)

    return {
      baselineOnTime: networkOnTime,
      projectedOnTime,
      baselineSlaRisk: totalSlaRisk,
      projectedSlaRisk,
      weatherReduced,
      shiftedVolume,
      worst,
      best,
    }
  }, [opsData, hubOps, weatherSlider, carrierSlider])

  const openExceptions = exceptions.filter((e) => !resolvedIds.has(e.id))

  const resolve = (id, verb) => {
    setResolvedIds((prev) => new Set(prev).add(id))
    toast(`${verb} — ${id.replace('hub-', '')} (simulated workflow).`)
  }

  if (loading || !opsData) {
    return (
      <div className="module-page module-page--loading">
        <LiveTracking className="icon icon--pulse" />
        <p>Loading AI intelligence…</p>
      </div>
    )
  }

  return (
    <div className="module-page">
      <div className="module-page__header">
        <div>
          <h1>AI Intelligence</h1>
          <p className="module-page__subtitle">Natural-language network Q&amp;A, what-if simulation, and confirmable AI-recommended actions.</p>
        </div>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Ask the network</div>
        <p className="module-page__panel-caption">Simulated · answers are computed live from real network aggregates, not a hosted LLM.</p>

        {thread.length === 0 && (
          <div className="ai-page__chips">
            {CHIPS.map((c) => (
              <button key={c} className="ai-page__chip" onClick={() => ask(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {thread.length > 0 && (
          <div className="ai-page__thread">
            {thread.map((t, i) => (
              <div key={i} className="ai-page__entry">
                <div className="ai-page__question">
                  <Sparkle className="icon" /> {t.question}
                </div>
                <div className="ai-page__answer">
                  <p className="ai-page__headline">{t.answer.headline}</p>
                  {t.answer.bullets.length > 0 && (
                    <ul>
                      {t.answer.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <form
          className="ai-page__input-row"
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about delays, SLA risk, carriers, COD…" />
          <button type="submit" disabled={!input.trim()}>
            Ask
          </button>
        </form>
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">What-if simulation</div>
        <p className="module-page__panel-caption">Illustrative client-side projection, not a live optimizer — recomputed instantly from real network aggregates as you move the sliders.</p>

        <div className="ai-page__sliders">
          <label className="ai-page__slider">
            <div className="ai-page__slider-label">
              <span>Reduce weather-related delay</span>
              <strong>{weatherSlider}%</strong>
            </div>
            <input type="range" min={0} max={50} value={weatherSlider} onChange={(e) => setWeatherSlider(Number(e.target.value))} />
          </label>
          <label className="ai-page__slider">
            <div className="ai-page__slider-label">
              <span>
                Shift volume: {simulation?.worst?.carrier ?? '—'} → {simulation?.best?.carrier ?? '—'}
              </span>
              <strong>{carrierSlider}%</strong>
            </div>
            <input type="range" min={0} max={30} value={carrierSlider} onChange={(e) => setCarrierSlider(Number(e.target.value))} />
          </label>
        </div>

        {simulation && (
          <div className="ai-page__projection">
            <div className="ai-page__projection-card">
              <div className="ai-page__projection-label">Network on-time rate</div>
              <div className="ai-page__projection-values">
                <span className="ai-page__projection-before">{Math.round(simulation.baselineOnTime * 100)}%</span>
                <span className="ai-page__projection-arrow">→</span>
                <span className="ai-page__projection-after">{Math.round(simulation.projectedOnTime * 100)}%</span>
              </div>
            </div>
            <div className="ai-page__projection-card">
              <div className="ai-page__projection-label">Shipments at SLA risk</div>
              <div className="ai-page__projection-values">
                <span className="ai-page__projection-before">{simulation.baselineSlaRisk.toLocaleString()}</span>
                <span className="ai-page__projection-arrow">→</span>
                <span className="ai-page__projection-after">{simulation.projectedSlaRisk.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="module-page__panel">
        <div className="module-page__panel-title">Recommended actions</div>
        <p className="module-page__panel-caption">Computed live from real network aggregates. Confirm to queue, or dismiss.</p>

        <div className="ai-page__actions-list">
          {openExceptions.length === 0 && <div className="ai-page__actions-empty">All recommendations resolved.</div>}
          {openExceptions.map((e) => (
            <div key={e.id} className={`ai-page__action-card ai-page__action-card--${e.severity}`}>
              <div className="ai-page__action-headline">{e.headline}</div>
              <div className="ai-page__action-cause">{e.cause}</div>
              <div className="ai-page__action-buttons">
                <button type="button" className="ai-page__confirm" onClick={() => resolve(e.id, 'Confirmed')}>
                  Confirm {e.actions[0]}
                </button>
                <button type="button" className="ai-page__dismiss" onClick={() => resolve(e.id, 'Dismissed')}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const USER_ID = 'default'

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  )
}

function PurposeRow({ name, data }: { name: string; data: any }) {
  const hitRate = data.calls > 0 ? Math.round(data.cache_hits / data.calls * 100) : 0
  return (
    <div style={styles.row}>
      <span style={{ flex: 2, fontFamily: 'monospace', fontSize: 13 }}>{name}</span>
      <span style={styles.cell}>{data.calls}</span>
      <span style={styles.cell}>{data.input_tokens + data.output_tokens}</span>
      <span style={{ ...styles.cell, color: hitRate > 0 ? '#4caf50' : '#aaa' }}>{hitRate}%</span>
      <span style={{ ...styles.cell, color: data.cost > 0 ? '#ff9800' : '#aaa' }}>
        ${data.cost.toFixed(5)}
      </span>
    </div>
  )
}

export function LLMStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getLLMStats(USER_ID).then(setStats).catch(() => setStats(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.center}>Loading cost stats…</div>
  if (!stats) return (
    <div style={styles.center}>
      <p style={{ color: '#aaa' }}>No LLM call data yet. Complete a learning session first.</p>
      <button style={styles.btn} onClick={() => navigate('/')}>Back to Dashboard</button>
    </div>
  )

  const { summary, by_purpose, by_model, recent } = stats

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/')}>← Dashboard</button>

      {/* Summary */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>LLM COST GOVERNANCE</div>
        <div style={styles.statGrid}>
          <StatBox label="Total Calls" value={summary.total_calls} />
          <StatBox label="Cache Hit Rate" value={`${summary.cache_hit_rate}%`} sub={`${summary.cache_hits} hits`} />
          <StatBox label="Total Spend" value={`$${summary.total_cost_usd.toFixed(4)}`} />
          <StatBox label="Input Tokens" value={summary.total_input_tokens.toLocaleString()} />
          <StatBox label="Output Tokens" value={summary.total_output_tokens.toLocaleString()} />
          <StatBox label="Failures" value={summary.failures} sub={summary.failures > 0 ? 'check logs' : 'all good'} />
        </div>
      </div>

      {/* By purpose */}
      {Object.keys(by_purpose).length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>CALLS BY PURPOSE</div>
          <div style={{ ...styles.row, color: '#aaa', fontSize: 12, marginBottom: 8 }}>
            <span style={{ flex: 2 }}>Purpose</span>
            <span style={styles.cell}>Calls</span>
            <span style={styles.cell}>Tokens</span>
            <span style={styles.cell}>Cache %</span>
            <span style={styles.cell}>Cost</span>
          </div>
          {Object.entries(by_purpose)
            .sort(([, a]: any, [, b]: any) => b.cost - a.cost)
            .map(([name, data]) => (
              <PurposeRow key={name} name={name} data={data} />
            ))}
        </div>
      )}

      {/* By model */}
      {Object.keys(by_model).length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>MODEL ROUTING</div>
          {Object.entries(by_model)
            .sort(([, a]: any, [, b]: any) => b.cost - a.cost)
            .map(([model, data]: any) => (
              <div key={model} style={styles.row}>
                <span style={{ flex: 2, fontFamily: 'monospace', fontSize: 13 }}>{model}</span>
                <span style={styles.cell}>{data.calls} calls</span>
                <span style={{ ...styles.cell, color: '#ff9800' }}>${data.cost.toFixed(5)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Recent calls */}
      {recent?.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>RECENT CALLS</div>
          {recent.map((c: any, i: number) => (
            <div key={i} style={{ ...styles.row, flexWrap: 'wrap', gap: 4, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #2a2a3a' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#4f8ef7', flex: '1 1 120px' }}>{c.purpose}</span>
              <span style={{ fontSize: 12, color: '#aaa', flex: '1 1 140px' }}>{c.model}</span>
              <span style={{ fontSize: 12, flex: '0 0 auto' }}>
                {c.cache_hit
                  ? <span style={{ color: '#4caf50' }}>● cache</span>
                  : <span style={{ color: '#aaa' }}>○ live</span>}
              </span>
              <span style={{ fontSize: 12, color: '#aaa', flex: '0 0 auto' }}>{c.input_tokens}↑ {c.output_tokens}↓ tokens</span>
              <span style={{ fontSize: 12, color: c.estimated_cost > 0 ? '#ff9800' : '#aaa', flex: '0 0 auto' }}>
                ${(c.estimated_cost ?? 0).toFixed(5)}
              </span>
              <span style={{ fontSize: 12, color: '#aaa', flex: '0 0 auto' }}>{c.latency_ms}ms</span>
              <span style={{ fontSize: 12, flex: '0 0 auto' }}>
                {c.success ? <span style={{ color: '#4caf50' }}>✓</span> : <span style={{ color: '#f44336' }}>✗</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Policy reminder */}
      <div style={{ ...styles.card, fontSize: 13, color: '#aaa', lineHeight: 1.8 }}>
        <div style={styles.sectionTitle}>CALL POLICY</div>
        <div>✓ Dashboard, profile, next-action — <span style={{ color: '#4caf50' }}>zero LLM calls</span></div>
        <div>✓ Lessons cached for 24h — regenerated only when learner state materially changes</div>
        <div>✓ Evaluations always fresh — never cached</div>
        <div>✓ Simple tasks (evaluate, reteach) routed to faster/cheaper model</div>
        <div>✓ Daily budget cap: <span style={{ color: '#ff9800' }}>${summary.total_cost_usd.toFixed(4)} / $0.50</span></div>
        <div>✓ Max retries per call: 2 with exponential backoff</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 720, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 16 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  statBox: { background: '#0e0e1a', borderRadius: 8, padding: '14px 16px', textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: 700, color: '#4f8ef7', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#aaa', letterSpacing: 0.5 },
  statSub: { fontSize: 11, color: '#666', marginTop: 2 },
  row: { display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #1e1e2e' },
  cell: { flex: 1, textAlign: 'right' as const, fontSize: 13 },
  btn: { background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  back: { background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'block' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
}

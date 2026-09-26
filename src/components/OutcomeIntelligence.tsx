import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const USER_ID = 'default'

const INTERVENTION_LABELS: Record<string, string> = {
  learn: 'Initial Learning',
  practice: 'Practice',
  reteach: 'Re-teaching',
  prerequisite: 'Prerequisite Strengthening',
  challenge: 'Challenge Problem',
  review: 'Spaced Review',
  assess: 'Assessment',
}

const INTERVENTION_ICONS: Record<string, string> = {
  learn: '🔵', practice: '🟡', reteach: '🔄',
  prerequisite: '🔴', challenge: '⚡', review: '🟣', assess: '📋',
}

function SuccessBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? '#4caf50' : rate >= 40 ? '#ff9800' : '#f44336'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: '#2a2a3a', borderRadius: 4, height: 6 }}>
        <div style={{ width: `${rate}%`, background: color, height: 6, borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 13, color, fontWeight: 600, minWidth: 36 }}>{rate}%</span>
    </div>
  )
}

export function OutcomeIntelligence() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getOutcomes(USER_ID).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.center}>Loading outcome data…</div>

  const interventions: any[] = data?.interventions ?? []
  const best: string | null = data?.best_intervention ?? null

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/')}>← Dashboard</button>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>OUTCOME INTELLIGENCE</div>
        <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
          Which interventions are actually working for you? Based on your personal history of
          learner state → intervention → mastery change.
        </p>
        {best && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#0a2a10', border: '1px solid #4caf5033', borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: '#4caf50', fontWeight: 700 }}>
              ✓ Most effective for you: {INTERVENTION_LABELS[best] ?? best}
            </span>
          </div>
        )}
      </div>

      {interventions.length > 0 ? (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>INTERVENTION EFFECTIVENESS</div>

          {/* Header */}
          <div style={{ ...styles.row, color: '#aaa', fontSize: 12, marginBottom: 8, borderBottom: 'none' }}>
            <span style={{ flex: 3 }}>Intervention</span>
            <span style={{ flex: 1, textAlign: 'right' as const }}>Count</span>
            <span style={{ flex: 1, textAlign: 'right' as const }}>Avg Δ</span>
            <span style={{ flex: 2, textAlign: 'right' as const }}>Success Rate</span>
          </div>

          {interventions.map((item: any) => (
            <div key={item.intervention_type} style={styles.row}>
              <span style={{ flex: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{INTERVENTION_ICONS[item.intervention_type] ?? '⚙️'}</span>
                <span style={{ fontSize: 14 }}>{INTERVENTION_LABELS[item.intervention_type] ?? item.intervention_type}</span>
                {item.intervention_type === best && (
                  <span style={{ fontSize: 11, color: '#4caf50', fontWeight: 700 }}>BEST</span>
                )}
              </span>
              <span style={{ flex: 1, textAlign: 'right' as const, fontSize: 13, color: '#aaa' }}>{item.count}</span>
              <span style={{
                flex: 1, textAlign: 'right' as const, fontSize: 13, fontWeight: 600,
                color: item.avg_score_delta >= 0 ? '#4caf50' : '#f44336',
              }}>
                {item.avg_score_delta >= 0 ? '+' : ''}{item.avg_score_delta}%
              </span>
              <div style={{ flex: 2, paddingLeft: 16 }}>
                <SuccessBar rate={item.success_rate} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...styles.card, color: '#aaa', fontSize: 14, textAlign: 'center', padding: 40 }}>
          No outcome data yet. Complete more learning sessions to build your intervention history.
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.sectionTitle}>HOW THIS WORKS</div>
        <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.8 }}>
          <div>Every time you complete an evaluation, the system records:</div>
          <div style={{ margin: '8px 0 8px 16px' }}>
            Learner State → Intervention Type → Mastery Change
          </div>
          <div>Over time this builds a personal record of which interventions produce the best outcomes for you specifically — not for an average learner.</div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 16 },
  row: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e1e2e' },
  back: { background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'block' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
}

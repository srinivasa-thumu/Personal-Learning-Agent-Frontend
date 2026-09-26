import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const USER_ID = 'default'

function DecayBar({ current, decayed }: { current: number; decayed: number }) {
  const lost = current - decayed
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 3 }}>
        <span>Mastery</span>
        <span style={{ color: lost > 0 ? '#f44336' : '#4caf50' }}>
          {Math.round(decayed)}% {lost > 0 ? `(−${Math.round(lost)}% decay)` : ''}
        </span>
      </div>
      <div style={{ background: '#2a2a3a', borderRadius: 4, height: 6, position: 'relative' }}>
        <div style={{ width: `${Math.min(100, decayed)}%`, background: '#4f8ef7', height: 6, borderRadius: 4 }} />
        {lost > 0 && (
          <div style={{
            position: 'absolute', top: 0, left: `${Math.min(100, decayed)}%`,
            width: `${Math.min(100 - decayed, lost)}%`,
            background: '#f4433644', height: 6,
          }} />
        )}
      </div>
    </div>
  )
}

export function ReviewSchedule() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.getReviewSchedule(USER_ID).then(setData).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRecall = async (scheduleId: string, planId: string, nodeId: string) => {
    navigate(`/learn/${planId}/${nodeId}`)
  }

  const handleQuickRecall = async (scheduleId: string, score: number) => {
    setCompleting(scheduleId)
    try {
      await api.completeReview({ schedule_id: scheduleId, recall_score: score })
      load()
    } finally {
      setCompleting(null)
    }
  }

  if (loading) return <div style={styles.center}>Loading review schedule…</div>

  const due = data?.due ?? []
  const upcoming = data?.upcoming ?? []

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/')}>← Dashboard</button>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={styles.sectionTitle}>SPACED REVIEW</div>
          {due.length > 0 && (
            <span style={{ background: '#f4433622', color: '#f44336', border: '1px solid #f4433644', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
              {due.length} due
            </span>
          )}
        </div>
        <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>
          Spaced repetition schedules recall tests to prevent knowledge decay.
          Each successful review extends the next interval.
        </p>
      </div>

      {/* Due now */}
      {due.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>DUE NOW</div>
          {due.map((r: any) => (
            <div key={r.schedule_id} style={styles.reviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.node_name}</div>
                  <div style={{ fontSize: 12, color: r.days_overdue > 0 ? '#f44336' : '#ff9800' }}>
                    {r.days_overdue > 0 ? `${r.days_overdue} day${r.days_overdue > 1 ? 's' : ''} overdue` : 'Due today'}
                    {' · '} Rep #{r.repetitions} · EF {r.ease_factor}
                  </div>
                </div>
                <button
                  style={styles.reviewBtn}
                  onClick={() => handleRecall(r.schedule_id, r.plan_id, r.node_id)}
                >
                  Start Review
                </button>
              </div>
              <DecayBar current={r.current_mastery} decayed={r.decayed_mastery} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>Quick recall:</span>
                {[100, 80, 60].map(score => (
                  <button
                    key={score}
                    disabled={completing === r.schedule_id}
                    style={{
                      ...styles.quickBtn,
                      background: score >= 75 ? '#0a2a10' : '#2a1010',
                      color: score >= 75 ? '#4caf50' : '#f44336',
                      border: `1px solid ${score >= 75 ? '#4caf5033' : '#f4433633'}`,
                    }}
                    onClick={() => handleQuickRecall(r.schedule_id, score)}
                  >
                    {score}%
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {due.length === 0 && (
        <div style={{ ...styles.card, textAlign: 'center', color: '#4caf50', padding: 32 }}>
          ✓ No reviews due right now. Great work staying on top of it!
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>UPCOMING (NEXT 7 DAYS)</div>
          {upcoming.map((r: any) => (
            <div key={r.schedule_id} style={styles.upcomingRow}>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{r.node_name}</span>
                <span style={{ color: '#aaa', fontSize: 13, marginLeft: 12 }}>
                  in {r.days_until_due === 0 ? 'today' : `${r.days_until_due} day${r.days_until_due > 1 ? 's' : ''}`}
                </span>
              </div>
              <span style={{ fontSize: 13, color: '#4f8ef7' }}>{Math.round(r.current_mastery)}% mastery</span>
            </div>
          ))}
        </div>
      )}

      {due.length === 0 && upcoming.length === 0 && (
        <div style={{ ...styles.card, color: '#aaa', fontSize: 14 }}>
          No reviews scheduled yet. Master a topic to start building your review schedule.
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 0 },
  reviewCard: { background: '#0e0e1a', borderRadius: 8, padding: 16, marginBottom: 12 },
  upcomingRow: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2a2a3a' },
  reviewBtn: { background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const },
  quickBtn: { borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  back: { background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'block' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
}

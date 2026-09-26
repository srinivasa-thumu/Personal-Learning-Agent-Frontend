import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { MasteryBar } from './MasteryBar'

const USER_ID = 'default'

const TRAJECTORY_COLOR: Record<string, string> = {
  improving: '#4caf50',
  declining: '#f44336',
  stable: '#aaa',
}

const TRAJECTORY_ICON: Record<string, string> = {
  improving: '↗',
  declining: '↘',
  stable: '→',
}

function Sparkline({ history }: { history: { date: string; mastery: number }[] }) {
  if (history.length < 2) return <div style={{ color: '#aaa', fontSize: 13 }}>Not enough data yet.</div>

  const w = 320
  const h = 60
  const pad = 8
  const max = Math.max(...history.map(p => p.mastery), 100)
  const min = 0
  const xStep = (w - pad * 2) / (history.length - 1)

  const points = history.map((p, i) => ({
    x: pad + i * xStep,
    y: h - pad - ((p.mastery - min) / (max - min)) * (h - pad * 2),
  }))

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <path d={d} fill="none" stroke="#4f8ef7" strokeWidth={2} strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#4f8ef7" />
      ))}
    </svg>
  )
}

export function ProfileDetail() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getProfile(USER_ID).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.center}>Loading learner profile…</div>
  if (!profile) return (
    <div style={styles.center}>
      <p style={{ color: '#aaa' }}>No profile found. Complete a learning session first.</p>
      <button style={styles.btn} onClick={() => navigate('/')}>Back to Dashboard</button>
    </div>
  )

  const traj = profile.learning_trajectory ?? 'stable'
  const history: { date: string; mastery: number }[] = profile.trajectory_history ?? []

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/')}>← Dashboard</button>

      {/* Header */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>LEARNER PROFILE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4f8ef7' }}>
            {Math.round(profile.concept_mastery ?? 0)}%
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: TRAJECTORY_COLOR[traj], fontSize: 18, fontWeight: 600 }}>
              {TRAJECTORY_ICON[traj]} {traj.charAt(0).toUpperCase() + traj.slice(1)}
            </div>
            <div style={{ color: '#aaa', fontSize: 12 }}>Trajectory</div>
          </div>
        </div>
        <div style={{ color: '#aaa', fontSize: 13 }}>
          Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : '—'}
        </div>
      </div>

      {/* Dimensions */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>DIMENSIONS</div>
        <MasteryBar label="Concept Mastery" value={profile.concept_mastery ?? 0} />
        <MasteryBar label="Problem Solving" value={profile.problem_solving_score ?? 0} color="#9c27b0" />
        <MasteryBar label="Retention" value={profile.retention_score ?? 0} color="#00bcd4" />
        <MasteryBar label="Consistency" value={profile.consistency_score ?? 0} color="#ff9800" />
        <MasteryBar label="Learning Speed" value={profile.speed_score ?? 0} color="#4caf50" />
        <MasteryBar label="Exam Strategy" value={profile.exam_strategy_score ?? 0} color="#f44336" />
      </div>

      {/* Trajectory History */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>MASTERY TRAJECTORY</div>
        {history.length > 0 ? (
          <>
            <Sparkline history={history} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {history.slice(-4).map((h, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 12, color: '#aaa' }}>
                  <div style={{ color: '#e8e8f0', fontWeight: 600 }}>{Math.round(h.mastery)}%</div>
                  <div>{new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: '#aaa', fontSize: 13 }}>Complete more sessions to see your trajectory.</div>
        )}
      </div>

      {/* Error Patterns */}
      {(profile.error_patterns?.length > 0) && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>ERROR PATTERNS</div>
          {profile.error_patterns.map((e: string, i: number) => (
            <div key={i} style={styles.patternRow}>
              <span style={{ color: '#f44336' }}>×</span>
              <span style={{ flex: 1, marginLeft: 12 }}>{e}</span>
              <span style={{ color: '#aaa', fontSize: 12 }}>Recurring</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#1e1e2e', borderRadius: 8, fontSize: 13, color: '#aaa' }}>
            Recommended: Review the first pattern before attempting the next assessment.
          </div>
        </div>
      )}

      {/* Misconceptions */}
      {(profile.misconceptions?.length > 0) && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>MISCONCEPTIONS</div>
          {profile.misconceptions.map((m: string, i: number) => (
            <div key={i} style={styles.patternRow}>
              <span style={{ color: '#ff9800' }}>⚠</span>
              <span style={{ flex: 1, marginLeft: 12 }}>{m}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {(profile.strengths?.length > 0) && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>STRENGTHS</div>
            {profile.strengths.map((s: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#4caf50', marginBottom: 6 }}>✓ {s}</div>
            ))}
          </div>
        )}
        {(profile.weaknesses?.length > 0) && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>WEAKNESSES</div>
            {profile.weaknesses.map((w: string, i: number) => (
              <div key={i} style={{ fontSize: 13, color: '#f44336', marginBottom: 6 }}>× {w}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 16 },
  patternRow: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2a2a3a', fontSize: 14 },
  btn: { background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' },
  back: { background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'block' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
}

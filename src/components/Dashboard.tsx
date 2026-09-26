import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { MasteryBar } from './MasteryBar'
import { DirectionBadge } from './DirectionBadge'

const USER_ID = 'default'

const STATUS_ICON: Record<string, string> = {
  not_started: '⚪',
  learning: '🔵',
  strengthening: '🟡',
  gap: '🔴',
  mastered: '🟢',
  review_due: '🟣',
  paused: '⚫',
}

export function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [nextAction, setNextAction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getDashboard(USER_ID).then(d => {
      setData(d)
      if (d?.plan?.id) {
        api.getNextAction(d.plan.id, USER_ID).then(setNextAction).catch(() => {})
      }
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.center}>Loading your learning report…</div>

  if (!data?.plan) {
    return (
      <div style={styles.center}>
        <h2>Welcome to your Personal Learning Agent</h2>
        <p style={{ color: '#aaa', marginBottom: 24 }}>You haven't started a learning journey yet.</p>
        <button style={styles.btn} onClick={() => navigate('/new')}>
          Create my learning journey
        </button>
      </div>
    )
  }

  const { plan, current_node, nodes, profile, recent_sessions, recommendation } = data
  const reviewDueCount: number = data.review_due_count ?? 0
  const trajectory = plan.trajectory === 'improving' ? '↗ Improving' : plan.trajectory === 'declining' ? '↘ Declining' : '→ Stable'

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>YOUR LEARNING REPORT</div>
            <div style={styles.subtitle}>{plan.skill} &nbsp;·&nbsp; {plan.starting_level} → {plan.target_level}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.bigNum}>{Math.round(plan.overall_mastery)}%</div>
            <div style={{ color: '#aaa', fontSize: 13 }}>Overall Mastery</div>
            {reviewDueCount > 0 && (
              <button
                style={{ marginTop: 6, background: '#f4433622', color: '#f44336', border: '1px solid #f4433644', borderRadius: 10, padding: '2px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                onClick={() => navigate('/reviews')}
              >
                🟣 {reviewDueCount} review{reviewDueCount > 1 ? 's' : ''} due
              </button>
            )}
          </div>
        </div>

        <div style={styles.row}>
          <span style={{ color: '#aaa' }}>Trajectory</span>
          <span style={{ color: plan.trajectory === 'improving' ? '#4caf50' : '#aaa' }}>{trajectory}</span>
          <span style={{ color: '#aaa', marginLeft: 24 }}>Confidence</span>
          <span>{Math.round(plan.confidence ?? 0)}%</span>
        </div>
      </div>

      {/* Current Status */}
      {current_node && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>CURRENT STATUS</div>
          <DirectionBadge action={nextAction?.action ?? recommendation.action ?? 'learn'} />
          <div style={{ fontSize: 18, marginBottom: 6 }}>
            {STATUS_ICON[current_node.status] ?? '🔵'} {current_node.name}
          </div>
          <div style={{ color: '#aaa', marginBottom: 12 }}>Mastery: {Math.round(current_node.mastery)}%</div>
          <MasteryBar label="" value={current_node.mastery} />

          {/* Recent scores */}
          {nextAction?.recent_scores?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 4 }}>
              {nextAction.recent_scores.map((s: number, i: number) => (
                <span key={i} style={{
                  fontSize: 12, padding: '2px 8px', borderRadius: 4,
                  background: s >= 75 ? '#0a2a10' : '#2a1010',
                  color: s >= 75 ? '#4caf50' : '#f44336',
                  border: `1px solid ${s >= 75 ? '#4caf5033' : '#f4433633'}`,
                }}>
                  {Math.round(s)}%
                </span>
              ))}
              <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>recent scores</span>
            </div>
          )}

          <div style={{ marginTop: 16, padding: '12px 16px', background: '#1e1e2e', borderRadius: 8 }}>
            <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>Why this next?</div>
            <div>{nextAction?.reason ?? recommendation.reason}</div>
            {recommendation.why && <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{recommendation.why}</div>}
          </div>
          <button
            style={{ ...styles.btn, marginTop: 16 }}
            onClick={() => navigate(`/learn/${plan.id}/${current_node.id}`)}
          >
            CONTINUE LEARNING
          </button>
        </div>
      )}

      {/* Learning Outcome Graph */}
      {nodes.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>LEARNING OUTCOME GRAPH</div>
          {nodes.map((n: any) => (
            <MasteryBar key={n.id} label={n.name} value={n.mastery} color={n.mastery >= 75 ? '#4caf50' : n.mastery >= 50 ? '#ff9800' : '#4f8ef7'} />
          ))}
        </div>
      )}

      {/* Learner Profile */}
      {profile && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={styles.sectionTitle}>LEARNER PROFILE</div>
            <button
              style={{ background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 13, cursor: 'pointer', padding: 0 }}
              onClick={() => navigate('/profile')}
            >
              View Details →
            </button>
          </div>
          <MasteryBar label="Concept Mastery" value={profile.concept_mastery ?? 0} />
          <MasteryBar label="Problem Solving" value={profile.problem_solving_score ?? 0} />
          <MasteryBar label="Retention" value={profile.retention_score ?? 0} />
          <MasteryBar label="Consistency" value={profile.consistency_score ?? 0} />
          <MasteryBar label="Learning Speed" value={profile.speed_score ?? 0} />
          {profile.error_patterns?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: '#aaa', fontSize: 13, marginBottom: 6 }}>Error Patterns</div>
              {profile.error_patterns.map((e: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: '#ff9800', marginBottom: 2 }}>× {e}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {recent_sessions.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>RECENT ACTIVITY</div>
          {recent_sessions.map((s: any) => (
            <div key={s.id} style={styles.sessionRow}>
              <span style={{ color: '#aaa', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</span>
              <span style={{ flex: 1, marginLeft: 16 }}>{s.session_type}</span>
              {s.score != null && <span style={{ color: s.score >= 75 ? '#4caf50' : '#ff9800' }}>{Math.round(s.score)}% {s.score >= 75 ? '✓' : '❌'}</span>}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#aaa' }} onClick={() => navigate('/new')}>
          + New Journey
        </button>
        <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#aaa' }} onClick={() => navigate('/reviews')}>
          🟣 Reviews
        </button>
        <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#aaa' }} onClick={() => navigate('/sources')}>
          📎 Sources
        </button>
        <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#aaa' }} onClick={() => navigate('/rules')}>
          ⚙️ Rules
        </button>
        <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#aaa' }} onClick={() => navigate('/outcomes')}>
          📊 Outcomes
        </button>
        <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #444', color: '#aaa' }} onClick={() => navigate('/stats')}>
          💰 LLM Stats
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 4 },
  subtitle: { color: '#aaa', fontSize: 14 },
  bigNum: { fontSize: 36, fontWeight: 700, color: '#4f8ef7' },
  row: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 16 },
  btn: { background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' },
  sessionRow: { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #2a2a3a', fontSize: 14 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 24 },
}

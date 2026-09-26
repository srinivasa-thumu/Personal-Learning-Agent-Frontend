import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'

type Phase = 'loading' | 'teach' | 'answer' | 'result'

export function LearnSession() {
  const { planId, nodeId } = useParams<{ planId: string; nodeId: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [teaching, setTeaching] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<any>(null)
  const [startTime, setStartTime] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!planId || !nodeId) return
    api.teach(planId, nodeId, 'default')
      .then(data => { setTeaching(data); setPhase('teach'); setStartTime(Date.now()) })
      .catch(e => setError(e.message))
  }, [planId, nodeId])

  const submit = async () => {
    if (!answer.trim()) return
    setPhase('loading')
    try {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      const res = await api.evaluate({ plan_id: planId!, node_id: nodeId!, answer, time_taken_seconds: elapsed })
      setResult(res)
      setPhase('result')
    } catch (e: any) {
      setError(e.message)
      setPhase('answer')
    }
  }

  const handleNext = () => {
    if (result?.next_node_id) {
      navigate(`/learn/${planId}/${result.next_node_id}`)
    } else {
      navigate('/')
    }
  }

  if (error) return <div style={styles.center}><div style={{ color: '#f44' }}>{error}</div><button style={styles.btn} onClick={() => navigate('/')}>Back to Dashboard</button></div>
  if (phase === 'loading') return <div style={styles.center}>Loading…</div>

  return (
    <div style={styles.page}>
      {phase === 'teach' && teaching && (
        <div style={styles.card}>
          <div style={styles.tag}>LESSON</div>
          <h2 style={{ marginTop: 8 }}>{teaching.node?.name}</h2>
          <p>{teaching.lesson}</p>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Mental Model</div>
            <p style={{ color: '#ccc' }}>{teaching.mental_model}</p>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionLabel}>Example</div>
            <p style={{ color: '#ccc' }}>{teaching.example}</p>
          </div>

          {teaching.common_mistakes?.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Common Mistakes</div>
              {teaching.common_mistakes.map((m: string, i: number) => (
                <div key={i} style={{ color: '#ff9800', fontSize: 14, marginBottom: 4 }}>⚠ {m}</div>
              ))}
            </div>
          )}

          <button style={styles.btn} onClick={() => setPhase('answer')}>I'm ready to answer</button>
        </div>
      )}

      {phase === 'answer' && teaching && (
        <div style={styles.card}>
          <div style={styles.tag}>CHECK FOR UNDERSTANDING</div>
          <h3 style={{ marginTop: 8 }}>{teaching.question}</h3>
          <textarea
            style={styles.textarea}
            placeholder="Type your answer here…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={6}
          />
          <button style={styles.btn} onClick={submit} disabled={!answer.trim()}>Submit Answer</button>
        </div>
      )}

      {phase === 'result' && result && (
        <div style={styles.card}>
          <div style={styles.tag}>EVALUATION</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: result.score >= 75 ? '#4caf50' : '#ff9800', margin: '16px 0' }}>
            {Math.round(result.score)}%
          </div>

          {result.strengths?.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Strengths</div>
              {result.strengths.map((s: string, i: number) => <div key={i} style={{ color: '#4caf50', fontSize: 14, marginBottom: 4 }}>✓ {s}</div>)}
            </div>
          )}

          {result.weaknesses?.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Weaknesses</div>
              {result.weaknesses.map((w: string, i: number) => <div key={i} style={{ color: '#f44336', fontSize: 14, marginBottom: 4 }}>× {w}</div>)}
            </div>
          )}

          <div style={{ ...styles.section, background: '#1e1e2e', borderRadius: 8, padding: 16 }}>
            <div style={styles.sectionLabel}>Feedback</div>
            <p style={{ margin: 0 }}>{result.feedback}</p>
          </div>

          <div style={{ ...styles.section, background: '#1e1e2e', borderRadius: 8, padding: 16 }}>
            <div style={styles.sectionLabel}>Why this next?</div>
            <p style={{ margin: 0, color: '#aaa' }}>{result.reason}</p>
          </div>

          <button style={styles.btn} onClick={handleNext}>
            {result.next_node_id ? 'Continue to Next Topic →' : 'Back to Dashboard'}
          </button>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 28 },
  tag: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#4f8ef7' },
  section: { marginTop: 20 },
  sectionLabel: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 8 },
  textarea: { width: '100%', background: '#0e0e1a', border: '1px solid #2a2a3a', borderRadius: 8, padding: 12, color: '#fff', fontSize: 15, resize: 'vertical', boxSizing: 'border-box' },
  btn: { marginTop: 20, width: '100%', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
}

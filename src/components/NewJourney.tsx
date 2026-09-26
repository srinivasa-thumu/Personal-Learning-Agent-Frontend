import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const LEVELS = ['Beginner', 'Basic', 'Intermediate', 'Proficient', 'Advanced', 'Expert']
const STYLES = ['Balanced', 'Practical / application-oriented', 'Theory-first', 'Visual / diagram-heavy']

export function NewJourney() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    skill: '',
    starting_level: 'Basic',
    target_level: 'Proficient',
    target_date: '',
    preferred_style: 'Balanced',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.skill.trim()) { setError('Please enter what you want to learn.'); return }
    setLoading(true)
    setError('')
    try {
      await api.createPlan({ user_id: 'default', ...form })
      navigate('/')
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0, marginBottom: 24 }}>Personal Learning Agent</h2>
        <label style={styles.label}>What do you want to learn?</label>
        <input
          style={styles.input}
          placeholder="e.g. System Design, Python, Machine Learning…"
          value={form.skill}
          onChange={e => set('skill', e.target.value)}
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Current level</label>
            <select style={styles.input} value={form.starting_level} onChange={e => set('starting_level', e.target.value)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Target level</label>
            <select style={styles.input} value={form.target_level} onChange={e => set('target_level', e.target.value)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <label style={styles.label}>Target date (optional)</label>
        <input style={styles.input} placeholder="e.g. 6 months, 2025-12-01" value={form.target_date} onChange={e => set('target_date', e.target.value)} />

        <label style={styles.label}>Preferred learning style</label>
        <select style={styles.input} value={form.preferred_style} onChange={e => set('preferred_style', e.target.value)}>
          {STYLES.map(s => <option key={s}>{s}</option>)}
        </select>

        {error && <div style={{ color: '#f44', marginBottom: 12, fontSize: 14 }}>{error}</div>}

        <button style={styles.btn} onClick={submit} disabled={loading}>
          {loading ? 'Creating your journey…' : 'Create my learning journey'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 520, margin: '40px auto', padding: '0 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 32 },
  label: { display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6, marginTop: 16 },
  input: { width: '100%', background: '#0e0e1a', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 15, boxSizing: 'border-box' },
  row: { display: 'flex', gap: 16 },
  btn: { marginTop: 24, width: '100%', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
}

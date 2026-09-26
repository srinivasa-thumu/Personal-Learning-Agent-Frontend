import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const USER_ID = 'default'

const QUALITY_COLOR: Record<string, string> = {
  high: '#4caf50', medium: '#ff9800', low: '#f44336',
}

function AnalysisCard({ analysis }: { analysis: any }) {
  if (!analysis || !analysis.summary) return null
  return (
    <div style={styles.analysisBox}>
      <div style={styles.sectionLabel}>ANALYSIS</div>
      <p style={{ margin: '0 0 12px', color: '#ccc' }}>{analysis.summary}</p>

      {analysis.relevant_topics?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={styles.sectionLabel}>RELEVANT TO YOUR PLAN</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {analysis.relevant_topics.map((t: string, i: number) => (
              <span key={i} style={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {analysis.new_concepts?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={styles.sectionLabel}>NEW CONCEPTS FOUND</div>
          {analysis.new_concepts.map((c: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: '#4f8ef7', marginBottom: 3 }}>+ {c}</div>
          ))}
        </div>
      )}

      {analysis.misconceptions_found?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={styles.sectionLabel}>POTENTIAL ISSUES IN DOCUMENT</div>
          {analysis.misconceptions_found.map((m: string, i: number) => (
            <div key={i} style={{ fontSize: 13, color: '#f44336', marginBottom: 3 }}>⚠ {m}</div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, padding: '10px 14px', background: '#0e0e1a', borderRadius: 8 }}>
        <div style={styles.sectionLabel}>RECOMMENDED ACTION</div>
        <div style={{ fontSize: 13, color: '#ccc' }}>{analysis.recommended_action}</div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={styles.sectionLabel}>QUALITY</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: QUALITY_COLOR[analysis.quality] ?? '#aaa' }}>
          {(analysis.quality ?? 'unknown').toUpperCase()}
        </span>
      </div>
    </div>
  )
}

export function SourceIngestion() {
  const [sources, setSources] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.listPlans(USER_ID).then(p => {
      setPlans(p)
      if (p.length > 0) setSelectedPlan(p[0].id)
    })
    api.listSources(USER_ID).then(setSources)
  }, [])

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('Please select a file.'); return }
    if (!selectedPlan) { setError('Please select a learning plan.'); return }
    setError('')
    setUploading(true)
    try {
      const result = await api.ingestSource(file, selectedPlan, USER_ID)
      setSources(prev => [result, ...prev])
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: any) {
      setError(e.message ?? 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/')}>← Dashboard</button>

      {/* Upload */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>EXTERNAL LEARNING SOURCES</div>
        <p style={{ color: '#aaa', fontSize: 13, marginBottom: 20 }}>
          Upload PDFs, notes, or mock tests. The agent will analyse them against your learning plan
          and identify what's relevant, what's new, and any issues.
        </p>

        <label style={styles.label}>Learning Plan</label>
        <select
          style={styles.input}
          value={selectedPlan}
          onChange={e => setSelectedPlan(e.target.value)}
        >
          {plans.map(p => <option key={p.id} value={p.id}>{p.skill} ({p.starting_level} → {p.target_level})</option>)}
        </select>

        <label style={styles.label}>File (PDF, TXT, MD — max 10MB)</label>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md" style={styles.input} />

        {error && <div style={{ color: '#f44', fontSize: 13, marginTop: 8 }}>{error}</div>}

        <button style={styles.btn} onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Analysing…' : 'Upload & Analyse'}
        </button>
      </div>

      {/* Source list */}
      {sources.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>INGESTED SOURCES</div>
          {sources.map((s: any) => (
            <div key={s.id} style={styles.sourceRow}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{s.filename}</span>
                  <span style={{ marginLeft: 10, fontSize: 12, color: '#aaa', textTransform: 'uppercase' }}>{s.source_type}</span>
                  {s.analysis?.quality && (
                    <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: QUALITY_COLOR[s.analysis.quality] ?? '#aaa' }}>
                      {s.analysis.quality}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{new Date(s.created_at).toLocaleDateString()}</span>
                  <span style={{ color: '#4f8ef7', fontSize: 13 }}>{expanded === s.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expanded === s.id && <AnalysisCard analysis={s.analysis} />}
            </div>
          ))}
        </div>
      )}

      {sources.length === 0 && (
        <div style={{ ...styles.card, color: '#aaa', fontSize: 14, textAlign: 'center', padding: 32 }}>
          No sources uploaded yet. Upload a PDF, notes, or mock test to get started.
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 6 },
  label: { display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6, marginTop: 14 },
  input: { width: '100%', background: '#0e0e1a', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const },
  btn: { marginTop: 20, width: '100%', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  sourceRow: { padding: '14px 0', borderBottom: '1px solid #2a2a3a' },
  analysisBox: { marginTop: 14, padding: 16, background: '#0e0e1a', borderRadius: 8 },
  tag: { background: '#1a2a4a', color: '#4f8ef7', border: '1px solid #4f8ef733', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  back: { background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'block' },
}

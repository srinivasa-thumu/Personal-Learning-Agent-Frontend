import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const USER_ID = 'default'

const RULE_ICONS: Record<string, string> = {
  mastery_threshold: '🎯',
  hint_before_answer: '💡',
  prerequisite_on_repeat_fail: '🔁',
  weekly_review: '📅',
  challenge_on_high_mastery: '⚡',
  prefer_practical: '🛠',
}

export function LearningRules() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.getRules(USER_ID).then(setRules).finally(() => setLoading(false))
  }, [])

  const toggle = async (rule: any) => {
    setSaving(rule.id)
    try {
      await api.updateRule(rule.id, { enabled: !rule.enabled })
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
    } finally {
      setSaving(null)
    }
  }

  const updateConfig = async (rule: any, key: string, value: any) => {
    const newConfig = { ...rule.rule_config, [key]: value }
    setSaving(rule.id)
    try {
      await api.updateRule(rule.id, { enabled: rule.enabled, rule_config: newConfig })
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, rule_config: newConfig } : r))
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div style={styles.center}>Loading rules…</div>

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/')}>← Dashboard</button>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>MY LEARNING RULES</div>
        <p style={{ color: '#aaa', fontSize: 13, margin: '0 0 4px' }}>
          These rules persist across all sessions. The agent applies them automatically — you don't need to repeat them.
        </p>
      </div>

      {rules.map(rule => (
        <div key={rule.id} style={{ ...styles.card, opacity: rule.enabled ? 1 : 0.55 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{RULE_ICONS[rule.rule_type] ?? '⚙️'}</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{rule.description}</span>
              </div>
              <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>{rule.rule_type}</div>

              {/* Inline config editors */}
              {rule.enabled && rule.rule_type === 'mastery_threshold' && (
                <div style={styles.configRow}>
                  <span style={styles.configLabel}>Threshold</span>
                  <input
                    type="number" min={50} max={100} step={5}
                    style={styles.configInput}
                    value={rule.rule_config?.threshold ?? 75}
                    onChange={e => updateConfig(rule, 'threshold', parseInt(e.target.value))}
                  />
                  <span style={styles.configLabel}>%</span>
                </div>
              )}
              {rule.enabled && rule.rule_type === 'hint_before_answer' && (
                <div style={styles.configRow}>
                  <span style={styles.configLabel}>Hints before answer</span>
                  <input
                    type="number" min={0} max={5}
                    style={styles.configInput}
                    value={rule.rule_config?.hints ?? 2}
                    onChange={e => updateConfig(rule, 'hints', parseInt(e.target.value))}
                  />
                </div>
              )}
              {rule.enabled && rule.rule_type === 'challenge_on_high_mastery' && (
                <div style={styles.configRow}>
                  <span style={styles.configLabel}>Challenge threshold</span>
                  <input
                    type="number" min={75} max={100} step={5}
                    style={styles.configInput}
                    value={rule.rule_config?.threshold ?? 85}
                    onChange={e => updateConfig(rule, 'threshold', parseInt(e.target.value))}
                  />
                  <span style={styles.configLabel}>%</span>
                </div>
              )}
              {rule.enabled && rule.rule_type === 'weekly_review' && (
                <div style={styles.configRow}>
                  <span style={styles.configLabel}>Day</span>
                  <select
                    style={{ ...styles.configInput, padding: '4px 8px' }}
                    value={rule.rule_config?.day ?? 'Sunday'}
                    onChange={e => updateConfig(rule, 'day', e.target.value)}
                  >
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Toggle */}
            <button
              style={{
                ...styles.toggle,
                background: rule.enabled ? '#4caf50' : '#2a2a3a',
                border: `2px solid ${rule.enabled ? '#4caf50' : '#444'}`,
              }}
              onClick={() => toggle(rule)}
              disabled={saving === rule.id}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transform: rule.enabled ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.2s',
              }} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 620, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#16162a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#aaa', marginBottom: 12 },
  configRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 },
  configLabel: { fontSize: 13, color: '#aaa' },
  configInput: { background: '#0e0e1a', border: '1px solid #2a2a3a', borderRadius: 6, color: '#fff', fontSize: 14, padding: '4px 8px', width: 70 },
  toggle: { width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative' as const, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'background 0.2s' },
  back: { background: 'transparent', border: 'none', color: '#4f8ef7', fontSize: 14, cursor: 'pointer', padding: '0 0 16px 0', display: 'block' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
}

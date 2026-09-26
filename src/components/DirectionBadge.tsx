interface Props {
  action: string
}

const ACTION_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  learn:        { icon: '🔵', label: 'LEARNING',            color: '#4f8ef7', bg: '#1a2a4a' },
  practice:     { icon: '🟡', label: 'PRACTICE',            color: '#ff9800', bg: '#2a1f00' },
  reteach:      { icon: '🔄', label: 'RE-TEACHING',         color: '#ff9800', bg: '#2a1f00' },
  prerequisite: { icon: '🔴', label: 'STRENGTHEN PREREQ',   color: '#f44336', bg: '#2a1010' },
  challenge:    { icon: '⚡', label: 'CHALLENGE',           color: '#9c27b0', bg: '#1e0a2a' },
  review:       { icon: '🟣', label: 'REVIEW DUE',          color: '#9c27b0', bg: '#1e0a2a' },
  assess:       { icon: '📋', label: 'ASSESSMENT',          color: '#4caf50', bg: '#0a2a10' },
  advance:      { icon: '🟢', label: 'READY TO ADVANCE',    color: '#4caf50', bg: '#0a2a10' },
  start:        { icon: '⚪', label: 'NOT STARTED',         color: '#aaa',    bg: '#1a1a2a' },
  complete:     { icon: '🏁', label: 'COMPLETE',            color: '#4caf50', bg: '#0a2a10' },
}

export function DirectionBadge({ action }: Props) {
  const meta = ACTION_META[action] ?? ACTION_META['start']
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: meta.bg,
      border: `1px solid ${meta.color}33`,
      borderRadius: 6,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1,
      color: meta.color,
      marginBottom: 12,
    }}>
      {meta.icon} {meta.label}
    </div>
  )
}

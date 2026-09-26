interface Props {
  label: string
  value: number
  color?: string
}

export function MasteryBar({ label, value, color = '#4f8ef7' }: Props) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div style={{ background: '#2a2a3a', borderRadius: 4, height: 8 }}>
        <div
          style={{
            width: `${Math.min(100, value)}%`,
            background: color,
            height: 8,
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}

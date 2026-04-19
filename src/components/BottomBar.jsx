import { useSimulation } from '../store/useSimulation.js'

function LineChart({ data, color, height = 60 }) {
  if (data.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 6, color: '#4a5a7a' }}>NO DATA YET</span>
    </div>
  )
  const max = Math.max(...data, 100)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 200
  const h = height
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill="url(#lineGrad)"
      />
      {/* Line */}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {/* Latest dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1]
        const lx = w
        const ly = h - ((last - min) / range) * (h - 4) - 2
        return <circle cx={lx} cy={ly} r="3" fill={color} />
      })()}
    </svg>
  )
}

function ResourceBar({ label, value, max, color }) {
  const pct = Math.round(Math.min(100, (value / max) * 100))
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: '70%', height: 50, background: '#0f1e3a', border: '1px solid #2d3561', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: `${pct}%`, background: color, transition: 'height 0.6s' }} />
      </div>
      <div style={{ fontSize: 6, color: '#eaeaea' }}>{label}</div>
      <div style={{ fontSize: 6, color: color }}>{pct}%</div>
    </div>
  )
}

export default function BottomBar() {
  const agents = useSimulation(s => s.agents)
  const events = useSimulation(s => s.events)
  const logs = useSimulation(s => s.logs)
  const selectedAgent = useSimulation(s => s.selectedAgent)
  const selected = agents.find(a => a.name === selectedAgent) ?? agents[0]

  // City happiness: avg mood per tick, last 20 ticks
  const tickMoods = {}
  logs.forEach(l => {
    if (!tickMoods[l.tick]) tickMoods[l.tick] = []
    tickMoods[l.tick].push((l.stateAfter.mood + l.stateBefore.mood) / 2)
  })
  const moodSeries = Object.values(tickMoods).slice(-20).map(arr => arr.reduce((a, b) => a + b, 0) / arr.length)
  const currentHappiness = moodSeries.length > 0 ? Math.round(moodSeries[moodSeries.length - 1]) : null

  // Resource averages across all agents
  const avgFood = agents.length ? Math.round(agents.reduce((s, a) => s + a.food, 0) / agents.length) : 0
  const avgMood = agents.length ? Math.round(agents.reduce((s, a) => s + a.mood, 0) / agents.length) : 0
  const avgMoney = agents.length ? Math.round(agents.reduce((s, a) => s + Math.min(a.money, 10000), 0) / agents.length / 100) : 0

  return (
    <div style={{
      borderTop: '3px solid #2d3561',
      background: '#16213e',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      height: 160,
      flexShrink: 0,
    }}>

      {/* City Happiness */}
      <div style={{ borderRight: '2px solid #2d3561', padding: '8px 12px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 7, color: '#eaeaea', letterSpacing: 1 }}>CITY HAPPINESS</span>
          {currentHappiness !== null && (
            <span style={{ fontSize: 8, color: '#4ecca3' }}>{currentHappiness}%</span>
          )}
        </div>
        <LineChart data={moodSeries} color="#4ecca3" height={62} />
      </div>

      {/* Resource Usage */}
      <div style={{ borderRight: '2px solid #2d3561', padding: '8px 12px' }}>
        <div style={{ fontSize: 7, color: '#eaeaea', letterSpacing: 1, marginBottom: 6 }}>RESOURCE USAGE</div>
        <div style={{ display: 'flex', gap: 8, height: 76, alignItems: 'flex-end' }}>
          <ResourceBar label="FOOD" value={avgFood} max={100} color="#4ecca3" />
          <ResourceBar label="MOOD" value={avgMood} max={100} color="#f9c74f" />
          <ResourceBar label="MONEY" value={avgMoney} max={100} color="#90e0ef" />
        </div>
      </div>

      {/* Selected agent detail */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: 7, color: '#8899bb', letterSpacing: 1, marginBottom: 6 }}>
          {selected ? `► ${selected.name.split(' ')[0].toUpperCase()}` : 'SELECT AGENT'}
        </div>
        {selected && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{
                width: 28, height: 28, flexShrink: 0,
                background: selected.color + '33',
                border: `2px solid ${selected.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15,
              }}>
                {selected.face}
              </div>
              <div>
                <div style={{ fontSize: 7, color: selected.color, marginBottom: 2 }}>{selected.name}</div>
                <div style={{ fontSize: 6, color: '#8899bb' }}>{selected.role}</div>
              </div>
            </div>
            {selected.lastAction && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#0f1e3a', border: `2px solid ${selected.color}55`,
                padding: '3px 7px', marginBottom: 6,
              }}>
                <span style={{ fontSize: 6, color: '#8899bb' }}>TOOL:</span>
                <span style={{ fontSize: 6, color: selected.color }}>
                  {selected.lastAction.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            )}
            {selected.currentThought && (
              <div style={{
                fontSize: 6, color: '#667799', fontStyle: 'italic',
                borderLeft: `2px solid ${selected.color}`,
                paddingLeft: 6, lineHeight: 1.8,
                overflowY: 'auto', maxHeight: 90,
              }}>
                {selected.currentThought}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}

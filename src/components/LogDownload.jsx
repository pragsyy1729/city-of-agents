import { useSimulation } from '../store/useSimulation.js'

function toCSV(logs) {
  const cols = ['tick','timestamp','agent','role','parsedAction','parsedThought','toolResultSuccess','toolResultMessage','moneyBefore','moneyAfter','moodBefore','moodAfter','foodBefore','foodAfter','apiLatencyMs']
  const rows = logs.map(l => cols.map(c => {
    if (c === 'toolResultSuccess') return l.toolResult.success
    if (c === 'toolResultMessage') return `"${l.toolResult.message.replace(/"/g, '""')}"`
    if (c === 'moneyBefore') return l.stateBefore.money
    if (c === 'moneyAfter') return l.stateAfter.money
    if (c === 'moodBefore') return l.stateBefore.mood
    if (c === 'moodAfter') return l.stateAfter.mood
    if (c === 'foodBefore') return l.stateBefore.food
    if (c === 'foodAfter') return l.stateAfter.food
    const v = l[c] ?? ''
    return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
  }).join(','))
  return [cols.join(','), ...rows].join('\n')
}

function download(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const PILL = (active, color = '#4ecca3') => ({
  flex: 1,
  background: 'transparent',
  border: `2px solid ${active ? color : '#2d3561'}`,
  padding: '5px 0',
  fontSize: 6,
  color: active ? color : '#4a5a7a',
  cursor: active ? 'pointer' : 'not-allowed',
  fontFamily: "'Press Start 2P', monospace",
})

export default function LogDownload() {
  const logs = useSimulation(s => s.logs)
  const world = useSimulation(s => s.world)
  const clearLogs = useSimulation(s => s.clearLogs)

  const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filename = `city-of-agents-tick${world.tick}-${stamp}`

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: 6, color: '#8899bb', letterSpacing: 1, marginBottom: 6 }}>
        LLM LOGS ({logs.length})
      </div>

      {logs.slice(-3).map((l, i) => (
        <div key={i} style={{
          fontSize: 6, color: '#667799',
          padding: '3px 0', borderBottom: '1px solid #1e2a4a',
          display: 'flex', gap: 5,
        }}>
          <span style={{ color: '#4a5a7a' }}>t{l.tick}</span>
          <span style={{ color: '#8899bb' }}>{l.agent.split(' ')[0]}</span>
          <span style={{ color: l.toolResult.success ? '#4ecca3' : '#ff6b6b' }}>{l.parsedAction}</span>
          <span style={{ color: '#3a4a6a', marginLeft: 'auto' }}>{l.apiLatencyMs}ms</span>
        </div>
      ))}
      {logs.length === 0 && (
        <div style={{ fontSize: 6, color: '#4a5a7a', padding: '3px 0' }}>NO LOGS YET</div>
      )}

      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <button
          onClick={() => download(JSON.stringify(logs, null, 2), `${filename}.json`, 'application/json')}
          disabled={!logs.length}
          style={PILL(!!logs.length)}
        >
          ⬇ JSON
        </button>
        <button
          onClick={() => download(toCSV(logs), `${filename}.csv`, 'text/csv')}
          disabled={!logs.length}
          style={PILL(!!logs.length)}
        >
          ⬇ CSV
        </button>
        <button
          onClick={clearLogs}
          disabled={!logs.length}
          style={PILL(!!logs.length, '#ff6b6b')}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

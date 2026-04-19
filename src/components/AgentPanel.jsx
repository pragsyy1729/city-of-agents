import { useSimulation } from '../store/useSimulation.js'

function StatBar({ label, value, max = 100, color }) {
  const pct = Math.round(Math.min(100, (value / max) * 100))
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 6, color: '#8899bb' }}>{label}</span>
        <span style={{ fontSize: 6, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: '#0f1e3a', border: '1px solid #2d3561', position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.6s' }} />
      </div>
    </div>
  )
}

export default function AgentPanel() {
  const agents = useSimulation(s => s.agents)
  const selectedAgent = useSimulation(s => s.selectedAgent)
  const selectAgent = useSimulation(s => s.selectAgent)

  return (
    <div style={{
      width: 200, background: '#16213e',
      borderRight: '3px solid #2d3561',
      overflowY: 'auto', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 10px', borderBottom: '2px solid #2d3561',
        fontSize: 8, color: '#eaeaea', letterSpacing: 2,
      }}>
        AGENTS
      </div>

      <div style={{ padding: 6 }}>
        {agents.map(agent => {
          const inCrisis = agent.eviction_risk || agent.food <= 10
          const isSelected = agent.name === selectedAgent
          return (
            <div
              key={agent.name}
              onClick={() => selectAgent(agent.name)}
              style={{
                background: isSelected ? '#0f3460' : '#1a1a2e',
                border: `2px solid ${isSelected ? agent.color : inCrisis ? '#ff4444' : '#2d3561'}`,
                marginBottom: 6, cursor: 'pointer', padding: 7,
                animation: inCrisis ? 'crisispulse 1.2s infinite' : undefined,
              }}
            >
              {/* Portrait + name row */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 7, alignItems: 'flex-start' }}>
                {/* Portrait box */}
                <div style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: agent.color + '22',
                  border: `2px solid ${agent.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {agent.face}
                </div>
                {/* Name + role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 7, color: inCrisis ? '#ff6b6b' : '#eaeaea',
                    fontWeight: 700, marginBottom: 3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {inCrisis ? '⚠ ' : ''}{agent.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 6, color: '#4ecca3', marginBottom: 3 }}>{agent.role}</div>
                  <div style={{
                    fontSize: 5,
                    color: agent.employer ? '#f9c74f' : '#ff6b6b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {agent.employer ? `💼 ${agent.employer}` : '💼 UNEMPLOYED'}
                  </div>
                </div>
              </div>

              {/* Stat bars */}
              <StatBar
                label="MOOD"
                value={agent.mood}
                color={agent.mood > 50 ? '#f9c74f' : '#ff6b6b'}
              />
              <StatBar
                label="FOOD"
                value={agent.food}
                color={agent.food > 30 ? '#4ecca3' : '#ff6b6b'}
              />
              <StatBar
                label="MONEY"
                value={Math.min(agent.money, 10000)}
                max={10000}
                color="#90e0ef"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

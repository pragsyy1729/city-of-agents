import { useState } from 'react'
import { useSimulation } from '../store/useSimulation.js'

const BTN = (extra = {}) => ({
  fontFamily: "'Press Start 2P', monospace",
  cursor: 'pointer',
  border: '2px solid',
  fontSize: 7,
  padding: '5px 10px',
  ...extra,
})

export default function TopBar() {
  const isRunning = useSimulation(s => s.isRunning)
  const speed = useSimulation(s => s.speed)
  const world = useSimulation(s => s.world)
  const agents = useSimulation(s => s.agents)
  const { startSimulation, pauseSimulation, stepOnce, setSpeed, resetSimulation } = useSimulation()
  const [showSettings, setShowSettings] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const setApiKey = useSimulation(s => s.setApiKey)
  const apiKey = useSimulation(s => s.apiKey)

  return (
    <div style={{
      background: '#16213e',
      borderBottom: '3px solid #2d3561',
      padding: '0 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      flexShrink: 0, height: 46,
    }}>
      {/* Logo */}
      <span style={{ color: '#eaeaea', fontSize: 9, letterSpacing: 1, whiteSpace: 'nowrap', marginRight: 4 }}>
        🏙 PIXEL CITY
      </span>

      {/* Play/Pause */}
      <button
        onClick={isRunning ? pauseSimulation : startSimulation}
        style={BTN({ background: '#eaeaea', color: '#1a1a2e', borderColor: '#eaeaea' })}
      >
        {isRunning ? '⏸ PAUSE' : '▶ PLAY'}
      </button>

      {/* Step */}
      <button
        onClick={() => { pauseSimulation(); stepOnce() }}
        style={BTN({ background: 'transparent', color: '#8899bb', borderColor: '#2d3561' })}
      >
        STEP
      </button>

      {/* Speed chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 7, color: '#8899bb' }}>SPEED</span>
        {[1, 2, 5].map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={BTN({
              background: speed === s ? '#eaeaea' : 'transparent',
              color: speed === s ? '#1a1a2e' : '#8899bb',
              borderColor: speed === s ? '#eaeaea' : '#2d3561',
              padding: '4px 7px',
            })}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Agent count */}
      <span style={{ fontSize: 7, color: '#4ecca3', whiteSpace: 'nowrap' }}>
        {agents.length} AGENTS
      </span>

      {/* Tick */}
      <div style={{ marginLeft: 'auto', fontSize: 8, color: '#eaeaea', whiteSpace: 'nowrap' }}>
        TICK {world.tick} · T-NAGAR
      </div>

      {/* Settings */}
      <button
        onClick={() => setShowSettings(s => !s)}
        style={BTN({ background: 'transparent', borderColor: '#2d3561', color: '#8899bb', fontSize: 12 })}
      >
        ⚙
      </button>

      {showSettings && (
        <div style={{
          position: 'fixed', top: 50, right: 8,
          background: '#16213e', border: '2px solid #2d3561',
          padding: 14, zIndex: 100, width: 248,
        }}>
          <div style={{ fontSize: 7, color: '#8899bb', marginBottom: 8 }}>NVIDIA API KEY</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="password" placeholder="nvapi-..." value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              style={{
                flex: 1, background: '#1a1a2e', border: '2px solid #2d3561',
                padding: '5px 7px', color: '#eaeaea', fontSize: 7, outline: 'none',
                fontFamily: "'Press Start 2P', monospace",
              }}
            />
            <button
              onClick={() => { setApiKey(keyInput); setShowSettings(false) }}
              style={BTN({ background: '#eaeaea', color: '#1a1a2e', borderColor: '#eaeaea' })}
            >
              SAVE
            </button>
          </div>
          {apiKey && <div style={{ fontSize: 7, color: '#4ecca3', marginTop: 6 }}>✓ KEY SAVED</div>}
          <button
            onClick={() => { resetSimulation(); setShowSettings(false) }}
            style={BTN({ width: '100%', marginTop: 10, background: '#3a0a0a', borderColor: '#8a2020', color: '#ff6b6b', display: 'block' })}
          >
            RESET SIMULATION
          </button>
        </div>
      )}
    </div>
  )
}

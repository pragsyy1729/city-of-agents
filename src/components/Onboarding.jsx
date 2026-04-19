import { useState } from 'react'
import { useSimulation } from '../store/useSimulation.js'

export default function Onboarding() {
  const [key, setKey] = useState('')
  const setApiKey = useSimulation(s => s.setApiKey)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#1a1a2e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
      fontFamily: "'Press Start 2P', monospace",
    }}>
      {/* Decorative grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(45,53,97,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(45,53,97,0.4) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{
        background: '#16213e',
        border: '3px solid #2d3561',
        padding: 36,
        maxWidth: 420, width: '90%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Corner decorations */}
        {[
          { top: -2, left: -2, borderTop: '3px solid #4ecca3', borderLeft: '3px solid #4ecca3' },
          { top: -2, right: -2, borderTop: '3px solid #4ecca3', borderRight: '3px solid #4ecca3' },
          { bottom: -2, left: -2, borderBottom: '3px solid #4ecca3', borderLeft: '3px solid #4ecca3' },
          { bottom: -2, right: -2, borderBottom: '3px solid #4ecca3', borderRight: '3px solid #4ecca3' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 16, height: 16, ...s }} />
        ))}

        {/* Logo */}
        <div style={{ fontSize: 10, color: '#eaeaea', letterSpacing: 2, marginBottom: 6 }}>
          🏙 PIXEL CITY
        </div>
        <div style={{ fontSize: 7, color: '#4ecca3', letterSpacing: 1, marginBottom: 24 }}>
          CITY OF AGENTS
        </div>

        <div style={{ fontSize: 7, color: '#8899bb', lineHeight: 2, marginBottom: 28 }}>
          15 LLM-POWERED AGENTS LIVING,<br />
          SCHEMING AND SURVIVING<br />
          IN T-NAGAR, CHENNAI.
        </div>

        <div style={{ fontSize: 7, color: '#667799', marginBottom: 12 }}>
          ENTER YOUR NVIDIA API KEY
        </div>

        <input
          type="password"
          placeholder="nvapi-..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && key.trim()) setApiKey(key.trim()) }}
          style={{
            width: '100%',
            background: '#1a1a2e',
            border: '2px solid #2d3561',
            padding: '10px 14px',
            color: '#eaeaea',
            fontSize: 8,
            outline: 'none',
            marginBottom: 14,
            fontFamily: "'Press Start 2P', monospace",
            textAlign: 'center',
          }}
          autoFocus
        />

        <button
          onClick={() => key.trim() && setApiKey(key.trim())}
          disabled={!key.trim()}
          style={{
            width: '100%',
            background: key.trim() ? '#eaeaea' : '#2d3561',
            color: key.trim() ? '#1a1a2e' : '#4a5a7a',
            border: '2px solid',
            borderColor: key.trim() ? '#eaeaea' : '#2d3561',
            padding: '12px 0',
            fontSize: 8,
            cursor: key.trim() ? 'pointer' : 'not-allowed',
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: 1,
          }}
        >
          ▶ START SIMULATION
        </button>

        <div style={{ fontSize: 6, color: '#3a4a6a', marginTop: 14, lineHeight: 2 }}>
          KEY STORED LOCALLY · NEVER SENT ANYWHERE<br />
          EXCEPT NVIDIA'S API
        </div>
      </div>
    </div>
  )
}

import { useSimulation } from '../store/useSimulation.js'
import LogDownload from './LogDownload.jsx'

export default function WorldPanel() {
  const world = useSimulation(s => s.world)
  const events = useSimulation(s => s.events)
  const apiKey = useSimulation(s => s.apiKey)

  return (
    <div style={{
      width: 210, background: '#16213e',
      borderLeft: '3px solid #2d3561',
      overflowY: 'auto', flexShrink: 0,
    }}>

      {/* WORLD STATS header */}
      <div style={{
        padding: '8px 10px', borderBottom: '2px solid #2d3561',
        fontSize: 8, color: '#eaeaea', letterSpacing: 2,
      }}>
        WORLD STATS
      </div>

      <div style={{ padding: '8px 10px' }}>

        {/* Market */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '7px 8px', marginBottom: 6,
          background: '#1a1a2e', border: '2px solid #2d3561',
        }}>
          <span style={{ fontSize: 14 }}>🏠</span>
          <div>
            <div style={{ fontSize: 6, color: '#8899bb', marginBottom: 3 }}>MARKET STATUS:</div>
            <div style={{
              fontSize: 7,
              color: world.market_closed ? '#ff6b6b' : '#4ecca3',
              marginBottom: 2,
            }}>
              {world.market_closed ? 'CLOSED' : 'OPEN'} (RENT: ₹{world.rent})
            </div>
          </div>
        </div>

        {/* Jobs */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '7px 8px', marginBottom: 6,
          background: '#1a1a2e', border: '2px solid #2d3561',
        }}>
          <span style={{ fontSize: 14 }}>📋</span>
          <div>
            <div style={{ fontSize: 6, color: '#8899bb', marginBottom: 3 }}>JOBS:</div>
            <div style={{ fontSize: 7, color: '#eaeaea', marginBottom: 2 }}>
              {world.jobs?.length ?? 0} AVAILABLE
            </div>
            {world.jobs?.length > 0 && (
              <div style={{ fontSize: 6, color: '#8899bb' }}>
                ({(world.jobs ?? []).map(j => j.employer).join(', ')})
              </div>
            )}
          </div>
        </div>

        {/* Crises */}
        {world.crisis?.length > 0 && (
          <div style={{
            padding: '7px 8px', marginBottom: 6,
            background: '#2a0a0a', border: '2px solid #8a2020',
          }}>
            <div style={{ fontSize: 6, color: '#ff6b6b', marginBottom: 4 }}>⚠ CRISES</div>
            {world.crisis.map(c => (
              <div key={c} style={{
                fontSize: 6, color: '#ff8888',
                padding: '2px 0', borderBottom: '1px solid #3a1010',
                marginBottom: 2,
              }}>
                {c}
              </div>
            ))}
          </div>
        )}

        {/* API status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px', marginBottom: 6,
          background: '#1a1a2e', border: '2px solid #2d3561',
          fontSize: 6,
        }}>
          <div style={{
            width: 7, height: 7,
            background: apiKey ? '#4ecca3' : '#ff6b6b',
            border: `1px solid ${apiKey ? '#2a8a6a' : '#8a2020'}`,
            flexShrink: 0,
          }} />
          <span style={{ color: apiKey ? '#4ecca3' : '#ff6b6b' }}>
            {apiKey ? 'NVIDIA CONNECTED' : 'NO KEY SET'}
          </span>
        </div>

      </div>

      {/* LIVE LOG header */}
      <div style={{
        padding: '8px 10px', borderTop: '2px solid #2d3561', borderBottom: '2px solid #2d3561',
        fontSize: 8, color: '#eaeaea', letterSpacing: 2,
      }}>
        LIVE LOG
      </div>

      <div style={{ padding: '6px 8px', flex: 1 }}>
        {events.length === 0 && (
          <div style={{ fontSize: 6, color: '#4a5a7a', padding: '4px 0' }}>
            NO EVENTS YET
          </div>
        )}
        {events.slice(-12).reverse().map((ev, i) => (
          <div key={i} style={{
            fontSize: 6, color: '#8899bb',
            padding: '4px 0',
            borderBottom: '1px solid #1e2a4a',
            display: 'flex', gap: 5, alignItems: 'flex-start',
          }}>
            <span style={{ color: '#4a5a7a', flexShrink: 0 }}>T{ev.tick ?? '?'}:</span>
            <span style={{ color: ev.agentColor, flexShrink: 0 }}>
              {ev.agentName.split(' ')[0]}
            </span>
            <span style={{ color: ev.success ? '#4ecca3' : '#ff6b6b', lineHeight: 1.5 }}>
              {ev.action}
            </span>
          </div>
        ))}
      </div>

      {/* Rumors */}
      {world.rumours?.length > 0 && (
        <div style={{ padding: '6px 10px', borderTop: '2px solid #2d3561' }}>
          <div style={{ fontSize: 7, color: '#8899bb', marginBottom: 4 }}>💬 RUMORS</div>
          {(world.rumours ?? []).slice(-3).map((r, i) => (
            <div key={i} style={{ fontSize: 6, color: '#667799', fontStyle: 'italic', marginBottom: 3 }}>
              "{r.content}"
            </div>
          ))}
        </div>
      )}

      {/* Log download */}
      <div style={{ borderTop: '2px solid #2d3561' }}>
        <LogDownload />
      </div>
    </div>
  )
}

import { TOOL_TO_BUILDING } from '../agents/characters.js'

const T = 40

const EMOJI_TO_LOCATION = {
  '🏠': 'home', '🏪': 'shop', '🏭': 'factory', '☕': 'cafe',
  '🌳': 'park', '🏢': 'office', '🏥': 'hospital',
  '📰': 'office', '🏛️': 'office', '🚌': 'road',
}
const LOCATION_PX = {
  home:     { x: T * 1.5, y: T * 0.5 },
  shop:     { x: T * 6.5, y: T * 0.5 },
  office:   { x: T * 10.5, y: T * 0.5 },
  factory:  { x: T * 1.5, y: T * 3.5 },
  cafe:     { x: T * 6.5, y: T * 3.5 },
  park:     { x: T * 10.5, y: T * 3.5 },
  hospital: { x: T * 6.5, y: T * 7.5 },
  road:     { x: T * 4,   y: T * 2   },
}
const ACTION_LABELS = {
  buy_food: 'Shopping', pay_rent: 'Paying rent', work_shift: 'Working',
  look_for_job: 'Job hunting', apply_for_job: 'Applying', move_district: 'Moving',
  send_message: 'Messaging', recruit: 'Recruiting', spread_rumour: 'Gossiping',
  call_meeting: 'Meeting', trade: 'Trading', read_notice_board: 'Reading news',
  check_agent_status: 'Checking in', investigate: 'Investigating',
  read_messages: 'Reading msgs', file_complaint: 'Complaining', publish_story: 'Publishing',
  bribe: 'Bribing', call_strike: 'On strike!', organise_protest: 'Protesting',
  treat_patient: 'At clinic', rest: 'Resting', buy_medicine: 'Getting meds',
}

const SKIN_TONES  = ['#f4c094','#d4956a','#c68642','#8d5524','#f1d5a8','#e0a87a']
const HAIR_COLORS = ['#1a1a1a','#2c1810','#8b4513','#c8a040','#6b4c11','#4a3728','#cc8844','#e8d080']
const PANT_COLORS = ['#2c3e6b','#1a2a4a','#3d2b1f','#2a3a2a','#4a2a4a','#3a3060']

function nameHash(str) {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h
}
function jitter(name, spread = 24) {
  const h = nameHash(name)
  return { dx: ((h & 0xff) % spread) - spread / 2, dy: (((h >> 8) & 0xff) % spread) - spread / 2 }
}

// Detailed RPG-style pixel art character
function PixelCharacter({ shirtColor, agentIdx }) {
  const skin  = SKIN_TONES[agentIdx % SKIN_TONES.length]
  const hair  = HAIR_COLORS[agentIdx % HAIR_COLORS.length]
  const pants = PANT_COLORS[agentIdx % PANT_COLORS.length]
  const shoe  = '#2a1a0a'
  const dur   = `${0.32 + (agentIdx % 5) * 0.06}s`

  const swing = (phase) => ({
    transformBox: 'fill-box',
    transformOrigin: 'top center',
    animation: `${phase === 'A' ? 'legSwingA' : 'legSwingB'} ${dur} ease-in-out infinite`,
  })

  return (
    // viewBox 0 0 12 20 → rendered at 24×40
    <svg width="24" height="40" viewBox="0 0 12 20" style={{ imageRendering: 'pixelated', display: 'block', overflow: 'visible' }}>
      {/* ── Hair ── */}
      <rect x="3" y="0" width="6" height="1" fill={hair} />
      <rect x="2" y="1" width="8" height="1" fill={hair} />
      <rect x="2" y="2" width="1" height="2" fill={hair} />   {/* left sideburn */}
      <rect x="9" y="2" width="1" height="2" fill={hair} />   {/* right sideburn */}
      {/* ── Face ── */}
      <rect x="3" y="2" width="6" height="4" fill={skin} />
      {/* Eyes */}
      <rect x="4" y="3" width="1" height="1" fill="#1a1a2e" />
      <rect x="7" y="3" width="1" height="1" fill="#1a1a2e" />
      {/* Eye whites */}
      <rect x="4" y="3" width="1" height="1" fill="white" />
      <rect x="4.5" y="3.2" width="0.5" height="0.8" fill="#1a1a2e" />
      <rect x="7" y="3" width="1" height="1" fill="white" />
      <rect x="7.5" y="3.2" width="0.5" height="0.8" fill="#1a1a2e" />
      {/* Mouth */}
      <rect x="5" y="5" width="2" height="0.5" fill="#8a4040" />
      {/* ── Neck ── */}
      <rect x="5" y="6" width="2" height="1" fill={skin} />
      {/* ── Shirt ── */}
      <rect x="3" y="7" width="6" height="4" fill={shirtColor} />
      {/* Shirt collar */}
      <rect x="5" y="7" width="2" height="1" fill={skin} />
      {/* Left arm (animated) */}
      <rect x="1" y="7" width="2" height="4" fill={shirtColor} style={swing('B')} />
      {/* Right arm (animated) */}
      <rect x="9" y="7" width="2" height="4" fill={shirtColor} style={swing('A')} />
      {/* Hands */}
      <rect x="1"  y="11" width="2" height="1" fill={skin} style={swing('B')} />
      <rect x="9"  y="11" width="2" height="1" fill={skin} style={swing('A')} />
      {/* ── Belt ── */}
      <rect x="3" y="11" width="6" height="1" fill="#3a2010" />
      {/* ── Pants ── */}
      <rect x="3" y="12" width="2.5" height="5" fill={pants} style={swing('A')} />
      <rect x="6.5" y="12" width="2.5" height="5" fill={pants} style={swing('B')} />
      {/* Pants highlight */}
      <rect x="3"   y="12" width="1" height="5" fill={pants} style={{ filter:'brightness(1.2)', ...swing('A') }} />
      <rect x="6.5" y="12" width="1" height="5" fill={pants} style={{ filter:'brightness(1.2)', ...swing('B') }} />
      {/* ── Shoes ── */}
      <rect x="2"   y="17" width="4" height="2" fill={shoe} style={swing('A')} />
      <rect x="6"   y="17" width="4" height="2" fill={shoe} style={swing('B')} />
      {/* Shoe toe highlight */}
      <rect x="2"   y="17" width="2" height="1" fill="#4a3020" style={swing('A')} />
      <rect x="6"   y="17" width="2" height="1" fill="#4a3020" style={swing('B')} />
    </svg>
  )
}

export default function Minion({ agent, isSelected, onClick }) {
  const buildingEmoji = TOOL_TO_BUILDING[agent.lastAction] ?? '🏠'
  const location      = EMOJI_TO_LOCATION[buildingEmoji] ?? 'home'
  const base          = LOCATION_PX[location] ?? LOCATION_PX.home
  const { dx, dy }    = jitter(agent.name)
  const agentIdx      = nameHash(agent.name) % 15

  const x = base.x + dx - 12
  const y = base.y + dy - 20

  const inCrisis   = agent.eviction_risk || agent.food <= 10
  const actionLabel = ACTION_LABELS[agent.lastAction] ?? null

  return (
    <div
      onClick={onClick}
      title={agent.name}
      style={{
        position: 'absolute',
        left: x, top: y,
        transition: 'left 0.9s ease-in-out, top 0.9s ease-in-out',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: 'pointer',
        zIndex: isSelected ? 40 : 20,
      }}
    >
      {/* Speech bubble */}
      {(actionLabel || (isSelected && agent.currentThought)) && (
        <div style={{
          background: '#fff',
          border: '2px solid #222',
          padding: '2px 5px',
          fontSize: 5,
          color: '#1a1a2e',
          whiteSpace: 'nowrap',
          maxWidth: 76,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: 3,
          position: 'relative',
          fontFamily: "'Press Start 2P', monospace",
          lineHeight: 1.4,
          animation: 'speechFade 0.3s ease-out',
        }}>
          {isSelected && agent.currentThought ? agent.currentThought.slice(0, 20) : actionLabel}
          <div style={{ position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid #222' }} />
          <div style={{ position:'absolute', bottom:-4, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderTop:'4px solid #fff' }} />
        </div>
      )}

      {/* Character sprite */}
      <div style={{
        filter: isSelected
          ? `drop-shadow(0 0 5px ${agent.color}) drop-shadow(0 0 10px ${agent.color}88)`
          : inCrisis ? 'drop-shadow(0 0 4px #ff4444)' : `drop-shadow(1px 2px 0px rgba(0,0,0,0.5))`,
        animation: inCrisis ? 'crisispulse 1.2s ease-in-out infinite' : undefined,
      }}>
        <PixelCharacter shirtColor={agent.color} agentIdx={agentIdx} />
      </div>

      {/* Name tag */}
      <div style={{
        background: isSelected ? agent.color : 'rgba(22,33,62,0.92)',
        border: `1px solid ${agent.color}`,
        padding: '1px 4px',
        fontSize: 5,
        color: isSelected ? '#1a1a2e' : '#eaeaea',
        whiteSpace: 'nowrap',
        marginTop: 1,
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {agent.name.split(' ')[0]}
      </div>
    </div>
  )
}

import { useRef, useEffect, useCallback } from 'react'
import { useSimulation } from '../store/useSimulation.js'

// ── Constants — exactly matching Agent World.html / sim.js ────────────────────
const MAP_COLS  = 32
const MAP_ROWS  = 20
const TILE_PX   = 24
const WORLD_W   = MAP_COLS * TILE_PX   // 768
const WORLD_H   = MAP_ROWS * TILE_PX   // 480
const BODY_CELL = 32
const DIR = { DOWN: 0, RIGHT: 1, UP: 2, LEFT: 3 }

// Same map as Agent World.html
const MAP = [
  "..ttt.....RRRRRRRRRRRRR.........",
  ".tt.h..e..R...........R..m..t...",
  "....h..e..R.t..t..t...R..m......",
  "..........R...........R......a..",
  "..........RRRRRRRRRRRRR......a..",
  "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
  ".....R..........................",
  "..g..R..c...s....O....t.....b..t",
  ".....R..c...s....O.....pp.......",
  "..t..R...........O.....pp.......",
  ".....RRRRRRRRRRRRRRRRRRR........",
  ".....................R..........",
  "..h..h....ttt.a..a...R..e..e....",
  "..h..h........a..a...R..e..e..t.",
  ".....................R..........",
  "RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR",
  ".....R...........t.............t",
  "..pp.R..b...g....R..c...s....h..",
  "..pp.R..b...g....R..c...s....h..",
  "..ttt............R..............",
]

const TILE_ATLAS = {
  grass_plain:  { x: 16, y: 16, w: 48, h: 48 },
  stonefence_h: { x:  8, y: 440, w: 96, h: 16 },
}

const BUILDING_BOXES = {
  office:      { box: [320,  91, 147, 220] },
  hospital:    { box: [864,  31, 633, 295] },
  shop_green:  { box: [1861, 209, 161, 104] },
  house_blue:  { box: [2629, 174, 168, 137] },
  shop_yellow: { box: [3400, 188, 159, 123] },
  shop_blue:   { box: [328,  572, 159, 123] },
  house_teal:  { box: [1093, 574, 157, 123] },
  shop_red:    { box: [1864, 572, 159, 123] },
  house_azure: { box: [2632, 572, 159, 123] },
}

const BUILDING_MAP = {
  h: { key: 'house_blue',   w: 2, h: 2 },
  a: { key: 'house_azure',  w: 2, h: 2 },
  e: { key: 'house_teal',   w: 2, h: 2 },
  c: { key: 'shop_red',     w: 2, h: 2 },
  s: { key: 'shop_yellow',  w: 2, h: 2 },
  g: { key: 'shop_green',   w: 2, h: 2 },
  b: { key: 'shop_blue',    w: 2, h: 2 },
  m: { key: 'hospital',     w: 3, h: 3 },
  O: { key: 'office',       w: 2, h: 3 },
}

const BUILDING_CATEGORY = {
  h: 'house', a: 'house', e: 'house',
  c: 'cafe',  s: 'shop',  g: 'shop', b: 'shop',
  m: 'hospital',
  O: 'factory',
  p: 'park',
}

// Map extension action types → building category on this map
const ACTION_TO_CATEGORY = {
  buy_food:          'shop',
  pay_rent:          'house',
  work_shift:        'factory',
  apply_for_job:     'factory',
  look_for_job:      'house',
  move_district:     'house',
  rest:              'house',
  treat_patient:     'hospital',
  buy_medicine:      'hospital',
  trade:             'shop',
  publish_story:     'factory',
  send_message:      'park',
  recruit:           'park',
  spread_rumour:     'cafe',
  call_meeting:      'cafe',
  check_agent_status:'park',
  read_notice_board: 'park',
  investigate:       'park',
  read_messages:     'house',
  file_complaint:    'hospital',
  bribe:             'shop',
  call_strike:       'park',
  organise_protest:  'park',
  consult_doctor:    'hospital',
  report_suspicious: 'factory',
}

// Employer name → building category (used when action is work_shift)
const EMPLOYER_TO_CATEGORY = {
  'Café Existenz':         'cafe',
  'Chennai Physio Clinic': 'hospital',
  'Mahi Construction':     'factory',
  'Pixel & Grain Studio':  'shop',
  'Tamil Nadu Police':     'factory',
  'NovaTech Startup':      'factory',
  'Apollo Hospital':       'hospital',
  'Freelance':             'park',
  'Self':                  'house',
}

// Sprite paths — BASE_URL is '/' in dev, '/city-of-agents/' on GitHub Pages
const BASE = import.meta.env.BASE_URL
const SPRITE_PATHS = {
  tiles:    `${BASE}sprites/Tiles.png`,
  building: `${BASE}sprites/Building.png`,
  trees:    `${BASE}sprites/Tree-Sheet.png`,
  body:     `${BASE}sprites/Character.png`,
  hairs:    `${BASE}sprites/Hairs.png`,
  shadow:   `${BASE}sprites/Shadow.png`,
  outfits:  [
    `${BASE}sprites/Outfit1.png`, `${BASE}sprites/Outfit2.png`, `${BASE}sprites/Outfit3.png`,
    `${BASE}sprites/Outfit4.png`, `${BASE}sprites/Outfit5.png`, `${BASE}sprites/Outfit6.png`,
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadImg(src) {
  return new Promise((res, rej) => {
    const im = new Image()
    im.onload  = () => res(im)
    im.onerror = () => rej(new Error('sprite load failed: ' + src))
    im.src = src
  })
}

function nameHash(str) {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h
}

// Fixed visual appearance derived deterministically from agent name
function agentVisuals(name) {
  const h = nameHash(name)
  return {
    skin:   (h % 4) + 1,            // rows 1-4 of body sheet
    hair:   (h >> 3) % 8,           // rows 0-7 of hairs sheet
    outfit: (h >> 6) % 6,           // 6 outfit sheets
    dir:    DIR.DOWN,
    walkFrame: h % 6,
  }
}

function isRoad(x, y) {
  if (x < 0 || y < 0 || x >= MAP_COLS || y >= MAP_ROWS) return false
  return MAP[y][x] === 'R'
}

const DIRS4 = [[1,0],[-1,0],[0,1],[0,-1]]
const DIRS8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]

// BFS to find shortest path through road tiles; returns array of [tx,ty] tile coords
function findRoadPath(sx, sy, ex, ey) {
  if (sx === ex && sy === ey) return [[sx, sy]]
  const key = (x, y) => y * MAP_COLS + x
  const parent = new Map([[key(sx, sy), -1]])
  const queue = [[sx, sy]]
  let found = false
  outer: while (queue.length) {
    const [cx, cy] = queue.shift()
    for (const [dx, dy] of DIRS4) {
      const nx = cx + dx, ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS) continue
      if (MAP[ny][nx] !== 'R') continue
      const k = key(nx, ny)
      if (parent.has(k)) continue
      parent.set(k, key(cx, cy))
      if (nx === ex && ny === ey) { found = true; break outer }
      queue.push([nx, ny])
    }
  }
  if (!found) return [[sx, sy]]
  const path = []
  let cur = key(ex, ey)
  while (cur !== -1) {
    path.unshift([cur % MAP_COLS, Math.floor(cur / MAP_COLS)])
    cur = parent.get(cur) ?? -1
  }
  return path
}

// BFS outward from a tile to find the nearest road tile
function nearestRoadTile(tx, ty) {
  tx = Math.max(0, Math.min(MAP_COLS - 1, tx))
  ty = Math.max(0, Math.min(MAP_ROWS - 1, ty))
  if (MAP[ty][tx] === 'R') return [tx, ty]
  const key = (x, y) => y * MAP_COLS + x
  const visited = new Set([key(tx, ty)])
  const queue = [[tx, ty]]
  while (queue.length) {
    const [cx, cy] = queue.shift()
    for (const [dx, dy] of DIRS8) {
      const nx = cx + dx, ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS) continue
      const k = key(nx, ny)
      if (visited.has(k)) continue
      visited.add(k)
      if (MAP[ny][nx] === 'R') return [nx, ny]
      queue.push([nx, ny])
    }
  }
  return [tx, ty]
}

// Center pixel of a tile
function tileCenterPx(tx, ty) {
  return [tx * TILE_PX + TILE_PX / 2, ty * TILE_PX + TILE_PX / 2]
}

// Build a pixel waypoint list: currentPos → nearest road → road BFS path → dest
function buildWaypoints(cwx, cwy, twx, twy) {
  const ctx = Math.floor(cwx / TILE_PX), cty = Math.floor(cwy / TILE_PX)
  const ttx = Math.floor(twx / TILE_PX), tty = Math.floor(twy / TILE_PX)
  const [crx, cry] = nearestRoadTile(ctx, cty)
  const [trx, try_] = nearestRoadTile(ttx, tty)
  const roadTiles = findRoadPath(crx, cry, trx, try_)
  const pts = []
  pts.push(tileCenterPx(crx, cry))
  for (const [rx, ry] of roadTiles) {
    const p = tileCenterPx(rx, ry)
    const last = pts[pts.length - 1]
    if (last[0] !== p[0] || last[1] !== p[1]) pts.push(p)
  }
  pts.push([twx, twy])
  return pts
}

// Find all tiles of a given letter in MAP
function findTiles(letter) {
  const out = []
  for (let y = 0; y < MAP_ROWS; y++)
    for (let x = 0; x < MAP_COLS; x++)
      if (MAP[y][x] === letter) out.push([x, y])
  return out
}

const LANDMARKS = {
  house:    [...findTiles('h'), ...findTiles('a'), ...findTiles('e')],
  cafe:     findTiles('c'),
  shop:     [...findTiles('s'), ...findTiles('g'), ...findTiles('b')],
  hospital: findTiles('m'),
  factory:  findTiles('O'),
  park:     findTiles('p'),
}

// Compute target world-px position for an agent based on lastAction + employer + name jitter
function agentTargetPos(agent, agentIdx) {
  let category
  if (agent.lastAction === 'work_shift' && agent.employer) {
    category = EMPLOYER_TO_CATEGORY[agent.employer] || 'factory'
  } else if (agent.lastAction === 'treat_patient' || agent.lastAction === 'buy_medicine') {
    category = 'hospital'
  } else {
    category = ACTION_TO_CATEGORY[agent.lastAction] || 'house'
  }
  const list = LANDMARKS[category] || LANDMARKS.house
  const tile = list[agentIdx % list.length] || [5, 5]
  const [tx, ty] = tile
  const h = nameHash(agent.name)
  // Small deterministic jitter so agents don't stack on the same pixel
  const jx = (((h * 37) & 0x1f) % (TILE_PX)) - TILE_PX / 2
  const jy = ((((h >> 5) * 41) & 0x1f) % (TILE_PX)) - TILE_PX / 2
  return {
    wx: tx * TILE_PX + TILE_PX / 2 + jx,
    wy: ty * TILE_PX + TILE_PX - 4 + jy,
  }
}

// ── Background renderer (same logic as sim.js renderBackground) ───────────────
function renderBackground(bgCtx, IMG) {
  bgCtx.clearRect(0, 0, WORLD_W, WORLD_H)
  bgCtx.imageSmoothingEnabled = false

  // Layer 1: grass base + roads
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      const ch = MAP[y][x]
      const px = x * TILE_PX, py = y * TILE_PX

      if (ch === 'R') {
        bgCtx.fillStyle = '#3c3f44'
        bgCtx.fillRect(px, py, TILE_PX, TILE_PX)
        // subtle texture
        bgCtx.fillStyle = '#45494e'
        for (let i = 0; i < 3; i++) {
          const dx = (x * 17 + y * 29 + i * 7) % TILE_PX
          const dy = (x * 13 + y * 19 + i * 11) % TILE_PX
          bgCtx.fillRect(px + dx, py + dy, 2, 1)
        }
        // edge shadows
        const lf = isRoad(x - 1, y), rt = isRoad(x + 1, y)
        const up = isRoad(x, y - 1), dn = isRoad(x, y + 1)
        bgCtx.fillStyle = '#2a2d32'
        if (!up) bgCtx.fillRect(px, py, TILE_PX, 1)
        if (!dn) bgCtx.fillRect(px, py + TILE_PX - 1, TILE_PX, 1)
        if (!lf) bgCtx.fillRect(px, py, 1, TILE_PX)
        if (!rt) bgCtx.fillRect(px + TILE_PX - 1, py, 1, TILE_PX)
        // curb highlight
        bgCtx.fillStyle = '#4a4e55'
        if (!up) bgCtx.fillRect(px, py + 1, TILE_PX, 1)
        if (!dn) bgCtx.fillRect(px, py + TILE_PX - 2, TILE_PX, 1)
        // center dashed line
        const horiz = lf && rt, vert = up && dn
        const mid = Math.floor(TILE_PX / 2)
        bgCtx.fillStyle = '#c9c58b'
        if (horiz && !vert) {
          for (let i = 2; i < TILE_PX - 2; i += 6) bgCtx.fillRect(px + i, py + mid, 3, 1)
        } else if (vert && !horiz) {
          for (let i = 2; i < TILE_PX - 2; i += 6) bgCtx.fillRect(px + mid, py + i, 1, 3)
        } else if (horiz && vert) {
          bgCtx.fillRect(px + mid - 1, py + mid - 1, 3, 3)
        }
      } else {
        // grass — sample from tiles sheet with deterministic offset for variety
        const ga = TILE_ATLAS.grass_plain
        const ox = Math.abs((x * 7) % (ga.w - TILE_PX))
        const oy = Math.abs((y * 11) % (ga.h - TILE_PX))
        bgCtx.drawImage(IMG.tiles, ga.x + ox, ga.y + oy, TILE_PX, TILE_PX, px, py, TILE_PX, TILE_PX)
      }
    }
  }

  // Layer 2: parks (2x2 plots with fountain + fence)
  const drawnParks = new Set()
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      if (MAP[y][x] !== 'p') continue
      if ((x > 0 && MAP[y][x - 1] === 'p') || (y > 0 && MAP[y - 1][x] === 'p')) continue
      const key = x + ',' + y
      if (drawnParks.has(key)) continue
      drawnParks.add(key)
      const px = x * TILE_PX, py = y * TILE_PX
      const w = TILE_PX * 2, h = TILE_PX * 2
      const ga = TILE_ATLAS.grass_plain
      bgCtx.drawImage(IMG.tiles, ga.x, ga.y, ga.w, ga.h, px, py, w, h)
      bgCtx.fillStyle = 'rgba(210,190,140,0.5)'
      bgCtx.fillRect(px + w / 2 - 3, py + 3, 6, h - 6)
      const fcx = px + w / 2, fcy = py + h / 2
      bgCtx.fillStyle = '#6a7a94'
      bgCtx.beginPath(); bgCtx.arc(fcx, fcy, 7, 0, Math.PI * 2); bgCtx.fill()
      bgCtx.fillStyle = '#78b0de'
      bgCtx.beginPath(); bgCtx.arc(fcx, fcy, 5, 0, Math.PI * 2); bgCtx.fill()
      bgCtx.fillStyle = '#c0e0f0'
      bgCtx.fillRect(fcx - 1, fcy - 3, 2, 2)
      bgCtx.drawImage(IMG.trees, 48 * 3, 0, 48, 64, px + 1, py - 6, 18, 22)
      bgCtx.drawImage(IMG.trees, 48 * 3, 0, 48, 64, px + w - 19, py + h - 18, 18, 22)
      const sf = TILE_ATLAS.stonefence_h
      bgCtx.drawImage(IMG.tiles, sf.x, sf.y, sf.w, sf.h, px, py, w, 4)
      bgCtx.drawImage(IMG.tiles, sf.x, sf.y, sf.w, sf.h, px, py + h - 4, w, 4)
    }
  }

  // Layer 3: trees
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      if (MAP[y][x] !== 't') continue
      const px = x * TILE_PX, py = y * TILE_PX
      const variant = (x * 13 + y * 7) % 4
      const dw = TILE_PX + 6, dh = TILE_PX + 8
      bgCtx.drawImage(IMG.trees, variant * 48, 0, 48, 64, px - 3, py - dh + TILE_PX, dw, dh)
    }
  }

  // Layer 4: buildings (anchor tiles only — skip continuation tiles)
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      const ch = MAP[y][x]
      if (!BUILDING_MAP[ch]) continue
      if ((x > 0 && MAP[y][x - 1] === ch) || (y > 0 && MAP[y - 1][x] === ch)) continue
      const bm = BUILDING_MAP[ch]
      const b  = BUILDING_BOXES[bm.key]
      const [sx, sy, sw, sh] = b.box
      const fw = bm.w * TILE_PX
      const scale = fw / sw
      bgCtx.drawImage(
        IMG.building, sx, sy, sw, sh,
        x * TILE_PX,
        y * TILE_PX + bm.h * TILE_PX - sh * scale,
        fw, sh * scale,
      )
    }
  }
}

// ── Draw one agent onto ctx (same as sim.js drawAgent) ────────────────────────
function drawAgent(ctx, agent, wx, wy, dir, IMG, walkTick) {
  const v = agentVisuals(agent.name)
  const walkFrame = (walkTick + nameHash(agent.name)) % 6
  const col = dir * 6 + walkFrame
  const sx  = col * BODY_CELL
  const sy  = v.skin * BODY_CELL

  const scale = TILE_PX / 18
  const dw = BODY_CELL * scale
  const dh = BODY_CELL * scale
  const dx = wx - dw / 2
  const dy = wy - dh + 2

  // shadow
  ctx.globalAlpha = 0.55
  ctx.drawImage(IMG.shadow, 0, 0, 32, 32, dx, dy + dh - 16, dw, dh / 2)
  ctx.globalAlpha = 1

  // body → outfit → hair (layered exactly like sim.js)
  ctx.drawImage(IMG.body, sx, sy, BODY_CELL, BODY_CELL, dx, dy, dw, dh)
  ctx.drawImage(IMG.outfits[v.outfit], sx, 0, BODY_CELL, BODY_CELL, dx, dy, dw, dh)
  ctx.drawImage(IMG.hairs, sx, v.hair * BODY_CELL, BODY_CELL, BODY_CELL, dx, dy, dw, dh)
}

// ── CityMap Component ─────────────────────────────────────────────────────────
export default function CityMap() {
  const canvasRef  = useRef(null)
  const bgRef      = useRef(null)   // offscreen background canvas
  const imgRef     = useRef(null)   // { tiles, building, trees, body, hairs, shadow, outfits[] }
  const frameRef   = useRef(null)
  const agentsRef  = useRef([])
  const selectedRef = useRef(null)
  const walkTickRef = useRef(0)
  const cityDivRef = useRef(null)
  const posMapRef  = useRef({})     // smoothed positions: { agentName: { wx, wy } }

  const agents        = useSimulation(s => s.agents)
  const selectedAgent = useSimulation(s => s.selectedAgent)
  const selectAgent   = useSimulation(s => s.selectAgent)
  const world         = useSimulation(s => s.world)

  // Keep refs in sync with React state so the rAF loop has current values
  useEffect(() => { agentsRef.current  = agents        }, [agents])
  useEffect(() => { selectedRef.current = selectedAgent }, [selectedAgent])

  // ── Load sprites + build background once ────────────────────────────────────
  useEffect(() => {
    const bg = document.createElement('canvas')
    bg.width = WORLD_W; bg.height = WORLD_H
    bgRef.current = bg

    async function init() {
      const [tiles, building, trees, body, hairs, shadow, ...outfitImgs] = await Promise.all([
        loadImg(SPRITE_PATHS.tiles),
        loadImg(SPRITE_PATHS.building),
        loadImg(SPRITE_PATHS.trees),
        loadImg(SPRITE_PATHS.body),
        loadImg(SPRITE_PATHS.hairs),
        loadImg(SPRITE_PATHS.shadow),
        ...SPRITE_PATHS.outfits.map(loadImg),
      ])
      imgRef.current = { tiles, building, trees, body, hairs, shadow, outfits: outfitImgs }
      const bgCtx = bg.getContext('2d')
      bgCtx.imageSmoothingEnabled = false
      renderBackground(bgCtx, imgRef.current)
    }
    init().catch(err => console.error('Sprite load error:', err))
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [])

  // ── Animation loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    const MOVE_SPEED = 2  // pixels per frame at 60fps

    let lastWalkAdvance = 0
    function loop(t) {
      if (t - lastWalkAdvance > 200) {
        walkTickRef.current = (walkTickRef.current + 1) % 6
        lastWalkAdvance = t
      }

      if (imgRef.current && bgRef.current) {
        ctx.clearRect(0, 0, WORLD_W, WORLD_H)
        ctx.drawImage(bgRef.current, 0, 0)

        const agents = agentsRef.current
        const posMap = posMapRef.current

        // Update positions: road-following waypoint movement
        agents.forEach((agent, idx) => {
          const target = agentTargetPos(agent, idx)
          const targetKey = `${Math.floor(target.wx / TILE_PX)},${Math.floor(target.wy / TILE_PX)}`
          const state = posMap[agent.name]

          if (!state) {
            // First appearance: snap directly to target
            posMap[agent.name] = { wx: target.wx, wy: target.wy, waypoints: [], targetKey, dir: DIR.DOWN }
            return
          }

          // Recompute road path when destination tile changes
          if (targetKey !== state.targetKey) {
            state.waypoints = buildWaypoints(state.wx, state.wy, target.wx, target.wy)
            state.targetKey = targetKey
          }

          // Advance one step along the waypoint path
          if (state.waypoints.length > 0) {
            const [wx, wy] = state.waypoints[0]
            const dx = wx - state.wx
            const dy = wy - state.wy
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist <= MOVE_SPEED) {
              state.wx = wx
              state.wy = wy
              state.waypoints.shift()
            } else {
              const step = MOVE_SPEED / dist
              state.wx += dx * step
              state.wy += dy * step
              // Update facing direction based on dominant movement axis
              if (Math.abs(dx) >= Math.abs(dy)) {
                state.dir = dx > 0 ? DIR.RIGHT : DIR.LEFT
              } else {
                state.dir = dy > 0 ? DIR.DOWN : DIR.UP
              }
            }
          }
        })

        // y-sort agents so those lower on screen render on top
        const sorted = [...agents].sort((a, b) => {
          const pa = posMap[a.name] || { wy: 0 }
          const pb = posMap[b.name] || { wy: 0 }
          return pa.wy - pb.wy
        })
        sorted.forEach(agent => {
          const pos = posMap[agent.name]
          if (pos) drawAgent(ctx, agent, pos.wx, pos.wy, pos.dir ?? DIR.DOWN, imgRef.current, walkTickRef.current)
        })

        // Selection ring on selected agent
        const sel = selectedRef.current
        if (sel) {
          const selAgent = agents.find(a => a.name === sel)
          if (selAgent) {
            const pos = posMap[selAgent.name]
            if (pos) {
              ctx.save()
              ctx.strokeStyle = 'rgba(127,217,87,0.9)'
              ctx.lineWidth = 1.5
              ctx.setLineDash([4, 3])
              ctx.beginPath()
              ctx.ellipse(pos.wx, pos.wy + 2, TILE_PX * 0.7, TILE_PX * 0.35, 0, 0, Math.PI * 2)
              ctx.stroke()
              ctx.restore()
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  // ── Click handling on canvas ─────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WORLD_W / rect.width
    const scaleY = WORLD_H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top)  * scaleY

    const scale = TILE_PX / 18
    const dw = BODY_CELL * scale
    const dh = BODY_CELL * scale

    let hit = null, hitDist = Infinity
    agentsRef.current.forEach(agent => {
      const pos = posMapRef.current[agent.name]
      if (!pos) return
      const { wx, wy } = pos
      const dx = wx - dw / 2
      const dy = wy - dh + 2
      if (mx >= dx && mx <= dx + dw && my >= dy && my <= dy + dh) {
        const dist = Math.hypot(mx - wx, my - wy)
        if (dist < hitDist) { hitDist = dist; hit = agent.name }
      }
    })
    if (hit) selectAgent(hit)
  }, [selectAgent])

  return (
    /* city-wrap — exact match of Agent World.html .city-wrap */
    <div style={{
      flex: 1,
      background: '#0b1117',
      border: '2px solid #1f2a36',
      borderRadius: '8px',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* city — exact match of Agent World.html .city */}
      <div
        ref={cityDivRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 11',
          background: '#0a0e14',
          border: '2px solid #000',
          overflow: 'hidden',
          borderRadius: '4px',
        }}
      >
        {/* World canvas — fills city div exactly like Agent World's canvas.world */}
        <canvas
          ref={canvasRef}
          width={WORLD_W}
          height={WORLD_H}
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            cursor: 'pointer',
            display: 'block',
          }}
        />

        {/* Speech bubbles — absolutely positioned DOM overlays like Agent World */}
        {agents.map((agent) => {
          const pos = posMapRef.current[agent.name]
          if (!pos) return null
          const { wx, wy } = pos
          const left = (wx / WORLD_W * 100) + '%'
          const top  = ((wy - TILE_PX * 1.5) / WORLD_H * 100) + '%'
          const label = agent.currentThought
            ? agent.currentThought.slice(0, 24)
            : agent.lastAction?.replace(/_/g, ' ')
          if (!label) return null
          return (
            <div
              key={agent.name}
              style={{
                position: 'absolute',
                left, top,
                transform: 'translate(-50%, -100%)',
                background: '#f3efe0',
                color: '#1a1a1a',
                fontFamily: '"VT323", monospace',
                fontSize: 13,
                padding: '3px 7px',
                border: '2px solid #1a1a1a',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '2px 2px 0 rgba(0,0,0,.5)',
                lineHeight: 1.1,
                zIndex: 5,
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
              {/* bubble tail */}
              <div style={{
                position: 'absolute',
                left: '50%', bottom: -5,
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '5px solid #1a1a1a',
              }}/>
            </div>
          )
        })}

        {/* HUD — tick counter and city name */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(10,16,40,0.82)', border: '2px solid #3d4f7a',
          padding: '4px 8px', fontSize: 7, color: '#4ecca3', zIndex: 20,
          fontFamily: "'Press Start 2P', monospace",
        }}>
          ⏱ TICK {world.tick}
        </div>
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(10,16,40,0.82)', border: '2px solid #3d4f7a',
          padding: '4px 8px', fontSize: 7, color: '#eaeaea', zIndex: 20,
          fontFamily: "'Press Start 2P', monospace",
        }}>
          📍 T-NAGAR
        </div>
      </div>
    </div>
  )
}

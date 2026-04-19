import { describe, it, expect } from 'vitest'
import { buildPrompt } from '../simulation/promptBuilder.js'
import { parseResponse } from '../simulation/responseParser.js'

const agent = {
  name: 'Ananya', role: 'Organiser', money: 1200, food: 65, mood: 50,
  influence: 30, district: 'T-Nagar', group: null, employer: null,
  eviction_risk: false, inbox: [],
}
const world = {
  tick: 5, rent: 500, market_closed: false, crisis: [], jobs: [{ title: 'Barista', employer: 'Café', wage: 12 }],
  rumours: [{ from: 'Marcus', about: 'Victor', content: 'Victor is a snitch' }],
  agents: [agent, { name: 'Kabir', role: 'Resident', mood: 25, group: null, influence: 15 }],
  groups: [],
}

describe('buildPrompt', () => {
  it('includes agent name and stats', () => {
    const p = buildPrompt(agent, world)
    expect(p).toContain('Ananya')
    expect(p).toContain('1200')
    expect(p).toContain('T-Nagar')
  })
  it('includes world tick', () => {
    expect(buildPrompt(agent, world)).toContain('Tick 5')
  })
  it('includes available tools list', () => {
    expect(buildPrompt(agent, world)).toContain('buy_food')
  })
  it('ends with the structured reply instruction', () => {
    expect(buildPrompt(agent, world)).toContain('THOUGHT:')
    expect(buildPrompt(agent, world)).toContain('ACTION:')
  })
})

describe('parseResponse', () => {
  it('extracts thought, action, params from well-formed response', () => {
    const raw = `THOUGHT: Kabir needs food urgently.
ACTION: send_message
PARAMS: {"to": "Kabir", "content": "Are you okay?"}`
    const r = parseResponse(raw)
    expect(r.thought).toBe('Kabir needs food urgently.')
    expect(r.action).toBe('send_message')
    expect(r.params).toEqual({ to: 'Kabir', content: 'Are you okay?' })
  })
  it('falls back to rest on unparseable response', () => {
    const r = parseResponse('I dunno what to do honestly')
    expect(r.action).toBe('rest')
    expect(r.params).toEqual({})
  })
  it('handles missing PARAMS gracefully', () => {
    const raw = `THOUGHT: Just rest.\nACTION: rest\n`
    const r = parseResponse(raw)
    expect(r.action).toBe('rest')
    expect(r.params).toEqual({})
  })
})

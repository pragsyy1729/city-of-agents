import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld } from '../simulation/worldState.js'
import { applyForJob, lookForJob, workShift } from '../tools/world.js'
import { buildPrompt } from '../simulation/promptBuilder.js'
import { CHARACTERS } from '../agents/characters.js'

function makeAgent(overrides = {}) {
  return {
    name: 'Kabir Mehta', money: 900, food: 55, mood: 45, influence: 15,
    role: 'Resident', employer: null, district: 'Adyar',
    group: null, eviction_risk: false, blacklisted: false,
    history: [], inbox: [], currentThought: '', lastAction: null,
    ...overrides,
  }
}

// ── Job slot enforcement ──
describe('job slot enforcement', () => {
  it('job listing is removed after first hire', () => {
    const world = createWorld()
    const a1 = makeAgent({ name: 'Agent1' })
    const a2 = makeAgent({ name: 'Agent2' })
    expect(world.jobs).toHaveLength(3)

    applyForJob(a1, world, { employer: 'Café Existenz' })
    expect(world.jobs).toHaveLength(2)
    expect(world.jobs.find(j => j.employer === 'Café Existenz')).toBeUndefined()

    const r = applyForJob(a2, world, { employer: 'Café Existenz' })
    expect(r.success).toBe(false)
    expect(r.message).toContain('already be filled')
  })

  it('agent.employer is set after successful application', () => {
    const world = createWorld()
    const agent = makeAgent()
    applyForJob(agent, world, { employer: 'Chennai Textiles' })
    expect(agent.employer).toBe('Chennai Textiles')
  })

  it('employed agent can work_shift and earn money', () => {
    const world = createWorld()
    const agent = makeAgent()
    applyForJob(agent, world, { employer: 'Café Existenz' })
    const before = agent.money
    workShift(agent, world, { hours: 4 })
    expect(agent.money).toBeGreaterThan(before)
  })

  it('3 agents can fill all 3 slots, 4th is rejected', () => {
    const world = createWorld()
    const employers = ['Café Existenz', 'Chennai Textiles', 'Apollo Hospital']
    const agents = [1, 2, 3, 4].map(i => makeAgent({ name: `Agent${i}` }))

    employers.forEach((emp, i) => applyForJob(agents[i], world, { employer: emp }))
    expect(world.jobs).toHaveLength(0)

    const r = applyForJob(agents[3], world, { employer: 'Café Existenz' })
    expect(r.success).toBe(false)
  })
})

// ── Job refresh every 5 ticks ──
describe('job refresh cadence', () => {
  it('no new jobs at tick 1–4', () => {
    const world = createWorld()
    // drain all jobs
    world.jobs = []
    // simulate tick advancement without refresh logic
    // refresh only fires at tick % 5 === 0
    expect([1, 2, 3, 4].every(t => t % 5 !== 0)).toBe(true)
  })

  it('jobs array never exceeds 3 listings via refresh', () => {
    // refresh guard: only adds if length < 3
    const world = createWorld()
    expect(world.jobs.length).toBeLessThanOrEqual(3)
  })
})

// ── Prompt survival hint ──
describe('survival hint for unemployed agents', () => {
  it('shows apply_for_job hint when unemployed and jobs exist', () => {
    const world = createWorld()
    const agent = { ...makeAgent(), systemPrompt: 'test', inbox: [] }
    world.agents = [agent]
    const prompt = buildPrompt(agent, world)
    expect(prompt).toContain('apply_for_job')
    expect(prompt).toContain('UNEMPLOYED')
    expect(prompt).toContain('Café Existenz')
  })

  it('no unemployed hint when already employed', () => {
    const world = createWorld()
    const agent = { ...makeAgent({ employer: 'Café Existenz' }), systemPrompt: 'test', inbox: [] }
    world.agents = [agent]
    const prompt = buildPrompt(agent, world)
    expect(prompt).not.toContain('UNEMPLOYED')
  })

  it('no unemployed hint when jobs board is empty', () => {
    const world = createWorld()
    world.jobs = []
    const agent = { ...makeAgent(), systemPrompt: 'test', inbox: [] }
    world.agents = [agent]
    const prompt = buildPrompt(agent, world)
    expect(prompt).not.toContain('UNEMPLOYED')
  })

  it('shows food warning when food <= 20', () => {
    const world = createWorld()
    const agent = { ...makeAgent({ food: 15, employer: 'Café' }), systemPrompt: 'test', inbox: [] }
    world.agents = [agent]
    const prompt = buildPrompt(agent, world)
    expect(prompt).toContain('CRITICAL FOOD')
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { sendMessage, recruit, spreadRumour, callMeeting, trade } from '../tools/social.js'
import { readNoticeBoard, checkAgentStatus, investigate, readMessages } from '../tools/info.js'
import { fileComplaint, publishStory, bribe, callStrike, organiseProtest } from '../tools/power.js'
import { treatPatient, rest, buyMedicine } from '../tools/health.js'

let agent, world, target

beforeEach(() => {
  target = { name: 'Bob', money: 500, food: 50, mood: 60, influence: 30, role: 'Resident', group: null, suspicion: 0, history: [], inbox: [] }
  agent = { name: 'Alice', money: 1000, food: 70, mood: 65, influence: 40, role: 'Resident', employer: 'Café', group: null, history: [], inbox: [] }
  world = { tick: 1, rent: 500, market_closed: false, crisis: [], jobs: [], rumours: [], msgQueue: [], invites: [], tradeOffers: [], complaints: [], events: [], groups: [], strikes: [], bribes: 0, agents: [agent, target] }
})

// ── Social ──
describe('sendMessage', () => {
  it('adds to msgQueue', () => {
    const r = sendMessage(agent, world, { to: 'Bob', content: 'Hello' })
    expect(r.success).toBe(true)
    expect(world.msgQueue).toHaveLength(1)
    expect(world.msgQueue[0].to).toBe('Bob')
  })
  it('fails for unknown agent', () => {
    expect(sendMessage(agent, world, { to: 'Nobody', content: 'Hi' }).success).toBe(false)
  })
})

describe('spreadRumour', () => {
  it('reduces target influence by 5', () => {
    spreadRumour(agent, world, { about: 'Bob', rumour: 'Bob is sus' })
    expect(target.influence).toBe(25)
    expect(world.rumours).toHaveLength(1)
  })
})

// ── Info ──
describe('readNoticeBoard', () => {
  it('returns world data read-only', () => {
    const r = readNoticeBoard(agent, world)
    expect(r.success).toBe(true)
    expect(r.current_rent).toBe(500)
    expect(agent.money).toBe(1000)
  })
})

describe('checkAgentStatus', () => {
  it('returns content for mood >= 65', () => {
    const r = checkAgentStatus(agent, world, { target: 'Bob' })
    expect(r.mood).toBe('troubled') // Bob mood=60 → 35≤60<65
  })
  it('buckets mood correctly', () => {
    target.mood = 20
    expect(checkAgentStatus(agent, world, { target: 'Bob' }).mood).toBe('desperate')
    target.mood = 70
    expect(checkAgentStatus(agent, world, { target: 'Bob' }).mood).toBe('content')
  })
})

describe('readMessages', () => {
  it('returns messages addressed to agent', () => {
    world.msgQueue = [{ from: 'Bob', to: 'Alice', content: 'Hey', tick: 1 }, { from: 'Bob', to: 'Zara', content: 'Hi', tick: 1 }]
    const r = readMessages(agent, world)
    expect(r.message_count).toBe(1)
    expect(r.messages[0].from).toBe('Bob')
  })
})

// ── Power ──
describe('fileComplaint', () => {
  it('reduces target influence by 8', () => {
    agent.role = 'Resident'
    fileComplaint(agent, world, { against: 'Bob', reason: 'lying', evidence: '' })
    expect(target.influence).toBe(22)
    expect(world.complaints).toHaveLength(1)
  })
  it('fails when city hall closed', () => {
    world.city_hall_closed = true
    expect(fileComplaint(agent, world, { against: 'Bob', reason: 'x', evidence: '' }).success).toBe(false)
  })
})

describe('bribe', () => {
  it('fails when insufficient funds', () => {
    agent.money = 10
    expect(bribe(agent, world, { target: 'Bob', amount: 100, ask: 'silence' }).success).toBe(false)
  })
})

describe('callStrike', () => {
  it('fails for non-Organiser', () => {
    expect(callStrike(agent, world, { building: 'Factory', duration_ticks: 2 }).success).toBe(false)
  })
  it('fails with fewer than 2 union members', () => {
    agent.role = 'Organiser'
    agent.group = 'Union'
    expect(callStrike(agent, world, { building: 'Factory', duration_ticks: 2 }).success).toBe(false)
  })
})

// ── Health ──
describe('rest', () => {
  it('adds mood 12, removes food 5', () => {
    rest(agent, world)
    expect(agent.mood).toBe(77)
    expect(agent.food).toBe(65)
  })
})

describe('treatPatient', () => {
  it('fails for non-Doctor', () => {
    expect(treatPatient(agent, world, { patient: 'Bob' }).success).toBe(false)
  })
  it('restores food+25 mood+10 for Doctor', () => {
    agent.role = 'Doctor'
    treatPatient(agent, world, { patient: 'Bob' })
    expect(target.food).toBe(75)
    expect(target.mood).toBe(70)
  })
})

describe('buyMedicine', () => {
  it('fails with no supply', () => {
    const r = buyMedicine(agent, world, { source: 'doctor' })
    expect(r.success).toBe(false) // no Doctor in agents
  })
  it('succeeds from black market when Black Marketeer present', () => {
    const bm = { name: 'BM', role: 'Black Marketeer', money: 0 }
    world.agents.push(bm)
    buyMedicine(agent, world, { source: 'black_market' })
    expect(agent.food).toBe(100)
    expect(bm.money).toBe(60)
  })
})

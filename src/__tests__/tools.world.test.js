import { describe, it, expect, beforeEach } from 'vitest'
import { buyFood, payRent, workShift, lookForJob, moveDistrict } from '../tools/world.js'

let agent, world

beforeEach(() => {
  agent = { name: 'Test', money: 1000, food: 50, mood: 60, employer: 'Café', district: 'T-Nagar', eviction_risk: false, eviction_streak: 0, blacklisted: false, history: [] }
  world = { tick: 1, rent: 500, market_closed: false, crisis: [], jobs: [{ title: 'Barista', employer: 'Café', wage: 12 }] }
})

describe('buyFood', () => {
  it('deducts money and adds food on success', () => {
    const r = buyFood(agent, world, { quantity: 2 })
    expect(r.success).toBe(true)
    expect(agent.money).toBe(920)
    expect(agent.food).toBe(90)
  })
  it('fails when market is closed', () => {
    world.market_closed = true
    const r = buyFood(agent, world, { quantity: 1 })
    expect(r.success).toBe(false)
    expect(agent.money).toBe(1000)
  })
  it('fails when insufficient funds', () => {
    agent.money = 10
    const r = buyFood(agent, world, { quantity: 1 })
    expect(r.success).toBe(false)
  })
})

describe('payRent', () => {
  it('deducts rent and resets eviction streak', () => {
    agent.eviction_streak = 2
    const r = payRent(agent, world)
    expect(r.success).toBe(true)
    expect(agent.money).toBe(500)
    expect(agent.eviction_streak).toBe(0)
  })
  it('sets eviction_risk when cannot afford', () => {
    agent.money = 100
    payRent(agent, world)
    expect(agent.eviction_risk).toBe(true)
    expect(agent.money).toBe(100)
  })
})

describe('workShift', () => {
  it('adds money, reduces food and mood', () => {
    const r = workShift(agent, world, { hours: 4 })
    expect(r.success).toBe(true)
    expect(agent.money).toBe(1048)
    expect(agent.food).toBe(30)
    expect(agent.mood).toBe(57)
  })
  it('fails with no employer', () => {
    agent.employer = null
    expect(workShift(agent, world, { hours: 4 }).success).toBe(false)
  })
  it('fails during factory_fire crisis', () => {
    world.crisis = ['factory_fire']
    expect(workShift(agent, world, { hours: 4 }).success).toBe(false)
  })
  it('clamps hours to 1–8', () => {
    workShift(agent, world, { hours: 99 })
    expect(agent.money).toBe(1096)
  })
})

describe('lookForJob', () => {
  it('returns available jobs read-only', () => {
    const r = lookForJob(agent, world)
    expect(r.success).toBe(true)
    expect(r.listings).toHaveLength(1)
    expect(agent.money).toBe(1000)
  })
})

describe('moveDistrict', () => {
  it('deducts 200 and updates district', () => {
    const r = moveDistrict(agent, world, { target_district: 'Adyar' })
    expect(r.success).toBe(true)
    expect(agent.money).toBe(800)
    expect(agent.district).toBe('Adyar')
    expect(agent.mood).toBe(50)
  })
  it('fails when blacklisted', () => {
    agent.blacklisted = true
    expect(moveDistrict(agent, world, { target_district: 'Adyar' }).success).toBe(false)
  })
  it('fails when insufficient funds', () => {
    agent.money = 100
    expect(moveDistrict(agent, world, { target_district: 'Adyar' }).success).toBe(false)
  })
})

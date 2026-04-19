import { describe, it, expect } from 'vitest'
import { createWorld } from '../simulation/worldState.js'

describe('createWorld', () => {
  it('returns tick 1 with open market', () => {
    const w = createWorld()
    expect(w.tick).toBe(1)
    expect(w.market_closed).toBe(false)
  })
  it('has 3 jobs', () => {
    expect(createWorld().jobs).toHaveLength(3)
  })
  it('starts with empty events and crisis', () => {
    const w = createWorld()
    expect(w.events).toEqual([])
    expect(w.crisis).toEqual([])
  })
})

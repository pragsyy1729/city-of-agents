import { describe, it, expect } from 'vitest'
import { CHARACTERS, TOOL_TO_BUILDING } from '../agents/characters.js'

describe('CHARACTERS', () => {
  it('has exactly 15 characters', () => {
    expect(CHARACTERS).toHaveLength(15)
  })
  it('every character has required fields', () => {
    for (const c of CHARACTERS) {
      expect(c.name).toBeTruthy()
      expect(c.color).toMatch(/^#/)
      expect(c.systemPrompt).toBeTruthy()
      expect(typeof c.params.money).toBe('number')
      expect(typeof c.params.mood).toBe('number')
      expect(Array.isArray(c.params.inbox)).toBe(true)
    }
  })
  it('has an Organiser, Doctor, Journalist, Official, Black Marketeer', () => {
    const roles = CHARACTERS.map(c => c.params.role)
    expect(roles).toContain('Organiser')
    expect(roles).toContain('Doctor')
    expect(roles).toContain('Journalist')
    expect(roles).toContain('Official')
    expect(roles).toContain('Black Marketeer')
  })
})

describe('TOOL_TO_BUILDING', () => {
  it('maps all 23 tools', () => {
    expect(Object.keys(TOOL_TO_BUILDING)).toHaveLength(23)
  })
})

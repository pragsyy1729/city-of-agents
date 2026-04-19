import { create } from 'zustand'
import { CHARACTERS } from '../agents/characters.js'
import { createWorld } from '../simulation/worldState.js'
import { runTick } from '../simulation/engine.js'

function freshAgents() {
  return CHARACTERS.map(c => ({
    ...c.params,
    name: c.name,
    systemPrompt: c.systemPrompt,
    color: c.color,
    face: c.face,
    currentThought: '',
    lastAction: null,
    lastResult: null,
    inbox: [],
  }))
}

export const useSimulation = create((set, get) => ({
  agents: freshAgents(),
  world: createWorld(),
  logs: [],
  events: [],
  isRunning: false,
  speed: 2,
  selectedAgent: null,
  apiKey: null,
  _tickTimer: null,
  _stepping: false,

  setApiKey: (key) => {
    set({ apiKey: key })
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      chrome.storage.sync.set({ nvidia_api_key: key })
    }
  },

  selectAgent: (name) => set({ selectedAgent: name }),

  setSpeed: (speed) => {
    set({ speed })
    const { isRunning } = get()
    if (isRunning) { get()._stopTimer(); get()._startTimer() }
  },

  startSimulation: () => {
    set({ isRunning: true })
    get()._startTimer()
  },

  pauseSimulation: () => {
    set({ isRunning: false })
    get()._stopTimer()
  },

  stepOnce: async () => {
    if (get()._stepping) return   // prevent concurrent ticks
    const { agents, world, apiKey } = get()
    if (!apiKey) return
    set({ _stepping: true })
    const newLogs = []
    const newEvents = []
    await runTick(agents, world, apiKey, (entry) => {
      newLogs.push(entry)
      newEvents.push({
        tick: entry.tick,
        agentName: entry.agent,
        agentColor: agents.find(a => a.name === entry.agent)?.color ?? '#fff',
        action: entry.parsedAction,
        result: entry.toolResult.message,
        success: entry.toolResult.success,
      })
    })
    // Sanitise any NaN that crept in via bad LLM params
    agents.forEach(a => {
      if (isNaN(a.food))   a.food   = 50
      if (isNaN(a.money))  a.money  = 0
      if (isNaN(a.mood))   a.mood   = 50
    })
    set(s => ({
      agents: [...agents],
      world: { ...world },
      logs: [...s.logs, ...newLogs],
      events: [...s.events, ...newEvents].slice(-100),
      _stepping: false,
    }))
  },

  _startTimer: () => {
    get()._stopTimer()
    // Delay between ticks (after the previous tick fully completes)
    const delays = { 1: 8000, 2: 4000, 5: 1000 }
    const delay = delays[get().speed] ?? 4000

    async function tick() {
      if (!get().isRunning) return
      await get().stepOnce()
      if (get().isRunning) {
        set({ _tickTimer: setTimeout(tick, delay) })
      }
    }

    // Start first tick immediately
    set({ _tickTimer: setTimeout(tick, 0) })
  },

  _stopTimer: () => {
    const { _tickTimer } = get()
    if (_tickTimer) { clearTimeout(_tickTimer); set({ _tickTimer: null }) }
  },

  clearLogs: () => set({ logs: [] }),

  resetSimulation: () => {
    get()._stopTimer()
    set({ agents: freshAgents(), world: createWorld(), logs: [], events: [], isRunning: false, selectedAgent: null })
  },
}))

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
    const { agents, world, apiKey } = get()
    if (!apiKey) return
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
    }))
  },

  _startTimer: () => {
    const { speed } = get()
    get()._stopTimer()
    const intervals = [60000, 30000, 20000, 15000, 12000]
    const intervalMs = intervals[speed - 1] ?? 30000
    const id = setInterval(() => get().stepOnce(), intervalMs)
    set({ _tickTimer: id })
  },

  _stopTimer: () => {
    const { _tickTimer } = get()
    if (_tickTimer) { clearInterval(_tickTimer); set({ _tickTimer: null }) }
  },

  clearLogs: () => set({ logs: [] }),

  resetSimulation: () => {
    get()._stopTimer()
    set({ agents: freshAgents(), world: createWorld(), logs: [], events: [], isRunning: false, selectedAgent: null })
  },
}))

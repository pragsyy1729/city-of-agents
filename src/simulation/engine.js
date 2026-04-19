import { callNvidia } from '../api/nvidia.js'
import { buildPrompt } from './promptBuilder.js'
import { parseResponse } from './responseParser.js'
import { callTool } from '../tools/registry.js'

function deliverMessages(agents, world) {
  if (!world.msgQueue?.length) return
  const agentsByName = Object.fromEntries(agents.map(a => [a.name, a]))
  for (const msg of world.msgQueue) {
    const recipient = agentsByName[msg.to]
    if (recipient) {
      if (!recipient.inbox) recipient.inbox = []
      recipient.inbox.push({ from: msg.from, content: msg.content, tick: msg.tick })
      if (recipient.inbox.length > 10) recipient.inbox.shift() // keep last 10
    }
  }
  world.msgQueue = []
}

export async function runTick(agents, world, apiKey, onAgentDone) {
  world.agents = agents  // keep world.agents in sync
  deliverMessages(agents, world)  // deliver pending messages before anyone acts
  const shuffled = [...agents].sort(() => Math.random() - 0.5)

  for (const agent of shuffled) {
    const userPrompt = buildPrompt(agent, world)
    const stateBefore = { money: agent.money, food: agent.food, mood: agent.mood, influence: agent.influence }

    let raw = '', thought = '', action = 'rest', params = {}, toolCalls = [], apiLatencyMs = 0

    try {
      const res = await callNvidia(apiKey, agent.systemPrompt, userPrompt)
      raw = res.raw
      apiLatencyMs = res.apiLatencyMs
      ;({ thought, action, params, toolCalls } = parseResponse(raw))
    } catch (err) {
      raw = `[API ERROR: ${err.message}]`
      toolCalls = []
    }

    // Execute all tool calls in order (1–4 per tick)
    const calls = toolCalls.length > 0 ? toolCalls.slice(0, 4) : [{ tool: action, input: params }]
    let toolResult = { success: true, message: '' }
    for (const tc of calls) {
      // Coerce malformed apply_for_job input: LLM sometimes sends string instead of {employer}
      if (tc.tool === 'apply_for_job') {
        if (typeof tc.input === 'string') {
          tc.input = { employer: tc.input }
        } else if (tc.input && typeof tc.input.employer === 'string') {
          // Strip job title prefix: "Barista at Café Existenz" → "Café Existenz"
          const m = tc.input.employer.match(/\bat\s+(.+)$/i)
          if (m) tc.input.employer = m[1].trim()
        }
      }
      let result = callTool(tc.tool, agent, world, tc.input ?? {})
      if (!result.success && result.message?.includes('not found')) {
        result = callTool('rest', agent, world, {})
        tc.tool = 'rest'
      }
      toolResult = result
      // Record every executed tool call in agent history (Flaw 1 fix)
      if (!agent.history) agent.history = []
      agent.history.push({ tick: world.tick, tool: tc.tool, result: result.message })
      if (agent.history.length > 5) agent.history.shift()
    }
    action = calls[0].tool
    const stateAfter = { money: agent.money, food: agent.food, mood: agent.mood, influence: agent.influence }

    const logEntry = {
      tick: world.tick,
      timestamp: new Date().toISOString(),
      agent: agent.name,
      role: agent.role,
      systemPrompt: agent.systemPrompt,
      userPrompt,
      rawResponse: raw,
      parsedThought: thought,
      parsedAction: action,
      parsedParams: params,
      toolResult,
      stateBefore,
      stateAfter,
      apiLatencyMs,
    }

    agent.currentThought = thought
    agent.lastAction = action
    agent.lastResult = toolResult.message

    onAgentDone(logEntry)
  }

  // Passive salary for full-time public servants (Doctor + Official) every tick
  for (const agent of agents) {
    if (agent.role === 'Doctor' || agent.role === 'Official') agent.money += 25
  }

  // Every 3 ticks, refresh job board to 5 openings
  if (world.tick % 3 === 0) {
    const pool = [
      { title: 'Barista', employer: 'Café Existenz', wage: 100 },
      { title: 'Factory Hand', employer: 'Chennai Textiles', wage: 100 },
      { title: 'Nurse', employer: 'Apollo Hospital', wage: 100 },
      { title: 'Delivery Rider', employer: 'QuickRun Logistics', wage: 100 },
      { title: 'Sales Assistant', employer: 'T-Nagar Textiles', wage: 100 },
    ]
    const employed = new Set((world.agents ?? []).map(a => a.employer).filter(Boolean))
    world.jobs = pool.filter(j => !employed.has(j.employer))
  }

  world.tick += 1
}

function agentsMap(world) { return Object.fromEntries(world.agents.map(a => [a.name, a])) }

export function sendMessage(agent, world, { to, content }) {
  if (!agentsMap(world)[to]) return { success: false, message: `Agent '${to}' not found.` }
  world.msgQueue.push({ from: agent.name, to, content, tick: world.tick })
  return { success: true, message: `Message sent to ${to}.` }
}

export function recruit(agent, world, { target, cause }) {
  const t = agentsMap(world)[target]
  if (!t) return { success: false, message: `Agent '${target}' not found.` }
  if (t.group && agent.group && t.group !== agent.group) return { success: false, message: `${target} is in a rival group.` }
  world.invites.push({ from: agent.name, to: target, cause, tick: world.tick })
  return { success: true, message: `Invite sent to ${target}. Resolved next tick.` }
}

export function spreadRumour(agent, world, { about, rumour }) {
  world.rumours.push({ from: agent.name, about, content: rumour })
  const t = agentsMap(world)[about]
  if (t) t.influence = Math.max(0, (t.influence ?? 0) - 5)
  return { success: true, message: `Rumour about '${about}' spread. Influence -5.` }
}

export function callMeeting(agent, world, { location, agenda }) {
  if (!agent.group) return { success: false, message: 'No group — cannot call meeting.' }
  const members = world.agents.filter(a => a.group === agent.group && a.name !== agent.name)
  members.forEach(m => world.msgQueue.push({ from: agent.name, to: m.name, content: `Meeting at ${location}: ${agenda}`, tick: world.tick }))
  return { success: true, message: `Meeting called. ${members.length} member(s) notified.` }
}

export function trade(agent, world, { with: withAgent, offer, request }) {
  if (!agentsMap(world)[withAgent]) return { success: false, message: `Agent '${withAgent}' not found.` }
  world.tradeOffers.push({ from: agent.name, to: withAgent, offer, request })
  return { success: true, message: `Trade proposal sent to ${withAgent}. Resolved next tick.` }
}

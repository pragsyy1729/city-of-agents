function agentsMap(world) { return Object.fromEntries(world.agents.map(a => [a.name, a])) }

export function readNoticeBoard(agent, world) {
  return {
    success: true,
    jobs_available: world.jobs ?? [],
    current_rent: world.rent ?? 500,
    active_crises: world.crisis ?? [],
    recent_rumours: (world.rumours ?? []).slice(-3),
    active_groups: (world.groups ?? []).map(g => g.name),
  }
}

export function checkAgentStatus(agent, world, { target }) {
  const t = agentsMap(world)[target]
  if (!t) return { success: false, message: `Agent '${target}' not found.` }
  const mood = t.mood >= 65 ? 'content' : t.mood >= 35 ? 'troubled' : 'desperate'
  return { success: true, name: t.name, role: t.role ?? 'Resident', mood, group: t.group ?? 'none', influence: t.influence ?? 0 }
}

export function investigate(agent, world, { subject, focus }) {
  const t = agentsMap(world)[subject]
  if (!t) return { success: false, message: `Agent '${subject}' not found.` }
  t.suspicion = (t.suspicion ?? 0) + 5
  if (Math.random() < 0.65) {
    const last = t.history?.at(-1) ?? null
    return { success: true, finding: { money: t.money, last_action: last, focus } }
  }
  if (Math.random() < 0.5) { t.suspicion += 10; return { success: false, message: `${subject} noticed (suspicion +10).` } }
  return { success: false, message: 'Nothing found.' }
}

export function readMessages(agent, world) {
  const inbox = (world.msgQueue ?? []).filter(m => m.to === agent.name && m.tick >= world.tick - 1)
  return { success: true, message_count: inbox.length, messages: inbox.map(m => ({ from: m.from, content: m.content })) }
}

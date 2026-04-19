function agentsMap(world) { return Object.fromEntries(world.agents.map(a => [a.name, a])) }

export function reportSuspicious(agent, world, { suspect, reason }) {
  if (agent.name === suspect) return { success: false, message: 'Cannot report yourself.' }
  const inspector = world.agents.find(a => a.role === 'Official')
  if (!inspector) return { success: false, message: 'No inspector available.' }
  const t = agentsMap(world)[suspect]
  if (!t) return { success: false, message: `Agent '${suspect}' not found.` }
  t.suspicion = Math.min(100, (t.suspicion ?? 0) + 15)
  inspector.influence = Math.min(100, (inspector.influence ?? 0) + 5)
  world.msgQueue.push({ from: agent.name, to: inspector.name, content: `Report: ${agent.name} suspects ${suspect} — "${reason}". Suspicion now ${t.suspicion}.`, tick: world.tick })
  return { success: true, message: `Reported ${suspect} to ${inspector.name}. Suspicion +15. Inspector notified.` }
}

export function fileComplaint(agent, world, { against, reason, evidence = '' }) {
  if (world.city_hall_closed) return { success: false, message: 'City Hall closed.' }
  const t = agentsMap(world)[against]
  if (!t) return { success: false, message: `Agent '${against}' not found.` }
  if (t.political_immunity) { world.events.push({ type: 'immunity_check', against, tick: world.tick }); return { success: false, message: `${against} has political immunity.` } }
  world.complaints.push({ from: agent.name, against, reason, evidence, tick: world.tick })
  t.influence = Math.max(0, (t.influence ?? 0) - 8)
  world.msgQueue.push({ from: 'City Hall', to: against, content: `Complaint filed by ${agent.name}: ${reason}`, tick: world.tick })
  return { success: true, case_number: world.complaints.length, message: `Complaint #${world.complaints.length} filed. ${against}'s influence -8.` }
}

export function publishStory(agent, world, { headline, about, evidence }) {
  if (agent.role !== 'Journalist') return { success: false, message: 'Only Journalists can publish.' }
  if (!evidence) return { success: false, message: 'Insufficient evidence.' }
  const t = agentsMap(world)[about]
  if (!t) return { success: false, message: `Agent '${about}' not found.` }
  const hit = evidence.length > 20 ? 40 : 20
  const earnings = evidence.length > 40 ? 400 : evidence.length > 20 ? 250 : 150
  t.influence = Math.max(0, (t.influence ?? 0) - hit)
  t.mood = Math.max(0, (t.mood ?? 50) - 15)
  agent.influence = (agent.influence ?? 0) + 15
  world.events.push({ type: 'expose', headline, tick: world.tick })
  if (Math.random() < 0.2) {
    const legalFee = 50
    agent.money = Math.max(0, agent.money + earnings - legalFee)
    return { success: true, message: `Published '${headline}'. Earned ₹${earnings - legalFee} (after ₹${legalFee} legal fee). ${about} influence -${hit}.` }
  }
  agent.money += earnings
  return { success: true, message: `Published '${headline}'. Earned ₹${earnings}. ${about} influence -${hit}, mood -15. Your influence +15.` }
}

export function bribe(agent, world, { target, amount, ask }) {
  amount = parseInt(amount) || 0
  if (amount <= 0) return { success: false, message: 'Invalid bribe amount.' }
  if (agent.money < amount) return { success: false, message: `Need ₹${amount}, have ₹${agent.money}.` }
  const t = agentsMap(world)[target]
  if (!t) return { success: false, message: `Agent '${target}' not found.` }
  const journalists = world.agents.filter(a => a.role === 'Journalist' && a.name !== agent.name)
  if (journalists.length && Math.random() < 0.1) { world.events.push({ type: 'expose_risk', involving: agent.name, tick: world.tick }); return { success: false, message: 'Journalist nearby — bribe aborted.' } }
  if (Math.random() < 0.3) return { success: false, message: `${target} refused the bribe.` }
  agent.money -= amount; t.money = (t.money ?? 0) + amount; world.bribes = (world.bribes ?? 0) + 1
  return { success: true, message: `Bribed ${target} ₹${amount}. Ask: '${ask}'.` }
}

export function callStrike(agent, world, { building, duration_ticks }) {
  if (agent.role !== 'Organiser') return { success: false, message: 'Only Organisers can call a strike.' }
  const members = world.agents.filter(a => a.group === agent.group)
  if (members.length < 2) return { success: false, message: 'Union needs 2+ members.' }
  world.strikes.push({ building, until: world.tick + duration_ticks })
  return { success: true, message: `Strike at '${building}' for ${duration_ticks} tick(s).` }
}

export function organiseProtest(agent, world, { demand, location }) {
  if (world.crisis?.includes('crackdown')) {
    world.agents.filter(a => a.group === agent.group).forEach(a => { a.mood = Math.max(0, a.mood - 10) })
    return { success: false, message: 'Crackdown — protest dispersed. Group mood -10.' }
  }
  const members = world.agents.filter(a => a.group === agent.group)
  members.forEach(a => { a.mood = Math.min(100, a.mood + 15); a.district = location })
  world.agents.filter(a => a.role === 'Official').forEach(a => { a.influence = Math.max(0, a.influence - 10) })
  world.events.push({ type: 'protest', demand, tick: world.tick })
  return { success: true, message: `Protest at '${location}'. ${members.length} members mood +15. Officials influence -10.` }
}

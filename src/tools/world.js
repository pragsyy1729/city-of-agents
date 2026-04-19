export function buyFood(agent, world, { quantity }) {
  const qty = Math.max(1, Math.min(5, parseInt(quantity) || 1))
  const cost = qty * 40
  if (world.market_closed) return { success: false, message: 'market closed' }
  if (agent.money < cost) return { success: false, message: `Need ₹${cost}, have ₹${agent.money}` }
  agent.money -= cost
  agent.food = Math.min(100, agent.food + qty * 20)
  return { success: true, message: `Bought ${qty} unit(s) for ₹${cost}. Food +${qty * 20}.` }
}

export function payRent(agent, world) {
  const rent = world.rent ?? 500
  if (agent.money < rent) {
    agent.eviction_risk = true
    return { success: false, message: `Cannot pay rent (₹${rent}). eviction_risk = true.` }
  }
  agent.money -= rent
  agent.eviction_streak = 0
  agent.eviction_risk = false
  return { success: true, message: `Rent ₹${rent} paid.` }
}

export function workShift(agent, world, { hours }) {
  if (!agent.employer) return { success: false, message: 'No employer.' }
  if (world.crisis?.includes('factory_fire')) return { success: false, message: 'factory_fire — shift cancelled.' }
  const h = Math.max(1, Math.min(8, parseInt(hours) || 4))
  agent.money += h * 100
  agent.food = Math.max(0, agent.food - h * 5)
  agent.mood = Math.max(0, agent.mood - 3)
  return { success: true, message: `Worked ${h}h. Earned ₹${h * 100}. Food -${h * 5}. Mood -3.` }
}

export function lookForJob(agent, world) {
  if (agent.employer) return { success: false, message: `Already employed at ${agent.employer}. Quit before looking for another job.` }
  const jobs = world.jobs ?? []
  return { success: true, message: `${jobs.length} job(s) found.`, listings: jobs }
}

export function applyForJob(agent, world, { employer }) {
  if (agent.blacklisted) return { success: false, message: 'Blacklisted — no employer will hire you.' }
  const idx = (world.jobs ?? []).findIndex(j => j.employer === employer)
  if (idx === -1) return { success: false, message: `No open position at '${employer}'. Position may already be filled.` }
  const job = world.jobs[idx]
  world.jobs.splice(idx, 1)  // position filled — remove listing
  const old = agent.employer
  agent.employer = employer
  agent.mood = Math.min(100, agent.mood + 10)
  return { success: true, message: `Hired at ${employer} as ${job.title} (₹${job.wage}/hr).${old ? ` Left ${old}.` : ''} Mood +10.` }
}

export function moveDistrict(agent, world, { target_district }) {
  if (agent.blacklisted) return { success: false, message: 'Blacklisted — cannot move.' }
  if (agent.money < 200) return { success: false, message: `Need ₹200, have ₹${agent.money}.` }
  const old = agent.district
  agent.money -= 200
  agent.mood = Math.max(0, agent.mood - 10)
  agent.district = target_district
  return { success: true, message: `Moved from ${old} to ${target_district}. Cost ₹200. Mood -10.` }
}

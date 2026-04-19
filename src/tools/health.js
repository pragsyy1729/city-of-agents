function agentsMap(world) { return Object.fromEntries(world.agents.map(a => [a.name, a])) }

export function consultDoctor(agent, world) {
  const doctor = world.agents.find(a => a.role === 'Doctor')
  if (!doctor) return { success: false, message: 'No doctor available in the simulation.' }
  if (agent.name === doctor.name) return { success: false, message: 'You are the doctor.' }
  const cost = 150
  if (agent.money < cost) return { success: false, message: `Consultation costs ₹${cost}. Have ₹${agent.money}.` }
  agent.money -= cost
  agent.food = Math.min(100, agent.food + 20)
  agent.mood = Math.min(100, agent.mood + 15)
  doctor.money += cost
  world.msgQueue.push({ from: agent.name, to: doctor.name, content: `${agent.name} came to you for a consultation and paid ₹${cost}.`, tick: world.tick })
  return { success: true, message: `Consulted ${doctor.name}. Paid ₹${cost}. Food +20, Mood +15.` }
}

export function treatPatient(agent, world, { patient }) {
  if (agent.role !== 'Doctor') return { success: false, message: 'Only Doctors can treat patients.' }
  const t = agentsMap(world)[patient]
  if (!t) return { success: false, message: `Patient '${patient}' not found.` }
  t.food = Math.min(100, (t.food ?? 50) + 25)
  t.mood = Math.min(100, (t.mood ?? 50) + 10)
  world.msgQueue.push({ from: agent.name, to: patient, content: `${agent.name} treated you. Food +25, Mood +10.`, tick: world.tick })
  return { success: true, message: `Treated ${patient}. Food +25, mood +10.` }
}

export function rest(agent, world) {
  agent.mood = Math.min(100, agent.mood + 12)
  agent.food = Math.max(0, agent.food - 5)
  return { success: true, message: 'Rested. Mood +12, Food -5.' }
}

export function buyMedicine(agent, world, { source }) {
  const src = source?.toLowerCase()
  if (!['doctor', 'black_market'].includes(src)) return { success: false, message: "source must be 'doctor' or 'black_market'." }
  const cost = src === 'doctor' ? 40 : 60
  const role = src === 'doctor' ? 'Doctor' : 'Black Marketeer'
  const supplier = world.agents.find(a => a.role === role)
  if (!supplier) return { success: false, message: `No ${src} supply available.` }
  if (agent.money < cost) return { success: false, message: `Need ₹${cost}, have ₹${agent.money}.` }
  agent.money -= cost
  agent.food = Math.min(100, agent.food + 30)
  if (src === 'black_market') supplier.money += 60
  return { success: true, message: `Bought medicine from ${src} for ₹${cost}. Food +30.` }
}

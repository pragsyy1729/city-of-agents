// Dev: Vite proxy. Production: Cloudflare Worker proxy (handles CORS).
const NVIDIA_BASE = import.meta.env.DEV
  ? '/nvidia-api/v1'
  : 'https://city-of-agents.pragathivetrivelmurugan-35b.workers.dev'

export async function callNvidia(apiKey, systemPrompt, userPrompt) {
  const start = Date.now()
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
      messages: [
        { role: 'system', content: '/no_think' },
        { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` },
      ],
      temperature: 0,
      top_p: 1,
      max_tokens: 65536,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  })
  if (!res.ok) throw new Error(`NVIDIA API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  return { raw, apiLatencyMs: Date.now() - start }
}

export function parseResponse(raw) {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallback()
    const cleaned = jsonMatch[0].replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
    const parsed = JSON.parse(cleaned)
    const thought = typeof parsed.thoughts === 'string' ? parsed.thoughts.trim() : ''
    const toolCalls = Array.isArray(parsed.tool_calls) ? parsed.tool_calls : []
    const first = toolCalls[0] ?? { tool: 'rest', input: {} }
    return {
      thought,
      action: first.tool ?? 'rest',
      params: first.input ?? {},
      toolCalls,
    }
  } catch {
    return fallback()
  }
}

function fallback() {
  return { thought: '', action: 'rest', params: {}, toolCalls: [] }
}

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  getDashboard: (userId: string) => req<any>(`/dashboard/${userId}`),
  listPlans: (userId: string) => req<any[]>(`/plans/${userId}`),
  createPlan: (body: {
    user_id: string
    skill: string
    starting_level: string
    target_level: string
    target_date?: string
    preferred_style?: string
  }) => req<any>('/plans', { method: 'POST', body: JSON.stringify(body) }),
  teach: (planId: string, nodeId: string, userId: string) =>
    req<any>(`/teach/${planId}/${nodeId}?user_id=${userId}`),
  getProfile: (userId: string) => req<any>(`/profile/${userId}`),
  getNextAction: (planId: string, userId: string) => req<any>(`/next-action/${planId}?user_id=${userId}`),
  getLLMStats: (userId: string) => req<any>(`/llm-stats/${userId}`),
  getReviewSchedule: (userId: string) => req<any>(`/review-schedule/${userId}`),
  completeReview: (body: { schedule_id: string; recall_score: number }) =>
    req<any>('/complete-review', { method: 'POST', body: JSON.stringify(body) }),
  listSources: (userId: string, planId?: string) =>
    req<any[]>(`/sources/${userId}${planId ? `?plan_id=${planId}` : ''}`),
  ingestSource: async (file: File, planId: string, userId: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('plan_id', planId)
    form.append('user_id', userId)
    const res = await fetch(`${BASE}/ingest`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  getRules: (userId: string) => req<any[]>(`/rules/${userId}`),
  updateRule: (ruleId: string, body: { enabled: boolean; rule_config?: any }) =>
    req<any>(`/rules/${ruleId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getOutcomes: (userId: string) => req<any>(`/outcomes/${userId}`),
  evaluate: (body: {
    plan_id: string
    node_id: string
    answer: string
    time_taken_seconds?: number
  }) => req<any>('/evaluate', { method: 'POST', body: JSON.stringify(body) }),
}

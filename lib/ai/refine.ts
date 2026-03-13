import Anthropic from '@anthropic-ai/sdk'
import type { RefineAppInput, RefineAppResponse } from '@/output/step2_types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `당신은 앱 소개글을 다듬는 전문 에디터입니다.
사용자가 입력한 앱 제목, 설명, 초기 프롬프트를 받아 더 명확하고 매력적으로 다듬어 주세요.

규칙:
- 원문의 의미와 핵심 정보를 유지할 것
- 불필요한 내용을 추가하거나 과장하지 말 것
- 한국어로 작성된 경우 한국어를 유지할 것
- JSON 형식으로만 응답할 것 (title, description, initial_prompt 키)
- initial_prompt가 없으면 해당 키를 응답에서 생략할 것`

/**
 * Calls Claude Haiku to refine an app's title, description, and initial_prompt.
 * Returns the refined content or throws on API failure.
 */
export async function refineAppContent(input: RefineAppInput): Promise<RefineAppResponse> {
  const userContent = JSON.stringify({
    title: input.title,
    description: input.description,
    ...(input.initial_prompt ? { initial_prompt: input.initial_prompt } : {}),
    ...(input.app_url ? { app_url: input.app_url } : {}),
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `다음 앱 정보를 다듬어 주세요:\n\n${userContent}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  try {
    // Strip markdown code fences if present
    const raw = content.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(raw) as RefineAppResponse
    return parsed
  } catch {
    throw new Error('Failed to parse Claude API response as JSON')
  }
}

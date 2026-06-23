import type { ItemCategory } from '../types/models'

export interface OutfitAnalysisResult {
  pairedWith: string[]  // 推荐配对的下装/上装类型
  styleNotes: string    // 搭配风格备注
}

const CLAUDE_API_KEY_STORAGE_KEY = 'wearjoy_claude_api_key'

export function getStoredApiKey(): string {
  return localStorage.getItem(CLAUDE_API_KEY_STORAGE_KEY) ?? ''
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(CLAUDE_API_KEY_STORAGE_KEY, key.trim())
}

function buildPrompt(category: ItemCategory): string {
  const isTop = ['上装', '外套'].includes(category)
  const pairingTarget = isTop ? '下装（裤子/裙子）' : '上装'

  return `你是一位时尚搭配专家。请仔细观察这张服装商品图，图中可能包含多种穿搭示范。

分析图中这件${category}与哪些类型的${pairingTarget}搭配出现，提取所有出现过的搭配组合类型。

只返回 JSON，不要有任何其他文字：
{
  "pairedWith": ["类型1", "类型2"],
  "styleNotes": "一句话概括搭配风格"
}

pairedWith 示例值（根据图中实际出现的来填）：
- 上装配下装类型：阔腿裤、直筒裤、修身裤、喇叭裤、短裤、半身裙、百褶裙、牛仔裤
- 下装配上装类型：短款上衣、修身打底、宽松T恤、西装、衬衫

styleNotes 示例：简约休闲感，适合日常通勤`
}

export async function analyzeOutfitImages(
  imageUrls: string[],
  category: ItemCategory,
): Promise<OutfitAnalysisResult> {
  const apiKey = getStoredApiKey()
  if (!apiKey) throw new Error('请先在「我的」页面填入 Claude API Key')

  // 最多取前3张图分析，避免超出token限制
  const urls = imageUrls.slice(0, 3)

  const imageContent = urls.map((url) => ({
    type: 'image' as const,
    source: { type: 'url' as const, url },
  }))

  const response = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            { type: 'text', text: buildPrompt(category) },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI 分析失败 (${response.status}): ${err}`)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
  }

  const raw = data.content.find((c) => c.type === 'text')?.text ?? ''

  // 提取 JSON（可能被包裹在 markdown 代码块里）
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI 返回格式异常，请重试')

  const parsed = JSON.parse(jsonMatch[0]) as {
    pairedWith?: unknown
    styleNotes?: unknown
  }

  return {
    pairedWith: Array.isArray(parsed.pairedWith)
      ? (parsed.pairedWith as string[]).filter((s) => typeof s === 'string')
      : [],
    styleNotes: typeof parsed.styleNotes === 'string' ? parsed.styleNotes : '',
  }
}

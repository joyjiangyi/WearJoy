export interface TaobaoImageResult {
  images: string[]     // 所有图，平铺图优先排在前面
  primaryImage: string // 推荐主图（第一张）
}

function extractItemId(url: string): string | null {
  const m = url.match(/[?&]id=(\d+)/)
  return m ? m[1] : null
}

/** 从 HTML 字符串提取所有商品图 URL */
function extractImagesFromHtml(html: string): string[] {
  const seen = new Set<string>()
  const results: string[] = []

  // 提取 og:image
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  if (ogMatch?.[1]) {
    const u = normalizeUrl(ogMatch[1])
    seen.add(u)
    results.push(u)
  }

  // 提取 JSON 里的图片数组（picList / imageList / pics）
  const listMatches = [
    ...html.matchAll(/"(?:picList|imageList|pics|images)"\s*:\s*\[([^\]]+)\]/g),
  ]
  for (const m of listMatches) {
    const urls = [...m[1].matchAll(/"(\/\/[^"]+\.(?:jpg|png|webp))"/g)]
    for (const u of urls) {
      const clean = normalizeUrl(u[1])
      if (!seen.has(clean)) { seen.add(clean); results.push(clean) }
    }
  }

  // 提取单字段 picUrl / mainPic
  const fieldMatches = [...html.matchAll(/"(?:picUrl|mainPic)"\s*:\s*"([^"]+)"/g)]
  for (const m of fieldMatches) {
    const clean = normalizeUrl(m[1].startsWith('//') ? m[1] : '//' + m[1])
    if (!seen.has(clean)) { seen.add(clean); results.push(clean) }
  }

  return results
}

/**
 * 对图片排序：正方形图（ratio ≈ 1:1）优先放前面，因为更可能是平铺实拍而非模特上身图。
 * 比例通过文件名里的尺寸信息判断（taobao CDN URL 有时含 -WxH-）；
 * 无尺寸信息时保持原顺序。
 */
function sortByFlatLayFirst(urls: string[]): string[] {
  const scored = urls.map((url) => {
    // 尝试从 URL 中提取宽高
    const dimMatch = url.match(/-(\d+)x(\d+)[_\-.]/) ?? url.match(/tps-(\d+)-(\d+)/)
    if (dimMatch) {
      const ratio = parseInt(dimMatch[1]) / parseInt(dimMatch[2])
      const isSquare = ratio >= 0.9 && ratio <= 1.1
      return { url, score: isSquare ? 0 : 1 }
    }
    return { url, score: 2 }
  })
  return scored.sort((a, b) => a.score - b.score).map((s) => s.url)
}

export async function fetchTaobaoImages(productUrl: string): Promise<TaobaoImageResult> {
  let itemId = extractItemId(productUrl.trim())

  // 短链 / 无 id 时先通过代理解析一次拿重定向 URL
  if (!itemId) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(productUrl.trim())}`
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`代理请求失败: ${res.status}`)
    const data = (await res.json()) as { contents: string; status: { url: string } }
    itemId = extractItemId(data.status?.url ?? '')

    if (!itemId) {
      // 兜底：直接从 HTML 里提图
      const imgs = sortByFlatLayFirst(extractImagesFromHtml(data.contents ?? ''))
      if (imgs.length === 0) throw new Error('未能提取商品图片，请手动粘贴图片地址')
      return { images: imgs, primaryImage: imgs[0] }
    }
  }

  // 用标准 item URL 抓完整页面
  const itemUrl = `https://item.taobao.com/item.htm?id=${itemId}`
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(itemUrl)}`
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`代理请求失败: ${res.status}`)
  const data = (await res.json()) as { contents: string }

  const imgs = sortByFlatLayFirst(extractImagesFromHtml(data.contents ?? ''))
  if (imgs.length === 0) throw new Error('未能从该页面提取商品图片，请手动粘贴图片地址')

  return { images: imgs, primaryImage: imgs[0] }
}

function normalizeUrl(url: string): string {
  if (url.startsWith('//')) return 'https:' + url
  return url
}

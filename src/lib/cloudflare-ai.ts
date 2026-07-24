import "server-only";

/**
 * Cloudflare Workers AI 호출 공통부. 이미지 생성(provider.ts)과 모더레이션(text-filter,
 * nsfw-check)이 모두 같은 계정/토큰으로 다른 모델을 호출하므로 fetch 보일러플레이트를 여기 모은다.
 */
export async function runWorkersAI<T = unknown>(model: string, body: unknown): Promise<T> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare Workers AI credentials are not configured");
  }

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudflare Workers AI request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    success: boolean;
    result?: T;
    errors?: { message: string }[];
  };

  if (!data.success || data.result === undefined) {
    const message = data.errors?.map((e) => e.message).join(", ") || "unknown error";
    throw new Error(`Cloudflare Workers AI call failed: ${message}`);
  }

  return data.result;
}

const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
const HANGUL_PATTERN = /[가-힣ᄀ-ᇿ㄰-㆏]/;

/**
 * 한글이 섞인 텍스트를 영어로 번역한다. FLUX 이미지 생성 모델과 Llama Guard 분류기가 전부
 * 영어 중심으로 학습돼 있어서, 한글 원문을 그대로 넣으면 의미와 무관한 이미지가 나오거나
 * (이미지 생성) 오탐이 잦아진다(모더레이션). 한글이 없으면 API 호출 없이 원문을 그대로 쓴다.
 * 번역이 실패하면 원문을 그대로 반환한다(번역 인프라 장애로 전체 기능이 막히지 않도록).
 */
export async function translateToEnglish(text: string): Promise<string> {
  if (!HANGUL_PATTERN.test(text)) return text;
  try {
    const result = await runWorkersAI<{ translated_text?: string }>(TRANSLATION_MODEL, {
      text,
      source_lang: "korean",
      target_lang: "english",
    });
    return result.translated_text || text;
  } catch {
    return text;
  }
}

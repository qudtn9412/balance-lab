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

const TRANSLATION_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const HANGUL_PATTERN = /[가-힣ᄀ-ᇿ㄰-㆏]/;

/**
 * 한글이 섞인 텍스트를 영어로 번역한다. FLUX 이미지 생성 모델과 Llama Guard 분류기가 전부
 * 영어 중심으로 학습돼 있어서, 한글 원문을 그대로 넣으면 의미와 무관한 이미지가 나오거나
 * (이미지 생성) 오탐이 잦아진다(모더레이션). 한글이 없으면 API 호출 없이 원문을 그대로 쓴다.
 * 번역이 실패하면 원문을 그대로 반환한다(번역 인프라 장애로 전체 기능이 막히지 않도록).
 *
 * 전용 번역 모델(m2m100)은 "은식기"→"silver machine", "턱받이"→"brushes"처럼 압축된 한글
 * 복합명사를 자주 완전히 오역해서(실측 확인됨) 문맥을 아는 LLM(llama-3.1-8b-instruct)으로
 * 교체했다 — 같은 문장에서 훨씬 정확한 번역이 나온다.
 */
export async function translateToEnglish(text: string): Promise<string> {
  if (!HANGUL_PATTERN.test(text)) return text;
  try {
    const result = await runWorkersAI<{ response?: string }>(TRANSLATION_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "You translate Korean AI-image-generation prompts into concise, accurate English prompts. Preserve every object, action, and detail exactly. Output ONLY the translated prompt, no explanation, no quotes.",
        },
        { role: "user", content: text },
      ],
    });
    return result.response?.trim() || text;
  } catch {
    return text;
  }
}

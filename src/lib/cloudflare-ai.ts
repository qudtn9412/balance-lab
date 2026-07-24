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

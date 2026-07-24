import "server-only";
import { runWorkersAI } from "@/lib/cloudflare-ai";

export type NsfwCheckResult = { flagged: boolean };

const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

/**
 * 생성된 이미지에 대한 후검열. 프롬프트 필터를 통과해도 모델이 의도치 않게
 * 선정적/혐오 이미지를 만들 수 있으므로 이미지 자체를 다시 검사한다.
 * Cloudflare Workers AI에 NSFW 전용 이미지 분류기가 없어, 비전 언어 모델(Llama 3.2
 * Vision)에게 직접 판정을 물어보는 방식으로 구현했다 — 전용 분류기보다는 부정확할 수 있고,
 * 이미지 1장당 텍스트 생성보다 훨씬 많은 뉴런(실측 ~29뉴런)을 쓰므로 비용도 더 크다.
 */
export async function checkImageNsfw(imageUrl: string): Promise<NsfwCheckResult> {
  let bytes: number[];
  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error(`fetch failed (${imageRes.status})`);
    bytes = Array.from(new Uint8Array(await imageRes.arrayBuffer()));
  } catch {
    // 이미지를 못 받아오면 검열 자체가 불가능하므로 안전 쪽으로 차단한다.
    return { flagged: true };
  }

  try {
    const result = await runWorkersAI<{ response?: string }>(VISION_MODEL, {
      prompt:
        "Does this image contain sexual/nude content, or extreme graphic violence/gore? Answer with only YES or NO.",
      image: bytes,
    });

    const answer = result.response?.trim().toUpperCase() ?? "";
    return { flagged: answer.startsWith("YES") };
  } catch {
    // 검열 호출 자체가 실패하면 안전 쪽으로 차단한다. 이미지 생성 단계와 달리 여기는 이미
    // R2 업로드까지 끝낸 뒤라, 잘못 통과시켰을 때의 리스크가 더 크므로 fail-closed로 처리한다.
    return { flagged: true };
  }
}

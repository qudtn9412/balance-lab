import "server-only";
import { runWorkersAI, translateToEnglish } from "@/lib/cloudflare-ai";
import { uploadImageToR2 } from "@/lib/storage/r2";

export type GenerateImageResult = {
  imageUrl: string;
  costCents: number;
};

// Cloudflare Workers AI의 FLUX 모델. schnell 버전은 4스텝 내외로 빠르게 생성되는 경량 버전.
const MODEL = "@cf/black-forest-labs/flux-1-schnell";

// Workers AI는 "뉴런" 단위로 과금되어 이미지당 정확한 달러 비용을 API 응답만으로는 알 수 없다.
// 여기 값은 참고용 추정치이며, 정확한 비용 추적이 필요해지면 Cloudflare 사용량 API를 별도 연동한다.
const ESTIMATED_COST_CENTS = 0.3;

/**
 * 실제 이미지 생성 API 호출부. Cloudflare Workers AI(FLUX)로 시작하되, 호출부를 이
 * 어댑터 뒤로 숨겨서 나머지 코드(route handler 등)가 provider 교체에 영향받지 않게 한다.
 */
export async function generateImage(prompt: string): Promise<GenerateImageResult> {
  // FLUX는 영어 중심으로 학습된 모델이라 한글 프롬프트를 넣으면 의미와 무관한 이미지가 나온다
  // (실측: "녹색 사과" → 한 사과와 무관한 골목 사진). 생성 직전에 영어로 번역해서 넘긴다.
  const englishPrompt = await translateToEnglish(prompt);
  const result = await runWorkersAI<{ image?: string }>(MODEL, { prompt: englishPrompt });

  if (!result.image) {
    throw new Error("Cloudflare Workers AI generation failed: no image returned");
  }

  const dataUri = `data:image/jpeg;base64,${result.image}`;
  const imageUrl = await uploadImageToR2(dataUri);

  return { imageUrl, costCents: ESTIMATED_COST_CENTS };
}

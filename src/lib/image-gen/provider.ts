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
// 여기 값은 참고용 추정치이며, 정확한 비용 추적이 필요해지면 Cloudflare 사용량 API 별도 연동한다.
const ESTIMATED_COST_CENTS = 0.3;

// schnell 기본값(4스텝)은 속도 우선이라 프롬프트 디테일 반영이 약하다. 8스텝(schnell 최대치)으로
// 올리면 디테일 표현력이 개선되고, 실사용 규모(하루 4~6장)에서 비용 증가분은 한 달 기준 몇백 원
// 수준이라 무시 가능하다고 판단해 최대치로 고정한다.
const NUM_STEPS = 8;

// 사람을 지칭하는 단어가 있는데 인종/국적이 명시되지 않으면 FLUX가 학습 데이터 편향으로
// 기본적으로 서구적 외모를 생성한다(실측 확인됨). 서비스 대상이 한국이므로 인종 미지정 시
// "Korean"을 기본값으로 보정한다. 이미 다른 인종/국적이 명시된 프롬프트는 건드리지 않는다.
const PERSON_PATTERN = /\b(man|woman|men|women|person|people|boy|girl|guy|lady|child|children|kid|kids|human|male|female|adult|teenager|elderly|couple|family|friend|friends)\b/i;
const ETHNICITY_PATTERN =
  /\b(korean|japanese|chinese|american|european|african|indian|french|german|italian|spanish|russian|mexican|brazilian|thai|vietnamese|filipino|arab|latino|latina|caucasian|western|asian|black|white)\b/i;

function applyDefaultEthnicity(prompt: string): string {
  if (PERSON_PATTERN.test(prompt) && !ETHNICITY_PATTERN.test(prompt)) {
    return `${prompt}, Korean`;
  }
  return prompt;
}

/**
 * 실제 이미지 생성 API 호출부. Cloudflare Workers AI(FLUX)로 시작하되, 호출부를 이
 * 어댑터 뒤로 숨겨서 나머지 코드(route handler 등)가 provider 교체에 영향받지 않게 한다.
 */
export async function generateImage(prompt: string): Promise<GenerateImageResult> {
  // FLUX는 영어 중심으로 학습된 모델이라 한글 프롬프트를 넣으면 의미와 무관한 이미지가 나온다
  // (실측: "녹색 사과" → 한 사과와 무관한 골목 사진). 생성 직전에 영어로 번역해서 넘긴다.
  const translatedPrompt = await translateToEnglish(prompt);
  const englishPrompt = applyDefaultEthnicity(translatedPrompt);
  const result = await runWorkersAI<{ image?: string }>(MODEL, { prompt: englishPrompt, num_steps: NUM_STEPS });

  if (!result.image) {
    throw new Error("Cloudflare Workers AI generation failed: no image returned");
  }

  const dataUri = `data:image/jpeg;base64,${result.image}`;
  const imageUrl = await uploadImageToR2(dataUri);

  return { imageUrl, costCents: ESTIMATED_COST_CENTS };
}

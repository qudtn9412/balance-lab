import "server-only";
import { runWorkersAI, translateToEnglish } from "@/lib/cloudflare-ai";

export type TextFilterResult =
  | { blocked: false }
  | { blocked: true; reason: "hate_speech" | "sexual" | "illegal" };

// 1차 방어선: 자주 나오는 명백한 위반은 API 호출 없이 즉시(무료로) 차단한다.
// TODO: 실제 신고/오탐 사례가 쌓이는 대로 목록을 계속 보강한다.
const HATE_PATTERNS = [/한남충/, /김치녀/, /맘충/, /틀딱/, /벌레.?새끼/, /nigger/i, /faggot/i];
const SEXUAL_PATTERNS = [/성기\b/, /자위/, /야동/, /강간/, /\bporn\b/i, /\bnude\b/i];
const ILLEGAL_PATTERNS = [/마약\s*제조/, /폭탄\s*제조/, /사람.{0,3}죽이는\s*방법/, /아동.{0,2}성/i];

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

const LLAMA_GUARD_MODEL = "@cf/meta/llama-guard-3-8b";

// Llama Guard 3의 MLCommons 위해 분류 체계 중 우리 서비스(이미지 생성 프롬프트)와
// 관련 있는 카테고리만 우리 reason으로 매핑한다. 매핑에 없는 카테고리(선거, 지식재산권,
// 전문 상담 등)는 이미지 생성 서비스와 무관하므로 차단하지 않는다.
const CATEGORY_REASON: Record<string, "hate_speech" | "sexual" | "illegal"> = {
  S1: "illegal", // Violent Crimes
  S2: "illegal", // Non-Violent Crimes
  S3: "sexual", // Sex-Related Crimes
  S4: "sexual", // Child Sexual Exploitation
  S9: "illegal", // Indiscriminate Weapons
  S10: "hate_speech", // Hate
  S12: "sexual", // Sexual Content
};

async function checkWithLlamaGuard(prompt: string): Promise<TextFilterResult> {
  try {
    // Llama Guard 3는 한국어 입력에서 오탐이 훨씬 잦다 (실측: "수영모/수경/삼각팬티 입은 남자"처럼
    // 평범한 수영복 묘사가 영어로는 safe인데 한국어 원문으로는 S3(성범죄)로 잘못 분류됨) — 번역 후 판정한다.
    const englishPrompt = await translateToEnglish(prompt);
    const result = await runWorkersAI<{ response?: string }>(LLAMA_GUARD_MODEL, {
      messages: [{ role: "user", content: englishPrompt }],
    });

    const lines = (result.response ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines[0]?.toLowerCase() !== "unsafe") {
      return { blocked: false };
    }

    const categories = lines[1]?.split(",").map((c) => c.trim()) ?? [];
    for (const category of categories) {
      const reason = CATEGORY_REASON[category];
      if (reason) return { blocked: true, reason };
    }
    return { blocked: false };
  } catch {
    // Llama Guard 호출 자체가 실패해도(네트워크 장애 등) 위의 키워드 필터는 이미 통과한
    // 상태이므로, 모더레이션 인프라 장애로 서비스 전체가 막히지 않도록 여기서는 통과시킨다.
    return { blocked: false };
  }
}

/**
 * 정규식 금칙어 1차 필터만 동기적으로, API 호출 없이(무료로) 적용한다. 닉네임·댓글·카드 타이틀처럼
 * 이미지 생성과 달리 일일 한도로 호출량이 제한되지 않는 입력에 Llama Guard(LLM 호출)까지 매번
 * 태우면 트래픽에 비례해 비용이 무한정 늘어날 수 있어(CLAUDE.md 비용 원칙), 여기서는 명백한
 * 위반만 걸러내고 더 폭넓은 판별은 신고 기능으로 보완한다.
 */
export function containsBannedKeywords(text: string): TextFilterResult {
  if (matchesAny(text, HATE_PATTERNS)) return { blocked: true, reason: "hate_speech" };
  if (matchesAny(text, SEXUAL_PATTERNS)) return { blocked: true, reason: "sexual" };
  if (matchesAny(text, ILLEGAL_PATTERNS)) return { blocked: true, reason: "illegal" };
  return { blocked: false };
}

/**
 * 이미지 생성 API를 호출하기 전, 프롬프트 텍스트 단계에서 1차 차단한다.
 *   1) 정규식 금칙어 필터로 명백한 위반을 무료/즉시 차단
 *   2) 여기서 걸리지 않으면 Cloudflare Workers AI의 Llama Guard 3로 더 폭넓게 판별
 * celebrity-block.ts와 별도로 두는 이유: 실존 인물 차단은 초상권/명예훼손 문제로
 * 별도 리스트·로직이 필요해서다.
 */
export async function checkPromptText(prompt: string): Promise<TextFilterResult> {
  const keywordResult = containsBannedKeywords(prompt);
  if (keywordResult.blocked) return keywordResult;

  return checkWithLlamaGuard(prompt);
}

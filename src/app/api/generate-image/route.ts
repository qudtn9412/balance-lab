import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { getClientIp } from "@/lib/request-ip";
import { tryConsumeGenerationCredit } from "@/lib/rate-limit";
import { checkPromptText } from "@/lib/moderation/text-filter";
import { containsRealPersonReference } from "@/lib/moderation/celebrity-block";
import { checkImageNsfw } from "@/lib/moderation/nsfw-check";
import { generateImage } from "@/lib/image-gen/provider";

/**
 * 이미지 1장 생성 요청. 순서가 중요하다:
 *   1) 텍스트 모더레이션 → 2) 실존 인물 차단 → 3) 한도 소비 → 4) 실제 생성 → 5) 이미지 후검열
 * 한도 소비를 모더레이션 이후에 두는 이유: 어차피 차단될 프롬프트로 생성권을 낭비하지 않기 위해서다.
 */
export async function POST(request: Request) {
  // Cloudflare Workers AI 무료 뉴런 한도를 아끼기 위한 임시 킬스위치.
  // 다시 켤 때는 .env.local에서 IMAGE_GENERATION_ENABLED=true로 바꾸고 서버를 재시작하면 된다.
  if (process.env.IMAGE_GENERATION_ENABLED !== "true") {
    return NextResponse.json(
      { error: "이미지 생성 기능이 잠시 비활성화되어 있습니다. 나중에 다시 시도해주세요." },
      { status: 503 },
    );
  }

  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { prompt } = (await request.json()) as { prompt?: string };
  if (!prompt || prompt.length > 500) {
    return NextResponse.json({ error: "invalid prompt" }, { status: 400 });
  }

  const textResult = await checkPromptText(prompt);
  if (textResult.blocked) {
    return NextResponse.json({ error: "prompt blocked", reason: textResult.reason }, { status: 422 });
  }

  if (await containsRealPersonReference(prompt)) {
    return NextResponse.json({ error: "prompt blocked", reason: "celebrity_name" }, { status: 422 });
  }

  const allowed = await tryConsumeGenerationCredit(clientId, getClientIp(request));
  if (!allowed) {
    return NextResponse.json(
      { error: "오늘의 무료 생성 횟수를 다 사용했어요. 광고를 보면 추가로 생성할 수 있어요." },
      { status: 429 },
    );
  }

  const { imageUrl, costCents } = await generateImage(prompt);

  const nsfw = await checkImageNsfw(imageUrl);
  if (nsfw.flagged) {
    return NextResponse.json({ error: "generated image blocked" }, { status: 422 });
  }

  return NextResponse.json({ imageUrl, costCents });
}

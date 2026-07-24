import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlug } from "@/lib/slug";

type CreateGameBody = {
  optionA: { prompt: string; imageUrl?: string; title?: string };
  optionB: { prompt: string; imageUrl?: string; title?: string };
};

// TODO: 이미지 생성 provider가 정해지면 제거하고 imageUrl을 다시 필수로 되돌린다.
// 타이틀(한글 등)은 placehold.co 기본 폰트에 글리프가 없어 깨지므로 라벨(A/B)만 사용한다.
const PLACEHOLDER_COLORS: Record<"A" | "B", string> = { A: "f97316", B: "3b82f6" };
function placeholderImageUrl(label: "A" | "B") {
  return `https://placehold.co/600x600/${PLACEHOLDER_COLORS[label]}/white?text=${label}`;
}

/**
 * 밸런스게임 등록. 이미지 생성 provider가 아직 정해지지 않아, 이미지 없이
 * 프롬프트/타이틀만으로도 등록할 수 있도록 imageUrl이 없으면 플레이스홀더로 대체한다.
 */
export async function POST(request: Request) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const body = (await request.json()) as CreateGameBody;
  if (!body.optionA?.prompt?.trim() || !body.optionB?.prompt?.trim()) {
    return NextResponse.json({ error: "both options are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const slug = generateSlug();

  const { error } = await supabase.from("balance_games").insert({
    slug,
    creator_client_id: clientId,
    option_a_prompt: body.optionA.prompt,
    option_a_image_url: body.optionA.imageUrl || placeholderImageUrl("A"),
    option_a_title: body.optionA.title ?? null,
    option_b_prompt: body.optionB.prompt,
    option_b_image_url: body.optionB.imageUrl || placeholderImageUrl("B"),
    option_b_title: body.optionB.title ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slug }, { status: 201 });
}

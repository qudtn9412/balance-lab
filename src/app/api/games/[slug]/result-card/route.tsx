import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

type Params = { params: Promise<{ slug: string }> };

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING_Y = 40;
const PADDING_X = 56;
const HEADER_HEIGHT = 40;
const ROW_GAP = 20;
const ROW_HEIGHT = HEIGHT - PADDING_Y * 2 - HEADER_HEIGHT - ROW_GAP;
const IMAGE_HEIGHT = 360;
const BOTTOM_HEIGHT = ROW_HEIGHT - IMAGE_HEIGHT;
const TITLE_HEIGHT = 44;
const OLD_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/525.13 (KHTML, like Gecko) Version/3.1 Safari/525.13";

/**
 * next/og(satori)는 시스템 폰트를 못 쓰고 텍스트에 쓰는 글리프를 직접 폰트 파일로 임베드해야 한다.
 * Google Fonts CSS API는 최신 브라우저 UA에는 satori가 못 읽는 woff2를 내려주는데, 오래된 UA로
 * 위장해서 요청하면 ttf가 내려온다(공개적으로 널리 쓰이는 우회법). 실패하면 null을 반환해서
 * 카드 자체는(한글 없이) 계속 만들어지게 한다 — 폰트 때문에 공유 기능 전체가 죽으면 안 된다.
 */
async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": OLD_UA } },
    );
    const css = await cssRes.text();
    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

function OptionPanel({
  imageUrl,
  title,
  percent,
  chosen,
}: {
  imageUrl: string;
  title: string;
  percent: number;
  chosen: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: ROW_HEIGHT,
        borderRadius: 20,
        overflow: "hidden",
        border: chosen ? "6px solid #facc15" : "6px solid transparent",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" style={{ objectFit: "cover", width: "100%", height: IMAGE_HEIGHT }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: BOTTOM_HEIGHT,
          background: "#18181b",
          padding: "14px 20px",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", height: TITLE_HEIGHT, overflow: "hidden" }}>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>{title}</span>
        </div>
        <div style={{ display: "flex", height: 10, width: "100%", background: "#3f3f46", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ display: "flex", width: `${percent}%`, background: chosen ? "#facc15" : "#a1a1aa" }} />
        </div>
        <span style={{ color: "#d4d4d8", fontSize: 18, fontWeight: 600 }}>{percent}%</span>
      </div>
    </div>
  );
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const rawChoice = searchParams.get("choice");
  const choice: "a" | "b" | null = rawChoice === "a" || rawChoice === "b" ? rawChoice : null;

  const supabase = createPublicClient();
  const { data: game } = await supabase
    .from("balance_games")
    .select("option_a_image_url, option_a_title, votes_a_count, option_b_image_url, option_b_title, votes_b_count")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!game) {
    return new Response("Not found", { status: 404 });
  }

  const total = game.votes_a_count + game.votes_b_count;
  const pctA = total === 0 ? 50 : Math.round((game.votes_a_count / total) * 100);
  const pctB = 100 - pctA;
  const koreanTitleA = game.option_a_title ?? "옵션 A";
  const koreanTitleB = game.option_b_title ?? "옵션 B";

  const fontData = await loadKoreanFont(`밸런스랩${koreanTitleA}${koreanTitleB}가 이 선택을 했어요`);
  const titleA = fontData ? koreanTitleA : "Option A";
  const titleB = fontData ? koreanTitleB : "Option B";
  const brand = fontData ? "밸런스랩" : "BalanceLab";
  const chosenPercent = choice === "a" ? pctA : choice === "b" ? pctB : null;
  const headline =
    chosenPercent === null
      ? null
      : fontData
        ? `${chosenPercent}%가 이 선택을 했어요`
        : `${chosenPercent}% picked this side`;

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          background: "#0b0b0c",
          padding: `${PADDING_Y}px ${PADDING_X}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: HEADER_HEIGHT }}>
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>{brand}</span>
          {headline && <span style={{ color: "#facc15", fontSize: 22, fontWeight: 700 }}>{headline}</span>}
        </div>

        <div style={{ display: "flex", height: ROW_HEIGHT, gap: 24, marginTop: ROW_GAP }}>
          <OptionPanel imageUrl={game.option_a_image_url} title={titleA} percent={pctA} chosen={choice === "a"} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: ROW_HEIGHT }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "#fff",
                color: "#0b0b0c",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              VS
            </span>
          </div>
          <OptionPanel imageUrl={game.option_b_image_url} title={titleB} percent={pctB} chosen={choice === "b"} />
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fontData ? [{ name: "Noto Sans KR", data: fontData, weight: 700 }] : undefined,
    },
  );
}

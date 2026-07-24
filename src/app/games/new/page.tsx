import NewGameForm from "./_components/NewGameForm";

/**
 * 밸런스게임 생성 폼. 프롬프트 A/B 입력 → /api/generate-image(Cloudflare Workers AI, FLUX)
 * 2회 호출 → 결과 이미지 미리보기 + 타이틀 입력 → /api/games POST 순서로 동작한다.
 */
export default function NewGamePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold">밸런스게임 만들기</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        두 개의 프롬프트로 이미지를 생성해 1:1 밸런스게임 카드를 만듭니다.
      </p>
      <NewGameForm />
    </div>
  );
}

export const metadata = {
  title: "이용약관 - 밸런스랩",
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">이용약관</h1>
        <p className="text-sm text-zinc-500">시행일: 2026년 7월 24일</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제1조 (목적)</h2>
          <p>
            이 약관은 밸런스랩(이하 &ldquo;서비스&rdquo;)이 제공하는 AI 이미지 기반 밸런스게임 생성·공유·투표
            서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제2조 (서비스의 특징 — 무가입 운영)</h2>
          <p>
            서비스는 별도의 회원가입 절차 없이 익명으로 이용할 수 있습니다. 이용자 식별은 브라우저에 발급되는
            익명 쿠키를 통해서만 이루어지며, 이름·이메일 등 개인 식별 정보를 수집하지 않습니다. 자세한 내용은{" "}
            <a href="/privacy" className="underline">
              개인정보처리방침
            </a>
            을 참고해 주세요.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제3조 (이용 연령)</h2>
          <p>
            서비스는 별도의 연령 확인 절차를 두고 있지 않으나, 만 14세 미만 아동은 법정대리인의 동의 없이 서비스를
            이용할 수 없습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제4조 (금지 행위)</h2>
          <p>이용자는 프롬프트 입력, 이미지 생성, 댓글 작성 등 서비스 이용 과정에서 다음 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc pl-5">
            <li>혐오·차별, 선정적, 폭력적이거나 불법적인 내용을 생성·게시하는 행위</li>
            <li>실존 인물(연예인, 공인 등)을 특정하여 초상권·명예를 침해하는 이미지를 생성하는 행위</li>
            <li>타인을 사칭하거나 허위 사실을 유포하는 행위</li>
            <li>서비스의 일일 무료 생성 한도를 우회하기 위해 비정상적인 방법(반복적인 쿠키 삭제, 자동화 도구 등)을 사용하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
          </ul>
          <p>
            서비스는 텍스트 필터링, AI 기반 콘텐츠 분류, 이용자 신고 등을 통해 위반 콘텐츠를 사전·사후적으로
            제한할 수 있으며, 신고가 누적된 콘텐츠는 검토 전까지 자동으로 비공개 처리될 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제5조 (생성 콘텐츠에 대한 권리)</h2>
          <p>
            이용자가 입력한 프롬프트 및 이를 통해 생성된 이미지, 작성한 댓글 등의 콘텐츠는 서비스 내에서
            공개적으로 노출·공유되는 것을 전제로 합니다. 이용자는 서비스가 해당 콘텐츠를 서비스 화면 구성, 홍보,
            운영 목적으로 별도 대가 없이 사용하는 것에 동의합니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제6조 (면책조항)</h2>
          <p>
            생성되는 이미지는 AI 모델에 의해 자동으로 만들어지며, 그 결과물의 정확성·적절성을 서비스가 보증하지
            않습니다. 서비스는 무료로 제공되며, 천재지변, 비상사태, 또는 서비스의 개선을 위한 점검 등 부득이한
            경우 서비스 제공을 일시적으로 중단할 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제7조 (약관의 변경)</h2>
          <p>
            서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경된 약관은
            서비스 내 공지 또는 본 페이지 갱신을 통해 효력이 발생합니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">제8조 (준거법)</h2>
          <p>이 약관은 대한민국 법령에 따라 해석되고 적용됩니다.</p>
        </section>
      </div>
    </div>
  );
}

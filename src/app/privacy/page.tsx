export const metadata = {
  title: "개인정보처리방침 - 밸런스랩",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">개인정보처리방침</h1>
        <p className="text-sm text-zinc-500">시행일: 2026년 7월 24일</p>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        밸런스랩(이하 &ldquo;서비스&rdquo;)은 회원가입 없이 익명으로 이용하는 서비스로, 이름·이메일·전화번호 등
        개인을 특정할 수 있는 정보를 수집하지 않습니다. 다만 서비스 운영과 어뷰징 방지를 위해 아래와 같은 정보를
        처리합니다.
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">1. 수집하는 정보와 수집 방법</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-foreground">익명 식별자(쿠키)</strong>: 계정 없이도 투표 중복 방지, 일일
              생성 한도 집계 등을 위해 브라우저에 익명 쿠키를 자동 발급합니다. 이 쿠키는 이름·연락처 등과
              연결되지 않으며, 서비스 외부에서 개인을 식별하는 데 사용되지 않습니다.
            </li>
            <li>
              <strong className="text-foreground">IP 주소</strong>: 쿠키 삭제를 통한 일일 무료 생성 한도 우회를
              막기 위한 목적으로만 처리하며, 별도로 저장·조회 기능을 제공하지 않습니다.
            </li>
            <li>
              <strong className="text-foreground">이용자가 직접 입력한 정보</strong>: 이미지 생성 프롬프트,
              카드 타이틀, 닉네임, 댓글 내용. 입력 즉시 서비스 내에 공개적으로 게시됩니다. 닉네임은 입력하지
              않아도 이용에 제한이 없으며, 미입력 시 &ldquo;익명&rdquo;으로 표시됩니다. 재입력 편의를 위해
              브라우저 로컬 저장소(local storage)에 저장될 수 있으며, 이는 기기에만 저장되고 서비스 서버로는
              게시 시점에만 전송됩니다.
            </li>
            <li>
              <strong className="text-foreground">AI로 생성된 이미지</strong>: 이용자가 입력한 프롬프트로 생성되어
              서비스에 게시되는 이미지 파일.
            </li>
            <li>
              <strong className="text-foreground">이용 기록</strong>: 투표, 좋아요, 신고 내역이 익명 식별자와
              함께 저장됩니다(중복 투표·좋아요 방지 목적).
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">2. 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5">
            <li>밸런스게임 생성, 투표, 댓글, 좋아요, 신고 등 핵심 기능 제공</li>
            <li>일일 무료 이미지 생성 한도 집계 및 어뷰징(과다 생성) 방지</li>
            <li>혐오·선정·불법 콘텐츠 등에 대한 모더레이션 및 신고 처리</li>
            <li>광고 게재 (아래 6번 참고 — 현재 광고 심사 진행 전이며, 실제 게재 시점부터 적용됩니다)</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">3. 보유 및 이용 기간</h2>
          <p>
            익명 쿠키는 발급일로부터 최대 1년간 보관되며, 브라우저에서 쿠키를 삭제하면 즉시 새로운 익명
            식별자가 발급됩니다. 게시된 콘텐츠(이미지·타이틀·댓글)는 신고 누적 등으로 비공개·삭제 처리되기
            전까지 서비스에 게시된 상태로 유지됩니다.
          </p>
          <p>
            서비스 특성상 특정 이용자의 이용 기록을 개별적으로 조회·구분할 수 있는 수단(로그인, 이메일 등)이
            없어, 본인 확인을 통한 개별 열람·삭제 요청에는 한계가 있습니다. 다만 본인이 게시한 특정
            게임·댓글에 대해서는 서비스 내 신고 기능을 통해 비공개 처리를 요청할 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">4. 처리위탁 및 국외이전</h2>
          <p>서비스 운영을 위해 아래 해외 사업자에게 정보 처리를 위탁하고 있습니다.</p>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-foreground">Supabase</strong> (데이터베이스 및 저장소 운영)
            </li>
            <li>
              <strong className="text-foreground">Cloudflare</strong> (AI 이미지 생성, 생성된 이미지 파일
              저장·전송)
            </li>
          </ul>
          <p>각 사업자는 자체 보안 정책에 따라 정보를 처리하며, 서비스가 직접 수집한 목적 외로 이용하지 않습니다.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">5. 이용자의 권리</h2>
          <p>
            이용자는 언제든 브라우저 설정을 통해 쿠키를 거부하거나 삭제할 수 있습니다. 다만 이 경우 투표 중복
            확인 등 일부 기능이 정상적으로 동작하지 않을 수 있습니다. 게시한 콘텐츠의 비공개·삭제를 원하는 경우
            서비스 내 신고 기능을 이용해 주세요.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">6. 쿠키 및 광고</h2>
          <p>
            서비스는 투표 중복 방지 등 필수 기능을 위해 쿠키를 사용합니다. 향후 Google AdSense 광고가
            게재되면, Google 등 광고 사업자가 맞춤형 광고 제공을 위해 별도의 쿠키를 사용할 수 있습니다. 이 경우
            이용자는 브라우저 설정 또는{" "}
            <a href="https://adssettings.google.com" className="underline" target="_blank" rel="noreferrer">
              Google 광고 설정
            </a>
            에서 맞춤형 광고를 거부할 수 있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">7. 안전성 확보조치</h2>
          <p>
            서비스는 데이터베이스 접근 권한 분리, 암호화된 통신(HTTPS) 등을 통해 정보를 안전하게 관리하고
            있습니다.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">8. 문의처</h2>
          <p>
            개인정보 처리와 관련한 문의는 아래 이메일로 연락해 주세요.
            <br />
            이메일: qudtn941200@naver.com
          </p>
        </section>
      </div>
    </div>
  );
}

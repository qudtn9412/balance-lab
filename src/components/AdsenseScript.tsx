import Script from "next/script";

/**
 * Google AdSense/Ad Placement API 부트스트랩. 퍼블리셔 ID가 없으면(아직 AdSense 심사 전)
 * 아무것도 렌더링하지 않는다 — 승인 후 NEXT_PUBLIC_ADSENSE_PUBLISHER_ID만 채우면 활성화된다.
 */
export default function AdsenseScript() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  if (!publisherId) return null;

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script id="adsbygoogle-init" strategy="afterInteractive">
        {`window.adsbygoogle = window.adsbygoogle || [];
window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };`}
      </Script>
    </>
  );
}

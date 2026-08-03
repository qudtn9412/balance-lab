"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const NO_AD_PATH_PREFIXES = ["/admin"];

/**
 * Auto ads는 사이트 전역 스크립트라 라우트별로 켜고 끌 수 없다. 대신 Google이 공식
 * 지원하는 pauseAdRequests 플래그로, 콘텐츠 없는 화면(관리자 로그인/대시보드, 404,
 * 에러 화면)에서는 광고 요청 자체를 막는다. not-found/error 페이지는 각자 마운트 시
 * pauseAdRequests = 1을 다시 세팅해 이 컴포넌트의 리셋을 덮어쓴다.
 */
export default function AdsPauseController() {
  const pathname = usePathname();

  useEffect(() => {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.pauseAdRequests = NO_AD_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ? 1 : 0;
  }, [pathname]);

  return null;
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 모드 전용 디버그 배지(영문, 프로덕션에는 노출 안 됨) — 작업 중 화면을 가리지 않도록 끈다.
  devIndicators: false,
};

export default nextConfig;

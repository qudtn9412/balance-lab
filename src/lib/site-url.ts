/** robots.txt/sitemap.xml 등에서 절대 URL을 만들 때 쓰는 기준 도메인. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // VERCEL_PROJECT_PRODUCTION_URL은 프로젝트에 연결된 고정 프로덕션 도메인이라
  // 배포마다 바뀌는 VERCEL_URL(개별 배포 URL)보다 우선한다.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

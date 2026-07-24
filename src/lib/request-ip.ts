import "server-only";

/**
 * client_id 쿠키는 지우면 그만이라 그것만으로는 하루 무료 생성 한도를 강제할 수 없다.
 * IP 단위 상한을 별도로 두어, 쿠키를 초기화해도 같은 IP에서는 여전히 막히게 한다
 * (반대로 client_id 단위 한도는 그대로 두어 공유 IP의 일반 사용자를 과하게 막지 않는다).
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

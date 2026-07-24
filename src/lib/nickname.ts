export const NICKNAME_STORAGE_KEY = "bg_nickname";
export const NICKNAME_MAX_LENGTH = 20;

export function readSavedNickname(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(nickname: string): void {
  if (typeof window === "undefined") return;
  try {
    if (nickname.trim()) {
      localStorage.setItem(NICKNAME_STORAGE_KEY, nickname.trim());
    }
  } catch {
    // localStorage를 못 쓰는 환경(프라이빗 모드 등)이면 그냥 매번 새로 입력하게 둔다.
  }
}

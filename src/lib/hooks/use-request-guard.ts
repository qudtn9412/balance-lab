"use client";

import { useRef } from "react";

const DEFAULT_KEY = "__default__";

/**
 * 진행 중인 요청을 key 단위로 추적해 중복 실행을 막는다. React state는 다음 렌더까지
 * 반영되지 않아서 `if (submitting) return` 같은 useState 체크만으로는 같은 이벤트 루프
 * 틱 안의 연속 클릭(더블클릭 등)을 막지 못한다 — ref는 즉시 갱신되므로 실제로 막아준다.
 */
export function useRequestGuard() {
  const inFlight = useRef<Set<string>>(new Set());

  return {
    begin(key: string = DEFAULT_KEY): boolean {
      if (inFlight.current.has(key)) return false;
      inFlight.current.add(key);
      return true;
    },
    end(key: string = DEFAULT_KEY): void {
      inFlight.current.delete(key);
    },
  };
}

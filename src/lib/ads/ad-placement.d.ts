export {};

declare global {
  interface AdBreakOptions {
    type: "reward" | "start" | "next" | "browse" | "interstitial" | "pause";
    name: string;
    beforeReward?: (showAdFn: () => void) => void;
    adViewed?: () => void;
    adDismissed?: () => void;
    beforeAd?: () => void;
    afterAd?: () => void;
    adBreakDone?: (placementInfo: unknown) => void;
  }

  interface Window {
    adBreak?: (options: AdBreakOptions) => void;
    adsbygoogle?: unknown[];
  }
}

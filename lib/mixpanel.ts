import mixpanel from "mixpanel-browser";

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let initialized = false;

function ensureInit() {
  if (initialized || !token) return;
  mixpanel.init(token, { persistence: "localStorage" });
  initialized = true;
}

export function trackPageview(page: string) {
  ensureInit();
  if (!token) return;
  mixpanel.track("page_viewed", { page });
}

export function track(event: string, props?: Record<string, unknown>) {
  ensureInit();
  if (!token) return;
  mixpanel.track(event, props);
}

/** 로그인 성공 시 호출 — distinct_id를 유저 id로 고정해 유니크 유저 지표가 event count가 아니라
 * 실제 사람 수 기준으로 집계되게 한다. */
export function identify(userId: string) {
  ensureInit();
  if (!token) return;
  mixpanel.identify(userId);
}

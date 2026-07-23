// Mixpanel 퍼널 확인 결과: iOS + t.co(트위터) 리퍼러 조합에서 login_started는 있지만
// login_completed가 0%였다. 트위터 앱 인앱 브라우저에서 열면 Google OAuth가
// disallowed_useragent로 로그인 자체를 차단하기 때문 — 앱 코드로는 그 차단을 못 풀고,
// 사용자를 실제 브라우저로 내보내는 것만 가능하다.

// 카카오톡·인스타그램·페이스북·라인은 자체 앱 이름을 User-Agent에 남겨서 이 패턴으로 잡힌다.
const IN_APP_UA_PATTERNS = [/FBAN|FBAV/i, /Instagram/i, /Line\//i, /KAKAOTALK/i, /NAVER\(/i];

// 트위터(X)의 iOS 인앱 브라우저(SFSafariViewController)는 UA를 표준 Safari 그대로 남겨
// (Mixpanel에서도 100% "Mobile Safari"로 잡혔다) UA만으로는 구분이 안 된다 — 실측으로 확인된
// 유일한 신호가 리퍼러(t.co)라 이것만 별도로 확인한다.
const IN_APP_REFERRER_PREFIXES = ["https://t.co/"];

export function isLikelyInAppBrowser(
  userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
  referrer: string = typeof document !== "undefined" ? document.referrer : ""
): boolean {
  if (IN_APP_UA_PATTERNS.some((pattern) => pattern.test(userAgent))) return true;
  return IN_APP_REFERRER_PREFIXES.some((prefix) => referrer.startsWith(prefix));
}

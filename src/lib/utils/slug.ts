const SLUG_RE = /^[a-zA-Z0-9-]{3,30}$/;

export function isValidSlug(s: string): boolean {
  return SLUG_RE.test(s);
}

/** 사용자 id를 기반으로 충돌 가능성 낮은 기본 slug 후보 생성 */
export function defaultSlugFromUserId(userId: string): string {
  return `mh-${userId.replace(/-/g, '').slice(0, 12)}`;
}

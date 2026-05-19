// 저장된 이미지 값(스토리지 경로 또는 레거시 Storage URL)을 /api/img 프록시 URL로 변환.
// 클라이언트·서버 공용 순수 함수. signed/public URL은 DB에 저장하지 않으며, 표시는 프록시가 담당한다.

const STORAGE_URL_RE = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/[^/]+\/(.+)$/;

/** 이미지 표시용 src. 경로 → /api/img?path=... , 외부 URL은 그대로. */
export function imgSrc(value: string | null | undefined): string {
  if (!value) return '';
  // 레거시 Supabase Storage URL → 경로 추출
  const m = value.match(STORAGE_URL_RE);
  if (m) {
    const path = decodeURIComponent(m[1].split('?')[0]);
    return `/api/img?path=${encodeURIComponent(path)}`;
  }
  // 외부 URL / data / blob 은 그대로 (미리보기 샘플 등)
  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }
  // 스토리지 경로
  return `/api/img?path=${encodeURIComponent(value)}`;
}

---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 보안 + 개인정보 (핵심)
---

# 보안 / 개인정보 하네스

본 프로젝트에서 가장 중요한 하네스다. 사용자 데이터 분리, 공개/비공개, 인증/세션, 키 노출 방지를 모든 Phase에서 강제한다.

## 1. 인증 / 세션

- [ ] 비밀번호는 bcrypt(cost ≥ 12)로 해시되어 저장되는가
- [ ] DB나 응답에 평문 비밀번호가 절대 없는가
- [ ] 세션 쿠키가 `HttpOnly`, `Secure`, `SameSite=Lax`(또는 `Strict`)인가
- [ ] 세션 비밀(`SESSION_SECRET`)이 환경변수에서 로드되며 코드에 하드코딩되지 않는가
- [ ] 비로그인 사용자가 인증 필요 API 호출 시 401 `AUTH_REQUIRED` 반환
- [ ] 로그인 실패 메시지가 이메일 존재 여부를 노출하지 않는가

## 2. 사용자 데이터 분리

- [ ] 모든 자원 조작에 세션 사용자 `user_id` 검증이 있는가
- [ ] repository 레이어가 모든 쿼리에 `where user_id = $session_user`를 자동 부착하는가
- [ ] A 사용자가 B 사용자의 자원 id를 직접 요청해도 404 `DB_RECORD_NOT_FOUND` 또는 403 `AUTH_PERMISSION_DENIED`를 받는가
- [ ] `homepage_id`만 믿지 않고 `user_id`도 함께 검증하는가
- [ ] 공개 페이지를 통해 다른 사용자 데이터가 노출되지 않는가
- [ ] 공개 페이지가 비밀번호 해시/이메일/audit 데이터를 절대 포함하지 않는가

## 3. 공개/비공개

- [ ] `mini_homepages.is_public` 기본값이 `false`
- [ ] `/u/[slug]` 또는 `/api/public/[slug]`가 서버에서 `is_public AND deleted_at IS NULL`을 검증하는가
- [ ] 프론트엔드에서만 데이터를 숨기는 방식이 없는가
- [ ] 비공개 미니홈피와 미존재 slug가 동일한 404 응답으로 통일되어 있는가 (slug 존재 여부 누설 방지)
- [ ] 본인은 비공개 상태에서도 `/(admin)`에서 자기 데이터를 볼 수 있는가

## 4. Supabase 키 노출 방지

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 서버 환경변수에만 존재하는가
- [ ] 위 키가 `NEXT_PUBLIC_*` 접두사로 노출되지 않는가
- [ ] 클라이언트 번들에 위 키가 포함되지 않는가 (빌드 출력 grep)
- [ ] Supabase URL은 공개 가능하지만 anon/public 키 역시 클라이언트에 노출되는지 확인 (anon 키는 공개 허용)
- [ ] Storage 버킷이 자체 인증 모델과 일관되게 설정되어 있는가 (RLS 미사용 시 직접 공개 접근 차단 또는 signed URL 사용)

## 5. 입력 처리

- [ ] zod로 모든 API 입력을 검증하는가
- [ ] 파일 업로드 시 MIME과 크기 제한이 적용되는가
- [ ] slug 형식이 영문/숫자/하이픈으로 제한되는가 (`../` 등 경로 주입 방지)
- [ ] 사용자 입력이 SQL/HTML 인젝션 방어를 통과하는가 (Supabase client는 parameterized, React는 기본 escape)

## 6. 로그 / 감사

- [ ] 서버 로그에 평문 비밀번호, 비밀번호 해시 전체, 외부 API 키가 남지 않는가
- [ ] 다른 사용자 식별자가 우연히 로그에 노출되지 않는가
- [ ] 운영 환경 콘솔 로그에 사용자 이메일이 과도하게 남지 않는가

## 7. 외부 노출 보안 헤더 (Phase 9 이후)

- [ ] `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` 적용
- [ ] CSP는 v1에서는 reportOnly 수준으로 시작, v2에 강화

## 8. 결과 기록

- 보안 위반 발견 시 즉시 `docs/12_DESIGN_CHANGE_REQUESTS.md`에 기록 + 수정 전까지 해당 Phase 미완료 처리.
- 모든 점검 결과는 `docs/08_VALIDATION_LOG.md`의 Phase 엔트리에 회차 기록.

---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 환경 세팅
---

# 환경 세팅

본 문서는 본 미니홈피 서비스의 로컬 개발/운영 환경을 정의한다. Phase 1 진입 시 본 문서를 기준으로 셋업한다.

## 1. 필수 도구

- Node.js LTS (22.x 권장)
- npm (Node 동봉)
- Supabase CLI (`npm i -g supabase`)
- Git
- VS Code 또는 Cursor

## 2. Supabase 프로젝트

- 개발용 / 운영용 2개 분리 (`mini-homepage-dev`, `mini-homepage-prod`)
- 각 프로젝트에서 Storage 버킷 `user-uploads` 생성:
  - Public bucket 여부: **Public**(공개 미니홈피의 이미지를 단순 URL로 노출하기 위함). 단, 경로에 사용자 ID와 UUID가 포함되어 추측 공격을 어렵게 함.
  - 단, 비공개 미니홈피의 이미지 URL이 누설되면 외부 접근 가능하므로, **민감 자료는 업로드하지 않도록 PRD/UI에 안내**한다. 보안 강화(signed URL 모델)는 v2에서 도입.
- Supabase Auth: 본 프로젝트에서는 **사용하지 않음**. Project Settings에서 비활성화 가능하면 비활성화.

## 3. 환경변수

`.env.local.example` (Phase 1에서 생성, 실제 값은 `.env.local`에 채움. `.env.local`은 git ignore):

```bash
# Supabase (서버 전용)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...        # 절대 클라이언트 노출 금지
SUPABASE_STORAGE_BUCKET=user-uploads

# 세션
SESSION_SECRET=...                    # 32자 이상 랜덤. 운영/개발 분리
SESSION_COOKIE_NAME=mh_session

# (선택) Supabase anon key — 클라이언트에서 Public 버킷 URL 빌드에만 사용
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
```

**주의: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`는 절대 만들지 않는다.** 서비스 롤 키는 서버에서만 사용한다.

## 4. 실행 명령

```bash
# 의존성 설치 (Phase 1 진입 후)
npm install

# 개발 서버
npm run dev

# 마이그레이션 적용 (Phase 2 이후)
npx supabase db push        # 개발 환경에만 — 운영은 별도 절차

# 린트 / 타입체크
npm run lint
npm run typecheck

# 테스트 (Phase 7 이후)
npm run test
```

## 5. Git 무시 항목

`.gitignore` (Phase 1에서 생성):
```text
node_modules/
.next/
.env.local
.env.local.*
.claude/settings.local.json
coverage/
```

## 6. 체크리스트

- [ ] Node LTS 설치 확인
- [ ] Supabase CLI 설치 확인
- [ ] 개발용 Supabase 프로젝트 생성, `user-uploads` 버킷 생성
- [ ] `.env.local`에 키 입력, `.env.local`이 git ignore에 포함
- [ ] `npm run dev`로 기본 화면 진입
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 포함되지 않는지 확인 (빌드 후 `.next/` grep)

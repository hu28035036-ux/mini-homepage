// 단일 소스: docs/18_ERROR_CODE_RESPONSE_STANDARD.md
// 새 코드 추가 시 반드시 §18 문서를 먼저 갱신할 것.

export const ERROR_CODES = {
  AUTH_REQUIRED: { status: 401, message: '로그인이 필요합니다.' },
  AUTH_INVALID_CREDENTIAL: { status: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
  AUTH_EMAIL_DUPLICATE: { status: 409, message: '이미 사용 중인 이메일입니다.' },
  AUTH_PERMISSION_DENIED: { status: 403, message: '권한이 없습니다.' },
  AUTH_PASSWORD_MISMATCH: { status: 400, message: '현재 비밀번호가 올바르지 않습니다.' },
  AUTH_PASSWORD_WEAK: { status: 400, message: '비밀번호는 8자 이상이어야 합니다.' },

  VALIDATION_REQUIRED_FIELD: { status: 400, message: '필수 입력값이 누락되었습니다.' },
  VALIDATION_INVALID_FORMAT: { status: 400, message: '입력 형식이 올바르지 않습니다.' },

  HOMEPAGE_SLUG_DUPLICATE: { status: 409, message: '이미 사용 중인 주소입니다.' },
  HOMEPAGE_ALREADY_EXISTS: { status: 409, message: '이미 미니홈피가 있습니다.' },
  HOMEPAGE_PRIVATE_OR_NOT_FOUND: { status: 404, message: '페이지를 찾을 수 없거나 비공개 상태입니다.' },

  URL_INVALID_FORMAT: { status: 400, message: '올바른 URL 형식이 아닙니다.' },

  ALBUM_CATEGORY_DUPLICATE: { status: 409, message: '이미 사용 중인 카테고리 이름입니다.' },
  PHOTO_INVALID_MIME: { status: 400, message: '지원하지 않는 이미지 형식입니다.' },

  DECORATE_INVALID_VALUE: { status: 400, message: '꾸미기 설정 값이 올바르지 않습니다.' },
  LAYOUT_INVALID_MODE: { status: 400, message: '레이아웃 모드 값이 올바르지 않습니다.' },
  LAYOUT_INVALID_SLOT: { status: 400, message: '슬롯 번호가 올바르지 않습니다.' },
  LAYOUT_WIDGET_UNKNOWN: { status: 400, message: '알 수 없는 위젯입니다.' },
  LAYOUT_WIDGET_DUPLICATED: { status: 400, message: '같은 위젯을 중복 배치할 수 없습니다.' },

  STORAGE_UPLOAD_FAILED: { status: 500, message: '파일 업로드에 실패했습니다.' },
  STORAGE_FILE_TOO_LARGE: { status: 413, message: '파일 크기가 너무 큽니다. (최대 10MB)' },

  DB_RECORD_NOT_FOUND: { status: 404, message: '데이터를 찾을 수 없습니다.' },

  SERVER_INTERNAL_ERROR: { status: 500, message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public details?: Record<string, unknown>,
    overrideMessage?: string
  ) {
    super(overrideMessage ?? ERROR_CODES[code].message);
    this.name = 'AppError';
  }

  get status() {
    return ERROR_CODES[this.code].status;
  }
}

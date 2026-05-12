import { NextResponse } from 'next/server';
import { AppError, ERROR_CODES, type ErrorCode } from './codes';

export function ok<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function fail(code: ErrorCode, details?: Record<string, unknown>, overrideMessage?: string) {
  const def = ERROR_CODES[code];
  return NextResponse.json(
    {
      success: false,
      error_code: code,
      message: overrideMessage ?? def.message,
      details,
    },
    { status: def.status }
  );
}

/** 서비스에서 throw된 AppError 또는 알 수 없는 예외를 표준 응답으로 변환 */
export function handle(err: unknown) {
  if (err instanceof AppError) {
    return fail(err.code, err.details, err.message);
  }
  console.error('[unhandled]', err);
  return fail('SERVER_INTERNAL_ERROR');
}

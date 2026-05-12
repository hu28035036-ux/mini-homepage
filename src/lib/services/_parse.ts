import type { ZodTypeAny, z } from 'zod';
import { AppError } from '@/lib/errors/codes';

export function parseInput<S extends ZodTypeAny>(schema: S, raw: unknown): z.infer<S> {
  const r = schema.safeParse(raw);
  if (!r.success) {
    const issue = r.error.issues[0];
    const field = issue?.path?.[0]?.toString();
    if (issue?.message === 'URL_INVALID_FORMAT') {
      throw new AppError('URL_INVALID_FORMAT', { field });
    }
    if (issue?.code === 'invalid_type' && issue.received === 'undefined') {
      throw new AppError('VALIDATION_REQUIRED_FIELD', { field });
    }
    if (issue?.code === 'too_small') {
      throw new AppError('VALIDATION_REQUIRED_FIELD', { field });
    }
    throw new AppError('VALIDATION_INVALID_FORMAT', { field, hint: issue?.message });
  }
  return r.data;
}

// Supabase Storage 내부 경로 헬퍼.
// 형식: {user_id}/{kind}/{uuid.ext}
// user_id를 경로에 포함해 사용자별 격리(접두사) + UUID로 추측 어렵게.

function rand(): string {
  return crypto.randomUUID();
}

function safeExt(filename: string): string {
  const m = /\.([a-zA-Z0-9]{1,5})$/.exec(filename);
  return m ? m[1].toLowerCase() : 'bin';
}

export function photoPath(userId: string, filename: string): string {
  return `${userId}/photos/${rand()}.${safeExt(filename)}`;
}

export function backgroundPath(userId: string, filename: string): string {
  return `${userId}/background/${rand()}.${safeExt(filename)}`;
}

export function profilePath(userId: string, filename: string): string {
  return `${userId}/profile/${rand()}.${safeExt(filename)}`;
}

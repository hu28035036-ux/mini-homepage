import { homepageService } from '@/lib/services/homepage';
import { ok, handle } from '@/lib/errors/response';

export async function GET() {
  try {
    const hp = await homepageService.getMine();
    return ok({ homepage: hp });
  } catch (e) {
    return handle(e);
  }
}

export async function POST() {
  try {
    const hp = await homepageService.ensureMine();
    return ok({ homepage: hp }, '미니홈피가 준비되었습니다.', 201);
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const allowed: Record<string, unknown> = {};
    for (const k of ['title', 'intro', 'profile_image_url', 'is_public', 'slug']) {
      if (k in body) allowed[k] = body[k];
    }
    const hp = await homepageService.updateProfile(allowed);
    return ok({ homepage: hp }, '저장되었습니다.');
  } catch (e) {
    return handle(e);
  }
}

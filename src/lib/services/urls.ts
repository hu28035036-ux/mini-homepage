import { requireUser } from '@/lib/auth/guards';
import { urlsRepo } from '@/lib/repositories/urls';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { AppError } from '@/lib/errors/codes';
import { createUrlSchema, updateUrlSchema } from '@/lib/validators/urls';
import { parseInput } from './_parse';

async function getMyHomepageOr404(uid: string) {
  const hp = await homepagesRepo.findByUserActive(uid);
  if (!hp) throw new AppError('DB_RECORD_NOT_FOUND');
  return hp;
}

export const urlsService = {
  async list() {
    const uid = await requireUser();
    const hp = await getMyHomepageOr404(uid);
    return urlsRepo.listByUser(uid, hp.id);
  },

  async create(raw: unknown) {
    const uid = await requireUser();
    const hp = await getMyHomepageOr404(uid);
    const input = parseInput(createUrlSchema, raw);
    return urlsRepo.insert({ user_id: uid, homepage_id: hp.id, ...input });
  },

  async update(id: string, raw: unknown) {
    const uid = await requireUser();
    const input = parseInput(updateUrlSchema, raw);
    return urlsRepo.update(uid, id, input);
  },

  async remove(id: string) {
    const uid = await requireUser();
    await urlsRepo.softDelete(uid, id);
  },
};

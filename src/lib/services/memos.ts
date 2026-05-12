import { requireUser } from '@/lib/auth/guards';
import { memosRepo } from '@/lib/repositories/memos';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { AppError } from '@/lib/errors/codes';
import { createMemoSchema, updateMemoSchema } from '@/lib/validators/memos';
import { parseInput } from './_parse';

async function myHp(uid: string) {
  const hp = await homepagesRepo.findByUserActive(uid);
  if (!hp) throw new AppError('DB_RECORD_NOT_FOUND');
  return hp;
}

export const memosService = {
  async list() {
    const uid = await requireUser();
    const hp = await myHp(uid);
    return memosRepo.listByUser(uid, hp.id);
  },
  async findOwned(id: string) {
    const uid = await requireUser();
    const m = await memosRepo.findOwned(uid, id);
    if (!m) throw new AppError('DB_RECORD_NOT_FOUND');
    return m;
  },
  async create(raw: unknown) {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(createMemoSchema, raw);
    return memosRepo.insert({ user_id: uid, homepage_id: hp.id, ...input });
  },
  async update(id: string, raw: unknown) {
    const uid = await requireUser();
    const input = parseInput(updateMemoSchema, raw);
    return memosRepo.update(uid, id, input);
  },
  async remove(id: string) {
    const uid = await requireUser();
    await memosRepo.softDelete(uid, id);
  },
};

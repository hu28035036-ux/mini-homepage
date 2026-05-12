import { requireUser } from '@/lib/auth/guards';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { uploadImage } from '@/lib/storage/uploader';
import { backgroundPath, profilePath } from '@/lib/storage/paths';
import { AppError } from '@/lib/errors/codes';
import { updateDecorateSchema } from '@/lib/validators/decorate';
import { parseInput } from './_parse';
import type { LayoutMode, LayoutSlot } from '@/types/db';

function validateLayout(mode: LayoutMode | undefined, slots: LayoutSlot[] | undefined) {
  if (slots === undefined) return;
  if (!mode) throw new AppError('LAYOUT_INVALID_MODE');
  const expected = mode === 'single' ? 4 : 6;
  if (slots.length !== expected) {
    throw new AppError('LAYOUT_INVALID_SLOT', { expected, got: slots.length });
  }
  const seenSlots = new Set<number>();
  const seenWidgets = new Map<string, number>();
  for (const s of slots) {
    if (s.slot < 1 || s.slot > expected) {
      throw new AppError('LAYOUT_INVALID_SLOT', { slot: s.slot });
    }
    if (seenSlots.has(s.slot)) {
      throw new AppError('LAYOUT_INVALID_SLOT', { duplicateSlot: s.slot });
    }
    seenSlots.add(s.slot);

    if (!['profile', 'urls', 'albums', 'memos', 'empty'].includes(s.widget)) {
      throw new AppError('LAYOUT_WIDGET_UNKNOWN', { widget: s.widget });
    }
    if (s.widget !== 'empty') {
      const n = (seenWidgets.get(s.widget) ?? 0) + 1;
      if (n >= 2) throw new AppError('LAYOUT_WIDGET_DUPLICATED', { widget: s.widget });
      seenWidgets.set(s.widget, n);
    }
  }
}

export const decorateService = {
  async save(raw: unknown) {
    const uid = await requireUser();
    const input = parseInput(updateDecorateSchema, raw);

    // 레이아웃 모드와 슬롯이 함께 일관되어야 함.
    // mode만 바뀌고 slots가 안 왔다면 기존 슬롯과 불일치할 수 있으므로 함께 보내도록 권장.
    const next = await homepagesRepo.findByUserActive(uid);
    if (!next) throw new AppError('DB_RECORD_NOT_FOUND');
    const finalMode = input.layout_mode ?? next.layout_mode;
    const finalSlots = input.layout_slots ?? next.layout_slots;
    validateLayout(finalMode, finalSlots);

    return homepagesRepo.updateDecorate(uid, input);
  },

  async uploadBackground(file: { buffer: Buffer; mime: string; byteSize: number; filename: string }) {
    const uid = await requireUser();
    const path = backgroundPath(uid, file.filename);
    const url = await uploadImage(file.buffer, file.mime, file.byteSize, path);
    await homepagesRepo.updateDecorate(uid, { background_image_url: url, use_background_image: true });
    return { background_image_url: url };
  },

  async uploadProfileImage(file: { buffer: Buffer; mime: string; byteSize: number; filename: string }) {
    const uid = await requireUser();
    const path = profilePath(uid, file.filename);
    const url = await uploadImage(file.buffer, file.mime, file.byteSize, path);
    await homepagesRepo.updateProfile(uid, { profile_image_url: url });
    return { profile_image_url: url };
  },
};

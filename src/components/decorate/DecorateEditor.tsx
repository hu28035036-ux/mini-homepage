'use client';

import { useState, useMemo, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, GhostButton, Input, Label, ErrorText } from '@/components/ui/primitives';
import { WidgetBoard, cardClass, type PreviewData, type DecorateStyle } from '@/components/public/WidgetRenderer';
import { useTrack, fontSizeClass } from '@/components/canvas/FreeCanvas';
import { PATTERN_LIST, patternImage, patternSize, patternPosition } from '@/lib/canvas/patterns';
import { ColorPicker, colorOrGradientStyle, textColorOrGradientStyle } from '@/components/decorate/ColorPicker';
import type { MiniHomepageRow, LayoutMode, LayoutSlot, WidgetKind, CardStyle, FontStyle, FontSize, BackgroundPattern } from '@/types/db';

const CARD_STYLES: { value: CardStyle; label: string }[] = [
  { value: 'basic', label: '기본형' },
  { value: 'rounded', label: '둥근형' },
  { value: 'shadow', label: '그림자형' },
  { value: 'transparent', label: '투명형' },
  { value: 'soft', label: '부드러운' },
  { value: 'bordered', label: '굵은 테두리' },
  { value: 'glass', label: '유리 (Glassmorphism)' },
  { value: 'minimal', label: '미니멀 (선만)' },
  { value: 'elevated', label: '들뜬 그림자' },
  { value: 'frame', label: '액자 (이중 테두리)' },
  // 메모지 시리즈
  { value: 'sticky', label: '포스트잇 (노랑)' },
  { value: 'mint', label: '메모지 (민트)' },
  { value: 'pink', label: '메모지 (파스텔 핑크)' },
  { value: 'sky', label: '메모지 (스카이)' },
  // 노트/모눈
  { value: 'notebook', label: '노트 (라인)' },
  { value: 'grid-paper', label: '모눈 종이' },
  // 테두리 변형
  { value: 'dashed', label: '점선 테두리' },
  { value: 'double-border', label: '이중선 테두리' },
  { value: 'ringed', label: '링 테두리 (보라)' },
  { value: 'bevel', label: '입체 (Bevel)' },
];

const FONT_STYLES: { value: FontStyle; label: string }[] = [
  { value: 'default', label: '기본 (시스템)' },
  { value: 'pretendard', label: 'Pretendard (모던)' },
  { value: 'notoSans', label: '본고딕 / Noto Sans KR' },
  { value: 'notoSerif', label: '본명조 / Noto Serif KR' },
  { value: 'ibmPlex', label: 'IBM Plex Sans KR' },
  { value: 'nanumGothic', label: '나눔고딕' },
  { value: 'gowunDodum', label: '고운 도담 (깔끔 손글씨)' },
  { value: 'rounded', label: '둥근 / Nunito' },
  { value: 'nanumPen', label: '나눔손글씨 펜 (감성)' },
  { value: 'emotional', label: '감성 (펜 + 도담 혼합)' },
  { value: 'hiMelody', label: '하이멜로디 (귀여움)' },
  { value: 'blackHan', label: 'Black Han Sans (헤드라인)' },
];

const WIDGETS: WidgetKind[] = ['profile', 'urls', 'albums', 'memos', 'empty'];

const SAMPLE: PreviewData = {
  profile: { nickname: '미리보기', intro: '나만의 공간을 꾸미는 중...', image_url: null },
  urls: [{ id: 'd1', title: '다시 보고 싶은 사이트', url: 'https://example.com', created_at: new Date().toISOString() }],
  albums: [
    {
      category: '기본 앨범',
      photos: [
        { id: 'p1', image_url: 'https://placehold.co/200x200/eee/aaa?text=1', caption: null },
        { id: 'p2', image_url: 'https://placehold.co/200x200/eee/aaa?text=2', caption: null },
        { id: 'p3', image_url: 'https://placehold.co/200x200/eee/aaa?text=3', caption: null },
      ],
    },
  ],
  memos: [{ id: 'm1', title: '오늘의 메모', content: '나만의 공간을 꾸미는 중...', created_at: new Date().toISOString() }],
};

function defaultSlotsFor(mode: LayoutMode): LayoutSlot[] {
  if (mode === 'single') {
    return [
      { slot: 1, widget: 'profile', visible: true },
      { slot: 2, widget: 'urls', visible: true },
      { slot: 3, widget: 'albums', visible: true },
      { slot: 4, widget: 'memos', visible: true },
    ];
  }
  return [
    { slot: 1, widget: 'profile', visible: true },
    { slot: 2, widget: 'urls', visible: true },
    { slot: 3, widget: 'albums', visible: true },
    { slot: 4, widget: 'memos', visible: true },
    { slot: 5, widget: 'empty', visible: true },
    { slot: 6, widget: 'empty', visible: true },
  ];
}

export function DecorateEditor({ initial }: { initial: MiniHomepageRow }) {
  const [bg, setBg] = useState(initial.background_color);
  const [bgUrl, setBgUrl] = useState<string | null>(initial.background_image_url);
  const [useBg, setUseBg] = useState(initial.use_background_image);
  const [pattern, setPattern] = useState<BackgroundPattern>(initial.background_pattern ?? 'none');
  const [patternColor, setPatternColor] = useState(initial.background_pattern_color ?? '#00000022');
  const [point, setPoint] = useState(initial.point_color);
  const [text, setText] = useState(initial.text_color);
  const [card, setCard] = useState<CardStyle>(initial.card_style);
  const [cardBg, setCardBg] = useState<string>(initial.card_background_color ?? '');
  const [font, setFont] = useState<FontStyle>(initial.font_style);
  const [opacity, setOpacity] = useState<number>(initial.default_card_opacity ?? 1);
  const [fontSize, setFontSize] = useState<FontSize>(initial.default_font_size ?? 'base');
  const [mode, setMode] = useState<LayoutMode>(initial.layout_mode);
  const [slots, setSlots] = useState<LayoutSlot[]>(initial.layout_slots);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const bgInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const track = useTrack();
  const isMobile = track === 'mobile';

  // 모바일: 꾸미기는 PC/태블릿 전용. 안내 + 홈으로 돌아가기만 노출.
  if (isMobile) {
    return (
      <div className="space-y-4 pt-2">
        <h1 className="text-xl font-bold">꾸미기</h1>
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-black/5 p-5 text-sm space-y-3">
          <p>꾸미기는 PC/태블릿(가로 768px 이상)에서 사용해주세요.</p>
          <p className="text-xs opacity-70">
            모바일에서는 기록(URL/앨범/메모) 위주로 사용하고, 꾸미기는 큰 화면에서 진행하는 게 편해요.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 중복 위젯 감지
  const duplicates = useMemo(() => {
    const seen = new Map<string, number>();
    for (const s of slots) {
      if (s.widget === 'empty') continue;
      seen.set(s.widget, (seen.get(s.widget) ?? 0) + 1);
    }
    return [...seen.entries()].filter(([, n]) => n >= 2).map(([w]) => w as WidgetKind);
  }, [slots]);

  const previewStyle: DecorateStyle = {
    background_color: bg,
    background_image_url: bgUrl,
    use_background_image: useBg,
    point_color: point,
    text_color: text,
    card_style: card,
    font_style: font,
    layout_mode: mode,
    layout_slots: slots,
  };

  function changeMode(next: LayoutMode) {
    setMode(next);
    setSlots(defaultSlotsFor(next));
  }

  function setSlot(idx: number, patch: Partial<LayoutSlot>) {
    setSlots((s) => s.map((sl, i) => (i === idx ? { ...sl, ...patch } : sl)));
  }

  async function uploadBg(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('file', f);
    const r = await (await fetch('/api/decorate/background', { method: 'POST', body: fd })).json();
    if (!r.success) {
      setErr(r.message ?? '업로드 실패');
      return;
    }
    setBgUrl(r.data.background_image_url);
    setUseBg(true);
    if (bgInputRef.current) bgInputRef.current.value = '';
  }

  async function save() {
    setErr('');
    setMsg('');
    if (duplicates.length > 0) {
      setErr(`중복된 위젯이 있습니다: ${duplicates.join(', ')}`);
      return;
    }
    setSaving(true);
    const r = await (await fetch('/api/decorate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        background_color: bg,
        background_image_url: bgUrl,
        use_background_image: useBg,
        background_pattern: pattern,
        background_pattern_color: patternColor,
        point_color: point,
        text_color: text,
        card_style: card,
        card_background_color: cardBg || null,
        font_style: font,
        default_card_opacity: opacity,
        default_font_size: fontSize,
        layout_mode: mode,
        layout_slots: slots,
      }),
    })).json();
    setSaving(false);
    if (!r.success) {
      setErr(r.message ?? '저장 실패');
      return;
    }
    setMsg('저장되었습니다.');
    // server component(admin/layout, HomeDashboard)가 새 값으로 다시 렌더되게
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">꾸미기</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-700">{msg}</span>}
          <Button onClick={save} disabled={saving || duplicates.length > 0}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
      {err && <ErrorText>{err}</ErrorText>}

      <div className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4"}>
        {/* 좌측 편집 패널 */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-bold mb-3">배경</h2>
            <Label htmlFor="bg">배경색 (단색 또는 그라데이션)</Label>
            <ColorPicker id="bg" value={bg} onChange={setBg} className="mb-3" />
            <Label>배경 이미지</Label>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200">
                <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={uploadBg} />
                업로드
              </label>
              {bgUrl && <span className="text-xs text-green-700">등록됨</span>}
            </div>
            <label className="flex items-center gap-2 mt-3 text-sm">
              <input type="checkbox" checked={useBg} onChange={(e) => setUseBg(e.target.checked)} />
              배경 이미지 사용
            </label>
            <p className="text-[11px] opacity-60 mt-1">이미지를 사용하면 무늬는 가려집니다.</p>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Label htmlFor="pattern-select">무늬 (배경색 위에 표시)</Label>
              <select
                id="pattern-select"
                value={pattern}
                onChange={(e) => setPattern(e.target.value as BackgroundPattern)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 mb-2"
              >
                {PATTERN_LIST.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <Label htmlFor="pattern-color">무늬 색상</Label>
              <div className="flex items-center gap-2">
                <input
                  id="pattern-color"
                  type="color"
                  value={(patternColor || '#000000').slice(0, 7)}
                  onChange={(e) => setPatternColor(e.target.value + (patternColor.length === 9 ? patternColor.slice(7) : '22'))}
                  className="w-10 h-10 rounded border"
                />
                <Input
                  value={patternColor}
                  onChange={(e) => setPatternColor(e.target.value)}
                  className="flex-1"
                  placeholder="#00000022 (끝 2자리: 투명도)"
                />
              </div>
              <div
                className="mt-3 rounded border border-gray-200 p-4 flex flex-col items-center justify-center gap-2"
                style={{
                  backgroundColor: bg,
                  backgroundImage: pattern === 'none' ? undefined : patternImage(pattern, patternColor),
                  backgroundSize: pattern === 'none' ? undefined : patternSize(pattern),
                  backgroundPosition: pattern === 'none' ? undefined : patternPosition(pattern),
                  minHeight: '120px',
                }}
                aria-label="종합 미리보기 (배경 + 무늬 + 카드)"
              >
                <div
                  className={`${cardClass(card)} px-3 py-2 ${fontSizeClass(fontSize)}`}
                  style={{ opacity, color: text, minWidth: '60%', textAlign: 'center' }}
                >
                  샘플 카드
                </div>
                <div className="text-[10px] opacity-60" style={{ color: text }}>
                  {pattern === 'none' ? '무늬 없음' : PATTERN_LIST.find((p) => p.value === pattern)?.label}
                  {' · 투명도 '}{Math.round(opacity * 100)}%
                  {' · '}{fontSize.toUpperCase()}
                </div>
              </div>
              {useBg && (
                <p className="text-[11px] text-amber-700 mt-2">⚠ 배경 이미지를 사용 중입니다. 이미지를 끄면(체크 해제) 무늬가 보입니다.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-bold mb-3">색상</h2>
            <Label htmlFor="point">포인트 색상</Label>
            <ColorPicker id="point" value={point} onChange={setPoint} className="mb-3" solidOnly />
            <Label htmlFor="text">글자 색상</Label>
            <ColorPicker id="text" value={text} onChange={setText} solidOnly />
            <p className="text-[11px] opacity-60 mt-1">포인트·글자 색상은 단색만 지원.</p>
          </Card>

          <Card>
            <Label htmlFor="card-select">카드 스타일</Label>
            <select
              id="card-select"
              value={card}
              onChange={(e) => setCard(e.target.value as CardStyle)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 mb-3"
            >
              {CARD_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="card-bg">카드 배경색 (단색/그라데이션)</Label>
              {cardBg && (
                <button
                  type="button"
                  onClick={() => setCardBg('')}
                  className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200"
                  title="스타일 기본색으로 되돌리기"
                >
                  기본값
                </button>
              )}
            </div>
            {cardBg ? (
              <ColorPicker id="card-bg" value={cardBg} onChange={setCardBg} />
            ) : (
              <button
                type="button"
                onClick={() => setCardBg('#ffffff')}
                className="w-full text-xs py-2 rounded border border-dashed border-gray-300 hover:bg-gray-50"
              >
                + 사용자 지정 색상 추가 (비워두면 스타일 기본색)
              </button>
            )}

            <div
              className={`mt-3 ${cardClass(card)} p-3 text-xs`}
              style={cardBg ? colorOrGradientStyle(cardBg) : undefined}
            >
              샘플 카드 — {CARD_STYLES.find((s) => s.value === card)?.label}
            </div>
          </Card>

          <Card>
            <Label htmlFor="font-select">폰트</Label>
            <select
              id="font-select"
              value={font}
              onChange={(e) => setFont(e.target.value as FontStyle)}
              className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 font-${font}`}
            >
              {FONT_STYLES.map((s) => (
                <option key={s.value} value={s.value} className={`font-${s.value}`}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className={`mt-2 text-base font-${font}`}>가나다라 — The quick brown fox jumps over the lazy dog. 1234</p>
          </Card>

          <Card>
            <Label htmlFor="opacity">카드 투명도 (전역 기본값)</Label>
            <div className="flex items-center gap-2">
              <input
                id="opacity"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm tabular-nums w-12 text-right">{Math.round(opacity * 100)}%</span>
            </div>
            <p className="text-[11px] opacity-60 mt-1">카드별로 다르게 하려면 편집 모드에서 카드를 선택하세요.</p>
          </Card>

          <Card>
            <Label htmlFor="font-size">글자 크기 (전역 기본값)</Label>
            <select
              id="font-size"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSize)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="xs">XS — 매우 작게</option>
              <option value="sm">SM — 작게</option>
              <option value="base">기본</option>
              <option value="lg">LG — 크게</option>
              <option value="xl">XL — 매우 크게</option>
            </select>
            <p className="text-[11px] opacity-60 mt-1">카드별로 다르게 하려면 편집 모드에서 카드를 선택하세요.</p>
          </Card>

          {/* v2.1에서 자유 캔버스로 대체 예정. v1 레이아웃 모드/슬롯 편집기는 숨김. */}
        </div>

        {/* 우측 미리보기 — 모바일에선 안 보임 (자유 캔버스가 모바일에선 미노출) */}
        {!isMobile && (
          <Card className="p-0 overflow-hidden sticky top-4 h-fit max-h-[calc(100vh-2rem)]">
            <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 bg-white">미리보기 (저장 전)</div>
            <div
              className={`max-h-[calc(100vh-6rem)] overflow-auto ${fontSizeClass(fontSize)}`}
              style={{
                opacity,
                backgroundColor: bg,
                backgroundImage: pattern === 'none' ? undefined : patternImage(pattern, patternColor),
                backgroundSize: pattern === 'none' ? undefined : patternSize(pattern),
                backgroundPosition: pattern === 'none' ? undefined : patternPosition(pattern),
              }}
            >
              <WidgetBoard style={previewStyle} data={SAMPLE} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// 일회용 아이콘 생성 (의존성 0)
// 보라색 단색 사각형 PNG 192/512/180 + 32 favicon
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const COLOR = [0x7c, 0x3a, 0xed]; // violet-600
const LETTER_COLOR = [0xff, 0xff, 0xff];

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function makePNG(size) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // raw scanlines: filter 0 + RGB
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      // 가운데 작은 흰 사각형으로 미니홈피의 "ㅁ" 느낌
      const cx = size / 2, cy = size / 2;
      const inner = Math.floor(size * 0.45) / 2;
      const isInner = Math.abs(x - cx) < inner && Math.abs(y - cy) < inner;
      const isInnerHole = Math.abs(x - cx) < inner - Math.max(2, size*0.04) && Math.abs(y - cy) < inner - Math.max(2, size*0.04);
      const [r,g,b] = (isInner && !isInnerHole) ? LETTER_COLOR : COLOR;
      row[1 + x*3] = r;
      row[1 + x*3 + 1] = g;
      row[1 + x*3 + 2] = b;
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', makePNG(192));
writeFileSync('public/icons/icon-512.png', makePNG(512));
writeFileSync('public/icons/apple-touch-icon.png', makePNG(180));
writeFileSync('public/icons/favicon-32.png', makePNG(32));

console.log('icons generated');

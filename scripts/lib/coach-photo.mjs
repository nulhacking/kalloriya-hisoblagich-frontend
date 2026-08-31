/**
 * Gemini chiqargan xrom-yashil fondagi kadrni stiker/GIF uchun tayyorlash.
 *
 * Bu yerda uchta ish bor:
 *   • `cutout` — yashil fonni olib tashlash (chetlarga yashil surtilib qolmasin);
 *   • `stickerCard` — 512×512 shaffof PNG: oq kontur + pastda yozuv (Telegram stikeri);
 *   • `gifFrames` — gradient fon ustida "nafas olayotgan" kadrlar (bot GIF i uchun).
 */

import sharp from "sharp";

/** Fon rangi: #00B140 xrom-yashil. */
const GREEN_HARD = 60; // shundan katta "yashillik" — to'liq shaffof
const GREEN_SOFT = 18; // shundan katta — yarim shaffof (chekka yumshoqligi)

/**
 * Yashil fonni kesish + chekkadagi yashil surtimni bostirish (despill).
 * Qaytaradi: {buffer: PNG (RGBA), width, height} — faqat qahramon, atrofi kesilgan.
 */
export async function cutout(input) {
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const rb = Math.max(r, b);
    const greenness = g - rb;

    if (greenness > GREEN_HARD && g > 70) {
      data[i + 3] = 0;
      continue;
    }

    if (greenness > GREEN_SOFT) {
      // Chekka piksel: qisman shaffof va yashil surtim bostiriladi.
      const t = (greenness - GREEN_SOFT) / (GREEN_HARD - GREEN_SOFT);
      data[i + 3] = Math.round(data[i + 3] * (1 - t));
      data[i + 1] = Math.round(rb + (g - rb) * 0.25);
    }

    if (data[i + 3] > 12) {
      const p = i / channels;
      const x = p % width;
      const y = (p - x) / width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error("Kadrda qahramon topilmadi (hammasi yashil?)");

  const cropped = await sharp(data, { raw: { width, height, channels } })
    .extract({
      left: minX,
      top: minY,
      width: Math.max(1, maxX - minX + 1),
      height: Math.max(1, maxY - minY + 1),
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  return { buffer: cropped.data, width: cropped.info.width, height: cropped.info.height };
}

/** Qahramonni kvadrat ramkaga sig'dirish (pastda yozuv uchun joy qoldirib). */
export async function fitSquare(cutoutBuffer, size, { margin = 0.04, bottom = 0 } = {}) {
  const pad = Math.round(size * margin);
  const boxW = size - pad * 2;
  const boxH = size - pad * 2 - bottom;

  const fitted = await sharp(cutoutBuffer)
    .resize(boxW, boxH, { fit: "inside", withoutEnlargement: false })
    .toBuffer({ resolveWithObject: true });

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: fitted.data,
        left: Math.round((size - fitted.info.width) / 2),
        top: Math.round((size - bottom - fitted.info.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Ilovadagi dumaloq avatar uchun bosh + yelka kesimi.
 *
 * Bosh gorizontal bo'yicha har pozada har xil joyda turadi (qo'l ko'tarilgan
 * bo'lsa siljiydi), shuning uchun markaz yuqori qatorlardagi piksellardan
 * hisoblanadi — shunda yuz doiraning o'rtasiga tushadi.
 */
export async function headCrop(cutoutBuffer, size) {
  const { data, info } = await sharp(cutoutBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const scanRows = Math.max(1, Math.round(height * 0.18));
  let minX = width;
  let maxX = -1;
  for (let y = 0; y < scanRows; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  const headCenter = maxX >= 0 ? (minX + maxX) / 2 : width / 2;
  const side = Math.round(Math.min(width, height * 0.66));
  const left = Math.max(0, Math.min(width - side, Math.round(headCenter - side / 2)));

  return sharp(cutoutBuffer)
    .extract({ left, top: 0, width: side, height: Math.min(side, height) })
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 88, alphaQuality: 90 })
    .toBuffer();
}

/** Figura atrofidagi oq kontur — stiker ko'rinishi (Telegram uslubi). */
export async function whiteOutline(rgbaPng, size, thickness = 9) {
  const alpha = await sharp(rgbaPng).extractChannel("alpha").blur(thickness * 0.7).toBuffer();
  // Blur qilingan alfa kanalini qattiqlashtiramiz: yumshoq chekka → to'liq oq.
  const mask = await sharp(alpha).linear(6, -60).toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 3, background: "#ffffff" },
  })
    .joinChannel(mask)
    .png()
    .toBuffer();
}

/** Pastdagi yozuv ("ZO'R!") — oq harflar, to'q kontur bilan. */
export function captionSvg(size, text) {
  const fontSize = Math.round(size * 0.125);
  const stroke = Math.round(size * 0.026);
  const safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<text x="${size / 2}" y="${size - Math.round(size * 0.035)}" text-anchor="middle" ` +
      `font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fontSize}" ` +
      `font-weight="900" letter-spacing="2" fill="#ffffff" stroke="#33190f" ` +
      `stroke-width="${stroke}" paint-order="stroke">${safe}</text></svg>`,
  );
}

/** GIF/karta foni: bosh orqasida issiq nur, chetlarga qorayadi (ilovadagi bilan bir xil). */
export function backgroundSvg(size, glow = 1) {
  const r = Math.round(72 * glow);
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>` +
      `<radialGradient id="g" cx="50%" cy="34%" r="${r}%">` +
      `<stop offset="0%" stop-color="#ff9a3c"/>` +
      `<stop offset="38%" stop-color="#c72b28"/>` +
      `<stop offset="100%" stop-color="#3b0f12"/>` +
      `</radialGradient>` +
      `<radialGradient id="v" cx="50%" cy="45%" r="72%">` +
      `<stop offset="60%" stop-color="#000000" stop-opacity="0"/>` +
      `<stop offset="100%" stop-color="#4c0519" stop-opacity="0.55"/>` +
      `</radialGradient>` +
      `</defs>` +
      `<rect width="${size}" height="${size}" fill="url(#g)"/>` +
      `<circle cx="${size / 2}" cy="${size * 0.42}" r="${size * 0.36 * glow}" fill="#ffd9a8" opacity="0.16"/>` +
      `<rect width="${size}" height="${size}" fill="url(#v)"/>` +
      `</svg>`,
  );
}

/**
 * Jonli kadrlar: qahramon sekin "nafas oladi" (kattalashib-kichrayadi va
 * bir oz tebranadi), fon nuri esa puls uradi. Video model kerak emas.
 */
export async function gifFrames(cutoutBuffer, size, caption, frames = 14) {
  const out = [];
  const baseW = Math.round(size * 0.94);

  for (let i = 0; i < frames; i += 1) {
    const t = Math.sin((i / frames) * Math.PI * 2);
    const scale = 1 + t * 0.022;
    const shiftY = Math.round(-t * size * 0.008);

    const person = await sharp(cutoutBuffer)
      .resize(Math.round(baseW * scale), Math.round(size * 0.9 * scale), {
        fit: "inside",
      })
      .toBuffer({ resolveWithObject: true });

    const layers = [
      {
        input: person.data,
        left: Math.round((size - person.info.width) / 2),
        top: Math.round(size - person.info.height + size * 0.02) + shiftY,
      },
    ];
    if (caption) layers.push({ input: captionSvg(size, caption) });

    out.push(
      await sharp(backgroundSvg(size, 1 + t * 0.06))
        .composite(layers)
        .png()
        .toBuffer(),
    );
  }

  return out;
}

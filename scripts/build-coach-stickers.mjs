/**
 * Motivator Murabbiy stikerlari va bot rasmlari.
 *
 * Ikki manba bor, biri ikkinchisining zaxirasi:
 *
 *   1. FOTO (asosiy) — `assets/coach-source/motivator-<mood>.jpg`, ya'ni Gemini
 *      chiqargan stilize 3D kadrlar (`yarn coach:art`). Yashil fon kesiladi,
 *      oq kontur va yozuv qo'yiladi;
 *   2. VEKTOR (zaxira) — foto bo'lmasa `src/components/coach/MotivatorArt.tsx`
 *      server-side render qilinadi (ilovadagi kichik avatar baribir shu chizma).
 *
 * Chiqadigan fayllar:
 *   • `motivator-<mood>.png`  — 512×512 shaffof, Telegram stikeri;
 *   • `motivator-<mood>.webp` — o'sha stikerning yengil varianti (yuklash uchun);
 *   • `motivator-<mood>-card.png` — 640×640 fonli kartochka: BOT shu rasmni har
 *     javobda yuboradi va matnni uning tagiga sarlavha qilib yozadi (Telegram
 *     fotosi shaffoflikni ko'tarmaydi, shuning uchun stikerdan alohida);
 *   • `motivator-<mood>-avatar.webp` — 192×192 bosh+yelka, ilovadagi avatar
 *     uchun (yengil: ~15 KB, chunki chatda har xabarda ko'rinadi);
 *   • `motivator-<mood>-full.webp`   — 512×512 to'liq gavda, yozuvsiz: ilovadagi
 *     katta joylar (hero, paywall, bo'sh ekran);
 *   • `motivator-avatar.png`  — fonli portret (OG rasm, ilovadagi katta joylar).
 *
 *   yarn stickers
 *
 * Natija ikki joyga yoziladi: frontend `public/coach/` va backend `assets/coach/`
 * (bot faylni to'g'ridan-to'g'ri yuboradi) — backend repo yonma-yon tursa.
 */

import { build } from "esbuild";
import { mkdir, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import sharp from "sharp";

import {
  backgroundSvg,
  captionSvg,
  cutout,
  cardImage,
  fitSquare,
  headCrop,
  whiteOutline,
} from "./lib/coach-photo.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ART = join(ROOT, "src/components/coach/MotivatorArt.tsx");
const OUT_DIR = join(ROOT, "public/coach");
const SOURCE_DIR = join(ROOT, "assets/coach-source");
// Bot fayldan yuborishi uchun backendga ham nusxa (yonma-yon turgan repo).
const BACKEND_DIR = join(ROOT, "../kalloriya-hisoblagich-backend/assets/coach");

const STICKER_SIZE = 512;
/** Ilovadagi dumaloq avatar (retina uchun 2x). */
const AVATAR_SIZE = 192;
/** Botdagi rasmli xabar uchun kartochka o'lchami. */
const CARD_SIZE = 640;

/** Har bir reaksiya: kayfiyat + ustidagi matn + Telegramdagi emoji. */
const STICKERS = [
  { mood: "hello", caption: "SALOM!", emoji: "👋", note: "tanishuv, suhbat boshlanishi" },
  { mood: "win", caption: "ZO'R!", emoji: "💪", note: "maqsad bajarildi, maqtov" },
  { mood: "push", caption: "QANI!", emoji: "🔥", note: "turtki, harakatga chaqiriq" },
  { mood: "sad", caption: "BO'LADI!", emoji: "🤗", note: "qo'llab-quvvatlash, yomon kun" },
  { mood: "think", caption: "HMMM…", emoji: "🤔", note: "savol, tahlil" },
  { mood: "idle", caption: null, emoji: "😎", note: "avatar (fon uchun ham ishlatiladi)" },
];

/* --------------------------------------------------------- vektor zaxirasi */

let rendererPromise = null;

/** `MotivatorArt.tsx` ni Node da render qilish (faqat foto yo'q bo'lsa chaqiriladi). */
function loadRenderer() {
  if (rendererPromise) return rendererPromise;

  rendererPromise = (async () => {
    // Bundle loyiha ichida turadi — react/react-dom tashqarida qoladi va Node
    // ularni loyihaning node_modules idan oladi (CJS ni ESM ga bundle qilib
    // bo'lmaydi: "Dynamic require of stream is not supported").
    const dir = join(ROOT, "node_modules/.cache/coach-art");
    await mkdir(dir, { recursive: true });
    const entry = join(dir, "entry.jsx");
    const outfile = join(dir, "art.mjs");

    await writeFile(
      entry,
      [
        `import { createElement } from "react";`,
        `import ReactDOMServer from "react-dom/server";`,
        `import MotivatorArt from ${JSON.stringify(ART)};`,
        `export const render = (props) =>`,
        `  ReactDOMServer.renderToStaticMarkup(createElement(MotivatorArt, props));`,
      ].join("\n"),
      "utf8",
    );

    await build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      jsx: "automatic",
      loader: { ".tsx": "tsx" },
      absWorkingDir: ROOT,
      nodePaths: [join(ROOT, "node_modules")],
      external: ["react", "react-dom", "react-dom/server"],
      logLevel: "warning",
    });

    const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
    return { render: mod.render, cleanup: () => rm(dir, { recursive: true, force: true }) };
  })();

  return rendererPromise;
}

/** React SVG markup → mustaqil, o'lchami belgilangan SVG fayl. */
function toStandaloneSvg(markup) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup.replace(
    "<svg ",
    '<svg width="512" height="512" ',
  )}\n`;
}

/* -------------------------------------------------------------- yordamchi */

/** Ikkala papkaga ham yozamiz: frontend public va (bo'lsa) backend assets. */
async function writeOut(name, data, alsoBackend = true) {
  await writeFile(join(OUT_DIR, name), data);
  if (alsoBackend && existsSync(dirname(dirname(BACKEND_DIR)))) {
    await mkdir(BACKEND_DIR, { recursive: true });
    await writeFile(join(BACKEND_DIR, name), data);
  }
}

const kb = (buffer) => `${(buffer.length / 1024).toFixed(0)} KB`;

/* ------------------------------------------------------------ foto varianti */

async function buildFromPhoto(photoPath, caption) {
  const person = await cutout(photoPath);

  // --- stiker: 512×512 shaffof, oq kontur, pastda yozuv
  const fitted = await fitSquare(person.buffer, STICKER_SIZE, {
    margin: 0.045,
    bottom: caption ? Math.round(STICKER_SIZE * 0.13) : 0,
  });
  const outline = await whiteOutline(fitted, STICKER_SIZE, 10);
  const layers = [{ input: fitted }];
  if (caption) layers.push({ input: captionSvg(STICKER_SIZE, caption) });

  const png = await sharp(outline).composite(layers).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(outline).composite(layers).webp({ quality: 92 }).toBuffer();

  // --- bot kartochkasi: gradient fon + qahramon + yozuv
  const card = await cardImage(person.buffer, CARD_SIZE, caption);

  // --- ilovadagi dumaloq avatar: bosh + yelka, yozuvsiz va kontursiz
  const avatar = await headCrop(person.buffer, AVATAR_SIZE);
  // --- ilovadagi katta joylar (hero, paywall): to'liq gavda, yozuvsiz
  const full = await sharp(await fitSquare(person.buffer, STICKER_SIZE, { margin: 0.02 }))
    .webp({ quality: 88, alphaQuality: 90 })
    .toBuffer();

  return { png, webp, card, avatar, full };
}

/* ---------------------------------------------------------- vektor varianti */

async function buildFromVector(mood, caption) {
  const { render } = await loadRenderer();

  const svg = toStandaloneSvg(
    render({
      mood,
      caption: caption ?? undefined,
      sticker: true,
      background: false,
      animated: false,
      idPrefix: `st-${mood}`,
    }),
  );
  const png = await sharp(Buffer.from(svg), { density: 144 })
    .resize(STICKER_SIZE, STICKER_SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const webp = await sharp(png).webp({ quality: 92 }).toBuffer();

  // Bot kartochkasi: o'sha chizma, faqat fon bilan va yozuv ustida.
  const cardSvg = toStandaloneSvg(
    render({
      mood,
      caption: caption ?? undefined,
      sticker: false,
      background: true,
      animated: false,
      idPrefix: `card-${mood}`,
    }),
  );
  const card = await sharp(Buffer.from(cardSvg), { density: 144 })
    .resize(CARD_SIZE, CARD_SIZE)
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { png, webp, card, svg };
}

/* -------------------------------------------------------------------- main */

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = [];
  let usedPhotos = 0;

  for (const { mood, caption, emoji, note } of STICKERS) {
    const photoPath = join(SOURCE_DIR, `motivator-${mood}.jpg`);
    const hasPhoto = existsSync(photoPath);

    const result = hasPhoto
      ? await buildFromPhoto(photoPath, caption)
      : await buildFromVector(mood, caption);

    if (hasPhoto) usedPhotos += 1;
    if (result.svg) await writeOut(`motivator-${mood}.svg`, Buffer.from(result.svg, "utf8"), false);

    // Stiker fayllari faqat frontendda — botga kerak bo'lgani kartochka.
    await writeOut(`motivator-${mood}.png`, result.png, false);
    await writeOut(`motivator-${mood}.webp`, result.webp, false);
    await writeOut(`motivator-${mood}-card.png`, result.card);
    if (result.avatar) {
      await writeOut(`motivator-${mood}-avatar.webp`, result.avatar, false);
      await writeOut(`motivator-${mood}-full.webp`, result.full, false);
    }

    if (result.png.length > 500 * 1024) {
      console.warn(`   ⚠️  ${mood}.png 500 KB dan katta — stikerga .webp ni yuklang`);
    }

    manifest.push({
      mood,
      emoji,
      caption,
      note,
      source: hasPhoto ? "photo" : "vector",
      png: `motivator-${mood}.png`,
      webp: `motivator-${mood}.webp`,
      card: `motivator-${mood}-card.png`,
      avatar: result.avatar ? `motivator-${mood}-avatar.webp` : null,
      full: result.full ? `motivator-${mood}-full.webp` : null,
      png_bytes: result.png.length,
      card_bytes: result.card.length,
    });

    console.log(
      `✅ ${mood.padEnd(6)} ${emoji}  ${hasPhoto ? "foto  " : "vektor"} · ` +
        `PNG ${kb(result.png)} · karta ${kb(result.card)}` +
        `${result.avatar ? ` · avatar ${kb(result.avatar)}` : ""} — ${note}`,
    );
  }

  // --- fonli portret: ilovadagi katta joylar va OG rasm uchun
  const avatarSource = join(SOURCE_DIR, "motivator-win.jpg");
  if (existsSync(avatarSource)) {
    const person = await cutout(avatarSource);
    const fitted = await fitSquare(person.buffer, STICKER_SIZE, { margin: 0.03 });
    const avatar = await sharp(backgroundSvg(STICKER_SIZE))
      .composite([{ input: fitted }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeOut("motivator-avatar.png", avatar, false);
    console.log(`✅ motivator-avatar.png — fonli portret (${kb(avatar)})`);
  } else {
    const { render } = await loadRenderer();
    const avatarSvg = toStandaloneSvg(
      render({ mood: "win", sticker: false, background: true, animated: false, idPrefix: "av" }),
    );
    await writeOut("motivator-avatar.svg", Buffer.from(avatarSvg, "utf8"), false);
    await writeOut(
      "motivator-avatar.png",
      await sharp(Buffer.from(avatarSvg), { density: 144 })
        .resize(STICKER_SIZE, STICKER_SIZE)
        .png({ compressionLevel: 9 })
        .toBuffer(),
      false,
    );
    console.log("✅ motivator-avatar.png — fonli avatar (vektor)");
  }

  await writeOut(
    "stickers.json",
    Buffer.from(JSON.stringify({ pack: "Motivator Murabbiy", stickers: manifest }, null, 2), "utf8"),
  );

  if (rendererPromise) (await rendererPromise).cleanup();

  console.log(`\n🎉 Tayyor: ${OUT_DIR}  (${usedPhotos}/${STICKERS.length} kadr — foto)`);
  if (existsSync(BACKEND_DIR)) console.log(`   nusxa: ${BACKEND_DIR} (bot shu yerdan yuboradi)`);
  if (usedPhotos < STICKERS.length) {
    console.log("   Foto kadrlar yo'q joylar vektor chizmadan olindi — `yarn coach:art`.");
  }
  console.log("Stikerlar uchun: @Stickers botida /newpack → PNG (yoki WEBP) larni yuboring.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

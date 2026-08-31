/**
 * Motivator Murabbiy stikerlari va GIF lari — ilovadagi bir xil chizmadan.
 *
 * `src/components/coach/MotivatorArt.tsx` server-side render qilinadi (esbuild
 * bilan bundle → react-dom/server), keyin sharp orqali rasterlanadi:
 *
 *   • `motivator-<mood>.png`  — 512×512, shaffof fon, oq kontur → Telegram stikeri;
 *   • `motivator-<mood>.gif`  — 320×320 jonli reaksiya (bot `send_animation` bilan
 *     yuboradi va murabbiy matnini GIF tagiga sarlavha qilib qo'yadi);
 *   • `motivator-avatar.png`  — fonli avatar (OG rasm, ikonka uchun).
 *
 *   yarn stickers
 *
 * Natija ikki joyga yoziladi: frontend `public/coach/` (Telegramga yuklash va URL
 * orqali berish uchun) hamda backend `assets/coach/` (bot faylni to'g'ridan-to'g'ri
 * yuborishi uchun) — backend repo yonma-yon turgan bo'lsa.
 */

import { build } from "esbuild";
import { mkdir, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ART = join(ROOT, "src/components/coach/MotivatorArt.tsx");
const OUT_DIR = join(ROOT, "public/coach");
// Bot fayldan yuborishi uchun backendga ham nusxa (yonma-yon turgan repo).
const BACKEND_DIR = join(ROOT, "../kalloriya-hisoblagich-backend/assets/coach");

/** GIF: nechta kadr va kadr davomiyligi (ms). 14 × 90ms ≈ 1.3 sekundlik tsikl. */
const GIF_FRAMES = 14;
const GIF_DELAY = 90;
const GIF_SIZE = 320;

/** Har bir reaksiya: kayfiyat + ustidagi matn + Telegramdagi emoji. */
const STICKERS = [
  { mood: "hello", caption: "SALOM!", emoji: "👋", note: "tanishuv, suhbat boshlanishi" },
  { mood: "win", caption: "ZO'R!", emoji: "💪", note: "maqsad bajarildi, maqtov" },
  { mood: "push", caption: "QANI!", emoji: "🔥", note: "turtki, harakatga chaqiriq" },
  { mood: "sad", caption: "BO'LADI!", emoji: "🤗", note: "qo'llab-quvvatlash, yomon kun" },
  { mood: "think", caption: "HMMM…", emoji: "🤔", note: "savol, tahlil" },
  { mood: "idle", caption: null, emoji: "😎", note: "avatar (fon uchun ham ishlatiladi)" },
];

async function loadRenderer() {
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
    // Entry vaqtinchalik papkada — react ni loyihaning node_modules idan qidiramiz.
    nodePaths: [join(ROOT, "node_modules")],
    external: ["react", "react-dom", "react-dom/server"],
    logLevel: "warning",
  });

  const mod = await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
  return { render: mod.render, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

/** React SVG markup → mustaqil, o'lchami belgilangan SVG fayl. */
function toStandaloneSvg(markup) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup.replace(
    "<svg ",
    '<svg width="512" height="512" ',
  )}\n`;
}

/** Ikkala papkaga ham yozamiz: frontend public va (bo'lsa) backend assets. */
async function writeOut(name, data, alsoBackend = true) {
  await writeFile(join(OUT_DIR, name), data);
  if (alsoBackend && existsSync(dirname(dirname(BACKEND_DIR)))) {
    await mkdir(BACKEND_DIR, { recursive: true });
    await writeFile(join(BACKEND_DIR, name), data);
  }
}

async function main() {
  const { render, cleanup } = await loadRenderer();
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];

  for (const { mood, caption, emoji, note } of STICKERS) {
    // --- stiker: shaffof fon + oq kontur
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
    await writeOut(`motivator-${mood}.svg`, Buffer.from(svg, "utf8"), false);

    const png = await sharp(Buffer.from(svg), { density: 144 })
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeOut(`motivator-${mood}.png`, png);

    // --- GIF: fonli va jonli (nafas, bosh tebranishi, uchqun pulsi).
    // Telegram GIF ni MP4 ga aylantiradi — shuning uchun fon to'liq bo'yalgan.
    const frames = [];
    for (let i = 0; i < GIF_FRAMES; i += 1) {
      const frameSvg = toStandaloneSvg(
        render({
          mood,
          caption: caption ?? undefined,
          sticker: false,
          background: true,
          animated: false,
          phase: i / GIF_FRAMES,
          idPrefix: `gif-${mood}`,
        }),
      );
      frames.push(
        await sharp(Buffer.from(frameSvg), { density: 110 }).resize(GIF_SIZE, GIF_SIZE).png().toBuffer(),
      );
    }
    const gif = await sharp(frames, { join: { animated: true } })
      .gif({ delay: GIF_DELAY, loop: 0 })
      .toBuffer();
    await writeOut(`motivator-${mood}.gif`, gif);

    manifest.push({
      mood,
      emoji,
      caption,
      note,
      png: `motivator-${mood}.png`,
      gif: `motivator-${mood}.gif`,
      png_bytes: png.length,
      gif_bytes: gif.length,
    });
    console.log(
      `✅ ${mood.padEnd(6)} ${emoji}  PNG ${(png.length / 1024).toFixed(0)} KB · ` +
        `GIF ${(gif.length / 1024).toFixed(0)} KB — ${note}`,
    );
  }

  // Ilovadagi avatar uchun fonli variant (OG rasm, ikonka)
  const avatar = toStandaloneSvg(
    render({ mood: "win", sticker: false, background: true, animated: false, idPrefix: "av" }),
  );
  await writeOut("motivator-avatar.svg", Buffer.from(avatar, "utf8"), false);
  await writeOut(
    "motivator-avatar.png",
    await sharp(Buffer.from(avatar), { density: 144 })
      .resize(512, 512)
      .png({ compressionLevel: 9 })
      .toBuffer(),
    false,
  );
  console.log("✅ motivator-avatar.png — fonli avatar");

  await writeOut(
    "stickers.json",
    Buffer.from(JSON.stringify({ pack: "Motivator Murabbiy", stickers: manifest }, null, 2), "utf8"),
  );

  await cleanup();
  console.log(`\n🎉 Tayyor: ${OUT_DIR}`);
  if (existsSync(BACKEND_DIR)) console.log(`   nusxa: ${BACKEND_DIR} (bot shu yerdan yuboradi)`);
  console.log("Stikerlar uchun keyingi qadam: @Stickers botida /newpack → PNG larni yuboring.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

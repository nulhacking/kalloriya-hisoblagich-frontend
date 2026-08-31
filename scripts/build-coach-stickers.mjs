/**
 * Motivator Murabbiy stikerlari — ilovadagi bir xil chizmadan.
 *
 * `src/components/coach/MotivatorArt.tsx` server-side render qilinadi (esbuild
 * bilan bundle → react-dom/server), keyin sharp orqali 512×512 PNG ga
 * o'giriladi — Telegram stiker talabi (bir tomoni aniq 512px, shaffof fon).
 *
 *   yarn stickers          → public/coach/*.svg + *.png + stickers.json
 *
 * Keyin: Telegramda @Stickers botiga /newpack → PNG larni yuborib emoji beriladi.
 * Tayyor stikerni botga yuborsangiz (ADMIN_USER_IDS da bo'lsangiz) bot file_id
 * qaytaradi — o'shani backend .env dagi COACH_STICKERS_JSON ga yozasiz.
 */

import { build } from "esbuild";
import { mkdir, rm, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ART = join(ROOT, "src/components/coach/MotivatorArt.tsx");
const OUT_DIR = join(ROOT, "public/coach");

/** Har bir stiker: kayfiyat + ustidagi matn + Telegramdagi emoji. */
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

  const mod = await import(pathToFileURL(outfile).href);
  return { render: mod.render, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

/** React SVG markup → mustaqil, o'lchami belgilangan SVG fayl. */
function toStandaloneSvg(markup) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup.replace(
    "<svg ",
    '<svg width="512" height="512" ',
  )}\n`;
}

async function main() {
  const { render, cleanup } = await loadRenderer();
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = [];

  for (const { mood, caption, emoji, note } of STICKERS) {
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
    const svgName = `motivator-${mood}.svg`;
    const pngName = `motivator-${mood}.png`;
    await writeFile(join(OUT_DIR, svgName), svg, "utf8");

    const png = await sharp(Buffer.from(svg), { density: 144 })
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(join(OUT_DIR, pngName), png);

    manifest.push({ mood, emoji, caption, note, png: pngName, svg: svgName, bytes: png.length });
    console.log(
      `✅ ${pngName}  ${emoji}  ${(png.length / 1024).toFixed(0)} KB — ${note}`,
    );
  }

  // Ilovadagi avatar uchun fonli variant (PWA/OG rasmlarda ham ishlatsa bo'ladi)
  const avatar = toStandaloneSvg(
    render({ mood: "win", sticker: false, background: true, animated: false, idPrefix: "av" }),
  );
  await writeFile(join(OUT_DIR, "motivator-avatar.svg"), avatar, "utf8");
  await sharp(Buffer.from(avatar), { density: 144 })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT_DIR, "motivator-avatar.png"));
  console.log("✅ motivator-avatar.png — fonli avatar");

  await writeFile(
    join(OUT_DIR, "stickers.json"),
    JSON.stringify({ pack: "Motivator Murabbiy", stickers: manifest }, null, 2),
    "utf8",
  );

  await cleanup();
  console.log(`\n🎉 Tayyor: ${OUT_DIR}`);
  console.log("Keyingi qadam: @Stickers botida /newpack → PNG larni yuboring.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

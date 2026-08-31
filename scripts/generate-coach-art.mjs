/**
 * Motivator Murabbiyning fotorealistik (stilize 3D) kadrlarini Gemini orqali yaratish.
 *
 *   node scripts/generate-coach-art.mjs            # yo'q kadrlarni yaratadi
 *   node scripts/generate-coach-art.mjs --force    # hammasini qaytadan
 *   node scripts/generate-coach-art.mjs win sad    # faqat shu kayfiyatlarni
 *
 * Ishlash tartibi:
 *   1. ETALON kadr (`motivator-base.jpg`) — qahramonning asosiy ko'rinishi;
 *   2. har bir kayfiyat SHU ETALON rasm bilan birga so'raladi ("same character,
 *      same face, only the pose changes") — aks holda har kadrda boshqa odam chiqadi;
 *   3. hamma kadr tekis xrom-yashil fonda — `build-coach-stickers.mjs` fonni
 *      kesib, stiker (shaffof PNG) va bot kartochkasi (o'z gradient fonimiz) yasaydi.
 *
 * Kalit: `GEMINI_API_KEY` env yoki backend `.env` faylidan o'qiladi.
 * Kadrlar `public/coach/source/` da saqlanadi va qayta ishga tushirilganda
 * qayta yaratilmaydi (pul bejiz sarflanmasin).
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// Manba kadrlar `public` dan tashqarida — deployga chiqmaydi, faqat qayta
// generatsiya uchun kerak.
const SOURCE_DIR = join(ROOT, "assets/coach-source");
const BACKEND_ENV = join(ROOT, "../kalloriya-hisoblagich-backend/.env");

const MODEL = process.env.COACH_IMAGE_MODEL || "gemini-3-pro-image";
const API = "https://generativelanguage.googleapis.com/v1beta/models";

/** Hamma kadrda bir xil bo'lishi kerak bo'lgan qism — qahramon pasporti. */
const CHARACTER =
  "a cheerful, extremely fit Uzbek male fitness coach in his mid-20s, athletic " +
  "bodybuilder physique, warm tan skin, short black hair under a bright red sport " +
  "headband tied at the left side with two short tails, wearing a plain red athletic " +
  "tank top, clean-shaven with a friendly face";

const STYLE =
  "Stylized 3D character render for a mobile game card, Pixar-quality lighting with " +
  "realistic muscle and skin detail, high detail skin texture and fabric weave, crisp " +
  "focus, dramatic warm cinematic lighting with an orange rim light on the shoulders. " +
  "Upper body from the waist up, facing the viewer, centered with small even margins on " +
  "all sides, the whole head and both arms fully inside the frame, nothing cropped. " +
  "Isolated on a completely flat pure chroma green background, color #00B140, no gradient, " +
  "no shadow on the background, no props, no text. Square 1:1 composition.";

/** Kayfiyatlar — `MotivatorArt.tsx` va `coach/mood.py` dagi nomlar bilan bir xil. */
const MOODS = [
  {
    id: "idle",
    pose:
      "standing calmly with both arms crossed over his chest, relaxed confident closed-mouth " +
      "smile, chin slightly up",
  },
  {
    id: "hello",
    pose:
      "waving hello with his right hand raised high next to his head, open palm facing the " +
      "viewer, big warm welcoming open smile, other hand on his hip",
  },
  {
    id: "win",
    pose:
      "triumphant double biceps flex with both arms raised and bent, both fists clenched beside " +
      "his head, eyes squeezed shut, laughing with a huge joyful open smile",
  },
  {
    id: "push",
    pose:
      "one fist punched high up in the air, the other arm flexing, mouth open shouting " +
      "encouragement, fired-up determined expression with strong eyebrows",
  },
  {
    id: "sad",
    pose:
      "a gentle, empathetic, supportive expression with a soft closed-mouth smile, head tilted " +
      "slightly, one open hand placed on his own chest, calm and reassuring, not sad himself",
  },
  {
    id: "think",
    pose:
      "thoughtful expression, one hand on his chin, one eyebrow raised, eyes looking slightly " +
      "up and to the side, mouth closed in a small curious smile",
  },
];

async function apiKey() {
  const fromEnv = (process.env.GEMINI_API_KEY || "").trim();
  if (fromEnv) return fromEnv;
  if (existsSync(BACKEND_ENV)) {
    const match = (await readFile(BACKEND_ENV, "utf8")).match(/GEMINI_API_KEY\s*=\s*(\S+)/);
    if (match) return match[1].trim();
  }
  throw new Error("GEMINI_API_KEY topilmadi (env yoki backend .env)");
}

/** Bitta so'rov: matn + (ixtiyoriy) etalon rasm → rasm baytlari. */
async function generate(key, prompt, referenceImage) {
  const parts = [];
  if (referenceImage) {
    parts.push({
      inline_data: { mime_type: "image/jpeg", data: referenceImage.toString("base64") },
    });
  }
  parts.push({ text: prompt });

  const response = await fetch(`${API}/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "1:1" },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const image = candidate?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  if (!image) {
    const text = candidate?.content?.parts?.map((p) => p.text).join(" ") || "";
    throw new Error(`Rasm qaytmadi. ${text.slice(0, 200) || JSON.stringify(data).slice(0, 200)}`);
  }
  return Buffer.from((image.inlineData || image.inline_data).data, "base64");
}

/** Xato bo'lsa bir necha marta urinib ko'ramiz (model ba'zan matn qaytaradi). */
async function withRetry(label, fn, attempts = 3) {
  let lastError;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`   ⚠️  ${label} (${i}/${attempts}): ${error.message}`);
      if (i < attempts) await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  throw lastError;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = args.filter((a) => !a.startsWith("--"));

  const key = await apiKey();
  await mkdir(SOURCE_DIR, { recursive: true });

  // --- 1. Etalon kadr
  const basePath = join(SOURCE_DIR, "motivator-base.jpg");
  let base;
  if (existsSync(basePath) && !force) {
    base = await readFile(basePath);
    console.log("↩️  Etalon kadr mavjud — qayta yaratilmadi");
  } else {
    console.log(`🎨 Etalon kadr yaratilmoqda (${MODEL})…`);
    base = await withRetry("etalon", () =>
      generate(
        key,
        `${STYLE}\n\nSubject: ${CHARACTER}, flexing his right bicep toward the camera with a big confident smile.`,
      ),
    );
    await writeFile(basePath, base);
    console.log(`✅ motivator-base.jpg (${(base.length / 1024).toFixed(0)} KB)`);
  }

  // --- 2. Kayfiyatlar — etalonga qarab
  for (const mood of MOODS) {
    if (only.length && !only.includes(mood.id)) continue;
    const out = join(SOURCE_DIR, `motivator-${mood.id}.jpg`);
    if (existsSync(out) && !force) {
      console.log(`↩️  ${mood.id} mavjud — o'tkazib yuborildi`);
      continue;
    }

    const prompt =
      "Use the attached image as the exact character reference. Keep the SAME person: " +
      "same face, same hairstyle, same red headband, same red tank top, same body type, " +
      "same lighting and the same flat chroma green background (#00B140). " +
      `Change ONLY the pose and facial expression: ${mood.pose}.\n\n${STYLE}`;

    console.log(`🎨 ${mood.id} yaratilmoqda…`);
    const image = await withRetry(mood.id, () => generate(key, prompt, base));
    await writeFile(out, image);
    console.log(`✅ motivator-${mood.id}.jpg (${(image.length / 1024).toFixed(0)} KB)`);
  }

  console.log(`\n🎉 Kadrlar: ${SOURCE_DIR}`);
  console.log("Keyingi qadam: yarn stickers — stiker PNG, bot kartochkasi va backend nusxasi.");
}

main().catch((error) => {
  console.error("❌", error.message);
  process.exit(1);
});

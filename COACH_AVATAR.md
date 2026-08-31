# Motivator Murabbiy — avatar va stikerlar

Afishadagi 1-raqamli qahramon endi ilovada ham, Telegram botda ham bir xil
ko'rinadi. Chizma **bitta manbadan** keladi — `src/components/coach/MotivatorArt.tsx`
(sof SVG, tashqi rasmsiz), stiker PNG lari o'sha komponentdan generatsiya qilinadi.

```
MotivatorArt.tsx  ─┬─► CoachAvatar.tsx ──► ilova (chat, kartalar, paywall)
                   └─► scripts/build-coach-stickers.mjs ─┬─► *.png  → Telegram stikeri
                                                         └─► *.gif  → bot javobi (matn GIF tagida)
```

Chizma hajmli ko'rinadi: barcha teri/mato shakllari bitta yo'nalishdagi gradient
bilan bo'yaladi (yorug'lik chapdan-yuqoridan), ustidan yumshoq soya qatlami
(bo'yin osti, qo'l tutashgan joy, mato burmalari), eng ustida yaltiroq nuqtalar
va o'ng qirrada issiq rim-light. Har a'zo ikki qatlamda — kontur va rang.

## Kayfiyatlar (mood)

| mood | Poza | Yuz | Effekt | Qayerda |
|---|---|---|---|---|
| `idle` | qo'llar ko'krakda | xotirjam tabassum | — | avatar, kartalar |
| `hello` | qo'l silkitadi | keng tabassum | sariq yoy | suhbat boshlanishi |
| `win` | ikki tomonlama biceps | ko'zlar yumilgan | uchqunlar | maqtov, g'alaba |
| `push` | musht tepada | qat'iy qosh | olov | turtki (default) |
| `sad` | qo'l ko'krakda | yumshoq, tushgan qosh | yurak | qo'llab-quvvatlash |
| `think` | kaft iyakda | tepaga qaraydi | fikr pufakchalari | javob yozilayotgan payt |

Kayfiyat backenddan keladi (`CoachChatResponse.mood`, `coach/mood.py`), eski
tarix uchun `src/utils/coachMood.ts` matndan taxmin qiladi.

## Ilovada qayerda ko'rinadi

| Joy | Fayl | Kayfiyat |
|---|---|---|
| Bo'lim sarlavhasi (hero) | `CoachAssistant.tsx` | `win`, doim jonli |
| Murabbiy tanlash kartasi | `CoachPersonaPicker.tsx` | tanlansa `win`, aks holda `idle` |
| Suhbat sarlavhasi | `CoachChat.tsx` | oxirgi javob ohangi (yozayotganda `think`) |
| "Yozyapti…" pufakchasi | `CoachChat.tsx` | `think` |
| Har bir javob avatari | `CoachChat.tsx` | o'sha javob ohangi |
| Katta reaksiya (stiker) | `CoachChat.tsx` | faqat `win` / `sad` — yangi javob ustida |
| Bo'sh suhbat ekrani | `CoachChat.tsx` | `hello` |
| Pro Plus taklifi | `ProPlusPaywall.tsx` | `push` |

Animatsiyalar `src/index.css` da (`coach-art-*`): nafas olish, bosh tebranishi,
bandana uchlari, qo'l silkitish, musht, uchqunlar. `prefers-reduced-motion`
yoqilgan qurilmada hammasi o'chadi.

## Stikerlarni va GIF larni yangilash

```bash
yarn stickers
```

Natija ikki joyga yoziladi: `public/coach/` (Telegramga yuklash va URL orqali
berish uchun) hamda backend `assets/coach/` (bot faylni to'g'ridan-to'g'ri
yuborishi uchun — repo yonma-yon tursa avtomatik nusxalanadi).

`public/coach/`:

| Fayl | Emoji | Yozuv | Qachon yuboriladi |
|---|---|---|---|
| `motivator-hello.png` | 👋 | SALOM! | murabbiy tanlanganda |
| `motivator-win.png` | 💪 | ZO'R! | foydalanuvchi maqsadni bajarganda |
| `motivator-push.png` | 🔥 | QANI! | kechki check-in, turtki |
| `motivator-sad.png` | 🤗 | BO'LADI! | "charchadim", "motivatsiyam yo'q" |
| `motivator-think.png` | 🤔 | HMMM… | tahlil, savol |
| `motivator-idle.png` | 😎 | — | zaxira avatar |

Har biri 512×512 PNG, shaffof fon, oq kontur — Telegram stiker talabiga mos
(~100–135 KB, limit 512 KB). Yonida bir xil nomdagi **GIF** (320×320, 14 kadr,
~1.3 s tsikl — nafas, bosh tebranishi, uchqun pulsi), `.svg` va `stickers.json`
ham chiqadi.

GIF ni bot `send_animation` bilan yuboradi va **matnni GIF tagiga sarlavha**
qilib yozadi (kadrma-kadr ochiladi). Telegram GIF ni MP4 ga aylantirgani uchun
GIF kadrlari shaffof emas — fon to'liq bo'yalgan.

Kadrlarni ko'paytirish/tezlashtirish: skriptdagi `GIF_FRAMES`, `GIF_DELAY`,
`GIF_SIZE`. Harakatning o'zi `MotivatorArt` ning `phase` (0→1) propidan keladi —
CSS animatsiyasi server-side render da ishlamaydi.

**Telegramga yuklash:** @Stickers → `/newpack` → nom → PNG larni **fayl emas,
rasm** sifatida yuborib har biriga emoji berasiz → `/publish`.

**GIF uchun hech narsa sozlash shart emas** — bot `assets/coach/` dagi fayldan
yuboradi va Telegram qaytargan `file_id` ni eslab qoladi. Backendda fayl
saqlanmaydigan bo'lsa, `.env` da `COACH_MEDIA_BASE_URL=https://<domen>/coach`
qo'ying — Telegram GIF ni shu URL dan oladi.

**file_id ni olish (stikerlar uchun):** `.env` dagi `ADMIN_USER_IDS` ga telegram_id ingizni qo'shing,
tayyor stikerni botga yuboring — bot `file_id` ni qaytaradi. Ularni backend
`.env` da `COACH_STICKERS_JSON` ga yozasiz (`AI_COACH.md`).

Stiker sozlanmasa bot xato bermaydi — shunchaki stikersiz, matn va reaksiya
bilan ishlayveradi.

## Yangi murabbiyni chizish

1. `MotivatorArt.tsx` uslubida yangi komponent (`IntizomliArt.tsx`) yozing;
2. `CoachAvatar.tsx` dagi `HAS_ART` ga id sini qo'shing va shu komponentga ulang;
3. `scripts/build-coach-stickers.mjs` da `ART` ro'yxatiga qo'shing;
4. backendda `personas.py` da `is_active=True` qiling.

Chizmani tekshirish uchun eng tez yo'l — `yarn stickers` va chiqqan PNG ga qarash:
ilovaga qo'shishdan oldin poza va yuz ifodasi shu yerda ko'rinadi.

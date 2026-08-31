# Motivator Murabbiy — avatar, stiker va GIF

Afishadagi 1-raqamli qahramon ilovada ham, Telegram botda ham bir xil ko'rinadi.
Rasmlar **Gemini** bilan yaratilgan stilize 3D kadrlar (afisha uslubi), ularning
zaxirasi esa qo'lda chizilgan vektor portret.

```
assets/coach-source/*.jpg          ← Gemini kadrlari (xrom-yashil fonda)
        │  yarn stickers
        ▼
public/coach/  ─┬─ motivator-<mood>.png / .webp   → Telegram stikeri (yozuvli, oq konturli)
                ├─ motivator-<mood>.gif           → bot javobi (matn GIF tagida)
                ├─ motivator-<mood>-avatar.webp   → ilovadagi dumaloq avatar (~10 KB)
                └─ motivator-<mood>-full.webp     → ilovadagi katta joylar (hero, paywall)
                        │
                        └─► backend assets/coach/ (bot GIF/PNG ni shu yerdan yuboradi)

MotivatorArt.tsx  ← zaxira: rasm yetib kelmasa yoki foto yo'q kayfiyatda
```

## 1. Kadrlarni yaratish (Gemini)

```bash
yarn coach:art                 # yo'q kadrlarni yaratadi
yarn coach:art --force         # hammasini qaytadan
yarn coach:art win sad         # faqat shu kayfiyatlarni
```

`GEMINI_API_KEY` env dan yoki backend `.env` dan o'qiladi. Model: `gemini-3-pro-image`
(`COACH_IMAGE_MODEL` bilan almashtirsa bo'ladi).

Ishlash tartibi muhim:

1. **Etalon kadr** (`motivator-base.jpg`) — qahramonning asosiy ko'rinishi;
2. har bir kayfiyat **o'sha etalon rasm bilan birga** so'raladi ("same person,
   same face, same clothes — change ONLY the pose"). Aks holda har kadrda boshqa
   odam chiqadi;
3. hamma kadr **tekis xrom-yashil fonda** (#00B140) — keyin fon kesiladi.

Kadr yoqmasa: o'sha faylni o'chirib `yarn coach:art <mood>` — faqat o'sha qayta
yaratiladi (pul bejiz sarflanmaydi). Qahramon tashqi ko'rinishini o'zgartirish —
skriptdagi `CHARACTER` va `STYLE` matnlari; poza va yuz ifodasi — `MOODS`.

## 2. Stiker, GIF va avatarlarni yig'ish

```bash
yarn stickers
```

Nima qiladi: yashil fonni kesadi (chekkadagi yashil surtim bostiriladi) → 512×512
stiker (oq kontur + pastda yozuv) → gradient fon ustida "nafas olayotgan" GIF →
ilovaga yengil avatar va to'liq gavda kadrlari → backendga nusxa.

| Fayl | Emoji | Yozuv | Qachon ishlatiladi |
|---|---|---|---|
| `motivator-hello.*` | 👋 | SALOM! | murabbiy tanlanganda |
| `motivator-win.*` | 💪 | ZO'R! | maqtov, ovqat yozilganda |
| `motivator-push.*` | 🔥 | QANI! | turtki, kechki check-in |
| `motivator-sad.*` | 🤗 | BO'LADI! | "charchadim", "motivatsiyam yo'q" |
| `motivator-think.*` | 🤔 | HMMM… | javob yozilayotgan payt |
| `motivator-idle.*` | 😎 | — | odatiy avatar |

O'lchamlar: stiker PNG ~250 KB (Telegram limiti 512 KB), WEBP ~35 KB, GIF ~560 KB,
avatar ~10 KB, full ~35 KB.

Foto kadr topilmasa — o'sha kayfiyat **vektor chizmadan** (`MotivatorArt.tsx`)
yig'iladi, ya'ni quvur hech qachon to'xtamaydi.

## 3. Ilovada qayerda ko'rinadi

| Joy | Fayl | Kesim | Kayfiyat |
|---|---|---|---|
| Bo'lim sarlavhasi (hero) | `CoachAssistant.tsx` | full | `win` |
| Murabbiy tanlash kartasi | `CoachPersonaPicker.tsx` | avatar | tanlansa `win`, aks holda `idle` |
| Suhbat sarlavhasi | `CoachChat.tsx` | avatar | oxirgi javob ohangi (yozayotganda `think`) |
| "Yozyapti…" pufakchasi | `CoachChat.tsx` | avatar | `think` |
| Har bir javob avatari | `CoachChat.tsx` | avatar | o'sha javob ohangi |
| Katta reaksiya | `CoachChat.tsx` | sticker | faqat `win` / `sad` — yangi javob ustida |
| Bo'sh suhbat ekrani | `CoachChat.tsx` | full | `hello` |
| Pro Plus taklifi | `ProPlusPaywall.tsx` | full | `push` |

Barchasi [CoachPhoto.tsx](src/components/coach/CoachPhoto.tsx) orqali: rasm
yuklanmasa (eski kesh, offline) darhol vektor chizmaga tushadi — avatar hech
qachon bo'sh qolmaydi. Animatsiyalar `src/index.css` da (`coach-photo-breathe`,
`coach-mood-pop`, `coach-sticker-in`); `prefers-reduced-motion` da o'chadi.

## 4. Telegram tomoni

**GIF uchun hech narsa sozlash shart emas** — bot `assets/coach/` dagi fayldan
yuboradi va Telegram qaytargan `file_id` ni eslab qoladi. Backendda fayl
saqlanmasa, `.env` da `COACH_MEDIA_BASE_URL=https://<domen>/coach` qo'ying.

**Stiker to'plami** (ixtiyoriy): @Stickers → `/newpack` → PNG (yoki yengilroq
WEBP) larni **rasm sifatida** yuborib har biriga emoji berasiz → `/publish`.
Keyin tayyor stikerni botga yuboring (`ADMIN_USER_IDS` da bo'lsangiz) — bot
`file_id` ni qaytaradi, uni `COACH_STICKERS_JSON` ga yozasiz (`AI_COACH.md`).

## 5. Yangi murabbiyni qo'shish

1. `scripts/generate-coach-art.mjs` da yangi `CHARACTER` bilan kadrlar yarating
   (fayl nomi `<persona>-<mood>.jpg`);
2. `scripts/build-coach-stickers.mjs` da persona id sini ro'yxatga qo'shing;
3. `src/components/coach/CoachPhoto.tsx` dagi `WITH_PHOTO` ga id ni qo'shing;
4. backendda `coach/personas.py` da `is_active=True`.

Tekshirishning eng tez yo'li — `yarn stickers` dan keyin chiqqan PNG/GIF ga
qarash: poza, yuz ifodasi va kesim shu yerda ko'rinadi.

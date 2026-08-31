import type { CSSProperties } from "react";

/**
 * Motivator Murabbiy — afishadagi qahramonning vektor portreti.
 *
 * Bitta manba, uchta ishlatilish joyi:
 * • ilovada — React komponenti (jonli, CSS animatsiyalari bilan);
 * • stikerda — `scripts/build-coach-stickers.mjs` shu komponentni server-side
 * render qilib 512×512 PNG chiqaradi (Telegram stiker talabi);
 *
 * Shuning uchun bu yerda hech qanday tashqi rasm, font yoki hook yo'q — faqat
 * sof SVG. Kayfiyat (`mood`) qo'l pozasini, yuz ifodasini va effektlarni
 * almashtiradi; gavda va bosh hamma kayfiyatda bir xil qoladi.
 *
 * Hajm berish uslubi (afishadagi 3D ko'rinishga yaqinlashtirish):
 * 1. barcha teri/mato shakllari BITTA yo'nalishdagi gradient bilan bo'yaladi
 * (`userSpaceOnUse` — yorug'lik chapdan-yuqoridan, hamma a'zoda bir xil);
 * 2. ustidan yumshoq soya qatlami (blur) — bo'yin ostida, qo'l gavdaga
 * tutashgan joyda, mayka burmalarida;
 * 3. eng ustida yaltiroq nuqtalar va o'ng qirradagi issiq rim-light.
 * Har bir a'zo baribir ikki qatlamda chiziladi (kontur + rang), shuning uchun
 * a'zo ichida ortiqcha chok ko'rinmaydi.
 */

export type CoachMood = "idle" | "hello" | "win" | "push" | "sad" | "think";

/* ------------------------------------------------------------------ palitra */

const OUT = "#33190f"; // umumiy kontur — iliq to'q jigarrang
const SKIN = "#f4a465"; // gradient markazi
const SKIN_DARK = "#c26e33"; // soya tomoni
const SKIN_DEEP = "#8a4514"; // eng chuqur soya (AO)
const HAIR = "#1d120c";
const MOUTH = "#6d2410";
const RIM = "#ff7a45"; // o'ng qirradagi issiq yorug'lik

const STROKE = 6; // yakka shakllar konturi
const EDGE = 14; // qo'l/gavda konturi qalinligi (ikki qatlamli chizishda)

type Layer = "outline" | "fill";

/* --------------------------------------------------------------- yordamchi */

/** Qo'l bo'g'ini (chiziq) — kontur qatlamida qalinroq, rang qatlamida gradient. */
const limb = (layer: Layer, width: number, skin: string) => ({
  fill: "none" as const,
  stroke: layer === "outline" ? OUT : skin,
  strokeWidth: layer === "outline" ? width + EDGE : width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Mushak do'ngi / musht kabi to'ldiriladigan shakl. */
const blob = (layer: Layer, skin: string) => ({
  fill: layer === "outline" ? OUT : skin,
  stroke: layer === "outline" ? OUT : "none",
  strokeWidth: layer === "outline" ? EDGE : 0,
  strokeLinejoin: "round" as const,
});

/* -------------------------------------------------------------------- yuz */

const Eyes = ({ mood }: { mood: CoachMood }) => {
  if (mood === "win") {
    // Baxtli — ko'zlar yumilgan yoy
    return (
      <g fill="none" stroke={OUT} strokeWidth={10} strokeLinecap="round">
        <path d="M210 224c7-14 23-14 30 0" />
        <path d="M272 224c7-14 23-14 30 0" />
      </g>
    );
  }

  const look = mood === "think" ? -7 : 0; // o'ylaganda yuqoriga qaraydi

  const eye = (cx: number) => (
    <g key={cx}>
      <ellipse cx={cx} cy={224} rx={18} ry={20} fill="#fdf6ef" stroke={OUT} strokeWidth={4.5} />
      {/* Yuqori qovoq soyasi — ko'z chuqurroq ko'rinsin */}
      <path d={`M${cx - 18} 220c4-15 32-15 36 0-6-9-30-9-36 0z`} fill={SKIN_DEEP} opacity={0.35} />
      {/* Rangdor qorachiq */}
      <circle cx={cx + 3} cy={226 + look} r={10} fill="#7b4a22" />
      <circle cx={cx + 3} cy={226 + look} r={9} fill="none" stroke="#42250f" strokeWidth={2.5} />
      <circle cx={cx + 3} cy={226 + look} r={5} fill="#160c06" />
      {/* Ikkita yorug' nuqta — "tirik" qarash */}
      <circle cx={cx} cy={221 + look} r={3.4} fill="#fff" />
      <circle cx={cx + 8} cy={231 + look} r={1.8} fill="#fff" opacity={0.7} />
      {/* Pastki qovoq */}
      <path
        d={`M${cx - 14} 237c8 6 22 6 30 0`}
        fill="none"
        stroke={SKIN_DARK}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* Kipriklar */}
      <path
        d={`M${cx - 17} 214c5-7 27-7 34 1`}
        fill="none"
        stroke={OUT}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <g>
      {eye(222)}
      {eye(284)}
      {mood === "sad" && (
        // Charchagan qovoq — ko'z ustidan tushadi
        <g fill={SKIN_DARK} opacity={0.9}>
          <path d="M204 220c10-11 28-11 38-3l-2-13h-34z" />
          <path d="M266 220c10-11 28-11 38-3l-2-13h-34z" />
        </g>
      )}
    </g>
  );
};

const BROWS: Record<CoachMood, [string, string]> = {
  // [chap qosh, o'ng qosh] — kayfiyatning asosiy belgisi
  idle: ["M200 194c13-9 30-10 42-4", "M270 190c12-6 29-5 42 4"],
  hello: ["M198 190c13-12 30-13 42-7", "M272 183c12-6 29-4 42 7"],
  win: ["M198 188c13-12 30-13 42-7", "M272 181c12-6 29-4 42 7"],
  push: ["M198 182c13-4 30 3 42 15", "M272 197c12-12 29-19 42-15"],
  sad: ["M200 200c13-16 30-14 41-2", "M271 198c11-12 28-14 41 2"],
  think: ["M200 196c13-10 30-12 42-6", "M270 174c12-8 29-6 42 4"],
};

const Brows = ({ mood }: { mood: CoachMood }) => {
  const [left, right] = BROWS[mood];
  return (
    <g fill="none" strokeLinecap="round">
      {/* Qosh ostidagi soya — peshona chiqib turgandek ko'rinadi */}
      <g stroke={SKIN_DEEP} strokeWidth={17} opacity={0.2} transform="translate(0 8)">
        <path d={left} />
        <path d={right} />
      </g>
      <g stroke={HAIR} strokeWidth={15}>
        <path d={left} />
        <path d={right} />
      </g>
      {/* Qosh tuklari yo'nalishi */}
      <g stroke="#4a2e1e" strokeWidth={4} opacity={0.6} transform="translate(0 -3)">
        <path d={left} />
        <path d={right} />
      </g>
    </g>
  );
};

const Mouth = ({ mood }: { mood: CoachMood }) => {
  if (mood === "sad") {
    return (
      <g>
        <path
          d="M226 272c14 12 46 12 60 0"
          fill="none"
          stroke={OUT}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d="M230 281c12 8 40 8 52 0"
          fill="none"
          stroke={SKIN_DARK}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>
    );
  }

  if (mood === "think") {
    return (
      <g>
        <path
          d="M232 278c11-9 32-9 46-2"
          fill="none"
          stroke={OUT}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d="M262 288c8 3 16 2 22-3"
          fill="none"
          stroke={SKIN_DARK}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>
    );
  }

  // Ochiq, baland ovozli tabassum — motivator uslubi
  const wide = mood === "push" || mood === "win";
  const d = wide
    ? "M212 264c15 46 73 46 88 0-25 13-63 13-88 0z"
    : "M220 266c13 34 60 34 72 0-20 10-52 10-72 0z";
  const teeth = wide
    ? "M214 266c23 11 61 11 84 0l-4-7c-25 8-51 8-76 0z"
    : "M222 268c19 8 50 8 68 0l-3-6c-21 7-41 7-62 0z";
  return (
    <g>
      <path d={d} fill={MOUTH} stroke={OUT} strokeWidth={5.5} strokeLinejoin="round" />
      {wide && <ellipse cx={256} cy={296} rx={16} ry={9} fill="#e0524a" />}
      {/* Yuqori tishlar + ular ostidagi soya */}
      <path d={teeth} fill="#fffaf3" />
      <path d={teeth} fill="none" stroke="#cbb3a1" strokeWidth={2} opacity={0.55} />
      {/* Pastki lab yaltirog'i */}
      <path
        d={wide ? "M228 300c18 10 42 10 56 0" : "M232 296c14 8 34 8 48 0"}
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.25}
      />
    </g>
  );
};

/* ------------------------------------------------------------------- bosh */

const Head = ({
  mood,
  animated,
  skin,
  hair,
  band,
  soft,
}: {
  mood: CoachMood;
  animated: boolean;
  skin: string;
  hair: string;
  band: string;
  soft: string;
}) => (
  <g className={animated ? "coach-art-head" : undefined} style={{ transformOrigin: "256px 300px" }}>
    {/* Quloqlar */}
    <g>
      <ellipse cx={180} cy={224} rx={15} ry={22} fill={skin} stroke={OUT} strokeWidth={STROKE} />
      <path d="M178 216c6-4 10 2 8 10-1 5-5 8-8 6" fill="none" stroke={SKIN_DARK} strokeWidth={4} />
      <ellipse cx={332} cy={224} rx={15} ry={22} fill={skin} stroke={OUT} strokeWidth={STROKE} />
      <path d="M334 216c-6-4-10 2-8 10 1 5 5 8 8 6" fill="none" stroke={SKIN_DARK} strokeWidth={4} />
    </g>

    {/* Yuz */}
    <path
      d="M256 118c44 0 78 30 78 84 0 66-34 106-78 106s-78-40-78-106c0-54 34-84 78-84z"
      fill={skin}
      stroke={OUT}
      strokeWidth={STROKE}
    />

    {/* Yumshoq soyalar: o'ng chakka va jag' */}
    <g filter={soft} opacity={0.72}>
      <path
        d="M300 150c22 26 30 62 26 96-4 34-20 62-46 76 34-6 54-46 56-92 2-38-14-68-36-80z"
        fill={SKIN_DEEP}
        opacity={0.55}
      />
      <path d="M196 246c12 46 34 70 60 70s48-24 60-70c-16 40-36 56-60 56s-44-16-60-56z" fill={SKIN_DEEP} />
    </g>

    {/* Peshona va yonoq suyagidagi yorug'lik (kamdan-kam, aks holda rang oqaradi) */}
    <g fill="#ffe3c4" filter={soft}>
      <ellipse cx={224} cy={190} rx={26} ry={13} opacity={0.3} transform="rotate(-12 224 190)" />
      <ellipse cx={256} cy={304} rx={16} ry={7} opacity={0.14} />
    </g>

    {/* Burun */}
    <g>
      <path d="M254 226c-7 16-10 24 3 28" fill="none" stroke={OUT} strokeWidth={5.5} strokeLinecap="round" />
      <path d="M252 230c-4 12-6 18 2 21" fill="none" stroke="#fff" strokeWidth={3} opacity={0.3} />
      <ellipse cx={247} cy={257} rx={4} ry={3} fill={SKIN_DEEP} opacity={0.55} />
      <ellipse cx={268} cy={257} rx={4} ry={3} fill={SKIN_DEEP} opacity={0.45} />
    </g>

    {/* Yonoq qizilligi */}
    <g filter={soft}>
      <ellipse cx={202} cy={258} rx={20} ry={11} fill="#e2603f" opacity={0.35} />
      <ellipse cx={310} cy={258} rx={20} ry={11} fill="#e2603f" opacity={0.28} />
    </g>

    {/* Soch — bandana ustidagi qism (notekis soch chizig'i) */}
    <path
      d="M178 172c0-44 33-70 78-70s78 26 78 70c-9-15-22-25-37-31 5-7 7-14 4-20-11 13-26 19-43 19-23 0-42-8-55-23-3 11 0 20 7 26-16 7-27 16-32 29z"
      fill={hair}
      stroke={OUT}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    {/* Soch tolalari */}
    <g fill="none" stroke="#5a3a26" strokeWidth={5} strokeLinecap="round" opacity={0.45}>
      <path d="M206 142c12-15 30-24 49-25" />
      <path d="M224 124c14-8 30-11 44-10" />
      <path d="M296 132c12 6 22 16 28 28" />
    </g>
    {/* Chakkadagi soch */}
    <path d="M182 186c-2 16 0 28 4 38 8-14 10-28 8-42z" fill={hair} stroke={OUT} strokeWidth={4.5} />
    <path d="M330 186c2 16 0 28-4 38-8-14-10-28-8-42z" fill={hair} stroke={OUT} strokeWidth={4.5} />

    {/* Bandana */}
    <path
      d="M178 168c22-22 134-22 156 0l-4 30c-24-19-124-19-148 0z"
      fill={band}
      stroke={OUT}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <g fill="none" opacity={0.5}>
      <path d="M186 175c22-12 118-12 140 0" stroke="#ffb4a8" strokeWidth={4} strokeDasharray="10 8" />
      <path d="M184 192c24-14 120-14 144 0" stroke="#7f1010" strokeWidth={5} />
    </g>
    {/* Bandana ostidagi soya — peshonaga tushadi */}
    <path d="M182 198c24-18 124-18 148 0l2 12c-26-16-126-16-152 0z" fill={SKIN_DEEP} opacity={0.28} />

    {/* Bandana uchlari — chapga uchib turadi */}
    <g className={animated ? "coach-art-tail" : undefined} style={{ transformOrigin: "180px 184px" }}>
      <path
        d="M184 176c-26 2-48 16-62 38 20-10 34-13 50-11z"
        fill={band}
        stroke={OUT}
        strokeWidth={5.5}
        strokeLinejoin="round"
      />
      <path
        d="M184 194c-22 12-35 32-39 56 15-18 28-27 43-29z"
        fill="#a91717"
        stroke={OUT}
        strokeWidth={5.5}
        strokeLinejoin="round"
      />
    </g>

    <Brows mood={mood} />
    <Eyes mood={mood} />
    <Mouth mood={mood} />
  </g>
);

/* ------------------------------------------------------------------ gavda */

// Gavda geometriyasi: yelka kengligi boshning ~2.2 barobari — sportchi nisbati.
const NECK = "M222 288h68v40c0 24-68 24-68 0z";
const BODY =
  "M256 306c44 0 70 8 90 20 32 18 54 46 66 78 12 32 18 62 20 96H80c2-34 8-64 20-96 12-32 34-60 66-78 20-12 46-20 90-20z";
const TANK_SHAPE =
  "M206 330c12 30 30 48 50 48s38-18 50-48c34 12 62 30 80 54 18 28 26 68 28 116H98c2-48 10-88 28-116 18-24 46-42 80-54z";

const Torso = ({ skin, tank, soft }: { skin: string; tank: string; soft: string }) => (
  <g>
    {/* Kontur qatlami */}
    <g fill={OUT} stroke={OUT} strokeWidth={EDGE} strokeLinejoin="round">
      <path d={NECK} />
      <path d={BODY} />
    </g>
    {/* Rang qatlami */}
    <path d={NECK} fill={skin} />
    <path d={BODY} fill={skin} />

    {/* Jag' ostidagi va yon tomondagi soya — bosh gavdadan ajralib tursin */}
    <g filter={soft}>
      <path d="M216 288h80c0 30-16 46-40 46s-40-16-40-46z" fill={SKIN_DEEP} opacity={0.6} />
      <path d="M150 340c-20 24-34 66-40 118h46c2-58 12-96 30-114z" fill={SKIN_DEEP} opacity={0.3} />
      <path d="M362 340c20 24 34 66 40 118h-46c-2-58-12-96-30-114z" fill={SKIN_DEEP} opacity={0.42} />
    </g>

    {/* O'mrov va ko'krak mushaklari */}
    <g fill="none" strokeLinecap="round">
      <path d="M206 332c14 13 30 20 50 20s36-7 50-20" stroke={SKIN_DEEP} strokeWidth={6} opacity={0.45} />
      <path d="M208 324c14 11 30 16 48 16s34-5 48-16" stroke="#ffdfbc" strokeWidth={5} opacity={0.35} />
    </g>

    {/* Mayka */}
    <path d={TANK_SHAPE} fill={tank} stroke={OUT} strokeWidth={STROKE} strokeLinejoin="round" />
    {/* Mato burmalari — yorug' va soya */}
    <g filter={soft} opacity={0.5}>
      <path d="M306 380c16 12 26 30 32 54 8 32 12 62 12 78h-46c8-58 8-104 2-132z" fill="#6d0f0f" />
      <path d="M206 336c-18 10-32 22-42 36-12 18-20 62-22 116h38c-2-70 6-118 26-152z" fill="#ff8b7a" />
    </g>
    <g fill="none" stroke="#7d1111" strokeWidth={4.5} strokeLinecap="round" opacity={0.4}>
      <path d="M256 396c2 34 1 68-2 104" />
      <path d="M222 418c-3 26-5 54-6 82" />
      <path d="M292 418c3 26 5 54 6 82" />
    </g>
    {/* Bo'yin kesimi tikuvi */}
    <path
      d="M206 330c12 30 30 48 50 48s38-18 50-48"
      fill="none"
      stroke="#ffb1a3"
      strokeWidth={4}
      opacity={0.5}
    />
  </g>
);

/* ------------------------------------------------------------------ qo'llar */

const FistDetail = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g strokeLinecap="round">
    <g fill="none" stroke={SKIN_DEEP} strokeWidth={4} opacity={0.45}>
      <path d={`M${x - r * 0.5} ${y + r * 0.05}c${r * 0.4} ${-r * 0.18} ${r * 0.7} ${-r * 0.18} ${r} 0`} />
      <path d={`M${x - r * 0.1} ${y - r * 0.5}v${r * 0.42}`} />
    </g>
    <ellipse
      cx={x - r * 0.3}
      cy={y - r * 0.4}
      rx={r * 0.32}
      ry={r * 0.22}
      fill="#ffdcb4"
      opacity={0.3}
      transform={`rotate(-25 ${x} ${y})`}
    />
  </g>
);

interface Bicep {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
}

/**
 * Bir qo'l: yelka → tirsak → kaft. `bicep` berilsa mushak do'ngi qo'shiladi.
 * Ikki marta chaqiriladi: kontur qatlami va rang qatlami.
 */
const Arm = ({
  layer,
  skin,
  shoulder,
  elbow,
  hand,
  handR = 28,
  bicep,
}: {
  layer: Layer;
  skin: string;
  shoulder: [number, number];
  elbow: [number, number];
  hand: [number, number];
  handR?: number;
  bicep?: Bicep;
}) => (
  <g>
    {/* Yelka mushagi (deltoid) — mayka tasmasi ustidan chiqib turadi */}
    <circle cx={shoulder[0]} cy={shoulder[1]} r={42} {...blob(layer, skin)} />
    {/* Yelkadan tirsakgacha — qo'lning eng yo'g'on qismi */}
    <path d={`M${shoulder[0]} ${shoulder[1]}L${elbow[0]} ${elbow[1]}`} {...limb(layer, 58, skin)} />
    {/* Bilak: tirsakda yo'g'on, bilaguzukda ingichka — ikki bo'lakda toraytiriladi */}
    <path
      d={`M${elbow[0]} ${elbow[1]}L${(elbow[0] + hand[0]) / 2} ${(elbow[1] + hand[1]) / 2}`}
      {...limb(layer, 50, skin)}
    />
    <path
      d={`M${(elbow[0] + hand[0]) / 2} ${(elbow[1] + hand[1]) / 2}L${hand[0]} ${hand[1]}`}
      {...limb(layer, 42, skin)}
    />
    {bicep && (
      <ellipse
        cx={bicep.cx}
        cy={bicep.cy}
        rx={bicep.rx}
        ry={bicep.ry}
        transform={`rotate(${bicep.rotate} ${bicep.cx} ${bicep.cy})`}
        {...blob(layer, skin)}
      />
    )}
    {handR > 0 && <circle cx={hand[0]} cy={hand[1]} r={handR} {...blob(layer, skin)} />}
  </g>
);

/** Qo'l ustidagi mushak detali — faqat rang qatlamidan keyin chiziladi. */
const ArmDetail = ({
  shoulder,
  bicep,
  soft,
}: {
  shoulder: [number, number];
  bicep?: Bicep;
  soft: string;
}) => (
  <g>
    {/* Deltoid tolalari va yaltirog'i */}
    <path
      d={`M${shoulder[0] - 28} ${shoulder[1] - 6}c11 20 33 24 52 12`}
      fill="none"
      stroke={SKIN_DEEP}
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.45}
    />
    <ellipse
      cx={shoulder[0] - 8}
      cy={shoulder[1] - 22}
      rx={24}
      ry={13}
      fill="#ffdcb4"
      opacity={0.3}
      filter={soft}
    />
    {bicep && (
      <>
        <path
          d={`M${bicep.cx - bicep.rx * 0.45} ${bicep.cy + 4}c${bicep.rx * 0.4} ${-bicep.ry * 0.6} ${
            bicep.rx * 0.9
          } ${-bicep.ry * 0.6} ${bicep.rx * 1.15} 0`}
          fill="none"
          stroke={SKIN_DEEP}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.55}
        />
        <ellipse
          cx={bicep.cx - bicep.rx * 0.15}
          cy={bicep.cy - bicep.ry * 0.45}
          rx={bicep.rx * 0.45}
          ry={bicep.ry * 0.3}
          fill="#ffdcb4"
          opacity={0.34}
          filter={soft}
          transform={`rotate(${bicep.rotate} ${bicep.cx} ${bicep.cy})`}
        />
      </>
    )}
  </g>
);

/** Ochiq kaft — salomlashish uchun (barmoqlar bilan). */
const PalmShape = ({ x, y, layer, skin }: { x: number; y: number; layer: Layer; skin: string }) => (
  <path
    d={`M${x - 32} ${y + 14}c-9-26 0-44 11-44 5 0 9 6 11 16l3-38c1-13 20-13 20 1l1 33 8-33c2-12 20-10 19 3l-4 34 10-25c5-11 20-6 15 7l-11 42c-8 26-24 36-46 32s-31-18-37-31z`}
    {...blob(layer, skin)}
  />
);

interface PoseArm {
  shoulder: [number, number];
  elbow: [number, number];
  hand: [number, number];
  handR?: number;
  bicep?: Bicep;
}

const LEFT_BICEP: PoseArm = {
  shoulder: [140, 384],
  elbow: [52, 356],
  hand: [96, 162],
  handR: 34,
  bicep: { cx: 92, cy: 334, rx: 54, ry: 38, rotate: -14 },
};
const RIGHT_BICEP: PoseArm = {
  shoulder: [372, 384],
  elbow: [460, 356],
  hand: [416, 162],
  handR: 34,
  bicep: { cx: 420, cy: 334, rx: 54, ry: 38, rotate: 14 },
};
const LEFT_HIP: PoseArm = { shoulder: [140, 384], elbow: [96, 450], hand: [148, 486], handR: 30 };
const LEFT_DOWN: PoseArm = { shoulder: [140, 384], elbow: [100, 456], hand: [142, 492], handR: 30 };

/** Kayfiyat -> qo'l pozalari. `anim` — o'ng qo'lning CSS animatsiyasi. */
const POSES: Record<
  CoachMood,
  { left: PoseArm; right: PoseArm; anim?: "wave" | "punch"; palm?: [number, number] }
> = {
  win: { left: LEFT_BICEP, right: RIGHT_BICEP },
  push: {
    left: LEFT_BICEP,
    right: { shoulder: [372, 384], elbow: [446, 302], hand: [424, 146], handR: 36 },
    anim: "punch",
  },
  hello: {
    left: LEFT_HIP,
    right: { shoulder: [372, 384], elbow: [446, 314], hand: [420, 226], handR: 0 },
    anim: "wave",
    palm: [416, 196],
  },
  sad: {
    left: LEFT_DOWN,
    right: { shoulder: [372, 384], elbow: [438, 446], hand: [292, 446], handR: 32 },
  },
  think: {
    left: LEFT_DOWN,
    right: { shoulder: [372, 384], elbow: [446, 414], hand: [318, 330], handR: 30 },
  },
  idle: {
    left: { shoulder: [140, 384], elbow: [92, 446], hand: [336, 472], handR: 31 },
    right: { shoulder: [372, 384], elbow: [420, 442], hand: [176, 496], handR: 31 },
  },
};

const Arms = ({
  mood,
  animated,
  skin,
  soft,
}: {
  mood: CoachMood;
  animated: boolean;
  skin: string;
  soft: string;
}) => {
  const pose = POSES[mood];
  const animClass = pose.anim ? `coach-art-${pose.anim}` : undefined;
  const origin = `${pose.right.shoulder[0]}px ${pose.right.shoulder[1]}px`;

  const draw = (layer: Layer) => (
    <>
      <Arm layer={layer} skin={skin} {...pose.left} />
      <g
        className={animated ? animClass : undefined}
        style={pose.anim ? { transformOrigin: origin } : undefined}
      >
        <Arm layer={layer} skin={skin} {...pose.right} />
        {pose.palm && <PalmShape x={pose.palm[0]} y={pose.palm[1]} layer={layer} skin={skin} />}
      </g>
    </>
  );

  return (
    <g
      className={animated ? `coach-art-arms coach-art-arms-${mood}` : undefined}
      style={{ transformOrigin: "256px 400px" }}
    >
      {draw("outline")}
      {draw("fill")}
      {/* Mushak detallari — rang qatlamidan keyin */}
      <ArmDetail shoulder={pose.left.shoulder} bicep={pose.left.bicep} soft={soft} />
      <ArmDetail shoulder={pose.right.shoulder} bicep={pose.right.bicep} soft={soft} />
      {!!pose.left.handR && (
        <FistDetail x={pose.left.hand[0]} y={pose.left.hand[1]} r={pose.left.handR} />
      )}
      {!!pose.right.handR && (
        <FistDetail x={pose.right.hand[0]} y={pose.right.hand[1]} r={pose.right.handR} />
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- effektlar */

const Spark = ({ x, y, s = 1, soft }: { x: number; y: number; s?: number; soft: string }) => (
  <g>
    <circle cx={x} cy={y} r={26 * s} fill="#fde047" opacity={0.25} filter={soft} />
    <path
      d={`M${x} ${y - 24 * s}c${4 * s} ${15 * s} ${9 * s} ${20 * s} ${24 * s} ${24 * s}c${-15 * s} ${
        4 * s
      } ${-20 * s} ${9 * s} ${-24 * s} ${24 * s}c${-4 * s} ${-15 * s} ${-9 * s} ${-20 * s} ${
        -24 * s
      } ${-24 * s}c${15 * s} ${-4 * s} ${20 * s} ${-9 * s} ${24 * s} ${-24 * s}z`}
      fill="#ffe066"
      stroke={OUT}
      strokeWidth={4.5}
      strokeLinejoin="round"
    />
  </g>
);

const Fx = ({ mood, animated, soft }: { mood: CoachMood; animated: boolean; soft: string }) => {
  const cls = animated ? "coach-art-fx" : undefined;

  switch (mood) {
    case "win":
      return (
        <g className={cls}>
          <Spark x={60} y={140} soft={soft} />
          <Spark x={452} y={160} s={0.85} soft={soft} />
          <Spark x={146} y={56} s={0.6} soft={soft} />
          <Spark x={368} y={64} s={0.5} soft={soft} />
        </g>
      );
    case "hello":
      return (
        <g className={cls} fill="none" stroke="#fbbf24" strokeWidth={11} strokeLinecap="round">
          <path d="M440 168c16-11 28-11 42 0" />
          <path d="M450 132c20-13 35-13 52 2" />
        </g>
      );
    case "push":
      return (
        <g className={cls}>
          <ellipse cx={92} cy={180} rx={58} ry={78} fill="#f97316" opacity={0.25} filter={soft} />
          <path
            d="M52 150c-18-30-9-60 11-76-5 26 9 30 18 16 12-18 5-39-7-53 46 18 67 60 51 94-12 26-55 34-73 19z"
            fill="#f97316"
            stroke={OUT}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <path
            d="M66 136c-9-16-5-30 7-39-2 14 7 18 11 9 7-9 2-23-4-30 25 12 37 35 28 53-7 14-33 18-42 7z"
            fill="#fde047"
          />
        </g>
      );
    case "sad":
      return (
        <g className={cls}>
          <path
            d="M96 168c-16-16-5-41 16-37 9 2 14 9 16 16 2-7 7-14 16-16 21-4 32 21 16 37-11 11-25 23-32 30-7-7-21-19-32-30z"
            fill="#f2564a"
            stroke={OUT}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <ellipse
            cx={112}
            cy={158}
            rx={9}
            ry={5}
            fill="#fff"
            opacity={0.5}
            transform="rotate(-30 112 158)"
          />
        </g>
      );
    case "think":
      return (
        <g className={cls} fill="#fff" stroke={OUT} strokeWidth={5}>
          <circle cx={396} cy={192} r={11} />
          <circle cx={428} cy={150} r={17} />
          <circle cx={466} cy={98} r={25} />
        </g>
      );
    default:
      return null;
  }
};

/* --------------------------------------------------------------- komponent */

export interface MotivatorArtProps {
  mood?: CoachMood;
  /** CSS animatsiyalari (index.css dagi `coach-art-*`). Stikerda — false. */
  animated?: boolean;
  /** Telegram stikeri: shaffof fon + oq kontur. */
  sticker?: boolean;
  /** Orqa fon doirasi (ilovadagi avatar uchun). */
  background?: boolean;
  /** Stiker ustidagi qisqa matn — "ZO'R!", "QANI!". */
  caption?: string;
  /**
   * Statik kadr uchun 0→1 faza. CSS animatsiyasi yo'q joyda (server-side
   * render) harakatni shu beradi — nafas, bosh tebranishi, uchqun pulsi.
   */
  phase?: number;
  className?: string;
  style?: CSSProperties;
  /** Bir sahifada bir nechta nusxa bo'lsa gradient id lari to'qnashmasin. */
  idPrefix?: string;
  title?: string;
}

const MotivatorArt = ({
  mood = "idle",
  animated = false,
  sticker = false,
  background = true,
  caption,
  phase,
  className,
  style,
  idPrefix = "mv",
  title = "Motivator Murabbiy",
}: MotivatorArtProps) => {
  const id = (name: string) => `${idPrefix}-${name}`;
  const soft = `url(#${id("soft")})`;

  // Statik kadr: sinus bo'yicha kichik siljishlar (CSS animatsiyasi o'rniga).
  const t = phase === undefined ? null : Math.sin(phase * Math.PI * 2);
  const bodyScale = t === null ? 1 : 1 + t * 0.014;
  const headShift = t === null ? 0 : -t * 4;
  const fxScale = t === null ? 1 : 1 + t * 0.1;

  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        {/* Yumshoq soya/yorug'lik — hamma joyda shu bitta filtr */}
        <filter id={id("soft")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        {/* Yorug'lik chapdan-yuqoridan: teri, mato, soch bir xil yo'nalishda */}
        <linearGradient id={id("skin")} x1="120" y1="90" x2="430" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffcf98" />
          <stop offset="0.34" stopColor={SKIN} />
          <stop offset="0.72" stopColor={SKIN_DARK} />
          <stop offset="1" stopColor={SKIN_DEEP} />
        </linearGradient>
        <linearGradient id={id("tank")} x1="150" y1="320" x2="390" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff5646" />
          <stop offset="0.42" stopColor="#e01414" />
          <stop offset="1" stopColor="#7a0c0c" />
        </linearGradient>
        <linearGradient id={id("hair")} x1="180" y1="100" x2="340" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a2519" />
          <stop offset="1" stopColor={HAIR} />
        </linearGradient>
        <linearGradient id={id("band")} x1="180" y1="160" x2="336" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="1" stopColor="#c31d1d" />
        </linearGradient>
        <radialGradient id={id("vignette")} cx="50%" cy="45%" r="72%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#4c0519" stopOpacity="0.55" />
        </radialGradient>
        {/* Fon: bosh orqasida issiq nur, chetlarga qorayadi — qizil mayka
            va teri rangi fondan ajralib tursin. */}
        <radialGradient id={id("glow")} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ff9a3c" />
          <stop offset="38%" stopColor="#c72b28" />
          <stop offset="100%" stopColor="#3b0f12" />
        </radialGradient>

        {sticker && (
          <filter id={id("edge")} x="-12%" y="-12%" width="124%" height="124%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
            <feFlood floodColor="#ffffff" result="w" />
            <feComposite in="w" in2="d" operator="in" result="edge" />
            <feMerge>
              <feMergeNode in="edge" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {background && !sticker && (
        // To'liq fon: Telegram fotosi shaffoflikni ko'tarmaydi, shuning uchun
        // burchaklar ham bo'yalgan bo'lishi kerak.
        <g>
          <rect width={512} height={512} fill={`url(#${id("glow")})`} />
          <circle cx={256} cy={216} r={186} fill="#ffd9a8" opacity={0.16} />
          <rect width={512} height={512} fill={`url(#${id("vignette")})`} />
        </g>
      )}

      <g filter={sticker ? `url(#${id("edge")})` : undefined}>
        {/* Yozuvli stikerda figura tepaga suriladi — matn gavdani yopmasin */}
        <g transform={caption ? "translate(0 -34)" : undefined}>
          <g
            style={
              t === null ? undefined : { transform: `scale(${fxScale})`, transformOrigin: "256px 256px" }
            }
          >
            <Fx mood={mood} animated={animated} soft={soft} />
          </g>
          <g
            className={animated ? "coach-art-body" : undefined}
            style={{
              transformOrigin: "256px 480px",
              ...(t === null ? {} : { transform: `scaleY(${bodyScale})` }),
            }}
          >
            <Torso skin={`url(#${id("skin")})`} tank={`url(#${id("tank")})`} soft={soft} />
            <Arms mood={mood} animated={animated} skin={`url(#${id("skin")})`} soft={soft} />
            <g
              style={
                t === null
                  ? undefined
                  : { transform: `translateY(${headShift}px)`, transformOrigin: "256px 300px" }
              }
            >
              <Head
                mood={mood}
                animated={animated}
                skin={`url(#${id("skin")})`}
                hair={`url(#${id("hair")})`}
                band={`url(#${id("band")})`}
                soft={soft}
              />
            </g>
          </g>
          {/* O'ng qirradagi issiq yorug'lik — figurani fondan ajratadi */}
          <g opacity={0.45} filter={soft}>
            <path d="M346 326c32 18 54 46 66 78 12 32 18 62 20 96h-28c-2-60-12-108-30-136-12-18-28-32-46-40z" fill={RIM} />
            <path d="M320 142c14 16 20 40 18 66-4-26-12-48-26-58z" fill={RIM} />
          </g>
        </g>
        {caption && (
          <text
            x={256}
            y={498}
            textAnchor="middle"
            fontFamily="Arial Black, Arial, Helvetica, sans-serif"
            fontSize={64}
            fontWeight={900}
            fill="#fff"
            stroke={OUT}
            strokeWidth={13}
            paintOrder="stroke"
            letterSpacing={2}
          >
            {caption}
          </text>
        )}
      </g>
    </svg>
  );
};

export default MotivatorArt;

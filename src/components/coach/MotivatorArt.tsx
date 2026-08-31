/**
 * Motivator Murabbiy — afishadagi qahramonning vektor portreti.
 *
 * Bitta manba, ikkita ishlatilish joyi:
 *   • ilovada — React komponenti (jonli, CSS animatsiyalari bilan);
 *   • stikerda — `scripts/build-coach-stickers.mjs` shu komponentni server-side
 *     render qilib 512×512 PNG chiqaradi (Telegram stiker talabi).
 *
 * Shuning uchun bu yerda hech qanday tashqi rasm, font yoki hook yo'q — faqat
 * sof SVG. Kayfiyat (`mood`) qo'l pozasini, yuz ifodasini va effektlarni
 * almashtiradi; gavda va bosh hamma kayfiyatda bir xil qoladi.
 *
 * Chizish uslubi: har bir a'zo IKKI qatlamda chiziladi — avval qora kontur
 * (kengroq chiziq), ustidan tana rangi. Shu sabab qo'l ichida ortiqcha chok
 * ko'rinmaydi, tashqarida esa yaxlit multfilm konturi qoladi.
 */

import type { CSSProperties } from "react";

export type CoachMood = "idle" | "hello" | "win" | "push" | "sad" | "think";

/* ------------------------------------------------------------------ palitra */

const OUT = "#3b2015"; // umumiy kontur — iliq to'q jigarrang
const SKIN = "#f2ab79";
const SKIN_DARK = "#d78551";
const HAIR = "#22150f";
const BAND = "#ef4444";
const BAND_DARK = "#b91c1c";
const TANK = "#dc2626";
const TANK_LIGHT = "#f87171";
const TANK_DARK = "#991b1b";
const MOUTH = "#7c2d12";
const BLUSH = "#f87171";

const STROKE = 7; // yakka shakllar konturi
const EDGE = 15; // qo'l/gavda konturi qalinligi (ikki qatlamli chizishda)

type Layer = "outline" | "fill";

/** Qo'l bo'g'ini (chiziq) — kontur qatlamida qalinroq, rang qatlamida ingichka. */
const limb = (layer: Layer, width: number) => ({
  fill: "none" as const,
  stroke: layer === "outline" ? OUT : SKIN,
  strokeWidth: layer === "outline" ? width + EDGE : width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Mushak do'ngi / musht kabi to'ldiriladigan shakl. */
const blob = (layer: Layer) => ({
  fill: layer === "outline" ? OUT : SKIN,
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

  return (
    <g>
      <ellipse cx={225} cy={224} rx={17} ry={19} fill="#fff" stroke={OUT} strokeWidth={5} />
      <ellipse cx={287} cy={224} rx={17} ry={19} fill="#fff" stroke={OUT} strokeWidth={5} />
      <circle cx={228} cy={226 + look} r={8.5} fill={OUT} />
      <circle cx={290} cy={226 + look} r={8.5} fill={OUT} />
      <circle cx={231} cy={221 + look} r={3.4} fill="#fff" />
      <circle cx={293} cy={221 + look} r={3.4} fill="#fff" />
      {mood === "sad" && (
        <g fill={SKIN_DARK}>
          <path d="M208 218c10-8 26-8 34 0l-2-10h-30z" />
          <path d="M270 218c10-8 26-8 34 0l-2-10h-30z" />
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
    <g fill="none" stroke={HAIR} strokeWidth={14} strokeLinecap="round">
      <path d={left} />
      <path d={right} />
    </g>
  );
};

const Mouth = ({ mood }: { mood: CoachMood }) => {
  if (mood === "sad") {
    return (
      <path
        d="M228 274c12 11 44 11 56 0"
        fill="none"
        stroke={OUT}
        strokeWidth={8}
        strokeLinecap="round"
      />
    );
  }

  if (mood === "think") {
    return (
      <path
        d="M232 278c11-9 32-9 46-2"
        fill="none"
        stroke={OUT}
        strokeWidth={8}
        strokeLinecap="round"
      />
    );
  }

  // Ochiq, baland ovozli tabassum — motivator uslubi
  const wide = mood === "push" || mood === "win";
  const d = wide
    ? "M212 264c15 46 73 46 88 0-25 13-63 13-88 0z"
    : "M220 266c13 34 60 34 72 0-20 10-52 10-72 0z";
  const teeth = wide
    ? "M214 266c23 11 61 11 84 0l-4-6c-25 8-51 8-76 0z"
    : "M222 268c19 8 50 8 68 0l-3-5c-21 7-41 7-62 0z";
  return (
    <g>
      <path d={d} fill={MOUTH} stroke={OUT} strokeWidth={6} strokeLinejoin="round" />
      <path d={teeth} fill="#fff" />
      {wide && <ellipse cx={256} cy={296} rx={14} ry={8} fill="#ef4444" opacity={0.8} />}
    </g>
  );
};

/* ------------------------------------------------------------------- bosh */

const Head = ({ mood, animated }: { mood: CoachMood; animated: boolean }) => (
  <g className={animated ? "coach-art-head" : undefined} style={{ transformOrigin: "256px 300px" }}>
    {/* Quloqlar */}
    <ellipse cx={180} cy={224} rx={15} ry={22} fill={SKIN} stroke={OUT} strokeWidth={STROKE} />
    <ellipse cx={332} cy={224} rx={15} ry={22} fill={SKIN} stroke={OUT} strokeWidth={STROKE} />

    {/* Yuz */}
    <path
      d="M256 118c44 0 78 30 78 84 0 66-34 106-78 106s-78-40-78-106c0-54 34-84 78-84z"
      fill={SKIN}
      stroke={OUT}
      strokeWidth={STROKE}
    />

    {/* Jag' soyasi */}
    <path
      d="M194 244c10 48 34 74 62 74s52-26 62-74c-14 42-38 60-62 60s-48-18-62-60z"
      fill={SKIN_DARK}
      opacity={0.3}
    />

    {/* Soch — bandana ustidagi qism (notekis soch chizig'i) */}
    <path
      d="M178 172c0-44 33-70 78-70s78 26 78 70c-9-15-22-25-37-31 5-7 7-14 4-20-11 13-26 19-43 19-23 0-42-8-55-23-3 11 0 20 7 26-16 7-27 16-32 29z"
      fill={HAIR}
      stroke={OUT}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <path
      d="M204 138c13-15 31-24 50-25"
      fill="none"
      stroke="#4a3128"
      strokeWidth={9}
      strokeLinecap="round"
    />
    {/* Chakkadagi soch */}
    <path d="M182 186c-2 16 0 28 4 38 8-14 10-28 8-42z" fill={HAIR} stroke={OUT} strokeWidth={5} />
    <path d="M330 186c2 16 0 28-4 38-8-14-10-28-8-42z" fill={HAIR} stroke={OUT} strokeWidth={5} />

    {/* Bandana */}
    <path
      d="M178 168c22-22 134-22 156 0l-4 30c-24-19-124-19-148 0z"
      fill={BAND}
      stroke={OUT}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <path d="M182 180c24-13 124-13 148 0l-1 10c-24-15-122-15-146 0z" fill={BAND_DARK} opacity={0.5} />

    {/* Bandana uchlari — chapga uchib turadi */}
    <g className={animated ? "coach-art-tail" : undefined} style={{ transformOrigin: "180px 184px" }}>
      <path
        d="M184 176c-26 2-48 16-62 38 20-10 34-13 50-11z"
        fill={BAND}
        stroke={OUT}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d="M184 194c-22 12-35 32-39 56 15-18 28-27 43-29z"
        fill={BAND_DARK}
        stroke={OUT}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </g>

    <Brows mood={mood} />
    <Eyes mood={mood} />

    {/* Burun */}
    <path d="M256 234c-6 15-8 22 2 26" fill="none" stroke={OUT} strokeWidth={6} strokeLinecap="round" />

    {/* Yonoq qizilligi */}
    <ellipse cx={202} cy={256} rx={18} ry={10} fill={BLUSH} opacity={0.42} />
    <ellipse cx={310} cy={256} rx={18} ry={10} fill={BLUSH} opacity={0.42} />

    <Mouth mood={mood} />
  </g>
);

/* ------------------------------------------------------------------ gavda */

const NECK = "M228 292h56v34c0 20-56 20-56 0z";
const BODY =
  "M256 320c48 0 84 12 110 36 26 24 38 78 44 138H102c6-60 18-114 44-138 26-24 62-36 110-36z";
const TANK_SHAPE =
  "M212 342c7 30 25 46 44 46s37-16 44-46c30 7 54 19 70 35 15 16 23 61 27 117H115c4-56 12-101 27-117 16-16 40-28 70-35z";

const Torso = () => (
  <g>
    {/* Kontur qatlami */}
    <g fill={OUT} stroke={OUT} strokeWidth={EDGE} strokeLinejoin="round">
      <path d={NECK} />
      <path d={BODY} />
    </g>
    {/* Rang qatlami */}
    <path d={NECK} fill={SKIN_DARK} />
    <path d={BODY} fill={SKIN} />
    {/* O'mrov chizig'i */}
    <path
      d="M214 344c12 10 26 15 42 15s30-5 42-15"
      fill="none"
      stroke={SKIN_DARK}
      strokeWidth={6}
      strokeLinecap="round"
      opacity={0.7}
    />
    {/* Mayka */}
    <path d={TANK_SHAPE} fill={TANK} stroke={OUT} strokeWidth={STROKE} strokeLinejoin="round" />
    <path
      d="M212 342c7 30 25 46 44 46l-4 14c-24-4-42-24-50-56z"
      fill={TANK_LIGHT}
      opacity={0.45}
    />
    <path d="M330 386c9 14 15 60 17 108h-40c6-42 12-80 23-108z" fill={TANK_DARK} opacity={0.4} />
    {/* Mayka burmalari */}
    <path
      d="M256 402v92M228 420l-6 74M286 420l6 74"
      fill="none"
      stroke={TANK_DARK}
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.35}
    />
  </g>
);

/* ------------------------------------------------------------------ qo'llar */

const Fist = ({ x, y, r, layer }: { x: number; y: number; r: number; layer: Layer }) => (
  <circle cx={x} cy={y} r={r} {...blob(layer)} />
);

const FistDetail = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g fill="none" stroke={SKIN_DARK} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
    <path d={`M${x - r * 0.55} ${y - r * 0.05}h${r * 1.1}`} />
    <path d={`M${x - r * 0.15} ${y - r * 0.55}v${r * 0.5}`} />
  </g>
);

/**
 * Bir qo'l: yelka → tirsak → kaft. `bicep` berilsa mushak do'ngi qo'shiladi.
 * Ikki marta chaqiriladi: kontur qatlami va rang qatlami.
 */
const Arm = ({
  layer,
  shoulder,
  elbow,
  hand,
  handR = 28,
  bicep,
}: {
  layer: Layer;
  shoulder: [number, number];
  elbow: [number, number];
  hand: [number, number];
  handR?: number;
  bicep?: { cx: number; cy: number; rx: number; ry: number; rotate: number };
}) => (
  <g>
    {/* Yelka mushagi (deltoid) */}
    <circle cx={shoulder[0]} cy={shoulder[1]} r={34} {...blob(layer)} />
    <path
      d={`M${shoulder[0]} ${shoulder[1]}L${elbow[0]} ${elbow[1]}`}
      {...limb(layer, 48)}
    />
    <path d={`M${elbow[0]} ${elbow[1]}L${hand[0]} ${hand[1]}`} {...limb(layer, 40)} />
    {bicep && (
      <ellipse
        cx={bicep.cx}
        cy={bicep.cy}
        rx={bicep.rx}
        ry={bicep.ry}
        transform={`rotate(${bicep.rotate} ${bicep.cx} ${bicep.cy})`}
        {...blob(layer)}
      />
    )}
    <Fist x={hand[0]} y={hand[1]} r={handR} layer={layer} />
  </g>
);

/** Ochiq kaft — salomlashish uchun (barmoqlar bilan). */
const PalmShape = ({ x, y, layer }: { x: number; y: number; layer: Layer }) => (
  <path
    d={`M${x - 32} ${y + 14}c-9-26 0-44 11-44 5 0 9 6 11 16l3-38c1-13 20-13 20 1l1 33 8-33c2-12 20-10 19 3l-4 34 10-25c5-11 20-6 15 7l-11 42c-8 26-24 36-46 32s-31-18-37-31z`}
    {...blob(layer)}
  />
);

const Arms = ({ mood, animated }: { mood: CoachMood; animated: boolean }) => {
  /** Har bir kayfiyat uchun poza — ikki qatlamda bir xil geometriya. */
  const pose = (layer: Layer) => {
    switch (mood) {
      case "win":
        // Ikki tomonlama biceps
        return (
          <>
            <Arm
              layer={layer}
              shoulder={[158, 350]}
              elbow={[74, 334]}
              hand={[120, 190]}
              handR={30}
              bicep={{ cx: 112, cy: 314, rx: 48, ry: 36, rotate: -10 }}
            />
            <Arm
              layer={layer}
              shoulder={[354, 350]}
              elbow={[438, 334]}
              hand={[392, 190]}
              handR={30}
              bicep={{ cx: 400, cy: 314, rx: 48, ry: 36, rotate: 10 }}
            />
          </>
        );
      case "push":
        // Chap qo'l biceps, o'ng musht oldinga
        return (
          <>
            <Arm
              layer={layer}
              shoulder={[158, 350]}
              elbow={[74, 334]}
              hand={[120, 190]}
              handR={30}
              bicep={{ cx: 112, cy: 314, rx: 48, ry: 36, rotate: -10 }}
            />
            <g
              className={animated ? "coach-art-punch" : undefined}
              style={{ transformOrigin: "354px 350px" }}
            >
              <Arm layer={layer} shoulder={[354, 350]} elbow={[420, 296]} hand={[402, 168]} handR={32} />
            </g>
          </>
        );
      case "hello":
        // Chap qo'l belda, o'ng qo'l yuqorida
        return (
          <>
            <Arm layer={layer} shoulder={[158, 350]} elbow={[110, 416]} hand={[156, 452]} handR={26} />
            <g className={animated ? "coach-art-wave" : undefined} style={{ transformOrigin: "354px 350px" }}>
              <Arm layer={layer} shoulder={[354, 350]} elbow={[412, 296]} hand={[394, 216]} handR={0} />
              <PalmShape x={392} y={186} layer={layer} />
            </g>
          </>
        );
      case "sad":
        // O'ng qo'l ko'krakda — qo'llab-quvvatlash
        return (
          <>
            <Arm layer={layer} shoulder={[158, 350]} elbow={[116, 420]} hand={[150, 458]} handR={26} />
            <Arm layer={layer} shoulder={[354, 350]} elbow={[404, 408]} hand={[298, 412]} handR={28} />
          </>
        );
      case "think":
        // Qo'l iyakda
        return (
          <>
            <Arm layer={layer} shoulder={[158, 350]} elbow={[116, 420]} hand={[150, 458]} handR={26} />
            <Arm layer={layer} shoulder={[354, 350]} elbow={[412, 380]} hand={[318, 318]} handR={27} />
          </>
        );
      default:
        // idle — qo'llar ko'krakda chalishtirilgan
        return (
          <>
            <Arm layer={layer} shoulder={[158, 350]} elbow={[112, 408]} hand={[326, 436]} handR={27} />
            <Arm layer={layer} shoulder={[354, 350]} elbow={[400, 404]} hand={[188, 462]} handR={27} />
          </>
        );
    }
  };

  return (
    <g className={animated ? `coach-art-arms coach-art-arms-${mood}` : undefined} style={{ transformOrigin: "256px 400px" }}>
      {pose("outline")}
      {pose("fill")}
      {/* Mushak chiziqlari — faqat rang qatlamidan keyin */}
      {(mood === "win" || mood === "push") && (
        <g fill="none" stroke={SKIN_DARK} strokeWidth={6} strokeLinecap="round" opacity={0.8}>
          <path d="M86 306c14-12 34-12 48 2" />
          {mood === "win" && <path d="M378 308c14-14 34-14 48-2" />}
        </g>
      )}
      {mood === "win" && (
        <>
          <FistDetail x={120} y={190} r={30} />
          <FistDetail x={392} y={190} r={30} />
        </>
      )}
      {mood === "push" && (
        <>
          <FistDetail x={120} y={190} r={30} />
          <FistDetail x={402} y={168} r={32} />
        </>
      )}
    </g>
  );
};

/* ---------------------------------------------------------------- effektlar */

const Spark = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    d={`M${x} ${y - 24 * s}c${4 * s} ${15 * s} ${9 * s} ${20 * s} ${24 * s} ${24 * s}c${-15 * s} ${
      4 * s
    } ${-20 * s} ${9 * s} ${-24 * s} ${24 * s}c${-4 * s} ${-15 * s} ${-9 * s} ${-20 * s} ${
      -24 * s
    } ${-24 * s}c${15 * s} ${-4 * s} ${20 * s} ${-9 * s} ${24 * s} ${-24 * s}z`}
    fill="#fde047"
    stroke={OUT}
    strokeWidth={5}
    strokeLinejoin="round"
  />
);

const Fx = ({ mood, animated }: { mood: CoachMood; animated: boolean }) => {
  const cls = animated ? "coach-art-fx" : undefined;

  switch (mood) {
    case "win":
      return (
        <g className={cls}>
          <Spark x={60} y={140} />
          <Spark x={452} y={160} s={0.85} />
          <Spark x={146} y={56} s={0.6} />
          <Spark x={368} y={64} s={0.5} />
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
          <path
            d="M52 150c-18-30-9-60 11-76-5 26 9 30 18 16 12-18 5-39-7-53 46 18 67 60 51 94-12 26-55 34-73 19z"
            fill="#fb923c"
            stroke={OUT}
            strokeWidth={6}
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
            fill="#f87171"
            stroke={OUT}
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </g>
      );
    case "think":
      return (
        <g className={cls} fill="#fff" stroke={OUT} strokeWidth={6}>
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
  className,
  style,
  idPrefix = "mv",
  title = "Motivator Murabbiy",
}: MotivatorArtProps) => {
  const glowId = `${idPrefix}-glow`;
  const edgeId = `${idPrefix}-edge`;

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
        <radialGradient id={glowId} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="55%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
        {sticker && (
          <filter id={edgeId} x="-12%" y="-12%" width="124%" height="124%">
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
        <g>
          <circle cx={256} cy={256} r={256} fill={`url(#${glowId})`} />
          <circle cx={256} cy={256} r={202} fill="#fff" opacity={0.08} />
        </g>
      )}

      <g filter={sticker ? `url(#${edgeId})` : undefined}>
        {/* Yozuvli stikerda figura tepaga suriladi — matn gavdani yopmasin */}
        <g transform={caption ? "translate(0 -34)" : undefined}>
          <Fx mood={mood} animated={animated} />
          <g
            className={animated ? "coach-art-body" : undefined}
            style={{ transformOrigin: "256px 480px" }}
          >
            <Torso />
            <Arms mood={mood} animated={animated} />
            <Head mood={mood} animated={animated} />
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

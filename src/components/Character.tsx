import { useEffect, useId, useState, type ReactElement, type ReactNode } from 'react';

export type Who = 'ada' | 'tunde' | 'zara' | 'blaze' | 'greta' | 'mei' | 'maddie' | 'priya';

export const CAST: Record<Who, { name: string; role: string; color: string }> = {
  ada: { name: 'Mama Ada', role: 'Wisdom & money', color: '#a78bfa' },
  tunde: { name: 'Tunde', role: 'Study buddy', color: '#2dd4bf' },
  zara: { name: 'Zara', role: 'Ledger keeper', color: '#ff7a45' },
  blaze: { name: 'Blaze', role: 'Streak keeper', color: '#ff9f1c' },
  greta: { name: 'Prof. Greta', role: 'Science · Germany', color: '#60a5fa' },
  mei: { name: 'Mei', role: 'Maths · China', color: '#f43f5e' },
  maddie: { name: 'Maddie', role: 'English · USA', color: '#38bdf8' },
  priya: { name: 'Priya', role: 'Biology · India', color: '#10b981' },
};

type Mood = 'idle' | 'talking' | 'cheer';

/**
 * Optional picture art. Drop `<who>.png` (or .webp/.jpg) into src/assets/cast
 * and that character uses it instead of the drawn SVG. A `<who>-talk.png`
 * frame with the mouth open makes the picture lip-sync while talking.
 */
const PICTURE_FILES = import.meta.glob<string>('../assets/cast/*.{png,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' });

const PICTURES: Partial<Record<Who, { idle: string; talk?: string }>> = {};
for (const [path, url] of Object.entries(PICTURE_FILES)) {
  const m = path.match(/\/([a-z]+)(-talk)?\.\w+$/);
  if (!m || !(m[1] in CAST)) continue;
  const who = m[1] as Who;
  PICTURES[who] = { ...PICTURES[who], [m[2] ? 'talk' : 'idle']: url } as { idle: string; talk?: string };
}
for (const who of Object.keys(PICTURES) as Who[]) if (!PICTURES[who]!.idle) delete PICTURES[who];

/**
 * An animated anime-style character. Blinks and bobs while idle, moves its
 * mouth while talking, and jumps when cheering. Respects reduced motion via CSS.
 */
export function Character({ who, mood = 'idle', size = 88 }: { who: Who; mood?: Mood; size?: number }) {
  const id = useId().replace(/:/g, '');
  const pic = PICTURES[who];
  if (pic) {
    return (
      <span className={`char char-pic ${mood}`} style={{ width: size, height: size }} role="img" aria-label={CAST[who].name}>
        <img className={pic.talk ? 'm-closed' : undefined} src={pic.idle} alt="" draggable={false} />
        {pic.talk && <img className="m-open" src={pic.talk} alt="" draggable={false} />}
      </span>
    );
  }
  const Art = ART[who];
  return (
    <svg className={`char char-${who} ${mood}`} width={size} height={size} viewBox="0 0 120 120" aria-label={CAST[who].name} role="img">
      <Art id={id} />
    </svg>
  );
}

/* Shared anime parts */

const LINE = '#241622';

/** Line-art wrapper: thin dark outlines, like cel animation. */
const Ink = ({ children, w = 1.2 }: { children: ReactNode; w?: number }) => (
  <g stroke={LINE} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
    {children}
  </g>
);

/** Two mouths; CSS swaps between them while talking. */
function Mouth({ closed, open }: { closed: ReactNode; open: ReactNode }) {
  return (
    <>
      <g className="m-closed">{closed}</g>
      <g className="m-open">{open}</g>
    </>
  );
}

/** Small anime mouth: a short line closed, an open "a" shape with tongue when talking. */
function AnimeMouth({ y = 74, wide = false, smile = true }: { y?: number; wide?: boolean; smile?: boolean }) {
  const w = wide ? 5.2 : 3.6;
  return (
    <Mouth
      closed={<path d={`M${60 - w} ${y} Q60 ${y + (smile ? 2.6 : 0.6)} ${60 + w} ${y}`} stroke={LINE} strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      open={
        <>
          <path d={`M${60 - w} ${y - 0.8} Q60 ${y - 1.6} ${60 + w} ${y - 0.8} Q${60 + w * 0.6} ${y + 7} 60 ${y + 7} Q${60 - w * 0.6} ${y + 7} ${60 - w} ${y - 0.8} Z`} fill="#6e1626" stroke={LINE} strokeWidth="1" />
          <path d={`M${60 - w * 0.5} ${y + 5.4} Q60 ${y + 2.6} ${60 + w * 0.5} ${y + 5.4} Q60 ${y + 7} ${60 - w * 0.5} ${y + 5.4} Z`} fill="#ff8fa3" />
        </>
      }
    />
  );
}

/**
 * Anime eye in the style of modern TV anime: almond white, layered iris
 * (dark top band, colour, light reflection below), ringed pupil, two
 * highlights, a thick upper lash with an outer flick and a short lower lash.
 */
function Eye({ cx, cy, iris, glow, id, side, sleepy = false }: { cx: number; cy: number; iris: string; glow: string; id: string; side: 'l' | 'r'; sleepy?: boolean }) {
  const f = side === 'l' ? -1 : 1; // +1 means "outward" is to the right
  const g = `${id}-iris-${side}`;
  const top = sleepy ? cy - 4.6 : cy - 7.2;
  const white = `M${cx - 5.8 * f} ${cy - 2.4} Q${cx - 4.8 * f} ${top} ${cx + 0.4 * f} ${top - 0.2} Q${cx + 5.6 * f} ${top + 0.4} ${cx + 6.8 * f} ${cy - 3} Q${cx + 6 * f} ${cy + 6.4} ${cx} ${cy + 6.6} Q${cx - 5.4 * f} ${cy + 6.2} ${cx - 5.8 * f} ${cy - 2.4} Z`;
  return (
    <g>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LINE} />
          <stop offset=".35" stopColor={iris} />
          <stop offset=".8" stopColor={glow} />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <clipPath id={`${g}-clip`}>
          <path d={white} />
        </clipPath>
      </defs>
      <path d={white} fill="#fff" />
      <g clipPath={`url(#${g}-clip)`}>
        <ellipse cx={cx + 0.3 * f} cy={cy + 0.6} rx="4.7" ry="6.3" fill={`url(#${g})`} />
        <ellipse cx={cx + 0.3 * f} cy={cy + 0.6} rx="4.7" ry="6.3" fill="none" stroke={LINE} strokeWidth="0.7" opacity=".8" />
        <ellipse cx={cx + 0.3 * f} cy={cy + 0.6} rx="3" ry="4.2" fill="none" stroke={glow} strokeWidth="0.6" opacity=".6" />
        <ellipse cx={cx + 0.3 * f} cy={cy + 0.8} rx="1.7" ry="2.6" fill={LINE} />
        <path d={`M${cx - 3.4} ${cy + 4.4} Q${cx} ${cy + 6.4} ${cx + 3.4} ${cy + 4.4}`} stroke={glow} strokeWidth="1.2" fill="none" opacity=".9" />
        {/* shadow cast by the upper lid */}
        <path d={`M${cx - 7} ${cy - 8} L${cx + 7} ${cy - 8} L${cx + 7} ${cy - 3.4} Q${cx} ${cy - 5.4} ${cx - 7} ${cy - 3.4} Z`} fill={LINE} opacity=".22" />
      </g>
      <ellipse cx={cx + 2 * f} cy={cy - 2.2} rx="1.9" ry="2.4" fill="#fff" />
      <circle cx={cx - 1.9 * f} cy={cy + 3} r="0.9" fill="#fff" />
      {/* upper lash with outer flick, thin lower lash, lid crease */}
      <path
        d={`M${cx - 6.4 * f} ${cy - 2} Q${cx - 5 * f} ${top - 0.6} ${cx + 0.6 * f} ${top - 0.8} Q${cx + 6 * f} ${top - 0.2} ${cx + 7.4 * f} ${cy - 3.4} L${cx + 8.6 * f} ${cy - 2.2}`}
        stroke={LINE}
        strokeWidth="2.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={`M${cx + 6.6 * f} ${cy - 1} Q${cx + 5.6 * f} ${cy + 5.6} ${cx + 1 * f} ${cy + 6.8}`} stroke={LINE} strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d={`M${cx - 4 * f} ${top - 3} Q${cx + 1 * f} ${top - 4.4} ${cx + 5.6 * f} ${top - 2.4}`} stroke={LINE} strokeWidth="0.7" fill="none" opacity=".6" />
    </g>
  );
}

function Eyes({ iris, glow, id, y = 59, gap = 10.5, sleepy }: { iris: string; glow: string; id: string; y?: number; gap?: number; sleepy?: boolean }) {
  return (
    <g className="eyes">
      <Eye cx={60 - gap} cy={y} iris={iris} glow={glow} id={id} side="l" sleepy={sleepy} />
      <Eye cx={60 + gap} cy={y} iris={iris} glow={glow} id={id} side="r" sleepy={sleepy} />
    </g>
  );
}

/** Happy closed anime eyes (^ ^), for the warm grandma. */
function SmileEyes({ y = 60 }: { y?: number }) {
  return (
    <g className="eyes">
      <path d={`M44 ${y + 1.4} Q49.5 ${y - 4.6} 55 ${y + 1.4}`} stroke={LINE} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d={`M65 ${y + 1.4} Q70.5 ${y - 4.6} 76 ${y + 1.4}`} stroke={LINE} strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d={`M54 ${y - 1} l2 -1.4 M66 ${y - 1} l-2 -1.4`} stroke={LINE} strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}

function Brows({ color, y = 47, angry = false }: { color: string; y?: number; angry?: boolean }) {
  const t = angry ? 2.2 : -0.6;
  return (
    <path d={`M43 ${y + t} Q49 ${y - 1.6} 55 ${y + 0.6} M65 ${y + 0.6} Q71 ${y - 1.6} 77 ${y + t}`} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" />
  );
}

/** Anime blush: soft ellipse with little hatch marks. */
function Blush({ y = 68, strength = 0.5 }: { y?: number; strength?: number }) {
  return (
    <g opacity={strength}>
      <ellipse cx="45" cy={y} rx="5.4" ry="2.4" fill="#ff7b9c" opacity=".5" />
      <ellipse cx="75" cy={y} rx="5.4" ry="2.4" fill="#ff7b9c" opacity=".5" />
      <path d={`M42 ${y + 1} l1.8 -2.2 M45 ${y + 1} l1.8 -2.2 M48 ${y + 1} l1.8 -2.2 M71 ${y + 1} l1.8 -2.2 M74 ${y + 1} l1.8 -2.2 M77 ${y + 1} l1.8 -2.2`} stroke="#e8577d" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  );
}

const Freckles = () => (
  <g fill="#a86a4a" opacity=".7">
    {[
      [55, 66],
      [57.4, 67.6],
      [54, 68.6],
      [65, 66],
      [62.6, 67.6],
      [66, 68.6],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" />
    ))}
  </g>
);

const Nose = ({ shade }: { shade: string }) => <path d="M60.6 64.6 L59.4 67.2 L60.8 67.4" stroke={shade} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />;

/** Anime face: soft cheeks to a pointed V chin, outlined, with neck shadow and a shade under the fringe. */
function Face({ skin, shade, ears = false }: { skin: string; shade: string; ears?: boolean }) {
  return (
    <Ink>
      <path d="M53 77 L53 91 L67 91 L67 77 Z" fill={skin} />
      <path d="M53 80 L67 80 L67 85 Q60 89 53 85 Z" fill={shade} stroke="none" />
      {ears && (
        <>
          <path d="M38.5 54 C33 52 33 64 39.5 66" fill={skin} />
          <path d="M81.5 54 C87 52 87 64 80.5 66" fill={skin} />
        </>
      )}
      <path d="M37.5 50 C37.5 33 47 25 60 25 C73 25 82.5 33 82.5 50 C82.5 62 78.5 71 70 78.6 L62.2 84.6 C60.9 85.5 59.1 85.5 57.8 84.6 L50 78.6 C41.5 71 37.5 62 37.5 50 Z" fill={skin} />
      <path d="M38.4 53 C40 46 47 42 60 42 C73 42 80 46 81.6 53 C79 49 71 47.4 60 47.4 C49 47.4 41 49 38.4 53 Z" fill={shade} stroke="none" opacity=".5" />
    </Ink>
  );
}

function Body({ color, shade, children }: { color: string; shade: string; children?: ReactNode }) {
  return (
    <Ink>
      <path d="M14 121 C16 99 33 89 60 89 C87 89 104 99 106 121 Z" fill={color} />
      <path d="M15 120 C17 105 25 97 35 93 C31 103 29 111 29 120 Z M105 120 C103 105 95 97 85 93 C89 103 91 111 91 120 Z" fill={shade} stroke="none" opacity=".65" />
      {children}
    </Ink>
  );
}

/** A glossy highlight band on the hair (cel-shaded, angular like TV anime). */
const Gloss = ({ d, color = '#fff', o = 0.35 }: { d: string; color?: string; o?: number }) => <path d={d} fill={color} opacity={o} />;

/** Strand lines drawn inside hair. */
const Strands = ({ d, o = 0.55 }: { d: string; o?: number }) => <path d={d} stroke={LINE} strokeWidth="0.8" fill="none" opacity={o} strokeLinecap="round" />;

/* The cast */

function Ada({ id }: { id: string }) {
  const skin = '#9c5c36';
  const shade = '#7a4224';
  return (
    <g className="bob" data-id={id}>
      <Body color="#7c3aed" shade="#4c1d95">
        <path d="M44 89 L60 107 L76 89 Z" fill="#fbbf24" />
        <path d="M51 89 L60 99 L69 89" fill="#7c3aed" />
        <circle cx="30" cy="108" r="2.4" fill="#fbbf24" />
        <circle cx="90" cy="108" r="2.4" fill="#fbbf24" />
      </Body>
      <Face skin={skin} shade={shade} />
      {/* gele: tall wrapped headtie with folds */}
      <Ink>
        <path d="M33 51 C25 24 45 5 62 12 C80 2 106 20 90 51 C84 40 72 35 60 36 C48 35 38 40 33 51 Z" fill="#8b5cf6" />
        <path d="M62 12 C70 24 84 26 93 21 C88 12 76 7 62 12 Z" fill="#a78bfa" />
      </Ink>
      <Strands d="M38 40 C50 28 72 27 86 37 M44 30 C54 22 70 21 80 27" o={0.5} />
      <path d="M40 44 C52 33 72 32 84 41" stroke="#fbbf24" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Gloss d="M46 20 C54 14 62 13 66 15 C58 17 52 20 48 25 Z" />
      <circle cx="37.5" cy="67" r="3" fill="#fbbf24" stroke={LINE} strokeWidth=".8" />
      <circle cx="82.5" cy="67" r="3" fill="#fbbf24" stroke={LINE} strokeWidth=".8" />
      <Brows color="#2b180c" y={50} />
      <SmileEyes y={60} />
      <circle cx="49.5" cy="60" r="7.8" stroke="#fbbf24" strokeWidth="1.7" fill="#fff" fillOpacity=".12" />
      <circle cx="70.5" cy="60" r="7.8" stroke="#fbbf24" strokeWidth="1.7" fill="#fff" fillOpacity=".12" />
      <path d="M57.3 60 H62.7" stroke="#fbbf24" strokeWidth="1.7" />
      <path d="M44 56 l3 -2.2" stroke="#fff" strokeOpacity=".75" strokeWidth="1.3" strokeLinecap="round" />
      <Nose shade={shade} />
      <Blush y={69} strength={0.7} />
      <AnimeMouth y={74} wide />
    </g>
  );
}

function Tunde({ id }: { id: string }) {
  const skin = '#7a4a2a';
  const shade = '#56301a';
  const hair = '#14101a';
  return (
    <g className="bob">
      <Body color="#14b8a6" shade="#0f766e">
        <path d="M40 93 C46 103 74 103 80 93" fill="none" />
        <path d="M53 99 V113 M67 99 V113" stroke="#ecfeff" strokeWidth="2.2" />
      </Body>
      <Face skin={skin} shade={shade} ears />
      {/* sharp, spiky hair (Killua-style silhouette) */}
      <Ink>
        <path d="M34 54 C30 40 33 26 44 19 L41 10 L51 16 L54 5 L60 14 L67 4 L70 15 L80 9 L78 19 C87 26 90 40 86 54 L82 44 L80 52 L76 38 L71 47 L68 34 L63 45 L58 33 L54 46 L49 36 L46 49 L42 40 L39 52 Z" fill={hair} />
      </Ink>
      <Strands d="M50 22 L54 34 M62 18 L63 32 M72 22 L70 33" o={0.9} />
      <Gloss d="M45 24 L58 18 L70 21 L66 24 L57 22 L48 27 Z" color="#7b8cff" o={0.45} />
      <Brows color={hair} y={47} angry />
      <Eyes iris="#7a4a22" glow="#e8b070" id={id} />
      <Nose shade={shade} />
      <Blush y={69} strength={0.3} />
      <Mouth
        closed={<path d="M54 73.6 Q60 78 66 73.6" stroke={LINE} strokeWidth="1.7" fill="none" strokeLinecap="round" />}
        open={
          <>
            <path d="M53 72.6 Q60 71.6 67 72.6 Q65 81.4 60 81.4 Q55 81.4 53 72.6 Z" fill="#6e1626" stroke={LINE} strokeWidth="1" />
            <path d="M54 73 H66 L65.4 74.8 H54.6 Z" fill="#fff" />
            <ellipse cx="60" cy="79" rx="3" ry="1.4" fill="#ff8fa3" />
          </>
        }
      />
    </g>
  );
}

function Zara({ id }: { id: string }) {
  const skin = '#a9693f';
  const shade = '#83492a';
  const hair = '#2a1810';
  return (
    <g className="bob">
      <Body color="#ff7a45" shade="#c2410c">
        <path d="M34 97 C40 85 80 85 86 97" stroke="#fbbf24" strokeWidth="5" fill="none" />
        <rect x="27" y="91" width="10" height="14" rx="4" fill="#fbbf24" />
        <rect x="83" y="91" width="10" height="14" rx="4" fill="#fbbf24" />
      </Body>
      {/* fluffy afro puffs */}
      {[
        [31, 26],
        [89, 26],
      ].map(([x, y]) => (
        <g key={x}>
          <Ink>
            <path
              d={`M${x - 14} ${y + 2} C${x - 20} ${y - 6} ${x - 12} ${y - 18} ${x - 4} ${y - 15} C${x} ${y - 22} ${x + 12} ${y - 18} ${x + 12} ${y - 10} C${x + 20} ${y - 6} ${x + 18} ${y + 8} ${x + 10} ${y + 10} C${x + 8} ${y + 18} ${x - 6} ${y + 18} ${x - 8} ${y + 11} C${x - 16} ${y + 12} ${x - 18} ${y + 6} ${x - 14} ${y + 2} Z`}
              fill={hair}
            />
          </Ink>
          <Gloss d={`M${x - 8} ${y - 8} Q${x} ${y - 14} ${x + 8} ${y - 8} Q${x} ${y - 10} ${x - 8} ${y - 8} Z`} color="#c08457" o={0.6} />
        </g>
      ))}
      <Face skin={skin} shade={shade} />
      <Ink>
        <path d="M37 53 C35 32 46 22 60 22 C74 22 85 32 83 53 C81 47 78 44 74 45 C72 40 67 39 64 42 C61 38 55 38 52 42 C48 39 43 41 42 46 C39 46 38 49 37 53 Z" fill={hair} />
      </Ink>
      <Gloss d="M47 28 Q58 23 70 27 Q58 26 47 31 Z" color="#c08457" o={0.6} />
      <circle cx="37.5" cy="69" r="2.3" fill="#fbbf24" stroke={LINE} strokeWidth=".8" />
      <circle cx="82.5" cy="69" r="2.3" fill="#fbbf24" stroke={LINE} strokeWidth=".8" />
      <Brows color={hair} y={47} />
      <Eyes iris="#9a4a0e" glow="#ffc27a" id={id} />
      <Nose shade={shade} />
      <Blush y={69} strength={0.55} />
      <AnimeMouth y={74} />
    </g>
  );
}

function Blaze({ id }: { id: string }) {
  return (
    <g className="flicker">
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff4d1f" />
          <stop offset=".6" stopColor="#ff9f1c" />
          <stop offset="1" stopColor="#ffd84d" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="26" ry="5" fill="#000" opacity=".25" />
      <Ink w={1.4}>
        <path d="M60 6 C68 22 76 22 78 14 C92 32 96 50 92 72 C89 96 74 110 60 110 C46 110 30 98 28 74 C26 56 34 44 42 36 C42 46 46 50 50 48 C48 32 52 18 60 6 Z" fill={`url(#${id}-f)`} />
      </Ink>
      <path d="M60 52 C66 64 76 70 74 86 C72 97 66 102 60 102 C52 102 46 96 46 86 C46 75 54 70 60 52 Z" fill="#ffe7a0" opacity=".85" />
      <Gloss d="M38 58 Q36 70 41 82 Q38 70 42 60 Z" o={0.6} />
      <g className="eyes">
        <Eye cx={49.5} cy={73} iris="#c2410c" glow="#ffd84d" id={id} side="l" />
        <Eye cx={70.5} cy={73} iris="#c2410c" glow="#ffd84d" id={id} side="r" />
      </g>
      <Blush y={84} strength={0.7} />
      <AnimeMouth y={88} />
    </g>
  );
}

function Greta({ id }: { id: string }) {
  const skin = '#f6dccb';
  const shade = '#dcb39b';
  const hair = '#f1f0f8';
  const hairShade = '#b8b2d8';
  return (
    <g className="bob">
      {/* lab coat over a dark high collar */}
      <Body color="#f8fafc" shade="#cbd5e1">
        <path d="M44 89 C48 82 72 82 76 89 L72 99 L60 104 L48 99 Z" fill="#2e2448" />
        <path d="M44 89 L38 121 M76 89 L82 121" fill="none" />
        <rect x="83" y="103" width="11" height="8" rx="2" fill="#e2e8f0" />
        <path d="M86 101 V107 M90 101 V107" stroke="#3b82f6" strokeWidth="1.8" />
      </Body>
      {/* white-lavender hair: spiky crown, low bun at the back */}
      <Ink>
        <circle cx="86" cy="40" r="9" fill={hair} />
        <path d="M33 58 C29 40 34 26 44 20 L40 12 L50 17 L54 8 L60 16 L68 7 L70 17 L80 12 L77 21 C86 28 91 42 87 58 L84 72 L36 72 Z" fill={hair} />
      </Ink>
      <Face skin={skin} shade={shade} ears />
      <Ink>
        <path d="M35 56 C33 36 44 24 60 24 C76 24 87 36 85 56 L82 46 L79 53 L76 41 L71 49 L69 37 L64 47 L60 35 L56 47 L51 38 L49 49 L44 41 L41 53 L38 46 Z" fill={hair} />
      </Ink>
      <Gloss d="M44 30 L52 25 L62 26 L70 31 L64 29 L54 29 L46 33 Z" color={hairShade} o={0.9} />
      <Strands d="M48 32 L51 40 M58 28 L60 36 M68 30 L70 40" o={0.35} />
      <Eyes iris="#38bdf8" glow="#cffafe" id={id} />
      {/* thin rectangular glasses */}
      <rect x="41.5" y="53" width="16" height="12.5" rx="3.5" stroke="#334155" strokeWidth="1.4" fill="#e0f2fe" fillOpacity=".12" />
      <rect x="62.5" y="53" width="16" height="12.5" rx="3.5" stroke="#334155" strokeWidth="1.4" fill="#e0f2fe" fillOpacity=".12" />
      <path d="M57.5 58 H62.5" stroke="#334155" strokeWidth="1.4" />
      <path d="M44 56 l3 -2 M65 56 l3 -2" stroke="#fff" strokeOpacity=".85" strokeWidth="1.1" strokeLinecap="round" />
      <Nose shade={shade} />
      <Blush y={69} strength={0.35} />
      <AnimeMouth y={74} smile={false} />
    </g>
  );
}

function Mei({ id }: { id: string }) {
  const skin = '#f8dcc4';
  const shade = '#e3b590';
  const hair = '#173b38';
  const hairLight = '#2f7a6c';
  return (
    <g className="bob">
      {/* long straight back hair */}
      <Ink>
        <path d="M33 54 C31 29 45 17 60 17 C75 17 89 29 87 54 L89 100 L31 100 Z" fill={hair} />
      </Ink>
      {/* green crossed-collar top */}
      <Body color="#4f9a5b" shade="#2f6b3a">
        <path d="M48 89 L60 104 L72 89" fill="#dbe7d3" />
        <path d="M48 89 L66 108 L72 103 L56 89 Z" fill="#6fb37a" />
        <path d="M72 89 L60 104" fill="none" />
      </Body>
      <Face skin={skin} shade={shade} ears />
      {/* blunt bangs with strand gaps */}
      <Ink>
        <path d="M35 56 C34 30 46 21 60 21 C74 21 86 30 85 56 L82 54 L80.5 51 L79 54 L74 53.4 L72.6 50 L71 53.2 L64 53 L62.8 49.6 L61.4 53 L55 53 L53.6 49.8 L52.2 53.2 L46 53.4 L44.6 50 L43.2 54 L39 54 Z" fill={hair} />
      </Ink>
      <Gloss d="M42 30 L56 24 L72 25 L80 31 L70 28 L56 28 L45 34 Z" color={hairLight} o={0.9} />
      <Strands d="M44.6 34 L44.6 50 M53.6 29 L53.6 49.8 M62.8 28 L62.8 49.6 M72.6 31 L72.6 50 M80.5 38 L80.5 51" o={0.6} />
      {/* side locks tied with beads */}
      <Ink>
        <path d="M37 54 C35 68 37 82 41 96 L46 95 C43 82 42 68 43 55 Z M83 54 C85 68 83 82 79 96 L74 95 C77 82 78 68 77 55 Z" fill={hair} />
        <circle cx="43" cy="88" r="2.6" fill="#c0394b" />
        <circle cx="77" cy="88" r="2.6" fill="#c0394b" />
        <circle cx="43.6" cy="99" r="2.6" fill="#2a9fb0" />
        <circle cx="76.4" cy="99" r="2.6" fill="#2a9fb0" />
      </Ink>
      {/* little blue ribbon */}
      <Ink w={0.9}>
        <path d="M70 22 L76 16 L78 22 L84 20 L79 26 Z" fill="#7aa7ff" />
      </Ink>
      <Eyes iris="#4c3fd6" glow="#8ad8ff" id={id} />
      <Freckles />
      <Nose shade={shade} />
      <Blush y={69} strength={0.45} />
      <AnimeMouth y={74} smile={false} />
    </g>
  );
}

function Maddie({ id }: { id: string }) {
  const skin = '#fadfcf';
  const shade = '#ebbca2';
  const hair = '#f6c945';
  const hairShade = '#d9a21f';
  return (
    <g className="bob">
      {/* long twin tails */}
      <Ink>
        <path d="M34 34 C14 40 8 70 14 112 C18 96 22 84 30 76 C24 92 24 104 26 116 C32 92 36 70 38 52 Z" fill={hair} />
        <path d="M86 34 C106 40 112 70 106 112 C102 96 98 84 90 76 C96 92 96 104 94 116 C88 92 84 70 82 52 Z" fill={hair} />
      </Ink>
      <Gloss d="M20 56 Q18 74 20 94 Q22 74 26 58 Z" o={0.5} />
      <Gloss d="M100 56 Q102 74 100 94 Q98 74 94 58 Z" o={0.5} />
      {/* white shirt, tie, jacket */}
      <Body color="#1e3a8a" shade="#172554">
        <path d="M48 89 L60 104 L72 89 Z" fill="#f8fafc" />
        <path d="M58 92 L62 92 L63 106 L60 110 L57 106 Z" fill="#38bdf8" />
      </Body>
      <Ink>
        <path d="M34 56 C32 32 46 21 60 21 C74 21 88 32 86 56 L84 68 L36 68 Z" fill={hairShade} />
      </Ink>
      <Face skin={skin} shade={shade} />
      {/* bangs, swept with a long strand between the eyes */}
      <Ink>
        <path d="M35 56 C33 31 47 20 61 20 C76 20 87 31 85 55 L81 46 L78 54 L74 41 L69 50 L64 38 L61 52 L59 61 L57 50 L53 39 L49 51 L44 42 L41 54 L38 47 Z" fill={hair} />
      </Ink>
      <Gloss d="M44 30 L56 24 L70 25 L78 31 L68 28 L56 28 L46 34 Z" o={0.55} />
      <Strands d="M50 28 L49 44 M58 26 L58 42 M68 28 L70 44" o={0.4} />
      {/* headset with mic */}
      <Ink>
        <path d="M33 50 C33 26 87 26 87 50" stroke="#334155" strokeWidth="2.6" fill="none" />
        <rect x="29" y="48" width="8" height="14" rx="3" fill="#334155" />
        <rect x="83" y="48" width="8" height="14" rx="3" fill="#334155" />
        <path d="M33 62 Q36 74 48 76" stroke="#334155" strokeWidth="1.6" fill="none" />
        <circle cx="49" cy="76" r="2" fill="#ec4899" />
      </Ink>
      <rect x="85" y="51" width="2" height="8" rx="1" fill="#ec4899" />
      <Eyes iris="#2563eb" glow="#7dd3fc" id={id} />
      <Nose shade={shade} />
      <Blush y={69} strength={0.6} />
      <Mouth
        closed={<path d="M54 73.4 Q60 78.6 66 73.4" stroke={LINE} strokeWidth="1.7" fill="none" strokeLinecap="round" />}
        open={
          <>
            <path d="M53 72.6 Q60 71.6 67 72.6 Q65 81.6 60 81.6 Q55 81.6 53 72.6 Z" fill="#6e1626" stroke={LINE} strokeWidth="1" />
            <path d="M54 73 H66 L65.4 74.6 H54.6 Z" fill="#fff" />
            <ellipse cx="60" cy="79.2" rx="3" ry="1.4" fill="#ff8fa3" />
          </>
        }
      />
    </g>
  );
}

function Priya({ id }: { id: string }) {
  const skin = '#c38a66';
  const shade = '#9d6646';
  const hair = '#1c1412';
  return (
    <g className="bob">
      {/* long flowing back hair */}
      <Ink>
        <path d="M33 55 C30 27 46 17 61 17 C77 17 91 28 87 57 L94 110 C86 114 78 110 76 102 L76 66 L44 66 L44 102 C42 110 34 114 26 110 Z" fill={hair} />
      </Ink>
      <Body color="#059669" shade="#065f46">
        <path d="M44 91 C50 101 70 101 76 91" stroke="#fbbf24" strokeWidth="2.4" fill="none" />
        <circle cx="60" cy="100" r="2.4" fill="#fbbf24" />
      </Body>
      <Ink>
        <path d="M43 89 L44 108 C38 112 30 110 26 106 L32 89 Z M77 89 L76 108 C82 112 90 110 94 106 L88 89 Z" fill={hair} />
      </Ink>
      <Face skin={skin} shade={shade} />
      <Ink>
        <path d="M35 57 C34 30 47 21 61 21 C75 21 86 30 85 57 C82 47 75 39 64 36 L61 43 L58 36 C47 39 39 47 35 57 Z" fill={hair} />
        <path d="M36 53 C34 65 37 77 42 87 L46 85 C42 75 41 65 42 55 Z M84 53 C86 65 83 77 78 87 L74 85 C78 75 79 65 78 55 Z" fill={hair} />
      </Ink>
      <Gloss d="M42 34 Q50 25 58 25 Q50 29 44 37 Z M64 25 Q74 26 80 34 Q72 29 64 28 Z" color="#8a6a8f" o={0.8} />
      <circle cx="38" cy="70" r="2.3" fill="#fbbf24" stroke={LINE} strokeWidth=".8" />
      <circle cx="82" cy="70" r="2.3" fill="#fbbf24" stroke={LINE} strokeWidth=".8" />
      <Brows color={hair} y={47} />
      <Eyes iris="#7a3f12" glow="#f0b46a" id={id} />
      <Nose shade={shade} />
      <Blush y={69} strength={0.45} />
      <AnimeMouth y={74} />
    </g>
  );
}

const ART: Record<Who, (p: { id: string }) => ReactElement> = {
  ada: Ada,
  tunde: Tunde,
  zara: Zara,
  blaze: Blaze,
  greta: Greta,
  mei: Mei,
  maddie: Maddie,
  priya: Priya,
};

/**
 * A character saying something in a speech bubble. The text types itself out
 * while the mouth moves; tap the bubble to skip ahead.
 */
export function Say({ who, text, size = 72, mood, children }: { who: Who; text: string; size?: number; mood?: Mood; children?: ReactNode }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(text.length);
      return;
    }
    const t = setInterval(() => setShown((n) => (n >= text.length ? (clearInterval(t), n) : n + 1)), 22);
    return () => clearInterval(t);
  }, [text]);
  const talking = shown < text.length;

  return (
    <div className="say">
      <Character who={who} size={size} mood={mood ?? (talking ? 'talking' : 'idle')} />
      <div className="bubble" onClick={() => setShown(text.length)} style={{ ['--who' as string]: CAST[who].color }}>
        <div className="who">{CAST[who].name}</div>
        <div className="line">
          {text.slice(0, shown)}
          <span className="ghost">{text.slice(shown)}</span>
        </div>
        {children && !talking && <div className="bubble-actions">{children}</div>}
      </div>
    </div>
  );
}

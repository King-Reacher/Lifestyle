import { useEffect, useId, useState, type ReactElement, type ReactNode } from 'react';

export type Who = 'ada' | 'tunde' | 'zara' | 'blaze' | 'greta' | 'mei' | 'maddie' | 'priya';

export const CAST: Record<Who, { name: string; role: string; color: string }> = {
  ada: { name: 'Mama Ada', role: 'Wisdom & money', color: '#8b5cf6' },
  tunde: { name: 'Tunde', role: 'Study buddy', color: '#14b8a6' },
  zara: { name: 'Zara', role: 'Ledger keeper', color: '#ff7a45' },
  blaze: { name: 'Blaze', role: 'Streak keeper', color: '#ff9f1c' },
  greta: { name: 'Prof. Greta', role: 'Science · Germany', color: '#60a5fa' },
  mei: { name: 'Mei', role: 'Maths · China', color: '#f43f5e' },
  maddie: { name: 'Maddie', role: 'English · USA', color: '#38bdf8' },
  priya: { name: 'Priya', role: 'Biology · India', color: '#10b981' },
};

type Mood = 'idle' | 'talking' | 'cheer';

/**
 * An animated character. Blinks and bobs while idle, moves its mouth while
 * talking, and jumps when cheering. Respects reduced-motion settings via CSS.
 */
export function Character({ who, mood = 'idle', size = 88 }: { who: Who; mood?: Mood; size?: number }) {
  const id = useId().replace(/:/g, '');
  const Art = ART[who];
  return (
    <svg className={`char char-${who} ${mood}`} width={size} height={size} viewBox="0 0 120 120" aria-label={CAST[who].name} role="img">
      <Art id={id} />
    </svg>
  );
}

/** Two mouths; CSS swaps between them while talking. */
function Mouth({ closed, open }: { closed: ReactNode; open: ReactNode }) {
  return (
    <>
      <g className="m-closed">{closed}</g>
      <g className="m-open">{open}</g>
    </>
  );
}

const INK = '#1b1320';

function Ada(_: { id: string }) {
  const skin = '#8d5524';
  return (
    <g className="bob">
      {/* wrapper and shoulders */}
      <path d="M16 120 C20 94 38 84 60 84 C82 84 100 94 104 120 Z" fill="#7c3aed" />
      <path d="M40 120 L60 92 L80 120" fill="#f5b938" opacity=".9" />
      <circle cx="30" cy="108" r="2.5" fill="#f5b938" />
      <circle cx="90" cy="108" r="2.5" fill="#f5b938" />
      <rect x="51" y="72" width="18" height="16" rx="6" fill="#7a4a1f" />
      {/* head */}
      <ellipse cx="60" cy="58" rx="24" ry="26" fill={skin} />
      <circle cx="36" cy="68" r="3.4" fill="#f5b938" />
      <circle cx="84" cy="68" r="3.4" fill="#f5b938" />
      {/* gele */}
      <path d="M29 52 C22 24 46 6 62 14 C80 4 104 22 92 50 C82 40 72 36 60 38 C48 36 38 42 29 52 Z" fill="#7c3aed" />
      <path d="M36 40 C48 28 72 26 86 36" stroke="#f5b938" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M62 14 C70 20 74 10 84 12" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* brows, glasses, eyes */}
      <path d="M43 48 Q50 45 56 48 M64 48 Q70 45 77 48" stroke="#3b2414" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <g className="eyes">
        <circle cx="50" cy="57" r="2.6" fill={INK} />
        <circle cx="70" cy="57" r="2.6" fill={INK} />
      </g>
      <circle cx="50" cy="57" r="8" stroke="#f5b938" strokeWidth="2" fill="#fff" fillOpacity=".08" />
      <circle cx="70" cy="57" r="8" stroke="#f5b938" strokeWidth="2" fill="#fff" fillOpacity=".08" />
      <path d="M58 57 H62" stroke="#f5b938" strokeWidth="2" />
      <circle cx="44" cy="68" r="4" fill="#e07a5f" opacity=".35" />
      <circle cx="76" cy="68" r="4" fill="#e07a5f" opacity=".35" />
      <path d="M45 74 Q47 76 46 78 M75 74 Q73 76 74 78" stroke="#6b3f1a" strokeWidth="1.2" fill="none" />
      <Mouth
        closed={<path d="M52 72 Q60 79 68 72" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
        open={
          <>
            <path d="M52 71 Q60 84 68 71 Z" fill="#5a1e1e" />
            <path d="M55 72 H65" stroke="#fff" strokeWidth="2" />
          </>
        }
      />
    </g>
  );
}

function Tunde(_: { id: string }) {
  const skin = '#6b4226';
  return (
    <g className="bob">
      <path d="M14 120 C18 92 38 82 60 82 C82 82 102 92 106 120 Z" fill="#14b8a6" />
      <path d="M38 88 C44 100 76 100 82 88" stroke="#0f766e" strokeWidth="4" fill="none" />
      <path d="M52 96 V110 M68 96 V110" stroke="#ecfeff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="51" y="70" width="18" height="16" rx="6" fill="#5a3620" />
      <ellipse cx="36" cy="58" rx="5" ry="7" fill={skin} />
      <ellipse cx="84" cy="58" rx="5" ry="7" fill={skin} />
      <ellipse cx="60" cy="56" rx="24" ry="26" fill={skin} />
      {/* flat-top hair */}
      <path d="M36 50 C35 30 42 24 60 24 C78 24 85 30 84 50 C80 42 74 40 60 40 C46 40 40 42 36 50 Z" fill="#141010" />
      <path d="M44 46 L54 44 M66 44 L76 46" stroke="#141010" strokeWidth="3.4" strokeLinecap="round" />
      <g className="eyes">
        <ellipse cx="50" cy="55" rx="5.4" ry="6" fill="#fff" />
        <ellipse cx="70" cy="55" rx="5.4" ry="6" fill="#fff" />
        <circle cx="51" cy="56" r="3" fill={INK} />
        <circle cx="71" cy="56" r="3" fill={INK} />
        <circle cx="52" cy="55" r="1" fill="#fff" />
        <circle cx="72" cy="55" r="1" fill="#fff" />
      </g>
      <Mouth
        closed={<path d="M49 69 Q60 80 71 69" stroke={INK} strokeWidth="2.8" fill="none" strokeLinecap="round" />}
        open={
          <>
            <path d="M48 68 Q60 86 72 68 Z" fill="#4a1414" />
            <path d="M51 69 H69 V72 H51 Z" fill="#fff" />
            <ellipse cx="60" cy="78" rx="5" ry="2.4" fill="#e85d75" />
          </>
        }
      />
    </g>
  );
}

function Zara(_: { id: string }) {
  const skin = '#a0673a';
  return (
    <g className="bob">
      <path d="M16 120 C20 94 38 84 60 84 C82 84 100 94 104 120 Z" fill="#ff7a45" />
      <path d="M34 92 C40 80 80 80 86 92" stroke="#f5b938" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="28" y="86" width="10" height="14" rx="4" fill="#f5b938" />
      <rect x="82" y="86" width="10" height="14" rx="4" fill="#f5b938" />
      <rect x="51" y="72" width="18" height="14" rx="6" fill="#8a5530" />
      {/* afro puffs */}
      <circle cx="34" cy="30" r="14" fill="#2a1a12" />
      <circle cx="86" cy="30" r="14" fill="#2a1a12" />
      <ellipse cx="60" cy="58" rx="23" ry="25" fill={skin} />
      <path d="M37 52 C36 32 46 28 60 28 C74 28 84 32 83 52 C78 42 70 38 60 38 C50 38 42 42 37 52 Z" fill="#2a1a12" />
      <circle cx="37" cy="70" r="2.6" fill="#f5b938" />
      <circle cx="83" cy="70" r="2.6" fill="#f5b938" />
      <g className="eyes">
        <ellipse cx="50" cy="57" rx="5" ry="5.6" fill="#fff" />
        <ellipse cx="70" cy="57" rx="5" ry="5.6" fill="#fff" />
        <circle cx="51" cy="58" r="2.8" fill={INK} />
        <circle cx="71" cy="58" r="2.8" fill={INK} />
        <circle cx="52" cy="57" r="0.9" fill="#fff" />
        <circle cx="72" cy="57" r="0.9" fill="#fff" />
      </g>
      <path d="M44 51 L47 49 M73 49 L76 51" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="44" cy="67" r="3.6" fill="#ff8fa3" opacity=".35" />
      <circle cx="76" cy="67" r="3.6" fill="#ff8fa3" opacity=".35" />
      <Mouth
        closed={<path d="M53 71 Q60 77 67 71" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        open={<ellipse cx="60" cy="73" rx="5" ry="4.4" fill="#5a1e1e" />}
      />
    </g>
  );
}

function Blaze({ id }: { id: string }) {
  return (
    <g className="flicker">
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff5f1f" />
          <stop offset="1" stopColor="#ffc93c" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="26" ry="5" fill="#000" opacity=".25" />
      <path d="M60 8 C72 30 94 42 92 72 C90 98 74 110 60 110 C46 110 28 98 28 72 C28 54 40 46 46 28 C50 44 58 44 60 8 Z" fill={`url(#${id}-f)`} />
      <path d="M60 52 C66 64 76 70 74 84 C72 96 66 100 60 100 C52 100 46 94 46 84 C46 74 54 70 60 52 Z" fill="#ffe28a" opacity=".85" />
      <g className="eyes">
        <ellipse cx="50" cy="74" rx="5" ry="6" fill="#fff" />
        <ellipse cx="70" cy="74" rx="5" ry="6" fill="#fff" />
        <circle cx="51" cy="75" r="3" fill={INK} />
        <circle cx="71" cy="75" r="3" fill={INK} />
      </g>
      <Mouth
        closed={<path d="M53 87 Q60 93 67 87" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
        open={<path d="M52 86 Q60 98 68 86 Z" fill="#7a1d0c" />}
      />
    </g>
  );
}

function Greta(_: { id: string }) {
  const skin = '#f3d2b8';
  return (
    <g className="bob">
      {/* lab coat over a blue blouse */}
      <path d="M14 120 C18 92 38 82 60 82 C82 82 102 92 106 120 Z" fill="#f8fafc" />
      <path d="M48 84 L60 104 L72 84 Z" fill="#3b82f6" />
      <path d="M48 84 L40 120 M72 84 L80 120" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="76" y="100" width="12" height="8" rx="2" fill="#cbd5e1" />
      <path d="M79 98 V104" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <rect x="51" y="70" width="18" height="16" rx="6" fill="#e6bfa2" />
      {/* silver hair with a bun */}
      <circle cx="60" cy="22" r="11" fill="#cbd5e1" />
      <ellipse cx="60" cy="56" rx="24" ry="26" fill="#cbd5e1" />
      <ellipse cx="60" cy="60" rx="21" ry="23" fill={skin} />
      <path d="M38 52 C40 36 50 32 60 32 C72 32 82 38 82 52 C76 42 66 40 60 42 C52 40 44 44 38 52 Z" fill="#e2e8f0" />
      <g className="eyes">
        <circle cx="51" cy="60" r="2.4" fill="#1e3a8a" />
        <circle cx="69" cy="60" r="2.4" fill="#1e3a8a" />
      </g>
      <rect x="43" y="54" width="15" height="11" rx="4" stroke="#334155" strokeWidth="2" fill="#fff" fillOpacity=".1" />
      <rect x="62" y="54" width="15" height="11" rx="4" stroke="#334155" strokeWidth="2" fill="#fff" fillOpacity=".1" />
      <path d="M58 59 H62" stroke="#334155" strokeWidth="2" />
      <path d="M45 50 Q51 47 57 50 M63 50 Q69 47 75 50" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="46" cy="70" r="3.5" fill="#f9a8a8" opacity=".45" />
      <circle cx="74" cy="70" r="3.5" fill="#f9a8a8" opacity=".45" />
      <Mouth
        closed={<path d="M53 74 Q60 79 67 74" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        open={<ellipse cx="60" cy="75" rx="4.6" ry="4" fill="#7f1d1d" />}
      />
    </g>
  );
}

function Mei(_: { id: string }) {
  const skin = '#f1c9a5';
  return (
    <g className="bob">
      <path d="M16 120 C20 94 38 84 60 84 C82 84 100 94 104 120 Z" fill="#f43f5e" />
      <path d="M52 84 L60 94 L68 84" stroke="#fde68a" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <rect x="51" y="72" width="18" height="14" rx="6" fill="#e0b18c" />
      {/* black bob with bangs */}
      <path d="M33 62 C30 30 46 22 60 22 C76 22 90 30 87 62 L87 80 C84 84 80 84 78 80 L78 58 L42 58 L42 80 C40 84 36 84 33 80 Z" fill="#111827" />
      <ellipse cx="60" cy="60" rx="21" ry="23" fill={skin} />
      <path d="M39 52 C40 36 50 32 60 32 C70 32 80 36 81 52 C76 46 70 48 66 44 C62 48 56 48 52 44 C48 48 42 46 39 52 Z" fill="#111827" />
      <g className="eyes">
        <ellipse cx="51" cy="61" rx="3.6" ry="3" fill={INK} />
        <ellipse cx="69" cy="61" rx="3.6" ry="3" fill={INK} />
        <circle cx="52" cy="60" r="0.9" fill="#fff" />
        <circle cx="70" cy="60" r="0.9" fill="#fff" />
      </g>
      <circle cx="45" cy="69" r="3.6" fill="#fb7185" opacity=".35" />
      <circle cx="75" cy="69" r="3.6" fill="#fb7185" opacity=".35" />
      <Mouth
        closed={<path d="M54 73 Q60 78 66 73" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        open={<path d="M53 72 Q60 82 67 72 Z" fill="#881337" />}
      />
    </g>
  );
}

function Maddie(_: { id: string }) {
  const skin = '#f7d7c4';
  return (
    <g className="bob">
      {/* varsity jacket */}
      <path d="M14 120 C18 92 38 82 60 82 C82 82 102 92 106 120 Z" fill="#1e3a8a" />
      <path d="M50 84 L60 98 L70 84" fill="#f8fafc" />
      <path d="M18 112 C22 98 30 92 38 90 M102 112 C98 98 90 92 82 90" stroke="#ef4444" strokeWidth="4" fill="none" />
      <rect x="51" y="70" width="18" height="16" rx="6" fill="#ecc3ab" />
      {/* blonde high ponytail */}
      <path d="M78 26 C96 24 102 44 94 64 C90 52 86 40 76 34 Z" fill="#facc15" />
      <ellipse cx="60" cy="56" rx="24" ry="26" fill="#facc15" />
      <ellipse cx="60" cy="60" rx="21" ry="23" fill={skin} />
      <path d="M38 54 C38 36 50 30 62 30 C74 30 84 38 82 52 C74 42 60 38 46 44 Z" fill="#fde047" />
      <circle cx="76" cy="30" r="3" fill="#ef4444" />
      <g className="eyes">
        <ellipse cx="51" cy="61" rx="4.4" ry="5" fill="#fff" />
        <ellipse cx="69" cy="61" rx="4.4" ry="5" fill="#fff" />
        <circle cx="51.5" cy="62" r="2.6" fill="#2563eb" />
        <circle cx="69.5" cy="62" r="2.6" fill="#2563eb" />
        <circle cx="51.5" cy="62" r="1.2" fill={INK} />
        <circle cx="69.5" cy="62" r="1.2" fill={INK} />
      </g>
      <path d="M53 66 L54 66 M66 66 L67 66 M58 67 L59 67" stroke="#d97757" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="45" cy="70" r="3.6" fill="#fb7185" opacity=".4" />
      <circle cx="75" cy="70" r="3.6" fill="#fb7185" opacity=".4" />
      <Mouth
        closed={<path d="M52 74 Q60 81 68 74" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
        open={
          <>
            <path d="M51 73 Q60 86 69 73 Z" fill="#7f1d1d" />
            <path d="M54 74 H66" stroke="#fff" strokeWidth="2" />
          </>
        }
      />
    </g>
  );
}

function Priya(_: { id: string }) {
  const skin = '#b9785a';
  return (
    <g className="bob">
      <path d="M16 120 C20 94 38 84 60 84 C82 84 100 94 104 120 Z" fill="#059669" />
      <path d="M44 86 C50 96 70 96 76 86" stroke="#fbbf24" strokeWidth="3" fill="none" />
      <rect x="51" y="72" width="18" height="14" rx="6" fill="#a2664a" />
      {/* long dark hair with a side part */}
      <path d="M34 60 C30 28 48 20 62 20 C78 20 90 30 86 60 L90 104 C84 108 78 104 76 98 L76 58 L44 58 L44 98 C42 104 36 108 30 104 Z" fill="#1c1917" />
      <ellipse cx="60" cy="60" rx="21" ry="23" fill={skin} />
      <path d="M39 54 C42 38 52 32 66 33 C74 34 80 40 81 50 C72 44 62 38 52 42 C46 44 42 48 39 54 Z" fill="#1c1917" />
      <circle cx="39" cy="70" r="2.6" fill="#fbbf24" />
      <circle cx="81" cy="70" r="2.6" fill="#fbbf24" />
      <g className="eyes">
        <ellipse cx="51" cy="61" rx="4.6" ry="5" fill="#fff" />
        <ellipse cx="69" cy="61" rx="4.6" ry="5" fill="#fff" />
        <circle cx="51.5" cy="62" r="2.8" fill="#3f2a1d" />
        <circle cx="69.5" cy="62" r="2.8" fill="#3f2a1d" />
        <circle cx="52.5" cy="61" r="0.9" fill="#fff" />
        <circle cx="70.5" cy="61" r="0.9" fill="#fff" />
      </g>
      <path d="M45 54 Q51 51 56 54 M64 54 Q69 51 75 54" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Mouth
        closed={<path d="M53 73 Q60 79 67 73" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        open={<ellipse cx="60" cy="74" rx="4.6" ry="4.2" fill="#6b1d1d" />}
      />
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

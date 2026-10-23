import { useRef, useState, type KeyboardEvent } from 'react';
import { haptic } from '../lib/telegram';
import { suggest, tokenize } from './complete';

const KEYS = ['{', '}', '(', ')', '[', ']', ';', '=', '"', "'", '`', '+', '<', '>', '.', ','];
const PAIRS: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'", '`': '`' };

/**
 * Textarea over a coloured copy of the code. The ghost suggestion sits in the
 * coloured layer right after the caret; Tab or the Accept button takes it.
 */
export function CodeEditor({ value, onChange, solution, minRows = 8 }: { value: string; onChange: (v: string) => void; solution?: string; minRows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const layer = useRef<HTMLPreElement>(null);
  const [caret, setCaret] = useState(value.length);
  const [focused, setFocused] = useState(false);
  const ghost = focused ? suggest(value, caret, solution) : '';

  const setText = (next: string, pos: number) => {
    onChange(next);
    setCaret(pos);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const insert = (text: string, back = 0) => {
    const el = ref.current;
    const start = el?.selectionStart ?? caret;
    const end = el?.selectionEnd ?? caret;
    setText(value.slice(0, start) + text + value.slice(end), start + text.length - back);
  };

  const accept = () => {
    if (!ghost) return;
    haptic();
    insert(ghost);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (ghost) accept();
      else insert('  ');
    } else if (e.key === 'Enter') {
      // Keep the current indentation, and indent one more level after an opening brace.
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const line = value.slice(value.lastIndexOf('\n', start - 1) + 1, start);
      const indent = line.match(/^\s*/)![0] + (/[{([]\s*$/.test(line) ? '  ' : '');
      insert(`\n${indent}`);
    }
  };

  const syncScroll = () => {
    if (layer.current && ref.current) {
      layer.current.scrollTop = ref.current.scrollTop;
      layer.current.scrollLeft = ref.current.scrollLeft;
    }
  };

  const rows = Math.max(minRows, value.split('\n').length + 1);
  const before = value.slice(0, caret);
  const after = value.slice(caret);

  return (
    <div className="code-editor">
      <div className="code-wrap" style={{ height: `${rows * 1.5 + 1.4}em` }}>
        <pre className="code-layer" ref={layer} aria-hidden>
          {tokenize(before).map((t, i) => (
            <span key={`b${i}`} className={`tok-${t.kind}`}>
              {t.text}
            </span>
          ))}
          {ghost && <span className="ghost-text">{ghost}</span>}
          {tokenize(after).map((t, i) => (
            <span key={`a${i}`} className={`tok-${t.kind}`}>
              {t.text}
            </span>
          ))}
          {'\n'}
        </pre>
        <textarea
          ref={ref}
          className="code-input"
          value={value}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setCaret(e.target.selectionStart);
          }}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyDown={onKey}
          onScroll={syncScroll}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
      </div>
      <div className="code-keys">
        <button className={`code-key accept ${ghost ? 'on' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={accept} disabled={!ghost}>
          ⇥ Accept
        </button>
        {KEYS.map((k) => (
          <button key={k} className="code-key" onMouseDown={(e) => e.preventDefault()} onClick={() => (PAIRS[k] ? insert(k + PAIRS[k], 1) : insert(k))}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

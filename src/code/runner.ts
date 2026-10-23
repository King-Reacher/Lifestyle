export interface Check {
  /** An expression evaluated after your code, e.g. "square(4)". */
  call: string;
  expect: unknown;
}

export interface CheckResult {
  call: string;
  ok: boolean;
  got: string;
  expect: string;
}

export interface RunResult {
  output: string[];
  error?: string;
  results: CheckResult[];
}

/**
 * Runs code with a captured console and evaluates the checks in the same scope.
 * Self-contained on purpose: its source is copied into a Web Worker, so it must
 * not use anything from outside its own body.
 */
export function evaluate(code: string, checks: Check[] = []): RunResult {
  const show = (v: unknown): string => {
    if (typeof v === 'string') return v;
    if (v === undefined) return 'undefined';
    if (typeof v === 'function') return '[function]';
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };
  const output: string[] = [];
  const fakeConsole = {
    log: (...a: unknown[]) => {
      if (output.length < 500) output.push(a.map(show).join(' '));
    },
  };
  const probes = checks.map((c) => `(() => { try { return { ok: true, v: (${c.call}) }; } catch (e) { return { ok: false, v: String(e) }; } })()`);
  try {
    const run = new Function('console', `"use strict";\n${code}\n;return [${probes.join(',')}];`);
    const values = run(fakeConsole) as { ok: boolean; v: unknown }[];
    const results = checks.map((c, i) => {
      const got = values[i];
      const ok = got.ok && JSON.stringify(got.v) === JSON.stringify(c.expect);
      return { call: c.call, ok, got: got.ok ? show(got.v) : got.v as string, expect: show(c.expect) };
    });
    return { output, results };
  } catch (e) {
    const err = e as Error;
    return { output, error: `${err.name}: ${err.message}`, results: checks.map((c) => ({ call: c.call, ok: false, got: 'not run', expect: show(c.expect) })) };
  }
}

const WORKER_SOURCE = `self.onmessage = (e) => { const evaluate = ${evaluate.toString()}; self.postMessage(evaluate(e.data.code, e.data.checks)); };`;

/** Run in a Web Worker so an infinite loop can be stopped; falls back to inline where workers don't exist. */
export function run(code: string, checks: Check[] = [], timeoutMs = 2000): Promise<RunResult> {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined') return Promise.resolve(evaluate(code, checks));
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
    const worker = new Worker(url);
    const done = (r: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(
      () => done({ output: [], error: `Stopped after ${timeoutMs / 1000}s. Is there a loop that never ends?`, results: checks.map((c) => ({ call: c.call, ok: false, got: 'timed out', expect: JSON.stringify(c.expect) })) }),
      timeoutMs,
    );
    worker.onmessage = (e) => done(e.data as RunResult);
    worker.onerror = (e) => {
      e.preventDefault();
      done({ output: [], error: e.message, results: [] });
    };
    worker.postMessage({ code, checks });
  });
}

/** Passing means no error, the expected console output (if any) and every check true. */
export function passed(r: RunResult, expectedOutput?: string[]): boolean {
  if (r.error) return false;
  if (expectedOutput && (r.output.length !== expectedOutput.length || r.output.some((line, i) => line.trim() !== expectedOutput[i].trim()))) return false;
  return r.results.every((x) => x.ok);
}

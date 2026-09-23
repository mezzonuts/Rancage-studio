import type { ASTNode, CellValue, EvalContext } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CV = CellValue | undefined;

// ── Cell reference helpers ───────────────────────────────────
function colToIndex(col: string): number {
  let idx = 0;
  for (let i = 0; i < col.length; i++) idx = idx * 26 + (col.charCodeAt(i) - 64);
  return idx - 1;
}
function indexToCol(idx: number): string {
  let r = '',
    n = idx;
  while (n >= 0) {
    r = String.fromCharCode(65 + (n % 26)) + r;
    n = Math.floor(n / 26) - 1;
  }
  return r;
}
function parseRef(ref: string): { col: number; row: number } {
  const m = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!m) throw new Error(`Invalid ref: ${ref}`);
  return { col: colToIndex(m[1]!.toUpperCase()), row: Number(m[2]) - 1 };
}
function refKey(col: number, row: number): string {
  return `${indexToCol(col)}${row + 1}`;
}
function expandRange(start: string, end: string): string[] {
  const s = parseRef(start),
    e = parseRef(end);
  const refs: string[] = [];
  for (let r = Math.min(s.row, e.row); r <= Math.max(s.row, e.row); r++)
    for (let c = Math.min(s.col, e.col); c <= Math.max(s.col, e.col); c++) refs.push(refKey(c, r));
  return refs;
}
function toNumber(v: CellValue | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  return 0;
}
function toBool(v: CellValue): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v !== '';
  return false;
}
function matchCriteria(value: CellValue, criteria: CellValue): boolean {
  if (criteria === null || criteria === undefined) return value === criteria;
  const s = String(criteria);
  if (s.startsWith('>=')) return toNumber(value) >= toNumber(s.slice(2));
  if (s.startsWith('<=')) return toNumber(value) <= toNumber(s.slice(2));
  if (s.startsWith('<>')) return String(value) !== s.slice(2);
  if (s.startsWith('>')) return toNumber(value) > toNumber(s.slice(1));
  if (s.startsWith('<')) return toNumber(value) < toNumber(s.slice(1));
  return String(value) === s;
}

// ── Built-in functions ───────────────────────────────────────
const BUILTINS: Record<string, (args: CellValue[][], ctx: EvalContext) => CellValue> = {
  SUM: (args) => args.flat().reduce<number>((s, v) => s + toNumber(v), 0),
  AVERAGE: (args) => {
    const nums = args.flat().filter((v): v is number => typeof v === 'number');
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  },
  COUNT: (args) => args.flat().filter((v) => v !== null && v !== undefined && v !== '').length,
  COUNTA: (args) => args.flat().filter((v) => v !== null && v !== undefined).length,
  MIN: (args) => {
    const nums = args.flat().filter((v): v is number => typeof v === 'number');
    return nums.length ? Math.min(...nums) : 0;
  },
  MAX: (args) => {
    const nums = args.flat().filter((v): v is number => typeof v === 'number');
    return nums.length ? Math.max(...nums) : 0;
  },
  IF: (args) => {
    const cond = args[0]?.[0];
    return cond && toBool(cond) ? (args[1]?.[0] ?? true) : (args[2]?.[0] ?? false);
  },
  SUMIF: (args) => {
    const range = args[0] ?? [],
      criteria = args[1]?.[0],
      sumRange = args[2]?.length ? args[2] : range;
    let sum = 0;
    for (let i = 0; i < range.length; i++) {
      if (matchCriteria(range[i] ?? null, criteria ?? null)) sum += toNumber(sumRange[i]);
    }
    return sum;
  },
  COUNTIF: (args) => {
    const range = args[0] ?? [],
      criteria = args[1]?.[0];
    let count = 0;
    for (const v of range) {
      if (matchCriteria(v ?? null, criteria ?? null)) count++;
    }
    return count;
  },
  AVERAGEIF: (args) => {
    const range = args[0] ?? [],
      criteria = args[1]?.[0],
      avgRange = args[2]?.length ? args[2] : range;
    let sum = 0,
      count = 0;
    for (let i = 0; i < range.length; i++) {
      if (matchCriteria(range[i] ?? null, criteria ?? null)) {
        sum += toNumber(avgRange[i]);
        count++;
      }
    }
    return count ? sum / count : 0;
  },
  XLOOKUP: (args) => {
    const lookupVal = args[0]?.[0],
      lookupRange = args[1] ?? [],
      returnRange = args[2] ?? [];
    for (let i = 0; i < lookupRange.length; i++) {
      if (lookupRange[i] === lookupVal) return returnRange[i] ?? null;
    }
    return args[3]?.[0] ?? '#N/A';
  },
  ABS: (args) => Math.abs(toNumber(args[0]?.[0] ?? 0)),
  ROUND: (args) => {
    const n = toNumber(args[0]?.[0] ?? 0);
    const d = toNumber(args[1]?.[0] ?? 0);
    return Math.round(n * 10 ** d) / 10 ** d;
  },
  LEN: (args) => String(args[0]?.[0] ?? '').length,
  UPPER: (args) => String(args[0]?.[0] ?? '').toUpperCase(),
  LOWER: (args) => String(args[0]?.[0] ?? '').toLowerCase(),
  CONCATENATE: (args) =>
    args
      .flat()
      .map((v) => (v === null || v === undefined ? '' : String(v)))
      .join(''),
};

// ── Main evaluator ───────────────────────────────────────────
export function evaluate(node: ASTNode, ctx: EvalContext): CellValue {
  switch (node.type) {
    case 'number':
      return node.value;
    case 'string':
      return node.value;
    case 'boolean':
      return node.value;
    case 'cell':
      return ctx.getCell(node.ref);
    case 'range': {
      const vals = expandRange(node.start, node.end).map((r) => ctx.getCell(r));
      return vals.length === 1 ? vals[0]! : (vals as unknown as CellValue);
    }
    case 'unary': {
      const val = evaluate(node.operand, ctx);
      return node.op === '-' ? -toNumber(val) : toNumber(val);
    }
    case 'binary': {
      const l = evaluate(node.left, ctx),
        r = evaluate(node.right, ctx);
      switch (node.op) {
        case '+':
          return toNumber(l) + toNumber(r);
        case '-':
          return toNumber(l) - toNumber(r);
        case '*':
          return toNumber(l) * toNumber(r);
        case '/': {
          const d = toNumber(r);
          return d === 0 ? '#DIV/0!' : toNumber(l) / d;
        }
        case '&':
          return String(l ?? '') + String(r ?? '');
        case '=':
          return l === r;
        case '<>':
          return l !== r;
        case '<':
          return toNumber(l) < toNumber(r);
        case '>':
          return toNumber(l) > toNumber(r);
        case '<=':
          return toNumber(l) <= toNumber(r);
        case '>=':
          return toNumber(l) >= toNumber(r);
      }
      return null;
    }
    case 'func': {
      const fn = BUILTINS[node.name.toUpperCase()];
      if (!fn) throw new Error(`Unknown function: ${node.name}`);
      const argVals = node.args.map((a) => {
        const v = evaluate(a, ctx);
        return Array.isArray(v) ? v : [v];
      });
      return fn(argVals, ctx);
    }
  }
}

/** Extract cell references from AST for dependency tracking */
export function extractDeps(node: ASTNode): string[] {
  const deps = new Set<string>();
  function walk(n: ASTNode) {
    if (n.type === 'cell') deps.add(n.ref);
    else if (n.type === 'range') expandRange(n.start, n.end).forEach((r) => deps.add(r));
    else if (n.type === 'binary') {
      walk(n.left);
      walk(n.right);
    } else if (n.type === 'unary') walk(n.operand);
    else if (n.type === 'func') n.args.forEach(walk);
  }
  walk(node);
  return [...deps];
}

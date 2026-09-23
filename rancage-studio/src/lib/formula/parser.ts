import type { ASTNode, CellRef, RangeRef, FuncCall } from './types';

// ── Token Types ──────────────────────────────────────────────
type TT = 'num' | 'str' | 'bool' | 'id' | 'op' | '(' | ')' | ':' | ',' | 'eof';
interface Token {
  type: TT;
  value?: string | number | boolean;
}

// ── Tokenizer ────────────────────────────────────────────────
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i]!;
    if (c === ' ' || c === '\t') {
      i++;
      continue;
    }
    if (c === '"') {
      let s = '';
      i++;
      while (i < input.length && input[i] !== '"') {
        s += input[i];
        i++;
      }
      i++;
      tokens.push({ type: 'str', value: s });
      continue;
    }
    if ((c >= '0' && c <= '9') || (c === '.' && i + 1 < input.length && input[i + 1]! >= '0')) {
      let n = '';
      while (i < input.length && ((input[i]! >= '0' && input[i]! <= '9') || input[i] === '.')) {
        n += input[i];
        i++;
      }
      tokens.push({ type: 'num', value: Number(n) });
      continue;
    }
    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c === '_') {
      let id = '';
      while (i < input.length && /[A-Za-z0-9_.]/.test(input[i]!)) {
        id += input[i];
        i++;
      }
      tokens.push(
        id === 'TRUE'
          ? { type: 'bool', value: true }
          : id === 'FALSE'
            ? { type: 'bool', value: false }
            : { type: 'id', value: id }
      );
      continue;
    }
    if (c === '(') {
      tokens.push({ type: '(' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: ')' });
      i++;
      continue;
    }
    if (c === ':') {
      tokens.push({ type: ':' });
      i++;
      continue;
    }
    if (c === ',') {
      tokens.push({ type: ',' });
      i++;
      continue;
    }
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^' || c === '&') {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    if (c === '<' && i + 1 < input.length && input[i + 1] === '>') {
      tokens.push({ type: 'op', value: '<>' });
      i += 2;
      continue;
    }
    if (c === '<' && i + 1 < input.length && input[i + 1] === '=') {
      tokens.push({ type: 'op', value: '<=' });
      i += 2;
      continue;
    }
    if (c === '>' && i + 1 < input.length && input[i + 1] === '=') {
      tokens.push({ type: 'op', value: '>=' });
      i += 2;
      continue;
    }
    if (c === '=' || c === '<' || c === '>') {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    i++;
  }
  tokens.push({ type: 'eof' });
  return tokens;
}

// ── Parser (recursive descent) ──────────────────────────────
class Parser {
  private pos = 0;
  constructor(private t: Token[]) {}
  private peek(): Token {
    return this.t[this.pos] ?? { type: 'eof' };
  }
  private adv(): Token {
    const t = this.peek();
    this.pos++;
    return t;
  }
  private eat(type: TT): Token {
    const t = this.peek();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
    return this.adv();
  }

  parse(): ASTNode {
    const n = this.expr();
    if (this.peek().type !== 'eof') throw new Error(`Unexpected: ${JSON.stringify(this.peek())}`);
    return n;
  }

  private expr(): ASTNode {
    return this.cmp();
  }

  private cmp(): ASTNode {
    let l = this.concat();
    while (
      this.peek().type === 'op' &&
      ['=', '<>', '<', '>', '<=', '>='].includes(this.peek().value as string)
    ) {
      const op = this.adv().value as string as
        '+' | '-' | '*' | '/' | '=' | '<>' | '<' | '>' | '<=' | '>=';
      l = {
        type: 'binary',
        op: op as '+' | '-' | '*' | '/' | '&' | '=' | '<>' | '<' | '>' | '<=' | '>=',
        left: l,
        right: this.concat(),
      };
    }
    return l;
  }

  private concat(): ASTNode {
    let l = this.add();
    while (this.peek().type === 'op' && this.peek().value === '&') {
      this.adv();
      l = { type: 'binary', op: '&', left: l, right: this.add() };
    }
    return l;
  }

  private add(): ASTNode {
    let l = this.mul();
    while (this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.adv().value as '+' | '-';
      l = { type: 'binary', op, left: l, right: this.mul() };
    }
    return l;
  }

  private mul(): ASTNode {
    let l = this.unary();
    while (this.peek().type === 'op' && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.adv().value as '*' | '/';
      l = { type: 'binary', op, left: l, right: this.unary() };
    }
    return l;
  }

  private unary(): ASTNode {
    if (this.peek().type === 'op' && (this.peek().value === '-' || this.peek().value === '+')) {
      const op = this.adv().value as '-' | '+';
      return { type: 'unary', op, operand: this.unary() };
    }
    return this.primary();
  }

  private primary(): ASTNode {
    const t = this.peek();
    if (t.type === 'num') {
      this.adv();
      return { type: 'number', value: t.value as number };
    }
    if (t.type === 'str') {
      this.adv();
      return { type: 'string', value: t.value as string };
    }
    if (t.type === 'bool') {
      this.adv();
      return { type: 'boolean', value: t.value as boolean };
    }
    if (t.type === '(') {
      this.adv();
      const e = this.expr();
      this.eat(')');
      return e;
    }
    if (t.type === 'id') {
      this.adv();
      const name = t.value as string;
      if (this.peek().type === ':') {
        this.adv();
        return { type: 'range', start: name, end: this.eat('id').value as string } as RangeRef;
      }
      if (this.peek().type === '(') {
        this.adv();
        const args: ASTNode[] = [];
        if (this.peek().type !== ')') {
          args.push(this.expr());
          while (this.peek().type === ',') {
            this.adv();
            args.push(this.expr());
          }
        }
        this.eat(')');
        return { type: 'func', name, args } as FuncCall;
      }
      return { type: 'cell', ref: name } as CellRef;
    }
    throw new Error(`Unexpected: ${JSON.stringify(t)}`);
  }
}

export function parseFormula(input: string): ASTNode {
  const trimmed = input.startsWith('=') ? input.slice(1) : input;
  return new Parser(tokenize(trimmed)).parse();
}

import { describe, it, expect } from 'vitest';
import { parseFormula } from './parser';
import { evaluate, extractDeps } from './evaluator';
import type { EvalContext, CellValue } from './types';

function makeCtx(data: Record<string, CellValue>): EvalContext {
  return {
    getCell: (ref) => data[ref] ?? null,
    getRange: () => [],
  };
}

describe('parseFormula', () => {
  it('parses number literal', () => {
    const ast = parseFormula('=42');
    expect(ast.type).toBe('number');
  });

  it('parses binary expression', () => {
    const ast = parseFormula('=1+2');
    expect(ast.type).toBe('binary');
  });

  it('parses function call', () => {
    const ast = parseFormula('=SUM(A1:A5)');
    expect(ast.type).toBe('func');
  });

  it('parses cell reference', () => {
    const ast = parseFormula('=A1');
    expect(ast.type).toBe('cell');
  });

  it('parses comparison', () => {
    const ast = parseFormula('=A1>10');
    expect(ast.type).toBe('binary');
  });
});

describe('evaluate - arithmetic', () => {
  it('evaluates number', () => {
    const ast = parseFormula('=42');
    expect(evaluate(ast, makeCtx({}))).toBe(42);
  });

  it('evaluates addition', () => {
    expect(evaluate(parseFormula('=1+2'), makeCtx({}))).toBe(3);
  });

  it('evaluates multiplication precedence', () => {
    expect(evaluate(parseFormula('=2+3*4'), makeCtx({}))).toBe(14);
  });

  it('evaluates parentheses', () => {
    expect(evaluate(parseFormula('=(2+3)*4'), makeCtx({}))).toBe(20);
  });

  it('evaluates unary minus', () => {
    expect(evaluate(parseFormula('=-5'), makeCtx({}))).toBe(-5);
  });

  it('evaluates cell reference', () => {
    expect(evaluate(parseFormula('=A1'), makeCtx({ A1: 10 }))).toBe(10);
  });

  it('evaluates string concat', () => {
    expect(evaluate(parseFormula('="hello"&" "&"world"'), makeCtx({}))).toBe('hello world');
  });

  it('evaluates division by zero', () => {
    expect(evaluate(parseFormula('=10/0'), makeCtx({}))).toBe('#DIV/0!');
  });
});

describe('evaluate - functions', () => {
  const ctx = makeCtx({ A1: 10, A2: 20, A3: 30, A4: 'foo', A5: 40, B1: 100, B2: 200, B3: 300 });

  it('SUM', () => {
    expect(evaluate(parseFormula('=SUM(A1:A3)'), ctx)).toBe(60);
  });

  it('AVERAGE', () => {
    expect(evaluate(parseFormula('=AVERAGE(A1:A3)'), ctx)).toBe(20);
  });

  it('COUNT', () => {
    expect(evaluate(parseFormula('=COUNT(A1:A5)'), ctx)).toBe(5);
  });

  it('MIN', () => {
    expect(evaluate(parseFormula('=MIN(A1:A3)'), ctx)).toBe(10);
  });

  it('MAX', () => {
    expect(evaluate(parseFormula('=MAX(A1:A3)'), ctx)).toBe(30);
  });

  it('IF true', () => {
    expect(evaluate(parseFormula('=IF(1>0,"yes","no")'), ctx)).toBe('yes');
  });

  it('IF false', () => {
    expect(evaluate(parseFormula('=IF(1<0,"yes","no")'), ctx)).toBe('no');
  });

  it('SUMIF', () => {
    expect(evaluate(parseFormula('=SUMIF(A1:A3,">15",B1:B3)'), ctx)).toBe(500);
  });

  it('COUNTIF', () => {
    expect(evaluate(parseFormula('=COUNTIF(A1:A3,">15")'), ctx)).toBe(2);
  });

  it('XLOOKUP', () => {
    expect(evaluate(parseFormula('=XLOOKUP(20,A1:A3,B1:B3)'), ctx)).toBe(200);
  });
});

describe('evaluate - comparison', () => {
  const ctx = makeCtx({ A1: 5 });
  it('greater than', () => expect(evaluate(parseFormula('=A1>3'), ctx)).toBe(true));
  it('less than', () => expect(evaluate(parseFormula('=A1<3'), ctx)).toBe(false));
  it('equal', () => expect(evaluate(parseFormula('=A1=5'), ctx)).toBe(true));
  it('not equal', () => expect(evaluate(parseFormula('=A1<>5'), ctx)).toBe(false));
  it('gte', () => expect(evaluate(parseFormula('=A1>=5'), ctx)).toBe(true));
  it('lte', () => expect(evaluate(parseFormula('=A1<=4'), ctx)).toBe(false));
});

describe('extractDeps', () => {
  it('extracts from cell refs', () => {
    const ast = parseFormula('=A1+B2');
    expect(extractDeps(ast).sort()).toEqual(['A1', 'B2']);
  });

  it('extracts from range', () => {
    const ast = parseFormula('=SUM(A1:A3)');
    expect(extractDeps(ast).sort()).toEqual(['A1', 'A2', 'A3']);
  });

  it('deduplicates', () => {
    const ast = parseFormula('=A1+A1');
    expect(extractDeps(ast)).toEqual(['A1']);
  });
});

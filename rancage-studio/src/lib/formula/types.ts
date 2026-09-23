// ── Formula AST Types ────────────────────────────────────────

export type ASTNode =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | CellRef
  | RangeRef
  | BinaryOp
  | UnaryOp
  | FuncCall;

export interface NumberLiteral {
  type: 'number';
  value: number;
}
export interface StringLiteral {
  type: 'string';
  value: string;
}
export interface BooleanLiteral {
  type: 'boolean';
  value: boolean;
}

export interface CellRef {
  type: 'cell';
  ref: string;
} // e.g. "A1"
export interface RangeRef {
  type: 'range';
  start: string;
  end: string;
} // e.g. "A1:B10"

export interface BinaryOp {
  type: 'binary';
  op: '+' | '-' | '*' | '/' | '&' | '=' | '<>' | '<' | '>' | '<=' | '>=';
  left: ASTNode;
  right: ASTNode;
}
export interface UnaryOp {
  type: 'unary';
  op: '-' | '+';
  operand: ASTNode;
}

export interface FuncCall {
  type: 'func';
  name: string;
  args: ASTNode[];
}

// ── Evaluation context ───────────────────────────────────────
export type CellValue = string | number | boolean | null;

export interface EvalContext {
  getCell: (ref: string) => CellValue;
  getRange: (start: string, end: string) => CellValue[][];
}

// ── Dependency Graph ─────────────────────────────────────────
export interface DepNode {
  cell: string;
  formula: string;
  deps: Set<string>;
}

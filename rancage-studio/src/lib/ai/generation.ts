import { AIClient } from './adapter';
import type { AIAdapterConfig, AIMessage } from './types';
import { buildFormulaPrompt } from './prompts';
import { validateFormula, sanitizeFormulaResponse } from './validator';
import type { TableContext } from './context';
import type { ValidationResult } from './validator';

// ── Generation Result ────────────────────────────────────────
export interface FormulaGenerationResult {
  formula: string;
  validation: ValidationResult;
  raw: string;
}

// ── Undo/Redo Stack ──────────────────────────────────────────
export interface GridAction {
  type: 'set_cell' | 'batch';
  cell?: { row: number; col: number };
  oldValue: unknown;
  newValue: unknown;
}

export class UndoRedoStack {
  private undoStack: GridAction[] = [];
  private redoStack: GridAction[] = [];
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  push(action: GridAction): void {
    this.undoStack.push(action);
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(): GridAction | undefined {
    const action = this.undoStack.pop();
    if (action) this.redoStack.push(action);
    return action;
  }
  redo(): GridAction | undefined {
    const action = this.redoStack.pop();
    if (action) this.undoStack.push(action);
    return action;
  }

  pushRedo(action: GridAction): void {
    this.redoStack.push(action);
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  get undoCount(): number {
    return this.undoStack.length;
  }
  get redoCount(): number {
    return this.redoStack.length;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

// ── Formula Generator ────────────────────────────────────────
export class FormulaGenerator {
  private client: AIClient;

  constructor(config: AIAdapterConfig) {
    this.client = new AIClient(config);
  }

  async generate(naturalLanguage: string, table: TableContext): Promise<FormulaGenerationResult> {
    const messages: AIMessage[] = buildFormulaPrompt(naturalLanguage, table);
    const response = await this.client.complete(messages);
    const raw = response.content;
    const formula = sanitizeFormulaResponse(raw);
    const validation = validateFormula(formula);

    return { formula, validation, raw };
  }

  async generateWithValidation(
    naturalLanguage: string,
    table: TableContext
  ): Promise<FormulaGenerationResult> {
    const result = await this.generate(naturalLanguage, table);

    // If invalid, try once more with explicit instruction
    if (!result.validation.valid) {
      const retryMessages: AIMessage[] = [
        ...buildFormulaPrompt(naturalLanguage, table),
        {
          role: 'user',
          content: `Your previous formula had errors: ${result.validation.errors.join(', ')}. Please provide a corrected Excel formula.`,
        },
      ];
      const retry = await this.client.complete(retryMessages);
      const retryFormula = sanitizeFormulaResponse(retry.content);
      const retryValidation = validateFormula(retryFormula);

      if (
        retryValidation.valid ||
        retryValidation.errors.length < result.validation.errors.length
      ) {
        return { formula: retryFormula, validation: retryValidation, raw: retry.content };
      }
    }

    return result;
  }
}

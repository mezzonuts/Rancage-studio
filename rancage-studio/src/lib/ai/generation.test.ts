import { describe, it, expect } from 'vitest';
import { UndoRedoStack } from './generation';

describe('UndoRedoStack', () => {
  it('starts empty', () => {
    const stack = new UndoRedoStack();
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
    expect(stack.undoCount).toBe(0);
  });

  it('push and undo', () => {
    const stack = new UndoRedoStack();
    stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: null, newValue: 42 });
    expect(stack.canUndo).toBe(true);
    const action = stack.undo();
    expect(action?.newValue).toBe(42);
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(true); // undo pushed to redo
  });

  it('undo and redo', () => {
    const stack = new UndoRedoStack();
    stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: null, newValue: 1 });
    stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: 1, newValue: 2 });
    const action = stack.undo();
    expect(action?.newValue).toBe(2);
    expect(stack.canRedo).toBe(true);
    // redo pops from redo stack
    const redo = stack.redo();
    expect(redo?.newValue).toBe(2);
    expect(stack.canRedo).toBe(false);
  });

  it('push clears redo', () => {
    const stack = new UndoRedoStack();
    stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: null, newValue: 1 });
    stack.undo();
    stack.pushRedo({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: null, newValue: 1 });
    expect(stack.canRedo).toBe(true);
    stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: 1, newValue: 2 });
    expect(stack.canRedo).toBe(false);
  });

  it('respects max size', () => {
    const stack = new UndoRedoStack(3);
    for (let i = 0; i < 5; i++)
      stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: i, newValue: i + 1 });
    expect(stack.undoCount).toBe(3);
  });

  it('clear empties both stacks', () => {
    const stack = new UndoRedoStack();
    stack.push({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: null, newValue: 1 });
    stack.undo();
    stack.pushRedo({ type: 'set_cell', cell: { row: 0, col: 0 }, oldValue: null, newValue: 1 });
    stack.clear();
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
  });
});

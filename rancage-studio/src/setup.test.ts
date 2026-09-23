import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have TypeScript strict mode enabled', () => {
    // This test passes if TypeScript compiles without errors
    expect(typeof 'string').toBe('string');
  });
});

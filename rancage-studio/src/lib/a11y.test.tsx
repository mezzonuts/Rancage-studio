import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary, LiveRegion, useKeyboardNav } from './a11y';

describe('ErrorBoundary', () => {
  it('renders children normally', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('catches errors and shows fallback', () => {
    const Throwing = () => {
      throw new Error('boom');
    };
    render(
      <ErrorBoundary>
        <Throwing />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();
  });
});

describe('LiveRegion', () => {
  it('renders with aria-live', () => {
    render(<LiveRegion message="Updated" />);
    const region = screen.getByText('Updated');
    expect(region.getAttribute('aria-live')).toBe('polite');
  });
});

function TestComponent() {
  const [pressed, setPressed] = React.useState('');
  const { onKeyDown } = useKeyboardNav({
    'ctrl+z': () => setPressed('undo'),
    'ctrl+s': () => setPressed('save'),
  });
  return (
    <div onKeyDown={onKeyDown} tabIndex={0}>
      {pressed || 'idle'}
    </div>
  );
}

describe('useKeyboardNav', () => {
  it('responds to keyboard shortcuts', () => {
    render(<TestComponent />);
    const el = screen.getByText('idle');
    fireEvent.keyDown(el, { key: 'z', ctrlKey: true });
    expect(screen.getByText('undo')).toBeTruthy();
  });
});

/**
 * Task 30: Accessibility & Polish
 *
 * Keyboard navigation, ARIA helpers, error boundaries.
 */

'use client';

import React from 'react';

// ── Error Boundary ──────────────────────────────────────────
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 text-red-600">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 rounded bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// ── Keyboard Navigation Hook ────────────────────────────────
export function useKeyboardNav(handlers: Record<string, () => void>) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    const key = [e.ctrlKey && 'ctrl', e.shiftKey && 'shift', e.altKey && 'alt', e.key]
      .filter(Boolean)
      .join('+');
    if (handlers[key]) {
      e.preventDefault();
      handlers[key]();
    }
  };
  return { onKeyDown };
}

// ── Live Region for Announcements ───────────────────────────
export function LiveRegion({ message }: { message: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

// ── Focus Trap Hook ─────────────────────────────────────────
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    focusable[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [ref]);
}

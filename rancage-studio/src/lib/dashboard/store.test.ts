import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultDashboard, createWidget } from './types';
import { saveDashboard, loadDashboards, deleteDashboard, getDashboard } from './store';

beforeEach(() => {
  localStorage.clear();
});

describe('DashboardStore', () => {
  it('saves and loads dashboard', () => {
    const dash = createDefaultDashboard('Test');
    saveDashboard(dash);
    const loaded = loadDashboards();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.name).toBe('Test');
  });

  it('updates existing dashboard', () => {
    const dash = createDefaultDashboard('Test');
    saveDashboard(dash);
    dash.name = 'Updated';
    saveDashboard(dash);
    expect(loadDashboards()).toHaveLength(1);
    expect(getDashboard(dash.id)?.name).toBe('Updated');
  });

  it('deletes dashboard', () => {
    const dash = createDefaultDashboard('Test');
    saveDashboard(dash);
    deleteDashboard(dash.id);
    expect(loadDashboards()).toHaveLength(0);
  });

  it('returns undefined for missing id', () => {
    expect(getDashboard('nonexistent')).toBeUndefined();
  });

  it('creates widget with defaults', () => {
    const w = createWidget('bar', 'Sales', 'SELECT * FROM sales', { colSpan: 2 });
    expect(w.type).toBe('bar');
    expect(w.colSpan).toBe(2);
    expect(w.id).toBeTruthy();
  });
});

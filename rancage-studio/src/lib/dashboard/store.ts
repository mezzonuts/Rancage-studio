import type { DashboardState } from './types';

const STORAGE_KEY = 'rancage_dashboards';

export function loadDashboards(): DashboardState[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDashboards(dashboards: DashboardState[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

export function saveDashboard(dash: DashboardState): void {
  const all = loadDashboards();
  const idx = all.findIndex((d) => d.id === dash.id);
  const updated = { ...dash, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updated;
  else all.push(updated);
  saveDashboards(all);
}

export function deleteDashboard(id: string): void {
  saveDashboards(loadDashboards().filter((d) => d.id !== id));
}

export function getDashboard(id: string): DashboardState | undefined {
  return loadDashboards().find((d) => d.id === id);
}

# Ribbon Layout Fix — All 4 Issues

## Problems (all still present after previous attempt)

1. **Group collapse / too small** — Groups shrink unevenly, some too narrow
2. **Label overlap content** — Absolute-positioned labels overlap button content
3. **Uneven spacing** — Gap between groups inconsistent
4. **Horizontal scroll / cutoff** — Toolbar overflows viewport

## Root Cause

The previous fix added `flex-shrink: 0` + `min-width: fit-content` but these conflict with each other:
- `min-width: fit-content` makes groups as wide as their content → too wide on Font group (dropdowns ~150px), fine on Styles group (2 buttons ~80px)
- `flex-shrink: 0` prevents groups from shrinking → total width exceeds viewport → horizontal scroll
- `.ribbon-group-content` lost `flex: 1` → content doesn't fill height → label overlaps content when group is tall
- `padding-bottom: 18px` on `.ribbon-group` is wasted because `.ribbon-group-content` doesn't stretch

## Fix — CSS Only (single file: `rancage-studio/src/components/Ribbon.tsx`)

All changes are in the `<style>` block starting at line 932. No JSX changes needed.

### Change 1: `.ribbon-group` — allow shrink, consistent sizing

```css
/* BEFORE (current) */
.ribbon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
  padding-bottom: 18px;
  border-right: 1px solid var(--border-ribbon);
  position: relative;
  flex-shrink: 0;
  min-width: fit-content;
}

/* AFTER */
.ribbon-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 4px 10px 16px;
  border-right: 1px solid var(--border-ribbon);
  position: relative;
  flex-shrink: 1;
  min-width: 0;
}
```

Key changes:
- `align-items: stretch` — content fills width evenly
- `padding: 4px 10px 16px` — 16px bottom reserves space for label (replaces `padding-bottom: 18px`)
- `flex-shrink: 1` — groups CAN shrink to fit toolbar
- `min-width: 0` — allows shrinking below content width (needed for flex)

### Change 2: `.ribbon-group-content` — fill available space

```css
/* BEFORE (current) */
.ribbon-group-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

/* AFTER */
.ribbon-group-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-height: 0;
}
```

Key: `flex: 1` + `justify-content: center` — content fills height and centers horizontally within each group.

### Change 3: `.ribbon-group-label` — fix for stretch alignment

```css
/* BEFORE (current) */
.ribbon-group-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
  padding: 2px 0;
  border-top: 1px solid var(--border-light);
}

/* AFTER */
.ribbon-group-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-tertiary);
  padding: 3px 0 1px;
  border-top: 1px solid var(--border-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

Key: `white-space: nowrap` + `text-overflow: ellipsis` — labels never wrap or overflow. `padding: 3px 0 1px` — tighter vertical fit.

### Change 4: `.ribbon-toolbar` — consistent gap

```css
/* BEFORE (current) */
.ribbon-toolbar {
  display: flex;
  align-items: stretch;
  padding: 8px 12px;
  background: var(--bg-ribbon);
  min-height: 72px;
  gap: 8px;
  overflow-x: auto;
}

/* AFTER */
.ribbon-toolbar {
  display: flex;
  align-items: stretch;
  padding: 4px 12px 2px;
  background: var(--bg-ribbon);
  min-height: 76px;
  gap: 0;
  overflow-x: hidden;
}
```

Key: `gap: 0` — separator border between groups handles spacing visually. `overflow-x: hidden` — eliminates horizontal scroll; groups shrink instead. `padding` adjusted to balance vertical space with the 16px bottom padding on groups.

### Change 5: `.ribbon-btn` — fix alignment inside stretched groups

```css
/* BEFORE (current) */
.ribbon-btn {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  ...
  min-width: 44px !important;
}

/* AFTER */
.ribbon-btn {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  ...
  min-width: 40px !important;
  flex-shrink: 1;
}
```

Key: `min-width: 40px` (slightly smaller) + `flex-shrink: 1` — buttons shrink if needed.

### Change 6: `.ribbon-btn-sm` — smaller min-width

```css
/* BEFORE */
.ribbon-btn-sm { min-width: 32px !important; padding: 4px !important; }

/* AFTER */
.ribbon-btn-sm { min-width: 28px !important; padding: 3px 4px !important; }
```

### Change 7: `.ribbon-select` — remove hardcoded white (already done, verify)

```css
.ribbon-select { ... background: var(--bg-surface); ... }
```

### Change 8: Fix inline styles in HomeRibbon `G` children

The `Font` and `Alignment` groups use inline `flexDirection: 'column'` divs with hardcoded `gap: 2` and `gap: 4`. Normalize all inner flex containers to `gap: 4`:

- `HomeRibbon` line 330: `gap: 2` → `gap: 4` (Clipboard Copy/Cut)
- `HomeRibbon` line 337: `gap: 4` (Font format buttons row) — keep
- `HomeRibbon` line 363: `gap: 2` → `gap: 4` (Bold/Italic/Underline row)
- `HomeRibbon` line 391: `gap: 2` → `gap: 4` (Alignment buttons row)
- `HomeRibbon` line 414: `gap: 2` → `gap: 4` (Merge/Wrap row)
- `HomeRibbon` line 478-489: `gap: 4` (Cells rows) — keep, already 4

## File Summary

| File | Change |
|------|--------|
| `rancage-studio/src/components/Ribbon.tsx` | CSS in `<style>` block (lines 932-1133) + inline `gap` in HomeRibbon (lines ~330-489) |

## Validation

1. `npm run build` in `rancage-studio/` — must compile without errors
2. Visual check: all tabs (Home, Insert, Data, etc.) — groups should be evenly spaced, labels at bottom, no horizontal scroll
3. Narrow window test: groups shrink proportionally, no cutoff

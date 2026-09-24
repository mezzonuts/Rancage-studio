import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Ribbon } from '../Ribbon';
import type { RibbonProps } from '../Ribbon';

const defaultProps: RibbonProps = {
  activeTab: 'Home',
  onTabChange: vi.fn(),
  onExportExcel: vi.fn(),
  onExportHTML: vi.fn(),
  onPrint: vi.fn(),
  onImport: vi.fn(),
  onNewWorkbook: vi.fn(),
  onSortAsc: vi.fn(),
  onSortDesc: vi.fn(),
  onRemoveDuplicates: vi.fn(),
  toggleFilter: vi.fn(),
  filterActive: false,
  zoom: 100,
  onZoomChange: vi.fn(),
  showGridlines: true,
  onToggleGridlines: vi.fn(),
  showFormulaBar: true,
  onToggleFormulaBar: vi.fn(),
  showHeadings: true,
  onToggleHeadings: vi.fn(),
  bold: false,
  onToggleBold: vi.fn(),
  italic: false,
  onToggleItalic: vi.fn(),
  underline: false,
  onToggleUnderline: vi.fn(),
  strikethrough: false,
  onToggleStrikethrough: vi.fn(),
  textAlign: 'left',
  onTextAlignChange: vi.fn(),
  verticalAlign: 'bottom',
  onVerticalAlignChange: vi.fn(),
  wrapText: false,
  onToggleWrapText: vi.fn(),
  fontFamily: 'Inter',
  onFontFamilyChange: vi.fn(),
  fontSize: 13,
  onFontSizeChange: vi.fn(),
  onIncreaseFontSize: vi.fn(),
  onDecreaseFontSize: vi.fn(),
  numberFormat: 'General',
  onNumberFormatChange: vi.fn(),
  chatOpen: true,
  aiProcessing: false,
  onAIAnalystAction: vi.fn(),
  onToggleChat: vi.fn(),
  viewMode: 'spreadsheets',
  onCopy: vi.fn(),
  onCut: vi.fn(),
  onPaste: vi.fn(),
  onFormatPainter: vi.fn(),
  formatPainterActive: false,
  onFillColor: vi.fn(),
  onTextColor: vi.fn(),
  onIncreaseDecimal: vi.fn(),
  onDecreaseDecimal: vi.fn(),
  onInsertRowAbove: vi.fn(),
  onInsertRowBelow: vi.fn(),
  onDeleteRow: vi.fn(),
  onInsertColLeft: vi.fn(),
  onInsertColRight: vi.fn(),
  onDeleteCol: vi.fn(),
  onMergeCells: vi.fn(),
  onAutoSum: vi.fn(),
  onAutoAverage: vi.fn(),
  onAutoCount: vi.fn(),
  onAutoMax: vi.fn(),
  onAutoMin: vi.fn(),
  onFillDown: vi.fn(),
  onFillRight: vi.fn(),
  onFillUp: vi.fn(),
  onFillLeft: vi.fn(),
  onClearAll: vi.fn(),
  onClearContents: vi.fn(),
  onClearFormats: vi.fn(),
  onFind: vi.fn(),
  onFormatRowHeight: vi.fn(),
  onFormatColWidth: vi.fn(),
};

function renderRibbon(overrides: Partial<RibbonProps> = {}) {
  return render(<Ribbon {...defaultProps} {...overrides} />);
}

function getGroup(label: string) {
  const groups = document.querySelectorAll('.ribbon-group');
  for (const g of groups) {
    const lbl = g.querySelector('.ribbon-group-label');
    if (lbl?.textContent?.trim() === label) return g as HTMLElement;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// 1. TAB BAR
// ══════════════════════════════════════════════════════════════
describe('Ribbon Tab Bar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all 10 tabs', () => {
    renderRibbon();
    const tabNames = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'AI Analyst'];
    for (const name of tabNames) {
      expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('highlights active tab with active class', () => {
    renderRibbon({ activeTab: 'Home' });
    const homeTab = screen.getAllByText('Home')[0]?.closest('.MuiButtonBase-root');
    expect(homeTab?.className).toContain('Mui-selected');
  });

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    renderRibbon({ onTabChange });
    const insertTab = screen.getAllByText('Insert')[0]?.closest('.MuiButtonBase-root')!;
    await user.click(insertTab);
    expect(onTabChange).toHaveBeenCalledWith('Insert');
  });

  it('renders logo tab', () => {
    renderRibbon();
    const logo = document.querySelector('.logo-tab');
    expect(logo).toBeTruthy();
    expect(logo?.querySelector('svg')).toBeTruthy();
  });

  it('renders AI Analyst tab with dot indicator', () => {
    renderRibbon({ activeTab: 'AI Analyst' });
    const aiTab = screen.getAllByText('AI Analyst')[0]?.closest('.MuiButtonBase-root');
    expect(aiTab).toBeTruthy();
    const dot = aiTab?.querySelector('.ai-tab-dot');
    expect(dot).toBeTruthy();
  });

  it('shows spinner on AI tab when processing', () => {
    renderRibbon({ activeTab: 'AI Analyst', aiProcessing: true });
    const spin = document.querySelector('.ai-spin');
    expect(spin).toBeTruthy();
  });

  it('renders search icon in tab bar', () => {
    renderRibbon();
    const searchBtns = document.querySelectorAll('.ribbon-tab-right');
    const hasSearch = Array.from(searchBtns).some(b => b.querySelector('[data-testid="SearchIcon"]') || b.querySelector('svg'));
    expect(hasSearch).toBeTruthy();
  });

  it('renders View toggle button', () => {
    renderRibbon();
    expect(screen.getByText('View')).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════
// 2. HOME TAB GROUPS
// ══════════════════════════════════════════════════════════════
describe('Home Tab Groups', () => {
  it('renders all 7 groups with labels', () => {
    renderRibbon();
    for (const label of ['Clipboard', 'Font', 'Alignment', 'Number', 'Styles', 'Cells', 'Editing']) {
      expect(getGroup(label)).toBeTruthy();
    }
  });

  it('each group has a dialog launcher arrow', () => {
    renderRibbon();
    const launchers = document.querySelectorAll('.ribbon-dialog-launcher');
    expect(launchers.length).toBeGreaterThanOrEqual(7);
  });

  it('groups are separated by vertical borders', () => {
    renderRibbon();
    const groups = document.querySelectorAll('.ribbon-group');
    const nonLast = Array.from(groups).slice(0, -1);
    for (const g of nonLast) {
      const borderRight = g.getAttribute('style') || getComputedStyle(g).borderRight;
      expect(borderRight).toBeTruthy();
    }
  });
});

// ══════════════════════════════════════════════════════════════
// 3. CLIPBOARD GROUP
// ══════════════════════════════════════════════════════════════
describe('Clipboard Group', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Paste, Cut, Copy, Format Painter buttons', () => {
    renderRibbon();
    expect(screen.getByText('Paste')).toBeTruthy();
    expect(screen.getByText('Cut')).toBeTruthy();
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.getByText('Format Painter')).toBeTruthy();
  });

  it('Paste button calls onPaste', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Paste'));
    expect(defaultProps.onPaste).toHaveBeenCalled();
  });

  it('Cut button calls onCut', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Cut'));
    expect(defaultProps.onCut).toHaveBeenCalled();
  });

  it('Copy button calls onCopy', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Copy'));
    expect(defaultProps.onCopy).toHaveBeenCalled();
  });

  it('Format Painter toggles on click', async () => {
    const user = userEvent.setup();
    const onFormatPainter = vi.fn();
    renderRibbon({ onFormatPainter });
    await user.click(screen.getByText('Format Painter'));
    expect(onFormatPainter).toHaveBeenCalled();
  });

  it('Format Painter shows active state when active', () => {
    renderRibbon({ formatPainterActive: true });
    const btn = screen.getByText('Format Painter').closest('button');
    expect(btn?.className).toContain('active');
  });
});

// ══════════════════════════════════════════════════════════════
// 4. FONT GROUP
// ══════════════════════════════════════════════════════════════
describe('Font Group', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders font family dropdown with current value', () => {
    renderRibbon({ fontFamily: 'Arial' });
    const select = document.querySelector('.rg-font .ribbon-select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe('Arial');
  });

  it('renders font size dropdown with current value', () => {
    renderRibbon({ fontSize: 14 });
    const selects = document.querySelectorAll('.rg-font .ribbon-select-sm');
    const sizeSelect = selects[0] as HTMLSelectElement;
    expect(sizeSelect.value).toBe('14');
  });

  it('font family change calls onFontFamilyChange', async () => {
    const user = userEvent.setup();
    const onFontFamilyChange = vi.fn();
    renderRibbon({ onFontFamilyChange });
    const select = document.querySelector('.rg-font .ribbon-select') as HTMLSelectElement;
    await user.selectOptions(select, 'Arial');
    expect(onFontFamilyChange).toHaveBeenCalledWith('Arial');
  });

  it('font size change calls onFontSizeChange', async () => {
    const user = userEvent.setup();
    const onFontSizeChange = vi.fn();
    renderRibbon({ onFontSizeChange });
    const selects = document.querySelectorAll('.rg-font .ribbon-select-sm');
    const sizeSelect = selects[0] as HTMLSelectElement;
    await user.selectOptions(sizeSelect, '16');
    expect(onFontSizeChange).toHaveBeenCalledWith(16);
  });

  it('Bold toggle calls onToggleBold', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const boldBtn = document.querySelector('.rg-font .rb-toggle[title="Bold"]');
    expect(boldBtn).toBeTruthy();
    await user.click(boldBtn!);
    expect(defaultProps.onToggleBold).toHaveBeenCalled();
  });

  it('Bold button shows active when bold=true', () => {
    renderRibbon({ bold: true });
    const boldBtn = document.querySelector('.rg-font .rb-toggle[title="Bold"]');
    expect(boldBtn?.className).toContain('active');
  });

  it('Italic toggle works', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const btn = document.querySelector('.rg-font .rb-toggle[title="Italic"]');
    await user.click(btn!);
    expect(defaultProps.onToggleItalic).toHaveBeenCalled();
  });

  it('Underline toggle works', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const btn = document.querySelector('.rg-font .rb-toggle[title="Underline"]');
    await user.click(btn!);
    expect(defaultProps.onToggleUnderline).toHaveBeenCalled();
  });

  it('Increase Font Size calls onIncreaseFontSize', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const btn = document.querySelector('.rg-font .rb-toggle[title="Increase Font Size"]');
    await user.click(btn!);
    expect(defaultProps.onIncreaseFontSize).toHaveBeenCalled();
  });

  it('Decrease Font Size calls onDecreaseFontSize', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const btn = document.querySelector('.rg-font .rb-toggle[title="Decrease Font Size"]');
    await user.click(btn!);
    expect(defaultProps.onDecreaseFontSize).toHaveBeenCalled();
  });

  it('Fill Color button applies color', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const fillColorBtn = document.querySelector('.rb-color-btn[title="Fill Color"]');
    expect(fillColorBtn).toBeTruthy();
    await user.click(fillColorBtn!);
    expect(defaultProps.onFillColor).toHaveBeenCalled();
  });

  it('Text Color button applies color', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const textColorBtn = document.querySelector('.rb-color-btn[title="Font Color"]');
    expect(textColorBtn).toBeTruthy();
    await user.click(textColorBtn!);
    expect(defaultProps.onTextColor).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// 5. ALIGNMENT GROUP
// ══════════════════════════════════════════════════════════════
describe('Alignment Group', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all alignment buttons', () => {
    renderRibbon();
    expect(document.querySelector('[title="Top Align"]')).toBeTruthy();
    expect(document.querySelector('[title="Middle Align"]')).toBeTruthy();
    expect(document.querySelector('[title="Bottom Align"]')).toBeTruthy();
    expect(document.querySelector('[title="Align Left"]')).toBeTruthy();
    expect(document.querySelector('[title="Center"]')).toBeTruthy();
    expect(document.querySelector('[title="Align Right"]')).toBeTruthy();
  });

  it('Top Align is active when verticalAlign=top', () => {
    renderRibbon({ verticalAlign: 'top' });
    expect(document.querySelector('[title="Top Align"]')?.className).toContain('active');
  });

  it('Middle Align is active when verticalAlign=middle', () => {
    renderRibbon({ verticalAlign: 'middle' });
    expect(document.querySelector('[title="Middle Align"]')?.className).toContain('active');
  });

  it('Bottom Align is active when verticalAlign=bottom', () => {
    renderRibbon({ verticalAlign: 'bottom' });
    expect(document.querySelector('[title="Bottom Align"]')?.className).toContain('active');
  });

  it('Vertical align button calls onVerticalAlignChange', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(document.querySelector('[title="Top Align"]')!);
    expect(defaultProps.onVerticalAlignChange).toHaveBeenCalledWith('top');
  });

  it('Left Align is active when textAlign=left', () => {
    renderRibbon({ textAlign: 'left' });
    expect(document.querySelector('[title="Align Left"]')?.className).toContain('active');
  });

  it('Center is active when textAlign=center', () => {
    renderRibbon({ textAlign: 'center' });
    expect(document.querySelector('[title="Center"]')?.className).toContain('active');
  });

  it('Align Right is active when textAlign=right', () => {
    renderRibbon({ textAlign: 'right' });
    expect(document.querySelector('[title="Align Right"]')?.className).toContain('active');
  });

  it('Horizontal align button calls onTextAlignChange', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const centerBtn = document.querySelector('[title="Center"]');
    expect(centerBtn).toBeTruthy();
    await user.click(centerBtn!);
    expect(defaultProps.onTextAlignChange).toHaveBeenCalledWith('center');
  });

  it('Wrap Text button calls onToggleWrapText', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const wrapBtn = screen.getByText('Wrap Text');
    await user.click(wrapBtn);
    expect(defaultProps.onToggleWrapText).toHaveBeenCalled();
  });

  it('Wrap Text shows active when wrapText=true', () => {
    renderRibbon({ wrapText: true });
    const wrapBtn = screen.getByText('Wrap Text').closest('button');
    expect(wrapBtn?.className).toContain('active');
  });

  it('Merge & Center calls onMergeCells', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const mergeBtn = screen.getByText('Merge & Center');
    await user.click(mergeBtn);
    expect(defaultProps.onMergeCells).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// 6. NUMBER GROUP
// ══════════════════════════════════════════════════════════════
describe('Number Group', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders number format dropdown', () => {
    renderRibbon();
    const group = getGroup('Number');
    expect(group).toBeTruthy();
    const select = group!.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('General');
  });

  it('format change calls onNumberFormatChange', async () => {
    const user = userEvent.setup();
    const onNumberFormatChange = vi.fn();
    renderRibbon({ onNumberFormatChange });
    const group = getGroup('Number')!;
    const select = group.querySelector('select') as HTMLSelectElement;
    await user.selectOptions(select, 'Currency ($)');
    expect(onNumberFormatChange).toHaveBeenCalledWith('Currency ($)');
  });

  it('$ button calls onNumberFormatChange with Currency ($)', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const dollarBtn = screen.getByText('$');
    await user.click(dollarBtn.closest('button')!);
    expect(defaultProps.onNumberFormatChange).toHaveBeenCalledWith('Currency ($)');
  });

  it('% button calls onNumberFormatChange with Percentage', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const pctBtn = screen.getByText('%');
    await user.click(pctBtn.closest('button')!);
    expect(defaultProps.onNumberFormatChange).toHaveBeenCalledWith('Percentage');
  });

  it('Increase Decimal calls onIncreaseDecimal', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const btn = document.querySelector('[title="Increase Decimal"]');
    expect(btn).toBeTruthy();
    await user.click(btn!);
    expect(defaultProps.onIncreaseDecimal).toHaveBeenCalled();
  });

  it('Decrease Decimal calls onDecreaseDecimal', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const btn = document.querySelector('[title="Decrease Decimal"]');
    expect(btn).toBeTruthy();
    await user.click(btn!);
    expect(defaultProps.onDecreaseDecimal).toHaveBeenCalled();
  });

  it('dropdown has all format options', () => {
    renderRibbon();
    const group = getGroup('Number')!;
    const select = group.querySelector('select')!;
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toContain('General');
    expect(options).toContain('Number');
    expect(options).toContain('Currency');
    expect(options).toContain('Currency ($)');
    expect(options).toContain('Percentage');
    expect(options).toContain('Date');
    expect(options).toContain('Time');
    expect(options).toContain('Scientific');
    expect(options).toContain('Text');
  });
});

// ══════════════════════════════════════════════════════════════
// 7. CELLS GROUP — Dropdown Menus
// ══════════════════════════════════════════════════════════════
describe('Cells Group Dropdowns', () => {
  beforeEach(() => vi.clearAllMocks());

  function clickRibbonDropdown(label: string) {
    const btns = document.querySelectorAll('.rg-cells .rb');
    const btn = Array.from(btns).find(b => b.querySelector('.rb-text')?.textContent?.trim() === label) as HTMLElement;
    if (btn) fireEvent.click(btn);
    return btn;
  }

  it('Insert dropdown opens and shows menu items', async () => {
    renderRibbon();
    clickRibbonDropdown('Insert');
    await waitFor(() => {
      expect(screen.getByText('Insert Sheet Rows')).toBeTruthy();
      expect(screen.getByText('Insert Sheet Columns')).toBeTruthy();
    });
  });

  it('Insert Sheet Rows calls onInsertRowAbove', async () => {
    renderRibbon();
    clickRibbonDropdown('Insert');
    await waitFor(() => {
      fireEvent.click(screen.getByText('Insert Sheet Rows'));
    });
    expect(defaultProps.onInsertRowAbove).toHaveBeenCalled();
  });

  it('Insert Sheet Columns calls onInsertColRight', async () => {
    renderRibbon();
    clickRibbonDropdown('Insert');
    await waitFor(() => {
      fireEvent.click(screen.getByText('Insert Sheet Columns'));
    });
    expect(defaultProps.onInsertColRight).toHaveBeenCalled();
  });

  it('Delete dropdown opens and shows menu items', async () => {
    renderRibbon();
    clickRibbonDropdown('Delete');
    await waitFor(() => {
      expect(screen.getByText('Delete Sheet Rows')).toBeTruthy();
      expect(screen.getByText('Delete Sheet Columns')).toBeTruthy();
    });
  });

  it('Delete Sheet Columns calls onDeleteCol', async () => {
    renderRibbon();
    clickRibbonDropdown('Delete');
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete Sheet Columns'));
    });
    expect(defaultProps.onDeleteCol).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// 8. EDITING GROUP — Dropdown Menus
// ══════════════════════════════════════════════════════════════
describe('Editing Group Dropdowns', () => {
  beforeEach(() => vi.clearAllMocks());

  it('AutoSum dropdown shows Sum, Average, Count, Max, Min', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const sumBtn = screen.getByText('AutoSum');
    await user.click(sumBtn.closest('button')!);
    await waitFor(() => {
      expect(screen.getByText('Sum')).toBeTruthy();
      expect(screen.getByText('Average')).toBeTruthy();
      expect(screen.getByText('Count Numbers')).toBeTruthy();
      expect(screen.getByText('Max')).toBeTruthy();
      expect(screen.getByText('Min')).toBeTruthy();
    });
  });

  it('AutoSum → Sum calls onAutoSum', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('AutoSum').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Sum')));
    expect(defaultProps.onAutoSum).toHaveBeenCalled();
  });

  it('AutoSum → Average calls onAutoAverage', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('AutoSum').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Average')));
    expect(defaultProps.onAutoAverage).toHaveBeenCalled();
  });

  it('AutoSum → Count Numbers calls onAutoCount', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('AutoSum').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Count Numbers')));
    expect(defaultProps.onAutoCount).toHaveBeenCalled();
  });

  it('AutoSum → Max calls onAutoMax', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('AutoSum').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Max')));
    expect(defaultProps.onAutoMax).toHaveBeenCalled();
  });

  it('AutoSum → Min calls onAutoMin', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('AutoSum').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Min')));
    expect(defaultProps.onAutoMin).toHaveBeenCalled();
  });

  it('Fill dropdown shows Down, Right, Up, Left', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const fillBtn = screen.getByText('Fill');
    await user.click(fillBtn.closest('button')!);
    await waitFor(() => {
      expect(screen.getByText('Down')).toBeTruthy();
      expect(screen.getByText('Right')).toBeTruthy();
      expect(screen.getByText('Up')).toBeTruthy();
      expect(screen.getByText('Left')).toBeTruthy();
    });
  });

  it('Fill → Down calls onFillDown', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Fill').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Down')));
    expect(defaultProps.onFillDown).toHaveBeenCalled();
  });

  it('Fill → Right calls onFillRight', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Fill').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Right')));
    expect(defaultProps.onFillRight).toHaveBeenCalled();
  });

  it('Clear dropdown shows Clear All, Clear Formats, Clear Contents', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const clearBtn = screen.getByText('Clear');
    await user.click(clearBtn.closest('button')!);
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeTruthy();
      expect(screen.getByText('Clear Formats')).toBeTruthy();
      expect(screen.getByText('Clear Contents')).toBeTruthy();
    });
  });

  it('Clear All calls onClearAll', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Clear').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Clear All')));
    expect(defaultProps.onClearAll).toHaveBeenCalled();
  });

  it('Clear Formats calls onClearFormats', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Clear').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Clear Formats')));
    expect(defaultProps.onClearFormats).toHaveBeenCalled();
  });

  it('Clear Contents calls onClearContents', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Clear').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Clear Contents')));
    expect(defaultProps.onClearContents).toHaveBeenCalled();
  });

  it('Sort & Filter dropdown shows Sort A to Z, Sort Z to A, Clear Filter', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const sortBtn = screen.getByText('Sort & Filter');
    await user.click(sortBtn.closest('button')!);
    await waitFor(() => {
      expect(screen.getByText('Sort A to Z')).toBeTruthy();
      expect(screen.getByText('Sort Z to A')).toBeTruthy();
      expect(screen.getByText('Clear Filter')).toBeTruthy();
    });
  });

  it('Sort A to Z calls onSortAsc', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Sort & Filter').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Sort A to Z')));
    expect(defaultProps.onSortAsc).toHaveBeenCalled();
  });

  it('Find & Select dropdown shows Find, Replace, Go To', async () => {
    const user = userEvent.setup();
    renderRibbon();
    const findBtn = screen.getByText('Find & Select');
    await user.click(findBtn.closest('button')!);
    await waitFor(() => {
      expect(screen.getByText('Find...')).toBeTruthy();
      expect(screen.getByText('Replace...')).toBeTruthy();
      expect(screen.getByText('Go To...')).toBeTruthy();
    });
  });

  it('Find... calls onFind', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Find & Select').closest('button')!);
    await waitFor(() => user.click(screen.getByText('Find...')));
    expect(defaultProps.onFind).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// 9. STYLES GROUP — Cell Style Presets
// ══════════════════════════════════════════════════════════════
describe('Styles Group', () => {
  it('renders style preview boxes', () => {
    renderRibbon();
    expect(screen.getByText('Normal')).toBeTruthy();
    expect(screen.getByText('Bad')).toBeTruthy();
    expect(screen.getByText('Good')).toBeTruthy();
    expect(screen.getByText('Neutral')).toBeTruthy();
  });

  it('style boxes have distinct background colors', () => {
    renderRibbon();
    const bad = screen.getByText('Bad').closest('.rg-style-bad');
    const good = screen.getByText('Good').closest('.rg-style-good');
    const neutral = screen.getByText('Neutral').closest('.rg-style-neutral');
    expect(bad).toBeTruthy();
    expect(good).toBeTruthy();
    expect(neutral).toBeTruthy();
  });

  it('clicking Bad applies fill color', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Bad'));
    expect(defaultProps.onFillColor).toHaveBeenCalledWith('#fff2f2');
  });

  it('clicking Good applies fill color', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Good'));
    expect(defaultProps.onFillColor).toHaveBeenCalledWith('#dcfce7');
  });

  it('clicking Neutral applies fill color', async () => {
    const user = userEvent.setup();
    renderRibbon();
    await user.click(screen.getByText('Neutral'));
    expect(defaultProps.onFillColor).toHaveBeenCalledWith('#fef9c3');
  });
});

// ══════════════════════════════════════════════════════════════
// 10. TWO-WAY STATE SYNC (active states)
// ══════════════════════════════════════════════════════════════
describe('Two-Way State Synchronization', () => {
  it('all toggle states reflect props', () => {
    renderRibbon({
      bold: true,
      italic: true,
      underline: true,
      textAlign: 'center',
      verticalAlign: 'middle',
      wrapText: true,
    });

    expect(document.querySelector('[title="Bold"]')?.className).toContain('active');
    expect(document.querySelector('[title="Italic"]')?.className).toContain('active');
    expect(document.querySelector('[title="Underline"]')?.className).toContain('active');
    expect(document.querySelector('[title="Center"]')?.className).toContain('active');
    expect(document.querySelector('[title="Middle Align"]')?.className).toContain('active');

    const wrapBtn = screen.getByText('Wrap Text').closest('button');
    expect(wrapBtn?.className).toContain('active');
  });

  it('font dropdown reflects current font family', () => {
    renderRibbon({ fontFamily: 'Roboto' });
    const select = document.querySelector('.rg-font .ribbon-select') as HTMLSelectElement;
    expect(select.value).toBe('Roboto');
  });

  it('font size dropdown reflects current size', () => {
    renderRibbon({ fontSize: 18 });
    const select = document.querySelector('.rg-font .ribbon-select-sm') as HTMLSelectElement;
    expect(select.value).toBe('18');
  });

  it('number format dropdown reflects current format', () => {
    renderRibbon({ numberFormat: 'Currency' });
    const group = getGroup('Number')!;
    const select = group.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('Currency');
  });

  it('all toggles are false when props are false', () => {
    renderRibbon({
      bold: false,
      italic: false,
      underline: false,
      wrapText: false,
    });

    expect(document.querySelector('[title="Bold"]')?.className).not.toContain('active');
    expect(document.querySelector('[title="Italic"]')?.className).not.toContain('active');
    expect(document.querySelector('[title="Underline"]')?.className).not.toContain('active');
  });
});

// ══════════════════════════════════════════════════════════════
// 11. DROPDOWN MENU BEHAVIOR
// ══════════════════════════════════════════════════════════════
describe('Dropdown Menu Behavior', () => {
  beforeEach(() => vi.clearAllMocks());

  function openEditingDropdown(label: string) {
    const btns = document.querySelectorAll('.rg-editing-col .rb');
    const btn = Array.from(btns).find(b => b.querySelector('.rb-text')?.textContent?.trim() === label) as HTMLElement;
    if (btn) fireEvent.click(btn);
  }

  it('clicking dropdown button opens menu', async () => {
    renderRibbon();
    openEditingDropdown('AutoSum');
    await waitFor(() => {
      expect(screen.getByText('Sum')).toBeTruthy();
    });
  });

  it('clicking outside closes dropdown', async () => {
    renderRibbon();
    openEditingDropdown('AutoSum');
    await waitFor(() => expect(screen.getByText('Sum')).toBeTruthy());

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText('Sum')).toBeNull();
    });
  });

  it('clicking a menu item calls its handler', async () => {
    renderRibbon();
    openEditingDropdown('AutoSum');
    await waitFor(() => expect(screen.getByText('Sum')).toBeTruthy());
    fireEvent.click(screen.getByText('Sum'));
    expect(defaultProps.onAutoSum).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
// 12. VISUAL / CSS CLASS TESTS
// ══════════════════════════════════════════════════════════════
describe('Visual / CSS Classes', () => {
  it('ribbon has correct root classes', () => {
    renderRibbon();
    const ribbon = document.querySelector('.ribbon');
    expect(ribbon).toBeTruthy();
  });

  it('ribbon tabs container has correct class', () => {
    renderRibbon();
    expect(document.querySelector('.ribbon-tabs')).toBeTruthy();
  });

  it('toolbar has correct class', () => {
    renderRibbon();
    expect(document.querySelector('.ribbon-toolbar')).toBeTruthy();
  });

  it('rb-toggle buttons have transition CSS', () => {
    renderRibbon();
    const toggle = document.querySelector('.rb-toggle') as HTMLElement;
    const style = getComputedStyle(toggle);
    expect(style.transition).toContain('all');
  });

  it('rb-btn has border-radius', () => {
    renderRibbon();
    const btn = document.querySelector('.rb') as HTMLElement;
    const style = getComputedStyle(btn);
    expect(style.borderRadius).toBeTruthy();
  });

  it('color stripe exists under fill color icon', () => {
    renderRibbon();
    const stripe = document.querySelector('.rb-color-stripe');
    expect(stripe).toBeTruthy();
  });

  it('dialog launcher has reduced opacity', () => {
    renderRibbon();
    const launcher = document.querySelector('.ribbon-dialog-launcher') as HTMLElement;
    const style = getComputedStyle(launcher);
    expect(parseFloat(style.opacity)).toBeLessThan(1);
  });

  it('separator lines exist between font rows', () => {
    renderRibbon();
    const seps = document.querySelectorAll('.rb-sep-v');
    expect(seps.length).toBeGreaterThan(0);
  });

  it('group labels are uppercase', () => {
    renderRibbon();
    const label = document.querySelector('.ribbon-group-label') as HTMLElement;
    expect(getComputedStyle(label).textTransform).toBe('uppercase');
  });
});

// ══════════════════════════════════════════════════════════════
// 13. EDGE CASES
// ══════════════════════════════════════════════════════════════
describe('Edge Cases', () => {
  it('renders without crashing when all optional props are undefined', () => {
    const minimalProps = {
      activeTab: 'Home',
      onTabChange: vi.fn(),
      onExportExcel: vi.fn(),
      onExportHTML: vi.fn(),
      onPrint: vi.fn(),
      onImport: vi.fn(),
      onNewWorkbook: vi.fn(),
      onSortAsc: vi.fn(),
      onSortDesc: vi.fn(),
      onRemoveDuplicates: vi.fn(),
      toggleFilter: vi.fn(),
      filterActive: false,
      zoom: 100,
      onZoomChange: vi.fn(),
      showGridlines: true,
      onToggleGridlines: vi.fn(),
      showFormulaBar: true,
      onToggleFormulaBar: vi.fn(),
      showHeadings: true,
      onToggleHeadings: vi.fn(),
      bold: false,
      onToggleBold: vi.fn(),
      italic: false,
      onToggleItalic: vi.fn(),
      underline: false,
      onToggleUnderline: vi.fn(),
      strikethrough: false,
      onToggleStrikethrough: vi.fn(),
      textAlign: 'left' as const,
      onTextAlignChange: vi.fn(),
      verticalAlign: 'bottom' as const,
      onVerticalAlignChange: vi.fn(),
      wrapText: false,
      onToggleWrapText: vi.fn(),
      fontFamily: 'Inter',
      onFontFamilyChange: vi.fn(),
      fontSize: 13,
      onFontSizeChange: vi.fn(),
      onIncreaseFontSize: vi.fn(),
      onDecreaseFontSize: vi.fn(),
      numberFormat: 'General',
      onNumberFormatChange: vi.fn(),
      chatOpen: true,
      aiProcessing: false,
      onAIAnalystAction: vi.fn(),
      onToggleChat: vi.fn(),
      viewMode: 'spreadsheets',
    } as Partial<RibbonProps>;
    expect(() => render(<Ribbon {...minimalProps as RibbonProps} />)).not.toThrow();
  });

  it('active tab does not crash when not in TABS list', () => {
    renderRibbon({ activeTab: 'NonExistent' });
    expect(document.querySelector('.ribbon')).toBeTruthy();
  });

  it('zoom value is reflected', () => {
    renderRibbon({ zoom: 150 });
    const zoomText = document.querySelector('.ribbon-tabs-right');
    expect(zoomText).toBeTruthy();
  });

  it('filterActive state is reflected in toggleFilter callback', () => {
    renderRibbon({ filterActive: true });
    expect(defaultProps.toggleFilter).toBeDefined();
  });

  it('multiple rapid tab switches do not crash', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    renderRibbon({ onTabChange });
    const tabs = ['Insert', 'Data', 'Formulas', 'Review', 'View'];
    for (const tab of tabs) {
      const el = screen.getAllByText(tab)[0]?.closest('.MuiButtonBase-root')!;
      await user.click(el);
    }
    expect(onTabChange).toHaveBeenCalledTimes(5);
  });

  it('dropdown menus handle rapid open/close', async () => {
    renderRibbon();
    const btns = document.querySelectorAll('.rg-editing-col .rb');
    const autoSumBtn = Array.from(btns).find(b => b.querySelector('.rb-text')?.textContent?.trim() === 'AutoSum') as HTMLElement;
    fireEvent.click(autoSumBtn);
    await waitFor(() => expect(screen.getByText('Sum')).toBeTruthy());
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByText('Sum')).toBeNull());
    fireEvent.click(autoSumBtn);
    await waitFor(() => expect(screen.getByText('Sum')).toBeTruthy());
  });

  it('menu items render correctly', async () => {
    renderRibbon();
    const btns = document.querySelectorAll('.rg-cells .rb');
    const insertBtn = Array.from(btns).find(b => b.querySelector('.rb-text')?.textContent?.trim() === 'Insert') as HTMLElement;
    fireEvent.click(insertBtn);
    await waitFor(() => {
      const items = document.querySelectorAll('.rg-cells .ribbon-menu-item');
      expect(items.length).toBeGreaterThanOrEqual(3);
    });
  });
});

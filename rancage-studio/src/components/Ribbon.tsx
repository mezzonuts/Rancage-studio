'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import MergeIcon from '@mui/icons-material/Merge';
import WrapTextIcon from '@mui/icons-material/WrapText';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import SortIcon from '@mui/icons-material/Sort';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import HighlightIcon from '@mui/icons-material/Highlight';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import CommentIcon from '@mui/icons-material/Comment';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalculateIcon from '@mui/icons-material/Calculate';
import TimelineIcon from '@mui/icons-material/Timeline';
import CodeIcon from '@mui/icons-material/Code';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ChatIcon from '@mui/icons-material/Chat';
import ReplayIcon from '@mui/icons-material/Replay';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import CategoryIcon from '@mui/icons-material/Category';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CropLandscapeIcon from '@mui/icons-material/CropLandscape';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import GridOnIcon from '@mui/icons-material/GridOn';
import PaletteIcon from '@mui/icons-material/Palette';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CheckIcon from '@mui/icons-material/Check';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TableChartIcon from '@mui/icons-material/TableChart';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import BorderAllIcon from '@mui/icons-material/BorderAll';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PercentIcon from '@mui/icons-material/Percent';

export interface RibbonProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExportExcel: () => void;
  onExportHTML: () => void;
  onPrint: () => void;
  onImport: () => void;
  onNewWorkbook: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onRemoveDuplicates: () => void;
  toggleFilter: () => void;
  filterActive: boolean;
  zoom: number;
  onZoomChange: (z: number) => void;
  showGridlines: boolean;
  onToggleGridlines: () => void;
  showFormulaBar: boolean;
  onToggleFormulaBar: () => void;
  showHeadings: boolean;
  onToggleHeadings: () => void;
  bold: boolean;
  onToggleBold: () => void;
  italic: boolean;
  onToggleItalic: () => void;
  underline: boolean;
  onToggleUnderline: () => void;
  strikethrough: boolean;
  onToggleStrikethrough: () => void;
  textAlign: 'left' | 'center' | 'right';
  onTextAlignChange: (a: 'left' | 'center' | 'right') => void;
  verticalAlign: 'top' | 'middle' | 'bottom';
  onVerticalAlignChange: (a: 'top' | 'middle' | 'bottom') => void;
  wrapText: boolean;
  onToggleWrapText: () => void;
  fontFamily: string;
  onFontFamilyChange: (f: string) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  numberFormat: string;
  onNumberFormatChange: (f: string) => void;
  chatOpen: boolean;
  aiProcessing: boolean;
  onAIAnalystAction: (action: string) => void;
  onToggleChat: () => void;
  viewMode: string;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onFormatPainter?: () => void;
  formatPainterActive?: boolean;
  onFillColor?: (color: string) => void;
  onTextColor?: (color: string) => void;
  onIncreaseDecimal?: () => void;
  onDecreaseDecimal?: () => void;
  onInsertRowAbove?: () => void;
  onInsertRowBelow?: () => void;
  onDeleteRow?: () => void;
  onInsertColLeft?: () => void;
  onInsertColRight?: () => void;
  onDeleteCol?: () => void;
  onMergeCells?: () => void;
  onAutoSum?: () => void;
  onAutoAverage?: () => void;
  onAutoCount?: () => void;
  onAutoMax?: () => void;
  onAutoMin?: () => void;
  onFillDown?: () => void;
  onFillRight?: () => void;
  onFillUp?: () => void;
  onFillLeft?: () => void;
  onClearAll?: () => void;
  onClearContents?: () => void;
  onClearFormats?: () => void;
  onFind?: () => void;
  onFormatRowHeight?: (h: number) => void;
  onFormatColWidth?: (w: number) => void;
}

const TABS = [
  'File',
  'Home',
  'Insert',
  'Draw',
  'Page Layout',
  'Formulas',
  'Data',
  'Review',
  'View',
  'AI Analyst',
];

const I = {
  clipboard: <ContentPasteIcon className="h-5 w-5" />,
  copy: <ContentCopyIcon className="h-4 w-4" />,
  cut: <ContentCutIcon className="h-4 w-4" />,
  bold: <FormatBoldIcon className="h-4 w-4" />,
  italic: <FormatItalicIcon className="h-4 w-4" />,
  underline: <FormatUnderlinedIcon className="h-4 w-4" />,
  strikethrough: <StrikethroughSIcon className="h-4 w-4" />,
  alignLeft: <FormatAlignLeftIcon className="h-4 w-4" />,
  alignCenter: <FormatAlignCenterIcon className="h-4 w-4" />,
  alignRight: <FormatAlignRightIcon className="h-4 w-4" />,
  merge: <MergeIcon className="h-4 w-4" />,
  wrap: <WrapTextIcon className="h-4 w-4" />,
  format: <ViewQuiltIcon className="h-4 w-4" />,
  style: <PaletteIcon className="h-4 w-4" />,
  insert: <AddIcon className="h-4 w-4" />,
  delete: <DeleteIcon className="h-4 w-4" />,
  settings: <SettingsIcon className="h-4 w-4" />,
  sort: <SortIcon className="h-4 w-4" />,
  filter: <FilterAltIcon className="h-4 w-4" />,
  find: <SearchIcon className="h-4 w-4" />,
  file: <DescriptionIcon className="h-4 w-4" />,
  newFile: <NoteAddIcon className="h-4 w-4" />,
  open: <FolderOpenIcon className="h-4 w-4" />,
  save: <SaveIcon className="h-4 w-4" />,
  print: <PrintIcon className="h-4 w-4" />,
  export: <FileDownloadIcon className="h-4 w-4" />,
  close: <CloseIcon className="h-4 w-4" />,
  sortAsc: <ArrowUpwardIcon className="h-4 w-4" />,
  sortDesc: <ArrowDownwardIcon className="h-4 w-4" />,
  clearFilter: <FilterListOffIcon className="h-4 w-4" />,
  pen: <EditIcon className="h-4 w-4" />,
  highlighter: <HighlightIcon className="h-4 w-4" />,
  eraser: <CleaningServicesIcon className="h-4 w-4" />,
  margins: <ViewModuleIcon className="h-4 w-4" />,
  orientation: <CropLandscapeIcon className="h-4 w-4" />,
  size: <AspectRatioIcon className="h-4 w-4" />,
  bg: <FormatColorFillIcon className="h-4 w-4" />,
  gridlines: <GridOnIcon className="h-4 w-4" />,
  function: <FunctionsIcon className="h-4 w-4" />,
  sum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <text x="3" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">
        Σ
      </text>
    </svg>
  ),
  trace: <TimelineIcon className="h-4 w-4" />,
  showFormula: <CodeIcon className="h-4 w-4" />,
  calc: <CalculateIcon className="h-4 w-4" />,
  nameManager: <PersonIcon className="h-4 w-4" />,
  dataImport: <CloudDownloadIcon className="h-4 w-4" />,
  removeDup: <CategoryIcon className="h-4 w-4" />,
  group: <GroupWorkIcon className="h-4 w-4" />,
  validate: <CheckCircleIcon className="h-4 w-4" />,
  spellcheck: <SpellcheckIcon className="h-4 w-4" />,
  comment: <CommentIcon className="h-4 w-4" />,
  lock: <LockIcon className="h-4 w-4" />,
  eye: <VisibilityIcon className="h-4 w-4" />,
  zoomIn: <ZoomInIcon className="h-4 w-4" />,
  zoomOut: <ZoomOutIcon className="h-4 w-4" />,
  freeze: <LockOpenIcon className="h-4 w-4" />,
  split: <ViewColumnIcon className="h-4 w-4" />,
  dashboard: <DashboardIcon className="h-4 w-4" />,
  aiBrain: <PsychologyIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  aiDollar: <AttachMoneyIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  aiChart: <ShowChartIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  chat: <ChatIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  python: <CodeIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  template: <DashboardCustomizeIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  replay: <ReplayIcon className="h-4 w-4" style={{ color: 'var(--accent)' }} />,
  symbol: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <text x="4" y="18" fontSize="16" fill="currentColor" stroke="none">
        Ω
      </text>
    </svg>
  ),
  check: <CheckIcon className="h-4 w-4" />,
  alignTop: <VerticalAlignTopIcon className="h-4 w-4" />,
  alignMiddle: <VerticalAlignCenterIcon className="h-4 w-4" />,
  alignBottom: <VerticalAlignBottomIcon className="h-4 w-4" />,
  borderGrid: <BorderAllIcon className="h-4 w-4" />,
  formatSize: <FormatSizeIcon className="h-4 w-4" />,
  indentDecrease: <FormatIndentDecreaseIcon className="h-4 w-4" />,
  indentIncrease: <FormatIndentIncreaseIcon className="h-4 w-4" />,
  formatPainter: <ContentPasteGoIcon className="h-4 w-4" />,
  formatClear: <FormatClearIcon className="h-4 w-4" />,
  arrowSE: <SouthEastIcon sx={{ fontSize: 10 }} />,
  arrowDown: <KeyboardArrowDownIcon sx={{ fontSize: 12 }} />,
  percent: <PercentIcon className="h-4 w-4" />,
  currency: <AttachMoneyIcon className="h-4 w-4" />,
};

function R({
  icon,
  label,
  onClick,
  active,
  small,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  small?: boolean;
  accent?: boolean;
}) {
  return (
    <Button
      className={`ribbon-btn ${small ? 'ribbon-btn-sm' : ''} ${active ? 'active' : ''}`}
      onClick={onClick}
      disableRipple
      disableElevation
      sx={{
        textTransform: 'none',
        minWidth: small ? 32 : 44,
        padding: small ? '4px' : '4px 8px',
        borderRadius: '6px',
        flexDirection: 'column',
        gap: '2px',
        lineHeight: 'normal',
        color: accent ? 'var(--accent)' : undefined,
        transition: 'all 0.15s ease',
        '&:hover': {
          background: 'var(--bg-grid-hover)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          background: 'var(--accent-bg)',
          transform: 'translateY(0)',
        },
        '&.active': {
          background: 'var(--accent-bg)',
          outline: '1px solid var(--accent)',
        },
      }}
    >
      {icon}
      <span style={{ fontSize: small ? 10 : 10.5, color: accent ? 'var(--accent)' : undefined }}>
        {label}
      </span>
    </Button>
  );
}

function G({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="ribbon-group">
      <div className="ribbon-group-content">{children}</div>
      <div className="ribbon-group-footer">
        <span className="ribbon-group-label">{label}</span>
        <span className="ribbon-dialog-launcher" title={`Open ${label} dialog`}>
          {I.arrowSE}
        </span>
      </div>
    </div>
  );
}

function FileRibbon({
  onNew,
  onImport,
  onExportExcel,
  onExportHTML,
  onPrint,
}: {
  onNew: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onExportHTML: () => void;
  onPrint: () => void;
}) {
  return (
    <>
      <G label="New">
        <R icon={I.newFile} label="Blank" onClick={onNew} />
        <R icon={I.template} label="From Template" onClick={onNew} accent />
      </G>
      <G label="Open">
        <R icon={I.open} label="Import CSV" onClick={onImport} />
        <R icon={I.open} label="Import XLSX" onClick={onImport} />
        <R icon={I.open} label="Import Parquet" onClick={onImport} />
      </G>
      <G label="Save & Export">
        <R icon={I.save} label="Save" onClick={onExportExcel} />
        <R icon={I.export} label="Export Excel" onClick={onExportExcel} />
        <R icon={I.export} label="Export HTML" onClick={onExportHTML} />
      </G>
      <G label="Print">
        <R icon={I.print} label="Print" onClick={onPrint} />
      </G>
      <G label="Close">
        <R icon={I.close} label="Close" onClick={onNew} />
      </G>
    </>
  );
}

function RibbonBtn({
  icon,
  label,
  onClick,
  active,
  size = 'md',
  accent,
  dropDown,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  size?: 'lg' | 'md' | 'sm';
  accent?: boolean;
  dropDown?: boolean;
}) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  return (
    <button
      className={`rb ${isLarge ? 'rb-lg' : ''} ${isSmall ? 'rb-sm' : ''} ${active ? 'active' : ''} ${accent ? 'accent' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="rb-icon">{icon}</span>
      <span className="rb-text">{label}</span>
      {dropDown && <KeyboardArrowDownIcon sx={{ fontSize: 10, ml: -0.3 }} />}
    </button>
  );
}

function RibbonToggle({
  icon,
  onClick,
  active,
  title,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      className={`rb-toggle ${active ? 'active' : ''}`}
      onClick={onClick}
      type="button"
      title={title}
    >
      {icon}
    </button>
  );
}

function RibbonDropdown({
  label,
  icon,
  children,
  align,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <RibbonBtn
        icon={icon}
        label={label}
        size="sm"
        dropDown
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div
          className="ribbon-dropdown-menu"
          style={{ left: align === 'right' ? 'auto' : 0, right: align === 'right' ? 0 : 'auto' }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  icon,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className="ribbon-menu-item"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      disabled={disabled}
      type="button"
    >
      {icon && <span className="ribbon-menu-item-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

function MenuSeparator() {
  return <div className="ribbon-menu-separator" />;
}

function ColorPalette({
  onSelect,
  onClose,
}: {
  onSelect: (color: string) => void;
  onClose: () => void;
}) {
  const themeColors = [
    ['#ffffff', '#000000', '#44546a', '#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47', '#264478'],
    ['#f2f2f2', '#7f7f7f', '#d6e4f0', '#dce6f1', '#fce4d6', '#ededed', '#fff2cc', '#deeaf6', '#e2efda', '#d6e4f0'],
    ['#d8d8d8', '#595959', '#adb9ca', '#b4c6e7', '#f8cbad', '#dbdbdb', '#ffe699', '#bdd7ee', '#c5e0b3', '#adb9ca'],
    ['#bfbfbf', '#3f3f3f', '#8496b0', '#8eaadb', '#f4b183', '#c9c9c9', '#ffd966', '#9cc3e5', '#a8d08d', '#8496b0'],
    ['#a5a5a5', '#262626', '#5b6e85', '#2f5496', '#c55a11', '#7b7b7b', '#c9b037', '#2e75b6', '#538135', '#264478'],
    ['#7f7f7f', '#0c0c0c', '#2f3e50', '#222a35', '#833c0c', '#525252', '#806000', '#1f4e79', '#375623', '#17375e'],
  ];
  const standardColors = ['#c00000', '#ff0000', '#ff6600', '#ffc000', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'];

  return (
    <div className="color-palette" onClick={(e) => e.stopPropagation()}>
      <button className="ribbon-menu-item" onClick={() => { onSelect(''); onClose(); }} type="button">No Fill</button>
      <div className="color-palette-label">Theme Colors</div>
      <div className="color-palette-grid">
        {themeColors.map((row, ri) =>
          row.map((c, ci) => (
            <button
              key={`${ri}-${ci}`}
              className="color-palette-swatch"
              style={{ background: c }}
              onClick={() => { onSelect(c); onClose(); }}
              type="button"
              title={c}
            />
          ))
        )}
      </div>
      <div className="color-palette-label">Standard Colors</div>
      <div className="color-palette-grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {standardColors.map((c) => (
          <button
            key={c}
            className="color-palette-swatch"
            style={{ background: c }}
            onClick={() => { onSelect(c); onClose(); }}
            type="button"
            title={c}
          />
        ))}
      </div>
      <MenuSeparator />
      <label className="ribbon-menu-item" style={{ cursor: 'pointer' }}>
        More Colors...
        <input
          type="color"
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          onChange={(e) => { onSelect(e.target.value); onClose(); }}
        />
      </label>
    </div>
  );
}

function HomeRibbon(props: RibbonProps) {
  const [fillColor, setFillColor] = useState('#facc15');
  const [textColor, setTextColor] = useState('#ef4444');

  return (
    <>
      {/* ─── Clipboard ─── */}
      <G label="Clipboard">
        <div className="rg-clipboard">
          <RibbonBtn icon={<ContentPasteIcon sx={{ fontSize: 22 }} />} label="Paste" onClick={props.onPaste} size="lg" />
          <div className="rg-clipboard-side">
            <RibbonBtn icon={I.cut} label="Cut" onClick={props.onCut} size="sm" />
            <RibbonBtn icon={I.copy} label="Copy" onClick={props.onCopy} size="sm" />
            <RibbonBtn icon={I.formatPainter} label="Format Painter" onClick={props.onFormatPainter} active={props.formatPainterActive} size="sm" />
          </div>
        </div>
      </G>

      {/* ─── Font ─── */}
      <G label="Font">
        <div className="rg-font">
          <div className="rg-font-row">
            <select
              className="ribbon-select"
              style={{ flex: 1, minWidth: 0 }}
              value={props.fontFamily}
              onChange={(e) => props.onFontFamilyChange(e.target.value)}
            >
              <option value="Inter">Inter</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
              <option value="Roboto">Roboto</option>
              <option value="Aptos">Aptos</option>
            </select>
            <select
              className="ribbon-select ribbon-select-sm"
              value={props.fontSize}
              onChange={(e) => props.onFontSizeChange(Number(e.target.value))}
            >
              {[8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 36, 48, 72].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <RibbonToggle icon={<FormatSizeIcon sx={{ fontSize: 15 }} />} onClick={props.onIncreaseFontSize} title="Increase Font Size" />
            <RibbonToggle icon={<span style={{ fontSize: 12, fontWeight: 700 }}>A</span>} onClick={props.onDecreaseFontSize} title="Decrease Font Size" />
          </div>
          <div className="rg-font-row">
            <RibbonToggle icon={I.bold} active={props.bold} onClick={props.onToggleBold} title="Bold" />
            <RibbonToggle icon={I.italic} active={props.italic} onClick={props.onToggleItalic} title="Italic" />
            <RibbonToggle icon={I.underline} active={props.underline} onClick={props.onToggleUnderline} title="Underline" />
            <div className="rb-sep-v" />
            <RibbonToggle icon={I.borderGrid} title="Borders" />
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                className="rb-color-btn"
                title="Fill Color"
                onClick={() => { props.onFillColor?.(fillColor); }}
                style={{ cursor: 'pointer' }}
              >
                <FormatColorFillIcon sx={{ fontSize: 14 }} />
                <span className="rb-color-stripe" style={{ background: fillColor }} />
              </div>
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                className="rb-color-btn"
                title="Font Color"
                onClick={() => { props.onTextColor?.(textColor); }}
                style={{ cursor: 'pointer' }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>A</span>
                <span className="rb-color-stripe" style={{ background: textColor }} />
              </div>
            </div>
          </div>
        </div>
      </G>

      {/* ─── Alignment ─── */}
      <G label="Alignment">
        <div className="rg-align">
          <div className="rg-align-row">
            <RibbonToggle icon={<VerticalAlignTopIcon sx={{ fontSize: 15 }} />} active={props.verticalAlign === 'top'} onClick={() => props.onVerticalAlignChange('top')} title="Top Align" />
            <RibbonToggle icon={<VerticalAlignCenterIcon sx={{ fontSize: 15 }} />} active={props.verticalAlign === 'middle'} onClick={() => props.onVerticalAlignChange('middle')} title="Middle Align" />
            <RibbonToggle icon={<VerticalAlignBottomIcon sx={{ fontSize: 15 }} />} active={props.verticalAlign === 'bottom'} onClick={() => props.onVerticalAlignChange('bottom')} title="Bottom Align" />
            <div className="rb-sep-v" />
            <RibbonBtn icon={<span style={{ fontSize: 11, fontWeight: 600, fontStyle: 'italic' }}>ab</span>} label="Orientation" size="sm" dropDown />
            <div className="rb-sep-v" />
            <RibbonBtn icon={I.wrap} label="Wrap Text" size="sm" active={props.wrapText} onClick={props.onToggleWrapText} />
          </div>
          <div className="rg-align-row">
            <RibbonToggle icon={I.alignLeft} active={props.textAlign === 'left'} onClick={() => props.onTextAlignChange('left')} title="Align Left" />
            <RibbonToggle icon={I.alignCenter} active={props.textAlign === 'center'} onClick={() => props.onTextAlignChange('center')} title="Center" />
            <RibbonToggle icon={I.alignRight} active={props.textAlign === 'right'} onClick={() => props.onTextAlignChange('right')} title="Align Right" />
            <div className="rb-sep-v" />
            <RibbonToggle icon={I.indentDecrease} title="Decrease Indent" />
            <RibbonToggle icon={I.indentIncrease} title="Increase Indent" />
            <div className="rb-sep-v" />
            <RibbonBtn icon={I.merge} label="Merge & Center" dropDown onClick={props.onMergeCells} />
          </div>
        </div>
      </G>

      {/* ─── Number ─── */}
      <G label="Number">
        <div className="rg-number">
          <select
            className="ribbon-select"
            style={{ width: '100%' }}
            value={props.numberFormat}
            onChange={(e) => props.onNumberFormatChange(e.target.value)}
          >
            <option>General</option>
            <option>Number</option>
            <option>Currency</option>
            <option>Currency ($)</option>
            <option>Percentage</option>
            <option>Date</option>
            <option>Time</option>
            <option>Scientific</option>
            <option>Text</option>
          </select>
          <div className="rg-number-row">
            <RibbonBtn icon={I.currency} label="$" size="sm" onClick={() => props.onNumberFormatChange('Currency ($)')} />
            <RibbonBtn icon={I.percent} label="%" size="sm" onClick={() => props.onNumberFormatChange('Percentage')} />
            <div className="rb-sep-v" />
            <RibbonBtn icon={<span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>,</span>} label="" size="sm" />
            <div className="rb-sep-v" />
            <RibbonToggle icon={<span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>.00→</span>} onClick={props.onIncreaseDecimal} title="Increase Decimal" />
            <RibbonToggle icon={<span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>←.00</span>} onClick={props.onDecreaseDecimal} title="Decrease Decimal" />
          </div>
        </div>
      </G>

      {/* ─── Styles ─── */}
      <G label="Styles">
        <div className="rg-styles">
          <RibbonBtn icon={<ViewQuiltIcon sx={{ fontSize: 18 }} />} label="Conditional" dropDown />
          <RibbonBtn icon={<PaletteIcon sx={{ fontSize: 18 }} />} label="Format as Table" dropDown />
          <div className="rg-cell-styles">
            <div className="rg-style-box rg-style-normal" title="Normal">Normal</div>
            <div
              className="rg-style-box rg-style-bad"
              title="Bad - Red background"
              onClick={() => props.onFillColor?.('#fff2f2')}
              style={{ cursor: 'pointer' }}
            >
              Bad
            </div>
            <div
              className="rg-style-box rg-style-good"
              title="Good - Green background"
              onClick={() => props.onFillColor?.('#dcfce7')}
              style={{ cursor: 'pointer' }}
            >
              Good
            </div>
            <div
              className="rg-style-box rg-style-neutral"
              title="Neutral - Yellow background"
              onClick={() => props.onFillColor?.('#fef9c3')}
              style={{ cursor: 'pointer' }}
            >
              Neutral
            </div>
          </div>
        </div>
      </G>

      {/* ─── Cells ─── */}
      <G label="Cells">
        <div className="rg-cells">
          <RibbonDropdown label="Insert" icon={<AddIcon sx={{ fontSize: 16 }} />}>
            <MenuItem label="Insert Cells..." onClick={props.onInsertRowBelow} icon={<AddIcon sx={{ fontSize: 14 }} />} />
            <MenuItem label="Insert Sheet Rows" onClick={props.onInsertRowAbove} />
            <MenuItem label="Insert Sheet Columns" onClick={props.onInsertColRight} />
          </RibbonDropdown>
          <RibbonDropdown label="Delete" icon={<DeleteIcon sx={{ fontSize: 16, color: '#ef4444' }} />}>
            <MenuItem label="Delete Cells..." onClick={props.onDeleteRow} icon={<DeleteIcon sx={{ fontSize: 14 }} />} />
            <MenuItem label="Delete Sheet Rows" onClick={props.onDeleteRow} />
            <MenuItem label="Delete Sheet Columns" onClick={props.onDeleteCol} />
          </RibbonDropdown>
          <RibbonDropdown label="Format" icon={<AspectRatioIcon sx={{ fontSize: 16 }} />}>
            <MenuItem label="Row Height..." onClick={() => {
              const h = prompt('Row height (px):', '28');
              if (h) props.onFormatRowHeight?.(Number(h));
            }} />
            <MenuItem label="Column Width..." onClick={() => {
              const w = prompt('Column width (px):', '100');
              if (w) props.onFormatColWidth?.(Number(w));
            }} />
            <MenuSeparator />
            <MenuItem label="Default Width..." onClick={() => {
              props.onFormatColWidth?.(100);
            }} />
          </RibbonDropdown>
        </div>
      </G>

      {/* ─── Editing ─── */}
      <G label="Editing">
        <div className="rg-editing">
          <div className="rg-editing-col">
            <RibbonDropdown label="AutoSum" icon={I.sum}>
              <MenuItem label="Sum" onClick={props.onAutoSum} />
              <MenuItem label="Average" onClick={props.onAutoAverage} />
              <MenuItem label="Count Numbers" onClick={props.onAutoCount} />
              <MenuSeparator />
              <MenuItem label="Max" onClick={props.onAutoMax} />
              <MenuItem label="Min" onClick={props.onAutoMin} />
            </RibbonDropdown>
            <RibbonDropdown label="Fill" icon={<ArrowDownwardIcon sx={{ fontSize: 15 }} />}>
              <MenuItem label="Down" onClick={props.onFillDown} />
              <MenuItem label="Right" onClick={props.onFillRight} />
              <MenuItem label="Up" onClick={props.onFillUp} />
              <MenuItem label="Left" onClick={props.onFillLeft} />
            </RibbonDropdown>
            <RibbonDropdown label="Clear" icon={I.eraser}>
              <MenuItem label="Clear All" onClick={props.onClearAll} />
              <MenuItem label="Clear Formats" onClick={props.onClearFormats} />
              <MenuItem label="Clear Contents" onClick={props.onClearContents} />
            </RibbonDropdown>
          </div>
          <div className="rg-editing-col">
            <RibbonDropdown label="Sort & Filter" icon={I.sort}>
              <MenuItem label="Sort A to Z" onClick={props.onSortAsc} />
              <MenuItem label="Sort Z to A" onClick={props.onSortDesc} />
              <MenuSeparator />
              <MenuItem label="Clear Filter" onClick={props.toggleFilter} />
            </RibbonDropdown>
            <RibbonDropdown label="Find & Select" icon={I.find}>
              <MenuItem label="Find..." onClick={props.onFind} />
              <MenuItem label="Replace..." onClick={props.onFind} />
              <MenuSeparator />
              <MenuItem label="Go To..." onClick={props.onFind} />
            </RibbonDropdown>
          </div>
        </div>
      </G>
    </>
  );
}

function InsertRibbon() {
  return (
    <>
      <G label="Tables">
        <R icon={I.format} label="Table" />
        <R icon={I.format} label="Pivot Table" small />
      </G>
      <G label="Charts">
        <R icon={I.aiChart} label="Bar" accent />
        <R icon={I.aiChart} label="Line" accent />
        <R icon={I.aiChart} label="Pie" accent />
        <R icon={I.aiChart} label="Scatter" accent />
        <R icon={I.aiChart} label="Radar" accent />
      </G>
      <G label="Illustrations">
        <R icon={I.pen} label="Shapes" small />
      </G>
      <G label="Links">
        <R icon={I.open} label="Link" small />
      </G>
      <G label="Text">
        <R icon={I.file} label="Text Box" small />
        <R icon={I.file} label="WordArt" small />
      </G>
      <G label="Symbols">
        <R icon={I.function} label="Equation" small />
        <R icon={I.symbol} label="Symbol" small />
      </G>
    </>
  );
}

function DrawRibbon() {
  return (
    <>
      <G label="Pens">
        <R icon={I.pen} label="Pen" />
        <R icon={I.highlighter} label="Highlight" />
        <R icon={I.eraser} label="Eraser" />
      </G>
      <G label="Convert">
        <R icon={I.pen} label="Ink to Shape" small />
      </G>
      <G label="Actions">
        <R icon={I.sort} label="Undo" small />
        <R icon={I.sortDesc} label="Redo" small />
      </G>
    </>
  );
}

function PageLayoutRibbon() {
  return (
    <>
      <G label="Themes">
        <R icon={I.style} label="Colors" small />
        <R icon={I.style} label="Fonts" small />
        <R icon={I.style} label="Effects" small />
      </G>
      <G label="Page Setup">
        <R icon={I.margins} label="Margins" small />
        <R icon={I.orientation} label="Orientation" />
        <R icon={I.size} label="Size" small />
        <R icon={I.bg} label="Background" small />
      </G>
      <G label="Scale to Fit">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Width: Auto
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Height: Auto
          </div>
        </div>
      </G>
      <G label="Sheet Options">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="ribbon-checkbox">
            <input type="checkbox" defaultChecked /> Gridlines
          </label>
          <label className="ribbon-checkbox">
            <input type="checkbox" defaultChecked /> Headings
          </label>
        </div>
      </G>
    </>
  );
}

function FormulasRibbon() {
  return (
    <>
      <G label="Function Library">
        <R icon={I.function} label="Insert Function" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <R icon={I.sum} label="AutoSum" small />
          <R icon={I.function} label="Financial" small />
          <R icon={I.function} label="Logical" small />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <R icon={I.function} label="Text" small />
          <R icon={I.function} label="Date/Time" small />
          <R icon={I.function} label="Lookup" small />
        </div>
        <R icon={I.aiDollar} label="More" small accent />
      </G>
      <G label="Defined Names">
        <R icon={I.nameManager} label="Name Manager" />
        <R icon={I.nameManager} label="Define Name" small />
      </G>
      <G label="Formula Auditing">
        <R icon={I.trace} label="Trace Precedents" small />
        <R icon={I.trace} label="Trace Dependents" small />
        <R icon={I.showFormula} label="Show Formulas" small />
        <R icon={I.validate} label="Error Check" small />
      </G>
      <G label="Calculation">
        <R icon={I.calc} label="Calculate Now" />
        <R icon={I.calc} label="Calc Mode" small />
      </G>
    </>
  );
}

function DataRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Get & Transform">
        <R icon={I.dataImport} label="From CSV" onClick={props.onImport} />
        <R icon={I.open} label="From Web" small />
      </G>
      <G label="Sort & Filter">
        <div style={{ display: 'flex', gap: 4 }}>
          <R icon={I.sortAsc} label="A→Z" onClick={props.onSortAsc} small />
          <R icon={I.sortDesc} label="Z→A" onClick={props.onSortDesc} small />
        </div>
        <R icon={I.sort} label="Custom" small />
        <R
          icon={I.filter}
          label="Filter"
          onClick={props.toggleFilter}
          active={props.filterActive}
        />
        <R icon={I.clearFilter} label="Clear" small />
      </G>
      <G label="Data Tools">
        <R icon={I.removeDup} label="Remove Dups" onClick={props.onRemoveDuplicates} />
        <R icon={I.validate} label="Validation" small />
        <R icon={I.aiChart} label="What-If" small accent />
      </G>
      <G label="Forecast">
        <R icon={I.aiChart} label="Forecast" small accent />
      </G>
      <G label="Outline">
        <R icon={I.group} label="Group" small />
        <R icon={I.group} label="Ungroup" small />
        <R icon={I.group} label="Subtotal" small />
      </G>
    </>
  );
}

function ReviewRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Proofing">
        <R icon={I.spellcheck} label="Spelling" />
        <R icon={I.spellcheck} label="Thesaurus" small />
      </G>
      <G label="Comments">
        <R icon={I.comment} label="New Comment" />
        <R icon={I.delete} label="Delete" small />
        <R icon={I.sort} label="Navigate" small />
      </G>
      <G label="Find">
        <R icon={I.find} label="Find & Replace" onClick={props.onFind} />
        <R icon={I.find} label="Go To" small onClick={props.onFind} />
      </G>
      <G label="Protect">
        <R icon={I.lock} label="Protect Sheet" />
        <R icon={I.lock} label="Protect Workbook" small />
      </G>
      <G label="Changes">
        <R icon={I.merge} label="Merge" small />
        <R icon={I.eye} label="Track Changes" small />
      </G>
    </>
  );
}

function ViewRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Workbook Views">
        <R icon={I.file} label="Normal" active />
        <R icon={I.file} label="Page Layout" small />
        <R icon={I.file} label="Page Break" small />
      </G>
      <G label="Show">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="ribbon-checkbox">
            <input
              type="checkbox"
              checked={props.showGridlines}
              onChange={props.onToggleGridlines}
            />{' '}
            Gridlines
          </label>
          <label className="ribbon-checkbox">
            <input
              type="checkbox"
              checked={props.showFormulaBar}
              onChange={props.onToggleFormulaBar}
            />{' '}
            Formula Bar
          </label>
          <label className="ribbon-checkbox">
            <input type="checkbox" checked={props.showHeadings} onChange={props.onToggleHeadings} />{' '}
            Headings
          </label>
        </div>
      </G>
      <G label="Zoom">
        <R
          icon={I.zoomIn}
          label="Zoom +"
          onClick={() => props.onZoomChange(Math.min(200, props.zoom + 10))}
        />
        <R
          icon={I.zoomOut}
          label="Zoom −"
          onClick={() => props.onZoomChange(Math.max(25, props.zoom - 10))}
        />
        <R icon={I.eye} label={`${props.zoom}%`} small />
      </G>
      <G label="Window">
        <R icon={I.freeze} label="Freeze" small />
        <R icon={I.split} label="Split" small />
      </G>
      <G label="Dashboards">
        <R
          icon={I.dashboard}
          label="Open Dashboard"
          onClick={() => props.onAIAnalystAction('dashboard')}
          accent
        />
      </G>
    </>
  );
}

function AIAnalystRibbon(props: RibbonProps) {
  return (
    <>
      <G label="AI Chat">
        <R
          icon={
            <span className={props.aiProcessing ? 'ai-spin' : ''}>
              {props.chatOpen ? I.chat : I.eye}
            </span>
          }
          label={props.chatOpen ? 'Close Chat' : 'Open Chat'}
          onClick={props.onToggleChat}
          accent
          active={props.chatOpen}
        />
      </G>
      <G label="Automate">
        <R
          icon={I.replay}
          label="Replays"
          onClick={() => props.onAIAnalystAction('replays')}
          accent
        />
        <R
          icon={I.template}
          label="Templates"
          onClick={() => props.onAIAnalystAction('templates')}
          accent
        />
      </G>
      <G label="Scripts">
        <R
          icon={I.python}
          label="Python"
          onClick={() => props.onAIAnalystAction('scripts')}
          accent
        />
      </G>
      <G label="AI Generate">
        <R
          icon={I.aiDollar}
          label="AI Column"
          onClick={() => props.onAIAnalystAction('ai-column')}
          accent
        />
        <R
          icon={I.aiChart}
          label="AI Forecast"
          onClick={() => props.onAIAnalystAction('ai-forecast')}
          accent
        />
      </G>
      <G label="Settings">
        <R
          icon={I.settings}
          label="BYOK Config"
          onClick={() => props.onAIAnalystAction('settings')}
        />
      </G>
    </>
  );
}

export function Ribbon(props: RibbonProps) {
  const activeTabIndex = TABS.indexOf(props.activeTab);

  return (
    <div className="ribbon">
      {/* Tab Bar */}
      <div className="ribbon-tabs">
        <div className="logo-tab">
          <svg viewBox="0 0 28 28" fill="none" className="h-5 w-5">
            <rect width="28" height="28" rx="7" fill="#6c5ce7" />
            <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <Tabs
          value={activeTabIndex >= 0 ? activeTabIndex : false}
          onChange={(_, newValue) => {
            if (typeof newValue === 'number') {
              props.onTabChange(TABS[newValue]!);
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ indicator: { sx: { display: 'none' } } }}
          sx={{
            minHeight: 36,
            flex: 1,
            '& .MuiTab-root': {
              minHeight: 36,
              padding: '0 16px',
              fontSize: 12.5,
              fontWeight: 500,
              color: 'var(--text-ribbon)',
              textTransform: 'none',
              fontFamily: 'var(--font-sans)',
              transition: 'background 0.12s',
              position: 'relative',
              '&:hover': { background: 'var(--bg-grid-hover)' },
              '&.Mui-selected': {
                color: 'var(--text-ribbon-active)',
                fontWeight: 600,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 16,
                  right: 16,
                  height: '2.5px',
                  background: 'var(--text-ribbon-active)',
                  borderRadius: '2px 2px 0 0',
                },
              },
              '&.ai-tab.Mui-selected': {
                color: 'var(--accent)',
                '&::after': { background: 'var(--accent)' },
              },
            },
          }}
        >
          {TABS.map((t) => (
            <Tab
              key={t}
              disableRipple
              className={`ribbon-tab ${t === 'AI Analyst' ? 'ai-tab' : ''}`}
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t === 'AI Analyst' && (
                    <span className={`ai-tab-dot ${props.aiProcessing ? 'processing' : ''}`} />
                  )}
                  {t}
                </span>
              }
            />
          ))}
        </Tabs>
        <div className="ribbon-spacer" />
        <div className="ribbon-tabs-right">
          <IconButton className="ribbon-tab-right" disableRipple size="small">
            <SearchIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton className="ribbon-tab-right" disableRipple size="small">
            <NotificationsIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton className="ribbon-tab-right" disableRipple size="small">
            <MoreHorizIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <div className="ribbon-toolbar">
        {props.activeTab === 'File' && (
          <FileRibbon
            onNew={props.onNewWorkbook}
            onImport={props.onImport}
            onExportExcel={props.onExportExcel}
            onExportHTML={props.onExportHTML}
            onPrint={props.onPrint}
          />
        )}
        {props.activeTab === 'Home' && <HomeRibbon {...props} />}
        {props.activeTab === 'Insert' && <InsertRibbon />}
        {props.activeTab === 'Draw' && <DrawRibbon />}
        {props.activeTab === 'Page Layout' && <PageLayoutRibbon />}
        {props.activeTab === 'Formulas' && <FormulasRibbon />}
        {props.activeTab === 'Data' && <DataRibbon {...props} />}
        {props.activeTab === 'Review' && <ReviewRibbon {...props} />}
        {props.activeTab === 'View' && <ViewRibbon {...props} />}
        {props.activeTab === 'AI Analyst' && <AIAnalystRibbon {...props} />}
      </div>

      <style>{`
        .ribbon {
          grid-area: ribbon;
          background: var(--bg-ribbon);
          border-bottom: 1px solid var(--border-ribbon);
          display: flex;
          flex-direction: column;
          grid-column: 1 / -1;
        }
        .ribbon-tabs {
          display: flex;
          align-items: center;
          padding: 0;
          background: var(--bg-ribbon);
          border-bottom: 1px solid var(--border-ribbon);
          min-height: 36px;
        }
        .logo-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          height: 36px;
          border-right: 1px solid var(--border-ribbon);
          cursor: default;
        }
        .ribbon-tab {
          padding: 0 16px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          font-size: 12.5px !important;
          font-weight: 500 !important;
          color: var(--text-ribbon) !important;
          cursor: pointer !important;
          position: relative !important;
          transition: background 0.12s !important;
          user-select: none !important;
          border: none !important;
          background: transparent !important;
          font-family: var(--font-sans) !important;
          min-width: 0 !important;
        }
        .ribbon-tab:hover { background: var(--bg-grid-hover) !important; }
        .ribbon-tab.active { color: var(--text-ribbon-active) !important; font-weight: 600 !important; }
        .ribbon-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 16px;
          right: 16px;
          height: 2.5px;
          background: var(--text-ribbon-active);
          border-radius: 2px 2px 0 0;
        }
        .ribbon-tab.ai-tab.active { color: var(--accent) !important; }
        .ribbon-tab.ai-tab.active::after { background: var(--accent) !important; }
        .ai-tab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        .ai-tab-dot.processing { animation: pulse 1s ease-in-out infinite; }
        .ribbon-spacer { flex: 1; }
        .ribbon-tabs-right { display: flex; align-items: center; gap: 4px; padding: 0 12px; }
        .ribbon-tab-right {
          padding: 4px 12px !important; border-radius: 6px !important; font-size: 12px !important;
          font-weight: 500 !important; color: var(--text-secondary) !important; cursor: pointer !important;
          background: transparent !important; border: none !important; font-family: var(--font-sans) !important;
          transition: all 0.12s !important; display: flex !important; align-items: center !important; gap: 4px !important;
        }
        .ribbon-tab-right:hover { background: var(--bg-grid-hover) !important; color: var(--text-primary) !important; }

        .ribbon-toolbar {
          display: flex;
          align-items: stretch;
          padding: 6px 12px 2px;
          background: var(--bg-ribbon);
          min-height: 86px;
          gap: 0;
          overflow-x: auto;
        }
        .ribbon-group {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 4px 8px 0;
          border-right: 1px solid var(--border-ribbon);
          position: relative;
          flex-shrink: 1;
          min-width: 0;
        }
        .ribbon-group:last-child { border-right: none; }
        .ribbon-group-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 2px 4px 1px;
          border-top: 1px solid var(--border-light);
        }
        .ribbon-group-label {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .ribbon-dialog-launcher {
          display: flex;
          align-items: center;
          color: var(--text-tertiary);
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .ribbon-dialog-launcher:hover { opacity: 1; color: var(--text-primary); }
        .ribbon-group-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex: 1;
          min-height: 0;
        }

        .ribbon-select {
          padding: 3px 6px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 11px;
          font-family: var(--font-sans);
          background: var(--bg-surface);
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .ribbon-select:focus { border-color: var(--accent); }
        .ribbon-select-sm { width: 48px; }
        .ribbon-checkbox {
          display: flex; align-items: center; gap: 4px; font-size: 11px;
          color: var(--text-secondary); cursor: pointer; white-space: nowrap;
        }
        .ribbon-checkbox input[type="checkbox"] { accent-color: var(--accent); width: 12px; height: 12px; }
        .mono-sm { font-size: 11px; font-weight: 600; font-family: var(--font-mono); color: var(--text-secondary); }

        .rb {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          padding: 3px 6px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: all 0.12s ease;
          white-space: nowrap;
          min-width: 0;
          line-height: 1;
        }
        .rb:hover { background: #e5e7eb; border-color: #d1d5db; }
        .rb:active { background: #d1d5db; }
        .rb.active { background: #dbeafe; border-color: #93c5fd; }
        .rb.accent { color: var(--accent); }
        .rb-lg { padding: 4px 10px 2px; min-width: 48px; }
        .rb-sm { padding: 2px 4px; min-width: 0; }
        .rb-icon { display: flex; align-items: center; justify-content: center; color: #374151; }
        .rb-lg .rb-icon { color: var(--accent); margin-bottom: 1px; }
        .rb:hover .rb-icon { color: #111827; }
        .rb-text { font-size: 10px; font-weight: 500; color: #6b7280; }
        .rb-lg .rb-text { font-size: 10.5px; color: #374151; font-weight: 600; }
        .rb-sm .rb-text { font-size: 9.5px; }
        .rb:hover .rb-text { color: #111827; }

        .rb-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          color: #374151;
          transition: all 0.12s ease;
        }
        .rb-toggle:hover { background: #e5e7eb; border-color: #d1d5db; }
        .rb-toggle:active { background: #d1d5db; }
        .rb-toggle.active { background: #dbeafe; border-color: #93c5fd; color: #2563eb; }
        .ribbon-dropdown-menu {
          position: absolute;
          top: 100%;
          z-index: 200;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.14);
          min-width: 180px;
          padding: 4px 0;
        }
        .ribbon-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 5px 12px;
          border: none;
          background: transparent;
          font-size: 11.5px;
          font-family: var(--font-sans);
          color: #1f2937;
          cursor: pointer;
          text-align: left;
          white-space: nowrap;
        }
        .ribbon-menu-item:hover { background: #e5e7eb; }
        .ribbon-menu-item:disabled { opacity: 0.4; cursor: default; }
        .ribbon-menu-item:disabled:hover { background: transparent; }
        .ribbon-menu-item-icon { display: flex; align-items: center; width: 16px; justify-content: center; }
        .ribbon-menu-separator { height: 1px; background: #e5e7eb; margin: 3px 0; }
        .color-palette { padding: 6px 8px; min-width: 200px; }
        .color-palette-label { font-size: 10px; color: #6b7280; margin: 6px 0 4px; }
        .color-palette-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; }
        .color-palette-swatch {
          width: 16px; height: 16px; border: 1px solid #d1d5db; border-radius: 2px;
          cursor: pointer; padding: 0; transition: transform 0.1s;
        }
        .color-palette-swatch:hover { transform: scale(1.3); z-index: 1; border-color: #000; }

        .rb-sep-v {
          width: 1px;
          height: 20px;
          background: #e5e7eb;
          margin: 0 2px;
          flex-shrink: 0;
        }

        .rb-color-btn {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2px 4px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          color: #374151;
          transition: all 0.12s ease;
          gap: 0;
        }
        .rb-color-btn:hover { background: #e5e7eb; border-color: #d1d5db; }
        .rb-color-stripe { width: 16px; height: 3px; border-radius: 1px; margin-top: 1px; }

        .rg-clipboard { display: flex; align-items: stretch; gap: 4px; }
        .rg-clipboard-side { display: flex; flex-direction: column; gap: 1px; }
        .rg-clipboard-side .rb { flex-direction: row; gap: 4px; justify-content: flex-start; padding: 2px 8px; min-width: 0; }
        .rg-clipboard-side .rb-text { font-size: 10px; }

        .rg-font { display: flex; flex-direction: column; gap: 3px; min-width: 200px; }
        .rg-font-row { display: flex; align-items: center; gap: 2px; }
        .rg-font-row .rb-toggle { width: 22px; height: 22px; }

        .rg-align { display: flex; flex-direction: column; gap: 3px; }
        .rg-align-row { display: flex; align-items: center; gap: 2px; }
        .rg-align-row .rb { padding: 2px 6px; }
        .rg-align-row .rb-toggle { width: 22px; height: 22px; }
        .rg-align-row .rb-text { font-size: 9.5px; }

        .rg-number { display: flex; flex-direction: column; gap: 4px; min-width: 110px; }
        .rg-number-row { display: flex; align-items: center; gap: 2px; }
        .rg-number-row .rb { padding: 2px 4px; }
        .rg-number-row .rb-toggle { width: 22px; height: 22px; font-size: 10px; }

        .rg-styles { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
        .rg-styles .rb { flex-direction: row; gap: 4px; align-items: center; justify-content: flex-start; padding: 3px 8px; min-width: 0; }
        .rg-styles .rb-text { font-size: 10px; }
        .rg-cell-styles { display: flex; gap: 3px; align-items: center; }
        .rg-style-box {
          width: 36px; height: 28px; border-radius: 3px; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          font-size: 7px; font-weight: 600; cursor: pointer; transition: all 0.12s;
        }
        .rg-style-box:hover { border-color: #93c5fd; }
        .rg-style-normal { background: #f9fafb; color: #6b7280; }
        .rg-style-bad { background: #fef2f2; color: #dc2626; }
        .rg-style-good { background: #f0fdf4; color: #16a34a; }
        .rg-style-neutral { background: #fffbeb; color: #d97706; }

        .rg-cells { display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
        .rg-cells .rb { flex-direction: row; gap: 4px; align-items: center; justify-content: flex-start; padding: 3px 8px; min-width: 0; }
        .rg-cells .rb-text { font-size: 10px; }

        .rg-editing { display: flex; gap: 6px; }
        .rg-editing-col { display: flex; flex-direction: column; gap: 3px; }
        .rg-editing-col .rb { flex-direction: row; gap: 4px; align-items: center; justify-content: flex-start; padding: 3px 8px; min-width: 0; }
        .rg-editing-col .rb-text { font-size: 10px; }

        .ai-spin { display: inline-flex; animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

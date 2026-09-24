'use client';

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
  fontFamily: string;
  onFontFamilyChange: (f: string) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
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
  onInsertRowAbove?: () => void;
  onInsertRowBelow?: () => void;
  onDeleteRow?: () => void;
  onInsertColLeft?: () => void;
  onInsertColRight?: () => void;
  onDeleteCol?: () => void;
  onFind?: () => void;
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
  newFile: <NoteAddIcon className="h-5 w-5" />,
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
  aiBrain: <PsychologyIcon className="h-5 w-5" style={{ color: 'var(--accent)' }} />,
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
        '&:hover': {
          background: 'var(--bg-grid-hover)',
        },
        '&:active': {
          background: 'var(--accent-bg)',
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
      <div className="ribbon-group-label">{label}</div>
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

function HomeRibbon(props: RibbonProps) {
  return (
    <>
      <G label="Clipboard">
        <R icon={I.clipboard} label="Paste" onClick={props.onPaste} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <R icon={I.copy} label="Copy" small onClick={props.onCopy} />
          <R icon={I.cut} label="Cut" small onClick={props.onCut} />
        </div>
      </G>
      <G label="Font">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <select
              className="ribbon-select"
              style={{ flex: 1, minWidth: 90 }}
              value={props.fontFamily}
              onChange={(e) => props.onFontFamilyChange(e.target.value)}
            >
              <option value="Inter">Inter</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
            </select>
            <select
              className="ribbon-select"
              style={{ width: 52 }}
              value={props.fontSize}
              onChange={(e) => props.onFontSizeChange(Number(e.target.value))}
            >
              {[8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 36, 48, 72].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <R icon={I.bold} label="" active={props.bold} onClick={props.onToggleBold} small />
            <R
              icon={I.italic}
              label=""
              active={props.italic}
              onClick={props.onToggleItalic}
              small
            />
            <R
              icon={I.underline}
              label=""
              active={props.underline}
              onClick={props.onToggleUnderline}
              small
            />
            <R
              icon={I.strikethrough}
              label=""
              active={props.strikethrough}
              onClick={props.onToggleStrikethrough}
              small
            />
          </div>
        </div>
      </G>
      <G label="Alignment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            <R
              icon={I.alignLeft}
              label=""
              active={props.textAlign === 'left'}
              onClick={() => props.onTextAlignChange('left')}
              small
            />
            <R
              icon={I.alignCenter}
              label=""
              active={props.textAlign === 'center'}
              onClick={() => props.onTextAlignChange('center')}
              small
            />
            <R
              icon={I.alignRight}
              label=""
              active={props.textAlign === 'right'}
              onClick={() => props.onTextAlignChange('right')}
              small
            />
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <R icon={I.merge} label="Merge" small />
            <R icon={I.wrap} label="Wrap" small />
          </div>
        </div>
      </G>
      <G label="Number">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
          <select
            className="ribbon-select"
            style={{ minWidth: 100 }}
            value={props.numberFormat}
            onChange={(e) => props.onNumberFormatChange(e.target.value)}
          >
            <option>General</option>
            <option>Currency</option>
            <option>Currency ($)</option>
            <option>Percentage</option>
            <option>Date</option>
            <option>Time</option>
            <option>Scientific</option>
            <option>Text</option>
          </select>
          <div style={{ display: 'flex', gap: 2 }}>
            <Button
              className="ribbon-btn ribbon-btn-sm"
              title="Increase Decimal"
              disableRipple
              disableElevation
              sx={{
                textTransform: 'none',
                minWidth: 32,
                padding: '4px',
                borderRadius: '6px',
                flexDirection: 'column',
                '&:hover': { background: 'var(--bg-grid-hover)' },
              }}
            >
              <span className="mono-sm">.0→.00</span>
            </Button>
            <Button
              className="ribbon-btn ribbon-btn-sm"
              title="Decrease Decimal"
              disableRipple
              disableElevation
              sx={{
                textTransform: 'none',
                minWidth: 32,
                padding: '4px',
                borderRadius: '6px',
                flexDirection: 'column',
                '&:hover': { background: 'var(--bg-grid-hover)' },
              }}
            >
              <span className="mono-sm">.00→.0</span>
            </Button>
          </div>
        </div>
      </G>
      <G label="Styles">
        <R icon={I.format} label="Conditional" small />
        <R icon={I.style} label="Cell Styles" small />
      </G>
      <G label="Cells">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <R icon={I.insert} label="Row ▲" small onClick={props.onInsertRowAbove} />
            <R icon={I.insert} label="Row ▼" small onClick={props.onInsertRowBelow} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <R icon={I.insert} label="Col ◀" small onClick={props.onInsertColLeft} />
            <R icon={I.insert} label="Col ▶" small onClick={props.onInsertColRight} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <R icon={I.delete} label="Del Row" small onClick={props.onDeleteRow} />
            <R icon={I.delete} label="Del Col" small onClick={props.onDeleteCol} />
          </div>
        </div>
      </G>
      <G label="Editing">
        <R icon={I.sort} label="Sort" onClick={props.onSortAsc} small />
        <R
          icon={I.filter}
          label="Filter"
          onClick={props.toggleFilter}
          small
          active={props.filterActive}
        />
        <R icon={I.find} label="Find" small onClick={props.onFind} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <R icon={I.sum} label="AutoSum" small />
          <R icon={I.function} label="Financial" small />
          <R icon={I.function} label="Logical" small />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        <div style={{ display: 'flex', gap: 2 }}>
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
        .ai-tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }
        .ai-tab-dot.processing {
          animation: pulse 1s ease-in-out infinite;
        }
        .ribbon-spacer { flex: 1; }
        .ribbon-tabs-right {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
        }
        .ribbon-tab-right {
          padding: 4px 12px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: var(--text-secondary) !important;
          cursor: pointer !important;
          background: transparent !important;
          border: none !important;
          font-family: var(--font-sans) !important;
          transition: all 0.12s !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .ribbon-tab-right:hover { background: var(--bg-grid-hover) !important; color: var(--text-primary) !important; }
        .ribbon-toolbar {
          display: flex;
          align-items: stretch;
          padding: 8px 12px;
          background: var(--bg-ribbon);
          min-height: 72px;
          gap: 8px;
          overflow-x: auto;
        }
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
        .ribbon-group:last-child { border-right: none; }
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
        .ribbon-group-content {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        .ribbon-btn {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2px !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          transition: background 0.12s !important;
          background: transparent !important;
          border: none !important;
          font-family: var(--font-sans) !important;
          min-width: 44px !important;
          box-shadow: none !important;
        }
        .ribbon-btn:hover { background: var(--bg-grid-hover) !important; }
        .ribbon-btn:active { background: var(--accent-bg) !important; }
        .ribbon-btn.active { background: var(--accent-bg) !important; outline: 1px solid var(--accent) !important; }
        .ribbon-btn svg { width: 20px; height: 20px; color: var(--text-secondary); }
        .ribbon-btn:hover svg { color: var(--text-primary); }
        .ribbon-btn span { font-size: 10.5px; font-weight: 500; color: var(--text-secondary); white-space: nowrap; }
        .ribbon-btn:hover span { color: var(--text-primary); }
        .ribbon-btn-paste {
          flex-direction: column !important;
          padding: 4px 12px !important;
          min-width: 52px !important;
        }
        .ribbon-btn-paste svg { width: 28px; height: 28px; color: var(--accent); }
        .ribbon-btn-sm { min-width: 32px !important; padding: 4px !important; }
        .ribbon-btn-sm svg { width: 16px; height: 16px; }
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
        }
        .ribbon-select:focus { border-color: var(--accent); }
        .ribbon-checkbox {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
        }
        .ribbon-checkbox input[type="checkbox"] {
          accent-color: var(--accent);
          width: 12px;
          height: 12px;
        }
        .mono-sm { font-size: 11px; font-weight: 600; font-family: var(--font-mono); color: var(--text-secondary); }
        .ribbon-separator {
          width: 1px;
          background: var(--border-ribbon);
          margin: 4px 4px;
          align-self: stretch;
        }
        .ai-spin {
          display: inline-flex;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

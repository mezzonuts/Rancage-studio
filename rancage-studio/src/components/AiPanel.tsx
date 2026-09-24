'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveIcon from '@mui/icons-material/Save';
import BuildIcon from '@mui/icons-material/Build';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TableChartIcon from '@mui/icons-material/TableChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { AIPanelTab } from '@/app/studio/page';
import type { FormulaGenerationResult } from '@/lib/ai/generation';
import type { ValidationResult } from '@/lib/ai/validator';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  sender: string;
  text: string;
  actions?: { icon: string; text: string }[];
  code?: string;
  lang?: string;
  formula?: string;
  validation?: ValidationResult;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    sender: 'Andika',
    text: 'Create a financial model for a food truck business. Include assumptions, quarterly projections, and charts.',
  },
  {
    id: '2',
    role: 'ai',
    sender: 'Rancagé Analyst',
    text: "Built the model across 3 sheets. Here's what I generated:",
    actions: [
      {
        icon: 'table',
        text: 'Created Assumptions table (Revenue per customer, daily transactions, costs)',
      },
      { icon: 'chart', text: 'Added quarterly projections (Q1–Q4) with formulas' },
      { icon: 'line', text: 'Generated 3 charts: Revenue, Expenses, Break-even analysis' },
    ],
  },
  {
    id: '3',
    role: 'user',
    sender: 'Andika',
    text: 'Show me the revenue trend with a line chart and add a forecast column.',
  },
  {
    id: '4',
    role: 'ai',
    sender: 'Rancagé Analyst',
    text: 'Created revenue trend chart and added AI-powered forecast column with confidence intervals. The forecast uses exponential smoothing with α = 0.3:',
    code: 'import numpy as np\n\ndef forecast(values, alpha=0.3, horizon=4):\n    smoothed = [values[0]]\n    for v in values[1:]:\n        smoothed.append(alpha * v + (1 - alpha) * smoothed[-1])\n    return [smoothed[-1] * (1 + 0.05 * i) for i in range(1, horizon + 1)]',
    lang: 'python',
  },
];

const QUICK_ACTIONS = [
  { icon: 'upload', label: 'Upload docs' },
  { icon: 'chart', label: 'Add chart' },
  { icon: 'column', label: 'New column' },
  { icon: 'save', label: 'Save replay' },
];

export interface AiPanelProps {
  onSend?: (message: string) => void;
  aiConnected?: boolean;
  chatOpen: boolean;
  onClose: () => void;
  aiProcessing: boolean;
  activeTab: AIPanelTab;
  onTabChange: (tab: AIPanelTab) => void;
  onFormulaGenerated?: (result: FormulaGenerationResult) => void;
}

function ActionIcon({ type }: { type: string }) {
  switch (type) {
    case 'table':
      return <TableChartIcon sx={{ fontSize: 14 }} />;
    case 'chart':
      return <BarChartIcon sx={{ fontSize: 14 }} />;
    case 'line':
      return <ShowChartIcon sx={{ fontSize: 14 }} />;
    default:
      return <AutoAwesomeIcon sx={{ fontSize: 14 }} />;
  }
}

function renderCode(code: string): React.ReactNode[] {
  const keywords = [
    'import',
    'as',
    'def',
    'return',
    'for',
    'in',
    'if',
    'else',
    'elif',
    'class',
    'from',
    'with',
    'try',
    'except',
    'while',
  ];
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = [];
    const tokens = line.split(/(\s+|[(),=\[\]:.])/);
    let inString = false;
    let stringChar = '';
    for (let j = 0; j < tokens.length; j++) {
      const t = tokens[j];
      if (!t) continue;
      if (inString) {
        parts.push(
          <span key={j} className="str">
            {t}
          </span>
        );
        if (t.endsWith(stringChar)) inString = false;
        continue;
      }
      if (t === '"' || t === "'") {
        inString = true;
        stringChar = t;
        parts.push(
          <span key={j} className="str">
            {t}
          </span>
        );
      } else if (keywords.includes(t)) {
        parts.push(
          <span key={j} className="kw">
            {t}
          </span>
        );
      } else if (/^\d+(\.\d+)?$/.test(t)) {
        parts.push(
          <span key={j} className="num">
            {t}
          </span>
        );
      } else if (t.startsWith('#')) {
        parts.push(
          <span key={j} className="cm">
            {t}
          </span>
        );
      } else {
        parts.push(<span key={j}>{t}</span>);
      }
    }
    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 ? '\n' : ''}
      </span>
    );
  });
}

/* Replays placeholder */
function ReplaysView() {
  const [replays] = useState([
    { id: 1, name: 'Revenue Analysis', date: '2 min ago', status: 'completed' },
    { id: 2, name: 'Cost Breakdown', date: '15 min ago', status: 'completed' },
    { id: 3, name: 'Forecast Q4', date: '1 hour ago', status: 'running' },
  ]);
  return (
    <div className="panel-subview">
      <div className="panel-subview-header">
        <span className="panel-subview-title">Replays</span>
        <span className="panel-subview-count">{replays.length}</span>
      </div>
      {replays.map((r) => (
        <div key={r.id} className="replay-item">
          <div className="replay-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
            </svg>
          </div>
          <div className="replay-info">
            <div className="replay-name">{r.name}</div>
            <div className="replay-date">{r.date}</div>
          </div>
          <span className={`replay-status ${r.status}`}>{r.status}</span>
        </div>
      ))}
    </div>
  );
}

/* Templates placeholder */
function TemplatesView() {
  const templates = [
    {
      id: 1,
      name: 'Financial Model',
      desc: 'Income statement, balance sheet, cash flow',
      icon: '📊',
    },
    { id: 2, name: 'Sales Dashboard', desc: 'Revenue tracking, pipeline, KPIs', icon: '📈' },
    {
      id: 3,
      name: 'Inventory Tracker',
      desc: 'Stock levels, reorder points, valuation',
      icon: '📦',
    },
    { id: 4, name: 'Project Budget', desc: 'Budget vs actual, resource allocation', icon: '💰' },
  ];
  return (
    <div className="panel-subview">
      <div className="panel-subview-header">
        <span className="panel-subview-title">Templates</span>
      </div>
      <div className="template-grid">
        {templates.map((t) => (
          <div key={t.id} className="template-card">
            <div className="template-icon">{t.icon}</div>
            <div className="template-name">{t.name}</div>
            <div className="template-desc">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Scripts placeholder */
function ScriptsView() {
  const [code, setCode] = useState(`# Python script for data analysis
import pandas as pd

def analyze(data):
    """Analyze uploaded data"""
    df = pd.DataFrame(data)
    summary = df.describe()
    return summary.to_dict()`);
  return (
    <div className="panel-subview">
      <div className="panel-subview-header">
        <span className="panel-subview-title">Python Scripts</span>
        <button className="panel-subview-btn">Run</button>
      </div>
      <textarea
        className="script-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="script-output">
        <div className="script-output-header">Output</div>
        <div className="script-output-content">Ready. Click &quot;Run&quot; to execute.</div>
      </div>
    </div>
  );
}

export function AiPanel({
  onSend,
  aiConnected = true,
  onClose,
  aiProcessing,
  activeTab,
  onTabChange,
  onFormulaGenerated,
}: AiPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      sender: 'Andika',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    onSend?.(text);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        role: 'ai',
        sender: 'Rancagé Analyst',
        text: `Processing your request: "${text}". I'll analyze the data and generate the appropriate formulas and visualizations.`,
      },
    ]);
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const TABS: { id: AIPanelTab; label: string }[] = [
    { id: 'Chat', label: 'Chat' },
    { id: 'Replays', label: 'Replays' },
    { id: 'Templates', label: 'Templates' },
    { id: 'Scripts', label: 'Scripts' },
  ];

  return (
    <aside className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className={`ai-dot ${aiProcessing ? 'processing' : ''}`} />
          AI Analyst
        </div>
        <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 0.5 }}>
          <IconButton size="small" title="Close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </div>
      <div className="panel-tabs">
        {TABS.map((t) => (
          <div
            key={t.id}
            className={`panel-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {activeTab === 'Chat' && (
        <>
          <div className="chat-area">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-msg">
                <div className={`chat-avatar ${msg.role}`}>{msg.role === 'ai' ? 'AI' : 'PC'}</div>
                <div className="chat-bubble">
                  <div className="sender">{msg.sender}</div>
                  <div className="text">{msg.text}</div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="action-card">
                      <div className="action-card-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                        </svg>
                        Actions performed
                      </div>
                      {msg.actions.map((action, i) => (
                        <div key={i} className="action-item">
                          <ActionIcon type={action.icon} />
                          {action.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.code && (
                    <div style={{ marginTop: 8 }}>
                      <pre>{renderCode(msg.code)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <div className="quick-actions">
              {QUICK_ACTIONS.map((a) => (
                <Chip
                  key={a.label}
                  icon={
                    a.icon === 'upload' ? <CloudUploadIcon sx={{ fontSize: 14 }} /> :
                    a.icon === 'chart' ? <BarChartIcon sx={{ fontSize: 14 }} /> :
                    a.icon === 'column' ? <ViewColumnIcon sx={{ fontSize: 14 }} /> :
                    <SaveIcon sx={{ fontSize: 14 }} />
                  }
                  label={a.label}
                  variant="outlined"
                  size="small"
                  className="quick-action"
                />
              ))}
            </div>
            <div className="chat-input-wrap">
              <TextField
                multiline
                maxRows={4}
                fullWidth
                size="small"
                placeholder="Ask the analyst anything... (Ctrl+Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                inputRef={textareaRef}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!input.trim()}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&.Mui-disabled': { backgroundColor: 'action.disabledBackground', color: 'action.disabled' },
                }}
              >
                <SendIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </div>
            <div className="chat-hint">
              {aiConnected
                ? 'Powered by BYOK LLM · Local-first · Unlimited formulas'
                : 'Configure AI in Settings · Ctrl+Shift+A'}
            </div>
          </div>
        </>
      )}

      {activeTab === 'Replays' && <ReplaysView />}
      {activeTab === 'Templates' && <TemplatesView />}
      {activeTab === 'Scripts' && <ScriptsView />}

      <style>{`
        .panel {
          background: var(--bg-surface);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;
          width: 380px;
        }
        .panel-header {
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .panel-title {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .panel-title .ai-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
        }
        .panel-title .ai-dot.processing {
          animation: pulse 1s ease-in-out infinite;
        }
        .panel-tabs {
          display: flex;
          gap: 0;
          padding: 0 20px;
          border-bottom: 1px solid var(--border-light);
        }
        .panel-tab {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .panel-tab:hover { color: var(--text-primary); }
        .panel-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-msg { display: flex; gap: 12px; max-width: 100%; }
        .chat-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0; font-weight: 600;
        }
        .chat-avatar.ai { background: var(--accent-gradient); color: #fff; }
        .chat-avatar.user { background: var(--bg-grid-header); color: var(--text-secondary); }
        .chat-bubble { flex: 1; min-width: 0; }
        .chat-bubble .sender { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
        .chat-bubble .text { font-size: 13px; line-height: 1.6; color: var(--text-primary); }
        .chat-bubble .text code {
          font-family: var(--font-mono); font-size: 12px;
          background: var(--bg-grid-header); padding: 1px 5px; border-radius: 6px; border: 1px solid var(--border);
        }
        .chat-bubble .text pre, .chat-bubble pre {
          background: #1a1b26; color: #c0caf5; font-family: var(--font-mono);
          font-size: 12px; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; line-height: 1.5;
        }
        .chat-bubble pre .kw { color: #bb9af7; }
        .chat-bubble pre .fn { color: #7aa2f7; }
        .chat-bubble pre .str { color: #9ece6a; }
        .chat-bubble pre .num { color: #ff9e64; }
        .chat-bubble pre .cm { color: #565f89; }
        .action-card {
          background: var(--bg-primary); border: 1px solid var(--border);
          border-radius: 8px; padding: 12px; margin-top: 8px;
        }
        .action-card-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
        }
        .action-card-header svg { width: 14px; height: 14px; color: var(--accent); }
        .action-item {
          display: flex; align-items: center; gap: 8px; padding: 8px 12px;
          border-radius: 6px; font-size: 12.5px; color: var(--text-primary);
          cursor: pointer; transition: background 0.1s;
        }
        .action-item:hover { background: var(--accent-bg); }
        .action-item svg { color: var(--accent); flex-shrink: 0; }
        .chat-input-area {
          padding: 16px 20px;
          border-top: 1px solid var(--border-light);
        }
        .chat-input-wrap {
          display: flex; align-items: flex-end; gap: 8px;
          background: var(--bg-primary); border: 1px solid var(--border);
          border-radius: 12px; padding: 8px 12px; transition: border-color 0.15s;
        }
        .chat-input-wrap:focus-within {
          border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-bg);
        }
        .chat-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-family: var(--font-sans); font-size: 13px; color: var(--text-primary);
          resize: none; min-height: 20px; max-height: 120px; line-height: 1.5;
        }
        .chat-input::placeholder { color: var(--text-tertiary); }
        .chat-send {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--accent); color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; flex-shrink: 0;
        }
        .chat-send:hover { background: var(--accent-hover); }
        .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-hint { font-size: 11px; color: var(--text-tertiary); margin-top: 8px; text-align: center; }
        .quick-actions { display: flex; gap: 8px; padding: 8px 0; flex-wrap: wrap; }
        .quick-action {
          display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px;
          border-radius: 20px; font-size: 12px; font-weight: 500;
          border: 1px solid var(--border); background: var(--bg-surface);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .quick-action:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
        .btn-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
        }
        .btn-icon:hover { background: var(--bg-grid-hover); color: var(--text-primary); }
        /* Sub-views */
        .panel-subview {
          flex: 1; overflow-y: auto; padding: 16px 20px;
        }
        .panel-subview-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .panel-subview-title { font-size: 15px; font-weight: 600; }
        .panel-subview-count {
          font-size: 11px; font-weight: 600; color: var(--accent);
          background: var(--accent-bg); padding: 2px 8px; border-radius: 10px;
        }
        .panel-subview-btn {
          padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          background: var(--accent); color: #fff; border: none; cursor: pointer;
        }
        .panel-subview-btn:hover { background: var(--accent-hover); }
        /* Replays */
        .replay-item {
          display: flex; align-items: center; gap: 12px; padding: 12px;
          border-radius: 8px; border: 1px solid var(--border-light);
          margin-bottom: 8px; transition: background 0.1s;
        }
        .replay-item:hover { background: var(--bg-grid-hover); }
        .replay-icon {
          width: 36px; height: 36px; border-radius: 8px; background: var(--accent-bg);
          display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0;
        }
        .replay-info { flex: 1; min-width: 0; }
        .replay-name { font-size: 13px; font-weight: 500; }
        .replay-date { font-size: 11px; color: var(--text-tertiary); }
        .replay-status {
          font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px;
        }
        .replay-status.completed { background: var(--success-bg); color: var(--success); }
        .replay-status.running { background: var(--accent-bg); color: var(--accent); }
        /* Templates */
        .template-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .template-card {
          padding: 16px 12px; border-radius: 8px; border: 1px solid var(--border-light);
          cursor: pointer; transition: all 0.15s; text-align: center;
        }
        .template-card:hover { border-color: var(--accent); background: var(--accent-bg); }
        .template-icon { font-size: 24px; margin-bottom: 8px; }
        .template-name { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
        .template-desc { font-size: 10px; color: var(--text-tertiary); }
        /* Scripts */
        .script-editor {
          width: 100%; min-height: 200px; padding: 12px; border-radius: 8px;
          background: #1a1b26; color: #c0caf5; font-family: var(--font-mono);
          font-size: 12px; line-height: 1.6; border: 1px solid var(--border);
          resize: vertical; outline: none; margin-bottom: 8px;
        }
        .script-editor:focus { border-color: var(--accent); }
        .script-output { border-radius: 8px; border: 1px solid var(--border-light); overflow: hidden; }
        .script-output-header {
          padding: 8px 12px; font-size: 11px; font-weight: 600;
          background: var(--bg-grid-header); color: var(--text-secondary);
        }
        .script-output-content {
          padding: 12px; font-size: 12px; font-family: var(--font-mono);
          color: var(--text-tertiary); min-height: 60px;
        }
      `}</style>
    </aside>
  );
}

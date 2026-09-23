'use client';

import { useState, useCallback, useRef, useEffect, type DragEvent } from 'react';

export interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => Promise<void>;
}

export function UploadModal({ open, onClose, onFilesSelected }: UploadModalProps) {
  const [dragover, setDragover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handle);
      return () => document.removeEventListener('mousedown', handle);
    }
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragover(false);
      if (e.dataTransfer.files.length > 0) {
        setError(null);
        setLoading(true);
        onFilesSelected(Array.from(e.dataTransfer.files))
          .then(() => onClose())
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Import failed');
            setLoading(false);
          });
      }
    },
    [onFilesSelected, onClose]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setError(null);
        setLoading(true);
        onFilesSelected(Array.from(e.target.files))
          .then(() => onClose())
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Import failed');
            setLoading(false);
          });
      }
      e.target.value = '';
    },
    [onFilesSelected, onClose]
  );

  if (!open) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          <span className="modal-title">Import Documents</span>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <div
            className={`dropzone ${dragover ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.parquet,.pdf,.png,.jpg,.xlsx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="dropzone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
            </div>
            <div className="dropzone-title">Drop files here or click to browse</div>
            <div className="dropzone-subtitle">Extract data from receipts, contracts, invoices, and more</div>
            <div className="dropzone-formats">
              <span className="format-badge">PDF</span>
              <span className="format-badge">PNG</span>
              <span className="format-badge">JPG</span>
              <span className="format-badge">CSV</span>
              <span className="format-badge">XLSX</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {error && <div className="modal-error">{error}</div>}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={loading} onClick={() => fileInputRef.current?.click()}>
            {loading ? 'Importing...' : 'Import & Extract'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .modal-overlay.open { opacity: 1; pointer-events: all; }
        .modal {
          background: var(--bg-surface);
          border-radius: 16px;
          box-shadow: var(--shadow-xl);
          width: 520px;
          max-width: 90vw;
          transform: translateY(12px);
          transition: transform 0.2s;
          overflow: hidden;
        }
        .modal-overlay.open .modal { transform: translateY(0); }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-title { font-size: 16px; font-weight: 600; }
        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: background 0.15s;
        }
        .modal-close:hover { background: var(--bg-grid-hover); }
        .modal-body { padding: 24px; }
        .dropzone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 40px 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dropzone:hover, .dropzone.dragover {
          border-color: var(--accent);
          background: var(--accent-bg);
        }
        .dropzone-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--accent-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .dropzone-icon svg { width: 24px; height: 24px; color: var(--accent); }
        .dropzone-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .dropzone-subtitle { font-size: 13px; color: var(--text-secondary); }
        .dropzone-formats {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 16px;
        }
        .format-badge {
          padding: 3px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          background: var(--bg-grid-header);
          color: var(--text-secondary);
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          align-items: center;
        }
        .modal-error {
          flex: 1;
          font-size: 12px;
          color: var(--danger);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-primary);
        }
        .btn:hover { background: var(--bg-grid-hover); border-color: var(--border-focus); }
        .btn-primary {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }
        .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
      `}</style>
    </div>
  );
}

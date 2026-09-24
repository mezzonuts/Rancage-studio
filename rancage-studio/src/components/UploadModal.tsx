'use client';

import { useState, useCallback, useRef } from 'react';
import type { DragEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

  const formats = ['PDF', 'PNG', 'JPG', 'CSV', 'XLSX'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Import Documents
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: dragover ? 'primary.main' : 'divider',
            borderRadius: 3,
            p: 5,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: dragover ? 'primary.light' + '10' : 'transparent',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.light' + '08',
            },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.parquet,.pdf,.png,.jpg,.xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CloudUploadIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }} gutterBottom>
            Drop files here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Extract data from receipts, contracts, invoices, and more
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            {formats.map((f) => (
              <Chip key={f} label={f} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {error && (
          <Typography variant="caption" color="error" sx={{ flex: 1 }}>
            {error}
          </Typography>
        )}
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? 'Importing...' : 'Import & Extract'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
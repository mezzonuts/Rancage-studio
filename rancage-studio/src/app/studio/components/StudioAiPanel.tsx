'use client';

import { useState } from 'react';
import { AiPanel } from '@/components/AiPanel';

export interface StudioAiPanelProps {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  aiProcessing: boolean;
  onAIAnalystAction: (action: string) => void;
  onToggleChat: () => void;
  viewMode: string;
}

export function StudioAiPanel({
  chatOpen,
  setChatOpen,
  aiProcessing,
  onAIAnalystAction,
  onToggleChat,
  viewMode,
}: StudioAiPanelProps) {
  const [tab, setTab] = useState<'Chat' | 'Replays' | 'Templates' | 'Scripts' | 'Settings'>('Chat');

  if (!chatOpen) return null;

  return (
    <AiPanel
      open={chatOpen}
      onClose={onToggleChat}
      tab={tab}
      setTab={setTab}
      processing={aiProcessing}
      onAction={onAIAnalystAction}
      viewMode={viewMode}
    />
  );
}
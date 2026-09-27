'use client';

import { useCallback, useState } from 'react';
import { Ribbon } from '@/components/Ribbon';
import type { RibbonProps } from '@/components/Ribbon';
import { useAuth } from '@/lib/auth/context';
import { useBYOK } from '@/lib/byok/context';

export interface StudioHeaderProps {
  activeRibbonTab: string;
  onTabChange: (tab: string) => void;
  showFormulaBar: boolean;
  onToggleFormulaBar: () => void;
  showGridlines: boolean;
  onToggleGridlines: () => void;
  showHeadings: boolean;
  onToggleHeadings: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
}

export function StudioHeader({
  activeRibbonTab,
  onTabChange,
  showFormulaBar,
  onToggleFormulaBar,
  showGridlines,
  onToggleGridlines,
  showHeadings,
  onToggleHeadings,
  zoom,
  onZoomChange,
}: StudioHeaderProps) {
  const { user, logout } = useAuth();
  const { config: byokConfig, connectionStatus } = useBYOK();
  
  // Local state instead of useChat hook
  const [chatOpen, setChatOpen] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'spreadsheets' | 'dashboards'>('spreadsheets');
  const onToggleChat = () => setChatOpen(!chatOpen);
  const onAIAnalystAction = (action: string) => {};

  return (
    <Ribbon
      activeTab={activeRibbonTab}
      onTabChange={onTabChange}
      onExportExcel={() => {}}
      onExportHTML={() => {}}
      onPrint={() => {}}
      onImport={() => {}}
      onNewWorkbook={() => {}}
      onSortAsc={() => {}}
      onSortDesc={() => {}}
      onRemoveDuplicates={() => {}}
      toggleFilter={() => {}}
      filterActive={false}
      zoom={zoom}
      onZoomChange={onZoomChange}
      showGridlines={showGridlines}
      onToggleGridlines={onToggleGridlines}
      showFormulaBar={showFormulaBar}
      onToggleFormulaBar={onToggleFormulaBar}
      showHeadings={showHeadings}
      onToggleHeadings={onToggleHeadings}
      bold={false}
      onToggleBold={() => {}}
      italic={false}
      onToggleItalic={() => {}}
      underline={false}
      onToggleUnderline={() => {}}
      strikethrough={false}
      onToggleStrikethrough={() => {}}
      textAlign="left"
      onTextAlignChange={() => {}}
      verticalAlign="bottom"
      onVerticalAlignChange={() => {}}
      wrapText={false}
      onToggleWrapText={() => {}}
      fontFamily="Inter"
      onFontFamilyChange={() => {}}
      fontSize={13}
      onFontSizeChange={() => {}}
      onIncreaseFontSize={() => {}}
      onDecreaseFontSize={() => {}}
      numberFormat="General"
      onNumberFormatChange={() => {}}
      chatOpen={chatOpen}
      aiProcessing={aiProcessing}
      onAIAnalystAction={onAIAnalystAction}
      onToggleChat={onToggleChat}
      viewMode={viewMode}
    />
  );
}
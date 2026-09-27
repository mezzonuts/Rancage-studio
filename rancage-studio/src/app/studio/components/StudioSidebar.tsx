'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

export interface StudioSidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onImportClick: () => void;
}

export function StudioSidebar({
  activeNav,
  onNavChange,
  onImportClick,
}: StudioSidebarProps) {
  return (
    <Sidebar
      activeNav={activeNav}
      onNavChange={onNavChange}
      onImportClick={onImportClick}
    />
  );
}
'use client';

// cspell:disable
import { useState } from 'react';
import { AppShell } from '@/components/AppShell/AppShell';
import { Header, type HeaderTabId } from '@/components/Header/Header';

export default function Page() {
  const [activeTab, setActiveTab] = useState<HeaderTabId>('map');

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <AppShell activeTab={activeTab} />
    </>
  );
}

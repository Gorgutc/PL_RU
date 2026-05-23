'use client';

import { useState } from 'react';
import { Card } from '@blueprintjs/core';
import { Header, HEADER_TABS, type TabId } from '@/components/Header/Header';
import styles from './page.module.scss';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const pageNumber = HEADER_TABS.findIndex((tab) => tab.id === activeTab) + 1;
  const pageLabel = HEADER_TABS.find((tab) => tab.id === activeTab)?.label ?? '';

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={styles.page}>
        <Card className={styles.placeholder}>
          <span className={styles.num} aria-hidden="true">
            {pageNumber}
          </span>
          <h1 className={styles.heading}>
            Страница {pageNumber} · {pageLabel}
          </h1>
          <p>Заглушка контента — переключение разделов работает.</p>
        </Card>
      </main>
    </>
  );
}

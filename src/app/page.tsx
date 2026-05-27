'use client';

// cspell:disable
import { useState } from 'react';
import { Card, Elevation } from '@blueprintjs/core';
import { DEFAULT_HEADER_TABS, Header, type HeaderTabId } from '@/components/Header/Header';
import styles from './page.module.scss';

export default function Page() {
  const [activeTab, setActiveTab] = useState<HeaderTabId>('map');
  const activeTabIndex = DEFAULT_HEADER_TABS.findIndex((tab) => tab.id === activeTab);
  const activePanelNumber = activeTabIndex === -1 ? 1 : activeTabIndex + 1;

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={styles.page}>
        <Card
          elevation={Elevation.ONE}
          className={styles.placeholder}
          id="praios-tab-panel"
          role="tabpanel"
          aria-labelledby={`praios-header-tab-${activeTab}`}
        >
          <p className={styles.eyebrow}>PraiOS / Центр управления полетами</p>
          <h1 className={styles.heading}>Заглушка раздела {activePanelNumber}</h1>
          <div className={styles.stubNumber} data-testid="active-tab-stub">
            {activePanelNumber}
          </div>
        </Card>
      </main>
    </>
  );
}

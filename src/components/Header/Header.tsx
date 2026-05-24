'use client';

import { Navbar, Button, type IconName } from '@blueprintjs/core';
import styles from './Header.module.scss';

export type TabId = 'map' | 'bar' | 'tmi' | 'sat' | 'kick' | 'stats';

type TabDef = { id: TabId; label: string; icon: IconName };

export const HEADER_TABS: readonly TabDef[] = [
  { id: 'map', label: 'Map', icon: 'globe' },
  { id: 'bar', label: 'Bar', icon: 'route' },
  { id: 'tmi', label: 'TMI', icon: 'feed' },
  { id: 'sat', label: 'SAT', icon: 'satellite' },
  { id: 'kick', label: 'Kick', icon: 'manually-entered-data' },
  { id: 'stats', label: 'Статистика', icon: 'chart' },
];

type HeaderProps = {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
};

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <Navbar fixedToTop role="banner" className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>PraiOS</span>
          <span className={styles.title}>Центр управления лодками</span>
        </div>

        <nav className={styles.tabs} aria-label="Разделы">
          {HEADER_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Button
                key={tab.id}
                className={styles.tab}
                variant={isActive ? 'solid' : 'minimal'}
                intent={isActive ? 'primary' : undefined}
                icon={tab.icon}
                text={tab.label}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onTabChange(tab.id)}
              />
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Button className={styles.actionBtn} variant="minimal" icon="data-connection">
            <span className={styles.statusDot} aria-hidden="true" />
            Данные
          </Button>
          <Button
            className={styles.actionBtn}
            variant="minimal"
            icon="database"
            text="База данных"
          />
          <Button className={styles.actionBtn} variant="minimal" icon="user" text="Аккаунт" />
          <Button variant="minimal" icon="notifications" aria-label="Уведомления" />
        </div>
      </div>
    </Navbar>
  );
}

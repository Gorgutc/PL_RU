'use client';

import { Icon, type IconName } from '@blueprintjs/core';
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
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            <span className={styles.logoRing}>
              <span className={styles.logoDot} />
            </span>
            <span className={styles.wordmark}>PraiOS</span>
          </span>
          <span className={styles.title}>Центр управления лодками</span>
        </div>

        <nav className={styles.tabs} aria-label="Разделы">
          {HEADER_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                className={isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className={styles.tabIcon} icon={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={`${styles.actionBtn} ${styles.actionBtnData}`}>
            <Icon className={styles.actionIcon} icon="full-circle" size={16} />
            <span>Данные</span>
          </button>
          <button type="button" className={styles.actionBtn}>
            <Icon className={styles.actionIcon} icon="database" size={16} />
            <span>База данных</span>
          </button>
          <button type="button" className={styles.actionBtn}>
            <Icon className={styles.actionIcon} icon="user" size={16} />
            <span>Аккаунт</span>
          </button>
          <button type="button" className={styles.bell} aria-label="Уведомления">
            <Icon icon="notifications" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

// cspell:disable
import { Button, Icon, Navbar, type IconName } from '@blueprintjs/core';
import styles from './Header.module.scss';

export type HeaderTabId = 'map' | 'bar' | 'tmi' | 'sat' | 'kick' | 'stats';

export type HeaderTab = {
  id: HeaderTabId;
  label: string;
  icon: IconName;
  title: string;
  disabled?: boolean;
};

export type HeaderProps = {
  activeTab: HeaderTabId;
  onTabChange: (id: HeaderTabId) => void;
  tabs?: readonly HeaderTab[];
  className?: string;
};

export const DEFAULT_HEADER_TABS: readonly HeaderTab[] = [
  { id: 'map', label: 'Оперативная карта', icon: 'globe', title: 'Оперативная карта' },
  { id: 'bar', label: 'Маршруты', icon: 'route', title: 'Маршруты' },
  { id: 'tmi', label: 'Телеметрия', icon: 'antenna', title: 'Телеметрия' },
  { id: 'sat', label: 'Зондирование', icon: 'satellite', title: 'Зондирование' },
  {
    id: 'kick',
    label: 'Введение пусков',
    icon: 'manually-entered-data',
    title: 'Введение пусков',
  },
  { id: 'stats', label: 'Статистика', icon: 'timeline-line-chart', title: 'Статистика' },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getTabId(tabId: HeaderTabId) {
  return `praios-header-tab-${tabId}`;
}

export function Header({
  activeTab,
  onTabChange,
  tabs = DEFAULT_HEADER_TABS,
  className,
}: HeaderProps) {
  return (
    <header className={cx(styles.header, className)} role="banner">
      <Navbar className={styles.navbar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-label="PraiOS" data-testid="praios-logo">
            <span className={styles.logoMark} aria-hidden="true">
              <span className={styles.logoDot} />
            </span>
            <span className={styles.logoText}>PraiOS</span>
          </span>
          <span className={styles.descriptor}>Центр управления полетами</span>
        </div>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Разделы PraiOS"
          data-testid="praios-header-tabs"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const isLeadTab = tab.id === 'map' || tab.id === 'bar';
            return (
              <Button
                key={tab.id}
                aria-label={tab.title}
                active={isActive}
                aria-controls="praios-tab-panel"
                aria-selected={isActive}
                className={cx(
                  styles.tabButton,
                  isLeadTab && styles.tabButtonLead,
                  isActive && styles.tabButtonActive,
                )}
                data-state={isActive ? 'active' : 'base'}
                data-type={tab.title}
                disabled={tab.disabled}
                id={getTabId(tab.id)}
                icon={
                  <Icon
                    className={cx(styles.tabIcon, isActive && styles.tabIconActive)}
                    icon={tab.icon}
                    size={16}
                  />
                }
                intent={isActive ? 'primary' : undefined}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                text={tab.label}
                textClassName={styles.tabText}
                title={tab.title}
                type="button"
                variant={isActive ? 'solid' : 'minimal'}
              />
            );
          })}
        </div>

        <div className={styles.actions} aria-label="Действия PraiOS">
          <Button
            className={cx(styles.actionButton, styles.actionButtonData)}
            disabled
            icon={<Icon className={styles.actionIconData} icon="circle" size={16} />}
            text="Данные"
            textClassName={styles.actionText}
            title="Действие будет подключено следующим этапом"
            type="button"
            variant="outlined"
          />
          <Button
            className={styles.actionButton}
            disabled
            icon={<Icon className={styles.actionIconAccent} icon="th" size={16} />}
            text="База данных"
            textClassName={styles.actionText}
            title="Действие будет подключено следующим этапом"
            type="button"
            variant="outlined"
          />
          <Button
            className={cx(styles.actionButton, styles.actionButtonAccount)}
            disabled
            icon={<Icon className={styles.actionIcon} icon="user" size={16} />}
            text="Аккаунт"
            textClassName={styles.actionText}
            title="Действие будет подключено следующим этапом"
            type="button"
            variant="outlined"
          />
          <Button
            aria-label="Уведомления"
            className={styles.notificationButton}
            disabled
            icon={<Icon className={styles.actionIcon} icon="notifications" size={16} />}
            title="Действие будет подключено следующим этапом"
            type="button"
            variant="outlined"
          />
        </div>
      </Navbar>
    </header>
  );
}

'use client';

// cspell:disable
import { useState } from 'react';
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Navbar,
  Popover,
  PopoverInteractionKind,
  PopupKind,
  type IconName,
} from '@blueprintjs/core';
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

type HeaderDropdownId = 'account' | 'notifications';

type NotificationFilterId = 'all' | 'ai-info' | 'unread';

type NotificationSectionId = 'recent' | 'older';

type HeaderNotification = {
  id: string;
  title: string;
  description: string;
  date: string;
  dateTime: string;
  category: 'AI Info' | 'Operations';
  section: NotificationSectionId;
  unread: boolean;
};

const NOTIFICATION_FILTERS: ReadonlyArray<{ id: NotificationFilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'ai-info', label: 'AI Info' },
  { id: 'unread', label: 'Unread' },
];

const NOTIFICATION_SECTIONS: ReadonlyArray<{ id: NotificationSectionId; label: string }> = [
  { id: 'recent', label: 'Last 7 days' },
  { id: 'older', label: 'Older' },
];

const HEADER_NOTIFICATIONS: readonly HeaderNotification[] = [
  {
    id: 'ai-route-ready',
    title: 'AI route digest is ready',
    description: 'Placeholder message for the next route summary.',
    date: 'May 22',
    dateTime: '2026-05-22',
    category: 'AI Info',
    section: 'recent',
    unread: true,
  },
  {
    id: 'telemetry-window',
    title: 'Telemetry window updated',
    description: 'Placeholder telemetry notification for operations.',
    date: 'May 22',
    dateTime: '2026-05-22',
    category: 'Operations',
    section: 'recent',
    unread: true,
  },
  {
    id: 'ai-risk-scan',
    title: 'AI risk scan completed',
    description: 'Placeholder AI insight for mission planning.',
    date: 'May 21',
    dateTime: '2026-05-21',
    category: 'AI Info',
    section: 'recent',
    unread: true,
  },
  {
    id: 'database-sync',
    title: 'Database sync checkpoint',
    description: 'Placeholder status for shared reference data.',
    date: 'May 20',
    dateTime: '2026-05-20',
    category: 'Operations',
    section: 'recent',
    unread: true,
  },
  {
    id: 'ai-briefing',
    title: 'AI briefing draft available',
    description: 'Placeholder copy for generated briefing updates.',
    date: 'May 19',
    dateTime: '2026-05-19',
    category: 'AI Info',
    section: 'recent',
    unread: true,
  },
  {
    id: 'schedule-shift',
    title: 'Schedule shift detected',
    description: 'Placeholder alert for timeline monitoring.',
    date: 'May 18',
    dateTime: '2026-05-18',
    category: 'Operations',
    section: 'recent',
    unread: true,
  },
  {
    id: 'ai-anomaly',
    title: 'AI anomaly note added',
    description: 'Placeholder anomaly note for operator review.',
    date: 'May 17',
    dateTime: '2026-05-17',
    category: 'AI Info',
    section: 'recent',
    unread: true,
  },
  {
    id: 'archive-import',
    title: 'Archive import finished',
    description: 'Placeholder import notification for older data.',
    date: 'May 12',
    dateTime: '2026-05-12',
    category: 'Operations',
    section: 'older',
    unread: true,
  },
  {
    id: 'ai-summary-older',
    title: 'AI summary archived',
    description: 'Placeholder archive message for previous analysis.',
    date: 'May 10',
    dateTime: '2026-05-10',
    category: 'AI Info',
    section: 'older',
    unread: true,
  },
  {
    id: 'operator-note',
    title: 'Operator note received',
    description: 'Placeholder operator notification for handoff.',
    date: 'May 08',
    dateTime: '2026-05-08',
    category: 'Operations',
    section: 'older',
    unread: true,
  },
  {
    id: 'ai-queue',
    title: 'AI queue item reviewed',
    description: 'Placeholder reviewed item from the AI queue.',
    date: 'May 06',
    dateTime: '2026-05-06',
    category: 'AI Info',
    section: 'older',
    unread: true,
  },
  {
    id: 'system-read',
    title: 'System snapshot opened',
    description: 'Placeholder read notification for state continuity.',
    date: 'May 04',
    dateTime: '2026-05-04',
    category: 'Operations',
    section: 'older',
    unread: false,
  },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getTabId(tabId: HeaderTabId) {
  return `praios-header-tab-${tabId}`;
}

function filterNotifications(
  notifications: readonly HeaderNotification[],
  filterId: NotificationFilterId,
  readNotificationIds: ReadonlySet<string>,
) {
  return notifications.filter((notification) => {
    const isUnread = notification.unread && !readNotificationIds.has(notification.id);

    if (filterId === 'ai-info') return notification.category === 'AI Info';
    if (filterId === 'unread') return isUnread;
    return true;
  });
}

type AccountDropdownMenuProps = {
  onDismiss: () => void;
};

function AccountDropdownMenu({ onDismiss }: AccountDropdownMenuProps) {
  return (
    <Menu className={styles.accountMenu} aria-label="Блок профиля">
      <MenuItem
        className={styles.accountMenuItem}
        icon={<Icon className={styles.accountMenuIcon} icon="edit" size={16} />}
        onClick={onDismiss}
        text="Изменить профиль"
        textClassName={styles.accountMenuItemText}
      />
      <MenuItem
        className={styles.accountMenuItem}
        icon={<Icon className={styles.accountMenuIcon} icon="log-out" size={16} />}
        onClick={onDismiss}
        text="Выйти из аккаунта"
        textClassName={styles.accountMenuItemText}
      />
    </Menu>
  );
}

type NotificationRowProps = {
  notification: HeaderNotification;
  isUnread: boolean;
};

function NotificationRow({ notification, isUnread }: NotificationRowProps) {
  return (
    <article className={cx(styles.notificationRow, isUnread && styles.notificationRowUnread)}>
      <div className={styles.notificationRowHeader}>
        <span className={styles.notificationCategory}>{notification.category}</span>
        <time className={styles.notificationDate} dateTime={notification.dateTime}>
          {notification.date}
        </time>
      </div>
      <p className={styles.notificationTitle}>{notification.title}</p>
      <p className={styles.notificationDescription}>{notification.description}</p>
    </article>
  );
}

type NotificationSectionProps = {
  section: (typeof NOTIFICATION_SECTIONS)[number];
  notifications: readonly HeaderNotification[];
  readNotificationIds: ReadonlySet<string>;
};

function NotificationSection({
  section,
  notifications,
  readNotificationIds,
}: NotificationSectionProps) {
  if (notifications.length === 0) return null;

  return (
    <section className={styles.notificationSection}>
      <h3 className={styles.notificationSectionTitle}>{section.label}</h3>
      <div className={styles.notificationRows}>
        {notifications.map((notification) => (
          <NotificationRow
            isUnread={notification.unread && !readNotificationIds.has(notification.id)}
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </section>
  );
}

type NotificationsDropdownPanelProps = {
  activeFilter: NotificationFilterId;
  notifications: readonly HeaderNotification[];
  readNotificationIds: ReadonlySet<string>;
  onDismiss: () => void;
  onFilterChange: (filterId: NotificationFilterId) => void;
  onMarkAllRead: () => void;
};

function NotificationsDropdownPanel({
  activeFilter,
  notifications,
  readNotificationIds,
  onDismiss,
  onFilterChange,
  onMarkAllRead,
}: NotificationsDropdownPanelProps) {
  const unreadCount = notifications.filter(
    (notification) => notification.unread && !readNotificationIds.has(notification.id),
  ).length;
  const visibleNotifications = filterNotifications(
    notifications,
    activeFilter,
    readNotificationIds,
  );
  const notificationSections = NOTIFICATION_SECTIONS.map((section) => ({
    section,
    notifications: visibleNotifications.filter(
      (notification) => notification.section === section.id,
    ),
  }));

  return (
    <section
      className={styles.notificationsPanel}
      role="dialog"
      aria-label="All notifications"
      data-testid="notifications-panel"
    >
      <div className={styles.notificationsHeader}>
        <h2 className={styles.notificationsTitle}>All notifications</h2>
        <Button
          aria-label="Закрыть уведомления"
          className={styles.notificationsCloseButton}
          icon={<Icon icon="cross" size={14} />}
          onClick={onDismiss}
          type="button"
          variant="minimal"
        />
      </div>

      <div className={styles.notificationsDivider} />

      <div className={styles.notificationsToolbar}>
        <div className={styles.notificationFilters} role="group" aria-label="Фильтр уведомлений">
          {NOTIFICATION_FILTERS.map((filter) => {
            const isActive = filter.id === activeFilter;
            const label =
              filter.id === 'unread' ? `${filter.label} (${unreadCount})` : filter.label;

            return (
              <Button
                key={filter.id}
                aria-pressed={isActive}
                className={cx(
                  styles.notificationFilter,
                  isActive && styles.notificationFilterSelected,
                )}
                onClick={() => onFilterChange(filter.id)}
                text={label}
                type="button"
                variant="minimal"
              />
            );
          })}
        </div>
        <Button
          className={styles.markAllReadButton}
          disabled={unreadCount === 0}
          onClick={onMarkAllRead}
          text="Mark all as read"
          type="button"
          variant="minimal"
        />
      </div>

      <div className={styles.notificationsList} aria-live="polite">
        {visibleNotifications.length === 0 ? (
          <p className={styles.notificationsEmpty}>No notifications</p>
        ) : (
          notificationSections.map(({ section, notifications: sectionNotifications }) => (
            <NotificationSection
              key={section.id}
              notifications={sectionNotifications}
              readNotificationIds={readNotificationIds}
              section={section}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function Header({
  activeTab,
  onTabChange,
  tabs = DEFAULT_HEADER_TABS,
  className,
}: HeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<HeaderDropdownId | null>(null);
  const [activeNotificationFilter, setActiveNotificationFilter] =
    useState<NotificationFilterId>('all');
  const [readNotificationIds, setReadNotificationIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const isAccountDropdownOpen = openDropdown === 'account';
  const isNotificationsDropdownOpen = openDropdown === 'notifications';
  const notifications = HEADER_NOTIFICATIONS;

  const handleDropdownInteraction = (dropdownId: HeaderDropdownId) => (nextOpenState: boolean) => {
    setOpenDropdown(nextOpenState ? dropdownId : null);
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(new Set(notifications.map((notification) => notification.id)));
  };

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
            icon={<Icon className={styles.actionIcon} icon="circle" size={16} />}
            text="Данные"
            textClassName={styles.actionText}
            title="Действие будет подключено следующим этапом"
            type="button"
            variant="outlined"
          />
          <Button
            className={cx(styles.actionButton, styles.actionButtonDatabase)}
            disabled
            icon={<Icon className={styles.actionIcon} icon="th" size={16} />}
            text="База данных"
            textClassName={styles.actionText}
            title="Действие будет подключено следующим этапом"
            type="button"
            variant="outlined"
          />
          <Popover
            className={styles.dropdownTarget}
            content={<AccountDropdownMenu onDismiss={() => setOpenDropdown(null)} />}
            interactionKind={PopoverInteractionKind.CLICK}
            isOpen={isAccountDropdownOpen}
            minimal
            onInteraction={handleDropdownInteraction('account')}
            placement="bottom-end"
            popoverClassName={styles.dropdownPopover}
            popupKind={PopupKind.MENU}
          >
            <Button
              active={isAccountDropdownOpen}
              aria-expanded={isAccountDropdownOpen}
              aria-haspopup="menu"
              className={cx(
                styles.actionButton,
                styles.actionButtonAccount,
                isAccountDropdownOpen && styles.actionButtonOpen,
              )}
              icon={<Icon className={styles.actionIcon} icon="user" size={16} />}
              text="Аккаунт"
              textClassName={styles.actionText}
              title="Открыть меню аккаунта"
              type="button"
              variant="outlined"
            />
          </Popover>
          <Popover
            className={styles.dropdownTarget}
            content={
              <NotificationsDropdownPanel
                activeFilter={activeNotificationFilter}
                notifications={notifications}
                readNotificationIds={readNotificationIds}
                onDismiss={() => setOpenDropdown(null)}
                onFilterChange={setActiveNotificationFilter}
                onMarkAllRead={markAllNotificationsRead}
              />
            }
            interactionKind={PopoverInteractionKind.CLICK}
            isOpen={isNotificationsDropdownOpen}
            minimal
            onInteraction={handleDropdownInteraction('notifications')}
            placement="bottom-end"
            popoverClassName={styles.dropdownPopover}
            popupKind={PopupKind.DIALOG}
          >
            <Button
              active={isNotificationsDropdownOpen}
              aria-expanded={isNotificationsDropdownOpen}
              aria-haspopup="dialog"
              aria-label="Уведомления"
              className={cx(
                styles.notificationButton,
                isNotificationsDropdownOpen && styles.actionButtonOpen,
              )}
              icon={<Icon className={styles.actionIcon} icon="notifications" size={16} />}
              title="Открыть уведомления"
              type="button"
              variant="outlined"
            />
          </Popover>
        </div>
      </Navbar>
    </header>
  );
}

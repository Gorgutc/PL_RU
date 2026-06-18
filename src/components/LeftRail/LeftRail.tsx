// cspell:disable
'use client';

import { useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { Button } from '@blueprintjs/core';
import type { RailConfig, RailItem } from '@/components/AppNavigation/navigation';
import { RAIL_ICON_ASSETS } from '@/components/AppNavigation/railIcons';
import type { WorkspaceMapTheme } from '@/components/WorkspaceMap/mapConfig';
import styles from './LeftRail.module.scss';

// The map basemap toggle reuses the existing bottom-rail "theme" item: the label
// names the theme the click switches to, so it flips with the current map theme.
const THEME_RAIL_ITEM_ID = 'theme';

function getThemeRailLabel(mapTheme: WorkspaceMapTheme) {
  return mapTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
}

type LeftRailProps = {
  config: RailConfig;
  expanded: boolean;
  labelledBy: string;
  mapTheme: WorkspaceMapTheme;
  onExpandedChange: (expanded: boolean) => void;
  onToggleMapTheme: () => void;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function RailDivider() {
  return <span className={styles.divider} aria-hidden="true" />;
}

function RailIcon({ item }: { item: RailItem }) {
  const icon = RAIL_ICON_ASSETS[item.iconId];

  return (
    <img
      alt=""
      aria-hidden="true"
      className={styles.icon}
      data-icon-id={item.iconId}
      data-testid="left-rail-icon"
      draggable={false}
      src={icon.src}
    />
  );
}

function RailButton({
  expanded,
  item,
  mapTheme,
  onExpandedChange,
  onToggleMapTheme,
  pressed,
  onPress,
}: {
  expanded: boolean;
  item: RailItem;
  mapTheme: WorkspaceMapTheme;
  onExpandedChange: (expanded: boolean) => void;
  onToggleMapTheme: () => void;
  pressed: boolean;
  onPress: () => void;
}) {
  const isCollapse = item.id === 'collapse';
  const isThemeToggle = item.id === THEME_RAIL_ITEM_ID;
  // The theme toggle's visible text and accessible name both name the target
  // theme, so they flip together with the current map theme.
  const visibleLabel = isThemeToggle ? getThemeRailLabel(mapTheme) : item.label;
  const label = isCollapse
    ? expanded
      ? 'Свернуть боковое меню'
      : 'Раскрыть боковое меню'
    : visibleLabel;
  const testId = item.primary ? 'left-rail-button-primary' : `left-rail-button-${item.id}`;

  function markPointerFocus(event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.dataset.focusSource = 'pointer';
  }

  function markKeyboardFocus(event: KeyboardEvent<HTMLButtonElement>) {
    event.currentTarget.dataset.focusSource = 'keyboard';
  }

  function clearFocusSource(event: FocusEvent<HTMLButtonElement>) {
    delete event.currentTarget.dataset.focusSource;
  }

  const handleClick = isCollapse
    ? () => onExpandedChange(!expanded)
    : isThemeToggle
      ? onToggleMapTheme
      : onPress;

  return (
    <Button
      aria-expanded={isCollapse ? expanded : undefined}
      aria-label={label}
      aria-pressed={isCollapse ? undefined : isThemeToggle ? mapTheme === 'dark' : pressed}
      className={cx(styles.button, expanded && styles.buttonExpanded)}
      data-icon-id={item.iconId}
      data-rail-item-id={item.id}
      data-testid={testId}
      icon={<RailIcon item={item} />}
      onBlur={clearFocusSource}
      onClick={handleClick}
      onKeyDown={markKeyboardFocus}
      onPointerDown={markPointerFocus}
      text={
        <span className={styles.label} data-testid="left-rail-label" aria-hidden="true">
          {visibleLabel}
        </span>
      }
      title={label}
      type="button"
      variant="minimal"
    />
  );
}

function RailGroup({
  activeItemId,
  expanded,
  items,
  mapTheme,
  onExpandedChange,
  onItemPress,
  onToggleMapTheme,
  testId,
}: {
  activeItemId: string | null;
  expanded: boolean;
  items: readonly RailItem[];
  mapTheme: WorkspaceMapTheme;
  onExpandedChange: (expanded: boolean) => void;
  onItemPress: (itemId: string) => void;
  onToggleMapTheme: () => void;
  testId: 'left-rail-top-group' | 'left-rail-bottom-group';
}) {
  return (
    <div className={styles.group} data-testid={testId}>
      {items.map((item, index) => (
        <div className={styles.itemSlot} key={item.id}>
          {index > 0 && item.dividerBefore && <RailDivider />}
          <RailButton
            expanded={expanded}
            item={item}
            mapTheme={mapTheme}
            pressed={item.id === activeItemId}
            onExpandedChange={onExpandedChange}
            onPress={() => onItemPress(item.id)}
            onToggleMapTheme={onToggleMapTheme}
          />
        </div>
      ))}
    </div>
  );
}

export function LeftRail({
  config,
  expanded,
  labelledBy,
  mapTheme,
  onExpandedChange,
  onToggleMapTheme,
}: LeftRailProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  return (
    <nav
      className={cx(styles.rail, expanded && styles.railExpanded)}
      aria-labelledby={labelledBy}
      data-sidebar-state={expanded ? 'expanded' : 'collapsed'}
      data-testid="left-rail"
    >
      <RailGroup
        activeItemId={activeItemId}
        expanded={expanded}
        items={config.top}
        mapTheme={mapTheme}
        onExpandedChange={onExpandedChange}
        onItemPress={setActiveItemId}
        onToggleMapTheme={onToggleMapTheme}
        testId="left-rail-top-group"
      />
      <RailGroup
        activeItemId={activeItemId}
        expanded={expanded}
        items={config.bottom}
        mapTheme={mapTheme}
        onExpandedChange={onExpandedChange}
        onItemPress={setActiveItemId}
        onToggleMapTheme={onToggleMapTheme}
        testId="left-rail-bottom-group"
      />
    </nav>
  );
}

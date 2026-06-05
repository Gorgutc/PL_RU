// cspell:disable
'use client';

import { useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { Button } from '@blueprintjs/core';
import type { RailConfig, RailItem } from '@/components/AppNavigation/navigation';
import { RAIL_ICON_ASSETS } from '@/components/AppNavigation/railIcons';
import styles from './LeftRail.module.scss';

type LeftRailProps = {
  config: RailConfig;
  expanded: boolean;
  labelledBy: string;
  onExpandedChange: (expanded: boolean) => void;
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
  onExpandedChange,
  pressed,
  onPress,
}: {
  expanded: boolean;
  item: RailItem;
  onExpandedChange: (expanded: boolean) => void;
  pressed: boolean;
  onPress: () => void;
}) {
  const isToggle = item.id === 'collapse';
  const label = isToggle
    ? expanded
      ? 'Свернуть боковое меню'
      : 'Раскрыть боковое меню'
    : item.label;
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

  return (
    <Button
      aria-expanded={isToggle ? expanded : undefined}
      aria-label={label}
      aria-pressed={isToggle ? undefined : pressed}
      className={cx(styles.button, expanded && styles.buttonExpanded)}
      data-icon-id={item.iconId}
      data-rail-item-id={item.id}
      data-testid={testId}
      icon={<RailIcon item={item} />}
      onBlur={clearFocusSource}
      onClick={isToggle ? () => onExpandedChange(!expanded) : onPress}
      onKeyDown={markKeyboardFocus}
      onPointerDown={markPointerFocus}
      text={
        <span className={styles.label} data-testid="left-rail-label" aria-hidden="true">
          {item.label}
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
  onExpandedChange,
  onItemPress,
  testId,
}: {
  activeItemId: string | null;
  expanded: boolean;
  items: readonly RailItem[];
  onExpandedChange: (expanded: boolean) => void;
  onItemPress: (itemId: string) => void;
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
            pressed={item.id === activeItemId}
            onExpandedChange={onExpandedChange}
            onPress={() => onItemPress(item.id)}
          />
        </div>
      ))}
    </div>
  );
}

export function LeftRail({ config, expanded, labelledBy, onExpandedChange }: LeftRailProps) {
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
        onExpandedChange={onExpandedChange}
        onItemPress={setActiveItemId}
        testId="left-rail-top-group"
      />
      <RailGroup
        activeItemId={activeItemId}
        expanded={expanded}
        items={config.bottom}
        onExpandedChange={onExpandedChange}
        onItemPress={setActiveItemId}
        testId="left-rail-bottom-group"
      />
    </nav>
  );
}

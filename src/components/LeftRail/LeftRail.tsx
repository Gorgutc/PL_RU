// cspell:disable
'use client';

import { useState } from 'react';
import { Button, Icon } from '@blueprintjs/core';
import type { RailConfig, RailItem } from '@/components/AppNavigation/navigation';
import styles from './LeftRail.module.scss';

type LeftRailProps = {
  config: RailConfig;
  labelledBy: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function RailDivider() {
  return <span className={styles.divider} aria-hidden="true" />;
}

function RailButton({
  item,
  pressed,
  onPress,
}: {
  item: RailItem;
  pressed: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      aria-label={item.label}
      aria-pressed={pressed}
      className={cx(styles.button)}
      data-testid={item.primary ? 'left-rail-button-primary' : undefined}
      icon={<Icon className={styles.icon} icon={item.icon} size={18} />}
      onClick={onPress}
      title={item.label}
      type="button"
      variant="minimal"
    />
  );
}

function RailGroup({
  activeItemId,
  items,
  onItemPress,
  testId,
}: {
  activeItemId: string | null;
  items: readonly RailItem[];
  onItemPress: (itemId: string) => void;
  testId: 'left-rail-top-group' | 'left-rail-bottom-group';
}) {
  return (
    <div className={styles.group} data-testid={testId}>
      {items.map((item, index) => (
        <div className={styles.itemSlot} key={item.id}>
          {index > 0 && item.dividerBefore && <RailDivider />}
          <RailButton
            item={item}
            pressed={item.id === activeItemId}
            onPress={() => onItemPress(item.id)}
          />
        </div>
      ))}
    </div>
  );
}

export function LeftRail({ config, labelledBy }: LeftRailProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  return (
    <nav className={styles.rail} aria-labelledby={labelledBy} data-testid="left-rail">
      <RailGroup
        activeItemId={activeItemId}
        items={config.top}
        onItemPress={setActiveItemId}
        testId="left-rail-top-group"
      />
      <RailGroup
        activeItemId={activeItemId}
        items={config.bottom}
        onItemPress={setActiveItemId}
        testId="left-rail-bottom-group"
      />
    </nav>
  );
}

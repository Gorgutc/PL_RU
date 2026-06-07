// cspell:disable
import { Button, HTMLSelect, Icon, InputGroup, Switch } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './TabTopControls.module.scss';

/**
 * Shared presentational primitives for the per-tab top control blocks.
 * Functionality comes from Blueprint primitives; the look/sizing comes from the
 * Figma design via TabTopControls.module.scss tokens. These are intentionally
 * presentational + local UI state only (no data backend) per the task brief.
 */

// Card section: the dark control-surface card that holds one or more titled fields.
export function ControlCard({
  children,
  grow,
  ariaLabel,
}: {
  children: ReactNode;
  grow?: boolean;
  ariaLabel?: string;
}) {
  return (
    <section className={cx(styles.card, grow && styles.cardGrow)} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

// A titled field column: a 12px/500 label above its control row.
export function ControlField({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldTitle}>{title}</span>
      <div className={styles.fieldRow}>{children}</div>
    </div>
  );
}

// Segmented switch ("Тип данных", "Погодные параметры"): one active accent pill.
export type SegmentItem = { id: string; label: string; icon?: IconName };

export function SegmentedControl({
  items,
  value,
  onChange,
  ariaLabel,
}: {
  items: readonly SegmentItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.segmented} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            aria-selected={selected}
            className={cx(styles.segment, selected && styles.segmentSelected)}
            onClick={() => onChange(item.id)}
            role="tab"
            type="button"
          >
            {item.icon ? <Icon className={styles.segmentIcon} icon={item.icon} size={16} /> : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Presentational date-time text field ("24-04-2025 | 00:00").
export function DateTimeField({ value, ariaLabel }: { value: string; ariaLabel: string }) {
  return (
    <InputGroup
      aria-label={ariaLabel}
      className={styles.dateField}
      defaultValue={value}
      inputClassName={styles.dateTimeInput}
      type="text"
    />
  );
}

// A "от и до" pair of date-time fields.
export function DateTimeRange({
  from,
  to,
  fromLabel = 'Дата и время — от',
  toLabel = 'Дата и время — до',
}: {
  from: string;
  to: string;
  fromLabel?: string;
  toLabel?: string;
}) {
  return (
    <div className={styles.dateTimeRange}>
      <DateTimeField ariaLabel={fromLabel} value={from} />
      <DateTimeField ariaLabel={toLabel} value={to} />
    </div>
  );
}

// Search input with a leading magnifier icon.
export function SearchField({
  placeholder,
  ariaLabel,
}: {
  placeholder: string;
  ariaLabel?: string;
}) {
  return (
    <InputGroup
      aria-label={ariaLabel ?? placeholder}
      className={styles.search}
      inputClassName={styles.searchInput}
      leftElement={<Icon className={styles.leadingIcon} icon="search" size={16} />}
      placeholder={placeholder}
      type="search"
    />
  );
}

// Native dropdown (Blueprint HTMLSelect) used for the toolbar selects.
export function SelectField({
  value,
  options,
  ariaLabel,
}: {
  value: string;
  options: readonly string[];
  ariaLabel: string;
}) {
  return (
    <HTMLSelect
      aria-label={ariaLabel}
      className={styles.select}
      defaultValue={value}
      options={options.length ? [...options] : [value]}
    />
  );
}

// Blueprint Switch + label (e.g. satellite data sources).
export function SwitchToggle({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return <Switch className={styles.switch} defaultChecked={defaultChecked} label={label} />;
}

// Primary accent button ("Загрузить маршруты", "Создать анимацию…").
export function PrimaryActionButton({
  children,
  icon,
  ariaLabel,
}: {
  children: ReactNode;
  icon?: IconName;
  ariaLabel?: string;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className={styles.primaryButton}
      icon={icon ? <Icon icon={icon} size={16} /> : undefined}
      text={children}
      type="button"
      variant="minimal"
    />
  );
}

// Outlined utility button with a trailing icon ("Фильтры").
export function ChipButton({ children, icon }: { children: ReactNode; icon?: IconName }) {
  return (
    <Button
      className={styles.chipButton}
      endIcon={icon ? <Icon icon={icon} size={16} /> : undefined}
      text={children}
      type="button"
      variant="minimal"
    />
  );
}

// cspell:disable
import {
  Button,
  Icon,
  InputGroup,
  SegmentedControl as BlueprintSegmentedControl,
  Switch,
} from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { SelectControl } from '@/components/controls/SelectControl/SelectControl';
import { cx } from '@/lib/cx';
import { mapIconLabel, mapIconSrc, type MapIconGroup, type MapIconId } from './mapIcons';
import styles from './TabTopControls.module.scss';

/**
 * Shared presentational primitives for the per-tab top control blocks.
 * Functionality comes from Blueprint primitives; the look/sizing comes from the
 * Figma design via TabTopControls.module.scss tokens. These are intentionally
 * presentational + local UI state only (no data backend) per the task brief.
 */

// Card section: the dark control-surface card that holds one or more titled fields.
// `flexible` lets the card grow/shrink to fill the toolbar width (the per-tab
// date/time card); `tightGroups` uses the 16px group gap (map function groups);
// `compactIntrinsic` pins the card to its intrinsic width in the compact band
// (< 1920) so another element on the tab can be the rubber one — the map (and
// the tabs without compact references yet) hand the free space to their
// icon-group card instead of the date card.
export function ControlCard({
  children,
  ariaLabel,
  compactIntrinsic,
  flexible,
  tightGroups,
}: {
  children: ReactNode;
  ariaLabel?: string;
  compactIntrinsic?: boolean;
  flexible?: boolean;
  tightGroups?: boolean;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={cx(
        styles.card,
        flexible && styles.cardFlexible,
        tightGroups && styles.cardTightGroups,
        compactIntrinsic && styles.cardCompactIntrinsic,
      )}
    >
      {children}
    </section>
  );
}

// A titled field column: a 12px/500 label above its control row. `grow` lets the
// column fill its flexible card so the date/time control stretches dynamically.
export function ControlField({
  title,
  children,
  grow,
}: {
  title: string;
  children: ReactNode;
  grow?: boolean;
}) {
  return (
    <div className={cx(styles.field, grow && styles.fieldGrow)}>
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
  bandClassName,
}: {
  items: readonly SegmentItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  bandClassName?: string;
}) {
  // Reuse Blueprint's SegmentedControl: it provides the radiogroup/radio roles
  // and Arrow/Home/End keyboard handling; we only restyle it to the Figma look.
  return (
    <BlueprintSegmentedControl
      aria-label={ariaLabel}
      className={cx(styles.segmented, bandClassName)}
      intent="primary"
      onValueChange={onChange}
      options={items.map((item) => ({ label: item.label, value: item.id, icon: item.icon }))}
      role="radiogroup"
      value={value}
    />
  );
}

// Presentational date-time text field ("24-04-2025 | 00:00").
function DateTimeField({
  value,
  ariaLabel,
  bandClassName,
}: {
  value: string;
  ariaLabel: string;
  bandClassName?: string;
}) {
  return (
    <InputGroup
      aria-label={ariaLabel}
      className={cx(styles.dateField, bandClassName)}
      defaultValue={value}
      inputClassName={styles.dateTimeInput}
      type="text"
    />
  );
}

// A "от и до" pair of date-time fields. When `compactFrom`/`compactTo` are
// given, the pair is rendered twice and CSS swaps the bands (the same
// fullLabel/shortLabel pattern as the bottom panel): the full values show at
// >= 1920 and the shorter date-only values show in the compact band, matching
// the 1280 references where the time part is dropped.
export function DateTimeRange({
  from,
  to,
  compactFrom,
  compactTo,
  fromLabel = 'Дата и время — от',
  toLabel = 'Дата и время — до',
}: {
  from: string;
  to: string;
  compactFrom?: string;
  compactTo?: string;
  fromLabel?: string;
  toLabel?: string;
}) {
  const dual = compactFrom != null && compactTo != null;
  return (
    <div className={styles.dateTimeRange}>
      <DateTimeField
        ariaLabel={fromLabel}
        bandClassName={dual ? styles.fullBandOnly : undefined}
        value={from}
      />
      <DateTimeField
        ariaLabel={toLabel}
        bandClassName={dual ? styles.fullBandOnly : undefined}
        value={to}
      />
      {dual ? (
        <>
          <DateTimeField
            ariaLabel={fromLabel}
            bandClassName={styles.compactBandOnly}
            value={compactFrom}
          />
          <DateTimeField
            ariaLabel={toLabel}
            bandClassName={styles.compactBandOnly}
            value={compactTo}
          />
        </>
      ) : null}
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

// Toolbar dropdown — reuses the shared SelectControl so it matches the side
// panels (Зондирование/Статистика). Content-sized (no `fill`) for the toolbar.
export function SelectField({
  value,
  options,
  ariaLabel,
}: {
  value: string;
  options: readonly string[];
  ariaLabel: string;
}) {
  return <SelectControl ariaLabel={ariaLabel} dense options={options} value={value} />;
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

// Primary accent button — solid accent fill ("Загрузить маршруты"). The sat
// "Создать анимацию…" control uses the outlined ToggleActionButton instead.
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

// Outlined toggle button that enables a block ("Создать анимацию…"). At rest it
// uses the same outlined toolbar-control language as the "Фильтры" chip
// (transparent + hairline outline, not filled); clicking toggles it on and fills
// it with the accent — the same rest→active principle as the Header account
// button. Presentational local pressed state, exposed via aria-pressed.
export function ToggleActionButton({
  children,
  icon,
  ariaLabel,
}: {
  children: ReactNode;
  icon?: IconName;
  ariaLabel?: string;
}) {
  const [active, setActive] = useState(false);
  return (
    <Button
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cx(styles.toggleAction, active && styles.toggleActionActive)}
      icon={icon ? <Icon icon={icon} size={16} /> : undefined}
      onClick={() => setActive((value) => !value)}
      text={children}
      type="button"
      variant="minimal"
    />
  );
}

// Outlined utility button. Supports a trailing icon ("Фильтры" chip) and/or a
// leading icon (map bottom-panel "Управление данными" actions).
export function ChipButton({
  children,
  icon,
  leadingIcon,
  leadingIconClassName,
}: {
  children: ReactNode;
  icon?: IconName;
  leadingIcon?: IconName;
  leadingIconClassName?: string;
}) {
  return (
    <Button
      className={styles.chipButton}
      icon={
        leadingIcon ? (
          <Icon className={leadingIconClassName} icon={leadingIcon} size={16} />
        ) : undefined
      }
      endIcon={icon ? <Icon icon={icon} size={16} /> : undefined}
      text={children}
      type="button"
      variant="minimal"
    />
  );
}

// Square icon button (32x30 outline) with a custom SVG glyph from the manifest.
// Uses the Blueprint Button primitive (the SVG-manifest exception only covers
// the glyph rendered via <img>); presentational local pressed toggle.
function IconButton({ id }: { id: MapIconId }) {
  const label = mapIconLabel(id);
  const [pressed, setPressed] = useState(false);
  return (
    <Button
      aria-label={label}
      aria-pressed={pressed}
      className={cx(styles.iconButton, pressed && styles.iconButtonActive)}
      onClick={() => setPressed((value) => !value)}
      title={label}
      type="button"
      variant="minimal"
    >
      <img
        alt=""
        aria-hidden="true"
        className={styles.iconGlyph}
        data-icon-id={id}
        draggable={false}
        src={mapIconSrc(id)}
      />
    </Button>
  );
}

// A titled group of icon buttons. Adapts to the available width (fixed-chrome
// responsive rule): it shows as many icons as fit and collapses the rest into a
// chevron "more" dropdown at narrow widths, matching the reference compact
// layout. Optional `trailing` content (the map-layer toggles) renders after the
// icons. The toolbar height stays constant (single row), so the map stage never
// resizes on reflow.
export function IconButtonGroup({
  group,
  trailing,
}: {
  group: MapIconGroup;
  trailing?: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const total = group.items.length;
  const [visibleCount, setVisibleCount] = useState(total);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const compute = () => {
      const maxFit = Math.max(1, Math.floor((row.clientWidth + 4) / ICON_GROUP_PITCH_PX));
      if (maxFit >= total) {
        setVisibleCount(total);
        setOverflowing(false);
      } else {
        // Reserve one slot for the overflow chevron.
        setVisibleCount(Math.max(1, maxFit - 1));
        setOverflowing(true);
      }
    };

    const observer = new ResizeObserver(compute);
    observer.observe(row);
    compute();

    return () => observer.disconnect();
  }, [total]);

  const dividerAfter = new Set(group.dividerAfter ?? []);
  const shown = group.items.slice(0, visibleCount);

  return (
    <div
      className={cx(styles.field, styles.iconGroup)}
      style={{ '--group-grow': total } as CSSProperties}
    >
      <span className={styles.fieldTitle}>{group.title}</span>
      <div className={styles.iconRow} ref={rowRef}>
        {shown.map((id, index) => (
          <Fragment key={id}>
            <IconButton id={id} />
            {dividerAfter.has(index) && index < shown.length - 1 ? (
              <span aria-hidden="true" className={styles.iconDivider} />
            ) : null}
          </Fragment>
        ))}
        {overflowing ? <MapLayerDropdown ariaLabel={`Ещё: ${group.title}`} /> : null}
        {trailing}
      </div>
    </div>
  );
}

// Compact Blueprint Switch used as a map-layer toggle (no visible label).
export function LayerToggle({ label }: { label: string }) {
  return <Switch aria-label={label} className={styles.layerToggle} defaultChecked />;
}

// Chevron overflow dropdown trigger: appears at the end of a group when its
// icons overflow the available width (the trimmed icons would open from here).
// Presentational icon-sized button (Blueprint chevron, not an SVG-manifest glyph).
export function MapLayerDropdown({ ariaLabel = 'Ещё слои карты' }: { ariaLabel?: string }) {
  return (
    <Button
      aria-label={ariaLabel}
      className={styles.iconButton}
      icon={<Icon icon="chevron-down" size={16} />}
      title={ariaLabel}
      type="button"
      variant="minimal"
    />
  );
}

// Approx button pitch used to estimate how many icons fit: 32px button + 4px gap.
const ICON_GROUP_PITCH_PX = 36;

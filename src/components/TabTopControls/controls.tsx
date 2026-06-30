// cspell:disable
import {
  Button,
  Icon,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  SegmentedControl as BlueprintSegmentedControl,
  Switch,
} from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { DecorativeSvgImage } from '@/components/DecorativeSvgImage/DecorativeSvgImage';
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

const PLACEHOLDER_ACTION_TITLE = 'Действие будет подключено отдельной задачей';

// Card section: the dark control-surface card that holds one or more titled fields.
// `flexible` lets the card grow/shrink to fill the toolbar width (the per-tab
// date/time card); `tightGroups` uses the 16px group gap (map function groups);
// `denseFields` uses the 4px field gap (the telemetry "Сигналы" select cluster).
export function ControlCard({
  children,
  ariaLabel,
  className,
  flexible,
  tightGroups,
  denseFields,
}: {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  flexible?: boolean;
  tightGroups?: boolean;
  denseFields?: boolean;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={cx(
        styles.card,
        flexible && styles.cardFlexible,
        tightGroups && styles.cardTightGroups,
        denseFields && styles.cardDenseFields,
        className,
      )}
    >
      {children}
    </section>
  );
}

// A titled field column: a 12px/500 label above its control row. `grow` lets the
// column fill its flexible card so the date/time control stretches dynamically.
// `dense` tightens the control row to the 4px action-button gap (the Figma
// data-management contract) instead of the default 16px group gap.
export function ControlField({
  title,
  children,
  grow,
  dense,
}: {
  title: string;
  children: ReactNode;
  grow?: boolean;
  dense?: boolean;
}) {
  return (
    <div className={cx(styles.field, grow && styles.fieldGrow)}>
      <span className={styles.fieldTitle}>{title}</span>
      <div className={cx(styles.fieldRow, dense && styles.fieldRowDense)}>{children}</div>
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
  wideTabs,
}: {
  items: readonly SegmentItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  /** Widen short options to the Figma bar эталон (min-width per tab). */
  wideTabs?: boolean;
}) {
  // Reuse Blueprint's SegmentedControl: it provides the radiogroup/radio roles
  // and Arrow/Home/End keyboard handling; we only restyle it to the Figma look.
  return (
    <BlueprintSegmentedControl
      aria-label={ariaLabel}
      className={cx(styles.segmented, wideTabs && styles.segmentWideTabs)}
      intent="primary"
      onValueChange={onChange}
      options={items.map((item) => ({ label: item.label, value: item.id, icon: item.icon }))}
      role="radiogroup"
      value={value}
    />
  );
}

// Presentational date-time text field ("24-04-2025 | 00:00").
function DateTimeField({ value, ariaLabel }: { value: string; ariaLabel: string }) {
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

// Toolbar dropdown — reuses the shared SelectControl so it matches the side
// panels (Зондирование/Статистика). Content-sized by default; pass `fill` to
// span its field column (the telemetry "Сигналы" equal-width select cluster).
export function SelectField({
  value,
  options,
  ariaLabel,
  fill,
  iconSrc,
}: {
  value: string;
  options: readonly string[];
  ariaLabel: string;
  fill?: boolean;
  /** Brand/manifest SVG glyph shown instead of the chevron (e.g. map provider). */
  iconSrc?: string;
}) {
  return (
    <SelectControl
      ariaLabel={ariaLabel}
      dense
      fill={fill}
      iconSrc={iconSrc}
      options={options}
      value={value}
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

// Primary accent button — solid accent fill ("Загрузить маршруты"). The sat
// "Создать анимацию…" control uses the outlined ToggleActionButton instead.
export function PrimaryActionButton({
  children,
  disabled = true,
  icon,
  ariaLabel,
  title = PLACEHOLDER_ACTION_TITLE,
}: {
  children: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  ariaLabel?: string;
  title?: string;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className={styles.primaryButton}
      disabled={disabled}
      icon={icon ? <Icon icon={icon} size={16} /> : undefined}
      text={children}
      title={title}
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
  disabled = true,
  icon,
  leadingIcon,
  leadingIconClassName,
  title = PLACEHOLDER_ACTION_TITLE,
}: {
  children: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  leadingIcon?: IconName;
  leadingIconClassName?: string;
  title?: string;
}) {
  return (
    <Button
      className={styles.chipButton}
      disabled={disabled}
      icon={
        leadingIcon ? (
          <Icon className={leadingIconClassName} icon={leadingIcon} size={16} />
        ) : undefined
      }
      endIcon={icon ? <Icon icon={icon} size={16} /> : undefined}
      text={children}
      title={title}
      type="button"
      variant="minimal"
    />
  );
}

// Square icon button (32x30 outline) with a custom SVG glyph from the manifest.
// Uses the Blueprint Button primitive (the SVG-manifest exception only covers
// the glyph rendered via DecorativeSvgImage); presentational local pressed toggle.
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
      <DecorativeSvgImage
        className={styles.iconGlyph}
        dataIconId={id}
        height={16}
        src={mapIconSrc(id)}
        width={16}
      />
    </Button>
  );
}

// A titled group of icon buttons. Adapts to the available width (fixed-chrome
// responsive rule): it shows as many icons as fit and collapses the rest into a
// chevron "more" dropdown at narrow widths. Groups may also opt into a compact
// visible-icon cap at the exact 1920 reference width. Optional `trailing`
// content (the map-layer toggles) sits in the title row above the right-edge
// icon buttons when the wide layout shows it. The toolbar height stays constant
// (single row), so the map stage never resizes on reflow.
export function IconButtonGroup({
  group,
  compactVisibleCount,
  overflowSwitchItems,
  trailing,
}: {
  group: MapIconGroup;
  compactVisibleCount?: number;
  overflowSwitchItems?: readonly string[];
  trailing?: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const total = group.items.length;
  const [visibleCount, setVisibleCount] = useState(total);
  const [overflowing, setOverflowing] = useState(false);
  const [groupGrow, setGroupGrow] = useState(total);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const compute = () => {
      const maxFit = Math.max(1, Math.floor((row.clientWidth + 4) / ICON_GROUP_PITCH_PX));
      const compactLimit = compactVisibleCount ?? total;
      const compactCapActive =
        compactVisibleCount !== undefined &&
        compactLimit < total &&
        window.innerWidth <= COMPACT_ICON_CAP_WIDTH_PX;
      const visibleLimit = compactCapActive ? compactLimit : total;
      const shouldOverflow = visibleLimit < total || maxFit < total;
      setGroupGrow(compactCapActive ? visibleLimit + 1 : total);

      if (!shouldOverflow) {
        setVisibleCount(total);
        setOverflowing(false);
      } else {
        // Reserve one slot for the overflow chevron.
        setVisibleCount(Math.max(1, Math.min(visibleLimit, maxFit - 1)));
        setOverflowing(true);
      }
    };

    const observer = new ResizeObserver(compute);
    observer.observe(row);
    window.addEventListener('resize', compute);
    compute();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [compactVisibleCount, total]);

  const dividerAfter = new Set(group.dividerAfter ?? []);
  const shown = group.items.slice(0, visibleCount);
  const hidden = group.items.slice(visibleCount);

  return (
    <div
      className={cx(
        styles.field,
        styles.iconGroup,
        trailing ? styles.iconGroupWithTrailing : false,
      )}
      style={{ '--group-grow': groupGrow } as CSSProperties}
    >
      <span className={styles.fieldTitle}>{group.title}</span>
      <div className={styles.iconRow} ref={rowRef}>
        {shown.map((id, index) => {
          const hasNextIcon = index < shown.length - 1;
          const hasDropdownAfter = overflowing && index === shown.length - 1;
          const showDivider = dividerAfter.has(index) && (hasNextIcon || hasDropdownAfter);

          return (
            <Fragment key={id}>
              <IconButton id={id} />
              {showDivider ? <span aria-hidden="true" className={styles.iconDivider} /> : null}
            </Fragment>
          );
        })}
        {overflowing ? (
          <MapLayerDropdown
            ariaLabel={`Ещё: ${group.title}`}
            iconItems={hidden}
            menuTestId="map-layer-overflow-menu"
            switchItems={overflowSwitchItems?.map((label) => ({ defaultChecked: true, label }))}
            triggerTestId="map-layer-overflow-trigger"
          />
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

// Compact Blueprint Switch used as a map-layer toggle (no visible label).
export function LayerToggle({ label }: { label: string }) {
  return <Switch aria-label={label} className={styles.layerToggle} defaultChecked />;
}

type OverflowSwitchItem = {
  defaultChecked?: boolean;
  label: string;
};

function OverflowIconMenuItem({ id }: { id: MapIconId }) {
  const [pressed, setPressed] = useState(false);

  return (
    <MenuItem
      active={pressed}
      aria-pressed={pressed}
      data-menu-icon-id={id}
      icon={
        <span className={styles.overflowMenuIcon}>
          <DecorativeSvgImage
            className={styles.overflowMenuGlyph}
            dataIconId={id}
            height={16}
            src={mapIconSrc(id)}
            width={16}
          />
        </span>
      }
      onClick={(event) => {
        event.preventDefault();
        setPressed((value) => !value);
      }}
      shouldDismissPopover={false}
      text={mapIconLabel(id)}
    />
  );
}

// Chevron overflow trigger: exposes controls hidden by compact toolbar/panel
// layouts through a real Blueprint Popover/Menu instead of a dead button.
export function MapLayerDropdown({
  ariaLabel = 'Ещё слои карты',
  iconItems = [],
  menuTestId = 'map-layer-overflow-menu',
  switchItems = [],
  triggerTestId = 'map-layer-overflow-trigger',
}: {
  ariaLabel?: string;
  iconItems?: readonly MapIconId[];
  menuTestId?: string;
  switchItems?: readonly OverflowSwitchItem[];
  triggerTestId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      content={
        <Menu aria-label={ariaLabel} className={styles.overflowMenu} data-testid={menuTestId}>
          {iconItems.map((id) => (
            <OverflowIconMenuItem id={id} key={id} />
          ))}
          {switchItems.map(({ defaultChecked = true, label }) => (
            <li className={styles.overflowSwitchItem} key={label} role="none">
              <SwitchToggle defaultChecked={defaultChecked} label={label} />
            </li>
          ))}
        </Menu>
      }
      interactionKind={PopoverInteractionKind.CLICK}
      isOpen={open}
      minimal
      onInteraction={setOpen}
      placement="bottom-end"
      popoverClassName={styles.overflowMenuPopover}
    >
      <Button
        active={open}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className={styles.iconButton}
        data-testid={triggerTestId}
        icon={<Icon icon="chevron-down" size={16} />}
        title={ariaLabel}
        type="button"
        variant="minimal"
      />
    </Popover>
  );
}

// Approx button pitch used to estimate how many icons fit: 32px button + 4px gap.
const ICON_GROUP_PITCH_PX = 36;
const COMPACT_ICON_CAP_WIDTH_PX = 1920;

// cspell:disable
import { HTMLSelect, Icon } from '@blueprintjs/core';
import { cx } from '@/lib/cx';
import styles from './SelectControl.module.scss';

/**
 * Shared native select control (Blueprint HTMLSelect) with the frozen workspace
 * look: an outlined control surface, a custom chevron-down overlay (Blueprint's
 * built-in caret is hidden), and the placeholder colour variant.
 *
 * Reused by the left side panels (Зондирование / Статистика / Введение пусков)
 * and the per-tab top control toolbars so both share one dropdown contract.
 * Width is contextual: pass `fill` to span the container (side panels); omit it
 * to size to content (top-control toolbar). Supply either `ariaLabel` (toolbar)
 * or `ariaLabelledBy` (side-panel field label) for the accessible name.
 */
export function SelectControl({
  value,
  options,
  placeholder,
  fill,
  dense,
  testId,
  ariaLabel,
  ariaLabelledBy,
}: {
  value: string;
  options?: readonly string[];
  placeholder?: boolean;
  fill?: boolean;
  /** Use the 30px toolbar control height instead of the 32px panel height. */
  dense?: boolean;
  testId?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}) {
  return (
    <div className={styles.selectShell}>
      <HTMLSelect
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cx(
          styles.selectControl,
          dense && styles.selectControlDense,
          placeholder && styles.placeholderControl,
        )}
        data-testid={testId}
        defaultValue={value}
        fill={fill}
        options={options && options.length ? [...options] : [value]}
      />
      <Icon className={styles.selectShellIcon} icon="chevron-down" size={16} />
    </div>
  );
}

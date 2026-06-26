// cspell:disable
import { Button, Checkbox, Icon, InputGroup, TextArea } from '@blueprintjs/core';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import { RAIL_BY_TAB } from '@/components/AppNavigation/navigation';
import { SelectControl as SharedSelectControl } from '@/components/controls/SelectControl/SelectControl';
import { LeftRail } from '@/components/LeftRail/LeftRail';
import type { WorkspaceMapTheme } from '@/components/WorkspaceMap/mapConfig';
import { cx } from '@/lib/cx';
import styles from './TabSidePanel.module.scss';

type TabSidePanelProps = {
  activeTab: HeaderTabId;
  labelledBy: string;
  mapTheme: WorkspaceMapTheme;
  onToggleMapTheme: () => void;
  railExpanded: boolean;
  onRailExpandedChange: (expanded: boolean) => void;
};

type FieldProps = {
  label: string;
  children: ReactNode;
  hidden?: boolean;
};

type SelectFieldConfig = {
  label: string;
  options?: readonly string[];
  testId?: string;
  value: string;
  placeholder?: boolean;
};

function SectionDivider() {
  return <div className={styles.divider} aria-hidden="true" />;
}

function PanelChrome({
  children,
  footer,
  testId,
  title,
}: {
  children: ReactNode;
  footer: ReactNode;
  testId: string;
  title: string;
}) {
  return (
    <aside className={styles.panel} data-testid={testId} aria-labelledby={`${testId}-title`}>
      <div className={styles.panelBody}>
        <header className={styles.panelHeader}>
          <div className={styles.panelTitleRow}>
            <h2 className={styles.panelTitle} id={`${testId}-title`}>
              {title}
            </h2>
            <Button
              aria-label="Свернуть панель"
              className={styles.iconButton}
              disabled
              icon={<Icon icon="panel" size={16} />}
              title="Сворачивание панели будет подключено отдельной задачей"
              type="button"
              variant="minimal"
            />
          </div>
          <SectionDivider />
        </header>
        <div className={styles.panelContent}>{children}</div>
      </div>
      <footer className={styles.panelFooter}>{footer}</footer>
    </aside>
  );
}

const FieldLabelContext = createContext<string | undefined>(undefined);

function useFieldLabelId() {
  return useContext(FieldLabelContext);
}

function Field({ label, children, hidden }: FieldProps) {
  const labelId = useId();

  return (
    <div className={cx(styles.field, hidden && styles.hiddenField)}>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      <FieldLabelContext.Provider value={labelId}>{children}</FieldLabelContext.Provider>
    </div>
  );
}

function SelectControl({
  options,
  placeholder,
  testId,
  value,
}: {
  options?: readonly string[];
  placeholder?: boolean;
  testId?: string;
  value: string;
}) {
  const labelledBy = useFieldLabelId();

  return (
    <SharedSelectControl
      ariaLabelledBy={labelledBy}
      fill
      options={options}
      placeholder={placeholder}
      testId={testId}
      value={value}
    />
  );
}

function DateTimeControl({
  calendarIcon,
  compact,
  dark,
  displayValue,
  nativeValue,
  testId,
}: {
  calendarIcon?: boolean;
  compact?: boolean;
  dark?: boolean;
  displayValue: string;
  nativeValue: string;
  testId: string;
}) {
  const labelledBy = useFieldLabelId();

  return (
    <div className={styles.dateTimeShell}>
      <InputGroup
        aria-labelledby={labelledBy}
        className={dark ? styles.darkInputControl : styles.inputControl}
        data-testid={testId}
        defaultValue={displayValue}
        inputClassName={cx(
          styles.inputElement,
          styles.dateTimeElement,
          calendarIcon && styles.dateTimeWithIconElement,
          compact && styles.compactDateTimeElement,
        )}
        leftElement={
          calendarIcon ? (
            <Icon className={styles.dateTimeCalendarIcon} icon="calendar" size={14} />
          ) : undefined
        }
        type="text"
      />
      <input
        aria-label="Открыть календарь"
        className={cx(
          styles.nativeDateTimeInput,
          calendarIcon && styles.nativeDateTimeInputWithIcon,
        )}
        data-testid={`${testId}-calendar`}
        defaultValue={nativeValue}
        type="datetime-local"
      />
    </div>
  );
}

function CheckboxControl({ value }: { value: string }) {
  const labelledBy = useFieldLabelId();

  return (
    <div className={styles.checkboxControl}>
      <span className={styles.checkboxText}>{value}</span>
      <Checkbox
        aria-label={value}
        aria-labelledby={labelledBy}
        className={styles.checkbox}
        defaultChecked={false}
      />
    </div>
  );
}

function CommentControl({ editable, testId }: { editable?: boolean; testId?: string }) {
  const labelledBy = useFieldLabelId();

  return (
    <TextArea
      aria-labelledby={labelledBy}
      className={styles.textareaControl}
      data-testid={testId}
      fill
      placeholder="Напишите здесь любую информацию, которую сочтете важным"
      readOnly={!editable}
    />
  );
}

function FieldGrid({ fields }: { fields: readonly SelectFieldConfig[] }) {
  return (
    <div className={styles.fieldGrid}>
      {fields.map((field) => (
        <Field key={field.label} label={field.label}>
          <SelectControl
            options={field.options}
            placeholder={field.placeholder}
            testId={field.testId}
            value={field.value}
          />
        </Field>
      ))}
    </div>
  );
}

function ActionButton({
  children,
  accent,
  outlineAccent,
}: {
  children: ReactNode;
  accent?: boolean;
  outlineAccent?: boolean;
}) {
  return (
    <Button
      className={cx(
        styles.actionButton,
        accent && styles.actionButtonAccent,
        outlineAccent && styles.actionButtonOutlineAccent,
      )}
      text={children}
      type="button"
      variant="minimal"
    />
  );
}

function KickFooter() {
  return (
    <>
      <div className={styles.footerRow}>
        <ActionButton>Отмена</ActionButton>
        <ActionButton accent>Отправить</ActionButton>
      </div>
      <ActionButton outlineAccent>Изменить шаблон</ActionButton>
    </>
  );
}

function StatsFooter() {
  return (
    <>
      <div className={styles.footerRow}>
        <ActionButton>Отмена</ActionButton>
        <ActionButton accent>Применить</ActionButton>
      </div>
      <ActionButton>Сбросить все</ActionButton>
    </>
  );
}

function SatFooter() {
  return (
    <div className={styles.footerRow}>
      <ActionButton>Отмена</ActionButton>
      <ActionButton accent>Применить</ActionButton>
    </div>
  );
}

function KickPanel() {
  return (
    <PanelChrome
      footer={<KickFooter />}
      testId="kick-side-panel"
      title="Создание параметров для пуска"
    >
      <FieldGrid
        fields={[
          {
            label: 'Тип точки',
            options: ['Все точки', 'Тестовая точка 1', 'Тестовая точка 2'],
            testId: 'kick-select-point-type',
            value: 'Все точки',
          },
          {
            label: 'Точка пуска',
            options: ['Все', 'Пуск 1', 'Пуск 2'],
            testId: 'kick-select-launch-point',
            value: 'Все',
          },
        ]}
      />
      <SectionDivider />
      <div className={styles.fieldGrid}>
        <Field label="1. Номер расчета">
          <SelectControl placeholder testId="kick-select-calculation-number" value="Введите" />
        </Field>
        <Field label="2. Тип изделия">
          <SelectControl placeholder testId="kick-select-product-type" value="Укажите тип" />
        </Field>
        <Field label="3. Номер изделия">
          <SelectControl placeholder testId="kick-select-product-number" value="Введите" />
        </Field>
        <Field label="4. Дата и время пуска">
          <DateTimeControl
            compact
            displayValue="02.05.2026 | 16:31"
            nativeValue="2026-05-02T16:31"
            testId="kick-launch-datetime"
          />
        </Field>
        <Field label="5. Номер ПЗ">
          <SelectControl placeholder testId="kick-select-pz-number" value="Укажите" />
        </Field>
        <Field label="6. Борщ">
          <CheckboxControl value="Есть" />
        </Field>
        <Field label="7. Тип БЧ">
          <SelectControl placeholder testId="kick-select-warhead-type" value="Укажите тип" />
        </Field>
        <Field label="8. Пампушка">
          <SelectControl placeholder testId="kick-select-pampushka" value="Выберите" />
        </Field>
        <Field label="9. Вилка">
          <SelectControl placeholder testId="kick-select-fork" value="Выберите" />
        </Field>
        <Field label="10. Редиска">
          <SelectControl placeholder testId="kick-select-radish" value="Выберите" />
        </Field>
        <Field label="11. Камера">
          <SelectControl placeholder testId="kick-select-camera" value="Выберите" />
        </Field>
        <Field label="12. Падение на старте">
          <CheckboxControl value="Падение" />
        </Field>
      </div>
      <Field label="14. Интерес">
        <SelectControl testId="kick-select-interest" value="Прочее" />
      </Field>
      <Field label="15. Комментарий">
        <CommentControl editable testId="kick-comment" />
      </Field>
    </PanelChrome>
  );
}

function LaunchDayCard() {
  return (
    <section className={styles.filterCard} aria-label="Пусковые сутки">
      <Field label="Начало отсчета">
        <DateTimeControl
          calendarIcon
          dark
          displayValue="24-04-2025 | 00:00"
          nativeValue="2025-04-24T00:00"
          testId="stats-start-datetime"
        />
      </Field>
      <Field label="Окончание отсчета">
        <DateTimeControl
          calendarIcon
          dark
          displayValue="24-04-2025 | 00:00"
          nativeValue="2025-04-24T00:00"
          testId="stats-end-datetime"
        />
      </Field>
      <ActionButton outlineAccent>Текущие пусковые сутки (16:00-16:00)</ActionButton>
    </section>
  );
}

function StatsPanel() {
  return (
    <PanelChrome footer={<StatsFooter />} testId="stats-side-panel" title="Фильтры таблицы">
      <p className={styles.counter}>
        Найдено записей:<strong> 310</strong>
      </p>
      <LaunchDayCard />
      <SectionDivider />
      <Field label="Выбор данных таблицы">
        <SelectControl value="Все" />
      </Field>
      <SectionDivider />
      <FieldGrid
        fields={[
          { label: 'Тип точки', value: 'Все точки' },
          { label: 'Точка пуска', value: 'Все' },
        ]}
      />
      <SectionDivider />
      <FieldGrid
        fields={[
          { label: 'Борщ', value: 'Все' },
          { label: 'Вилка', value: 'Все' },
          { label: 'Падение на старте', value: 'Все' },
          { label: 'Тип БЧ', value: 'Все' },
          { label: 'Тип ПУ', value: 'Все' },
          { label: 'Серия', value: 'Все' },
          { label: 'Интерес', value: 'Все' },
        ]}
      />
    </PanelChrome>
  );
}

const SAT_GALLERY_TABS = [
  { id: 'visual', label: 'Визуализация' },
  { id: 'saved', label: 'Сохранённые' },
  { id: 'marks', label: 'Метки' },
] as const;

type SatGalleryTabId = (typeof SAT_GALLERY_TABS)[number]['id'];

type SatSnapshot = {
  id: string;
  number: string;
  timestamp: string;
  status: string;
};

const SAT_SNAPSHOTS: readonly SatSnapshot[] = [
  { id: 's1', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Визуализация' },
  { id: 's2', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Визуализация' },
  { id: 's3', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Визуализация' },
  { id: 's4', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Визуализация' },
  { id: 's5', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Визуализация' },
  { id: 's6', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Поверочн' },
  { id: 's7', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Поверочн' },
  { id: 's8', number: '234234234234', timestamp: '28.06.2025 13:00:00', status: 'Поверочн' },
];

function SatGalleryTabs({
  activeId,
  onSelect,
}: {
  activeId: SatGalleryTabId;
  onSelect: (id: SatGalleryTabId) => void;
}) {
  return (
    // These are mutually-exclusive filter toggles, not a W3C tab widget (the
    // snapshot content is a placeholder that does not switch yet), so they use
    // plain aria-pressed toggle buttons — the same pattern as ToggleActionButton —
    // rather than role="tab"/"tablist" (which would require roving tabindex and a
    // wired tabpanel).
    <div className={styles.galleryTabs} role="group" aria-label="Раздел галереи">
      {SAT_GALLERY_TABS.map((tab) => {
        const active = tab.id === activeId;

        return (
          <Button
            key={tab.id}
            aria-pressed={active}
            className={cx(styles.galleryTab, active && styles.galleryTabActive)}
            onClick={() => onSelect(tab.id)}
            text={tab.label}
            type="button"
            variant="minimal"
          />
        );
      })}
    </div>
  );
}

function SatSnapshotCard({ snapshot }: { snapshot: SatSnapshot }) {
  return (
    <li className={styles.snapshotCard}>
      <div className={styles.snapshotThumb} aria-hidden="true">
        <Icon className={styles.snapshotThumbIcon} icon="media" size={20} />
      </div>
      <div className={styles.snapshotMeta}>
        <span className={styles.snapshotNumber}>{snapshot.number}</span>
        <span className={styles.snapshotTimestamp}>{snapshot.timestamp}</span>
        <span className={styles.snapshotStatus}>{snapshot.status}</span>
      </div>
    </li>
  );
}

function SatPanel() {
  const [activeTab, setActiveTab] = useState<SatGalleryTabId>('visual');

  return (
    <PanelChrome footer={<SatFooter />} testId="sat-side-panel" title="OsiDus">
      <SatGalleryTabs activeId={activeTab} onSelect={setActiveTab} />
      <div className={styles.galleryCount}>
        <span className={styles.label}>Снимки в выделенной области</span>
        <span className={styles.galleryCountValue}>Найдено {SAT_SNAPSHOTS.length}</span>
      </div>
      <ul className={styles.snapshotList} aria-label="Снимки в выделенной области">
        {SAT_SNAPSHOTS.map((snapshot) => (
          <SatSnapshotCard key={snapshot.id} snapshot={snapshot} />
        ))}
      </ul>
    </PanelChrome>
  );
}

export function TabSidePanel({
  activeTab,
  labelledBy,
  mapTheme,
  onToggleMapTheme,
  railExpanded,
  onRailExpandedChange,
}: TabSidePanelProps) {
  if (activeTab === 'kick') return <KickPanel />;
  if (activeTab === 'stats') return <StatsPanel />;
  if (activeTab === 'sat') return <SatPanel />;

  return (
    <LeftRail
      config={RAIL_BY_TAB[activeTab]}
      expanded={railExpanded}
      labelledBy={labelledBy}
      mapTheme={mapTheme}
      onExpandedChange={onRailExpandedChange}
      onToggleMapTheme={onToggleMapTheme}
    />
  );
}

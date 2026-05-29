// cspell:disable
import { Button, Checkbox, HTMLSelect, Icon, InputGroup, TextArea } from '@blueprintjs/core';
import { createContext, useContext, useId, type ReactNode } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import { RAIL_BY_TAB } from '@/components/AppNavigation/navigation';
import { LeftRail } from '@/components/LeftRail/LeftRail';
import styles from './TabSidePanel.module.scss';

type TabSidePanelProps = {
  activeTab: HeaderTabId;
  labelledBy: string;
};

type FieldProps = {
  label: string;
  children: ReactNode;
  hidden?: boolean;
};

type SelectFieldConfig = {
  label: string;
  value: string;
  placeholder?: boolean;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

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
              icon={<Icon icon="panel" size={16} />}
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

function SelectControl({ value, placeholder }: { value: string; placeholder?: boolean }) {
  const labelledBy = useFieldLabelId();

  return (
    <div className={styles.selectShell}>
      <HTMLSelect
        aria-labelledby={labelledBy}
        className={cx(styles.selectControl, placeholder && styles.placeholderControl)}
        defaultValue={value}
        fill
        options={[value]}
      />
      <Icon className={styles.selectShellIcon} icon="chevron-down" size={16} />
    </div>
  );
}

function InputControl({ value, placeholder }: { value: string; placeholder?: boolean }) {
  const labelledBy = useFieldLabelId();

  return (
    <InputGroup
      aria-labelledby={labelledBy}
      className={cx(styles.inputControl, placeholder && styles.placeholderControl)}
      defaultValue={value}
      inputClassName={cx(styles.inputElement, placeholder && styles.placeholderElement)}
      readOnly
      rightElement={<Icon className={styles.controlIcon} icon="chevron-down" size={16} />}
    />
  );
}

function DateControl({ value }: { value: string }) {
  const labelledBy = useFieldLabelId();

  return (
    <InputGroup
      aria-labelledby={labelledBy}
      className={styles.inputControl}
      defaultValue={value}
      inputClassName={styles.inputElement}
      readOnly
    />
  );
}

function DateTimeControl({ value }: { value: string }) {
  const labelledBy = useFieldLabelId();

  return (
    <InputGroup
      aria-labelledby={labelledBy}
      className={styles.darkInputControl}
      defaultValue={value}
      inputClassName={styles.inputElement}
      leftElement={<Icon className={styles.controlIcon} icon="calendar" size={16} />}
      readOnly
    />
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

function CommentControl() {
  const labelledBy = useFieldLabelId();

  return (
    <TextArea
      aria-labelledby={labelledBy}
      className={styles.textareaControl}
      fill
      placeholder="Напишите здесь любую информацию, которую сочтете важным"
      readOnly
    />
  );
}

function FieldGrid({ fields }: { fields: readonly SelectFieldConfig[] }) {
  return (
    <div className={styles.fieldGrid}>
      {fields.map((field) => (
        <Field key={field.label} label={field.label}>
          <SelectControl value={field.value} placeholder={field.placeholder} />
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
          { label: 'Тип точки', value: 'Все точки' },
          { label: 'Точка пуска', value: 'Все' },
        ]}
      />
      <SectionDivider />
      <div className={styles.fieldGrid}>
        <Field label="1. Номер расчета">
          <InputControl value="Введите" placeholder />
        </Field>
        <Field label="2. Тип изделия">
          <InputControl value="Укажите тип" placeholder />
        </Field>
        <Field label="3. Номер изделия">
          <InputControl value="Введите" placeholder />
        </Field>
        <Field label="4. Дата и время пуска">
          <DateControl value="02.05.2026 | 16:31" />
        </Field>
        <Field label="5. Номер ПЗ">
          <InputControl value="Укажите" placeholder />
        </Field>
        <Field label="6. Борщ">
          <CheckboxControl value="Есть" />
        </Field>
        <Field label="7. Тип БЧ">
          <InputControl value="Укажите тип" placeholder />
        </Field>
        <Field label="8. Пампушка">
          <InputControl value="Выберите" placeholder />
        </Field>
        <Field label="9. Вилка">
          <InputControl value="Выберите" placeholder />
        </Field>
        <Field label="10. Редиска">
          <InputControl value="Выберите" placeholder />
        </Field>
        <Field label="11. Камера">
          <InputControl value="Выберите" placeholder />
        </Field>
        <Field label="12. Падение на старте">
          <CheckboxControl value="Падение" />
        </Field>
      </div>
      <Field label="14. Интерес">
        <InputControl value="Прочее" placeholder />
      </Field>
      <Field label="15. Комментарий">
        <CommentControl />
      </Field>
    </PanelChrome>
  );
}

function LaunchDayCard() {
  return (
    <section className={styles.filterCard} aria-label="Пусковые сутки">
      <Field label="Начало отсчета">
        <DateTimeControl value="24-04-2025   l   00:00" />
      </Field>
      <Field label="Окончание отсчета">
        <DateTimeControl value="24-04-2025   l   00:00" />
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

function SatPanel() {
  return (
    <PanelChrome footer={<SatFooter />} testId="sat-side-panel" title="Зондирование">
      <FieldGrid
        fields={[
          { label: 'Источник данных', value: 'Все' },
          { label: 'Период', value: 'Текущий' },
        ]}
      />
      <SectionDivider />
      <Field label="Слой наблюдения">
        <SelectControl value="Заглушка" />
      </Field>
      <Field label="Комментарий">
        <CommentControl />
      </Field>
    </PanelChrome>
  );
}

export function TabSidePanel({ activeTab, labelledBy }: TabSidePanelProps) {
  if (activeTab === 'kick') return <KickPanel />;
  if (activeTab === 'stats') return <StatsPanel />;
  if (activeTab === 'sat') return <SatPanel />;

  return <LeftRail config={RAIL_BY_TAB[activeTab]} labelledBy={labelledBy} />;
}

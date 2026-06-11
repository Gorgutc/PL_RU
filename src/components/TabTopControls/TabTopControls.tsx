// cspell:disable
import { useState, type ReactNode } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import {
  ChipButton,
  ControlCard,
  ControlField,
  DateTimeRange,
  IconButtonGroup,
  LayerToggle,
  PrimaryActionButton,
  SearchField,
  SegmentedControl,
  SelectField,
  SwitchToggle,
  ToggleActionButton,
  type SegmentItem,
} from './controls';
import { MAP_FUNCTION_GROUPS, MAP_LAYER_GROUP, MAP_LAYER_TOGGLES } from './mapIcons';
import styles from './TabTopControls.module.scss';

const DATETIME_FROM = '24-04-2025 | 00:00';
const DATETIME_TO = '24-04-2025 | 00:00';
// In the compact band (< 1920) the references drop the time part of the value.
const DATETIME_COMPACT = '24-04-2025';

// ── Shell ────────────────────────────────────────────────────────────────────
// At 1920 with the rail collapsed the cards fill the full toolbar width with no
// internal horizontal scroll; the "Тип данных" group stays pinned on the right.
function Toolbar({
  label,
  children,
  trailing,
}: {
  label: string;
  children: ReactNode;
  trailing: ReactNode;
}) {
  return (
    <div
      aria-label={label}
      className={styles.toolbar}
      data-testid="tab-top-controls"
      role="toolbar"
    >
      <div className={styles.scroller}>{children}</div>
      <div className={styles.trailing}>{trailing}</div>
    </div>
  );
}

// "Тип данных" segmented card with local selection state.
function DataTypeCard({ items }: { items: readonly SegmentItem[] }) {
  const [value, setValue] = useState(items[0]?.id ?? '');
  return (
    <ControlCard ariaLabel="Тип данных">
      <ControlField title="Тип данных">
        <SegmentedControl ariaLabel="Тип данных" items={items} onChange={setValue} value={value} />
      </ControlField>
    </ControlCard>
  );
}

function DateTimeCard({
  from = DATETIME_FROM,
  to = DATETIME_TO,
  compactDateOnly,
}: {
  from?: string;
  to?: string;
  compactDateOnly?: boolean;
} = {}) {
  return (
    <ControlField grow title="Дата и время от и до:">
      <DateTimeRange
        compactFrom={compactDateOnly ? DATETIME_COMPACT : undefined}
        compactTo={compactDateOnly ? DATETIME_COMPACT : undefined}
        from={from}
        to={to}
      />
    </ControlField>
  );
}

// ── map: Оперативная карта ────────────────────────────────────────────────────
const MAP_DATA_TYPES: readonly SegmentItem[] = [
  { id: 'operational', label: 'Оперативная', icon: 'list' },
  { id: 'analysis', label: 'Анализ данных', icon: 'list' },
];
// The map date/time card shows date-only values in the reference (no time).
const MAP_DATETIME = '24-04-2025';

function MapTopControls() {
  return (
    <Toolbar
      label="Управление: оперативная карта"
      trailing={<DataTypeCard items={MAP_DATA_TYPES} />}
    >
      <ControlCard ariaLabel="Дата и время" compactIntrinsic flexible>
        <DateTimeCard from={MAP_DATETIME} to={MAP_DATETIME} />
      </ControlCard>
      <ControlCard ariaLabel="Функции карты" tightGroups>
        {MAP_FUNCTION_GROUPS.map((group) => (
          <IconButtonGroup group={group} key={group.title} />
        ))}
        <IconButtonGroup
          group={MAP_LAYER_GROUP}
          trailing={
            <span className={styles.layerToggles}>
              {MAP_LAYER_TOGGLES.map((label) => (
                <LayerToggle key={label} label={label} />
              ))}
            </span>
          }
        />
      </ControlCard>
    </Toolbar>
  );
}

// ── bar: Маршруты ──────────────────────────────────────────────────────────────
const BAR_WEATHER: readonly SegmentItem[] = [
  { id: 'wind', label: 'Погода и направление ветра', icon: 'list' },
  { id: 'clouds', label: 'Облачность и намерзание', icon: 'pie-chart' },
  { id: 'precip', label: 'Осадки и ветренность', icon: 'pie-chart' },
];
const BAR_DATA_TYPES: readonly SegmentItem[] = [
  { id: 'targets', label: 'Цели', icon: 'list' },
  { id: 'routes', label: 'Маршруты', icon: 'pie-chart' },
  { id: 'simulation', label: 'Имитация', icon: 'list' },
];

function WeatherCard() {
  const [value, setValue] = useState(BAR_WEATHER[0].id);
  return (
    <ControlCard ariaLabel="Погодные параметры">
      <ControlField title="Погодные параметры">
        <SegmentedControl
          ariaLabel="Погодные параметры"
          bandClassName={styles.fullBandOnly}
          items={BAR_WEATHER}
          onChange={setValue}
          value={value}
        />
        {/* In the compact band the segments fold into a single dropdown ("Все"),
            matching the 1280 reference. */}
        <span className={styles.compactBandOnly}>
          <SelectField ariaLabel="Погодные параметры" options={['Все']} value="Все" />
        </span>
      </ControlField>
    </ControlCard>
  );
}

function RoutesTopControls() {
  return (
    <Toolbar label="Управление: маршруты" trailing={<DataTypeCard items={BAR_DATA_TYPES} />}>
      <ControlCard ariaLabel="Работа с данными по карте" flexible>
        <ControlField title="Работа с данными по карте">
          <SearchField placeholder="Поиск по названию, координатам" />
        </ControlField>
        <DateTimeCard compactDateOnly />
      </ControlCard>
      <WeatherCard />
    </Toolbar>
  );
}

// ── tmi: Телеметрия ─────────────────────────────────────────────────────────────
const TMI_DATA_TYPES: readonly SegmentItem[] = [
  { id: 'telemetry', label: 'Телеметрия', icon: 'list' },
  { id: 'flight-tasks', label: 'Полетные задания', icon: 'pie-chart' },
];

function TelemetryTopControls() {
  return (
    <Toolbar label="Управление: телеметрия" trailing={<DataTypeCard items={TMI_DATA_TYPES} />}>
      {/* compactIntrinsic is interim: the tmi compact fold (Серия/Номер stay,
          the other selects collapse into "Доп. параметры" + "Фильтры") lands
          with the telemetry iteration; until then the tab keeps the pre-fix
          intrinsic behavior in the compact band. */}
      <ControlCard ariaLabel="Дата и загрузка маршрутов" compactIntrinsic flexible>
        <DateTimeCard compactDateOnly />
        <ControlField title=" ">
          <PrimaryActionButton icon="flows">Загрузить маршруты</PrimaryActionButton>
        </ControlField>
      </ControlCard>
      <ControlCard ariaLabel="Сигналы">
        <ControlField title="Серия">
          <SelectField ariaLabel="Серия" options={['—']} value="—" />
        </ControlField>
        <ControlField title="Номер">
          <SelectField ariaLabel="Номер" options={['—']} value="—" />
        </ControlField>
        <ControlField title="Сигнал">
          <SelectField ariaLabel="Сигнал" options={['SADRA']} value="SADRA" />
        </ControlField>
        <ControlField title="Сравнить сигнал">
          <SelectField ariaLabel="Сравнить сигнал" options={['SADRA']} value="SADRA" />
        </ControlField>
        <ControlField title="Графики">
          <SelectField ariaLabel="Графики" options={['Высота']} value="Высота" />
        </ControlField>
        <ControlField title="Параметры">
          <SelectField
            ariaLabel="Параметры"
            options={['Высота по баллистике']}
            value="Высота по баллистике"
          />
        </ControlField>
      </ControlCard>
    </Toolbar>
  );
}

// ── sat: Зондирование ───────────────────────────────────────────────────────────
const SAT_SOURCES: readonly string[] = [
  'Airbus',
  'F',
  'Innoter',
  'Maxar',
  'Planet',
  'Sentinel-2 Level - 2A',
  'Поиск  без AOI',
];
const SAT_DATA_TYPES: readonly SegmentItem[] = [
  { id: '2d', label: '2D - визуал', icon: 'list' },
  { id: '3d', label: '3D - визуал', icon: 'pie-chart' },
  { id: 'histogram', label: 'Гистограмма', icon: 'list' },
];

function SatTopControls() {
  return (
    <Toolbar label="Управление: зондирование" trailing={<DataTypeCard items={SAT_DATA_TYPES} />}>
      <ControlCard ariaLabel="Временной диапазон" compactIntrinsic flexible>
        <ControlField grow title="Временной диапазон">
          <DateTimeRange from={DATETIME_FROM} to={DATETIME_TO} />
        </ControlField>
      </ControlCard>
      <ControlCard ariaLabel="Источники данных">
        <ControlField title="Источники данных">
          {SAT_SOURCES.map((source) => (
            <SwitchToggle defaultChecked key={source} label={source} />
          ))}
        </ControlField>
      </ControlCard>
      <ControlCard ariaLabel="Анимация">
        <ControlField title="Анимация">
          <ToggleActionButton icon="grid-view">
            Создать анимацию с замедленной сьемкой
          </ToggleActionButton>
        </ControlField>
      </ControlCard>
    </Toolbar>
  );
}

// ── kick: Введение пусков ────────────────────────────────────────────────────────
const KICK_DATA_TYPES: readonly SegmentItem[] = [
  { id: 'templates', label: 'Шаблоны', icon: 'list' },
  { id: 'active', label: 'Активные (3)', icon: 'pie-chart' },
  { id: 'history', label: 'История', icon: 'list' },
];

function KickTopControls() {
  return (
    <Toolbar
      label="Управление: введение пусков"
      trailing={<DataTypeCard items={KICK_DATA_TYPES} />}
    >
      <ControlCard ariaLabel="Текущие пуски" compactIntrinsic flexible>
        <ControlField title="Текущие пуски">
          <SearchField placeholder="Поиск по таблице" />
          <ChipButton icon="filter">Фильтры</ChipButton>
          <SelectField ariaLabel="Пользователи" options={['Пользователи']} value="Пользователи" />
          <SelectField ariaLabel="Итог" options={['Итог есть']} value="Итог есть" />
        </ControlField>
        <DateTimeCard />
      </ControlCard>
    </Toolbar>
  );
}

// ── stats: Статистика ────────────────────────────────────────────────────────────
const STATS_DATA_TYPES: readonly SegmentItem[] = [
  { id: 'table', label: 'Таблица', icon: 'list' },
  { id: 'stats', label: 'Статистика', icon: 'pie-chart' },
  { id: 'analysis', label: 'Анализ данных', icon: 'list' },
];

function StatsTopControls() {
  return (
    <Toolbar label="Управление: статистика" trailing={<DataTypeCard items={STATS_DATA_TYPES} />}>
      <ControlCard ariaLabel="Работа с таблицей" compactIntrinsic flexible>
        <ControlField title="Работа с таблицей">
          <SearchField placeholder="Поиск по таблице" />
          <ChipButton icon="filter">Фильтры</ChipButton>
          <SelectField ariaLabel="Пользователи" options={['Пользователи']} value="Пользователи" />
          <SelectField
            ariaLabel="Активность Борща"
            options={['Активность Борща']}
            value="Активность Борща"
          />
        </ControlField>
        <DateTimeCard />
      </ControlCard>
    </Toolbar>
  );
}

export function TabTopControls({ activeTab }: { activeTab: HeaderTabId }) {
  switch (activeTab) {
    case 'map':
      return <MapTopControls />;
    case 'bar':
      return <RoutesTopControls />;
    case 'tmi':
      return <TelemetryTopControls />;
    case 'sat':
      return <SatTopControls />;
    case 'kick':
      return <KickTopControls />;
    case 'stats':
      return <StatsTopControls />;
    default:
      return null;
  }
}

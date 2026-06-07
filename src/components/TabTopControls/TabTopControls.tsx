// cspell:disable
import { Fragment, useState, type ReactNode } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import {
  ChipButton,
  ControlCard,
  ControlField,
  DateTimeRange,
  IconButton,
  IconButtonGroup,
  LayerToggle,
  PrimaryActionButton,
  SearchField,
  SegmentedControl,
  SelectField,
  SwitchToggle,
  type SegmentItem,
} from './controls';
import { MAP_FUNCTION_GROUPS, MAP_LAYER_GROUP, MAP_LAYER_TOGGLES } from './mapIcons';
import styles from './TabTopControls.module.scss';

const DATETIME_FROM = '24-04-2025  |  00:00';
const DATETIME_TO = '24-04-2025  |  00:00';

// ── Shell ────────────────────────────────────────────────────────────────────
// Leading groups scroll horizontally when space is tight; the "Тип данных"
// group stays pinned on the right.
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

function DateTimeCard() {
  return (
    <ControlField title="Дата и время от и до:">
      <DateTimeRange from={DATETIME_FROM} to={DATETIME_TO} />
    </ControlField>
  );
}

// ── map: Оперативная карта ────────────────────────────────────────────────────
const MAP_DATA_TYPES: readonly SegmentItem[] = [
  { id: 'operational', label: 'Оперативная', icon: 'list' },
  { id: 'analysis', label: 'Анализ данных', icon: 'list' },
];

// Map layers group: icon buttons (with dividers) plus the two map toggles.
function MapLayersField() {
  const dividerAfter = new Set(MAP_LAYER_GROUP.dividerAfter ?? []);
  return (
    <div className={styles.field}>
      <span className={styles.fieldTitle}>{MAP_LAYER_GROUP.title}</span>
      <div className={styles.iconRow}>
        {MAP_LAYER_GROUP.items.map((id, index) => (
          <Fragment key={id}>
            <IconButton id={id} />
            {dividerAfter.has(index) ? (
              <span aria-hidden="true" className={styles.iconDivider} />
            ) : null}
          </Fragment>
        ))}
        {MAP_LAYER_TOGGLES.map((label) => (
          <LayerToggle key={label} label={label} />
        ))}
      </div>
    </div>
  );
}

function MapTopControls() {
  return (
    <Toolbar
      label="Управление: оперативная карта"
      trailing={<DataTypeCard items={MAP_DATA_TYPES} />}
    >
      <ControlCard ariaLabel="Дата и время">
        <DateTimeCard />
      </ControlCard>
      <ControlCard ariaLabel="Функции карты">
        {MAP_FUNCTION_GROUPS.map((group) => (
          <IconButtonGroup group={group} key={group.title} />
        ))}
        <MapLayersField />
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
          items={BAR_WEATHER}
          onChange={setValue}
          value={value}
        />
      </ControlField>
    </ControlCard>
  );
}

function RoutesTopControls() {
  return (
    <Toolbar label="Управление: маршруты" trailing={<DataTypeCard items={BAR_DATA_TYPES} />}>
      <ControlCard ariaLabel="Работа с данными по карте">
        <ControlField title="Работа с данными по карте">
          <SearchField placeholder="Поиск по названию, координатам" />
        </ControlField>
        <DateTimeCard />
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
      <ControlCard ariaLabel="Дата и загрузка маршрутов">
        <DateTimeCard />
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
      <ControlCard ariaLabel="Временной диапазон">
        <ControlField title="Временной диапазон">
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
          <PrimaryActionButton icon="grid-view">
            Создать анимацию с замедленной сьемкой
          </PrimaryActionButton>
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
      <ControlCard ariaLabel="Текущие пуски">
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
      <ControlCard ariaLabel="Работа с таблицей">
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

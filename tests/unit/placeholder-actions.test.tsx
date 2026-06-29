import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { ChipButton, PrimaryActionButton } from '@/components/TabTopControls/controls';
import { TabSidePanel } from '@/components/TabSidePanel/TabSidePanel';

const PLACEHOLDER_TITLE = 'Действие будет подключено отдельной задачей';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactElement) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('placeholder action buttons', () => {
  it('keeps top-control placeholder actions disabled until behavior is wired', () => {
    const primary = render(
      <PrimaryActionButton icon="flows">Загрузить маршруты</PrimaryActionButton>,
    );
    const primaryButton = primary.container.querySelector('button');

    expect(primaryButton).not.toBeNull();
    expect(primaryButton?.disabled).toBe(true);
    expect(primaryButton?.getAttribute('title')).toBe(PLACEHOLDER_TITLE);

    primary.unmount();

    const chip = render(<ChipButton icon="filter">Фильтры</ChipButton>);
    const chipButton = chip.container.querySelector('button');

    expect(chipButton).not.toBeNull();
    expect(chipButton?.disabled).toBe(true);
    expect(chipButton?.getAttribute('title')).toBe(PLACEHOLDER_TITLE);

    chip.unmount();
  });

  it('keeps side-panel footer action placeholders disabled until behavior is wired', () => {
    const sidePanel = render(
      <TabSidePanel
        activeTab="kick"
        labelledBy="workspace-title"
        mapTheme="light"
        onRailExpandedChange={() => undefined}
        onToggleMapTheme={() => undefined}
        railExpanded={false}
      />,
    );

    for (const label of ['Отмена', 'Отправить', 'Изменить шаблон']) {
      const button = [...sidePanel.container.querySelectorAll('button')].find(
        (candidate) => candidate.textContent === label,
      );

      expect(button).not.toBeUndefined();
      expect(button?.disabled).toBe(true);
      expect(button?.getAttribute('title')).toBe(PLACEHOLDER_TITLE);
    }

    sidePanel.unmount();
  });
});

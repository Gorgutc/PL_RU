// cspell:disable
'use client';

import { useState } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import {
  getWorkspaceSidebarMode,
  type WorkspaceRailState,
} from '@/components/AppNavigation/navigation';
import { TabSidePanel } from '@/components/TabSidePanel/TabSidePanel';
import { TabTopControls } from '@/components/TabTopControls/TabTopControls';
import { WorkspaceMap } from '@/components/WorkspaceMap/WorkspaceMap';
import { cx } from '@/lib/cx';
import styles from './AppShell.module.scss';

type AppShellProps = {
  activeTab: HeaderTabId;
};

export function AppShell({ activeTab }: AppShellProps) {
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  const sidebarMode = getWorkspaceSidebarMode(activeTab);
  const railState: WorkspaceRailState =
    sidebarMode === 'rail' && isRailExpanded ? 'expanded' : 'collapsed';
  const expandedRailClass =
    sidebarMode === 'rail' && isRailExpanded ? styles.tabPanelRailExpanded : false;

  return (
    <main
      aria-labelledby={`praios-header-tab-${activeTab}`}
      className={styles.shell}
      data-testid="workspace-shell"
    >
      <h1 className={styles.srOnly}>PraiOS workspace</h1>
      <section
        aria-labelledby={`praios-header-tab-${activeTab}`}
        className={cx(
          styles.tabPanel,
          sidebarMode === 'panel' && styles.tabPanelWide,
          expandedRailClass,
        )}
        id="praios-tab-panel"
        role="tabpanel"
      >
        <div
          className={cx(styles.leftArea, sidebarMode === 'panel' && styles.leftAreaPanel)}
          data-sidebar-mode={sidebarMode}
          data-sidebar-state={railState}
          data-tab={activeTab}
          data-testid="workspace-left-area"
        >
          <TabSidePanel
            activeTab={activeTab}
            labelledBy={`praios-header-tab-${activeTab}`}
            railExpanded={isRailExpanded}
            onRailExpandedChange={setIsRailExpanded}
          />
        </div>
        <div className={styles.workspaceColumn}>
          <TabTopControls activeTab={activeTab} />
          <div className={styles.mapArea}>
            <WorkspaceMap />
          </div>
        </div>
      </section>
    </main>
  );
}

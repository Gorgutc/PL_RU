// cspell:disable
'use client';

import { useState } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import {
  getWorkspaceSidebarMode,
  type WorkspaceRailState,
} from '@/components/AppNavigation/navigation';
import { MapBottomPanel } from '@/components/MapBottomPanel/MapBottomPanel';
import { TabBottomPanel } from '@/components/TabBottomPanel/TabBottomPanel';
import { TabSidePanel } from '@/components/TabSidePanel/TabSidePanel';
import { TabTopControls } from '@/components/TabTopControls/TabTopControls';
import { WorkspaceMap } from '@/components/WorkspaceMap/WorkspaceMap';
import type { WorkspaceMapTheme } from '@/components/WorkspaceMap/mapConfig';
import { WorkspaceTableSurface } from '@/components/WorkspaceTableSurface/WorkspaceTableSurface';
import { cx } from '@/lib/cx';
import styles from './AppShell.module.scss';

type AppShellProps = {
  activeTab: HeaderTabId;
};

export function AppShell({ activeTab }: AppShellProps) {
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  // Map basemap theme is local UI state (A6: no web storage). Lives here so the
  // left-rail toggle and the map share one source of truth across map/bar/tmi.
  const [mapTheme, setMapTheme] = useState<WorkspaceMapTheme>('light');
  const toggleMapTheme = () => setMapTheme((theme) => (theme === 'light' ? 'dark' : 'light'));
  const sidebarMode = getWorkspaceSidebarMode(activeTab);
  // The table tabs (kick/stats) show a dark table container in the center
  // instead of the map, matching the эталон (A13 was re-opened for this).
  const showsTable = activeTab === 'kick' || activeTab === 'stats';
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
        data-rail-state={railState}
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
            mapTheme={mapTheme}
            onToggleMapTheme={toggleMapTheme}
            railExpanded={isRailExpanded}
            onRailExpandedChange={setIsRailExpanded}
          />
        </div>
        <div className={styles.workspaceColumn}>
          <TabTopControls activeTab={activeTab} />
          <div className={styles.mapArea}>
            {showsTable ? <WorkspaceTableSurface /> : <WorkspaceMap theme={mapTheme} />}
          </div>
          {activeTab === 'map' ? <MapBottomPanel /> : <TabBottomPanel activeTab={activeTab} />}
        </div>
      </section>
    </main>
  );
}

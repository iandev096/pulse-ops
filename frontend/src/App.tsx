import { ChartsSectionSkeleton } from "@/components/charts/ChartsSectionSkeleton";
import { EventsTableSection } from "@/components/events/EventsTableSection";
import { EventTypeFilter } from "@/components/filters/EventTypeFilter";
import { FiltersPanel } from "@/components/filters/FiltersPanel";
import { RegionFilter } from "@/components/filters/RegionFilter";
import { ServiceFilter } from "@/components/filters/ServiceFilter";
import { TabletFiltersBar } from "@/components/filters/TabletFiltersBar";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { Layout } from "@/components/layout/Layout";
import { MainContent } from "@/components/layout/MainContent";
import { MetricsSection } from "@/components/metrics/MetricsSection";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppTitle } from "@/components/topbar/AppTitle";
import { LastUpdateIndicator } from "@/components/topbar/LastUpdateIndicator";
import { MobileNavBar } from "@/components/topbar/MobileNavBar";
import { MobileSettingsSheet } from "@/components/topbar/MobileSettingsSheet";
import { ThemeToggle } from "@/components/topbar/ThemeToggle";
import { TimeWindowSelector } from "@/components/topbar/TimeWindowSelector";
import { TopBar } from "@/components/topbar/TopBar";
import { lazy, Suspense, useState } from "react";

const ChartsSection = lazy(() =>
  import("@/components/charts/ChartsSection").then((module) => ({
    default: module.ChartsSection,
  }))
);

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <AppShell>
      <ThemeProvider>
        <DashboardPage>
          {/* Mobile navbar - shown only on <sm (mobile) */}
          <MobileNavBar onMenuClick={() => setIsSettingsOpen(true)} />

          {/* Tablet/Desktop TopBar - shown on sm and up */}
          <TopBar>
            <AppTitle />
            <TimeWindowSelector />
            <div className="flex items-center gap-4">
              <LastUpdateIndicator />
              <ThemeToggle />
            </div>
          </TopBar>

          {/* Tablet filters bar - shown on tablet only (sm to lg) */}
          <div className="hidden sm:block lg:hidden shrink-0 border-b border-border bg-card">
            <TabletFiltersBar />
          </div>

          {/* Mobile settings sheet - controlled by mobile navbar */}
          <MobileSettingsSheet
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />

          <Layout
            sidebar={
              <FiltersPanel>
                <ServiceFilter />
                <RegionFilter />
                <EventTypeFilter />
              </FiltersPanel>
            }
          >
            <MainContent>
              <MetricsSection />
              <Suspense fallback={<ChartsSectionSkeleton />}>
                <ChartsSection />
              </Suspense>
              <EventsTableSection />
            </MainContent>
          </Layout>
        </DashboardPage>
      </ThemeProvider>
    </AppShell>
  );
}

export default App;

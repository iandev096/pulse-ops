import { lazy, Suspense } from "react";
import { ChartsSectionSkeleton } from "@/components/charts/ChartsSectionSkeleton";
import { EventsTableSection } from "@/components/events/EventsTableSection";
import { EventTypeFilter } from "@/components/filters/EventTypeFilter";
import { FiltersPanel } from "@/components/filters/FiltersPanel";
import { RegionFilter } from "@/components/filters/RegionFilter";
import { ServiceFilter } from "@/components/filters/ServiceFilter";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { Layout } from "@/components/layout/Layout";
import { MainContent } from "@/components/layout/MainContent";
import { MetricsSection } from "@/components/metrics/MetricsSection";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppTitle } from "@/components/topbar/AppTitle";
import { LastUpdateIndicator } from "@/components/topbar/LastUpdateIndicator";
import { ThemeToggle } from "@/components/topbar/ThemeToggle";
import { TimeWindowSelector } from "@/components/topbar/TimeWindowSelector";
import { TopBar } from "@/components/topbar/TopBar";

const ChartsSection = lazy(() =>
  import("@/components/charts/ChartsSection").then((module) => ({
    default: module.ChartsSection,
  }))
);

function App() {
  return (
    <AppShell>
      <ThemeProvider>
        <DashboardPage>
          <TopBar>
            <AppTitle />
            <TimeWindowSelector />
            <div className="flex items-center gap-4">
              <LastUpdateIndicator />
              <ThemeToggle />
            </div>
          </TopBar>

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

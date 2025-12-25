import { EventsTableAdapter } from "@/components/events/EventsTableAdapter";
import { EventsTableHeader } from "@/components/events/EventsTableHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { getPlaceholderEvents } from "@/lib/mockData";
import { useEffect, useRef } from "react";

export function EventsTableSection() {
  const events = getPlaceholderEvents(50);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingRef = useRef(false);

  // Find scroll containers after render
  useEffect(() => {
    if (headerContainerRef.current && bodyContainerRef.current) {
      // Find the scroll container divs created by Table component
      const headerScroll =
        headerContainerRef.current.querySelector<HTMLDivElement>(
          '[data-slot="table-container"]'
        );
      const bodyScroll = bodyContainerRef.current.querySelector<HTMLDivElement>(
        '[data-slot="table-container"]'
      );

      if (headerScroll && bodyScroll) {
        headerScrollRef.current = headerScroll;
        bodyScrollRef.current = bodyScroll;

        const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
          if (isSyncingRef.current) return;

          isSyncingRef.current = true;
          target.scrollLeft = source.scrollLeft;

          // Use requestAnimationFrame to reset flag after scroll completes
          requestAnimationFrame(() => {
            isSyncingRef.current = false;
          });
        };

        const handleHeaderScroll = () => {
          if (headerScrollRef.current && bodyScrollRef.current) {
            syncScroll(headerScrollRef.current, bodyScrollRef.current);
          }
        };

        const handleBodyScroll = () => {
          if (headerScrollRef.current && bodyScrollRef.current) {
            syncScroll(bodyScrollRef.current, headerScrollRef.current);
          }
        };

        headerScroll.addEventListener("scroll", handleHeaderScroll);
        bodyScroll.addEventListener("scroll", handleBodyScroll);

        return () => {
          headerScroll.removeEventListener("scroll", handleHeaderScroll);
          bodyScroll.removeEventListener("scroll", handleBodyScroll);
        };
      }
    }
  }, []);

  return (
    <section className="flex-1">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={headerContainerRef} className="bg-card border-b">
            <Table
              className="table-fixed"
              containerClassName="hidden-scrollbar"
            >
              <EventsTableHeader />
            </Table>
          </div>
          <div
            ref={bodyContainerRef}
            className="max-h-96 overflow-auto custom-scrollbar"
          >
            <EventsTableAdapter events={events} mode="naive" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

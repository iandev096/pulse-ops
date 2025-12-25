import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function EventsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-24">Time</TableHead>
        <TableHead className="w-40">Service</TableHead>
        <TableHead className="w-32">Region</TableHead>
        <TableHead className="w-32">Event Type</TableHead>
        <TableHead className="w-24 text-right">Latency</TableHead>
        <TableHead className="w-28">Status</TableHead>
      </TableRow>
    </TableHeader>
  );
}

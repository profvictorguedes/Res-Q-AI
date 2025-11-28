import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { CalendarIcon, MapPin, FileText, Pencil, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { useIncidentList } from "@/generated/hooks/useIncident";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch incidents
  const incidentQuery = useIncidentList({
    orderBy: ["dateAndTime desc", "incidentName asc"],
  });

  // Derived data: filter by query (client-side due to limited OData filter support)
  const filteredIncidents = useMemo(() => {
    const list = incidentQuery.data ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((inc) => {
      const nameMatch = inc.incidentName?.toLowerCase().includes(q);
      const locationMatch = inc.location?.toLowerCase().includes(q);
      return !!(nameMatch || locationMatch);
    });
  }, [incidentQuery.data, query]);

  // Pagination derived data
  const totalPages = useMemo(() => {
    const count = filteredIncidents.length;
    return count > 0 ? Math.ceil(count / itemsPerPage) : 1;
  }, [filteredIncidents.length]);

  useEffect(() => {
    // Reset to first page when query or data changes
    setCurrentPage(1);
  }, [query, incidentQuery.data]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredIncidents.slice(startIndex, endIndex);

  return (
    <div className="w-full">
      <section className="w-full">
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid w-full md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="space-y-4">
                <Badge variant="secondary" className="inline-flex items-center">
                  Res-Q AI
                </Badge>
                <h1 className="font-bold text-foreground text-[2.25rem] leading-tight">
                  Active Incidents
                </h1>
                <p className="text-muted-foreground text-base">
                  Rapidly assess and act. Review incident details and jump straight into planning.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button asChild>
                    <Link to="/incident/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Incident
                    </Link>
                  </Button>
                  <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors" asChild>
                    <Link to="/">
                      Home
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-muted">
              <img
                src="https://cdn.hubblecontent.osi.office.net/m365content/publish/6ec03729-d351-47b0-8ce2-7f94701e7aa1/498513373.jpg"
                data-keyword="emergency response"
                alt="First responders coordinating at an incident scene"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://res-dev.cdn.officeppe.net/m365content/publish/2726fcef-98f3-490e-a297-f75d644ff043/1049208066-10.jpg";
                }}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full mt-10">
        <Card className="bg-card text-card-foreground border border-border">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[240px]">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by incident name or location"
                  className="border-input focus:ring-2 focus:ring-ring"
                  aria-label="Search incidents"
                />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{incidentQuery.data?.length ?? 0} total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="w-full mt-8">
        {incidentQuery.isLoading ? (
          <div className="w-full py-20">
            <div className="flex gap-3 items-center">
              <Spinner />
              <span className="text-muted-foreground">Loading incidents...</span>
            </div>
          </div>
        ) : incidentQuery.isError ? (
          <Alert variant="destructive" className="border border-destructive">
            <AlertDescription className="text-destructive-foreground">
              Failed to load incidents. Please try again.
            </AlertDescription>
          </Alert>
        ) : filteredIncidents.length === 0 ? (
          <div className="w-full py-20">
            <div className="space-y-6">
              <p className="text-muted-foreground">No incidents found. Create a new one to get started.</p>
              <Button asChild>
                <Link to="/incident/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Incident
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {currentData.map((incident) => {
              const dateText =
                incident.dateAndTime ? format(new Date(incident.dateAndTime), "PPpp") : "Date not set";
              const hasDiagram = !!incident.sceneDiagramUrl && incident.sceneDiagramUrl.trim() !== "";
              return (
                <Item key={incident.id} className="rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors">
                  <ItemMedia>
                    <Badge variant={hasDiagram ? "default" : "secondary"} className={cn(hasDiagram ? "" : "text-muted-foreground")}>
                      {hasDiagram ? "Diagram Ready" : "No Diagram"}
                    </Badge>
                  </ItemMedia>
                  <ItemContent>
                    <ItemHeader>
                      <ItemTitle className="text-foreground">{incident.incidentName}</ItemTitle>
                      <ItemDescription className="text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {dateText}
                        </span>
                        {incident.location ? (
                          <span className="inline-flex items-center gap-2 ml-4">
                            <MapPin className="h-4 w-4" />
                            {incident.location}
                          </span>
                        ) : null}
                      </ItemDescription>
                    </ItemHeader>
                  </ItemContent>
                  <ItemActions className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex items-center" asChild>
                      <Link to={`/incident/${incident.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center hover:bg-accent hover:text-accent-foreground transition-colors" asChild>
                      <Link to={`/incident/${incident.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </ItemActions>
                </Item>
              );
            })}

            {filteredIncidents.length > itemsPerPage ? (
              <div className="pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage((prev) => Math.max(1, prev - 1))}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={`page-${page}`}>
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages && setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                        }
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="mt-3 text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredIncidents.length)} of {filteredIncidents.length}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
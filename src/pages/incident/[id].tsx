import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { format } from "date-fns";
import { AlertTriangle, Route, Map, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIncident } from "@/generated/hooks/useIncident";
import { useDispatchNoteList } from "@/generated/hooks/useDispatchNote";
import { useHazardList } from "@/generated/hooks/useHazard";
import { usePathList } from "@/generated/hooks/usePath";
import { cn } from "@/lib/utils";

export default function IncidentDetailsPage() {
  const params = useParams();
  const id = params?.id ?? "";

  const incidentQuery = useIncident(id);
  const hazardsQuery = useHazardList(id ? { filter: `incidentName/id eq '${id}'` } : undefined);
  const pathsQuery = usePathList(id ? { filter: `incidentName/id eq '${id}'` } : undefined);
  const notesQuery = useDispatchNoteList(id ? { filter: `incidentName/id eq '${id}'` } : undefined);

  const isLoading =
    incidentQuery.isLoading ||
    hazardsQuery.isLoading ||
    pathsQuery.isLoading ||
    notesQuery.isLoading;

  const isFetching =
    incidentQuery.isFetching ||
    hazardsQuery.isFetching ||
    pathsQuery.isFetching ||
    notesQuery.isFetching;

  const isError =
    incidentQuery.isError ||
    hazardsQuery.isError ||
    pathsQuery.isError ||
    notesQuery.isError;

  const incident = incidentQuery.data;
  const hazards = hazardsQuery.data ?? [];
  const paths = pathsQuery.data ?? [];
  const notes = notesQuery.data ?? [];

  return (
    <div className="w-full">
      {/* Loading */}
      {isLoading && (
        <div className="w-full p-8">
          <div className="flex gap-3 items-center text-muted-foreground">
            <Spinner />
            <span>Loading incident details...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && isError && (
        <div className="w-full p-8">
          <Alert className="bg-destructive text-destructive-foreground">
            <AlertDescription>
              We couldn't load this incident. Please try again or return to Home.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && incident && (
        <div className="w-full p-8 space-y-10">
          {/* Top actions */}
          <div className="flex w-full justify-between">
            <div className="space-y-2">
              <div className="text-muted-foreground">Incident</div>
              <div className="text-foreground text-2xl font-semibold">{incident.incidentName}</div>
              <div className="text-muted-foreground">
                {incident.dateAndTime ? format(new Date(incident.dateAndTime), "PPpp") : "No date provided"}
                {incident.location ? ` • ${incident.location}` : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground transition-colors">Home</Button>
              </Link>
              <Link to={`/incident/${incident.id}/edit`}>
                <Button variant="default" className="transition-colors">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>

          {/* Scene diagram + hazards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="bg-card text-card-foreground border border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-muted-foreground" />
                  AI-Generated Scene Diagram
                </CardTitle>
                <CardDescription>
                  Derived from dispatch notes to accelerate situational planning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={cn("w-full rounded-lg border border-border overflow-hidden bg-muted")}>
                  {incident.sceneDiagramUrl ? (
                    <img
                      src={incident.sceneDiagramUrl}
                      alt="Incident scene diagram"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://res-dev.cdn.officeppe.net/m365content/publish/2726fcef-98f3-490e-a297-f75d644ff043/1049208066-10.jpg"; }}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-[380px] object-cover"
                    />
                  ) : (
                    <img
                      src="https://cdn.hubblecontent.osi.office.net/m365content/publish/59d49489-0e57-4653-8ee0-35706b9786b1/1263855379.jpg"
                      data-keyword="scene diagram"
                      alt="AI scene diagram placeholder"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://res-dev.cdn.officeppe.net/m365content/publish/2726fcef-98f3-490e-a297-f75d644ff043/1049208066-10.jpg"; }}
                      className="w-full h-[380px] object-cover"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground">Dispatch Notes Used</div>
                  {notes.length === 0 ? (
                    <div className="text-muted-foreground">No dispatch notes are associated with this incident.</div>
                  ) : (
                    <div className="space-y-2">
                      {notes.map((note) => (
                        <Item key={note.noteTitle} className="rounded-lg border border-border p-3 hover:bg-accent transition-colors">
                          <ItemMedia>
                            <Badge variant="secondary" className="capitalize">{note.noteTitle}</Badge>
                          </ItemMedia>
                          <ItemContent>
                            <ItemHeader>
                              <ItemTitle className="line-clamp-1">{note.content ? note.content.slice(0, 120) : "No content"}</ItemTitle>
                              <ItemDescription>
                                {note.createdDate ? format(new Date(note.createdDate), "PPpp") : "No timestamp"}
                              </ItemDescription>
                            </ItemHeader>
                          </ItemContent>
                        </Item>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-muted-foreground">
                  {isFetching ? "Refreshing scene details..." : "Scene snapshot ready"}
                </div>
                <div className="flex gap-2">
                  <Link to={`/incident/${incident.id}/edit`}>
                    <Button variant="outline">Adjust details</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-card text-card-foreground border border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Highlighted Hazards
                </CardTitle>
                <CardDescription>
                  Key risks identified around the scene to inform PPE and approach.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hazards.length === 0 ? (
                  <div className="rounded-lg border border-border p-6 text-muted-foreground">
                    No hazards recorded for this incident.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hazards.map((hz) => (
                      <Item key={hz.hazardName} className="rounded-lg border border-border p-3 hover:bg-accent transition-colors">
                        <ItemMedia>
                          <Badge variant="destructive">Hazard</Badge>
                        </ItemMedia>
                        <ItemContent>
                          <ItemHeader>
                            <ItemTitle className="font-semibold">{hz.hazardName}</ItemTitle>
                            <ItemDescription className="line-clamp-2">{hz.description ?? "No description provided"}</ItemDescription>
                          </ItemHeader>
                        </ItemContent>
                        <ItemActions>
                          <Link to={`/incident/${incident.id}/edit`}>
                            <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground transition-colors">Edit</Button>
                          </Link>
                        </ItemActions>
                      </Item>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggested paths */}
          <Card className="bg-card text-card-foreground border border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-muted-foreground" />
                Suggested Entry and Exit Paths
              </CardTitle>
              <CardDescription>
                Choose safe routing options recommended for your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paths.length === 0 ? (
                <div className="rounded-lg border border-border p-6 text-muted-foreground">
                  No paths suggested yet for this incident.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paths.map((p) => (
                      <Item key={p.pathName} className="rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                        <ItemMedia>
                          <Badge variant="default">
                            {p.type === "PathTypeOptions_0" ? "Entry" : p.type === "PathTypeOptions_1" ? "Exit" : "Path"}
                          </Badge>
                        </ItemMedia>
                        <ItemContent>
                          <ItemHeader>
                            <ItemTitle className="font-semibold">{p.pathName}</ItemTitle>
                            <ItemDescription className="text-muted-foreground">
                              Suggested route for {p.type === "PathTypeOptions_0" ? "entry" : p.type === "PathTypeOptions_1" ? "exit" : "movement"}
                            </ItemDescription>
                          </ItemHeader>
                        </ItemContent>
                        <ItemActions>
                          <Link to={`/incident/${incident.id}/edit`}>
                            <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground transition-colors">Edit</Button>
                          </Link>
                        </ItemActions>
                      </Item>
                    ))}
                  </div>

                  <Separator className="bg-border" />

                  <div className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Path Name</TableHead>
                          <TableHead>Incident</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paths.map((p) => (
                          <TableRow key={`${p.pathName}-row`}>
                            <TableCell>
                              <Badge variant="secondary">
                                {p.type === "PathTypeOptions_0" ? "Entry" : p.type === "PathTypeOptions_1" ? "Exit" : "Path"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{p.pathName}</TableCell>
                            <TableCell className="text-muted-foreground">{incident.incidentName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-muted-foreground">
                {isFetching ? "Updating suggestions..." : "Routes are up to date"}
              </div>
              <div className="flex gap-2">
                <Link to={`/incident/${incident.id}/edit`}>
                  <Button variant="outline">Modify paths</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Footer actions */}
          <div className="flex w-full justify-end gap-2">
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
            <Link to="/incident/create">
              <Button variant="secondary">Create Incident</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
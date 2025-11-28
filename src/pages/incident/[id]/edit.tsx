import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useIncident, useUpdateIncident } from "@/generated/hooks/useIncident";
import { toast } from "sonner";

// Fix: Use Record<string, unknown> for changedFields

type IncidentFormValues = {
  incidentName: string;
  dateAndTime?: string;
  location?: string;
  sceneDiagramUrl?: string;
};

const schema = z.object({
  incidentName: z.string().min(1, { error: "Incident name is required" }),
  dateAndTime: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
      { error: "Invalid date and time format (YYYY-MM-DDTHH:mm)" }
    ),
  location: z.string().optional(),
  sceneDiagramUrl: z.string().url({ error: "Must be a valid URL" }).optional(),
});

export default function IncidentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: incident, isLoading, isFetching, isError, error } = useIncident(id ?? "");
  const updateMutation = useUpdateIncident();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
    watch,
    setValue,
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      incidentName: "",
      dateAndTime: undefined,
      location: "",
      sceneDiagramUrl: "",
    },
  });

  useEffect(() => {
    if (incident) {
      const initial: IncidentFormValues = {
        incidentName: (incident && 'incidentName' in incident ? incident.incidentName : "") ?? "",
        dateAndTime: (incident && 'dateAndTime' in incident && incident.dateAndTime)
          ? format(new Date(incident.dateAndTime), "yyyy-MM-dd'T'HH:mm")
          : undefined,
        location: (incident && 'location' in incident ? incident.location : "") ?? "",
        sceneDiagramUrl: (incident && 'sceneDiagramUrl' in incident ? incident.sceneDiagramUrl : "") ?? "",
      };
      reset(initial);
    }
  }, [incident, reset]);

  const currentValues = watch();

  const onSubmit = (values: IncidentFormValues) => {
    if (!id) return;
    // Use Record<string, unknown> instead of Partial<Omit<typeof incident, "id">>
    const changedFields: Record<string, unknown> = {};

    if (values.incidentName !== ((incident && 'incidentName' in incident ? incident.incidentName : "") ?? "")) {
      changedFields.incidentName = values.incidentName;
    }
    const originalDate = (incident && 'dateAndTime' in incident && incident.dateAndTime)
      ? format(new Date(incident.dateAndTime), "yyyy-MM-dd'T'HH:mm")
      : undefined;
    if (values.dateAndTime !== originalDate) {
      changedFields.dateAndTime = values.dateAndTime
        ? new Date(values.dateAndTime).toISOString()
        : undefined;
    }
    if ((values.location ?? "") !== ((incident && 'location' in incident ? incident.location : "") ?? "")) {
      changedFields.location = values.location;
    }
    if ((values.sceneDiagramUrl ?? "") !== ((incident && 'sceneDiagramUrl' in incident ? incident.sceneDiagramUrl : "") ?? "")) {
      changedFields.sceneDiagramUrl = values.sceneDiagramUrl;
    }

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    updateMutation.mutate(
      { id, changedFields },
      {
        onSuccess: (updated) => {
          toast.success("Incident updated");
          navigate(`/incident/${id}`);
        },
        onError: (err) => {
          toast.error("Failed to update incident");
        },
      }
    );
  };

  const isBusy = isLoading || isFetching;

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-8">
          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
            <div className="absolute inset-0">
              <img
                src="https://cdn.hubblecontent.osi.office.net/m365content/publish/b51ac394-a98b-487b-881a-48497b592ab3/736491055_super.jpg"
                data-keyword="team meeting"
                alt="dispatch team collaborating"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://res-dev.cdn.officeppe.net/m365content/publish/2726fcef-98f3-490e-a297-f75d644ff043/1049208066-10.jpg";
                }}
                className="h-56 w-full object-cover"
              />
            </div>
            <div className="relative w-full p-8">
              <Item className="w-full">
                <ItemMedia>
                  <Pencil className="h-6 w-6 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemHeader>
                    <ItemTitle className="text-foreground">Edit Incident</ItemTitle>
                    <ItemDescription className="text-muted-foreground">
                      Update details to keep responders aligned in real time.
                    </ItemDescription>
                  </ItemHeader>
                </ItemContent>
                <ItemActions>
                  <Badge variant="secondary">Real-time</Badge>
                </ItemActions>
              </Item>
            </div>
          </div>

          {isBusy && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Loading incident</CardTitle>
                <CardDescription className="text-muted-foreground">Fetching current details...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-24 w-full items-center justify-start gap-3">
                  <Spinner />
                  <span className="text-muted-foreground">Please wait</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isError && (
            <Alert className="border border-border bg-card">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {(error as unknown as { message?: string })?.message ?? "Failed to load incident"}
              </AlertDescription>
            </Alert>
          )}

          {!isBusy && !isError && incident && (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">{incident.incidentName}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Last updated: {incident.dateAndTime ? format(new Date(incident.dateAndTime), "PPpp") : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="incidentName">Incident Name</Label>
                      <Input
                        id="incidentName"
                        {...register("incidentName")}
                        placeholder="e.g., Warehouse Fire - Sector 7"
                        className="border-input focus:ring-ring"
                      />
                      {errors.incidentName?.message && (
                        <p className="text-destructive text-sm">{errors.incidentName.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateAndTime">Date and Time</Label>
                      <Input
                        id="dateAndTime"
                        type="datetime-local"
                        {...register("dateAndTime")}
                        className="border-input focus:ring-ring"
                      />
                      {errors.dateAndTime?.message && (
                        <p className="text-destructive text-sm">{errors.dateAndTime.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register("location")}
                        placeholder="Enter address or coordinates"
                        className="border-input focus:ring-ring"
                      />
                      {errors.location?.message && (
                        <p className="text-destructive text-sm">{errors.location.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sceneDiagramUrl">Scene Diagram URL</Label>
                      <Input
                        id="sceneDiagramUrl"
                        {...register("sceneDiagramUrl")}
                        placeholder="https://..."
                        className="border-input focus:ring-ring"
                      />
                      {errors.sceneDiagramUrl?.message && (
                        <p className="text-destructive text-sm">{errors.sceneDiagramUrl.message as string}</p>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="w-full">
                    <Item className="w-full rounded-lg border border-border p-4">
                      <ItemMedia>
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemHeader>
                          <ItemTitle className="text-foreground">Review changes</ItemTitle>
                          <ItemDescription className="text-muted-foreground">
                            Ensure accuracy before saving. Changes propagate to responders immediately.
                          </ItemDescription>
                        </ItemHeader>
                      </ItemContent>
                      <ItemActions className="flex gap-2">
                        <Link to={`/incident/${incident.id}`}>
                          <Button variant="ghost" type="button" className="hover:bg-accent hover:text-accent-foreground">
                            Cancel
                          </Button>
                        </Link>
                        <Button
                          type="submit"
                          className={cn("bg-primary text-primary-foreground hover:bg-primary/90", (isSubmitting || updateMutation.isPending) && "opacity-50")}
                          disabled={isSubmitting || updateMutation.isPending}
                        >
                          {(isSubmitting || updateMutation.isPending) ? <Spinner className="mr-2" /> : null}
                          Save Changes
                        </Button>
                      </ItemActions>
                      <ItemFooter className="text-xs text-muted-foreground">
                        {isDirty ? "Unsaved edits" : "No changes yet"}
                      </ItemFooter>
                    </Item>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex w-full justify-between">
                <Link to="/">
                  <Button variant="link">Home</Button>
                </Link>
                <Link to="/incident/create">
                  <Button variant="outline">Create Incident</Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

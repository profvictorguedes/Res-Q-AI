import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentService } from "../services/incident-service";
import type { Incident } from "../models/incident-model";
import type { IGetAllOptions } from "../models/common-models";

export function useIncidentList(options?: IGetAllOptions) {
    return useQuery({
        queryKey: ["incident-list", options],
        queryFn: async () => {
            const result = await IncidentService.getAll(options);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
    });
}

export function useIncident(id: string) {
    return useQuery({
        queryKey: ["incident", id],
        queryFn: async () => {
            const result = await IncidentService.get(id);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useCreateIncident() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Incident, "id">) => {
            const result = await IncidentService.create(data);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["incident-list"] });
        },
    });
}

export function useUpdateIncident() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            changedFields,
        }: {
            id: string;
            changedFields: Partial<Omit<Incident, "id">>;
        }) => {
            const result = await IncidentService.update(id, changedFields);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: (_data, variables) => {
            client.invalidateQueries({ queryKey: ["incident-list"] });
            client.invalidateQueries({ queryKey: ["incident", variables.id] });
        },
    });
}

export function useDeleteIncident() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await IncidentService.delete(id);
        },
        onSuccess: (_data, id) => {
            client.invalidateQueries({ queryKey: ["incident-list"] });
            client.invalidateQueries({ queryKey: ["incident", id] });
        },
    });
}

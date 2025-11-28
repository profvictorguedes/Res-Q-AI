import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HazardService } from "../services/hazard-service";
import type { Hazard } from "../models/hazard-model";
import type { IGetAllOptions } from "../models/common-models";

export function useHazardList(options?: IGetAllOptions) {
    return useQuery({
        queryKey: ["hazard-list", options],
        queryFn: async () => {
            const result = await HazardService.getAll(options);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
    });
}

export function useHazard(id: string) {
    return useQuery({
        queryKey: ["hazard", id],
        queryFn: async () => {
            const result = await HazardService.get(id);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useCreateHazard() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Hazard, "id">) => {
            const result = await HazardService.create(data);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["hazard-list"] });
        },
    });
}

export function useUpdateHazard() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            changedFields,
        }: {
            id: string;
            changedFields: Partial<Omit<Hazard, "id">>;
        }) => {
            const result = await HazardService.update(id, changedFields);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: (_data, variables) => {
            client.invalidateQueries({ queryKey: ["hazard-list"] });
            client.invalidateQueries({ queryKey: ["hazard", variables.id] });
        },
    });
}

export function useDeleteHazard() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await HazardService.delete(id);
        },
        onSuccess: (_data, id) => {
            client.invalidateQueries({ queryKey: ["hazard-list"] });
            client.invalidateQueries({ queryKey: ["hazard", id] });
        },
    });
}

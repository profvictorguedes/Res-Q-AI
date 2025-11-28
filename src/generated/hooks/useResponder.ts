import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ResponderService } from "../services/responder-service";
import type { Responder } from "../models/responder-model";
import type { IGetAllOptions } from "../models/common-models";

export function useResponderList(options?: IGetAllOptions) {
    return useQuery({
        queryKey: ["responder-list", options],
        queryFn: async () => {
            const result = await ResponderService.getAll(options);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
    });
}

export function useResponder(id: string) {
    return useQuery({
        queryKey: ["responder", id],
        queryFn: async () => {
            const result = await ResponderService.get(id);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useCreateResponder() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Responder, "id">) => {
            const result = await ResponderService.create(data);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["responder-list"] });
        },
    });
}

export function useUpdateResponder() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            changedFields,
        }: {
            id: string;
            changedFields: Partial<Omit<Responder, "id">>;
        }) => {
            const result = await ResponderService.update(id, changedFields);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: (_data, variables) => {
            client.invalidateQueries({ queryKey: ["responder-list"] });
            client.invalidateQueries({ queryKey: ["responder", variables.id] });
        },
    });
}

export function useDeleteResponder() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await ResponderService.delete(id);
        },
        onSuccess: (_data, id) => {
            client.invalidateQueries({ queryKey: ["responder-list"] });
            client.invalidateQueries({ queryKey: ["responder", id] });
        },
    });
}

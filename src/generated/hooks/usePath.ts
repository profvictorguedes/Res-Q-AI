import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PathService } from "../services/path-service";
import type { Path } from "../models/path-model";
import type { IGetAllOptions } from "../models/common-models";

export function usePathList(options?: IGetAllOptions) {
    return useQuery({
        queryKey: ["path-list", options],
        queryFn: async () => {
            const result = await PathService.getAll(options);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
    });
}

export function usePath(id: string) {
    return useQuery({
        queryKey: ["path", id],
        queryFn: async () => {
            const result = await PathService.get(id);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useCreatePath() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Path, "id">) => {
            const result = await PathService.create(data);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["path-list"] });
        },
    });
}

export function useUpdatePath() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            changedFields,
        }: {
            id: string;
            changedFields: Partial<Omit<Path, "id">>;
        }) => {
            const result = await PathService.update(id, changedFields);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: (_data, variables) => {
            client.invalidateQueries({ queryKey: ["path-list"] });
            client.invalidateQueries({ queryKey: ["path", variables.id] });
        },
    });
}

export function useDeletePath() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await PathService.delete(id);
        },
        onSuccess: (_data, id) => {
            client.invalidateQueries({ queryKey: ["path-list"] });
            client.invalidateQueries({ queryKey: ["path", id] });
        },
    });
}

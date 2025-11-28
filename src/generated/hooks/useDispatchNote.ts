import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DispatchNoteService } from "../services/dispatch-note-service";
import type { DispatchNote } from "../models/dispatch-note-model";
import type { IGetAllOptions } from "../models/common-models";

export function useDispatchNoteList(options?: IGetAllOptions) {
    return useQuery({
        queryKey: ["dispatchnote-list", options],
        queryFn: async () => {
            const result = await DispatchNoteService.getAll(options);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
    });
}

export function useDispatchNote(id: string) {
    return useQuery({
        queryKey: ["dispatchnote", id],
        queryFn: async () => {
            const result = await DispatchNoteService.get(id);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        enabled: !!id,
    });
}

export function useCreateDispatchNote() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<DispatchNote, "id">) => {
            const result = await DispatchNoteService.create(data);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["dispatchnote-list"] });
        },
    });
}

export function useUpdateDispatchNote() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            changedFields,
        }: {
            id: string;
            changedFields: Partial<Omit<DispatchNote, "id">>;
        }) => {
            const result = await DispatchNoteService.update(id, changedFields);
            if (!result.success) {
                throw result.error;
            }
            return result.data;
        },
        onSuccess: (_data, variables) => {
            client.invalidateQueries({ queryKey: ["dispatchnote-list"] });
            client.invalidateQueries({ queryKey: ["dispatchnote", variables.id] });
        },
    });
}

export function useDeleteDispatchNote() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await DispatchNoteService.delete(id);
        },
        onSuccess: (_data, id) => {
            client.invalidateQueries({ queryKey: ["dispatchnote-list"] });
            client.invalidateQueries({ queryKey: ["dispatchnote", id] });
        },
    });
}

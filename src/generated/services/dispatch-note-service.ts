import type { DispatchNote } from '../models/dispatch-note-model';
import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { getClient } from '../../../app-gen-sdk/data';

export class DispatchNoteService {
  private static readonly dataSourceName = 'DispatchNote';

  private static readonly client = getClient();

  public static async create(record: Omit<DispatchNote, 'id'>): Promise<IOperationResult<DispatchNote>> {
    const result = await DispatchNoteService.client.createRecordAsync<Omit<DispatchNote, 'id'>, DispatchNote>(
      DispatchNoteService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<DispatchNote, 'id'>>): Promise<IOperationResult<DispatchNote>> {
    const result = await DispatchNoteService.client.updateRecordAsync<Partial<Omit<DispatchNote, 'id'>>, DispatchNote>(
      DispatchNoteService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await DispatchNoteService.client.deleteRecordAsync(
      DispatchNoteService.dataSourceName,
      id.toString());
  }

  public static async get(id: string): Promise<IOperationResult<DispatchNote>> {
    const result = await DispatchNoteService.client.retrieveRecordAsync<DispatchNote>(
      DispatchNoteService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<DispatchNote[]>> {
    const result = await DispatchNoteService.client.retrieveMultipleRecordsAsync<DispatchNote>(
      DispatchNoteService.dataSourceName,
      options
    );
    return result;
  }
}

import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import type { Responder } from '../models/responder-model';
import { getClient } from '../../../app-gen-sdk/data';

export class ResponderService {
  private static readonly dataSourceName = 'Responder';

  private static readonly client = getClient();

  public static async create(record: Omit<Responder, 'id'>): Promise<IOperationResult<Responder>> {
    const result = await ResponderService.client.createRecordAsync<Omit<Responder, 'id'>, Responder>(
      ResponderService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<Responder, 'id'>>): Promise<IOperationResult<Responder>> {
    const result = await ResponderService.client.updateRecordAsync<Partial<Omit<Responder, 'id'>>, Responder>(
      ResponderService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await ResponderService.client.deleteRecordAsync(
      ResponderService.dataSourceName,
      id.toString());
  }

  public static async get(id: string): Promise<IOperationResult<Responder>> {
    const result = await ResponderService.client.retrieveRecordAsync<Responder>(
      ResponderService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Responder[]>> {
    const result = await ResponderService.client.retrieveMultipleRecordsAsync<Responder>(
      ResponderService.dataSourceName,
      options
    );
    return result;
  }
}

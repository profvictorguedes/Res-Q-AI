import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import type { Path } from '../models/path-model';
import { getClient } from '../../../app-gen-sdk/data';

export class PathService {
  private static readonly dataSourceName = 'Path';

  private static readonly client = getClient();

  public static async create(record: Omit<Path, 'id'>): Promise<IOperationResult<Path>> {
    const result = await PathService.client.createRecordAsync<Omit<Path, 'id'>, Path>(
      PathService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<Path, 'id'>>): Promise<IOperationResult<Path>> {
    const result = await PathService.client.updateRecordAsync<Partial<Omit<Path, 'id'>>, Path>(
      PathService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await PathService.client.deleteRecordAsync(
      PathService.dataSourceName,
      id.toString());
  }

  public static async get(id: string): Promise<IOperationResult<Path>> {
    const result = await PathService.client.retrieveRecordAsync<Path>(
      PathService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Path[]>> {
    const result = await PathService.client.retrieveMultipleRecordsAsync<Path>(
      PathService.dataSourceName,
      options
    );
    return result;
  }
}

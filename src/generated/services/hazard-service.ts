import type { Hazard } from '../models/hazard-model';
import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { getClient } from '../../../app-gen-sdk/data';

export class HazardService {
  private static readonly dataSourceName = 'Hazard';

  private static readonly client = getClient();

  public static async create(record: Omit<Hazard, 'id'>): Promise<IOperationResult<Hazard>> {
    const result = await HazardService.client.createRecordAsync<Omit<Hazard, 'id'>, Hazard>(
      HazardService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<Hazard, 'id'>>): Promise<IOperationResult<Hazard>> {
    const result = await HazardService.client.updateRecordAsync<Partial<Omit<Hazard, 'id'>>, Hazard>(
      HazardService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await HazardService.client.deleteRecordAsync(
      HazardService.dataSourceName,
      id.toString());
  }

  public static async get(id: string): Promise<IOperationResult<Hazard>> {
    const result = await HazardService.client.retrieveRecordAsync<Hazard>(
      HazardService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Hazard[]>> {
    const result = await HazardService.client.retrieveMultipleRecordsAsync<Hazard>(
      HazardService.dataSourceName,
      options
    );
    return result;
  }
}

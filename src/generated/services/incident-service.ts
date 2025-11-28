import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import type { Incident } from '../models/incident-model';
import { getClient } from '../../../app-gen-sdk/data';

export class IncidentService {
  private static readonly dataSourceName = 'Incident';

  private static readonly client = getClient();

  public static async create(record: Omit<Incident, 'id'>): Promise<IOperationResult<Incident>> {
    const result = await IncidentService.client.createRecordAsync<Omit<Incident, 'id'>, Incident>(
      IncidentService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<Incident, 'id'>>): Promise<IOperationResult<Incident>> {
    const result = await IncidentService.client.updateRecordAsync<Partial<Omit<Incident, 'id'>>, Incident>(
      IncidentService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await IncidentService.client.deleteRecordAsync(
      IncidentService.dataSourceName,
      id.toString());
  }

  public static async get(id: string): Promise<IOperationResult<Incident>> {
    const result = await IncidentService.client.retrieveRecordAsync<Incident>(
      IncidentService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Incident[]>> {
    const result = await IncidentService.client.retrieveMultipleRecordsAsync<Incident>(
      IncidentService.dataSourceName,
      options
    );
    return result;
  }
}

import { v4 as uuid } from 'uuid';

import { getRpcClient } from '../../rpc-client';
import { createErrorLog } from '../../utils/exception-utils';
import type { ColumnToTypescriptMapping, TableToTypescriptMapping } from './table-mapping-types';

const sessionId = uuid();

export function logError(name: string, error: unknown, data?: object): void {
    getRpcClient().call('logError', [createErrorLog(name, { sessionId, ...data }, error)]).catch((rpcError) => {
        console.error(`Failed to log error for ${name}`, rpcError);
    });
}

export function logWarning(eventName: string, data: object): void {
    getRpcClient().call('logWarning', [{ eventName, data: { sessionId, ...data } }]).catch((rpcError) => {
        console.error(`Failed to log warning for ${eventName}`, rpcError);
    });
}

export function logInfo(eventName: string, data: object): void {
    getRpcClient().call('logInfo', [{ eventName, data: { sessionId, ...data } }]).catch((rpcError) => {
        console.error(`Failed to log info for ${eventName}`, rpcError);
    });
}

export interface TableAndColumnEventData {
    tableApiMetadataTableId: string;
    tableDataSourceType: string;
    columnType: string;
    columnApiPropertyName: string;
}

export function getTableAndColumnEventData(tableMetadata: TableToTypescriptMapping, column: ColumnToTypescriptMapping): TableAndColumnEventData {
    return {
        tableApiMetadataTableId: tableMetadata.apiMetadataTableId,
        tableDataSourceType: tableMetadata.dataSourceType,
        columnApiPropertyName: column.apiPropertyName,
        columnType: column.type
    };
}

export type ScenarioContext = Record<string, unknown>;

export async function withScenarioLogging<T>(
    scenarioName: string,
    baseContext: ScenarioContext,
    operation: () => Promise<T>,
): Promise<T> {
    const startTime = performance.now();
    const scenarioId = uuid();

    const contextWithTimestamp = {
        scenarioId,
        ...baseContext,
    };

    logInfo(`${scenarioName}/Started`, contextWithTimestamp);

    try {
        const result = await operation();
        logInfo(`${scenarioName}/Completed`, {
            scenarioId,
            ...baseContext,
            duration: performance.now() - startTime
        });
        return result;
    } catch (error) {
        logError(`${scenarioName}/Failed`, error,
        {
            scenarioId,
            ...baseContext,
            duration: performance.now() - startTime
        });
        throw error;
    }
}

export interface ParsedOrderByEntry {
    propertyName: string;
    direction: string;
}

export function parseOrderByEntry(orderByEntry: string): ParsedOrderByEntry {
    const parts = orderByEntry.trim().split(/\s+/);
    const propertyName = parts[0];
    const direction = parts[1] || '';

    return {
        propertyName,
        direction
    };
}

export function throwIfOrderByFormatIsInvalid(orderByEntries: string[]): void {
    if (!Array.isArray(orderByEntries)) {
        throw new Error(`Invalid orderBy format: expected an array, but got ${typeof orderByEntries}`);
    }

    for (const entry of orderByEntries) {
        const trimmedEntry = entry.trim();

        if (!trimmedEntry) {
            throw new Error(`Invalid orderBy format: "${entry}". Property name cannot be empty`);
        }

        const parts = trimmedEntry.split(/\s+/);

        if (parts.length === 0 || parts.length > 2) {
            throw new Error(`Invalid orderBy format: "${entry}". Expected format: "propertyName", "propertyName asc", or "propertyName desc"`);
        }

        if (parts.length === 2) {
            const direction = parts[1].toLowerCase();
            if (direction !== 'asc' && direction !== 'desc') {
                throw new Error(`Invalid orderBy direction: "${parts[1]}". Expected "asc" or "desc" but got "${parts[1]}"`);
            }
        }

        if (!parts[0] || parts[0].trim() === '') {
            throw new Error(`Invalid orderBy format: "${entry}". Property name cannot be empty`);
        }
    }
}

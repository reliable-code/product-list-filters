import { getStorageValue, setStorageValue } from '../storage/storage';

export function runMigrationTaskIfNeeded(migrationTask, actualDbVersion) {
    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === actualDbVersion) return;

    migrationTask();

    setStorageValue('dbVersion', actualDbVersion);
}

export function processEntriesByKeyFilter(keyFilterCondition, processEntry, log = true) {
    const allKeys = window.GM_listValues();
    const filteredKeys = allKeys.filter(keyFilterCondition);

    let processedCount = 0;

    filteredKeys.forEach((key) => {
        const value = getStorageValue(key);

        if (log) console.log(`${key}: ${value}`);

        processEntry(key, value);

        processedCount += 1;
    });

    if (log) console.log(`Total entries processed: ${processedCount}`);
}

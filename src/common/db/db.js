import { getStorageValue, setStorageValue } from '../storage/storage';

export const getAllKeys = window.GM_listValues;

export function runMigrationTaskIfNeeded(migrationTask, actualDbVersion, test = false) {
    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === actualDbVersion) return;

    migrationTask();

    if (test) return;
    setStorageValue('dbVersion', actualDbVersion);
}

export function processAllEntries(processEntry, log = true) {
    const allKeys = getAllKeys();

    processEntriesByKeys(allKeys, processEntry, log);
}

export function processEntriesByKeyFilter(keyFilterCondition, processEntry, log = true) {
    const allKeys = getAllKeys();
    const filteredKeys = allKeys.filter(keyFilterCondition);

    processEntriesByKeys(filteredKeys, processEntry, log);
}

function processEntriesByKeys(keys, processEntry, log) {
    let processedCount = 0;

    keys.forEach((key) => {
        const value = getStorageValue(key);

        if (log) console.log(`${key}: ${value}`);

        processEntry(key, value);

        processedCount += 1;
    });

    if (log) console.log(`Total entries processed: ${processedCount}`);
}

export function deleteMigrationTask(keyFilterCondition, test = false) {
    const processEntry = (key) => {
        if (test) return;
        window.GM_deleteValue(key);
    };

    processEntriesByKeyFilter(keyFilterCondition, processEntry);
}

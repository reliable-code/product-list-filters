import { getStorageValue } from '../../common/storage/storage';
import { runMigrationTaskIfNeeded } from '../../common/db/db';

const ACTUAL_DB_VERSION = 4;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION);
}

function migrationTask() {
    const keyFilterCondition = (key) => key.includes('filter');
    const processEntry = (key, value) => {
        window.GM_deleteValue(key);
    };

    const processedCount = processEntriesByKeyFilter(keyFilterCondition, processEntry);
    console.log(`Total entries processed: ${processedCount}`);
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

    return processedCount;
}

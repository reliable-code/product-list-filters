import { processEntriesByKeyFilter, runMigrationTaskIfNeeded } from '../../common/db/db';

const ACTUAL_DB_VERSION = 4;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION);
}

function migrationTask() {
    const keyFilterCondition = (key) => key.includes('filter');
    const processEntry = (key, value) => {
        window.GM_deleteValue(key);
    };

    processEntriesByKeyFilter(keyFilterCondition, processEntry);
}

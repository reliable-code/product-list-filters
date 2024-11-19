import { getStorageValue } from '../../common/storage/storage';
import { runMigrationTaskIfNeeded } from '../../common/db/db';

const ACTUAL_DB_VERSION = 4;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION);
}

function migrationTask() {
    const filterCondition = (key) => key.includes('filter');
    const allKeys = window.GM_listValues();

    const filteredKeys = allKeys.filter(filterCondition);

    filteredKeys.forEach((key) => {
        const object = getStorageValue(key);

        console.log(`${key}: ${object}`);

        window.GM_deleteValue(key);
    });
}

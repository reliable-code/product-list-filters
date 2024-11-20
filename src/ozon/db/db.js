import { deleteMigrationTask, runMigrationTaskIfNeeded } from '../../common/db/db';

const ACTUAL_DB_VERSION = 4;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION);
}

function migrationTask() {
    const keyFilterCondition = (key) => key.includes('filter');

    deleteMigrationTask(keyFilterCondition);
}

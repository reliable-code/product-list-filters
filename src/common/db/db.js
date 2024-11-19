import { getStorageValue, setStorageValue } from '../storage/storage';

export function runMigrationTaskIfNeeded(migrationTask, actualDbVersion) {
    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === actualDbVersion) return;

    migrationTask();

    setStorageValue('dbVersion', actualDbVersion);
}

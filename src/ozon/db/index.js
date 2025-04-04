import { processEntriesByKeyFilter, runMigrationTaskIfNeeded } from '../../common/db/generic';
import { setStorageValue } from '../../common/storage';

const ACTUAL_DB_VERSION = 6;

export function runMigration() {
    runMigrationTaskIfNeeded(migrationTask, ACTUAL_DB_VERSION, false);
}

function migrationTask() {
    const keyFilterCondition = (key) => key.startsWith('product-');

    const processEntry = (key, value) => {
        // process entry code
    };

    processEntriesByKeyFilter(keyFilterCondition, processEntry, true);
}

function updateProductLastCheckDate(entryKey, productPropKey, value) {
    const lastCheckDate = value[productPropKey];

    if (lastCheckDate) {
        const [day, month, year] = lastCheckDate.split('.')
            .map(Number);
        const dateObject = new Date(year, month - 1, day);
        const timestamp = dateObject.getTime();
        value[productPropKey] = timestamp;

        setStorageValue(entryKey, value);
    }
}

function updateProductPriceDate(entryKey, productPropKey, value) {
    const datedPrice = value[productPropKey];

    if (datedPrice) {
        const dateString = datedPrice.date;
        const [day, month, year] = dateString.split('.')
            .map(Number);
        const dateObject = new Date(year, month - 1, day);
        const timestamp = dateObject.getTime();
        datedPrice.date = timestamp;

        value[productPropKey] = datedPrice;
        setStorageValue(entryKey, value);
    }
}

import { getStorageValue, setStorageValue } from '../../common/storage/storage';

export function migrateDatabase() {
    const actualDBVersion = 4;

    const dbVersion = getStorageValue('dbVersion');
    if (dbVersion === actualDBVersion) return;

    const filterCondition = (key) => key.includes('filter');

    const priceKeys = window.GM_listValues()
        .filter(filterCondition);
    priceKeys.forEach((key) => {
        const object = getStorageValue(key);

        console.log(`${key}: ${object}`);

        window.GM_deleteValue(key);
    });

    setStorageValue('dbVersion', actualDBVersion);
}

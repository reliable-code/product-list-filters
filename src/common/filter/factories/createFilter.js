import { StoredInputValue } from '../../storage/models/storedInputValue';

export function createFilterFactory(defaultOnChange, sectionId = null) {
    return {
        createGlobalFilter(filterName, defaultValue = null, onChange = defaultOnChange) {
            return StoredInputValue.create(filterName, defaultValue, onChange);
        },
        createSectionFilter(filterName, defaultValue = null, onChange = defaultOnChange) {
            if (!sectionId) {
                throw new Error('sectionId must be provided to use createSectionFilter.');
            }
            return StoredInputValue.createWithCompositeKey(
                sectionId, filterName, defaultValue, onChange,
            );
        },
    };
}

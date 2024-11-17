export function getInputValueFromEvent(event) {
    const { target } = event;
    const { type } = target;

    switch (type) {
        case 'text':
            return `"${target.value}"`;
        case 'number':
            return target.value;
        case 'checkbox':
            return target.checked;
        default:
            console.log(`Unknown input type: ${type}`);
            return null;
    }
}

import { createDiv } from '../../dom/factories/elements';

export function createSeparator(controlStyle = {}) {
    return createDiv(controlStyle, '|');
}

import { createButton } from './elementsFactory';

const DEFAULT_CLOSE_BUTTON_STYLES = {
    position: 'absolute',
    top: '0px',
    right: '8px',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#000',
};

export function createCloseButton(modal, styles = DEFAULT_CLOSE_BUTTON_STYLES) {
    const closeButton = createButton(styles, '×');

    closeButton.addEventListener('click', () => {
        closeModal(modal);
    });

    return closeButton;
}

export function handleClickOutside(event, modal) {
    if (!modal.contains(event.target)) {
        closeModal(modal);
    }
}

export function closeModal(modal) {
    modal.remove();
    document.removeEventListener('click', (event) => handleClickOutside(event, modal));
}

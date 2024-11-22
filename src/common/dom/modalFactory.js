import { createButton, createDiv } from './elementsFactory';

const DEFAULT_MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    border: '1px solid #ccc',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '80%',
    maxHeight: '70%',
    overflowY: 'auto',
    zIndex: '1000',
};

const DEFAULT_CLOSE_BUTTON_STYLES = {
    position: 'absolute',
    top: '0px',
    right: '8px',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#000',
};

export function createModal(styles = DEFAULT_MODAL_STYLES) {
    const modal = createDiv(styles);
    const closeButton = createCloseButton(modal);

    modal.appendChild(closeButton);

    document.addEventListener('click', (event) => handleClickOutside(event, modal));

    modal.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    return modal;
}

export function createCloseButton(modal, styles = DEFAULT_CLOSE_BUTTON_STYLES) {
    const closeButton = createButton(styles, '×');

    closeButton.addEventListener('click', () => {
        closeModal(modal);
    });

    return closeButton;
}

export function closeModal(modal) {
    modal.remove();
    document.removeEventListener('click', (event) => handleClickOutside(event, modal));
}

export function handleClickOutside(event, modal) {
    if (!modal.contains(event.target)) {
        closeModal(modal);
    }
}

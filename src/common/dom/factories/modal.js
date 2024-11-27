import { createButton, createDiv } from './elements';

const DEFAULT_MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '60%',
    maxHeight: '75%',
    zIndex: '1000',
};

const DEFAULT_CONTENT_STYLES = {
    margin: '40px 0 30px',
    padding: '5px 25px 0',
    overflowY: 'auto',
    maxHeight: 'calc(75vh - 75px)',
};

const DEFAULT_CLOSE_BUTTON_STYLES = {
    position: 'absolute',
    padding: '0',
    top: '0px',
    right: '11px',
    fontFamily: 'system-ui',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#000',
    border: 'none',
    background: 'none',
    opacity: '1',
};

const CLOSE_BUTTON_HOVER_STYLES = {
    opacity: '0.6',
};

let currentModal = null;

export function createAndShowModal(
    content = null, styles = DEFAULT_MODAL_STYLES, contentStyles = DEFAULT_CONTENT_STYLES,
) {
    const modal = createModal(content, styles, contentStyles);
    showModal(modal);
}

export function showModal(modal) {
    if (currentModal) closeModal(currentModal);

    currentModal = modal;

    document.addEventListener('click', (event) => handleClickOutside(event, modal));

    modal.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.body.appendChild(modal);

    return modal;
}

export function createModal(
    content = null, styles = DEFAULT_MODAL_STYLES, contentStyles = DEFAULT_CONTENT_STYLES,
) {
    const modal = createDiv(styles);
    const closeButton = createCloseButton(modal);

    modal.appendChild(closeButton);

    const contentContainer = createDiv(contentStyles);
    if (content) contentContainer.appendChild(content);
    modal.appendChild(contentContainer);

    return modal;
}

function createCloseButton(modal, styles = DEFAULT_CLOSE_BUTTON_STYLES) {
    const closeButton = createButton(styles, '×');

    closeButton.addEventListener('click', () => {
        closeModal(modal);
    });

    const handleHover = (isHover) => {
        Object.assign(
            closeButton.style,
            isHover ? CLOSE_BUTTON_HOVER_STYLES : DEFAULT_CLOSE_BUTTON_STYLES,
        );
    };

    closeButton.addEventListener('mouseenter', () => handleHover(true));
    closeButton.addEventListener('mouseleave', () => handleHover(false));

    return closeButton;
}

function closeModal(modal) {
    modal.remove();
    document.removeEventListener('click', (event) => handleClickOutside(event, modal));
    currentModal = null;
}

function handleClickOutside(event, modal) {
    if (!modal.contains(event.target)) {
        closeModal(modal);
    }
}

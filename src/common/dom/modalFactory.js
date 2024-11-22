export function handleClickOutside(event, modal) {
    if (!modal.contains(event.target)) {
        closeModal(modal);
    }
}

export function closeModal(modal) {
    modal.remove();
    document.removeEventListener('click', (event) => handleClickOutside(event, modal));
}

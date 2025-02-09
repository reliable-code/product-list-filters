import { createActionLinkWithIcon, createDiv } from '../../../common/dom/factories/elements';

export function createToggleSidebarControl(
    shouldHideSidebar,
    sidebarSelector,
    controlStyles = {},
    linkStyles = {},
) {
    const iconStyles = {
        width: '1.15em',
        height: '1.15em',
        paddingBottom: '2px',
    };

    const hideSidebarLink = createActionLinkWithIcon(
        () => setSidebarVisibility(true),
        'panel-left-close',
        'Скрыть панель',
        linkStyles,
        iconStyles,
    );
    const showSidebarLink = createActionLinkWithIcon(
        () => setSidebarVisibility(false),
        'panel-left-open',
        'Показать панель',
        linkStyles,
        iconStyles,
    );

    function setSidebarVisibility(hidden) {
        const sidebar = document.querySelector(sidebarSelector);
        if (!sidebar) return;

        shouldHideSidebar.updateValue(hidden);

        sidebar.parentNode.style.display = hidden ? 'none' : '';

        hideSidebarLink.style.display = hidden ? 'none' : 'inline-flex';
        showSidebarLink.style.display = hidden ? 'inline-flex' : 'none';
    }

    setSidebarVisibility(shouldHideSidebar.value);

    const control = createDiv(controlStyles);
    control.append(hideSidebarLink, showSidebarLink);
    return control;
}

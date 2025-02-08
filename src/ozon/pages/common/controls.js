import { createActionLinkWithIcon, createDiv } from '../../../common/dom/factories/elements';

export function toggleSidebarControl(
    sidebarSelector,
    controlStyles = {},
    linkStyles = {},
) {
    const hiddenLinkStyles = {
        ...linkStyles,
        display: 'none',
    };
    const iconStyles = {
        width: '1.15em',
        height: '1.15em',
        paddingBottom: '2px',
    };
    const hideSidebarLink = createActionLinkWithIcon(
        toggleSidebar, 'panel-left-close', 'Скрыть панель', linkStyles, iconStyles,
    );
    const showSidebarLink = createActionLinkWithIcon(
        toggleSidebar, 'panel-left-open', 'Показать панель', hiddenLinkStyles, iconStyles,
    );

    function toggleSidebar() {
        const sidebar = document.querySelector(sidebarSelector);
        if (!sidebar) return;

        const sidebarWrap = sidebar.parentNode;

        const isSidebarWrapVisible = sidebarWrap.style.display !== 'none';

        sidebarWrap.style.display = isSidebarWrapVisible ? 'none' : '';

        hideSidebarLink.style.display = isSidebarWrapVisible ? 'none' : 'inline-flex';
        showSidebarLink.style.display = isSidebarWrapVisible ? 'inline-flex' : 'none';
    }

    const control = createDiv(controlStyles);
    control.append(hideSidebarLink, showSidebarLink);
    return control;
}

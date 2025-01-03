import { getAllElements, getNonEmptyTextNodes } from './helpers';

export function highlightSearchStrings(searchStrings, textWrap) {
    searchStrings.forEach(
        (searchString) => highlightSearchString(textWrap, searchString),
    );
}

function highlightSearchString(textWrap, searchString) {
    getNonEmptyTextNodes(textWrap)
        .map((textNode) => textNode.parentNode)
        .forEach((textNodeParent) => highlightSubstring(textNodeParent, searchString));
}

export function highlightSubstring(container, substring) {
    const regex = new RegExp(`(${substring})`, 'gi');

    container.innerHTML = container.innerHTML.replace(
        regex,
        '<span class="highlightedSubstring" style="background-color: yellow;">$1</span>',
    );
}

export function removeHighlights(container) {
    const highlights = getAllElements('.highlightedSubstring', container);
    highlights.forEach((span) => {
        const { parentNode } = span;
        span.replaceWith(span.textContent);
        parentNode.normalize();
    });
}

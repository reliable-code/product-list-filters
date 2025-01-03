import { getAllElements } from './helpers';

export function highlightSearchStrings(searchStrings, textWrap) {
    searchStrings.forEach(
        (searchString) => highlightSubstring(textWrap, searchString),
    );
}

export function highlightSubstring(container, substring) {
    if (!substring) return;

    // Create a regular expression to match the substring (case-insensitive)
    const regex = new RegExp(`(${substring})`, 'gi');

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let currentNode = walker.nextNode();
    const fragments = [];

    // Iterate through all text nodes
    while ((currentNode)) {
        // Check if the current node's text content matches the regex
        const { textContent } = currentNode;
        if (regex.test(textContent)) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            // Replace matches in the text and wrap them in a <span>
            textContent.replace(regex, (match, _, offset) => {
                // Add text before the match
                if (offset > lastIndex) {
                    fragment.appendChild(
                        document.createTextNode(textContent.slice(lastIndex, offset)),
                    );
                }

                // Create a <span> to highlight the match
                const highlightedSpan = document.createElement('span');
                highlightedSpan.className = 'highlightedSubstring';
                highlightedSpan.style.backgroundColor = 'yellow';
                highlightedSpan.textContent = match;

                fragment.appendChild(highlightedSpan);
                lastIndex = offset + match.length;
            });

            // Add any remaining text after the last match
            if (lastIndex < textContent.length) {
                fragment.appendChild(document.createTextNode(textContent.slice(lastIndex)));
            }

            // Store the current text node and its corresponding fragment
            fragments.push({
                node: currentNode,
                fragment,
            });
        }

        currentNode = walker.nextNode();
    }

    // Insert the created fragments into the DOM
    fragments.forEach(({
        node,
        fragment,
    }) => {
        node.parentNode.replaceChild(fragment, node);
    });
}

export function removeHighlights(container) {
    const highlights = getAllElements('.highlightedSubstring', container);
    highlights.forEach((span) => {
        const { parentNode } = span;
        span.replaceWith(span.textContent);
        parentNode.normalize();
    });
}

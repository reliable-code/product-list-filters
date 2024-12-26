import { isGreaterThanFilter, isNotMatchTextFilter } from '../common/filter/compare';
import { hideElement, showElement, updateElementDisplay } from '../common/dom/manipulation';
import {
    applyStyles,
    getAllElements,
    getElementInnerNumber,
    getFirstElement,
} from '../common/dom/helpers';
import { createEnabledFilterControl } from '../common/filter/factories/specificControls';
import { SELECTORS } from './selectors';
import { STYLES } from './styles';
import { createFilterFactory } from '../common/filter/factories/createFilter';
import {
    createNumberFilterControl,
    createTextFilterControl,
} from '../common/filter/factories/genericControls';
import { appendFilterControlsIfNeeded } from '../common/filter/manager';

const { createGlobalFilter } = createFilterFactory(processMovieCards);

const genreFilter = createGlobalFilter('genre-filter');
const maxLengthFilter = createGlobalFilter('max-length-filter');
const filterEnabled = createGlobalFilter('filter-enabled', true);

initProcessMovieCards();

function initProcessMovieCards() {
    const moviesList = getFirstElement(SELECTORS.MOVIES_LIST);

    const observer = new MutationObserver(() => executeProcessMovieCards(moviesList));
    observer.observe(moviesList, {
        childList: true,
        subtree: true,
    });
}

function executeProcessMovieCards(moviesList) {
    const listHeader = getFirstElement('tr > td', moviesList);
    appendFilterControlsIfNeeded(listHeader, appendFiltersContainer);
    processMovieCards();
}

function appendFiltersContainer(filtersContainer, parentNode) {
    applyStyles(filtersContainer, STYLES.FILTERS_CONTAINER);

    const genreFilterDiv = createTextFilterControl(
        'Жанр:',
        genreFilter,
        STYLES.CONTROL,
        STYLES.TEXT_INPUT,
    );
    const maxLengthDiv = createNumberFilterControl(
        'Макс. минут:',
        maxLengthFilter,
        '10',
        '0',
        '500',
        STYLES.CONTROL,
        STYLES.NUMBER_INPUT,
    );
    const filterEnabledDiv = createEnabledFilterControl(
        filterEnabled, STYLES.CONTROL, STYLES.CHECKBOX_INPUT,
    );

    filtersContainer.append(
        genreFilterDiv, maxLengthDiv, filterEnabledDiv,
    );

    parentNode.append(filtersContainer);
}

function processMovieCards() {
    const movieCards = getAllElements(SELECTORS.MOVIE_CARD);

    movieCards.forEach(processMovieCard);
}

function processMovieCard(movieCard) {
    if (!filterEnabled.value) {
        showElement(movieCard);
        return;
    }

    const myVoteWrap = getFirstElement(SELECTORS.MY_VOTE_WRAP, movieCard);
    const genreWrap = getFirstElement(SELECTORS.GENRE_WRAP, movieCard);
    const nameWrap = getFirstElement(SELECTORS.NAME_WRAP, movieCard);

    if (!myVoteWrap || !genreWrap || !nameWrap) {
        hideElement(movieCard);
        return;
    }

    if (myVoteWrap.innerText) {
        hideElement(movieCard);
        return;
    }

    const genre = getLastTextNode(genreWrap);
    const lengthWrap = getFirstElement(SELECTORS.LENGTH_WRAP, nameWrap);
    const length = getElementInnerNumber(lengthWrap, true);

    const shouldHide =
        isNotMatchTextFilter(genre, genreFilter) ||
        isGreaterThanFilter(length, maxLengthFilter);
    updateElementDisplay(movieCard, shouldHide);
}

function getLastTextNode(element) {
    const childNodes = Array.from(element.childNodes);
    const textNodes = childNodes.filter((node) => node.nodeType === Node.TEXT_NODE);
    return textNodes.pop()
        ?.textContent
        .trim() || '';
}

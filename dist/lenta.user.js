// ==UserScript==
// @name         Lenta List Clean
// @description  Remove product cards by filter
// @match        https://*.online.lenta.com/*
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1.69634459
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lenta.com
// @author       reliable-code
// ==/UserScript==

(()=>{"use strict";function getElementInnerNumber(element,cleanText=false){let elementText=element.innerText;cleanText&&(elementText=elementText.replace(/\D/g,""));const elementNumber=+elementText;return elementNumber}


const MIN_RATING=4;const MIN_RATING_LOCAL_STORAGE_KEY="min-rating-filter";const PRODUCT_CARD_LIST_SELECTOR=".catalog-list";const PRODUCT_CARD_SELECTOR=".catalog-grid_new__item";const PRODUCT_CARD_RATING_SELECTOR=".rating-number";const minRatingValue=+(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY)??MIN_RATING);setTimeout((()=>{const productCardList=document.querySelector(PRODUCT_CARD_LIST_SELECTOR);productCardList&&setInterval(cleanList,500)}),1e3);function cleanList(){const productCards=document.querySelectorAll(PRODUCT_CARD_SELECTOR);productCards.forEach((productCard=>{const productCardRating=productCard.querySelector(PRODUCT_CARD_RATING_SELECTOR);productCardRating||productCard.remove();const productCardRatingNumber=getElementInnerNumber(productCardRating);productCardRatingNumber<minRatingValue&&productCard.remove()}))}})();
// ==UserScript==
// @name         Lenta List Clean
// @description  Remove product cards by filter
// @match        https://*.online.lenta.com/*
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1.69634624
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lenta.com
// @author       reliable-code
// ==/UserScript==

(()=>{"use strict";


function getFirstElement(parentNode,selector,logNotFound=false){const element=parentNode.querySelector(selector);logNotFound&&!element&&console.log(`No element found for selector: ${selector}`);return element}function getAllElements(parentNode,selector,logNotFound=false){const elements=parentNode.querySelectorAll(selector);logNotFound&&!elements.length&&console.log(`No elements found for selector: ${selector}`);return elements}function updateInput(keyName,e){localStorage.setItem(keyName,e.target.value);window.location.reload()}function createDefaultFilterControl(titleText,inputValue,inputStep,inputMinValue,inputMaxValue,inputOnChange,controlStyle="",inputStyle=""){const filterControl=document.createElement("div");filterControl.style=controlStyle;filterControl.textContent=titleText;const input=document.createElement("input");input.style=inputStyle;input.type="number";input.value=inputValue;input.step=inputStep;input.min=inputMinValue;input.max=inputMaxValue;input.addEventListener("change",inputOnChange);filterControl.append(input);return filterControl}function getElementInnerNumber(element,cleanText=false){let elementText=element.innerText;cleanText&&(elementText=elementText.replace(/\D/g,""));const elementNumber=+elementText;return elementNumber}


const MIN_RATING=4;const MIN_RATING_LOCAL_STORAGE_KEY="min-rating-filter";const PRODUCT_CARD_LIST_SELECTOR=".catalog-list";const PRODUCT_CARD_SELECTOR=".catalog-grid_new__item";const PRODUCT_CARD_RATING_SELECTOR=".rating-number";const minRatingValue=+(localStorage.getItem(MIN_RATING_LOCAL_STORAGE_KEY)??MIN_RATING);setTimeout((()=>{const productCardList=getFirstElement(document,PRODUCT_CARD_LIST_SELECTOR);if(productCardList){appendFilterControls(productCardList);setInterval(cleanList,500)}}),1e3);function appendFilterControls(filtersBlockContainer){const controlStyle="margin-left: 10px;";const inputStyle="border: 1px solid #C9C9C9;"+"border-radius: 8px;"+"height: 40px;"+"padding: 0 16px;";const minRatingDiv=createDefaultFilterControl("Минимальный рейтинг: ",minRatingValue,"0.1","4.0","5.0",updateMinRatingInput,controlStyle,inputStyle);filtersBlockContainer.prepend(minRatingDiv)}function updateMinRatingInput(e){updateInput(MIN_RATING_LOCAL_STORAGE_KEY,e)}function cleanList(){const productCards=getAllElements(document,PRODUCT_CARD_SELECTOR);productCards.forEach((productCard=>{const productCardRating=getFirstElement(productCard,PRODUCT_CARD_RATING_SELECTOR);productCardRating||productCard.remove();const productCardRatingNumber=getElementInnerNumber(productCardRating);productCardRatingNumber<minRatingValue&&productCard.remove()}))}})();
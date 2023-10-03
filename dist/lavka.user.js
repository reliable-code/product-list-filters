// ==UserScript==
// @name         Lavka List Clean
// @description  Remove product cards without discount
// @match        https://lavka.yandex.ru/*
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.4.69634624
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @author       reliable-code
// ==/UserScript==

(()=>{"use strict";


function getFirstElement(parentNode,selector,logNotFound=false){const element=parentNode.querySelector(selector);logNotFound&&!element&&console.log(`No element found for selector: ${selector}`);return element}function getAllElements(parentNode,selector,logNotFound=false){const elements=parentNode.querySelectorAll(selector);logNotFound&&!elements.length&&console.log(`No elements found for selector: ${selector}`);return elements}function insertAfter(existingNode,newNode){existingNode.parentNode.insertBefore(newNode,existingNode.nextSibling)}function updateInput(keyName,e){localStorage.setItem(keyName,e.target.value);window.location.reload()}function createDefaultFilterControl(titleText,inputValue,inputStep,inputMinValue,inputMaxValue,inputOnChange,controlStyle="",inputStyle=""){const filterControl=document.createElement("div");filterControl.style=controlStyle;filterControl.textContent=titleText;const input=document.createElement("input");input.style=inputStyle;input.type="number";input.value=inputValue;input.step=inputStep;input.min=inputMinValue;input.max=inputMaxValue;input.addEventListener("change",inputOnChange);filterControl.append(input);return filterControl}


const MIN_DISCOUNT=20;const MIN_DISCOUNT_LOCAL_STORAGE_KEY="minDiscountFilter";const MAIN_CONTENT_SELECTOR="#main-content-id";const PRODUCT_CARD_LINK_SELECTOR='[data-type="product-card-link"]';const minDiscountValue=+(localStorage.getItem(MIN_DISCOUNT_LOCAL_STORAGE_KEY)??MIN_DISCOUNT);const mainContent=getFirstElement(document,MAIN_CONTENT_SELECTOR);if(mainContent){appendFilterControls();setInterval(cleanList,500)}function appendFilterControls(){const minDiscountDiv=createDefaultFilterControl("Минимальная скидка: ",minDiscountValue,"1","0","100",updateMinDiscountInput);insertAfter(mainContent,minDiscountDiv)}function updateMinDiscountInput(e){updateInput(MIN_DISCOUNT_LOCAL_STORAGE_KEY,e)}function cleanList(){if(minDiscountValue===0)return;const productCardLinks=getAllElements(document,PRODUCT_CARD_LINK_SELECTOR);productCardLinks.forEach((productCardLink=>{const productCardLinksParent=productCardLink.parentNode;const productCard=productCardLinksParent.parentNode.parentNode;const promoLabel=getFirstElement(productCardLinksParent,"li");if(!promoLabel){productCard.remove();return}const promoLabelText=promoLabel.innerText;if(!promoLabelText.includes("%")){productCard.remove();return}const discountValue=+promoLabelText.replace(/\D/g,"");discountValue<minDiscountValue&&productCard.remove()}))}})();
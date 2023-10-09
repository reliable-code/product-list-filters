// ==UserScript==
// @name         Lavka List Clean
// @description  Remove product cards without discount
// @match        https://lavka.yandex.ru/*
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.5.69688036
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @author       reliable-code
// ==/UserScript==

(()=>{"use strict";


function getFirstElement(selector,parentNode=document,logNotFound=false){const element=parentNode.querySelector(selector);logNotFound&&!element&&console.log(`No element found for selector: ${selector}`);return element}function getAllElements(selector,parentNode=document,logNotFound=false){const elements=parentNode.querySelectorAll(selector);logNotFound&&!elements.length&&console.log(`No elements found for selector: ${selector}`);return elements}function insertAfter(existingNode,newNode){existingNode.parentNode.insertBefore(newNode,existingNode.nextSibling)}function hideElement(element){setElementDisplay(element,"none")}function showElement(element,display="block"){setElementDisplay(element,display)}function setElementDisplay(element,display){element.style.display=display}function createInput(type=null,inputOnChange=null,style=null){const input=document.createElement("input");type&&(input.type=type);inputOnChange&&input.addEventListener("change",inputOnChange);style&&(input.style=style);return input}function createNumberInput(inputOnChange,inputStyle,inputValue,inputStep,inputMinValue,inputMaxValue){const input=createInput("number",inputOnChange,inputStyle);input.value=inputValue;input.step=inputStep;input.min=inputMinValue;input.max=inputMaxValue;return input}function dom_createDiv(textContent=null,style=null){const div=document.createElement("div");textContent&&(div.textContent=textContent);style&&(div.style=style);return div}


const storage=localStorage;function getStorageValueOrDefault(key,defaultValue){const localStorageItem=storage.getItem(key);return localStorageItem?JSON.parse(localStorageItem):defaultValue}function setStorageValueFromEvent(event,keyName){const{target}=event;const{type}=target;let valueToSet;if(type==="number")valueToSet=target.value;else{if(type!=="checkbox"){console.log(`Unknown input type: ${type}`);return null}valueToSet=target.checked}storage.setItem(keyName,valueToSet);return valueToSet}


function removeNonDigit(stringValue){return stringValue.replace(/\D/g,"")}


function createFilterControlNumber(titleText,inputValue,inputStep,inputMinValue,inputMaxValue,inputOnChange,controlStyle="",inputStyle=""){const filterControl=dom_createDiv(titleText,controlStyle);const input=createNumberInput(inputOnChange,inputStyle,inputValue,inputStep,inputMinValue,inputMaxValue);filterControl.append(input);return filterControl}function createMinDiscountFilterControl(inputValue,inputOnChange,controlStyle="",inputStyle=""){return createFilterControlNumber("Минимальная скидка: ",inputValue,"1","0","100",inputOnChange,controlStyle,inputStyle)}function appendFilterControlsIfNeeded(parentNode,appendFiltersContainerFunc,filtersContainerId="customFiltersContainer"){let filtersContainer=getFirstElement(`#${filtersContainerId}`,parentNode);if(filtersContainer)return;filtersContainer=dom_createDiv();filtersContainer.id=filtersContainerId;appendFiltersContainerFunc(filtersContainer,parentNode)}


const MIN_DISCOUNT=20;const MIN_DISCOUNT_LOCAL_STORAGE_KEY="minDiscountFilter";const MAIN_CONTENT_SELECTOR="#main-content-id";const PRODUCT_CARD_LINK_SELECTOR='[data-type="product-card-link"]';let minDiscountValue=getStorageValueOrDefault(MIN_DISCOUNT_LOCAL_STORAGE_KEY,MIN_DISCOUNT);const mainContent=getFirstElement(MAIN_CONTENT_SELECTOR);setInterval(initListClean,500);function initListClean(){const productCardLinks=getAllElements(PRODUCT_CARD_LINK_SELECTOR);if(productCardLinks.length){appendFilterControlsIfNeeded(mainContent,appendFiltersContainer);cleanList(productCardLinks)}}function appendFiltersContainer(filtersContainer,parentNode){const minDiscountDiv=createMinDiscountFilterControl(minDiscountValue,updateMinDiscountValue);filtersContainer.append(minDiscountDiv);insertAfter(parentNode.firstChild,filtersContainer)}function updateMinDiscountValue(e){minDiscountValue=setStorageValueFromEvent(e,MIN_DISCOUNT_LOCAL_STORAGE_KEY)}function cleanList(productCardLinks){if(minDiscountValue===0)return;productCardLinks.forEach((productCardLink=>{const productCardLinksParent=productCardLink.parentNode;const productCard=productCardLinksParent.parentNode.parentNode;const promoLabel=getFirstElement("li",productCardLinksParent);if(!promoLabel){productCard.remove();return}const promoLabelText=promoLabel.innerText;if(!promoLabelText.includes("%")){productCard.remove();return}const discountValue=+removeNonDigit(promoLabelText);discountValue<minDiscountValue?hideElement(productCard):showElement(productCard)}))}})();
// ==UserScript==
// @name         Prodoctorov List Clean
// @description  Remove profile cards by filter
// @match        https://prodoctorov.ru/*
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.4.69634624
// @icon         https://www.google.com/s2/favicons?sz=64&domain=prodoctorov.ru
// @author       reliable-code
// ==/UserScript==

(()=>{"use strict";


function getFirstElement(parentNode,selector,logNotFound=false){const element=parentNode.querySelector(selector);logNotFound&&!element&&console.log(`No element found for selector: ${selector}`);return element}function getAllElements(parentNode,selector,logNotFound=false){const elements=parentNode.querySelectorAll(selector);logNotFound&&!elements.length&&console.log(`No elements found for selector: ${selector}`);return elements}function updateInput(keyName,e){localStorage.setItem(keyName,e.target.value);window.location.reload()}function createDefaultFilterControl(titleText,inputValue,inputStep,inputMinValue,inputMaxValue,inputOnChange,controlStyle="",inputStyle=""){const filterControl=document.createElement("div");filterControl.style=controlStyle;filterControl.textContent=titleText;const input=document.createElement("input");input.style=inputStyle;input.type="number";input.value=inputValue;input.step=inputStep;input.min=inputMinValue;input.max=inputMaxValue;input.addEventListener("change",inputOnChange);filterControl.append(input);return filterControl}


const MIN_REVIEWS_LOCAL_STORAGE_KEY="minReviewsFilter";const APPOINTMENTS_PAGE=".appointments_page";const SPECIAL_PLACEMENT_CARD_SELECTOR=".b-doctor-card_special-placement";const MIN_REVIEWS_DIV_ID="minReviewsDiv";const DOCTOR_CARD_SELECTOR=".b-doctor-card";const DOCTOR_CARD_NAME_SELECTOR=".b-doctor-card__name-surname";const MIN_REVIEWS=10;const minReviewsValue=+(localStorage.getItem(MIN_REVIEWS_LOCAL_STORAGE_KEY)??MIN_REVIEWS);const appointmentsPage=getFirstElement(document,APPOINTMENTS_PAGE);if(appointmentsPage){initListClean();setInterval(checkListCleanInitiated,500)}function initListClean(){const minReviewsDiv=createDefaultFilterControl("Минимально отзывов: ",minReviewsValue,"1","1","999999",updateMinReviewsInput);minReviewsDiv.id=MIN_REVIEWS_DIV_ID;appointmentsPage.prepend(minReviewsDiv);removeSpecialPlacementCards();cleanList()}function updateMinReviewsInput(e){updateInput(MIN_REVIEWS_LOCAL_STORAGE_KEY,e)}function removeSpecialPlacementCards(){const specialPlacementCards=getAllElements(document,SPECIAL_PLACEMENT_CARD_SELECTOR);specialPlacementCards.forEach((specialPlacementCard=>specialPlacementCard.remove()))}function cleanList(){const doctorCards=getAllElements(appointmentsPage,DOCTOR_CARD_SELECTOR);doctorCards.forEach((doctorCard=>{const profileCard=getFirstElement(doctorCard,".b-profile-card",true);const reviewsLink=getFirstElement(profileCard,":scope > a");if(!reviewsLink){doctorCard.remove();return}const reviewsLinkText=reviewsLink.innerText;const reviewsLinkDigit=+reviewsLinkText.replace(/\D/g,"");reviewsLinkDigit<minReviewsValue&&doctorCard.remove();appendAdditionalLinks(doctorCard,profileCard)}))}function appendAdditionalLinks(doctorCard,profileCard){appendAdditionalLink(doctorCard,profileCard,"НаПоправку");appendAdditionalLink(doctorCard,profileCard,"DocDoc");appendAdditionalLink(doctorCard,profileCard,"Докту")}function appendAdditionalLink(doctorCard,profileCard,siteName){const doctorCardName=getFirstElement(doctorCard,DOCTOR_CARD_NAME_SELECTOR,true);const doctorName=doctorCardName.innerText;const searchString=`${doctorName} ${siteName}`;const encodedSearchString=encodeURIComponent(searchString);const lineBreak=document.createElement("br");const searchUrlLink=document.createElement("a");searchUrlLink.href=`https://www.google.com/search?q=${encodedSearchString}&btnI`;searchUrlLink.textContent=siteName;profileCard.append(lineBreak,searchUrlLink)}function checkListCleanInitiated(){const minReviewsDiv=getFirstElement(appointmentsPage,`#${MIN_REVIEWS_DIV_ID}`);minReviewsDiv||initListClean()}})();
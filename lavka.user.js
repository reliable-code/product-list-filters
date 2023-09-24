// ==UserScript==
// @name         Lavka List Clean
// @namespace    https://github.com/reliable-code/product-list-filters
// @version      0.1
// @description  Remove product cards without discount
// @author       reliable-code
// @match        https://lavka.yandex.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yandex.ru
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MIN_DISCOUNT = 20;
    const MIN_DISCOUNT_LOCAL_STORAGE_KEY = "minDiscountFilter";

    let minDiscountValue = localStorage.getItem(MIN_DISCOUNT_LOCAL_STORAGE_KEY) ?? MIN_DISCOUNT;

    const mainContent = document.querySelector('#main-content-id');

    if (mainContent) {
        appendFilterControls(mainContent);

        setInterval(cleanList, 500);
    }

    function cleanList() {
        if (minDiscountValue == 0) {
            return;
        }

        const productCardLinks = document.querySelectorAll('[data-type="product-card-link"]');

        if (productCardLinks.length) {
            productCardLinks.forEach(
                (element) => {
                    let productCardLinksParent = element.parentNode;
                    let productCard = productCardLinksParent.parentNode.parentNode;

                    const discountLi = productCardLinksParent.querySelector("li");

                    if (!discountLi) {
                        productCard.remove();
                        return;
                    }

                    const discountLiText = discountLi.innerText;

                    if (!discountLiText.includes('%')) {
                        productCard.remove();
                        return;
                    }

                    const discountLiDigit = +discountLiText.replace(/\D/g, "");

                    if (discountLiDigit < minDiscountValue) {
                        productCard.remove();
                    }
                }
            );
        }
    }

    function appendFilterControls(mainContent) {
        const minDivStyle = "";

        const minDiscountDiv = document.createElement("div");
        minDiscountDiv.style = minDivStyle;
        minDiscountDiv.textContent = "Минимальная скидка: ";

        const minDiscountInput = document.createElement("input");
        minDiscountInput.type = "number";
        minDiscountInput.value = minDiscountValue;
        minDiscountInput.step = "1";
        minDiscountInput.min = "0";
        minDiscountInput.max = "100";
        minDiscountInput.addEventListener("change", updateMinDiscountInput);
        minDiscountDiv.appendChild(minDiscountInput);

        mainContent.insertBefore(minDiscountDiv, mainContent.firstChild);
    }

    function updateMinDiscountInput(e) {
        updateInput(MIN_DISCOUNT_LOCAL_STORAGE_KEY, e);
    }

    function updateInput(keyName, e) {
        localStorage.setItem(keyName, e.target.value);
        window.location.reload();
    }
})();
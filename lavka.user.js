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

    const MAIN_CONTENT_SELECTOR = '#main-content-id';
    const PRODUCT_CARD_LINK_SELECTOR = '[data-type="product-card-link"]';

    let minDiscountValue = localStorage.getItem(MIN_DISCOUNT_LOCAL_STORAGE_KEY) ?? MIN_DISCOUNT;

    const mainContent = document.querySelector(MAIN_CONTENT_SELECTOR);

    if (mainContent) {
        appendFilterControls(mainContent);

        setInterval(cleanList, 500);
    }

    function cleanList() {
        if (minDiscountValue == 0) {
            return;
        }

        const productCardLinks = document.querySelectorAll(PRODUCT_CARD_LINK_SELECTOR);

        if (productCardLinks.length) {
            productCardLinks.forEach(
                (productCardLink) => {
                    let productCardLinksParent = productCardLink.parentNode;
                    let productCard = productCardLinksParent.parentNode.parentNode;

                    const promoLabel = productCardLinksParent.querySelector("li");

                    if (!promoLabel) {
                        productCard.remove();
                        return;
                    }

                    const promoLabelText = promoLabel.innerText;

                    if (!promoLabelText.includes('%')) {
                        productCard.remove();
                        return;
                    }

                    const discountValue = +promoLabelText.replace(/\D/g, "");

                    if (discountValue < minDiscountValue) {
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
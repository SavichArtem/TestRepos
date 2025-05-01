const langButtons = document.querySelectorAll("[data-btn]");
const allLangs = ['ru', 'en'];
const currentPathName = window.location.pathname;
let currentLang = localStorage.getItem('language') || checkBrowserLang() || 'en';
let currentText = {};

import { homePageText } from "./language_pages/languages_main-page.js";
import { menuPageText } from "./language_pages/languages_menu-page.js";
import { contactPageText } from "./language_pages/languages_contact-page.js";
import { aboutPageText } from "./language_pages/languages_about-page.js";


function checkPagePathName() {
    switch (currentPathName) {
        case '/main.html':
            currentText = homePageText;
            break;
        case './menu.html':
            currentText = menuPageText;
            break;
        case '/contact.html':
            currentText = contactPageText;
            break;
        case '/about.html':
            currentText = aboutPageText;
            break;
        default:
            currentText = homePageText;
            break;
    }
}

checkPagePathName();

function changeLang() {
    for (const key in currentText) {
        const elem = document.querySelector(`[data-lang=${key}]`);
        if (elem) {
            elem.textContent = currentText[key][currentLang];
        }
    }
}

changeLang();

langButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        currentLang = event.target.dataset.btn;
        localStorage.setItem('language', event.target.dataset.btn)
        resetActiveClass(langButtons, "header_btn_active")
        btn.classList.add("header_btn_active");
        changeLang();
    });
});

function resetActiveClass(arr, activeClass){
    arr.forEach(elem=>{
        elem.classList.remove(activeClass)
    })
}

function checkActiveLangButton() {
    switch(currentLang){
        case 'ru':
            document
                .querySelector('[data-btn="ru"]')
                .classList.add("header_btn_active");
            break;
        case 'en':
            document
                .querySelector('[data-btn="en"')
                .classList.add('header_btn_active');
            break;
        default:
            document
                .querySelector('[data-btn="ru"]')
                .classList.add("header__btn_active");
            break;
    }
}

checkActiveLangButton();

function checkBrowserLang() {
	const navLang = navigator.language.slice(0, 2).toLowerCase();
	const result = allLangs.some((elem) => {
		return elem === navLang;
	});
	if (result) {
		return navLang;
	}
}

console.log("navigator.language", checkBrowserLang());
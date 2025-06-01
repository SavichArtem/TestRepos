const langButtons = document.querySelectorAll("[data-btn]");
const allLangs = ["ru", "en"];
const currentPathName = window.location.pathname;
let currentLang =
  localStorage.getItem("language") || checkBrowserLang() || "en";
let currentText = {};

window.getCurrentLang = () => currentLang;
window.getCurrentText = () => currentText;

import { homePageText } from "./language_pages/languages_main-page.js";
import { menuPageText } from "./language_pages/languages_menu-page.js";
import { contactPageText } from "./language_pages/languages_contact-page.js";
import { aboutPageText } from "./language_pages/languages_about-page.js";
import { loginPageText } from "./language_pages/languages_login-page.js";
import { registrationPageText } from "./language_pages/languages_registration-page.js";
import { adminPageText } from "./language_pages/languages_admin-page.js";
import { blogsPageText } from "./language_pages/languages_blogs-page.js";
import { blogPageText } from "./language_pages/languages_blog-page.js";

function checkPagePathName() {
  switch (currentPathName) {
    case "/main.html":
      currentText = homePageText;
      break;
    case "/menu.html":
      currentText = menuPageText;
      break;
    case "/contact.html":
      currentText = contactPageText;
      break;
    case "/about.html":
      currentText = aboutPageText;
      break;
    case "/login.html":
      currentText = loginPageText;
      break;
    case "/registration.html":
      currentText = registrationPageText;
      break;
    case "/admin.html":
      currentText = adminPageText;
      break;
    case "/blogs.html":
      currentText = blogsPageText;
      break;
    case "/blog.html":
      currentText = blogPageText;
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

  if (window.adminPanel) {
    window.adminPanel.updateTranslations();
    window.adminPanel.validation.updateSaveButtonState();
  }

  if (typeof window.updateAccessibilityButtonText === 'function') {
    window.updateAccessibilityButtonText();
  }

  updateErrorMessages();
}

function updateErrorMessages() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((el) => {
    if (el.textContent) {
      const errorKey = findErrorKeyByText(el.textContent);
      if (errorKey) {
        el.textContent = currentText[errorKey]?.[currentLang] || el.textContent;
      }
    }
  });
}

function findErrorKeyByText(text) {
  for (const key in currentText) {
    if (typeof currentText[key] === "object") {
      for (const lang in currentText[key]) {
        if (currentText[key][lang] === text) {
          return key;
        }
      }
    }
  }
  return null;
}

changeLang();

langButtons.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    currentLang = event.target.dataset.btn;
    localStorage.setItem("language", event.target.dataset.btn);
    resetActiveClass(langButtons, "header_btn_active");
    btn.classList.add("header_btn_active");
    changeLang();
  });
});

function resetActiveClass(arr, activeClass) {
  arr.forEach((elem) => {
    elem.classList.remove(activeClass);
  });
}

function checkActiveLangButton() {
  switch (currentLang) {
    case "ru":
      document
        .querySelector('[data-btn="ru"]')
        .classList.add("header_btn_active");
      break;
    case "en":
      document
        .querySelector('[data-btn="en"')
        .classList.add("header_btn_active");
      break;
    default:
      document
        .querySelector('[data-btn="ru"]')
        .classList.add("header_btn_active");
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

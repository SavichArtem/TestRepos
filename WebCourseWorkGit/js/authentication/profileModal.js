import { validateEmail, validatePhone } from "./validation.js";
import { validateUsername } from "./validation.js";
import {checkEmailExists, checkUsernameExists, checkPhoneExists} from "./api.js";
import { showNotification } from "../notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const profileModal = document.getElementById("profileModal");
  const profileForm = document.getElementById("profileForm");
  const closeBtn = document.querySelector("#profileModal .closeBtn");
  const profileFirstName = document.getElementById("profileFirstName");
  const profileLastName = document.getElementById("profileLastName");
  const profileUsername = document.getElementById("profileUsername");
  const profilePassword = document.getElementById("profilePassword");
  const profileEmail = document.getElementById("profileEmail");
  const profilePhone = document.getElementById("profilePhone");
  const resetProfileBtn = document.getElementById("resetProfile");

  let currentUser = null;
  let originalUserData = null;

  function initProfileModal() {
    if (!profileModal) return;

    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    fillProfileForm();
    setupEventListeners();
    setupValidation();
  }

  function fillProfileForm() {
    profileFirstName.value = currentUser.firstName || "";
    profileLastName.value = currentUser.lastName || "";
    profileUsername.value = currentUser.username || "";
    profilePassword.value = currentUser.password || "";
    profileEmail.value = currentUser.email || "";
    profilePhone.value = currentUser.phone || "";

    originalUserData = {
      email: currentUser.email,
      username: currentUser.username,
      phone: currentUser.phone,
    };
  }

  function setupEventListeners() {
    closeBtn?.addEventListener("click", closeModal);
    window.addEventListener(
      "click",
      (e) => e.target === profileModal && closeModal()
    );
    resetProfileBtn?.addEventListener("click", resetForm);
    profileForm?.addEventListener("submit", handleFormSubmit);
  }

  function setupValidation() {
    profileUsername.addEventListener("input", validateUsernameField);
    profileEmail.addEventListener("input", validateEmailField);
    profilePhone.addEventListener("input", validatePhoneField);
  }

  function validateUsernameField() {
    const error = validateUsername(profileUsername.value.trim());
    setError("profileUsername", error);
  }

  function validateEmailField() {
    const error = validateEmail(profileEmail.value.trim());
    setError("profileEmail", error);
  }

  function validatePhoneField() {
    const error = validatePhone(profilePhone.value.trim());
    setError("profilePhone", error);
  }

  function getTranslation(key) {
    const texts = window.getCurrentText?.() || {};
    const lang = window.getCurrentLang?.() || "en";
    return texts[key]?.[lang] || key;
  }

  function setError(fieldId, errorKey) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    const inputElement = document.getElementById(fieldId);

    if (!errorElement || !inputElement) return;

    const errorText = errorKey ? getTranslation(errorKey) : "";
    errorElement.textContent = errorText;
    inputElement.classList.toggle("invalid", !!errorText);
    inputElement.classList.toggle("valid", !errorText);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    validateUsernameField();
    validateEmailField();
    validatePhoneField();

    if (document.querySelectorAll(".invalid").length > 0) {
      showNotification(getTranslation("validation_errors"), "error");
      return;
    }

    const newData = {
      email: profileEmail.value.trim(),
      username: profileUsername.value.trim(),
      phone: profilePhone.value.trim(),
      firstName: profileFirstName.value.trim(),
      lastName: profileLastName.value.trim(),
    };

    const emailChanged = newData.email !== originalUserData.email;
    const usernameChanged = newData.username !== originalUserData.username;
    const phoneChanged = newData.phone !== originalUserData.phone;

    try {
      const [emailExists, usernameExists, phoneExists] = await Promise.all([
        emailChanged ? checkEmailExists(newData.email) : false,
        usernameChanged ? checkUsernameExists(newData.username) : false,
        phoneChanged ? checkPhoneExists(newData.phone) : false,
      ]);

      let hasErrors = false;
      if (emailExists) {
        setError("profileEmail", "email_taken");
        hasErrors = true;
      }
      if (usernameExists) {
        setError("profileUsername", "username_taken");
        hasErrors = true;
      }
      if (phoneExists) {
        setError("profilePhone", "phone_taken");
        hasErrors = true;
      }
      if (hasErrors) return;

      const updatedUser = { ...currentUser, ...newData };
      const response = await fetch(
        `http://localhost:3000/users/${currentUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      originalUserData = { ...newData };

      showNotification(getTranslation("profile_update_success"), "success");
      closeModal();
    } catch (error) {
      console.error("Update error:", error);
      showNotification(getTranslation("profile_update_error"), "error");
    }
  }

  function resetForm() {
    fillProfileForm();
    ["profileUsername", "profileEmail", "profilePhone"].forEach((field) =>
      setError(field, null)
    );
    showNotification(getTranslation("profile_reset"), "success");
  }

  function closeModal() {
    profileModal.style.display = "none";
    fillProfileForm();
    ["profileUsername", "profileEmail", "profilePhone"].forEach((field) =>
      setError(field, null)
    );
  }

  window.showProfileModal = () => {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;
    profileModal.style.display = "block";
    fillProfileForm();
  };

  initProfileModal();
});

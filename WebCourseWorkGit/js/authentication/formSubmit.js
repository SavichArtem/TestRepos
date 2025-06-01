import {
  validatePhone,
  validateEmail,
  validateBirthdate,
  validatePassword,
  validateConfirmPassword,
  validateUsername,
  initValidation,
  markAsTouched,
  shouldValidate
} from "./validation.js";
import { generateUsername } from "./usernameGenerator.js";
import { checkFieldExists, checkUsernameExists } from "./api.js";
import { generateAutoPassword } from "./passwordGenerator.js";
import { showNotification } from "../notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  const agreementModal = document.getElementById("agreementModal");
  const agreementLink = document.querySelector(".agreement-link");
  const modalClose = document.querySelector("#agreementModal .close");
  const agreeBtn = document.querySelector(".agree-btn");

  if (agreementLink) {
    agreementLink.addEventListener("click", (e) => {
      e.preventDefault();
      agreementModal.style.display = "block";
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      agreementModal.style.display = "none";
    });
  }

  if (agreeBtn) {
    agreeBtn.addEventListener("click", () => {
      agreementModal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === agreementModal) {
      agreementModal.style.display = "none";
    }
  });

  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const birthdateInput = document.getElementById("birthdate");
  const passwordMethodSelect = document.getElementById("passwordMethod");
  const manualPasswordFields = document.getElementById("manualPasswordFields");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const usernameInput = document.getElementById("username");
  const generateUsernameBtn = document.getElementById("generateUsername");
  const agreementCheckbox = document.getElementById("agreement");
  const submitBtn = document.getElementById("submitBtn");

  let usernameAttempts = 0;

  const formElements = {
    phoneInput,
    emailInput,
    birthdateInput,
    passwordMethodSelect,
    manualPasswordFields,
    passwordInput,
    confirmPasswordInput,
    firstNameInput,
    lastNameInput,
    usernameInput,
    generateUsernameBtn,
    agreementCheckbox,
    submitBtn,
  };

  for (const [name, element] of Object.entries(formElements)) {
    if (!element) {
      console.error(`Form element ${name} is missing`);
      return;
    }
  }

  [
    phoneInput, emailInput, birthdateInput, 
    firstNameInput, lastNameInput, usernameInput
  ].forEach(initValidation);
  
  if (passwordInput) initValidation(passwordInput);
  if (confirmPasswordInput) initValidation(confirmPasswordInput);

  const addFieldValidation = (input, validator) => {
    input.addEventListener("blur", () => {
      markAsTouched(input);
      validateField(input, validator);
      validateForm();
    });

    input.addEventListener("input", () => {
      validateField(input, validator);
      validateForm();
    });
  };

  addFieldValidation(phoneInput, validatePhone);
  addFieldValidation(emailInput, validateEmail);
  addFieldValidation(birthdateInput, validateBirthdate);
  addFieldValidation(firstNameInput, value => value.trim() ? null : "validation_required");
  addFieldValidation(lastNameInput, value => value.trim() ? null : "validation_required");
  addFieldValidation(usernameInput, validateUsername);
  
  agreementCheckbox.addEventListener("change", () => {
    validateField(agreementCheckbox, checked => checked ? null : "validation_required");
    validateForm();
  });

  if (passwordInput && confirmPasswordInput) {
    addFieldValidation(passwordInput, validatePassword);
    
    confirmPasswordInput.addEventListener("blur", () => {
      markAsTouched(confirmPasswordInput);
      validateConfirmPasswordField();
      validateForm();
    });
    
    confirmPasswordInput.addEventListener("input", () => {
      validateConfirmPasswordField();
      validateForm();
    });
  }

  function validateField(field, validator) {
    const value = field.type === "checkbox" ? field.checked : field.value;
    const errorId = `${field.id}Error`;
    
    if (shouldValidate(field)) {
      const error = validator(value);
      setError(errorId, error);
    } else {
      setError(errorId, "");
    }
  }

  function validateConfirmPasswordField() {
    const errorId = "confirmPasswordError";
    
    if (shouldValidate(confirmPasswordInput)) {
      const error = validateConfirmPassword(
        passwordInput.value, 
        confirmPasswordInput.value
      );
      setError(errorId, error);
    } else {
      setError(errorId, "");
    }
  }

  generateUsernameBtn.addEventListener("click", async () => {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!firstName || !lastName) {
      setError("usernameError", getTranslation("validation_required_fields"));
      return;
    }

    usernameAttempts++;

    let newUsername;
    let attempts = 0;
    let isUnique = false;

    while (attempts < 10 && !isUnique) {
      newUsername = generateUsername(
        firstName,
        lastName,
        usernameAttempts + attempts
      );
      isUnique = !(await checkUsernameExists(newUsername));
      attempts++;
    }

    usernameInput.value = newUsername;
    markAsTouched(usernameInput);

    if (!isUnique) {
      setError("usernameError", getTranslation("username_generation_failed"));
    } else {
      setError("usernameError", "");
    }

    if (usernameAttempts >= 5) {
      generateUsernameBtn.disabled = true;
    }

    validateForm();
  });

  usernameInput.addEventListener("input", async () => {
    const username = usernameInput.value.trim();
    markAsTouched(usernameInput);
    
    if (username.length > 0) {
      const exists = await checkUsernameExists(username);
      setError("usernameError", exists ? getTranslation("username_taken") : "");
    } else {
      setError("usernameError", getTranslation("validation_required"));
    }
    validateForm();
  });

  passwordMethodSelect.addEventListener("change", (e) => {
    if (e.target.value === "manual") {
      manualPasswordFields.style.display = "block";
    } else {
      manualPasswordFields.style.display = "none";
      setError("passwordError", "");
      setError("confirmPasswordError", "");
    }
    validateForm();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = getTranslation("processing");

    try {
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();

      if (!validateForm()) return;

      const [usernameExists, emailExists, phoneExists] = await Promise.all([
        checkFieldExists("username", username),
        checkFieldExists("email", email),
        checkFieldExists("phone", phone),
      ]);

      if (usernameExists) {
        setError("usernameError", getTranslation("username_taken"));
        return;
      }

      if (emailExists) {
        setError("emailError", getTranslation("email_taken"));
        return;
      }

      if (phoneExists) {
        setError("phoneError", getTranslation("phone_taken"));
        return;
      }

      const userData = {
        phone: phone,
        email: email,
        birthdate: birthdateInput.value,
        password:
          passwordMethodSelect.value === "auto"
            ? generateAutoPassword()
            : passwordInput.value,
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        middleName: document.getElementById("middleName")?.value.trim() || "",
        username: username,
        agreement: agreementCheckbox.checked,
        registrationDate: new Date().toISOString(),
        role: "user",
      };

      const postResponse = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!postResponse.ok) throw new Error("Registration error");

      const createdUser = await postResponse.json();

      localStorage.setItem("currentUser", JSON.stringify(createdUser));
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "menu.html";

      showNotification(getTranslation("registration_success"), "success");
      form.reset();
      usernameAttempts = 0;
      generateUsernameBtn.disabled = false;

      document.querySelectorAll(".error-message").forEach((el) => {
        el.textContent = "";
      });
    } catch (error) {
      console.error("Error:", error);
      showNotification(getTranslation("registration_error"), "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  function validateForm() {
    let isValid = true;

    const fields = [
      {input: phoneInput, validator: validatePhone},
      {input: emailInput, validator: validateEmail},
      {input: birthdateInput, validator: validateBirthdate},
      {input: firstNameInput, validator: value => value.trim() ? null : "validation_required"},
      {input: lastNameInput, validator: value => value.trim() ? null : "validation_required"},
      {input: usernameInput, validator: validateUsername},
      {input: agreementCheckbox, validator: checked => checked ? null : "validation_required"}
    ];

    fields.forEach(({input, validator}) => {
      if (input && shouldValidate(input)) {
        const value = input.type === "checkbox" ? input.checked : input.value;
        const error = validator(value);
        if (error) {
          setError(`${input.id}Error`, error);
          isValid = false;
        } else {
          setError(`${input.id}Error`, "");
        }
      }
    });

    if (passwordMethodSelect.value === "manual" && 
        passwordInput && 
        confirmPasswordInput) {
          
      if (shouldValidate(passwordInput)) {
        const passwordError = validatePassword(passwordInput.value);
        setError("passwordError", passwordError);
        if (passwordError) isValid = false;
      }
      
      if (shouldValidate(confirmPasswordInput)) {
        const confirmError = validateConfirmPassword(
          passwordInput.value, 
          confirmPasswordInput.value
        );
        setError("confirmPasswordError", confirmError);
        if (confirmError) isValid = false;
      }
    }

    submitBtn.disabled = !isValid;
    return isValid;
  }

  function setError(elementId, errorKey) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(
      elementId.replace("Error", "")
    );

    if (!errorElement || !inputElement) return;

    if (errorKey) {
      const errorText =
        window.getCurrentText()?.[errorKey]?.[window.getCurrentLang()] ||
        getDefaultErrorText(errorKey);
      errorElement.textContent = errorText;
      errorElement.dataset.errorKey = errorKey;
      inputElement.classList.add("invalid");
      inputElement.classList.remove("valid");
    } else {
      errorElement.textContent = "";
      delete errorElement.dataset.errorKey;
      inputElement.classList.add("valid");
      inputElement.classList.remove("invalid");
    }
  }

  function getDefaultErrorText(key) {
    const defaultTexts = {
      validation_phone: "Некорректный номер телефона. Пример: +375291234567",
      validation_email: "Некорректный email. Пример: example@mail.com",
      validation_required: "Это поле обязательно для заполнения",
    };
    return defaultTexts[key] || key;
  }

  function getTranslation(key) {
    const currentText = window.getCurrentText?.() || {};
    const currentLang = window.getCurrentLang?.() || "en";
    return currentText[key]?.[currentLang] || key;
  }
});
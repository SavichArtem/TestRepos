const validationStates = new WeakMap();

export function initValidation(input) {
  validationStates.set(input, {
    touched: false,
    dirty: false,
  });
}

export function markAsTouched(input) {
  const state = validationStates.get(input);
  if (state) {
    state.touched = true;
    validationStates.set(input, state);
  }
}

export function markAsDirty(input) {
  const state = validationStates.get(input);
  if (state) {
    state.dirty = true;
    validationStates.set(input, state);
  }
}

export function setValidationState(inputElement, isValid, errorKey) {
  const errorElement = document.getElementById(`${inputElement.id}Error`);
  if (!errorElement) return;

  inputElement.classList.toggle("invalid", !isValid);
  inputElement.classList.toggle("valid", isValid);

  if (errorKey) {
    errorElement.textContent =
      window.getCurrentText()?.[errorKey]?.[window.getCurrentLang()] ||
      errorKey;
  } else {
    errorElement.textContent = "";
  }
}

export function shouldValidate(input) {
  const state = validationStates.get(input);
  return state ? state.touched || state.dirty : false;
}

export function validateUsername(username) {
  if (!username) return "validation_required";

  if (username.length < 3 || username.length > 20) {
    return "validation_username_length";
  }

  const regex = /^[a-zA-Z0-9_\-\.]+$/;
  if (!regex.test(username)) {
    return "validation_username_invalid";
  }

  return null;
}

export const validatePhone = (phone) => {
  if (!phone) return "validation_required";
  const regex = /^\+375(24|25|29|33|44)\d{7}$/;
  if (!regex.test(phone)) return "validation_phone";
  return null;
};

export const validateEmail = (email) => {
  if (!email) return "validation_required";

  if (!email.includes("@")) {
    return "validation_email_missing_at";
  }

  const parts = email.split("@");
  const localPart = parts[0];
  const domain = parts[1];

  if (/[а-яА-ЯЁё]/.test(localPart)) {
    return "validation_email_russian_chars";
  }

  if (!domain) {
    return "validation_email_invalid_domain";
  }

  if (!domain.includes(".")) {
    return "validation_email_missing_dot";
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "validation_email_invalid_domain";
  }

  return null;
};

export function validateBirthdate(birthdate) {
  if (!birthdate) return "validation_required";

  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 16) {
    return "validation_age";
  }
  return null;
}

export function validatePassword(password) {
  if (!password) return "validation_required";
  if (password.length < 8 || password.length > 20)
    return "validation_password_length";
  
  if (!/[A-ZА-ЯЁ]/.test(password)) return "validation_password_uppercase";
  if (!/[a-zа-яё]/.test(password)) return "validation_password_lowercase";
  if (!/\d/.test(password)) return "validation_password_digit";
  
  if (!/[^A-Za-z0-9А-Яа-яЁё]/.test(password)) 
    return "validation_password_special";
  
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "validation_required";
  if (password !== confirmPassword) return "validation_passwords_match";
  return null;
}

export function validateProduct(product) {
    const errors = {};
    
    if (!product.name || product.name.trim() === '') {
        errors.name = 'validation_required';
    } else if (product.name.length < 3) {
        errors.name = 'validation_name_min_length';
    } else if (product.name.length > 100) {
        errors.name = 'validation_name_max_length';
    }
    
    if (!product.nameKey || product.nameKey.trim() === '') {
        errors.nameKey = 'validation_required';
    } else if (!/^(starters|mains|pastries)_text\d+$/.test(product.nameKey)) {
        errors.nameKey = 'validation_name_key_format';
    }
    
    if (!product.description || product.description.trim() === '') {
        errors.description = 'validation_required';
    } else if (product.description.length < 10) {
        errors.description = 'validation_description_min_length';
    } else if (product.description.length > 500) {
        errors.description = 'validation_description_max_length';
    }
    
    if (!product.descriptionKey || product.descriptionKey.trim() === '') {
        errors.descriptionKey = 'validation_required';
    } else if (!/^(starters|mains|pastries)_text\d+$/.test(product.descriptionKey)) {
        errors.descriptionKey = 'validation_description_key_format';
    }
    
    if (!product.price || product.price.toString().trim() === '') {
        errors.price = 'validation_required';
    } else if (isNaN(product.price)) {
        errors.price = 'validation_price_numeric';
    } else if (parseFloat(product.price) <= 0) {
        errors.price = 'validation_price_min';
    } else if (parseFloat(product.price) > 1000) {
        errors.price = 'validation_price_max';
    }
    
    if (!product.image || product.image.trim() === '') {
        errors.image = 'validation_required';
    } else if (!/\.(jpg|jpeg|png|gif|svg)$/i.test(product.image)) {
        errors.image = 'validation_image_format';
    }
    
    return errors;
}

export function setFieldValidationState(fieldId, isValid, errorKey) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    const inputElement = document.getElementById(fieldId);
    
    if (!errorElement || !inputElement) return;
    
    inputElement.classList.toggle('invalid', !isValid);
    inputElement.classList.toggle('valid', isValid);
    
    if (errorKey) {
        errorElement.textContent = getTranslation(errorKey);
    } else {
        errorElement.textContent = '';
    }
}

function getTranslation(key) {
    const defaultTranslations = {
        'validation_required': 'This field is required',
        'validation_name_min_length': 'Name must be at least 3 characters',
        'validation_name_max_length': 'Name must be less than 100 characters',
        'validation_name_key_format': 'Must be starters_text#, mains_text# or pastries_text#',
        'validation_description_min_length': 'Description must be at least 10 characters',
        'validation_description_max_length': 'Description must be less than 500 characters',
        'validation_description_key_format': 'Must be starters_text#, mains_text# or pastries_text#',
        'validation_price_numeric': 'Price must be a number',
        'validation_price_min': 'Price must be greater than 0',
        'validation_price_max': 'Price must be less than $1000',
        'validation_image_format': 'Image URL must end with .jpg, .jpeg, .png, .gif or .svg'
    };
    
    const currentText = window.getCurrentText?.() || {};
    const currentLang = window.getCurrentLang?.() || 'en';
    
    return currentText[key]?.[currentLang] || defaultTranslations[key] || key;
}
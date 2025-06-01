import { validateProduct, setFieldValidationState } from '../authentication/validation.js';

export class AdminValidation {
  constructor(elements) {
    this.elements = elements;
  }

   validateField(fieldName) {
        const fieldElement = this.elements[`product${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`];
        if (!fieldElement) return;
        
        const fieldValue = fieldElement.value;
        const productData = { [fieldName]: fieldValue };
        const errors = validateProduct(productData);
        
        setFieldValidationState(
            `product${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
            !errors[fieldName],
            errors[fieldName]
        );
    }

  validateNameKeyPattern() {
        if (!this.elements.productCategory || !this.elements.productNameKey) return;
        
        const category = this.elements.productCategory.value;
        const nameKey = this.elements.productNameKey.value;
        
        if (nameKey && !nameKey.startsWith(`${category}_text`)) {
            this.elements.productNameKey.value = `${category}_text`;
            this.validateField('nameKey');
        }
    }

    validateDescriptionKeyPattern() {
        if (!this.elements.productCategory || !this.elements.productDescriptionKey) return;
        
        const category = this.elements.productCategory.value;
        const descriptionKey = this.elements.productDescriptionKey.value;
        
        if (descriptionKey && !descriptionKey.startsWith(`${category}_text`)) {
            this.elements.productDescriptionKey.value = `${category}_text`;
            this.validateField('descriptionKey');
        }
    }

    validateForm() {
        const productData = {
            name: this.elements.productName.value.trim(),
            nameKey: this.elements.productNameKey.value.trim(),
            description: this.elements.productDescription.value.trim(),
            descriptionKey: this.elements.productDescriptionKey.value.trim(),
            price: this.elements.productPrice.value,
            image: this.elements.productImage.value.trim(),
            category: this.elements.productCategory.value
        };
        
        const errors = validateProduct(productData);
        let isValid = true;
        
        for (const [field, error] of Object.entries(errors)) {
            const fieldId = `product${field.charAt(0).toUpperCase() + field.slice(1)}`;
            setFieldValidationState(fieldId, !error, error);
            
            if (error) {
                isValid = false;
            }
        }
        
        if (productData.nameKey && !productData.nameKey.startsWith(`${productData.category}_text`)) {
            setFieldValidationState('productNameKey', false, 'validation_name_key_format');
            isValid = false;
        }
        
        if (productData.descriptionKey && !productData.descriptionKey.startsWith(`${productData.category}_text`)) {
            setFieldValidationState('productDescriptionKey', false, 'validation_description_key_format');
            isValid = false;
        }
        
        return isValid;
    }

  updateSaveButtonState() {
        if (!this.elements.saveProductBtn) return;
        
        const isFormValid = this.isFormValid();
        this.elements.saveProductBtn.disabled = !isFormValid;
        
        if (isFormValid) {
            this.elements.saveProductBtn.classList.add('active');
            this.elements.saveProductBtn.classList.remove('inactive');
        } else {
            this.elements.saveProductBtn.classList.add('inactive');
            this.elements.saveProductBtn.classList.remove('active');
        }
    }

    isFormValid() {
        const requiredFields = [
            this.elements.productName,
            this.elements.productNameKey,
            this.elements.productDescription,
            this.elements.productDescriptionKey,
            this.elements.productPrice,
            this.elements.productImage
        ];
        
        for (const field of requiredFields) {
            if (!field || !field.value.trim()) {
                return false;
            }
        }
        
        const category = this.elements.productCategory.value;
        const nameKey = this.elements.productNameKey.value.trim();
        const descriptionKey = this.elements.productDescriptionKey.value.trim();
        
        if (!nameKey.startsWith(`${category}_text`) || !descriptionKey.startsWith(`${category}_text`)) {
            return false;
        }
        
        const errorMessages = document.querySelectorAll('.error-message');
        for (const error of errorMessages) {
            if (error.textContent.trim() !== '') {
                return false;
            }
        }
        
        if (isNaN(this.elements.productPrice.value)) {
            return false;
        }
        
        return true;
    }

  clearValidation() {
        const fields = [
            'productName',
            'productNameKey',
            'productDescription',
            'productDescriptionKey',
            'productPrice',
            'productImage'
        ];
        
        fields.forEach(field => {
            const errorElement = document.getElementById(`${field}Error`);
            const inputElement = document.getElementById(field);
            
            if (errorElement) errorElement.textContent = '';
            if (inputElement) {
                inputElement.classList.remove('invalid', 'valid');
            }
        });
        
        this.updateSaveButtonState();
    }
}
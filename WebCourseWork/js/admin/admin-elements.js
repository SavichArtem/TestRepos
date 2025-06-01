export class AdminElements {
  constructor() {
    this.initElements();
  }

  initElements() {
    this.elements = {
      productsList: document.getElementById('productsList'),
      addProductBtn: document.getElementById('addProductBtn'),
      productModal: document.getElementById('productModal'),
      confirmModal: document.getElementById('confirmModal'),
      productForm: document.getElementById('productForm'),
      modalTitle: document.getElementById('modalTitle'),
      productId: document.getElementById('productId'),
      productName: document.getElementById('productName'),
      productNameKey: document.getElementById('productNameKey'),
      productDescription: document.getElementById('productDescription'),
      productDescriptionKey: document.getElementById('productDescriptionKey'),
      productPrice: document.getElementById('productPrice'),
      productCategory: document.getElementById('productCategory'),
      productImage: document.getElementById('productImage'),
      saveProductBtn: document.getElementById('saveProductBtn'),
      cancelProductBtn: document.getElementById('cancelProductBtn'),
      confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
      cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
      logoutBtn: document.getElementById('logoutBtn'),
      confirmMessage: document.getElementById('confirmMessage')
    };
    return this.elements;
  }
  

   setupEventListeners() {
          // Основные обработчики
          if (this.elements.addProductBtn) {
              this.elements.addProductBtn.addEventListener('click', () => this.openAddModal());
          }
          
          if (this.elements.productForm) {
              this.elements.productForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
          }
          
          if (this.elements.cancelProductBtn) {
              this.elements.cancelProductBtn.addEventListener('click', () => this.closeModal());
          }
          
          if (this.elements.confirmDeleteBtn) {
              this.elements.confirmDeleteBtn.addEventListener('click', () => this.deleteProduct());
          }
          
          if (this.elements.cancelDeleteBtn) {
              this.elements.cancelDeleteBtn.addEventListener('click', () => this.closeConfirmModal());
          }
  
          // Обработчик для кнопки выхода
          if (this.elements.logoutBtn) {
              this.elements.logoutBtn.addEventListener('click', (e) => {
                  e.preventDefault();
                  this.logout();
              });
          }
  
          // Закрытие модальных окон по клику вне области
          document.addEventListener('click', (event) => {
              if (this.elements.productModal && event.target === this.elements.productModal) {
                  this.closeModal();
              }
              
              if (this.elements.confirmModal && event.target === this.elements.confirmModal) {
                  this.closeConfirmModal();
              }
          });
  
          // Валидация полей формы
          const fields = ['name', 'nameKey', 'description', 'descriptionKey', 'price', 'image'];
          fields.forEach(field => {
              const element = this.elements[`product${field.charAt(0).toUpperCase() + field.slice(1)}`];
              if (element) {
                  element.addEventListener('input', () => {
                      this.validateField(field);
                      this.updateSaveButtonState();
                  });
                  element.addEventListener('blur', () => {
                      this.validateField(field);
                      this.updateSaveButtonState();
                  });
              }
          });
  
          if (this.elements.productCategory) {
              this.elements.productCategory.addEventListener('change', () => {
                  this.validateNameKeyPattern();
                  this.validateDescriptionKeyPattern();
                  this.updateSaveButtonState();
              });
          }
      }
}
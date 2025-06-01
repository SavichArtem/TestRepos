import { showNotification } from '../notifications.js';
import { getTranslation } from '../admin/admin-translations.js';

export class AdminAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3000/menuItems';
  }

  async loadProducts() {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) throw new Error('Failed to load products');
      return await response.json();
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('Failed to load products', 'error');
      return [];
    }
  }

  async saveProduct(productData, isEdit, productId) {
    try {
      const url = isEdit ? `${this.baseUrl}/${productId}` : this.baseUrl;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error(isEdit ? 'Failed to update product' : 'Failed to add product');
      
      showNotification(
        getTranslation(isEdit ? 'product_updated' : 'product_added'),
        'success'
      );
      return true;
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification(
        isEdit ? 'Failed to update product' : 'Failed to add product', 
        'error'
      );
      return false;
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      showNotification(
        getTranslation('product_deleted'),
        'success'
      );
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Failed to delete product', 'error');
      return false;
    }
  }
}
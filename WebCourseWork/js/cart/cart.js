export class Cart {
  constructor(userId = 'guest') {
    this.userId = userId;
    this.items = [];
    if (userId === 'guest') {
      this.userId = `guest_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestId', this.userId);
    }
  }

  async init() {
    await this.loadFromServer();
  }

  async loadFromServer() {
    try {
      const response = await fetch(`http://localhost:3000/carts?userId=${this.userId}`);
      const carts = await response.json();
      this.items = carts[0]?.items || [];
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  async saveToServer() {
    try {
      const response = await fetch(`http://localhost:3000/carts`);
      const existingCarts = await response.json();
      const userCart = existingCarts.find(c => c.userId === this.userId);

      if (userCart) {
        await fetch(`http://localhost:3000/carts/${userCart.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.userId,
            items: this.items
          })
        });
      } else {
        await fetch(`http://localhost:3000/carts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.userId,
            items: this.items
          })
        });
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  async addItem(item, quantity = 1) {
    const existingItem = this.items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...item, quantity });
    }
    await this.saveToServer();
  }

  async removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    await this.saveToServer();
  }

  async updateQuantity(itemId, newQuantity) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = newQuantity;
      await this.saveToServer();
    }
  }

  async clearCart() {
  try {
    const response = await fetch(`http://localhost:3000/carts?userId=${this.userId}`);
    const carts = await response.json();
    const userCart = carts[0];
    
    if (userCart) {
      const deleteResponse = await fetch(`http://localhost:3000/carts/${userCart.id}`, {
        method: 'DELETE'
      });
      if (!deleteResponse.ok) throw new Error('Delete failed');
    }
    
    this.items = [];
    await this.saveToServer();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItems() {
    return this.items;
  }
}
import { Cart } from './cart.js';
import { setupCartModal, showCartModal } from './cart-modal.js';

function updateCartCounter(cart) {
    const headerBasketBtn = document.querySelector('.header-basket-btn');
    if (!headerBasketBtn) return;

    let counter = headerBasketBtn.querySelector('.cart-counter');
    const totalItems = cart.getItems().reduce((sum, item) => sum + item.quantity, 0);

    if (!counter) {
        counter = document.createElement('span');
        counter.className = 'cart-counter';
        headerBasketBtn.appendChild(counter);
    }

    if (totalItems > 0) {
        counter.textContent = totalItems;
        counter.style.display = 'flex';
        
        counter.classList.add('pulse');
        setTimeout(() => counter.classList.remove('pulse'), 500);
    } else {
        counter.style.display = 'none';
    }
}

export async function initCart() {
    const userId = localStorage.getItem('currentUser') 
        ? JSON.parse(localStorage.getItem('currentUser')).id 
        : localStorage.getItem('guestId') || 'guest';
    
    const cart = new Cart(userId);
    
    try {
        await cart.init();
    } catch (error) {
        console.error('Failed to initialize cart:', error);
    }

    setupCartModal(cart);
    updateCartCounter(cart);
    
    const headerBasketBtn = document.querySelector('.header-basket-btn');
    if (headerBasketBtn) {
        headerBasketBtn.addEventListener('click', () => {
            showCartModal(cart);
        });
    }
    
    return cart;
}

(async () => {
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    await initCart();
})();
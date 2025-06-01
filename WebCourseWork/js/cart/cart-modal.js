export function setupCartModal(cart) {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.style.display = 'none';
    
    /* Получение текущего языка и текста */
    const currentLang = window.getCurrentLang?.() || 'en';
    const currentText = window.getCurrentText?.() || {};
    
    modal.innerHTML = `
        <div class="cart-modal-content">
            <span class="cart-close-btn">&times;</span>
            <h2 data-lang="cart_title">${currentText['cart_title']?.[currentLang] || 'Your Cart'}</h2>
            <div class="cart-items-container"></div>
            <div class="cart-total">
                <span data-lang="cart_total">${currentText['cart_total']?.[currentLang] || 'Total:'}</span>
                <span class="total-price">$${cart.getTotalPrice()}</span>
            </div>
            <button type="button" class="checkout-btn" data-lang="cart_checkout">${currentText['cart_checkout']?.[currentLang] || 'Checkout'}</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    /* Обработчики событий */
    const closeBtn = modal.querySelector('.cart-close-btn');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    const checkoutBtn = modal.querySelector('.checkout-btn');
checkoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    await checkout(cart);
});
    
    /* Закрытие при клике вне модального окна */
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

export function showCartModal(cart) {
    const modal = document.querySelector('.cart-modal');
    updateCartModal(cart);
    modal.style.display = 'block';
}

export function updateCartModal(cart) {
    const modal = document.querySelector('.cart-modal');
    const itemsContainer = modal.querySelector('.cart-items-container');
    const totalPriceElement = modal.querySelector('.total-price');
    
    /* Получение текущего языка и текста */
    const currentLang = window.getCurrentLang?.() || 'en';
    const currentText = window.getCurrentText?.() || {};
    
    itemsContainer.innerHTML = '';
    
    if (cart.getItems().length === 0) {
        const emptyText = currentText['cart_empty']?.[currentLang] || 'Your cart is empty';
        itemsContainer.innerHTML = `<p>${emptyText}</p>`;
        totalPriceElement.textContent = '$0';
        return;
    }
    
    cart.getItems().forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        /* переведенное название товара */
        const itemName = currentText[item.nameKey]?.[currentLang] || item.name;
        
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h3>${itemName}</h3>
                <p>$${item.price} x ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <input type="number" min="1" value="${item.quantity}" class="cart-item-quantity">
                <button class="cart-item-remove" data-id="${item.id}">
                    <img src="./assets/trash-icon.svg" alt="Remove">
                </button>
            </div>
        `;
        
        const quantityInput = itemElement.querySelector('.cart-item-quantity');
        quantityInput.addEventListener('change', async (e) => {
            e.preventDefault();
            e.stopPropagation();  
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity > 0) {
                try {
                    await cart.updateQuantity(item.id, newQuantity);
                    updateCartModal(cart);
                } catch (error) {
                    console.error('Update quantity error:', error);
                    e.target.value = item.quantity;
                }
            }
        });
        
        const removeBtn = itemElement.querySelector('.cart-item-remove');
        removeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                await cart.removeItem(item.id);
                updateCartModal(cart);
            } catch (error) {
                console.error('Remove item error:', error);
            }
        });
        
        itemsContainer.appendChild(itemElement);
    });
    
    totalPriceElement.textContent = `$${cart.getTotalPrice()}`;
}

async function checkout(cart) {
  if (cart.getItems().length === 0) return;
  
  try {
    /* Создание заказа */
    await fetch(`http://localhost:3000/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: cart.userId,
        items: cart.getItems(),
        total: cart.getTotalPrice(),
        date: new Date().toISOString()
      })
    });
    
    /* Очистка корзины (ожидание завершения)*/
    await cart.clearCart();
    
    /* Обновление UI */
    updateCartModal(cart);
    document.querySelector('.cart-modal').style.display = 'none';
    
    const headerBasket = document.querySelector('.header-basket-btn');
    headerBasket.dataset.count = '0';
    
    showSuccessNotification();
  } catch (error) {
    console.error('Checkout error:', error);
    showErrorNotification();
  }

  /* Всплывающее окно после покупки*/
  function showSuccessNotification() {
  const currentLang = window.getCurrentLang?.() || 'en';
  const messages = {
    en: 'Thank you for your purchase!',
    ru: 'Спасибо за покупку!'
  };
  
  const notification = document.createElement('div');
  notification.className = 'checkout-notification success';
  notification.textContent = messages[currentLang];
  
  document.body.appendChild(notification);
  
  /* Автоматическое исчезновение через 3 секунды */
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

/* Функция для показа ошибки*/
function showErrorNotification() {
  const currentLang = window.getCurrentLang?.() || 'en';
  const messages = {
    en: 'Checkout failed. Please try again.',
    ru: 'Ошибка оформления заказа. Пожалуйста, попробуйте ещё раз.'
  };
  
  const notification = document.createElement('div');
  notification.className = 'checkout-notification error';
  notification.textContent = messages[currentLang];
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
}
import { filterItems, sortItems, groupItemsByCategory } from './filters.js';
import { showCartModal, updateCartModal } from '../cart/cart-modal.js';

export async function loadMenuItems(filters) {
    try {
        let url = 'http://localhost:3000/menuItems?';
        
        if (filters.category !== 'all') { /* Добавление параметров фильтрации */
            url += `category=${filters.category}&`;
        }
        
        if (filters.minPrice !== null) {
            url += `price_gte=${filters.minPrice}&`;
        }
        
        if (filters.maxPrice !== null) {
            url += `price_lte=${filters.maxPrice}&`;
        }
        
        if (filters.sort) { /* Добавление параметров сортировки */
            const [field, order] = filters.sort.split('_');
            url += `_sort=${field}&_order=${order}&`;
        }
        
        url = url.replace(/&$/, ''); /* Удаляение последнего символа & если он есть */
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error loading menu items:', error);
        return [];
    }
}

function renderItems(items, containerSelector, cart) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '';
    
    const currentLang = window.getCurrentLang?.() || 'en';
    const currentText = window.getCurrentText?.() || {};
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu_item';
        
        const name = currentText[item.nameKey]?.[currentLang] || item.name;
        const description = currentText[item.descriptionKey]?.[currentLang] || item.description;
        
        itemElement.innerHTML = `
            <button type="button" class="product_basket-btn">
                <img src="./assets/basket.png" alt="basket" class="product_basket">
            </button>
            <h4><span>$</span>${item.price}</h4>
            <img src="./assets/MenuPage_line.png" alt="MenuLine" class="menu_line"/>
            <h2 data-lang="${item.nameKey}">${name}</h2>
            <p data-lang="${item.descriptionKey}">${description}</p>
        `;
        
        const basketBtn = itemElement.querySelector('.product_basket-btn');
basketBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  
  try {
    await cart.addItem(item);
    updateCartModal(cart);
    
    const basketBtn = document.querySelector('.header-basket-btn');
    const totalItems = cart.getItems().reduce((sum, item) => sum + item.quantity, 0);
    basketBtn.dataset.count = totalItems;
  } catch (error) {
    console.error('Error adding item:', error);
  }
});
        
        container.appendChild(itemElement);
    });
}

function adjustSectionHeight(section, itemsCount) {
    const baseHeight = 60; /* Базовая высота в rem */
    const itemHeight = 20; /* Высота одного элемента в rem */
    const padding = 40; /* Отступы в rem */
    
    const neededHeight = baseHeight + (Math.max(0, itemsCount - 3) * itemHeight) + padding;
    section.style.height = `${neededHeight}rem`;
}

export async function displayMenuItems(filters, cart) {
    const menuItems = await loadMenuItems(filters);
    let filteredItems = filterItems(menuItems, filters);
    filteredItems = sortItems(filteredItems, filters.sort);
    const groupedItems = groupItemsByCategory(filteredItems);

    /* Элементы DOM */
    const startersSection = document.querySelector('.starters_section');
    const mainsSection = document.querySelector('.mains_section');
    const pastriesSection = document.querySelector('.pastries_and_drinks_section');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    document.querySelectorAll('.menu_content-body, .menu_content-body-inverted, .menu_content-body-pastries').forEach(container => {
        container.innerHTML = '';
    });
    
    startersSection.style.display = 'none';
    mainsSection.style.display = 'none';
    pastriesSection.style.display = 'none';
    noResultsMessage.style.display = 'none';
    
    if (filteredItems.length === 0) {
        noResultsMessage.style.display = 'block';
        return;
    }

    const categories = {
        starters: {
            section: startersSection,
            container: '.menu_content-body',
            items: groupedItems.starters || []
        },
        mains: {
            section: mainsSection,
            container: '.menu_content-body-inverted',
            items: groupedItems.mains || []
        },
        pastries: {
            section: pastriesSection,
            container: '.menu_content-body-pastries',
            items: groupedItems.pastries || []
        }
    };

    Object.entries(categories).forEach(([category, data]) => {
        if (data.items.length > 0 && (filters.category === 'all' || filters.category === category)) {
            data.section.style.display = 'block';
            renderItems(data.items, data.container, cart);
            adjustSectionHeight(data.section, data.items.length);
        }
    });
}
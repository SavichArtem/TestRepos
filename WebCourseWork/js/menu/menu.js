import { initializeFilters } from './filters.js';
import { loadMenuItems, displayMenuItems } from './menu-display.js';
import { setupEventListeners } from './event-listeners.js';
import { initCart } from '../cart/init-cart.js';

document.addEventListener('DOMContentLoaded', async function() {
    const currentFilters = initializeFilters();
    const cart = await initCart();

    async function initMenu() {
        await displayMenuItems(currentFilters, cart);
    }
    
    setupEventListeners(currentFilters, initMenu);
    await initMenu();
});
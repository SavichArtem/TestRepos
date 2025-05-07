document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const sortSelect = document.getElementById('sortSelect');
    const categoryButtons = document.querySelectorAll('.category_btn');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyPriceRange = document.getElementById('applyPriceRange');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    // Секции меню
    const startersSection = document.querySelector('.starters_section');
    const mainsSection = document.querySelector('.mains_section');
    const pastriesSection = document.querySelector('.pastries_and_drinks_section');
    
    // Текущие параметры фильтрации
    let currentFilters = {
        category: 'all',
        searchQuery: '',
        sort: '',
        minPrice: null,
        maxPrice: null
    };
    
    // Загрузка данных из JSON
    async function loadMenuItems() {
        try {
            let url = 'http://localhost:3000/menuItems?';
            
            // Добавляем параметры фильтрации
            if (currentFilters.category !== 'all') {
                url += `category=${currentFilters.category}&`;
            }
            
            if (currentFilters.minPrice !== null) {
                url += `price_gte=${currentFilters.minPrice}&`;
            }
            
            if (currentFilters.maxPrice !== null) {
                url += `price_lte=${currentFilters.maxPrice}&`;
            }
            
            // Добавляем параметры сортировки
            if (currentFilters.sort) {
                const [field, order] = currentFilters.sort.split('_');
                url += `_sort=${field}&_order=${order}&`;
            }
            
            // Удаляем последний символ & если он есть
            url = url.replace(/&$/, '');
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error loading menu items:', error);
            return [];
        }
    }
    
    // Отображение товаров
    async function displayMenuItems() {
        const menuItems = await loadMenuItems();
        let filteredItems = filterItems(menuItems);
        filteredItems = sortItems(filteredItems);
        const groupedItems = groupItemsByCategory(filteredItems);
    
        // Очищаем существующие карточки
        document.querySelectorAll('.menu_content-body, .menu_content-body-inverted, .menu_content-body-pastries').forEach(container => {
            container.innerHTML = '';
        });
    
        // Полностью скрываем все секции сначала
        startersSection.style.display = 'none';
        mainsSection.style.display = 'none';
        pastriesSection.style.display = 'none';
        noResultsMessage.style.display = 'none';
    
        // Проверяем есть ли товары вообще
        if (filteredItems.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }
    
        // Обрабатываем каждую категорию
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
    
        // Отображаем только те секции, у которых есть товары
        Object.entries(categories).forEach(([category, data]) => {
            if (data.items.length > 0 && (currentFilters.category === 'all' || currentFilters.category === category)) {
                data.section.style.display = 'block';
                renderItems(data.items, data.container);
                
                // Динамически подстраиваем высоту секции
                adjustSectionHeight(data.section, data.items.length);
            }
        });
    }

    function adjustSectionHeight(section, itemsCount) {
    const baseHeight = 60; // Базовая высота в rem
    const itemHeight = 20; // Высота одного элемента в rem
    const padding = 40; // Отступы в rem
    
    // Рассчитываем новую высоту
    const neededHeight = baseHeight + (Math.max(0, itemsCount - 3) * itemHeight) + padding;
    section.style.height = `${neededHeight}rem`;
}
    
    // Фильтрация товаров
    function filterItems(items) {
        return items.filter(item => {
            // Фильтр по категории
            if (currentFilters.category !== 'all' && item.category !== currentFilters.category) {
                return false;
            }
            
            // Фильтр по поисковому запросу
            if (currentFilters.searchQuery && 
                !item.name.toLowerCase().includes(currentFilters.searchQuery.toLowerCase()) &&
                !item.description.toLowerCase().includes(currentFilters.searchQuery.toLowerCase())) {
                return false;
            }
            
            // Фильтр по цене
            if (currentFilters.minPrice !== null && item.price < currentFilters.minPrice) {
                return false;
            }
            
            if (currentFilters.maxPrice !== null && item.price > currentFilters.maxPrice) {
                return false;
            }
            
            return true;
        });
    }
    
    // Сортировка товаров
    function sortItems(items) {
        if (!currentFilters.sort) return items;
        
        const [field, order] = currentFilters.sort.split('_');
        
        return [...items].sort((a, b) => {
            let comparison = 0;
            
            if (field === 'price') {
                comparison = a.price - b.price;
            } else if (field === 'name') {
                comparison = a.name.localeCompare(b.name);
            }
            
            return order === 'asc' ? comparison : -comparison;
        });
    }
    
    // Группировка товаров по категориям
    function groupItemsByCategory(items) {
        return items.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
    }
    
    // Рендеринг товаров в секции
    function renderItems(items, containerSelector) {
        const container = document.querySelector(containerSelector);
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu_item';
            itemElement.innerHTML = `
                <img src="./assets/basket.png" alt="basket" class="product_basket">
                <h4><span>$</span>${item.price}</h4>
                <img src="./assets/MenuPage_line.png" alt="MenuLine" class="menu_line"/>
                <h2 data-lang="${item.nameKey}">${item.name}</h2>
                <p data-lang="${item.descriptionKey}">${item.description}</p>
            `;
            container.appendChild(itemElement);
        });
    }
    
    // Обработчики событий
    searchButton.addEventListener('click', () => {
        currentFilters.searchQuery = searchInput.value.trim();
        displayMenuItems();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.searchQuery = searchInput.value.trim();
            displayMenuItems();
        }
    });
    
    sortSelect.addEventListener('change', () => {
        currentFilters.sort = sortSelect.value;
        displayMenuItems();
    });
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilters.category = button.dataset.category;
            displayMenuItems();
        });
    });
    
    applyPriceRange.addEventListener('click', () => {
        currentFilters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        currentFilters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        displayMenuItems();
    });
    
    // Инициализация
    displayMenuItems();
});
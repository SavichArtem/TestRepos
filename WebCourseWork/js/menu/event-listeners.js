export function setupEventListeners(filters, refreshCallback) {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const sortSelect = document.getElementById('sortSelect');
    const categoryButtons = document.querySelectorAll('.category_btn');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyPriceRange = document.getElementById('applyPriceRange');
    
    /* Поиск */
    searchButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  filters.searchQuery = searchInput.value.trim();
  refreshCallback();
});
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filters.searchQuery = searchInput.value.trim();
            refreshCallback();
        }
    });
    
    /* Сортировка */
    sortSelect.addEventListener('change', () => {
        filters.sort = sortSelect.value;
        refreshCallback();
    });
    
    /* Категории */
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filters.category = button.dataset.category;
            refreshCallback();
        });
    });
    
    /* Фильтр по цене */
    applyPriceRange.addEventListener('click', () => {
        filters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        filters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        refreshCallback();
    });

    document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', e => e.preventDefault());
});
    
}
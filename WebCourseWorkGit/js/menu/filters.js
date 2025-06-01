export function initializeFilters() {
    return {
        category: 'all',
        searchQuery: '',
        sort: '',
        minPrice: null,
        maxPrice: null
    };
}

export function filterItems(items, filters) {
    const currentLang = window.getCurrentLang?.() || 'en';
    const currentText = window.getCurrentText?.() || {};
    
    return items.filter(item => {
        /* Фильтрация по категории */
        if (filters.category !== 'all' && item.category !== filters.category) {
            return false;
        }
        
        /* Фильтрация по поисковому запросу */
        if (filters.searchQuery) {
            const searchTerm = filters.searchQuery.toLowerCase();
            const name = currentText[item.nameKey]?.[currentLang] || item.name;
            const description = currentText[item.descriptionKey]?.[currentLang] || item.description;
            
            if (!name.toLowerCase().includes(searchTerm) &&
                !description.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }
        
        /* Фильтрация по цене */
        if (filters.minPrice !== null && item.price < filters.minPrice) {
            return false;
        }
        
        if (filters.maxPrice !== null && item.price > filters.maxPrice) {
            return false;
        }
        
        return true;
    });
}

export function sortItems(items, sortOption) {
    if (!sortOption) return items;
    
    const [field, order] = sortOption.split('_');
    const currentLang = window.getCurrentLang?.() || 'en';
    const currentText = window.getCurrentText?.() || {};
    
    return [...items].sort((a, b) => {
        let comparison = 0;
        
        if (field === 'price') {
            comparison = a.price - b.price;
        } else if (field === 'name') {
            const nameA = currentText[a.nameKey]?.[currentLang] || a.name;
            const nameB = currentText[b.nameKey]?.[currentLang] || b.name;
            comparison = nameA.localeCompare(nameB);
        }
        
        return order === 'asc' ? comparison : -comparison;
    });
}

export function groupItemsByCategory(items) {
    return items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});
}
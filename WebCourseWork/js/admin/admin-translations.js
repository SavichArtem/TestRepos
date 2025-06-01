export function getTranslation(key) {
  try {
    
    if (typeof window.getCurrentText === 'function') {
      const translations = window.getCurrentText();
      if (translations && translations[key]) {
        const lang = window.getCurrentLang ? window.getCurrentLang() : 'en' || 'ru';
        return translations[key][lang] || fallbackTranslations[key][lang] || key;
      }
    }
    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    return fallbackTranslations[key]?.[lang] || key;
  } catch (error) {
    console.error('Translation error:', error);
    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    return fallbackTranslations[key]?.[lang] || key;
  }
}



export const fallbackTranslations = {
  'no_products': {
    'en': 'No products found',
    'ru': 'Товары не найдены'
  },
  'edit': {
    'en': 'Edit',
    'ru': 'Редактировать'
  },
  'delete': {
    'en': 'Delete',
    'ru': 'Удалить'
  },
  'add_product': {
    'en': 'Add Product',
    'ru': 'Добавить товар'
  },
  'edit_product': {
    'en': 'Edit Product',
    'ru': 'Редактировать товар'
  },
  'product_added': {
    'en': 'Product added successfully',
    'ru': 'Товар успешно добавлен'
  },
  'product_updated': {
    'en': 'Product updated successfully',
    'ru': 'Товар успешно обновлен'
  },
  'product_deleted': {
    'en': 'Product deleted successfully',
    'ru': 'Товар успешно удален'
  },
  'confirm_delete': {
    'en': 'Are you sure you want to delete this product?',
    'ru': 'Вы уверены, что хотите удалить этот товар?'
  },
      "starters_text3": {
    "en": "Grilled Okra and Tomatoes",
    "ru": "Запеченная бамия с томатами"
  },
  "starters_text4": {
    "en": "Fresh grilled vegetables with herbs",
    "ru": "Свежие запеченные овощи с травами"
  },
};
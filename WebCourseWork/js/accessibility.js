document.addEventListener('DOMContentLoaded', function() {
  const panel = document.getElementById('accessibilityPanel');
  const toggleBtn = document.querySelector('.poor-vision-version-btn');
  const closeBtn = document.querySelector('.accessibility-close');
  const enableBtn = document.getElementById('accessibilityToggle');
  
  let currentFontSize = 'medium';
  let currentColorScheme = 'white-black';
  let currentImages = 'on';
  let isEnabled = false;
  
  const defaultPanelClass = 'default-panel';
  
  function applyDefaultPanelStyle() {
    panel.classList.remove('color-black-white', 'color-black-green', 'color-white-black');
    panel.classList.add(defaultPanelClass);
  }
  
  function updateAccessibilityButtonText() {
    const currentText = window.getCurrentText();
    const currentLang = window.getCurrentLang();
    
    if (isEnabled) {
      enableBtn.textContent = currentText.accessibility_disable?.[currentLang] || 
        (currentLang === 'ru' ? 'Выключить версию для слабовидящих' : 'Disable Accessibility Version');
    } else {
      enableBtn.textContent = currentText.accessibility_enable?.[currentLang] || 
        (currentLang === 'ru' ? 'Включить версию для слабовидящих' : 'Enable Accessibility Version');
    }
  }
  
  applyDefaultPanelStyle();
  
  // Открытие панели
  toggleBtn.addEventListener('click', function() {
    panel.classList.add('active');
  });
  
  // Закрытие панели
  closeBtn.addEventListener('click', function() {
    panel.classList.remove('active');
    resetAccessibilitySettings();
  });
  
  // Включение/выключение версии для слабовидящих
  enableBtn.addEventListener('click', function() {
    isEnabled = !isEnabled;
    
    updateAccessibilityButtonText();
    
    if (isEnabled) {
      applyAccessibilitySettings();
    } else {
      resetAccessibilitySettings();
      applyDefaultPanelStyle();
    }
  });
  
  // Размер шрифта
  const fontButtons = document.querySelectorAll('.font-size-btn');
  fontButtons.forEach(button => {
    button.addEventListener('click', function() {
      fontButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentFontSize = this.dataset.size;
      
      if (isEnabled) {
        applyFontSize();
      }
    });
  });
  
  // Цветовая схема
  const colorButtons = document.querySelectorAll('.color-scheme-btn');
  colorButtons.forEach(button => {
    button.addEventListener('click', function() {
      colorButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentColorScheme = this.dataset.scheme;
      
      if (isEnabled) {
        applyColorScheme();
      }
      
      updatePanelAppearance();
    });
  });
  
  // Изображения
  const imageButtons = document.querySelectorAll('.images-btn');
  imageButtons.forEach(button => {
    button.addEventListener('click', function() {
      imageButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentImages = this.dataset.images;
      
      if (isEnabled) {
        applyImages();
      }
    });
  });
  
  function applyAccessibilitySettings() {
    // специальные стили
    document.body.classList.add('accessibility-enabled');
    
    applyFontSize();
    applyColorScheme();
    applyImages();
  }
  
  function applyFontSize() {
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
    
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${currentFontSize}`);
  }
  
  function applyColorScheme() {
    document.body.classList.remove('color-black-white', 'color-black-green', 'color-white-black');
    document.body.classList.add(`color-${currentColorScheme}`);
    updatePanelAppearance();
  }
  
  function wrapImageWithContainer(img) {
    if (img.parentElement.classList.contains('image-container')) return;
    
    const container = document.createElement('div');
    container.className = 'image-container';
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    
    const altText = img.getAttribute('alt') || 'Изображение';
    const label = document.createElement('div');
    label.className = 'image-alt-label';
    label.textContent = altText;
    
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    container.appendChild(label);
  }

  function applyImages() {
    if (currentImages === 'off') {
      // контейнеры с надписями
      document.querySelectorAll('img:not(.accessibility-ignore):not(.accessibility-keep)').forEach(img => {
        if (img.parentElement.classList.contains('image-container')) return;
        
        const altText = img.getAttribute('alt') || 'Изображение';
        const container = document.createElement('div');
        container.className = 'image-container';
        container.style.position = 'relative';
        
        const label = document.createElement('div');
        label.className = 'image-alt-label';
        label.textContent = altText;
        
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(label);
      });
      
      // Скрытие игнорируемых изображений
      document.querySelectorAll('img.accessibility-ignore').forEach(img => {
        img.style.display = 'none';
      });
      
      document.body.classList.add('images-off');
    } else {
      // Восстановление обычного режима
      document.body.classList.remove('images-off');
      
      // Удаление контейнеров
      document.querySelectorAll('.image-container').forEach(container => {
        const img = container.querySelector('img');
        if (img) {
          container.parentNode.insertBefore(img, container);
        }
        container.remove();
      });
      
      // Показать скрытые изображения
      document.querySelectorAll('img.accessibility-ignore').forEach(img => {
        img.style.display = '';
      });
    }
  }
  
  // Обновление внешнего вида панели
  function updatePanelAppearance() {
    panel.classList.remove('color-black-white', 'color-black-green', 'color-white-black', defaultPanelClass);
    
    if (isEnabled) {
      panel.classList.add(`color-${currentColorScheme}`);
    } else {
      applyDefaultPanelStyle();
    }
  }
  
  // Сброс настроек
  function resetAccessibilitySettings() {
    isEnabled = false;
    
    // Сбров классов
    document.body.classList.remove(
      'font-small', 'font-medium', 'font-large',
      'color-black-white', 'color-black-green', 'color-white-black',
      'images-off',
      'accessibility-enabled'
    );
    
    // Сброс активных кнопок
    document.querySelector('.font-size-btn[data-size="medium"]').classList.add('active');
    document.querySelectorAll('.font-size-btn:not([data-size="medium"])').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelector('.color-scheme-btn[data-scheme="white-black"]').classList.add('active');
    document.querySelectorAll('.color-scheme-btn:not([data-scheme="white-black"])').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelector('.images-btn[data-images="on"]').classList.add('active');
    document.querySelector('.images-btn[data-images="off"]').classList.remove('active');
    
    updateAccessibilityButtonText();
    
    currentFontSize = 'medium';
    currentColorScheme = 'white-black';
    currentImages = 'on';
    
    applyDefaultPanelStyle();

    document.querySelectorAll('.image-container').forEach(container => {
      const img = container.querySelector('img');
      if (img) {
        container.parentNode.insertBefore(img, container);
      }
      container.remove();
    });
    
    // Отображение скрытых изображений
    document.querySelectorAll('img').forEach(img => {
      img.style.display = '';
    });
  }
  
  // Сброс настроек при перезагрузке страницы
  window.addEventListener('beforeunload', resetAccessibilitySettings);
  
  window.updateAccessibilityButtonText = updateAccessibilityButtonText;
  
  updateAccessibilityButtonText();
});
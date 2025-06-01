export function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <span class="notification-icon ${type}-icon"></span>
        <span class="notification-text">${message}</span>
    `;

  document.body.appendChild(notification);

  /* Анимация появления */
  setTimeout(() => notification.classList.add("show"), 10);

  /* Автоматическое скрытие */
  setTimeout(() => {
    notification.classList.remove("show");
    notification.classList.add("hide");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

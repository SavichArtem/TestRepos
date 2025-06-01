import { validateEmail } from "../authentication/validation.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      document.getElementById("loginEmailError").textContent = "";
      document.getElementById("loginPasswordError").textContent = "";
      document.getElementById("loginGeneralError").textContent = "";

      const email = document
        .getElementById("loginEmail")
        .value.trim()
        .toLowerCase();
      const password = document.getElementById("loginPassword").value.trim();

      let isValid = true;

      if (!email) {
        document.getElementById("loginEmailError").textContent =
          window.getCurrentText().validation_required[window.getCurrentLang()];
        document.getElementById("loginEmail").classList.add("invalid");
        isValid = false;
      } else {
        const emailError = validateEmail(email);
        if (emailError) {
          document.getElementById("loginEmailError").textContent =
            window.getCurrentText()[emailError]?.[window.getCurrentLang()] ||
            emailError;
          document.getElementById("loginEmail").classList.add("invalid");
          isValid = false;
        } else {
          document.getElementById("loginEmail").classList.add("valid");
        }
      }

      if (!password) {
        document.getElementById("loginPasswordError").textContent =
          window.getCurrentText().validation_required[window.getCurrentLang()];
        document.getElementById("loginPassword").classList.add("invalid");
        isValid = false;
      } else {
        document.getElementById("loginPassword").classList.add("valid");
      }

      if (!isValid) return;

      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) throw new Error("Ошибка сети");

        const users = await response.json();
        const user = users.find(
          (u) => u.email.toLowerCase() === email && u.password === password
        );

        if (user) {
          const guestId = localStorage.getItem("guestId");
          if (guestId) {
            await transferCart(guestId, user.id);
            localStorage.removeItem("guestId");
          }

          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.setItem("isLoggedIn", "true");
          window.location.href = "main.html";
        } else {
          document.getElementById("loginGeneralError").textContent =
            window.getCurrentText().login_error[window.getCurrentLang()];
        }
      } catch (error) {
        console.error("Ошибка при входе:", error);
        document.getElementById("loginGeneralError").textContent =
          window.getCurrentText().login_failed[window.getCurrentLang()];
      }
    });

    document.getElementById("loginEmail").addEventListener("input", (e) => {
      const email = e.target.value.trim();
      const errorElement = document.getElementById("loginEmailError");

      if (!email) {
        errorElement.textContent = "";
        e.target.classList.remove("invalid", "valid");
        return;
      }

      const error = validateEmail(email);
      if (error) {
        errorElement.textContent =
          window.getCurrentText()[error]?.[window.getCurrentLang()] || error;
        e.target.classList.add("invalid");
        e.target.classList.remove("valid");
      } else {
        errorElement.textContent = "";
        e.target.classList.add("valid");
        e.target.classList.remove("invalid");
      }
    });

    document.getElementById("loginPassword").addEventListener("input", (e) => {
      const password = e.target.value.trim();
      const errorElement = document.getElementById("loginPasswordError");

      if (!password) {
        errorElement.textContent = "";
        e.target.classList.remove("invalid", "valid");
        return;
      }

      errorElement.textContent = "";
      e.target.classList.add("valid");
      e.target.classList.remove("invalid");
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "main.html";
    });
  }
});

async function transferCart(fromUserId, toUserId) {
  try {
    /* Получение гостевой корзины */
    const response = await fetch(
      `http://localhost:3000/carts?userId=${fromUserId}`
    );
    const carts = await response.json();
    const guestCart = carts[0];

    if (guestCart && guestCart.items.length > 0) {
      /* Получение пользовательской корзины */
      const userResponse = await fetch(
        `http://localhost:3000/carts?userId=${toUserId}`
      );
      const userCarts = await userResponse.json();
      const userCart = userCarts[0];

      if (userCart) {
        /* Объединение корзин */
        const mergedItems = [...userCart.items];
        guestCart.items.forEach((guestItem) => {
          const existingItem = mergedItems.find(
            (item) => item.id === guestItem.id
          );
          if (existingItem) {
            existingItem.quantity += guestItem.quantity;
          } else {
            mergedItems.push(guestItem);
          }
        });

        /* Обновление пользовательской корзины */
        await fetch(`http://localhost:3000/carts/${userCart.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: toUserId,
            items: mergedItems,
          }),
        });
      } else {
        /* Создание новой корзины для пользователя */
        await fetch(`http://localhost:3000/carts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: toUserId,
            items: guestCart.items,
          }),
        });
      }

      /* Удаление гостевой корзины */
      await fetch(`http://localhost:3000/carts/${guestCart.id}`, {
        method: "DELETE",
      });
    }
  } catch (error) {
    console.error("Error transferring cart:", error);
  }
}
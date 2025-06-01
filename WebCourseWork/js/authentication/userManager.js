class UserManager {
  constructor() {
    this.currentUser = null;
    this.adminPanelVisible = false;
    this.init();
  }

  async init() {
    this.loadUser();
    await this.checkAdminStatus();
    this.setupEventListeners();
  }

  loadUser() {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.updateUI();
    }
  }

  async checkAdminStatus() {
    if (!this.currentUser) return;

    try {
      const response = await fetch(
        `http://localhost:3000/users/${this.currentUser.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch user data");

      const updatedUser = await response.json();
      if (updatedUser.role !== this.currentUser.role) {
        this.currentUser.role = updatedUser.role;
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        this.updateUI();
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  }

  updateUI() {
    const authControls = document.getElementById("authControls");
    if (!authControls) return;

    authControls.innerHTML = `
        <div class="user-controls">
            <div class="user-icon" id="userIcon">
                <img src="./assets/user-icon.svg" alt="User" class="user-icon-img">
                <span>${this.currentUser.username || "User"}</span>
            </div>
            ${
              this.currentUser.role === "admin"
                ? '<button id="adminBtn" class="btn-admin"><img src="./assets/admin-icon.svg" alt="Admin"></button>'
                : ""
            }
        </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById("userIcon")?.addEventListener("click", (e) => {
      e.preventDefault();
      window.showProfileModal();
    });

    document.getElementById("adminBtn")?.addEventListener("click", () => {
      window.location.href = "admin.html";
    });

    document.getElementById("reservationBtn")?.addEventListener("click", () => {
      if (localStorage.getItem("isLoggedIn")) {
        document.querySelector(".reservation_section").scrollIntoView({
          behavior: "smooth",
        });
      } else {
        window.location.href = "login.html";
      }
    });
  }

  startPolling() {
    this.pollingInterval = setInterval(() => this.checkAdminStatus(), 30000); // Проверка каждые 30 секунд
  }

  stopPolling() {
    clearInterval(this.pollingInterval);
  }
}

const userManager = new UserManager();
userManager.startPolling();

window.addEventListener("beforeunload", () => {
  userManager.stopPolling();
});

document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (
        isLoggedIn &&
        (window.location.pathname.endsWith("login.html") ||
        window.location.pathname.endsWith("registration.html"))
    ) {
        window.location.href = "main.html";
    }
    
    if (window.location.pathname.endsWith("admin.html")) {
        if (!isLoggedIn || !currentUser || currentUser.role !== "admin") {
            window.location.href = "main.html";
        }
    }
});
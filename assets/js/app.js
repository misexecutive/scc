const appContent = document.getElementById("appContent");
const navLinks = document.querySelectorAll(".nav-link");

// Define allowed users with roles
const allowedUsers = {
  "kuldeeporganon@gmail.com": "admin",
  "srmismanager@gmail.com": "student"
};

// Load page content dynamically
function loadPage(page) {
  // Protect routes
  if (!isAuthenticated() && page !== "login") {
    window.location.hash = "login";
    page = "login";
  }

  fetch(`partials/${page}.html`)
    .then(res => res.text())
    .then(html => {
      appContent.innerHTML = html;
      updateActiveLink(page);

      // Hide admin link if not admin
      if (localStorage.getItem("role") !== "admin") {
        const adminLink = document.querySelector('a[href="#admin"]');
        if (adminLink) adminLink.style.display = "none";
      }

      // Show logout if logged in
      if (isAuthenticated()) {
        insertLogoutButton();
      }
    })
    .catch(err => {
      appContent.innerHTML = `<p>Error loading ${page}.html</p>`;
    });
}

// Set active sidebar link
function updateActiveLink(currentPage) {
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

// Parse Google token (JWT)
function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(json);
}

// Google Sign-in callback
function handleLogin(response) {
  const data = parseJwt(response.credential);
  const email = data.email;
  const name = data.name;

  const role = allowedUsers[email];
  if (!role) {
    const msg = document.getElementById("loginMessage");
    if (msg) msg.innerText = "Access denied: You are not authorized.";
    return;
  }

  localStorage.setItem("userEmail", email);
  localStorage.setItem("userName", name);
  localStorage.setItem("role", role);

  // Redirect after login
  const page = role === "admin" ? "admin" : "dashboard";
  window.location.hash = page;
  loadPage(page);
}

// Check if user is logged in
function isAuthenticated() {
  return !!localStorage.getItem("userEmail");
}

// Logout logic
function logout() {
  localStorage.clear();
  window.location.hash = "login";
  loadPage("login");
}

// Add logout button dynamically
function insertLogoutButton() {
  if (!document.getElementById("logoutBtn")) {
    const button = document.createElement("button");
    button.id = "logoutBtn";
    button.textContent = "🚪 Logout";
    button.style.margin = "10px";
    button.onclick = logout;
    document.querySelector("aside nav").appendChild(button);
  }
}

// Route on hash change
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1) || "login";
  loadPage(hash);
});

// Initial load
window.addEventListener("DOMContentLoaded", () => {
  const initial = window.location.hash.slice(1) || "login";
  loadPage(initial);
});

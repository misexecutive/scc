// Utility to decode JWT token (Google Credential)
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(base64);
}

const allowedUsers = {
  "kuldeeporganon@gmail.com": "admin",
  "srmismanager@gmail.com": "student"
};

// Handle Google login
function handleLogin(response) {
  const data = parseJwt(response.credential);
  const email = data.email;
  const name = data.name;

  const role = allowedUsers[email];
  if (!role) {
    document.getElementById("loginMessage").innerText = "❌ Access denied. You're not authorized.";
    return;
  }

  // Save session
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userName", name);
  localStorage.setItem("role", role);

  // Redirect
  const redirectPage = role === "admin" ? "admin" : "dashboard";
  window.location.hash = redirectPage;
  loadPage(redirectPage);
}

// Load partial HTML into the #app container
function loadPage(page) {
  fetch(`partials/${page}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Page not found");
      return res.text();
    })
    .then(html => {
      document.getElementById("app").innerHTML = html;
    })
    .catch(err => {
      document.getElementById("app").innerHTML = `<p>⚠️ ${err.message}</p>`;
    });
}

// On hash change (e.g., #dashboard, #fees, #results)
window.onhashchange = () => {
  const hash = location.hash.slice(1) || "login";
  const role = localStorage.getItem("role");

  // Prevent unauthorized access
  if (!role && hash !== "login") {
    window.location.hash = "login";
    loadPage("login");
    return;
  }

  // Block admin page for students
  if (hash.startsWith("admin") && role !== "admin") {
    document.getElementById("app").innerHTML = "<p>⛔ Access Denied</p>";
    return;
  }

  loadPage(hash);
};

// On first load
window.addEventListener("load", () => {
  const hash = location.hash.slice(1) || "login";
  loadPage(hash);
});

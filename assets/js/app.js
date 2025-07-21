const appContent = document.getElementById("appContent");
const navLinks = document.querySelectorAll(".nav-link");

function loadPage(page) {
  fetch(`partials/${page}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Page not found");
      return res.text();
    })
    .then(html => {
      appContent.innerHTML = html;
      updateActiveLink(page);
    })
    .catch(err => {
      appContent.innerHTML = `<p>Error loading ${page}.html</p>`;
    });
}

function updateActiveLink(currentPage) {
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1) || "dashboard";
  loadPage(hash);
});

window.addEventListener("DOMContentLoaded", () => {
  const initialPage = window.location.hash.slice(1) || "dashboard";
  loadPage(initialPage);
});

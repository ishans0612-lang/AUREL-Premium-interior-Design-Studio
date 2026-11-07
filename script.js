
/* ==========================================
   AUREL STUDIO — MAIN JAVASCRIPT
   ========================================== */

const $ = (selector) => document.querySelector(selector);

const app = $("#app");
const loader = $("#loader");
const authScreen = $("#authScreen");
const authForm = $("#authForm");
const dynamicPage = $("#dynamicPage");
const pageView = $("#pageView");
const toast = $("#toast");

let authMode = "register";
let currentFilter = "all";
let currentSearch = "";

/* ==========================================
   TEMPLATE DATA
   These are starter design concepts, not
   completed customer projects.
   ========================================== */

const templates = [
  {
    id: "atelier",
    name: "Atelier Studio",
    category: "creative",
    description: "A minimal creative studio website concept.",
    image: "photo-1558655146-9f40138edfeb",
    tag: "CREATIVE",
    pages: 5
  },
  {
    id: "nordic",
    name: "Nordic Business",
    category: "business",
    description: "A clean layout for modern businesses.",
    image: "photo-1497366754035-f200968a6e72",
    tag: "BUSINESS",
    pages: 6
  },
  {
    id: "folio",
    name: "Folio Personal",
    category: "portfolio",
    description: "A portfolio layout for creative professionals.",
    image: "photo-1460925895917-afdab827c52f",
    tag: "PORTFOLIO",
    pages: 4
  },
  {
    id: "commerce",
    name: "Commerce Edit",
    category: "ecommerce",
    description: "A product-focused online shop design concept.",
    image: "photo-1556742049-0cfed4f6a45d",
    tag: "COMMERCE",
    pages: 7
  },
  {
    id: "learn",
    name: "Learn Academy",
    category: "education",
    description: "An organised educational website concept.",
    image: "photo-1509062522246-3755977927d7",
    tag: "EDUCATION",
    pages: 5
  },
  {
    id: "architecture",
    name: "Forma Architecture",
    category: "creative",
    description: "An editorial design for architecture studios.",
    image: "photo-1600210492486-724fe5c67fb0",
    tag: "CREATIVE",
    pages: 5
  },
  {
    id: "agency",
    name: "North Agency",
    category: "business",
    description: "A professional agency website concept.",
    image: "photo-1497366811353-6870744d04b2",
    tag: "AGENCY",
    pages: 6
  },
  {
    id: "journal",
    name: "The Journal",
    category: "creative",
    description: "A magazine and editorial layout concept.",
    image: "photo-1499951360447-b19be8fe80f5",
    tag: "EDITORIAL",
    pages: 4
  },
  {
    id: "profile",
    name: "Personal Space",
    category: "portfolio",
    description: "A simple personal website design concept.",
    image: "photo-1497366216548-37526070297c",
    tag: "PORTFOLIO",
    pages: 3
  }
];

const categories = [
  { name: "Business", key: "business", number: "01", description: "Professional business layouts" },
  { name: "Portfolio", key: "portfolio", number: "02", description: "Personal and creative websites" },
  { name: "E-commerce", key: "ecommerce", number: "03", description: "Online shop design concepts" },
  { name: "Education", key: "education", number: "04", description: "Learning and education layouts" },
  { name: "Creative", key: "creative", number: "05", description: "Creative studio and editorial" }
];

const features = [
  ["01", "Template Discovery", "Explore different website design concepts."],
  ["02", "Category Filters", "Find layouts by their purpose."],
  ["03", "Live Preview", "Open a detailed template information page."],
  ["04", "Saved Favorites", "Save interesting templates in your browser."],
  ["05", "Quick Search", "Search the available collection."],
  ["06", "Responsive Layout", "Designed for mobile, tablet and desktop."],
  ["07", "Creative Inspiration", "Discover different visual directions."],
  ["08", "Simple Navigation", "Move between studio sections easily."],
  ["09", "Account Interface", "Login and registration interface ready for backend."]
];

/* ==========================================
   STARTUP
   ========================================== */

window.addEventListener("load", () => {
  app.classList.remove("hidden");

  renderTemplates();
  renderCategories();
  renderFeatures();

  setTimeout(() => {
    loader.classList.add("done");
  }, 500);
});

/* ==========================================
   NOTIFICATION
   ========================================== */

let toastTimeout;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* ==========================================
   IMAGE HELPER
   ========================================== */

function imageUrl(id, width = 800) {
  return `https://images.unsplash.com/${id}?w=${width}&auto=format&fit=crop&q=85`;
}

/* ==========================================
   FAVORITES
   ========================================== */

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("aurel_favorites") || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(items) {
  localStorage.setItem("aurel_favorites", JSON.stringify(items));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  let favorites = getFavorites();

  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
    showToast("Removed from favorites.");
  } else {
    favorites.push(id);
    showToast("Added to favorites.");
  }

  saveFavorites(favorites);
  renderTemplates();
}

/* ==========================================
   TEMPLATE CARDS
   ========================================== */

function renderTemplates() {
  const grid = $("#templateGrid");
  if (!grid) return;

  const filtered = templates.filter(template => {
    const matchesCategory =
      currentFilter === "all" || template.category === currentFilter;

    const text = (
      template.name + " " +
      template.description + " " +
      template.category
    ).toLowerCase();

    const matchesSearch = text.includes(currentSearch);

    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No templates found.</h3>
        <p>Try another search or category.</p>
        <button class="btn btn-dark" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(template => `
    <article class="template-card">
      <div class="template-image">
        <img
          src="${imageUrl(template.image)}"
          alt="${template.name} design concept"
          loading="lazy"
        >
        <span class="template-tag">${template.tag}</span>
      </div>

      <div class="template-info">
        <h3>${template.name}</h3>
        <p>${template.description}</p>

        <div class="template-meta">
          <span>${template.pages} suggested pages</span>
          <div class="template-actions">
            <button
              class="small-btn secondary"
              onclick="toggleFavorite('${template.id}')"
              aria-label="Save ${template.name}"
            >${isFavorite(template.id) ? "♥ Saved" : "♡ Save"}</button>

            <button
              class="small-btn"
              onclick="openTemplate('${template.id}')"
            >Explore ↗</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");
}

/* ==========================================
   CATEGORY FILTERS
   ========================================== */

$("#templateFilters")?.addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn === button);
  });

  renderTemplates();
});

function resetFilters() {
  currentFilter = "all";
  currentSearch = "";

  if ($("#globalSearch")) {
    $("#globalSearch").value = "";
  }

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === "all");
  });

  renderTemplates();
}

/* ==========================================
   CATEGORY CARDS
   ========================================== */

function renderCategories() {
  const grid = $("#categoryGrid");
  if (!grid) return;

  grid.innerHTML = categories.map(category => `
    <article
      class="category-card"
      role="button"
      tabindex="0"
      data-category="${category.key}"
      aria-label="Explore ${category.name}"
    >
      <span class="category-number">${category.number}</span>
      <div>
        <h3>${category.name}</h3>
        <p>${category.description}</p>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-category]").forEach(card => {
    const action = () => {
      currentFilter = card.dataset.category;

      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle(
          "active",
          btn.dataset.filter === currentFilter
        );
      });

      renderTemplates();
      location.hash = "templates";
    };

    card.addEventListener("click", action);

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  });
}

/* ==========================================
   FEATURE CARDS
   ========================================== */

function renderFeatures() {
  const grid = $("#featureGrid");
  if (!grid) return;

  grid.innerHTML = features.map(feature => `
    <article class="feature-card">
      <div class="feature-icon">${feature[0]}</div>
      <h3>${feature[1]}</h3>
      <p>${feature[2]}</p>
    </article>
  `).join("");
}

/* ==========================================
   TEMPLATE DETAILS
   ========================================== */

function openTemplate(id) {
  const template = templates.find(item => item.id === id);
  if (!template) return;

  showDynamicPage(`
    <button class="btn btn-outline dynamic-back" onclick="goHome()">← Back to Studio</button>

    <p class="eyebrow">${template.tag} COLLECTION</p>
    <h1 class="dynamic-heading">${template.name}</h1>

    <p class="dynamic-copy">${template.description}</p>

    <div class="detail-image">
      <img
        src="${imageUrl(template.image, 1400)}"
        alt="${template.name} design concept"
      >
    </div>

    <div class="detail-content">
      <h2>About this design</h2>
      <p>This is a starter design concept for exploring website layouts.
      It is not presented as a completed customer project.</p>

      <h3>Suggested structure</h3>
      <p>${template.pages} suggested pages for this design concept.</p>

      <button class="btn btn-dark" onclick="toggleFavorite('${template.id}')">
        ${isFavorite(template.id) ? "♥ Saved" : "♡ Save to Favorites"}
      </button>
    </div>
  `, "Template Details");
}

/* ==========================================
   DYNAMIC PAGES
   ========================================== */

function showDynamicPage(content, title = "AUREL Studio") {
  pageView.classList.add("hidden");
  dynamicPage.classList.remove("hidden");

  dynamicPage.innerHTML = `
    <div class="dynamic-container">
      ${content}
    </div>
  `;

  document.title = `${title} — AUREL`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  dynamicPage.classList.add("hidden");
  pageView.classList.remove("hidden");
  document.title = "AUREL — Website Design Studio";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================
   GLOBAL SEARCH
   ========================================== */

$("#searchToggle")?.addEventListener("click", () => {
  $("#searchPanel")?.classList.toggle("hidden");

  if (!$("#searchPanel")?.classList.contains("hidden")) {
    $("#globalSearch")?.focus();
  }
});

function runSearch() {
  currentSearch = ($("#globalSearch")?.value || "").trim().toLowerCase();

  currentFilter = "all";

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === "all");
  });

  goHome();
  renderTemplates();

  location.hash = "templates";
}

$("#searchButton")?.addEventListener("click", runSearch);

$("#globalSearch")?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    runSearch();
  }
});

/* ==========================================
   MOBILE MENU
   ========================================== */

$("#menuToggle")?.addEventListener("click", () => {
  $("#mainNav")?.classList.toggle("open");
});

$("#mainNav")?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    $("#mainNav")?.classList.remove("open");
  });
});

/* ==========================================
   AUTH SCREEN
   ========================================== */

function openAuth(mode = "register") {
  authMode = mode;
  updateAuthScreen();

  authScreen?.classList.remove("hidden");
  $("#authMessage").textContent = "";
}

function closeAuth() {
  authScreen?.classList.add("hidden");
}

function updateAuthScreen() {
  if (authMode === "register") {
    $("#authTitle").textContent = "Create your account.";
    $("#authDescription").textContent = "Join the AUREL creative community.";
    $("#authSubmit").textContent = "Create Account";
    $("#nameField").classList.remove("hidden");
    $("#authName").required = true;
    $("#authSwitch").innerHTML =
      'Already have an account? <button type="button" id="switchAuth">Login</button>';
  } else {
    $("#authTitle").textContent = "Welcome back.";
    $("#authDescription").textContent = "Login to your AUREL account.";
    $("#authSubmit").textContent = "Login";
    $("#nameField").classList.add("hidden");
    $("#authName").required = false;
    $("#authSwitch").innerHTML =
      'New here? <button type="button" id="switchAuth">Create Account</button>';
  }

  $("#switchAuth").addEventListener("click", () => {
    authMode = authMode === "register" ? "login" : "register";
    updateAuthScreen();
    $("#authMessage").textContent = "";
  });
}

$("#loginButton")?.addEventListener("click", () => openAuth("login"));
$("#signupButton")?.addEventListener("click", () => openAuth("register"));

$("#closeAuth")?.addEventListener("click", closeAuth);

$("#guestButton")?.addEventListener("click", () => {
  closeAuth();
  showToast("You are exploring AUREL as a guest.");
});

/* ==========================================
   AUTH FORM
   Backend connection required for real login.
   ========================================== */

authForm?.addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;

  if (!email || password.length < 6) {
    $("#authMessage").textContent =
      "Enter a valid email and password of at least 6 characters.";
    return;
  }

  $("#authMessage").textContent =
    "Authentication backend is not connected yet. No account has been created.";
});

/* ==========================================
   NEWSLETTER FORM
   Frontend only — no email service connected.
   ========================================== */

$("#newsletterForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#newsletterEmail").value.trim();

  if (!email) return;

  showToast("Newsletter service is not connected yet.");
});

/* ==========================================
   ROUTE SHORTCUTS
   ========================================== */

const routePages = {
  help: {
    title: "Help Center",
    description: "Find guidance for exploring the AUREL studio."
  },
  profile: {
    title: "My Profile",
    description: "A user profile area will be available after account authentication is connected."
  },
  login: {
    title: "Login",
    description: "Open the login interface to access your account."
  },
  register: {
    title: "Register",
    description: "Create an account after the authentication service is connected."
  },
  "all-templates": {
    title: "All Templates",
    description: "Explore the available starter design concepts below."
  }
};

function handleRoute() {
  const route = location.hash.replace("#", "").split("?")[0];

  if (!route || route === "home") {
    goHome();
    return;
  }

  if (route === "login") {
    openAuth("login");
    return;
  }

  if (route === "register") {
    openAuth("register");
    return;
  }

  if (route === "templates" || route === "all-templates") {
    goHome();
    renderTemplates();
    return;
  }

  const page = routePages[route];

  if (page) {
    showDynamicPage(`
      <button class="btn btn-outline dynamic-back" onclick="goHome()">← Back</button>
      <p class="eyebrow">AUREL STUDIO</p>
      <h1 class="dynamic-heading">${page.title}</h1>
      <p class="dynamic-copy">${page.description}</p>
    `, page.title);
  }
}

window.addEventListener("hashchange", handleRoute);

/* ==========================================
   GLOBAL ERROR HANDLING
   ========================================== */

window.addEventListener("error", event => {
  console.error("AUREL error:", event.message);
});

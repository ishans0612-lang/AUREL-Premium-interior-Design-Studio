"use strict";

/* ==========================================
   AUREL STUDIO — COMPLETE JAVASCRIPT
   Local storage • Login • Guest • Templates
   Editor • Workspace • Favorites • Backup
========================================== */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const DB_KEY = "aurel_studio_data_v2";
const SESSION_KEY = "aurel_studio_session_v2";

let db;
let currentUser = null;
let authMode = "login";
let currentRoute = "home";
let currentTemplate = null;
let activeCategory = "All";
let templateSearch = "";
let editorData = {
  title: "Create something beautiful.",
  subtitle: "A website made for your ideas.",
  brand: "YOUR BRAND",
  accent: "#c96d4d",
  background: "#f6f3ed",
  text: "#211f1b",
  button: "Explore More"
};

/* ==========================================
   DATA
========================================== */

const templates = [
  {
    id: "minimal-studio",
    name: "Minimal Studio",
    category: "Portfolio",
    description: "A clean and elegant creative portfolio.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900",
    accent: "#c96d4d"
  },
  {
    id: "urban-commerce",
    name: "Urban Commerce",
    category: "Business",
    description: "A modern storefront layout for brands.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900",
    accent: "#a94e33"
  },
  {
    id: "serene-interior",
    name: "Serene Living",
    category: "Interior",
    description: "A warm layout for interior designers.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900",
    accent: "#8b735e"
  },
  {
    id: "food-journal",
    name: "Food Journal",
    category: "Restaurant",
    description: "A delicious design for restaurants and cafes.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900",
    accent: "#b76e36"
  },
  {
    id: "tech-launch",
    name: "Tech Launch",
    category: "Technology",
    description: "A bold landing page for digital products.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900",
    accent: "#526b79"
  },
  {
    id: "travel-notes",
    name: "Travel Notes",
    category: "Travel",
    description: "A visual travel journal and destination site.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",
    accent: "#54766b"
  },
  {
    id: "fashion-edit",
    name: "Fashion Edit",
    category: "Fashion",
    description: "A refined fashion and editorial layout.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900",
    accent: "#9c6b72"
  },
  {
    id: "creative-agency",
    name: "Creative Agency",
    category: "Business",
    description: "A polished website for creative teams.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900",
    accent: "#bd7656"
  },
  {
    id: "learning-space",
    name: "Learning Space",
    category: "Education",
    description: "An organized education website layout.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900",
    accent: "#607d70"
  },
  {
    id: "wellness-club",
    name: "Wellness Club",
    category: "Health",
    description: "A calm and modern wellness layout.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900",
    accent: "#82927a"
  },
  {
    id: "photo-gallery",
    name: "Photo Gallery",
    category: "Photography",
    description: "A gallery-focused photography portfolio.",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900",
    accent: "#7d7770"
  },
  {
    id: "event-stage",
    name: "Event Stage",
    category: "Events",
    description: "A vibrant event and conference website.",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=900",
    accent: "#b66a4a"
  }
];

const categories = [
  ["Portfolio", "Showcase your work and creative projects.", "✦"],
  ["Business", "Professional websites for companies.", "▤"],
  ["Interior", "Spaces, studios and interior design.", "⌂"],
  ["Restaurant", "Restaurants, cafes and food brands.", "♨"],
  ["Technology", "Technology products and startups.", "⌘"],
  ["Travel", "Travel guides and destination websites.", "◇"],
  ["Fashion", "Fashion, clothing and editorial brands.", "✧"],
  ["Education", "Learning platforms and education.", "▦"],
  ["Health", "Wellness, fitness and health websites.", "＋"],
  ["Photography", "Photography and visual portfolios.", "▧"],
  ["Events", "Events, conferences and celebrations.", "◷"]
];

/* ==========================================
   DATABASE
========================================== */

function createDefaultDB() {
  return {
    version: 2,
    users: [],
    projects: [],
    favorites: [],
    settings: {
      theme: "light",
      compact: false
    }
  };
}

function loadDB() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) return createDefaultDB();

    const parsed = JSON.parse(saved);

    return {
      ...createDefaultDB(),
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : []
    };
  } catch (error) {
    console.error("Database load error:", error);
    return createDefaultDB();
  }
}

db = loadDB();

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    updateStorageStatus();
    return true;
  } catch (error) {
    console.error("Database save error:", error);
    toast("Storage is full or unavailable.");
    return false;
  }
}

/* ==========================================
   HELPERS
========================================== */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function makeId() {
  return "aurel_" + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

function toast(message) {
  const element = $("#toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}

function getUserKey() {
  return currentUser?.id || "guest";
}

function getUserProjects() {
  return db.projects.filter(
    project => project.owner === getUserKey()
  );
}

function getUserFavorites() {
  return db.favorites.filter(
    item => item.owner === getUserKey()
  );
}

function getTemplate(id) {
  return templates.find(item => item.id === id);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

async function hashPassword(password) {
  try {
    if (window.crypto?.subtle) {
      const data = new TextEncoder().encode(password);
      const hash = await crypto.subtle.digest("SHA-256", data);

      return [...new Uint8Array(hash)]
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch (error) {
    console.warn("Secure hashing unavailable:", error);
  }

  // Fallback for browsers without Web Crypto.
  return "fallback_" + btoa(unescape(encodeURIComponent(password)));
}

/* ==========================================
   AUTHENTICATION
========================================== */

function setAuthMode(mode) {
  authMode = mode;

  $("#auth-title").textContent =
    mode === "register"
      ? "Create your space."
      : "Welcome to AUREL.";

  $("#auth-submit").textContent =
    mode === "register"
      ? "Create local account"
      : "Log in";

  $("#auth-name-wrap").classList.toggle(
    "hidden",
    mode !== "register"
  );

  $("#auth-switch").innerHTML =
    mode === "register"
      ? 'Already have an account? <button type="button" class="text-button" id="auth-toggle">Log in</button>'
      : 'New here? <button type="button" class="text-button" id="auth-toggle">Create account</button>';
}

async function handleAuth(event) {
  event.preventDefault();

  const username = $("#auth-username").value.trim();
  const password = $("#auth-password").value;
  const displayName = $("#auth-name").value.trim();

  if (username.length < 3) {
    toast("Username must have at least 3 characters.");
    return;
  }

  if (password.length < 4) {
    toast("Password must have at least 4 characters.");
    return;
  }

  const normalized = username.toLowerCase();

  if (authMode === "register") {
    if (db.users.some(user => user.username.toLowerCase() === normalized)) {
      toast("This username already exists.");
      return;
    }

    const user = {
      id: makeId(),
      username,
      displayName: displayName || username,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    saveDB();

    startSession({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      guest: false
    });

    toast("Your local account has been created.");
    return;
  }

  const user = db.users.find(
    item => item.username.toLowerCase() === normalized
  );

  if (!user) {
    toast("Account not found. Create an account first.");
    return;
  }

  const passwordHash = await hashPassword(password);

  if (passwordHash !== user.passwordHash) {
    toast("Incorrect password.");
    return;
  }

  startSession({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    guest: false
  });

  toast("Welcome back!");
}

function startGuest() {
  startSession({
    id: "guest",
    username: "Guest",
    displayName: "Guest",
    guest: true
  });

  toast("Welcome to AUREL Studio.");
}

function startSession(user) {
  currentUser = user;

  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(user)
    );
  } catch (error) {
    console.warn("Session storage unavailable:", error);
  }

  $("#auth-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");

  updateUserInterface();
  navigate("home");
}

function restoreSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return false;

    const session = JSON.parse(saved);

    if (session.guest) {
      currentUser = session;
    } else {
      const user = db.users.find(item => item.id === session.id);
      if (!user) return false;

      currentUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        guest: false
      };
    }

    $("#auth-screen").classList.add("hidden");
    $("#app").classList.remove("hidden");

    updateUserInterface();
    navigate("home");

    return true;
  } catch (error) {
    console.warn("Session restore failed:", error);
    return false;
  }
}

function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn(error);
  }

  currentUser = null;

  $("#app").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");

  $("#auth-form").reset();
  setAuthMode("login");

  toast("You have logged out.");
}

function updateUserInterface() {
  const name = currentUser?.displayName || "Guest";
  const initial = name.charAt(0).toUpperCase();

  $("#sidebar-user").textContent = name;
  $("#sidebar-avatar").textContent = initial;
  $("#top-avatar").textContent = initial;
  $("#top-login").textContent = "Log out";
}

/* ==========================================
   NAVIGATION
========================================== */

const routeNames = {
  home: "Overview",
  templates: "Template Library",
  editor: "Visual Editor",
  workspace: "My Workspace",
  favorites: "Favorites",
  categories: "Categories",
  inspiration: "Inspiration",
  help: "Help Center",
  settings: "Settings",
  profile: "Profile",
  detail: "Template Details"
};

function navigate(route) {
  if (!routeNames[route]) route = "home";

  currentRoute = route;

  $$(".nav-link[data-route]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.route === route
    );
  });

  $("#page-crumb").textContent = routeNames[route];

  $("#sidebar").classList.remove("open");

  renderPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPage() {
  const pages = {
    home: renderHome,
    templates: renderTemplates,
    editor: renderEditor,
    workspace: renderWorkspace,
    favorites: renderFavorites,
    categories: renderCategories,
    inspiration: renderInspiration,
    help: renderHelp,
    settings: renderSettings,
    profile: renderProfile,
    detail: renderDetail
  };

  const render = pages[currentRoute] || renderHome;
  $("#page-content").innerHTML = render();
}

/* ==========================================
   SHARED UI
========================================== */

function pageHeading(eyebrow, title, description, action = "") {
  return `
    <div class="page-heading">
      <div>
        <span class="eyebrow">${escapeHTML(eyebrow)}</span>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(description)}</p>
      </div>
      ${action}
    </div>
  `;
}

function templateCard(template) {
  const saved = getUserFavorites().some(
    item => item.templateId === template.id
  );

  return `
    <article class="template-card">
      <div class="template-thumb">
        <img
          src="${escapeHTML(template.image)}"
          alt="${escapeHTML(template.name)}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
        <span class="template-tag">${escapeHTML(template.category)}</span>

        <button
          type="button"
          class="favorite-btn ${saved ? "saved" : ""}"
          data-favorite="${template.id}"
          aria-label="Toggle favorite"
        >${saved ? "♥" : "♡"}</button>
      </div>

      <div class="template-info">
        <h3>${escapeHTML(template.name)}</h3>
        <p>${escapeHTML(template.description)}</p>

        <div class="template-meta">
          <small>AUREL TEMPLATE</small>

          <div class="template-actions">
            <button
              type="button"
              class="btn btn-outline"
              data-detail="${template.id}"
            >View</button>

            <button
              type="button"
              class="btn btn-primary"
              data-use="${template.id}"
            >Customize</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function templateGrid(items) {
  if (!items.length) {
    return `
      <div class="empty-state">
        <h3>Nothing found</h3>
        <p>Try another search or category.</p>
        <button type="button" class="btn btn-outline" data-action="clear-search">
          Clear filters
        </button>
      </div>
    `;
  }

  return `<div class="template-grid">${items.map(templateCard).join("")}</div>`;
}

function emptyState(title, description, route = "templates") {
  return `
    <div class="empty-state">
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
      <button type="button" class="btn btn-primary" data-route="${route}">
        Explore templates
      </button>
    </div>
  `;
}

/* ==========================================
   OVERVIEW
========================================== */

function renderHome() {
  const projects = getUserProjects();
  const favorites = getUserFavorites();

  return `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">AUREL WEBSITE TEMPLATE STUDIO</span>
        <h1>Make your ideas look beautiful.</h1>
        <p>
          Explore website layouts, customize your design,
          and save your creative work in one place.
        </p>

        <div class="hero-actions">
          <button type="button" class="btn btn-primary" data-route="templates">
            Explore templates
          </button>
          <button type="button" class="btn btn-outline" data-route="editor">
            Open visual editor
          </button>
        </div>
      </div>

      <div class="hero-art">
        <div class="mock-window">
          <div class="mock-top"><i></i><i></i><i></i></div>
          <div class="mock-banner">AUREL</div>
          <div class="mock-lines"><i></i><i></i><i></i></div>
        </div>
        <div class="float-card">Your creative workspace</div>
      </div>
    </section>

    <div class="stats-grid">
      <div class="stat-card">
        <small>Available templates</small>
        <strong>${templates.length}</strong>
        <span>Ready to explore</span>
      </div>
      <div class="stat-card">
        <small>Your projects</small>
        <strong>${projects.length}</strong>
        <span>Saved on this device</span>
      </div>
      <div class="stat-card">
        <small>Your favorites</small>
        <strong>${favorites.length}</strong>
        <span>Your saved designs</span>
      </div>
      <div class="stat-card">
        <small>Categories</small>
        <strong>${categories.length}</strong>
        <span>Different design areas</span>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h2>Explore templates</h2>
        <p>Choose a starting point for your next project.</p>
      </div>
      <button type="button" class="btn btn-outline" data-route="templates">
        View all
      </button>
    </div>

    ${templateGrid(templates.slice(0, 3))}

    <div class="section-head">
      <div>
        <h2>Your creative tools</h2>
        <p>Everything starts with a simple idea.</p>
      </div>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <span class="feature-icon">✎</span>
        <b>Visual Editor</b>
        <p>Change text, colors and preview your layout.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">▤</span>
        <b>My Workspace</b>
        <p>Keep your saved projects organized.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">♡</span>
        <b>Favorites</b>
        <p>Save templates you want to use later.</p>
      </div>
    </div>
  `;
}

/* ==========================================
   TEMPLATE LIBRARY
========================================== */

function renderTemplates() {
  const filtered = templates.filter(template => {
    const matchesCategory =
      activeCategory === "All" ||
      template.category === activeCategory;

    const query = templateSearch.toLowerCase();

    const matchesSearch =
      template.name.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return `
    ${pageHeading(
      "DESIGN LIBRARY",
      "Find your starting point.",
      "Browse the available layouts and choose a design to customize."
    )}

    <div class="search-box">
      <span>⌕</span>
      <input
        id="template-search"
        type="search"
        placeholder="Search templates..."
        value="${escapeHTML(templateSearch)}"
      >
    </div>

    <div class="filter-row">
      ${["All", ...categories.map(item => item[0])].map(category => `
        <button
          type="button"
          class="chip ${activeCategory === category ? "active" : ""}"
          data-category="${escapeHTML(category)}"
        >${escapeHTML(category)}</button>
      `).join("")}
    </div>

    <p class="muted">${filtered.length} templates found</p>

    ${templateGrid(filtered)}
  `;
}

/* ==========================================
   TEMPLATE DETAILS
========================================== */

function renderDetail() {
  const template = getTemplate(currentTemplate);

  if (!template) {
    return emptyState("Template not found", "Choose another template.");
  }

  const saved = getUserFavorites().some(
    item => item.templateId === template.id
  );

  return `
    <div class="detail-hero">
      <div>
        <span class="eyebrow">${escapeHTML(template.category)}</span>
        <h1>${escapeHTML(template.name)}</h1>
        <p>${escapeHTML(template.description)}</p>

        <div class="hero-actions">
          <button type="button" class="btn btn-primary" data-use="${template.id}">
            Customize this template
          </button>

          <button
            type="button"
            class="btn btn-outline"
            data-favorite="${template.id}"
          >${saved ? "Remove favorite" : "Add to favorites"}</button>
        </div>
      </div>

      <img
        src="${escapeHTML(template.image)}"
        alt="${escapeHTML(template.name)}"
      >
    </div>

    <div class="detail-list">
      <div class="surface">
        <h3>Layout</h3>
        <p>A structured starting layout for your website.</p>
      </div>
      <div class="surface">
        <h3>Customization</h3>
        <p>Change the content and colors in the visual editor.</p>
      </div>
      <div class="surface">
        <h3>Local saving</h3>
        <p>Save your customized project in this browser.</p>
      </div>
    </div>
  `;
}

/* ==========================================
   FAVORITES
========================================== */

function toggleFavorite(templateId) {
  const existingIndex = db.favorites.findIndex(
    item =>
      item.owner === getUserKey() &&
      item.templateId === templateId
  );

  if (existingIndex >= 0) {
    db.favorites.splice(existingIndex, 1);
    toast("Removed from favorites.");
  } else {
    db.favorites.push({
      id: makeId(),
      owner: getUserKey(),
      templateId,
      createdAt: new Date().toISOString()
    });

    toast("Added to favorites.");
  }

  saveDB();
  renderPage();
}

function renderFavorites() {
  const ids = getUserFavorites().map(item => item.templateId);
  const savedTemplates = templates.filter(item => ids.includes(item.id));

  return `
    ${pageHeading(
      "YOUR COLLECTION",
      "Favorite designs.",
      "Your personally saved templates."
    )}

    ${
      savedTemplates.length
        ? templateGrid(savedTemplates)
        : emptyState(
            "No favorites yet",
            "Save a template by pressing the heart icon."
          )
    }
  `;
}

/* ==========================================
   CATEGORIES
========================================== */

function renderCategories() {
  return `
    ${pageHeading(
      "DISCOVER",
      "Explore categories.",
      "Find layouts for different kinds of websites."
    )}

    <div class="category-grid">
      ${categories.map(([name, description, symbol]) => `
        <button
          type="button"
          class="category-card"
          data-open-category="${escapeHTML(name)}"
        >
          <span class="category-symbol">${symbol}</span>
          <h3>${escapeHTML(name)}</h3>
          <p>${escapeHTML(description)}</p>
        </button>
      `).join("")}
    </div>
  `;
}

/* ==========================================
   INSPIRATION
========================================== */

function renderInspiration() {
  const ideas = [
    ["Less, but better", "Use fewer elements and give your content room to breathe."],
    ["Build a clear hierarchy", "Make the most important information easy to find."],
    ["Use a consistent palette", "Choose a small set of colors and reuse them."],
    ["Design for mobile", "Check how your layout looks on a smaller screen."],
    ["Make navigation simple", "Visitors should understand where each link goes."],
    ["Use meaningful images", "Choose visuals that support the purpose of the page."]
  ];

  return `
    ${pageHeading(
      "CREATIVE NOTES",
      "A little inspiration.",
      "Practical ideas to improve your next website design."
    )}

    <div class="feature-grid">
      ${ideas.map(([title, description], index) => `
        <article class="feature-card">
          <span class="feature-icon">${String(index + 1).padStart(2, "0")}</span>
          <b>${escapeHTML(title)}</b>
          <p>${escapeHTML(description)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

/* ==========================================
   VISUAL EDITOR
========================================== */

function openEditor(templateId) {
  const template = getTemplate(templateId);

  if (template) {
    currentTemplate = template.id;

    editorData = {
      title: template.name,
      subtitle: template.description,
      brand: "YOUR BRAND",
      accent: template.accent,
      background: "#f6f3ed",
      text: "#211f1b",
      button: "Explore More"
    };
  }

  navigate("editor");
}

function renderEditor() {
  const template = getTemplate(currentTemplate);

  return `
    ${pageHeading(
      "DESIGN WORKSPACE",
      "Visual editor.",
      "Edit your content and colors, then save your project."
    )}

    <div class="editor-layout">

      <div class="editor-panel">
        <h3>Customize design</h3>

        <div class="control-group">
          <label for="edit-brand">Brand name</label>
          <input id="edit-brand" value="${escapeHTML(editorData.brand)}">
        </div>

        <div class="control-group">
          <label for="edit-title">Main heading</label>
          <input id="edit-title" value="${escapeHTML(editorData.title)}">
        </div>

        <div class="control-group">
          <label for="edit-subtitle">Description</label>
          <textarea id="edit-subtitle" rows="3">${escapeHTML(editorData.subtitle)}</textarea>
        </div>

        <div class="control-group">
          <label for="edit-button">Button text</label>
          <input id="edit-button" value="${escapeHTML(editorData.button)}">
        </div>

        <div class="control-group">
          <label for="edit-accent">Accent color</label>
          <input class="color-input" id="edit-accent" type="color" value="${editorData.accent}">
        </div>

        <div class="control-group">
          <label for="edit-background">Background color</label>
          <input class="color-input" id="edit-background" type="color" value="${editorData.background}">
        </div>

        <div class="control-group">
          <label for="edit-text">Text color</label>
          <input class="color-input" id="edit-text" type="color" value="${editorData.text}">
        </div>

        <button type="button" class="btn btn-primary full" data-action="save-project">
          Save project
        </button>

        <button type="button" class="btn btn-outline full" data-action="reset-editor">
          Reset editor
        </button>
      </div>

      <div class="editor-preview">
        <div class="preview-toolbar">
          <b>Live preview</b>

          <div class="device-switch">
            <button type="button" class="active" data-device="desktop">Desktop</button>
            <button type="button" data-device="tablet">Tablet</button>
            <button type="button" data-device="mobile">Mobile</button>
          </div>
        </div>

        <div class="preview-frame" id="preview-frame">
          <div class="site-preview" id="site-preview">
            ${previewMarkup()}
          </div>
        </div>
      </div>

    </div>
  `;
}

function previewMarkup() {
  return `
    <nav class="site-nav">
      <span id="preview-brand">${escapeHTML(editorData.brand)}</span>
      <span>Home &nbsp; About &nbsp; Contact</span>
    </nav>

    <section
      class="site-hero"
      style="
        --site-accent:${editorData.accent};
        background:${editorData.background};
        color:${editorData.text};
      "
    >
      <small>WELCOME TO OUR WEBSITE</small>
      <h1 id="preview-title">${escapeHTML(editorData.title)}</h1>
      <p id="preview-subtitle">${escapeHTML(editorData.subtitle)}</p>
      <button id="preview-button">${escapeHTML(editorData.button)}</button>
    </section>

    <section class="site-cards">
      <div class="site-card">Discover</div>
      <div class="site-card">Create</div>
      <div class="site-card">Explore</div>
    </section>

    <footer class="site-footer">
      © ${new Date().getFullYear()} ${escapeHTML(editorData.brand)}
    </footer>
  `;
}

function updateEditorPreview() {
  const fields = {
    brand: "#edit-brand",
    title: "#edit-title",
    subtitle: "#edit-subtitle",
    button: "#edit-button",
    accent: "#edit-accent",
    background: "#edit-background",
    text: "#edit-text"
  };

  for (const [key, selector] of Object.entries(fields)) {
    const element = $(selector);
    if (element) editorData[key] = element.value;
  }

  const preview = $("#site-preview");
  if (!preview) return;

  preview.innerHTML = previewMarkup();
}

function saveProject() {
  const name = editorData.brand.trim() || "Untitled project";

  const project = {
    id: makeId(),
    owner: getUserKey(),
    name,
    templateId: currentTemplate,
    data: { ...editorData },
    updatedAt: new Date().toISOString()
  };

  db.projects.unshift(project);

  if (!saveDB()) {
    db.projects = db.projects.filter(item => item.id !== project.id);
    return;
  }

  toast("Project saved on this device.");
}

function resetEditor() {
  editorData = {
    title: "Create something beautiful.",
    subtitle: "A website made for your ideas.",
    brand: "YOUR BRAND",
    accent: "#c96d4d",
    background: "#f6f3ed",
    text: "#211f1b",
    button: "Explore More"
  };

  renderPage();
  toast("Editor has been reset.");
}

function loadProject(projectId) {
  const project = db.projects.find(
    item => item.id === projectId &&
      item.owner === getUserKey()
  );

  if (!project) {
    toast("Project not found.");
    return;
  }

  editorData = { ...project.data };
  currentTemplate = project.templateId || null;
  navigate("editor");
  toast("Project opened.");
}

function deleteProject(projectId) {
  const project = db.projects.find(
    item => item.id === projectId &&
      item.owner === getUserKey()
  );

  if (!project) return;

  if (!confirm(`Delete "${project.name}"?`)) return;

  db.projects = db.projects.filter(
    item => item.id !== projectId
  );

  saveDB();
  renderPage();
  toast("Project deleted.");
}

/* ==========================================
   WORKSPACE
========================================== */

function renderWorkspace() {
  const projects = getUserProjects();

  return `
    ${pageHeading(
      "YOUR WORK",
      "My workspace.",
      "Projects you have saved in this browser.",
      `<button type="button" class="btn btn-primary" data-route="editor">New project</button>`
    )}

    ${
      projects.length
        ? `
          <div class="template-grid">
            ${projects.map(project => {
              const template = getTemplate(project.templateId);

              return `
                <article class="template-card">
                  <div class="template-thumb">
                    ${
                      template
                        ? `<img src="${escapeHTML(template.image)}" alt="${escapeHTML(project.name)}">`
                        : `<div class="category-symbol">A</div>`
                    }
                    <span class="template-tag">SAVED PROJECT</span>
                  </div>

                  <div class="template-info">
                    <h3>${escapeHTML(project.name)}</h3>
                    <p>Last saved: ${formatDate(project.updatedAt)}</p>

                    <div class="template-actions">
                      <button type="button" class="btn btn-primary" data-open-project="${project.id}">
                        Open
                      </button>
                      <button type="button" class="btn btn-outline" data-delete-project="${project.id}">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        `
        : emptyState(
            "Your workspace is empty",
            "Customize a template and save your first project."
          )
    }
  `;
}

/* ==========================================
   HELP CENTER
========================================== */

function renderHelp() {
  const helpItems = [
    ["How do I start?", "Open the Template Library, choose a layout and press Customize."],
    ["How do I save my design?", "Open the Visual Editor and press Save Project."],
    ["Where are my projects stored?", "Projects are saved in this browser on the device you are using."],
    ["Can I move my projects to another device?", "Export a backup from Settings, then import it on the other device."],
    ["Is this a cloud account?", "No. This version uses local browser storage and does not sync between devices."],
    ["Does AUREL process payments?", "No. This version has no payment or checkout system."]
  ];

  return `
    ${pageHeading(
      "SUPPORT",
      "How can we help?",
      "Quick answers about using AUREL Studio."
    )}

    <div class="help-list">
      ${helpItems.map(([title, description]) => `
        <article class="help-item">
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(description)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

/* ==========================================
   SETTINGS
========================================== */

function renderSettings() {
  return `
    ${pageHeading(
      "PREFERENCES",
      "Your settings.",
      "Manage your local data and browser preferences."
    )}

    <div class="settings-grid">

      <div class="setting-card">
        <h3>Export your data</h3>
        <p>Download a backup of your local account, projects, favorites and settings.</p>
        <div class="setting-actions">
          <button type="button" class="btn btn-primary" data-action="export">
            Export backup
          </button>
        </div>
      </div>

      <div class="setting-card">
        <h3>Import your data</h3>
        <p>Restore a backup file previously exported from AUREL.</p>
        <div class="setting-actions">
          <button type="button" class="btn btn-outline" data-action="import">
            Choose backup file
          </button>
        </div>
      </div>

      <div class="setting-card">
        <h3>Storage information</h3>
        <p>Your data is stored locally in this browser. Clearing site data may erase it.</p>
        <div class="setting-actions">
          <button type="button" class="btn btn-outline" data-action="storage-info">
            Check storage
          </button>
        </div>
      </div>

      <div class="setting-card">
        <h3>Sign out</h3>
        <p>End your current local session on this device.</p>
        <div class="setting-actions">
          <button type="button" class="btn btn-outline" data-action="logout">
            Log out
          </button>
        </div>
      </div>

    </div>
  `;
}

/* ==========================================
   PROFILE
========================================== */

function renderProfile() {
  const name = currentUser?.displayName || "Guest";
  const projects = getUserProjects().length;
  const favorites = getUserFavorites().length;

  return `
    ${pageHeading(
      "YOUR ACCOUNT",
      "Profile.",
      "Your local AUREL identity and activity."
    )}

    <div class="profile-hero">
      <span class="avatar">${escapeHTML(name.charAt(0).toUpperCase())}</span>
      <div>
        <h2>${escapeHTML(name)}</h2>
        <p class="muted">
          ${currentUser?.guest ? "Guest profile" : "Local account"}
        </p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <small>Projects</small>
        <strong>${projects}</strong>
      </div>
      <div class="stat-card">
        <small>Favorites</small>
        <strong>${favorites}</strong>
      </div>
      <div class="stat-card">
        <small>Account type</small>
        <strong>${currentUser?.guest ? "Guest" : "Local"}</strong>
      </div>
      <div class="stat-card">
        <small>Storage</small>
        <strong>Device</strong>
      </div>
    </div>

    ${
      currentUser?.guest
        ? `
          <div class="surface">
            <h3>Create a local account</h3>
            <p class="muted">Your guest data is stored separately from registered accounts.</p>
            <button type="button" class="btn btn-primary" data-action="logout">
              Go to login
            </button>
          </div>
        `
        : `
          <div class="surface">
            <h3>Account information</h3>
            <p class="muted">Username: ${escapeHTML(currentUser.username)}</p>
            <p class="muted">This account is stored only in this browser.</p>
          </div>
        `
    }
  `;
}

/* ==========================================
   BACKUP & RESTORE
========================================== */

function exportBackup() {
  const backup = {
    application: "AUREL Studio",
    version: 2,
    exportedAt: new Date().toISOString(),
    database: db
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "aurel-backup-" +
    new Date().toISOString().slice(0, 10) + ".json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  toast("Backup downloaded.");
}

function importBackup(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);
      const imported = backup.database || backup;

      if (
        !imported ||
        !Array.isArray(imported.users) ||
        !Array.isArray(imported.projects) ||
        !Array.isArray(imported.favorites)
      ) {
        throw new Error("Invalid backup format.");
      }

      if (!confirm("Import this backup? Existing local data will be replaced.")) {
        return;
      }

      db = {
        ...createDefaultDB(),
        ...imported
      };

      saveDB();

      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (error) {
        console.warn(error);
      }

      currentUser = null;

      $("#app").classList.add("hidden");
      $("#auth-screen").classList.remove("hidden");

      setAuthMode("login");
      toast("Backup imported. Please log in again.");

    } catch (error) {
      console.error(error);
      toast("Could not import this backup file.");
    }
  };

  reader.onerror = () => toast("File could not be read.");

  reader.readAsText(file);
}

/* ==========================================
   STORAGE STATUS
========================================== */

function updateStorageStatus() {
  const status = $("#storage-status");
  if (!status) return;

  try {
    const used = new Blob(
      [localStorage.getItem(DB_KEY) || ""]
    ).size;

    status.textContent =
      `Active · ${(used / 1024).toFixed(1)} KB used`;
  } catch (error) {
    status.textContent = "Storage unavailable";
  }
}

/* ==========================================
   EVENT HANDLING
========================================== */

document.addEventListener("click", event => {
  const target = event.target.closest("button, a");
  if (!target) return;

  // Auth mode switch
  if (target.id === "auth-toggle") {
    setAuthMode(authMode === "login" ? "register" : "login");
    return;
  }

  // Route navigation
  if (target.dataset.route) {
    event.preventDefault();
    navigate(target.dataset.route);
    return;
  }

  // Favorites
  if (target.dataset.favorite) {
    toggleFavorite(target.dataset.favorite);
    return;
  }

  // Template details
  if (target.dataset.detail) {
    currentTemplate = target.dataset.detail;
    navigate("detail");
    return;
  }

  // Template customization
  if (target.dataset.use) {
    openEditor(target.dataset.use);
    return;
  }

  // Category filter
  if (target.dataset.category) {
    activeCategory = target.dataset.category;
    navigate("templates");
    return;
  }

  // Open category from category page
  if (target.dataset.openCategory) {
    activeCategory = target.dataset.openCategory;
    templateSearch = "";
    navigate("templates");
    return;
  }

  // Project actions
  if (target.dataset.openProject) {
    loadProject(target.dataset.openProject);
    return;
  }

  if (target.dataset.deleteProject) {
    deleteProject(target.dataset.deleteProject);
    return;
  }

  // Device preview
  if (target.dataset.device) {
    const frame = $("#preview-frame");

    if (frame) {
      frame.classList.remove("tablet", "mobile");

      if (target.dataset.device !== "desktop") {
        frame.classList.add(target.dataset.device);
      }
    }

    $$(".device-switch button").forEach(button => {
      button.classList.toggle(
        "active",
        button === target
      );
    });

    return;
  }

  // General actions
  switch (target.dataset.action) {
    case "save-project":
      saveProject();
      break;

    case "reset-editor":
      resetEditor();
      break;

    case "export":
      exportBackup();
      break;

    case "import":
      $("#import-file").click();
      break;

    case "logout":
      logout();
      break;

    case "storage-info":
      updateStorageStatus();
      toast("Your data is stored in this browser.");
      break;

    case "clear-search":
      templateSearch = "";
      activeCategory = "All";
      navigate("templates");
      break;
  }
});

// Live template search
document.addEventListener("input", event => {
  if (event.target.id === "template-search") {
    const position = event.target.selectionStart;

    templateSearch = event.target.value;

    const container = $("#page-content");
    const oldScroll = window.scrollY;

    renderPage();

    const newInput = $("#template-search");
    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(position, position);
    }

    window.scrollTo(0, oldScroll);
  }

  if (event.target.id.startsWith("edit-")) {
    updateEditorPreview();
  }
});

// Form handling
document.addEventListener("submit", event => {
  if (event.target.id === "auth-form") {
    handleAuth(event);
  }
});

/* ==========================================
   INITIALIZATION
========================================== */

function initializeAurel() {
  try {
    $("#year").textContent = new Date().getFullYear();

    $("#auth-guest").addEventListener("click", startGuest);

    $("#mobile-menu").addEventListener("click", () => {
      $("#sidebar").classList.toggle("open");
    });

    $("#top-login").addEventListener("click", () => {
      if (currentUser) {
        logout();
      } else {
        $("#auth-screen").classList.remove("hidden");
        $("#app").classList.add("hidden");
      }
    });

    $("#import-file").addEventListener("change", event => {
      importBackup(event.target.files[0]);
      event.target.value = "";
    });

    setAuthMode("login");

    if (!restoreSession()) {
      $("#auth-screen").classList.remove("hidden");
      $("#app").classList.add("hidden");
    }

    updateStorageStatus();

    console.log("AUREL Studio loaded successfully.");

  } catch (error) {
    console.error("AUREL initialization error:", error);
    alert("AUREL Error: " + error.message);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAurel);
} else {
  initializeAurel();
}

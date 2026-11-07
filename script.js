
"use strict";

/* =========================================
   AUREL STUDIO — MAIN JAVASCRIPT
   Local-only storage. No payment system.
========================================= */

const DB_KEY = "aurel_studio_data_v1";
const SESSION_KEY = "aurel_studio_session_v1";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let db = loadDB();
let currentUser = null;
let authMode = "login";
let activeRoute = "home";
let activeCategory = "All";
let selectedTemplate = null;
let editorData = null;
let toastTimer = null;

const templates = [
  {
    id: "modern-portfolio",
    name: "Modern Portfolio",
    category: "Portfolio",
    description: "A clean personal portfolio for creators and professionals.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900",
    accent: "#bd7658",
    heading: "Create Your Own Story",
    subtitle: "A personal space to showcase your work and ideas.",
    layout: "Modern",
    sections: ["Hero", "About", "Projects", "Contact"]
  },
  {
    id: "creative-agency",
    name: "Creative Agency",
    category: "Business",
    description: "A bold agency layout for creative teams.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900",
    accent: "#a85c45",
    heading: "Ideas Into Impact",
    subtitle: "We turn creative thinking into meaningful experiences.",
    layout: "Bold",
    sections: ["Hero", "Services", "Team", "Contact"]
  },
  {
    id: "fashion-studio",
    name: "Fashion Studio",
    category: "Fashion",
    description: "Editorial-style layout for fashion and lifestyle brands.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900",
    accent: "#9b6b55",
    heading: "Style With Purpose",
    subtitle: "Discover a new perspective on everyday style.",
    layout: "Editorial",
    sections: ["Hero", "Collection", "Story", "Contact"]
  },
  {
    id: "food-journal",
    name: "Food Journal",
    category: "Food",
    description: "A warm recipe and food blog design.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900",
    accent: "#b66b3e",
    heading: "Good Food, Good Mood",
    subtitle: "Explore recipes, ingredients and kitchen stories.",
    layout: "Warm",
    sections: ["Hero", "Recipes", "About", "Newsletter"]
  },
  {
    id: "architecture",
    name: "Architecture Studio",
    category: "Architecture",
    description: "Minimal presentation for architecture projects.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
    accent: "#8a7966",
    heading: "Spaces That Inspire",
    subtitle: "Thoughtful spaces designed around everyday life.",
    layout: "Minimal",
    sections: ["Hero", "Projects", "Approach", "Contact"]
  },
  {
    id: "online-learning",
    name: "Online Learning",
    category: "Education",
    description: "A course and learning platform landing page.",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900",
    accent: "#5c806b",
    heading: "Learn Something New",
    subtitle: "Build knowledge through simple learning experiences.",
    layout: "Education",
    sections: ["Hero", "Courses", "Benefits", "Contact"]
  },
  {
    id: "travel-journal",
    name: "Travel Journal",
    category: "Travel",
    description: "A visual travel blog and destination layout.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900",
    accent: "#668c91",
    heading: "Find Your Next Journey",
    subtitle: "Stories and inspiration from places near and far.",
    layout: "Travel",
    sections: ["Hero", "Destinations", "Stories", "Contact"]
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    category: "Technology",
    description: "A modern landing page for a technology product.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900",
    accent: "#567d83",
    heading: "Build What Comes Next",
    subtitle: "Technology and ideas for a changing world.",
    layout: "Modern",
    sections: ["Hero", "Features", "About", "Contact"]
  },
  {
    id: "beauty-brand",
    name: "Beauty Brand",
    category: "Beauty",
    description: "A soft and elegant beauty brand presentation.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900",
    accent: "#bd806e",
    heading: "Feel Naturally Beautiful",
    subtitle: "A thoughtful approach to everyday beauty.",
    layout: "Elegant",
    sections: ["Hero", "Products", "Story", "Contact"]
  },
  {
    id: "event-landing",
    name: "Event Landing",
    category: "Events",
    description: "A stylish event information and schedule page.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",
    accent: "#b16b4b",
    heading: "Make It A Moment",
    subtitle: "Everything you need to know about the next event.",
    layout: "Event",
    sections: ["Hero", "Schedule", "Venue", "Contact"]
  },
  {
    id: "interior-gallery",
    name: "Interior Gallery",
    category: "Architecture",
    description: "A visual gallery for interior design projects.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900",
    accent: "#9b8064",
    heading: "Spaces With Character",
    subtitle: "Explore ideas for comfortable and beautiful spaces.",
    layout: "Gallery",
    sections: ["Hero", "Gallery", "About", "Contact"]
  },
  {
    id: "personal-blog",
    name: "Personal Blog",
    category: "Blog",
    description: "A readable blog layout for personal writing.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900",
    accent: "#9b725a",
    heading: "Thoughts & Stories",
    subtitle: "A place for ideas, experiences and conversations.",
    layout: "Classic",
    sections: ["Hero", "Latest Posts", "About", "Contact"]
  }
];

const categories = [
  ["Portfolio", "Personal work and creative showcases", "✦"],
  ["Business", "Business and agency websites", "▣"],
  ["Fashion", "Fashion and lifestyle layouts", "◇"],
  ["Food", "Food, recipes and restaurant pages", "⌁"],
  ["Architecture", "Architecture and interior showcases", "⌂"],
  ["Education", "Learning and course websites", "▤"],
  ["Travel", "Travel blogs and destination pages", "⌖"],
  ["Technology", "Technology and startup layouts", "⌘"],
  ["Beauty", "Beauty and wellness presentations", "✧"],
  ["Events", "Event and occasion websites", "◷"],
  ["Blog", "Personal and editorial blogs", "≡"]
];

const featureList = [
  ["Local Workspace", "Save your projects in this browser on this device."],
  ["Template Library", "Browse and open the available website layouts."],
  ["Visual Editing", "Change headings, text, colours and layout details."],
  ["Live Preview", "Preview your design in desktop, tablet and mobile sizes."],
  ["Favorites", "Keep your favourite templates in one place."],
  ["Project Saving", "Save edited designs to your local workspace."],
  ["Backup Export", "Download a JSON backup of your local data."],
  ["Backup Import", "Restore a previously exported AUREL backup."],
  ["Guest Access", "Explore the studio without creating a profile."],
  ["Custom Branding", "Change your website title and accent colour."],
  ["Category Browsing", "Explore templates by their categories."],
  ["Responsive Layout", "Use the studio on desktop, tablet and mobile."]
];

/* DATABASE */

function loadDB() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) {
      return {
        users: [],
        projects: [],
        favorites: [],
        settings: {
          theme: "light",
          compact: false
        }
      };
    }

    const data = JSON.parse(saved);

    return {
      users: Array.isArray(data.users) ? data.users : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      favorites: Array.isArray(data.favorites) ? data.favorites : [],
      settings: data.settings || {
        theme: "light",
        compact: false
      }
    };
  } catch (error) {
    console.error("AUREL database error:", error);
    return {
      users: [],
      projects: [],
      favorites: [],
      settings: { theme: "light", compact: false }
    };
  }
}

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    updateStorageStatus();
    return true;
  } catch (error) {
    showToast("Storage is full or unavailable.");
    return false;
  }
}

function getUserKey() {
  return currentUser ? currentUser.username : "guest";
}

function userProjects() {
  return db.projects.filter(p => p.owner === getUserKey());
}

function userFavorites() {
  return db.favorites.filter(f => f.owner === getUserKey());
}

function updateStorageStatus() {
  const status = $("#storage-status");
  if (status) {
    status.textContent = "Local storage active";
  }
}

/* HELPERS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function makeId() {
  return "project_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getTemplate(id) {
  return templates.find(t => t.id === id);
}

function getProject(id) {
  return db.projects.find(p => p.id === id && p.owner === getUserKey());
}

function getCurrentTemplateData() {
  if (!editorData) {
    editorData = {
      id: "new-design",
      name: "My New Website",
      category: "Portfolio",
      heading: "Create Your Own Story",
      subtitle: "Start building your next great website.",
      accent: "#bd7658",
      image: templates[0].image,
      sections: ["Hero", "About", "Projects", "Contact"]
    };
  }
  return editorData;
}

/* LOCAL PASSWORD HASHING
   This is basic local protection, not secure cloud authentication.
*/

async function hashPassword(password) {
  if (window.crypto && crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)]
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  throw new Error("Secure password hashing is unavailable in this browser.");
}

/* AUTHENTICATION */

function setAuthMode(mode) {
  authMode = mode;

  $("#auth-title").textContent =
    mode === "register" ? "Create your space." : "Welcome to AUREL.";

  $("#auth-submit").textContent =
    mode === "register" ? "Create local account" : "Log in";

  $("#auth-name-wrap").classList.toggle("hidden", mode !== "register");

  $("#auth-switch").innerHTML =
    mode === "register"
      ? 'Already have an account? <button class="text-button" id="auth-toggle">Log in</button>'
      : 'New here? <button class="text-button" id="auth-toggle">Create account</button>';

  $("#auth-toggle").addEventListener("click", () => {
    setAuthMode(authMode === "login" ? "register" : "login");
  });
}

async function handleAuth(event) {
  event.preventDefault();

  const username = $("#auth-username").value.trim().toLowerCase();
  const password = $("#auth-password").value;
  const displayName = $("#auth-name").value.trim();

  if (username.length < 3 || password.length < 4) {
    showToast("Enter a valid username and password.");
    return;
  }

  try {
    const passwordHash = await hashPassword(password);

    if (authMode === "register") {
      if (db.users.some(user => user.username === username)) {
        showToast("That username already exists on this device.");
        return;
      }

      const user = {
        username,
        displayName: displayName || username,
        passwordHash,
        createdAt: new Date().toISOString()
      };

      db.users.push(user);
      saveDB();

      startSession({
        username: user.username,
        displayName: user.displayName,
        guest: false
      });

      showToast("Local account created.");
      return;
    }

    const user = db.users.find(item => item.username === username);

    if (!user || user.passwordHash !== passwordHash) {
      showToast("Incorrect username or password.");
      return;
    }

    startSession({
      username: user.username,
      displayName: user.displayName,
      guest: false
    });

    showToast("Welcome back.");
  } catch (error) {
    showToast(error.message || "Could not complete login.");
  }
}

function startGuest() {
  startSession({
    username: "guest",
    displayName: "Guest",
    guest: true
  });

  showToast("Guest mode activated.");
}

function startSession(user) {
  currentUser = user;

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));

  $("#auth-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");

  updateUserInterface();
  navigate("home");
}

function restoreSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (session && session.username) {
      currentUser = session;
      $("#auth-screen").classList.add("hidden");
      $("#app").classList.remove("hidden");
      updateUserInterface();
      navigate("home");
      return true;
    }
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
  }

  return false;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  currentUser = null;
  editorData = null;

  $("#app").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");
  $("#auth-form").reset();

  setAuthMode("login");
  showToast("You have logged out.");
}

function updateUserInterface() {
  const name = currentUser.displayName || "Guest";
  const initial = name.charAt(0).toUpperCase();

  $("#sidebar-user").textContent = name;
  $("#sidebar-avatar").textContent = initial;
  $("#top-avatar").textContent = initial;

  $("#top-login").textContent =
    currentUser.guest ? "Log in" : "Log out";

  $("#top-login").onclick = () => {
    if (currentUser.guest) {
      logout();
    } else {
      logout();
    }
  };
}

/* NAVIGATION */

function navigate(route, data = null) {
  activeRoute = route;

  if (data) {
    selectedTemplate = data;
  }

  $$(".nav-link[data-route]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.route === route
    );
  });

  const labels = {
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

  $("#page-crumb").textContent = labels[route] || "AUREL";

  $("#sidebar").classList.remove("open");

  const renderers = {
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

  const renderer = renderers[route];

  if (renderer) {
    renderer();
  } else {
    renderHome();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* TEMPLATE CARDS */

function templateCard(template) {
  const isSaved = userFavorites().some(
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
          class="favorite-btn ${isSaved ? "saved" : ""}"
          data-favorite="${template.id}"
          title="Toggle favorite"
        >${isSaved ? "♥" : "♡"}</button>
      </div>

      <div class="template-info">
        <h3>${escapeHTML(template.name)}</h3>
        <p>${escapeHTML(template.description)}</p>

        <div class="template-meta">
          <small>${escapeHTML(template.layout)} layout</small>

          <div class="template-actions">
            <button class="btn btn-outline" data-detail="${template.id}">
              Details
            </button>
            <button class="btn btn-primary" data-use="${template.id}">
              Use
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindTemplateButtons() {
  $$("[data-favorite]").forEach(button => {
    button.addEventListener("click", () => {
      toggleFavorite(button.dataset.favorite);
    });
  });

  $$("[data-use]").forEach(button => {
    button.addEventListener("click", () => {
      openEditor(button.dataset.use);
    });
  });

  $$("[data-detail]").forEach(button => {
    button.addEventListener("click", () => {
      navigate("detail", button.dataset.detail);
    });
  });
}

function toggleFavorite(templateId) {
  const index = db.favorites.findIndex(item =>
    item.owner === getUserKey() &&
    item.templateId === templateId
  );

  if (index >= 0) {
    db.favorites.splice(index, 1);
    showToast("Removed from favorites.");
  } else {
    db.favorites.push({
      owner: getUserKey(),
      templateId
    });
    showToast("Added to favorites.");
  }

  saveDB();

  if (activeRoute === "favorites") renderFavorites();
  else if (activeRoute === "templates") renderTemplates();
  else if (activeRoute === "home") renderHome();
  else if (activeRoute === "categories") renderCategories();
}

/* HOME */

function renderHome() {
  const projects = userProjects();
  const favorites = userFavorites();

  $("#page-content").innerHTML = `
    <div class="hero">
      <div class="hero-copy">
        <div class="eyebrow">WEBSITE TEMPLATE DESIGN STUDIO</div>
        <h1>Make your ideas look extraordinary.</h1>
        <p>
          Explore website layouts, customize your design,
          save your projects and preview your work.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-go="templates">
            Explore Templates
          </button>
          <button class="btn btn-outline" data-go="editor">
            Open Visual Editor
          </button>
        </div>
      </div>

      <div class="hero-art">
        <div class="mock-window">
          <div class="mock-top"><i></i><i></i><i></i></div>
          <div class="mock-banner">AUREL Studio</div>
          <div class="mock-lines">
            <i></i><i></i><i></i>
          </div>
        </div>
        <div class="float-card">Your next design starts here</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <small>Available templates</small>
        <strong>${templates.length}</strong>
        <span>Currently in this library</span>
      </div>
      <div class="stat-card">
        <small>Your projects</small>
        <strong>${projects.length}</strong>
        <span>Saved on this device</span>
      </div>
      <div class="stat-card">
        <small>Your favorites</small>
        <strong>${favorites.length}</strong>
        <span>Saved templates</span>
      </div>
      <div class="stat-card">
        <small>Categories</small>
        <strong>${categories.length}</strong>
        <span>Explore different styles</span>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h2>Explore the collection</h2>
        <p>Choose a starting point for your next design.</p>
      </div>
      <button class="btn btn-outline" data-go="templates">View all</button>
    </div>

    <div class="template-grid">
      ${templates.slice(0, 3).map(templateCard).join("")}
    </div>

    <div class="section-head">
      <div>
        <h2>Studio tools</h2>
        <p>Useful tools for your website design workflow.</p>
      </div>
    </div>

    <div class="feature-grid">
      ${featureList.slice(0, 6).map(item => `
        <div class="feature-card">
          <div class="feature-icon">✦</div>
          <b>${escapeHTML(item[0])}</b>
          <p>${escapeHTML(item[1])}</p>
        </div>
      `).join("")}
    </div>
  `;

  bindPageActions();
  bindTemplateButtons();
}

/* TEMPLATE LIBRARY */

function renderTemplates(filter = "All", search = "") {
  const query = search.toLowerCase();

  const filtered = templates.filter(template => {
    const matchesCategory =
      filter === "All" || template.category === filter;

    const matchesSearch =
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">THE COLLECTION</div>
        <h1>Template Library</h1>
        <p>Browse the available layouts and choose one to customize.</p>
      </div>
      <button class="btn btn-primary" data-go="editor">Create New Design</button>
    </div>

    <div class="search-box">
      <span>⌕</span>
      <input
        id="template-search"
        type="search"
        placeholder="Search templates..."
        value="${escapeHTML(search)}"
      >
    </div>

    <div class="filter-row">
      ${["All", ...categories.map(c => c[0])].map(category => `
        <button
          class="chip ${filter === category ? "active" : ""}"
          data-filter="${escapeHTML(category)}"
        >${escapeHTML(category)}</button>
      `).join("")}
    </div>

    <p class="muted">${filtered.length} available template(s)</p>

    <div class="template-grid" id="template-results">
      ${filtered.length
        ? filtered.map(templateCard).join("")
        : `<div class="empty-state">
            <h3>No templates found</h3>
            <p>Try a different search or category.</p>
          </div>`
      }
    </div>
  `;

  $("#template-search").addEventListener("input", event => {
    const currentSearch = event.target.value;
    const activeChip = $(".chip.active");
    const currentFilter = activeChip ? activeChip.dataset.filter : "All";

    const results = templates.filter(template => {
      const categoryMatch =
        currentFilter === "All" || template.category === currentFilter;

      const searchMatch =
        template.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        template.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        template.category.toLowerCase().includes(currentSearch.toLowerCase());

      return categoryMatch && searchMatch;
    });

    $("#template-results").innerHTML = results.length
      ? results.map(templateCard).join("")
      : `<div class="empty-state">
          <h3>No templates found</h3>
          <p>Try another search.</p>
        </div>`;

    bindTemplateButtons();
  });

  $$("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      renderTemplates(button.dataset.filter, $("#template-search").value);
    });
  });

  bindPageActions();
  bindTemplateButtons();
}

/* EDITOR */

function openEditor(templateId) {
  const template = getTemplate(templateId);

  if (!template) {
    showToast("Template not found.");
    return;
  }

  editorData = {
    ...template,
    sections: [...template.sections]
  };

  navigate("editor");
}

function openProject(projectId) {
  const project = getProject(projectId);

  if (!project) {
    showToast("Project not found.");
    return;
  }

  editorData = {
    ...project.data,
    projectId: project.id
  };

  navigate("editor");
}

function renderEditor() {
  const data = getCurrentTemplateData();

  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">DESIGN WORKSPACE</div>
        <h1>Visual Editor</h1>
        <p>Change your website content and preview the result.</p>
      </div>
      <button class="btn btn-primary" id="save-project">Save Project</button>
    </div>

    <div class="editor-layout">
      <div class="editor-panel">
        <h3>Design controls</h3>

        <div class="control-group">
          <label for="edit-name">Project name</label>
          <input id="edit-name" value="${escapeHTML(data.name)}" maxlength="70">
        </div>

        <div class="control-group">
          <label for="edit-heading">Main heading</label>
          <input id="edit-heading" value="${escapeHTML(data.heading)}" maxlength="100">
        </div>

        <div class="control-group">
          <label for="edit-subtitle">Description</label>
          <textarea id="edit-subtitle" rows="3" maxlength="250">${escapeHTML(data.subtitle)}</textarea>
        </div>

        <div class="control-group">
          <label for="edit-accent">Accent colour</label>
          <input
            class="color-input"
            id="edit-accent"
            type="color"
            value="${escapeHTML(data.accent || "#bd7658")}"
          >
        </div>

        <div class="control-group">
          <label for="edit-category">Category</label>
          <select id="edit-category">
            ${categories.map(c => `
              <option value="${escapeHTML(c[0])}"
                ${data.category === c[0] ? "selected" : ""}>
                ${escapeHTML(c[0])}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="control-group">
          <label for="edit-image">Preview image URL</label>
          <input
            id="edit-image"
            type="url"
            value="${escapeHTML(data.image || "")}"
            placeholder="https://example.com/image.jpg"
          >
        </div>

        <button class="btn btn-outline full" id="reset-editor">
          Reset to Template
        </button>

        <button class="btn btn-primary full" id="save-project-2">
          Save to Workspace
        </button>

        <p class="tiny">
          The editor currently changes the preview content and theme.
          It does not generate a complete downloadable HTML website yet.
        </p>
      </div>

      <div class="editor-preview">
        <div class="preview-toolbar">
          <b>Live Preview</b>
          <div class="device-switch">
            <button class="active" data-device="desktop">Desktop</button>
            <button data-device="tablet">Tablet</button>
            <button data-device="mobile">Mobile</button>
          </div>
        </div>

        <div class="preview-frame" id="preview-frame">
          <div class="site-preview" id="site-preview"></div>
        </div>
      </div>
    </div>
  `;

  bindEditorControls();
  updatePreview();
}

function bindEditorControls() {
  const fields = [
    ["edit-name", "name"],
    ["edit-heading", "heading"],
    ["edit-subtitle", "subtitle"],
    ["edit-accent", "accent"],
    ["edit-category", "category"],
    ["edit-image", "image"]
  ];

  fields.forEach(([id, key]) => {
    $("#" + id).addEventListener("input", event => {
      getCurrentTemplateData()[key] = event.target.value;
      updatePreview();
    });

    $("#" + id).addEventListener("change", event => {
      getCurrentTemplateData()[key] = event.target.value;
      updatePreview();
    });
  });

  $("#save-project").addEventListener("click", saveProject);
  $("#save-project-2").addEventListener("click", saveProject);

  $("#reset-editor").addEventListener("click", () => {
    const template = getTemplate(editorData.id);

    if (!template) {
      showToast("No original template is available to reset.");
      return;
    }

    editorData = {
      ...template,
      sections: [...template.sections]
    };

    renderEditor();
    showToast("Editor reset to original template.");
  });

  $$("[data-device]").forEach(button => {
    button.addEventListener("click", () => {
      $$(".device-switch button").forEach(item =>
        item.classList.remove("active")
      );

      button.classList.add("active");

      $("#preview-frame").className =
        "preview-frame " +
        (button.dataset.device === "desktop" ? "" : button.dataset.device);
    });
  });
}

function updatePreview() {
  const data = getCurrentTemplateData();
  const preview = $("#site-preview");

  if (!preview) return;

  const accent = /^#[0-9a-f]{6}$/i.test(data.accent)
    ? data.accent
    : "#bd7658";

  const image = data.image
    ? `<img src="${escapeHTML(data.image)}"
        alt="Website preview"
        style="width:100%;height:100%;object-fit:cover"
        onerror="this.style.display='none'">`
    : "";

  preview.style.setProperty("--site-accent", accent);

  preview.innerHTML = `
    <div class="site-nav">
      <span>${escapeHTML(data.name || "MY WEBSITE")}</span>
      <span>Home　 About　 Projects　 Contact</span>
    </div>

    <section class="site-hero">
      <small>${escapeHTML(data.category || "WEBSITE DESIGN")}</small>
      <h1>${escapeHTML(data.heading || "Your Website Heading")}</h1>
      <p>${escapeHTML(data.subtitle || "Your website description goes here.")}</p>
      <button type="button">Explore More</button>
    </section>

    <div class="site-cards">
      <div class="site-card">Discover</div>
      <div class="site-card">Create</div>
      <div class="site-card">Inspire</div>
    </div>

    <div class="site-footer">
      © ${new Date().getFullYear()} ${escapeHTML(data.name || "My Website")}
    </div>
  `;
}

function saveProject() {
  if (!editorData) {
    showToast("Open a template first.");
    return;
  }

  const projectData = {
    ...editorData,
    sections: Array.isArray(editorData.sections)
      ? [...editorData.sections]
      : []
  };

  const existing = editorData.projectId
    ? getProject(editorData.projectId)
    : null;

  if (existing) {
    existing.name = projectData.name || "Untitled Project";
    existing.data = projectData;
    existing.updatedAt = new Date().toISOString();
  } else {
    const project = {
      id: makeId(),
      owner: getUserKey(),
      name: projectData.name || "Untitled Project",
      data: projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.projects.push(project);
    editorData.projectId = project.id;
  }

  if (saveDB()) {
    showToast("Project saved to this device.");
  }
}

/* WORKSPACE */

function renderWorkspace() {
  const projects = userProjects();

  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">YOUR DESIGNS</div>
        <h1>My Workspace</h1>
        <p>Your saved website projects are stored in this browser.</p>
      </div>
      <button class="btn btn-primary" data-go="editor">New Project</button>
    </div>

    ${
      projects.length
        ? `<div class="template-grid">
            ${projects.map(project => `
              <article class="template-card">
                <div class="template-thumb">
                  <div style="
                    height:100%;
                    display:grid;
                    place-items:center;
                    background:${escapeHTML(project.data.accent || "#bd7658")};
                    color:white;
                    font:26px 'Playfair Display';
                  ">${escapeHTML(project.name)}</div>
                </div>

                <div class="template-info">
                  <h3>${escapeHTML(project.name)}</h3>
                  <p>Last saved: ${formatDate(project.updatedAt)}</p>

                  <div class="template-actions">
                    <button class="btn btn-primary" data-open-project="${project.id}">
                      Edit
                    </button>
                    <button class="btn btn-outline" data-delete-project="${project.id}">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            `).join("")}
          </div>`
        : `<div class="empty-state">
            <h3>Your workspace is empty</h3>
            <p>Choose a template and save your first project.</p>
            <button class="btn btn-primary" data-go="templates">Browse Templates</button>
          </div>`
    }
  `;

  bindPageActions();

  $$("[data-open-project]").forEach(button => {
    button.addEventListener("click", () => {
      openProject(button.dataset.openProject);
    });
  });

  $$("[data-delete-project]").forEach(button => {
    button.addEventListener("click", () => {
      const confirmed = confirm("Delete this saved project from this device?");
      if (!confirmed) return;

      db.projects = db.projects.filter(project =>
        !(project.id === button.dataset.deleteProject &&
          project.owner === getUserKey())
      );

      saveDB();
      renderWorkspace();
      showToast("Project deleted.");
    });
  });
}

/* FAVORITES */

function renderFavorites() {
  const ids = userFavorites().map(item => item.templateId);
  const savedTemplates = templates.filter(template =>
    ids.includes(template.id)
  );

  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">YOUR COLLECTION</div>
        <h1>Favorites</h1>
        <p>Templates you have saved for later.</p>
      </div>
      <button class="btn btn-outline" data-go="templates">Browse Templates</button>
    </div>

    ${
      savedTemplates.length
        ? `<div class="template-grid">
            ${savedTemplates.map(templateCard).join("")}
          </div>`
        : `<div class="empty-state">
            <h3>No favorites yet</h3>
            <p>Tap the heart icon on a template to save it here.</p>
            <button class="btn btn-primary" data-go="templates">Explore Templates</button>
          </div>`
    }
  `;

  bindPageActions();
  bindTemplateButtons();
}

/* CATEGORIES */

function renderCategories() {
  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">FIND YOUR STYLE</div>
        <h1>Categories</h1>
        <p>Explore layouts based on the type of website you want to create.</p>
      </div>
    </div>

    <div class="category-grid">
      ${categories.map(category => `
        <button class="category-card" data-category="${escapeHTML(category[0])}">
          <span class="category-symbol">${escapeHTML(category[2])}</span>
          <h3>${escapeHTML(category[0])}</h3>
          <p>${escapeHTML(category[1])}</p>
        </button>
      `).join("")}
    </div>
  `;

  $$("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      navigate("templates");
      renderTemplates(button.dataset.category);
    });
  });
}

/* INSPIRATION */

function renderInspiration() {
  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">IDEAS FOR YOUR NEXT PROJECT</div>
        <h1>Inspiration</h1>
        <p>Use these design principles when planning a website.</p>
      </div>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">01</div>
        <b>Keep the first screen clear</b>
        <p>Make the main heading, purpose and primary action easy to understand.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">02</div>
        <b>Use a consistent palette</b>
        <p>Choose a small set of colours and reuse them throughout the site.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">03</div>
        <b>Make text readable</b>
        <p>Use clear font sizes, good contrast and enough spacing.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">04</div>
        <b>Design for mobile</b>
        <p>Check that navigation, buttons and content work on small screens.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">05</div>
        <b>Use real images</b>
        <p>Choose images that genuinely relate to the content of the website.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">06</div>
        <b>Keep navigation simple</b>
        <p>Help visitors find important information without unnecessary steps.</p>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h2>Start with a template</h2>
        <p>Choose a layout and experiment with your own content.</p>
      </div>
      <button class="btn btn-primary" data-go="templates">Explore Templates</button>
    </div>
  `;

  bindPageActions();
}

/* HELP */

function renderHelp() {
  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">AUREL SUPPORT</div>
        <h1>Help Center</h1>
        <p>Understand how the current studio works.</p>
      </div>
    </div>

    <div class="help-list">
      <div class="help-item">
        <h3>How do I start a design?</h3>
        <p>Open Template Library, choose a template and press Use. You can then edit its heading, description and accent colour.</p>
      </div>

      <div class="help-item">
        <h3>Where are my projects saved?</h3>
        <p>Projects are saved in your browser's local storage on this device. They do not automatically sync to another device.</p>
      </div>

      <div class="help-item">
        <h3>Can I use AUREL without an account?</h3>
        <p>Yes. Select Continue as Guest. Guest projects are stored under the guest workspace in this browser.</p>
      </div>

      <div class="help-item">
        <h3>How do I move my projects?</h3>
        <p>Open Settings and export a backup JSON file. On the other device, open AUREL and import that backup.</p>
      </div>

      <div class="help-item">
        <h3>Is this cloud authentication?</h3>
        <p>No. The account system is local to this browser. It is not a secure online account service.</p>
      </div>

      <div class="help-item">
        <h3>Does AUREL have payments?</h3>
        <p>No payment or checkout system is included in this version.</p>
      </div>

      <div class="help-item">
        <h3>Can I export a finished website?</h3>
        <p>The current editor saves project settings and shows a live preview. A complete HTML/CSS website export is not included yet.</p>
      </div>
    </div>
  `;
}

/* SETTINGS */

function renderSettings() {
  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">PREFERENCES & DATA</div>
        <h1>Settings</h1>
        <p>Manage your local data and studio preferences.</p>
      </div>
    </div>

    <div class="settings-grid">
      <div class="setting-card">
        <h3>Export backup</h3>
        <p>Download your projects, favorites, profiles and settings as a JSON backup file.</p>
        <div class="setting-actions">
          <button class="btn btn-primary" id="export-backup">Export Backup</button>
        </div>
      </div>

      <div class="setting-card">
        <h3>Import backup</h3>
        <p>Restore data from a backup file previously exported from AUREL.</p>
        <div class="setting-actions">
          <button class="btn btn-outline" id="import-backup">Choose Backup File</button>
        </div>
      </div>

      <div class="setting-card">
        <h3>Local data</h3>
        <p>Your data is stored in this browser. Clearing site data can permanently erase it.</p>
        <div class="setting-actions">
          <button class="btn btn-outline" id="show-data-info">Storage Information</button>
        </div>
      </div>

      <div class="setting-card">
        <h3>Reset workspace</h3>
        <p>Delete the projects and favorites belonging to the current profile.</p>
        <div class="setting-actions">
          <button class="btn btn-outline" id="reset-workspace">Reset My Workspace</button>
        </div>
      </div>
    </div>
  `;

  $("#export-backup").addEventListener("click", exportBackup);
  $("#import-backup").addEventListener("click", () => $("#import-file").click());

  $("#show-data-info").addEventListener("click", () => {
    alert(
      "AUREL stores data in this browser on this device. " +
      "It does not automatically sync across devices. " +
      "Export a backup before clearing browser data."
    );
  });

  $("#reset-workspace").addEventListener("click", () => {
    const confirmed = confirm(
      "Delete all projects and favorites for the current profile?"
    );

    if (!confirmed) return;

    db.projects = db.projects.filter(p => p.owner !== getUserKey());
    db.favorites = db.favorites.filter(f => f.owner !== getUserKey());

    saveDB();
    showToast("Current workspace reset.");
    renderSettings();
  });
}

/* PROFILE */

function renderProfile() {
  const name = currentUser.displayName || "Guest";

  $("#page-content").innerHTML = `
    <div class="page-heading">
      <div>
        <div class="eyebrow">YOUR ACCOUNT</div>
        <h1>Profile</h1>
        <p>Manage your local AUREL profile.</p>
      </div>
    </div>

    <div class="profile-hero">
      <div class="avatar">${escapeHTML(name.charAt(0).toUpperCase())}</div>
      <div>
        <h2>${escapeHTML(name)}</h2>
        <p class="muted">
          ${currentUser.guest ? "Guest profile" : "Local account"}
        </p>
      </div>
    </div>

    <div class="surface">
      <div class="control-group">
        <label for="profile-name">Display name</label>
        <input id="profile-name" value="${escapeHTML(name)}" maxlength="32">
      </div>

      <div class="setting-actions">
        <button class="btn btn-primary" id="save-profile">Save Profile</button>
        <button class="btn btn-outline" id="profile-logout">Log Out</button>
      </div>

      <p class="tiny">
        This profile exists only in this browser. It is not an online account.
      </p>
    </div>
  `;

  $("#save-profile").addEventListener("click", () => {
    const newName = $("#profile-name").value.trim();

    if (!newName) {
      showToast("Enter a display name.");
      return;
    }

    currentUser.displayName = newName;

    if (!currentUser.guest) {
      const user = db.users.find(
        item => item.username === currentUser.username
      );

      if (user) user.displayName = newName;
      saveDB();
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    updateUserInterface();
    renderProfile();
    showToast("Profile updated.");
  });

  $("#profile-logout").addEventListener("click", logout);
}

/* TEMPLATE DETAIL */

function renderDetail() {
  const template = getTemplate(selectedTemplate);

  if (!template) {
    navigate("templates");
    return;
  }

  $("#page-content").innerHTML = `
    <button class="btn btn-outline" id="back-templates">← Back to Library</button>

    <div class="detail-hero" style="margin-top:18px">
      <div>
        <div class="eyebrow">${escapeHTML(template.category)}</div>
        <h1>${escapeHTML(template.name)}</h1>
        <p>${escapeHTML(template.description)}</p>
        <p><b>Layout:</b> ${escapeHTML(template.layout)}</p>
        <div class="hero-actions">
          <button class="btn btn-primary" id="detail-use">Use This Template</button>
          <button class="btn btn-outline" id="detail-favorite">Add to Favorites</button>
        </div>
      </div>
      <img
        src="${escapeHTML(template.image)}"
        alt="${escapeHTML(template.name)}"
        onerror="this.style.display='none'"
      >
    </div>

    <div class="section-head">
      <div>
        <h2>Included sections</h2>
        <p>The planned content areas in this layout.</p>
      </div>
    </div>

    <div class="detail-list">
      ${template.sections.map(section => `
        <div class="surface">
          <h3>${escapeHTML(section)}</h3>
          <p>A section in the ${escapeHTML(template.name)} layout.</p>
        </div>
      `).join("")}
    </div>
  `;

  $("#back-templates").addEventListener("click", () => navigate("templates"));
  $("#detail-use").addEventListener("click", () => openEditor(template.id));
  $("#detail-favorite").addEventListener("click", () => toggleFavorite(template.id));
}

/* BACKUP EXPORT / IMPORT */

function exportBackup() {
  const backup = {
    app: "AUREL Studio",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: db
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "aurel-backup-" + new Date().toISOString().slice(0, 10) + ".json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Backup downloaded.");
}

function importBackup(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);
      const imported = backup.data || backup;

      if (
        !imported ||
        !Array.isArray(imported.users) ||
        !Array.isArray(imported.projects) ||
        !Array.isArray(imported.favorites)
      ) {
        throw new Error("Invalid AUREL backup file.");
      }

      const confirmed = confirm(
        "Import this backup? Existing local data will be replaced."
      );

      if (!confirmed) return;

      db = {
        users: imported.users,
        projects: imported.projects,
        favorites: imported.favorites,
        settings: imported.settings || {
          theme: "light",
          compact: false
        }
      };

      if (saveDB()) {
        showToast("Backup imported. Please log in again.");
        logout();
      }
    } catch (error) {
      showToast(error.message || "Could not import this file.");
    }

    $("#import-file").value = "";
  };

  reader.onerror = () => {
    showToast("Could not read the backup file.");
  };

  reader.readAsText(file);
}

/* GENERAL PAGE ACTIONS */

function bindPageActions() {
  $$("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      navigate(button.dataset.go);
    });
  });
}

/* INITIALIZATION */

function initializeAurel() {
  $("#year").textContent = new Date().getFullYear();

  $("#auth-form").addEventListener("submit", handleAuth);

  $("#auth-toggle").addEventListener("click", () => {
    setAuthMode("register");
  });

  $("#auth-guest").addEventListener("click", startGuest);

  $("#mobile-menu").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  $$(".nav-link[data-route]").forEach(button => {
    button.addEventListener("click", () => {
      navigate(button.dataset.route);
    });
  });

  $$("[data-route]").forEach(button => {
    if (button.classList.contains("nav-link")) return;

    button.addEventListener("click", event => {
      event.preventDefault();
      navigate(button.dataset.route);
    });
  });

  $("#import-file").addEventListener("change", event => {
    importBackup(event.target.files[0]);
  });

  setAuthMode("login");

  if (!restoreSession()) {
    $("#auth-screen").classList.remove("hidden");
    $("#app").classList.add("hidden");
  }

  updateStorageStatus();
}

document.addEventListener("DOMContentLoaded", initializeAurel);

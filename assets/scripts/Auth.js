// =====================================================
// assets/scripts/auth.js
// Coller ce script sur TOUTES les pages protégées
// <script src="../assets/scripts/auth.js"></script>
// =====================================================

const API_URL = "/api";

// ── Récupère le token stocké ──────────────────────────
function getToken() {
  return localStorage.getItem("token");
}

// ── Récupère l'user stocké ────────────────────────────
function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

// ── Redirige vers Login si pas connecté ───────────────
function requireAuth() {
  if (!getToken()) {
    window.location.href = "/pages/Login.html";
    return false;
  }
  return true;
}

// ── Déconnexion ───────────────────────────────────────
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/Login.html";
}

// ── Appel API authentifié ─────────────────────────────
// Usage : await apiFetch('/users/profile')
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Token expiré → déconnexion automatique
  if (response.status === 401) {
    logout();
    return null;
  }

  return response;
}

// ── Affiche les infos de l'user dans le header ────────
// Appelle cette fonction sur chaque page après le chargement
async function loadUserHeader(containerSelector = "#userHeader") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const user = getUser();
  if (!user) return;

  container.innerHTML = `
    <img src="${user.avatar}" alt="${user.username}" class="header-avatar"/>
    <span class="header-username">${user.username}</span>
    <span class="header-coins">🪙 ${user.coins ?? 0}</span>
    <button onclick="logout()" class="logout-btn">Déco</button>
  `;

  // Refresh les données depuis le serveur
  try {
    const res = await apiFetch("/users/profile");
    if (res && res.ok) {
      const fresh = await res.json();
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: fresh._id,
          username: fresh.username,
          email: fresh.email,
          avatar: fresh.avatar,
          coins: fresh.coins,
          stats: fresh.stats,
        }),
      );
      // Met à jour l'affichage avec les données fraîches
      container.querySelector(".header-coins").textContent =
        `🪙 ${fresh.coins}`;
    }
  } catch (e) {
    // Silencieux si le serveur est down
  }
}

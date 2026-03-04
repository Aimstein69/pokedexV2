// ===== SHARED UTILITIES =====
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/Login.html";
}

function updateAuthUI() {
  const token = getToken();
  const notAuthButtons = document.getElementById("notAuthButtons");
  const authButtons = document.getElementById("authButtons");

  if (!token || token.trim() === "") {
    window.location.href = "/pages/Login.html";
    return;
  }

  notAuthButtons.style.display = "none";
  authButtons.style.display = "flex";
}

// ===== FILTER / RENDER HELPERS =====
let allCards = [];
let activeFilter = null;

// Cache local pour éviter les requêtes répétées
const FR_CACHE = {};

async function resolveFrenchNames(cards) {
  const promises = cards.map(async (c) => {
    if (!c || !c.pokemonName) return c;
    let name = c.pokemonName;

    // Gérer préfixe shiny
    const shinyPrefixMatch = name.match(/^✨\s*/);
    const hasShinyPrefix = !!shinyPrefixMatch;
    const bare = name.replace(/^✨\s*/, "");

    const m = bare.match(/^Pokemon-(\d+)$/i);
    if (!m) return c;

    const id = m[1];
    if (FR_CACHE[id]) {
      c.pokemonName = (hasShinyPrefix ? "✨ " : "") + FR_CACHE[id];
      return c;
    }

    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${id}`,
      );
      if (res.ok) {
        const species = await res.json();
        const fr = species.names.find((n) => n.language.name === "fr")?.name;
        if (fr) {
          FR_CACHE[id] = fr;
          c.pokemonName = (hasShinyPrefix ? "✨ " : "") + fr;
        }
      }
    } catch (e) {
      // laisser le fallback
    }
    return c;
  });

  await Promise.all(promises);
}

function makeFilterBtn(label, typeClass, active, onClick) {
  const btn = document.createElement("button");
  btn.className = `filter-btn type-${typeClass}${active ? " active" : ""}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function buildTypeFilters() {
  const types = [...new Set(allCards.map((c) => c.type))].sort();
  const container = document.getElementById("typeFilters");
  if (!container) return;
  container.innerHTML = "";

  const allBtn = makeFilterBtn("Tous", "normal", true, () => {
    activeFilter = null;
    container
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    allBtn.classList.add("active");
    applyFilters();
  });
  container.appendChild(allBtn);

  types.forEach((type) => {
    const btn = makeFilterBtn(type, type, false, () => {
      activeFilter = type;
      container
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
    container.appendChild(btn);
  });
}

function applyFilters() {
  const qEl = document.getElementById("search");
  const q = qEl ? qEl.value.toLowerCase().trim() : "";
  let list = allCards;
  if (activeFilter) list = list.filter((c) => c.type === activeFilter);
  if (q)
    list = list.filter(
      (c) =>
        c.pokemonName.toLowerCase().includes(q) ||
        String(c.pokemonId).includes(q),
    );
  renderCards(list);
}

document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "search") applyFilters();
});

function renderCards(cards) {
  const grid = document.getElementById("cardsGrid");
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
  if (!grid) return;
  grid.innerHTML = "";
  cards.forEach((c, i) => grid.appendChild(createCard(c, i)));
}

function createCard(c, index) {
  const mainType = c.type;
  const hp = c.hp || 0;
  const atk = c.attack || 0;
  const def = c.defense || 0;
  const img = c.pokemonImage;
  const idNum = c.pokemonId || 0;

  const hpClass = hp >= 70 ? "hp-high" : hp >= 45 ? "hp-medium" : "hp-low";
  const hpPct = Math.min(100, (hp / 255) * 100);

  const card = document.createElement("div");
  card.className = "poke-card";
  card.style.animationDelay = `${(index % 20) * 0.04}s`;

  card.innerHTML = `
    <div class="card-header type-${mainType}">
      <span class="poke-number">#${String(idNum).padStart(3, "0")}</span>
      <img class="poke-img" src="${img}" alt="${c.pokemonName}" loading="lazy"/>
      <span class="poke-name">${c.pokemonName}</span>
      <div class="type-badges">
        <span class="type-badge type-${mainType}">${mainType}</span>
      </div>
    </div>
    <div class="card-body">
      <div class="stat-row">
        <span class="stat-label">❤️ PV</span>
        <span class="stat-value">${hp}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">⚔️ ATK</span>
        <span class="stat-value">${atk}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">🛡️ DEF</span>
        <span class="stat-value">${def}</span>
      </div>
      <div class="hp-wrap">
        <div class="hp-bar ${hpClass}" style="width:${hpPct}%"></div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    localStorage.setItem("selectedPokemon", idNum);
    window.location.href = "Pokedex.html";
  });

  return card;
}

// ===== LOAD / INIT =====
async function loadInventory() {
  const token = getToken();
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";

  try {
    const profileResponse = await fetch("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      const user = getUser();
      if (user) {
        user.tokens = profile.tokens;
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    const response = await fetch("/api/users/inventory", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Erreur API");

    const data = await response.json();
    allCards = data.inventory;

    // Résoudre les noms FR pour les cartes qui ont encore le placeholder "Pokemon-<id>"
    await resolveFrenchNames(allCards);

    // optional header count
    const heading = document.querySelector("main h2");
    if (heading) heading.textContent = `📦 Inventaire - ${data.total} cartes`;

    if (data.total === 0) {
      const grid = document.getElementById("cardsGrid");
      grid.innerHTML =
        '<p class="empty-message">📭 Ton inventaire est vide. Ouvre des packs pour obtenir des cartes !</p>';
      if (loader) loader.style.display = "none";
      return;
    }

    buildTypeFilters();
    renderCards(allCards);
  } catch (error) {
    console.error("Erreur :", error);
    const grid = document.getElementById("cardsGrid");
    if (grid) grid.innerHTML = "<h2>❌ Erreur de chargement</h2>";
  }
}

updateAuthUI();
loadInventory();
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  loadInventory();
});

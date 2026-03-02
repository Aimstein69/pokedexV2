const API = "https://pokeapi.co/api/v2";
const TOTAL = 151;

let allPokemons = [];
let activeFilter = null;

// ===== CHARGEMENT =====
async function fetchAllPokemons() {
  const loader = document.getElementById("loader");
  const grid = document.getElementById("cardsGrid");
  const progressBar = document.getElementById("progressBar");

  loader.style.display = "flex";
  grid.style.display = "none";

  // Liste des URLs
  const list = await fetch(`${API}/pokemon?limit=${TOTAL}`).then((r) =>
    r.json(),
  );

  // Fetch en parallèle avec suivi de progression
  let done = 0;
const promises = list.results.map(async (p) => {
  const data = await fetch(p.url).then((r) => r.json());

  // Récupérer les infos species (où se trouvent les noms FR)
  const species = await fetch(data.species.url).then((r) => r.json());

  // Chercher le nom français
  const frName =
    species.names.find((n) => n.language.name === "fr")?.name || data.name;

  data.frenchName = frName;

  done++;
  progressBar.style.width = `${(done / TOTAL) * 100}%`;

  return data;
});


  allPokemons = await Promise.all(promises);
  // Trier par numéro
  allPokemons.sort((a, b) => a.id - b.id);

  loader.style.display = "none";
  grid.style.display = "grid";

  buildTypeFilters();
  renderCards(allPokemons);
}

// ===== FILTRES TYPE =====
function buildTypeFilters() {
  const types = [
    ...new Set(allPokemons.flatMap((p) => p.types.map((t) => t.type.name))),
  ].sort();
  const container = document.getElementById("typeFilters");
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

function makeFilterBtn(label, typeClass, active, onClick) {
  const btn = document.createElement("button");
  btn.className = `filter-btn type-${typeClass}${active ? " active" : ""}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// ===== RECHERCHE + FILTRE =====
function applyFilters() {
  const q = document.getElementById("search").value.toLowerCase().trim();
  let list = allPokemons;
  if (activeFilter)
    list = list.filter((p) =>
      p.types.some((t) => t.type.name === activeFilter),
    );
  if (q)
    list = list.filter((p) => p.name.includes(q) || String(p.id).includes(q));
  renderCards(list);
}

document.getElementById("search").addEventListener("input", applyFilters);

// ===== RENDU =====
function renderCards(pokemons) {
  const grid = document.getElementById("cardsGrid");
  grid.innerHTML = "";
  pokemons.forEach((p, i) => grid.appendChild(createCard(p, i)));
}

function createCard(p, index) {
  const mainType = p.types[0].type.name;
  const hp = p.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0;
  const weight = (p.weight / 10).toFixed(1);
  const moves = p.moves.slice(0, 4).map((m) => m.move.name);
  const img =
    p.sprites?.other?.["official-artwork"]?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

  const hpClass = hp >= 70 ? "hp-high" : hp >= 45 ? "hp-medium" : "hp-low";
  const hpPct = Math.min(100, (hp / 255) * 100);

  const card = document.createElement("div");
  card.className = "poke-card";
  card.style.animationDelay = `${(index % 20) * 0.04}s`;

  card.innerHTML = `
    <div class="card-header type-${mainType}">
      <span class="poke-number">#${String(p.id).padStart(3, "0")}</span>
      <img class="poke-img" src="${img}" alt="${p.name}" loading="lazy"/>
      <span class="poke-name">${p.frenchName}</span>
      <div class="type-badges">
        ${p.types.map((t) => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`).join("")}
      </div>
    </div>
    <div class="card-body">
      <div class="stat-row">
        <span class="stat-label">⚖️ Poids</span>
        <span class="stat-value">${weight} kg</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">❤️ PV</span>
        <span class="stat-value">${hp}</span>
      </div>
      <div class="hp-wrap">
        <div class="hp-bar ${hpClass}" style="width:${hpPct}%"></div>
      </div>
      <div class="moves-section">
        <div class="moves-title">⚔️ Attaques</div>
        <div class="moves-list">
          ${moves.map((m) => `<span class="move-tag">${m.replace(/-/g, " ")}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    localStorage.setItem("selectedPokemon", p.id);
    window.location.href = "Pokedex.html";
  });

  return card;
}

// ===== START =====
fetchAllPokemons();

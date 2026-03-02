const API = "https://pokeapi.co/api/v2";
let currentId = parseInt(localStorage.getItem("selectedPokemon")) || 1;
let isShiny = false;

const STAT_LABELS = {
  hp: { label: "PV", cls: "s-hp" },
  attack: { label: "Attaque", cls: "s-atk" },
  defense: { label: "Défense", cls: "s-def" },
  "special-attack": { label: "Sp. Atk", cls: "s-spatk" },
  "special-defense": { label: "Sp. Def", cls: "s-spdef" },
  speed: { label: "Vitesse", cls: "s-speed" },
};

// ===== CHARGEMENT PRINCIPAL =====
async function loadPokemon(id) {
  currentId = id;
  localStorage.setItem("selectedPokemon", id);
  isShiny = false;

  // Fetch données de base + espèce en parallèle
  const [data] = await Promise.all([
    fetch(`${API}/pokemon/${id}`).then((r) => r.json()),
  ]);
  const speciesData = await fetch(data.species.url).then((r) => r.json());

  // Nom FR
  const frName =
    speciesData.names.find((n) => n.language.name === "fr")?.name || data.name;

  // Description FR
  const descEntry = speciesData.flavor_text_entries
    .filter((e) => e.language.name === "fr")
    .pop();
  const desc = descEntry
    ? descEntry.flavor_text.replace(/\f|\n/g, " ")
    : "Aucune description disponible.";

  // Catégorie FR
  const category =
    speciesData.genera.find((g) => g.language.name === "fr")?.genus || "–";

  // Type principal
  const mainType = data.types[0].type.name;

  // ===== DOM =====
  document.title = `Pokédex — ${frName}`;
  document.getElementById("headerNum").textContent =
    `#${String(id).padStart(3, "0")}`;
  document.getElementById("pokemonName").textContent = frName;
  document.getElementById("pokeDesc").textContent = desc;
  document.getElementById("infoWeight").textContent =
    `${(data.weight / 10).toFixed(1)} kg`;
  document.getElementById("infoHeight").textContent =
    `${(data.height / 10).toFixed(1)} m`;
  document.getElementById("infoCategory").textContent = category;

  // Image
  updateImage(data, false);

  // Fond dynamique
  document.querySelector(".bg-blur").className = `bg-blur type-${mainType}`;
  document.getElementById("typeBg").className = `type-bg type-${mainType}`;

  // Type badges
  const badgesEl = document.getElementById("typeBadges");
  badgesEl.innerHTML = data.types
    .map(
      (t) =>
        `<span class="type-badge badge-${t.type.name}">${t.type.name}</span>`,
    )
    .join("");

  // Stats
  renderStats(data.stats);

  // Attaques (20 premières)
  renderMoves(data.moves.slice(0, 20));

  // Évolutions
  renderEvolutions(speciesData.evolution_chain.url, id);
}

// ===== IMAGE (normal / shiny) =====
function updateImage(data, shiny) {
  const img = document.getElementById("pokemonImg");
  const src = shiny
    ? data.sprites?.other?.["official-artwork"]?.front_shiny ||
      data.sprites?.front_shiny
    : data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default;

  img.style.opacity = "0";
  img.style.transform = "scale(0.8)";
  setTimeout(() => {
    img.src = src || "";
    img.style.opacity = "1";
    img.style.transform = "";
  }, 200);
}

// Toggle shiny
document.getElementById("shinyHint").addEventListener("click", async () => {
  isShiny = !isShiny;
  const data = await fetch(`${API}/pokemon/${currentId}`).then((r) => r.json());
  updateImage(data, isShiny);
  document.getElementById("shinyHint").style.opacity = isShiny ? "1" : "0.5";
  document.getElementById("shinyHint").textContent = isShiny ? "🌟" : "✨";
});

// ===== STATS =====
function renderStats(stats) {
  const container = document.getElementById("statsContainer");
  container.innerHTML = "";
  stats.forEach((s) => {
    const info = STAT_LABELS[s.stat.name];
    if (!info) return;
    const pct = Math.min(100, (s.base_stat / 255) * 100);
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
      <span class="stat-name">${info.label}</span>
      <span class="stat-val">${s.base_stat}</span>
      <div class="stat-bar-wrap">
        <div class="stat-bar ${info.cls}" style="width:0%" data-pct="${pct}"></div>
      </div>
    `;
    container.appendChild(row);
  });

  // Animation des barres
  requestAnimationFrame(() => {
    container.querySelectorAll(".stat-bar").forEach((bar) => {
      bar.style.width = bar.dataset.pct + "%";
    });
  });
}

// ===== MOVES =====
function renderMoves(moves) {
  const container = document.getElementById("movesList");
  container.innerHTML = moves
    .map(
      (m) => `<span class="move-tag">${m.move.name.replace(/-/g, " ")}</span>`,
    )
    .join("");
}

// ===== ÉVOLUTIONS =====
async function renderEvolutions(chainUrl, currentPokemonId) {
  const container = document.getElementById("evoChain");
  container.innerHTML = '<span class="evo-loading">Chargement…</span>';

  try {
    const chainData = await fetch(chainUrl).then((r) => r.json());
    const chain = [];
    let node = chainData.chain;

    // Aplatit la chaîne
    while (node) {
      const speciesId = extractId(node.species.url);
      const trigger =
        node.evolves_to[0]?.evolution_details[0]?.trigger?.name || "";
      const level = node.evolves_to[0]?.evolution_details[0]?.min_level || "";
      const item = node.evolves_to[0]?.evolution_details[0]?.item?.name || "";
      const detail = level
        ? `Niv. ${level}`
        : item
          ? item.replace(/-/g, " ")
          : trigger;
      chain.push({ id: speciesId, name: node.species.name, detail });
      node = node.evolves_to[0] || null;
    }

    // Sprite pour chaque
    const spritePromises = chain.map((p) =>
      fetch(`${API}/pokemon/${p.id}`)
        .then((r) => r.json())
        .then((d) => ({ ...p, sprite: d.sprites?.front_default || "" })),
    );
    const steps = await Promise.all(spritePromises);

    container.innerHTML = "";
    steps.forEach((step, i) => {
      if (i > 0 && steps[i - 1].detail) {
        const arrow = document.createElement("div");
        arrow.className = "evo-arrow";
        arrow.innerHTML = `→<small>${steps[i - 1].detail}</small>`;
        container.appendChild(arrow);
      }
      const el = document.createElement("div");
      el.className = `evo-step${step.id === currentPokemonId ? " active" : ""}`;
      el.innerHTML = `
        <img src="${step.sprite}" alt="${step.name}"/>
        <span>${step.name}</span>
      `;
      el.addEventListener("click", () => loadPokemon(step.id));
      container.appendChild(el);
    });

    if (steps.length <= 1) {
      container.innerHTML =
        '<span class="evo-loading">Ce Pokémon n\'évolue pas.</span>';
    }
  } catch (e) {
    container.innerHTML =
      '<span class="evo-loading">Impossible de charger.</span>';
  }
}

function extractId(url) {
  const parts = url.split("/").filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}

// ===== NAVIGATION =====
document.getElementById("btnPrev").addEventListener("click", () => {
  if (currentId > 1) loadPokemon(currentId - 1);
});
document.getElementById("btnNext").addEventListener("click", () => {
  loadPokemon(currentId + 1);
});

// Touches clavier
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && currentId > 1) loadPokemon(currentId - 1);
  if (e.key === "ArrowRight") loadPokemon(currentId + 1);
});

// ===== DÉMARRAGE =====
loadPokemon(currentId);

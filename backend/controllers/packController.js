const Card = require("../models/Card");
const User = require("../models/User");

// ── TYPES DES POKÉMONS SELON LEUR ID ────────────────────
const POKEMON_TYPES = {
  1: "grass",
  4: "fire",
  7: "water",
  10: "bug",
  13: "bug",
  16: "flying",
  25: "electric",
  6: "fire",
  9: "water",
  3: "grass",
  24: "fire",
  35: "fairy",
  131: "water",
  149: "dragon",
  144: "ice",
  145: "electric",
  146: "fire",
  150: "psychic",
  151: "psychic",
};

// ── POKÉMONS AVEC NIVEAUX ET RARETÉ ─────────────────────
const POKEMONS = [
  // Commun
  { id: 1, name: "Bulbizarre", rarity: "common" },
  { id: 4, name: "Salamèche", rarity: "common" },
  { id: 7, name: "Carapuce", rarity: "common" },
  { id: 10, name: "Chenipan", rarity: "common" },
  { id: 13, name: "Aspicot", rarity: "common" },
  { id: 16, name: "Roucool", rarity: "common" },
  // Uncommon
  { id: 25, name: "Pikachu", rarity: "uncommon" },
  { id: 6, name: "Dracaufeu", rarity: "uncommon" },
  { id: 9, name: "Florizarre", rarity: "uncommon" },
  { id: 3, name: "Herbizarre", rarity: "uncommon" },
  { id: 24, name: "Arcanine", rarity: "uncommon" },
  { id: 35, name: "Mélofée", rarity: "uncommon" },
  // Rare
  { id: 131, name: "Lokhlass", rarity: "rare" },
  { id: 149, name: "Dragonite", rarity: "rare" },
  { id: 144, name: "Artikodin", rarity: "rare" },
  { id: 145, name: "Électhorbe", rarity: "rare" },
  { id: 146, name: "Sulfura", rarity: "rare" },
  // Légendaire
  { id: 150, name: "Mewtwo", rarity: "legendary" },
  { id: 151, name: "Mew", rarity: "legendary" },
];

// ── PACKS DISPONIBLES ───────────────────────────────────
const PACKS_CATALOG = {
  starter: { name: "Starter", price: 50, cardsCount: 3, chances: { common: 0.7, uncommon: 0.25, rare: 0.04, legendary: 0.01 } },
  standard: { name: "Standard", price: 100, cardsCount: 5, chances: { common: 0.5, uncommon: 0.35, rare: 0.1, legendary: 0.05 } },
  premium: { name: "Premium", price: 200, cardsCount: 8, chances: { common: 0.3, uncommon: 0.4, rare: 0.2, legendary: 0.1 } },
  legendary: { name: "Legendary", price: 500, cardsCount: 10, chances: { common: 0.1, uncommon: 0.2, rare: 0.3, legendary: 0.4 } },
};

// ── Fonction pour générer une carte aléatoire ──────────
function generateRandomCard(userId, chances) {
  // Décider de la rareté selon les chances
  const rand = Math.random();
  let rarity = "common";
  let cumulativeChance = 0;

  for (const [key, value] of Object.entries(chances)) {
    cumulativeChance += value;
    if (rand <= cumulativeChance) {
      rarity = key;
      break;
    }
  }

  // Filtrer les pokémons de cette rareté
  const availablePokemon = POKEMONS.filter(p => p.rarity === rarity);
  const selected = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];

  // 1% chance shiny
  const isShiny = Math.random() < 0.01;
  const shinyPrefix = isShiny ? "✨ " : "";

  return {
    pokemonId: selected.id,
    pokemonName: shinyPrefix + selected.name,
    pokemonImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${isShiny ? '/shiny' : ''}/${selected.id}.png`,
    type: POKEMON_TYPES[selected.id] || "normal",
    hp: Math.floor(50 + Math.random() * 50),
    attack: Math.floor(40 + Math.random() * 60),
    defense: Math.floor(40 + Math.random() * 60),
    speed: Math.floor(35 + Math.random() * 55),
    owner: userId,
    rarity: rarity,
  };
}

// ══════════════════════════════════════════════════════
// GET /api/packs - Afficher les packs disponibles
// ══════════════════════════════════════════════════════
const getPacks = async (req, res) => {
  try {
    const packs = Object.entries(PACKS_CATALOG).map(([key, pack]) => ({
      id: key,
      name: pack.name,
      price: pack.price,
      cardsCount: pack.cardsCount,
      chances: pack.chances,
    }));
    res.json(packs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/packs/open - Ouvrir un pack
// ══════════════════════════════════════════════════════
const openPack = async (req, res) => {
  try {
    const { packType } = req.body;
    const userId = req.user._id;

    if (!packType || !PACKS_CATALOG[packType]) {
      return res.status(400).json({ message: "Type de pack invalide" });
    }

    const user = await User.findById(userId);
    const packInfo = PACKS_CATALOG[packType];

    // Vérifier si l'user a assez de tokens
    if (user.tokens < packInfo.price) {
      return res.status(400).json({ message: `Pas assez de tokens ! (${user.tokens}/${packInfo.price})` });
    }

    // Débiter les tokens
    user.tokens -= packInfo.price;

    // Générer les cartes
    const cards = [];
    for (let i = 0; i < packInfo.cardsCount; i++) {
      const cardData = generateRandomCard(userId, packInfo.chances);
      const card = await Card.create(cardData);
      cards.push(card);
      user.inventory.push(card._id);
    }

    await user.save();

    res.json({
      message: `Pack ${packInfo.name} ouvert !`,
      cards: cards,
      tokensRemaining: user.tokens,
    });
  } catch (error) {
    console.error("Erreur openPack :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getPacks, openPack };

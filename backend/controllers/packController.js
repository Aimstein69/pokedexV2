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
// ── LÉGENDAIRES ───────────────────────────────────────
const LEGENDARIES = [144, 145, 146, 150, 151];

// ── ÉVOLUTIONS FINALES (RARE) ─────────────────────────
const FINAL_EVOLUTIONS = [
  3, 6, 9, 12, 15, 18, 20, 22, 24, 26, 28, 31, 34, 36, 38, 40, 45, 47, 49, 51,
  53, 55, 57, 59, 62, 65, 68, 71, 73, 76, 78, 80, 82, 85, 87, 89, 91, 94, 97,
  99, 101, 103, 105, 106, 107, 110, 112, 115, 119, 121, 122, 124, 125, 126, 127,
  128, 130, 131, 134, 135, 136, 139, 141, 142, 143, 149,
];

// ── ÉVOLUTIONS INTERMÉDIAIRES (UNCOMMON) ─────────────
const MID_EVOLUTIONS = [
  2, 5, 8, 11, 14, 17, 19, 21, 23, 25, 27, 29, 30, 32, 33, 35, 37, 39, 44, 46,
  48, 50, 52, 54, 56, 58, 61, 64, 67, 70, 72, 75, 77, 79, 81, 84, 86, 88, 90,
  92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 116, 118, 120, 123, 133, 137,
  138, 140, 147, 148,
];

// ── Génération automatique des 151 Pokémon ───────────
const POKEMONS = [];

for (let i = 1; i <= 151; i++) {
  let rarity = "common";

  if (LEGENDARIES.includes(i)) {
    rarity = "legendary";
  } else if (FINAL_EVOLUTIONS.includes(i)) {
    rarity = "rare";
  } else if (MID_EVOLUTIONS.includes(i)) {
    rarity = "uncommon";
  }

  POKEMONS.push({
    id: i,
    name: `Pokemon-${i}`, // le vrai nom sera récupéré via l'image PokeAPI
    rarity,
  });
}

// ── PACKS DISPONIBLES ───────────────────────────────────
const PACKS_CATALOG = {
  starter: {
    name: "Starter",
    price: 50,
    cardsCount: 3,
    chances: { common: 0.7, uncommon: 0.25, rare: 0.04, legendary: 0.01 },
  },
  standard: {
    name: "Standard",
    price: 100,
    cardsCount: 5,
    chances: { common: 0.5, uncommon: 0.35, rare: 0.1, legendary: 0.05 },
  },
  premium: {
    name: "Premium",
    price: 200,
    cardsCount: 8,
    chances: { common: 0.3, uncommon: 0.4, rare: 0.2, legendary: 0.1 },
  },
  legendary: {
    name: "Legendary",
    price: 500,
    cardsCount: 10,
    chances: { common: 0.1, uncommon: 0.2, rare: 0.3, legendary: 0.4 },
  },
};

// ── Fonction pour générer une carte aléatoire ──────────
function generateRandomCard(userId, chances) {
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

  const availablePokemon = POKEMONS.filter((p) => p.rarity === rarity);
  const selected =
    availablePokemon[Math.floor(Math.random() * availablePokemon.length)];

  if (!selected) {
    console.error(`❌ Aucun Pokémon trouvé pour la rareté: ${rarity}`);
    console.error(`📊 POKEMONS disponibles:`, 
      Object.entries(
        POKEMONS.reduce((acc, p) => {
          acc[p.rarity] = (acc[p.rarity] || 0) + 1;
          return acc;
        }, {})
      )
    );
    throw new Error(`Pas de Pokémon disponible pour la rareté: ${rarity}`);
  }

  // ─── STATS SELON RARETÉ ─────────────────────────────
  const rarityStats = {
    common: {
      hp: [40, 70],
      attack: [30, 60],
      defense: [30, 60],
      speed: [30, 60],
    },
    uncommon: {
      hp: [60, 90],
      attack: [50, 80],
      defense: [50, 80],
      speed: [50, 80],
    },
    rare: {
      hp: [80, 120],
      attack: [70, 110],
      defense: [70, 110],
      speed: [70, 110],
    },
    legendary: {
      hp: [120, 210],
      attack: [100, 160],
      defense: [100, 160],
      speed: [100, 160],
    },
  };

  const stats = rarityStats[rarity];

  const randomStat = ([min, max]) =>
    Math.floor(min + Math.random() * (max - min));

  // 1% chance shiny
  const isShiny = Math.random() < 0.01;
  const shinyPrefix = isShiny ? "✨ " : "";

  return {
    pokemonId: selected.id,
    pokemonName: shinyPrefix + selected.name,
    pokemonImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${isShiny ? "/shiny" : ""}/${selected.id}.png`,
    type: POKEMON_TYPES[selected.id] || "normal",

    hp: randomStat(stats.hp),
    attack: randomStat(stats.attack),
    defense: randomStat(stats.defense),
    speed: randomStat(stats.speed),

    owner: userId,
    rarity,
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

    if (user.tokens < packInfo.price) {
      return res
        .status(400)
        .json({ message: `Pas assez de tokens ! (${user.tokens}/${packInfo.price})` });
    }

    user.tokens -= packInfo.price;

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
      cards,
      tokensRemaining: user.tokens,
    });
  } catch (error) {
    console.error("❌ Erreur openPack détaillée :", {
      message: error.message,
      stack: error.stack,
      errors: error.errors,
      name: error.name
    });
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔥 EXPORT OBLIGATOIRE
module.exports = { getPacks, openPack };
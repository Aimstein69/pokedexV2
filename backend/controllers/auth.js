const Battle = require("../models/Battle");
const User = require("../models/User");

// ══════════════════════════════════════════════════════
// POST /api/battles/create  — Lancer un défi
// ══════════════════════════════════════════════════════
const createBattle = async (req, res) => {
  try {
    const { opponentId, cardIndexes } = req.body;
    // cardIndexes = tableau d'index de l'inventaire du challenger

    if (!opponentId || !cardIndexes || cardIndexes.length === 0) {
      return res
        .status(400)
        .json({ message: "Adversaire et cartes obligatoires" });
    }

    if (opponentId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Tu ne peux pas te défier toi-même" });
    }

    const challenger = await User.findById(req.user._id);
    const opponent = await User.findById(opponentId);

    if (!opponent)
      return res.status(404).json({ message: "Adversaire introuvable" });

    // Vérifier que le challenger possède bien ces cartes
    const challengerCards = cardIndexes.map((i) => {
      const card = challenger.inventory[i];
      if (!card)
        throw new Error(`Carte à l'index ${i} introuvable dans ton inventaire`);
      return card;
    });

    const battle = await Battle.create({
      challenger: challenger._id,
      opponent: opponent._id,
      challengerCards: challengerCards,
      status: "pending",
    });

    res.status(201).json({
      message: `Défi envoyé à ${opponent.username} !`,
      battleId: battle._id,
      cards: challengerCards,
    });
  } catch (error) {
    console.error("Erreur createBattle :", error);
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/battles/:id/accept  — Accepter un défi et jouer
// ══════════════════════════════════════════════════════
const acceptBattle = async (req, res) => {
  try {
    const { cardIndexes } = req.body;

    const battle = await Battle.findById(req.params.id);
    if (!battle) return res.status(404).json({ message: "Combat introuvable" });
    if (battle.status !== "pending")
      return res
        .status(400)
        .json({ message: "Ce combat n'est plus disponible" });
    if (battle.opponent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Ce défi ne t'est pas destiné" });
    }

    const opponent = await User.findById(req.user._id);
    const challenger = await User.findById(battle.challenger);

    // Cartes de l'adversaire
    const opponentCards = cardIndexes.map((i) => {
      const card = opponent.inventory[i];
      if (!card) throw new Error(`Carte à l'index ${i} introuvable`);
      return card;
    });

    // ── Calcul de la puissance totale de chaque camp ──
    const calcPower = (cards) =>
      cards.reduce((sum, c) => sum + (c.hp + c.attack + c.defense), 0);
    const challengerPower = calcPower(battle.challengerCards);
    const opponentPower = calcPower(opponentCards);

    // ── Déterminer le gagnant ─────────────────────────
    const winnerId =
      challengerPower >= opponentPower ? battle.challenger : opponent._id;
    const loserId =
      challengerPower >= opponentPower ? opponent._id : battle.challenger;

    const winner = await User.findById(winnerId);
    const loser = await User.findById(loserId);

    // ── Transférer les cartes misées vers le gagnant ──
    const loserCards =
      winnerId.toString() === battle.challenger.toString()
        ? opponentCards
        : battle.challengerCards;

    winner.inventory.push(...loserCards);
    winner.stats.battlesWon += 1;
    winner.stats.totalCards += loserCards.length;
    loser.stats.battlesLost += 1;

    // Supprimer les cartes misées de l'inventaire du perdant
    const loserCardIds = loserCards.map((c) => c.pokemonId);
    loser.inventory = loser.inventory.filter(
      (c) => !loserCardIds.includes(c.pokemonId),
    );
    loser.stats.totalCards = loser.inventory.length;

    // Recalculer les scores
    winner.recalcScore();
    loser.recalcScore();

    await winner.save();
    await loser.save();

    // Mettre à jour le combat
    battle.opponentCards = opponentCards;
    battle.challengerPower = challengerPower;
    battle.opponentPower = opponentPower;
    battle.winner = winner._id;
    battle.loser = loser._id;
    battle.status = "finished";
    battle.finishedAt = new Date();
    await battle.save();

    res.json({
      message: `Combat terminé ! ${winner.username} gagne !`,
      winner: { id: winner._id, username: winner.username },
      loser: { id: loser._id, username: loser.username },
      challengerPower,
      opponentPower,
      cardsWon: loserCards,
    });
  } catch (error) {
    console.error("Erreur acceptBattle :", error);
    res.status(500).json({ message: error.message || "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/battles/:id/decline  — Refuser un défi
// ══════════════════════════════════════════════════════
const declineBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle) return res.status(404).json({ message: "Combat introuvable" });
    if (battle.opponent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    battle.status = "declined";
    await battle.save();

    res.json({ message: "Défi refusé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/battles/pending  — Ses défis en attente
// ══════════════════════════════════════════════════════
const getPendingBattles = async (req, res) => {
  try {
    const battles = await Battle.find({
      opponent: req.user._id,
      status: "pending",
    })
      .populate("challenger", "username avatar")
      .sort({ createdAt: -1 });

    res.json(battles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/battles/history  — Historique de ses combats
// ══════════════════════════════════════════════════════
const getBattleHistory = async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [{ challenger: req.user._id }, { opponent: req.user._id }],
      status: "finished",
    })
      .populate("challenger", "username avatar")
      .populate("opponent", "username avatar")
      .populate("winner", "username")
      .sort({ finishedAt: -1 })
      .limit(20);

    res.json(battles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  createBattle,
  acceptBattle,
  declineBattle,
  getPendingBattles,
  getBattleHistory,
};

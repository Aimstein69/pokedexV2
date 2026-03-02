// ── Récupère le token ──────────────────────────
function getToken() {
  return localStorage.getItem('token');
}

// ── Récupère l'user ────────────────────────────
function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

// ── Déconnexion ───────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/Login.html';
}

// ── Affiche/cache les boutons selon l'auth ────
function updateAuthUI() {
  const token = getToken();
  const notAuthButtons = document.getElementById('notAuthButtons');
  const authButtons = document.getElementById('authButtons');

  if (!token || token.trim() === '') {
    window.location.href = '/pages/Login.html';
    return;
  }

  notAuthButtons.style.display = 'none';
  authButtons.style.display = 'flex';
}

// ── Charge les batailles en attente ──────────
async function loadPendingBattles() {
  const token = getToken();
  
  try {
    const response = await fetch('/api/battles/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erreur API');
    
    const battles = await response.json();
    const container = document.getElementById('pvpContent');

    let html = `<h2>⚡ Batailles en attente</h2>`;

    if (battles.length === 0) {
      html += '<p class="empty-message">🆚 Aucune bataille en attente pour le moment.</p>';
    } else {
      html += '<div class="battles-list">';
      
      battles.forEach(battle => {
        html += `
          <div class="battle-card">
            <div class="challenger-info">
              <img src="${battle.challenger.avatar}" alt="${battle.challenger.username}"/>
              <h4>${battle.challenger.username}</h4>
              <p>${battle.challengerCards.length} cartes</p>
            </div>
            <div class="vs-divider">VS</div>
            <div class="opponent-info">
              <p>Vous</p>
            </div>
            <button class="btn-accept-battle" onclick="acceptBattle('${battle._id}')">
              ✅ Accepter
            </button>
            <button class="btn-decline-battle" onclick="declineBattle('${battle._id}')">
              ❌ Refuser
            </button>
          </div>
        `;
      });

      html += '</div>';
    }

    html += `
      <h2 style="margin-top: 3rem;">📜 Historique des batailles</h2>
    `;

    container.innerHTML = html;
    loadBattleHistory();

  } catch (error) {
    console.error('Erreur :', error);
    document.getElementById('pvpContent').innerHTML = '<h2>❌ Erreur de chargement</h2>';
  }
}

// ── Charge l'historique des batailles ───────
async function loadBattleHistory() {
  const token = getToken();
  
  try {
    const response = await fetch('/api/battles/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erreur API');
    
    const battles = await response.json();
    const container = document.getElementById('pvpContent');

    let existingHtml = container.innerHTML;
    let html = '';

    if (battles.length === 0) {
      html = '<p class="empty-message">📭 Aucune bataille terminée.</p>';
    } else {
      html = '<div class="history-list">';
      
      battles.forEach(battle => {
        const isWinner = battle.winner._id === getUser().id;
        html += `
          <div class="history-card ${isWinner ? 'win' : 'loss'}">
            <p><strong>${isWinner ? '✅ VICTOIRE' : '❌ DÉFAITE'}</strong></p>
            <p>${battle.challenger.username} vs ${battle.opponent.username}</p>
            <p class="battle-result">Gagnant: <strong>${battle.winner.username}</strong></p>
          </div>
        `;
      });

      html += '</div>';
    }

    container.innerHTML = existingHtml + html;

  } catch (error) {
    console.error('Erreur chargement historique :', error);
  }
}

// ── Accepter une bataille ────────────────────
async function acceptBattle(battleId) {
  alert('🧪 Système de bataille en développement !');
}

// ── Refuser une bataille ─────────────────────
async function declineBattle(battleId) {
  const token = getToken();

  try {
    const response = await fetch(`/api/battles/${battleId}/decline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('✅ Bataille refusée');
      loadPendingBattles();
    }
  } catch (error) {
    alert('❌ Erreur');
  }
}

// ── Au chargement ──────────────────────────────
updateAuthUI();
loadPendingBattles();
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadPendingBattles();
});

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

// ── Charge l'inventaire de cartes ─────────────
async function loadInventory() {
  const token = getToken();
  
  try {
    // Récupérer aussi le profil pour mettre à jour les tokens
    const profileResponse = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      const user = getUser();
      if (user) {
        user.tokens = profile.tokens;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    const response = await fetch('/api/users/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erreur API');
    
    const data = await response.json();
    const container = document.getElementById('inventoryContent');

    let html = `<h2>📦 Inventaire - ${data.total} cartes</h2>`;

    if (data.total === 0) {
      html += '<p class="empty-message">📭 Ton inventaire est vide. Ouvre des packs pour obtenir des cartes !</p>';
    } else {
      html += '<div class="cards-grid">';
      
      // Pour chaque carte, afficher ses détails
      for (const card of data.inventory) {
        html += `
          <div class="card-item">
            <div class="card-image">
              <img src="${card.pokemonImage}" alt="${card.pokemonName}" />
            </div>
            <div class="card-info">
              <h3>${card.pokemonName}</h3>
              <p class="card-type">Type: <span class="type-badge type-${card.type}">${card.type}</span></p>
              <div class="card-stats">
                <div class="stat">
                  <span class="stat-label">HP:</span>
                  <span class="stat-value">${card.hp}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">ATK:</span>
                  <span class="stat-value">${card.attack}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">DEF:</span>
                  <span class="stat-value">${card.defense}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      html += '</div>';
    }

    container.innerHTML = html;

  } catch (error) {
    console.error('Erreur :', error);
    document.getElementById('inventoryContent').innerHTML = '<h2>❌ Erreur de chargement</h2>';
  }
}

// ── Au chargement ──────────────────────────────
updateAuthUI();
loadInventory();
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadInventory();
});

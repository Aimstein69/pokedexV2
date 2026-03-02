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

// ── Afficher une notification moderne ────────
function showNotification(message, type = 'success', duration = 4000) {
  // Créer le conteneur des notifications s'il n'existe pas
  let container = document.getElementById('notifications-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notifications-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Créer la notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const colors = {
    success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.5)', text: '#22c55e' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.5)', text: '#3b82f6' }
  };
  
  const color = colors[type] || colors.info;
  
  notification.style.cssText = `
    background: linear-gradient(135deg, ${color.bg}, rgba(255,255,255,0.02));
    border: 2px solid ${color.border};
    border-radius: 16px;
    padding: 16px 24px;
    color: #f0f0ff;
    font-family: 'Nunito', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
                0 0 20px ${color.border};
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 320px;
    max-width: 420px;
  `;

  // Ajouter l'icône
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  const icon = document.createElement('span');
  icon.textContent = icons[type] || '💬';
  icon.style.fontSize = '1.3rem';
  icon.style.flexShrink = '0';
  
  const text = document.createElement('span');
  text.textContent = message;
  text.style.flex = '1';
  
  notification.appendChild(icon);
  notification.appendChild(text);
  
  container.appendChild(notification);
  container.style.pointerEvents = 'auto';

  // Animation de fermeture
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    setTimeout(() => {
      notification.remove();
      if (container.children.length === 0) {
        container.style.pointerEvents = 'none';
      }
    }, 300);
  }, duration);
}

// ── Modal de pack ouvert ─────────────────────
function showPackOpenedModal(message, cards) {
  // Créer le modal
  const modal = document.createElement('div');
  modal.className = 'pack-opened-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: linear-gradient(135deg, rgba(19, 19, 42, 0.95) 0%, rgba(79, 172, 254, 0.15) 100%);
    border: 3px solid rgba(255, 203, 5, 0.4);
    border-radius: 28px;
    padding: 40px;
    max-width: 800px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    backdrop-filter: blur(12px);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5),
                0 0 50px rgba(255, 203, 5, 0.15);
    animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  // Titre
  const title = document.createElement('h2');
  title.style.cssText = `
    font-family: 'Press Start 2P', monospace;
    font-size: 1.8rem;
    color: #ffcb05;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 203, 5, 0.3);
    margin-bottom: 10px;
    text-align: center;
  `;
  title.textContent = '🎉 ' + message;

  // Message de cartes
  const cardsCount = document.createElement('p');
  cardsCount.style.cssText = `
    text-align: center;
    color: #a0a0cc;
    font-size: 1rem;
    margin-bottom: 30px;
    font-weight: 600;
  `;
  cardsCount.textContent = `Tu as reçu ${cards.length} nouvelle(s) carte(s) ! 🎊`;

  // Grille de cartes
  const cardsGrid = document.createElement('div');
  cardsGrid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  `;

  cards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.style.cssText = `
      background: linear-gradient(135deg, rgba(19, 19, 42, 0.8), rgba(79, 172, 254, 0.1));
      border: 2px solid rgba(255, 203, 5, 0.3);
      border-radius: 16px;
      padding: 12px;
      text-align: center;
      animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both;
      transition: all 0.3s ease;
      cursor: pointer;
    `;
    
    cardEl.onmouseover = () => {
      cardEl.style.transform = 'translateY(-8px) scale(1.05)';
      cardEl.style.borderColor = '#ffcb05';
      cardEl.style.boxShadow = '0 12px 30px rgba(255, 203, 5, 0.3)';
    };
    
    cardEl.onmouseout = () => {
      cardEl.style.transform = 'translateY(0) scale(1)';
      cardEl.style.borderColor = 'rgba(255, 203, 5, 0.3)';
      cardEl.style.boxShadow = 'none';
    };

    const rarityEmoji = { 
      'common': '🟩',
      'uncommon': '🟦',
      'rare': '🟪',
      'legendary': '🟨'
    }[card.rarity] || '📦';

    cardEl.innerHTML = `
      <img src="${card.pokemonImage}" alt="${card.pokemonName}" style="width:cd.. 120px; height: 120px; object-fit: contain; margin-bottom: 8px; filter: drop-shadow(0 0 8px rgba(255, 203, 5, 0.3));" />
      <div style="font-size: 0.85rem; color: #ffcb05; font-weight: 700; margin-bottom: 6px;">${card.pokemonName}</div>
      <div style="font-size: 0.7rem; color: #a0a0cc; margin-bottom: 6px;">${rarityEmoji} ${card.rarity}</div>
      <div style="font-size: 0.7rem; color: #7777aa;">HP: ${card.hp}</div>
    `;

    cardsGrid.appendChild(cardEl);
  });

  // Bouton fermer
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #ffcb05, #ff9a00);
    border: none;
    border-radius: 14px;
    color: #000;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.75rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(255, 203, 5, 0.4);
    letter-spacing: 1px;
  `;
  closeBtn.textContent = '✨ Continuer';
  
  closeBtn.onmouseover = () => {
    closeBtn.style.transform = 'translateY(-3px)';
    closeBtn.style.boxShadow = '0 12px 40px rgba(255, 203, 5, 0.6)';
  };
  
  closeBtn.onmouseout = () => {
    closeBtn.style.transform = 'translateY(0)';
    closeBtn.style.boxShadow = '0 8px 24px rgba(255, 203, 5, 0.4)';
  };
  
  closeBtn.onclick = () => {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => modal.remove(), 300);
  };

  content.appendChild(title);
  content.appendChild(cardsCount);
  content.appendChild(cardsGrid);
  content.appendChild(closeBtn);
  modal.appendChild(content);
  
  // Ajouter les animations CSS
  if (!document.querySelector('#modal-animations')) {
    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(400px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(400px); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);
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

// ── Charge les packs disponibles ───────────────
async function loadPacks() {
  const token = getToken();
  try {
    // Récupérer les vraies données du serveur (tokens, etc)
    const profileResponse = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!profileResponse.ok) throw new Error('Erreur API');
    const profile = await profileResponse.json();
    
    // Mettre à jour le localStorage avec les vraies données
    const user = getUser();
    if (user) {
      user.tokens = profile.tokens;
      localStorage.setItem('user', JSON.stringify(user));
    }

    const response = await fetch('/api/packs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erreur API');
    
    const packs = await response.json();
    const container = document.getElementById('packsContent');

    let html = `
      <h2>
        🎁 Ouverture de Packs
        <span id="tokensDisplay">${profile.tokens}</span> ⚡
      </h2>
    `;
    html += '<div class="packs-list">';

    packs.forEach(pack => {
      const canBuy = profile.tokens >= pack.price;
      
      // Valeurs par défaut si chances n'existe pas
      const chances = pack.chances || { common: 0.5, uncommon: 0.3, rare: 0.15, legendary: 0.05 };
      
      // Déterminer l'icône et la rareté du pack
      let packIcon = '📦';
      let packColor = 'rgba(255, 203, 5, 0.1)';
      if (pack.id === 'starter') {
        packIcon = '🥚';
        packColor = 'rgba(100, 200, 100, 0.1)';
      } else if (pack.id === 'standard') {
        packIcon = '📦';
        packColor = 'rgba(100, 150, 255, 0.1)';
      } else if (pack.id === 'premium') {
        packIcon = '💎';
        packColor = 'rgba(255, 100, 200, 0.1)';
      } else if (pack.id === 'legendary') {
        packIcon = '👑';
        packColor = 'rgba(255, 200, 0, 0.1)';
      }
      
      html += `
        <div class="pack-card ${!canBuy ? 'disabled' : ''}" data-pack="${pack.id}">
          <div class="pack-header">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 0 10px rgba(255, 203, 5, 0.4));">${packIcon}</div>
            <h3>${pack.name}</h3>
            <p class="pack-price">💰 ${pack.price}</p>
          </div>
          <div class="pack-info">
            <p><strong>📊 Cartes :</strong> ${pack.cardsCount}</p>
            <p><strong>🎯 Rareté :</strong></p>
            <ul class="rarity-chances">
              <li>
                <span>🟩 Commun</span>
                <span>${Math.round(chances.common * 100)}%</span>
              </li>
              <li>
                <span>🟦 Uncommon</span>
                <span>${Math.round(chances.uncommon * 100)}%</span>
              </li>
              <li>
                <span>🟪 Rare</span>
                <span>${Math.round(chances.rare * 100)}%</span>
              </li>
              <li>
                <span>🟨 Légendaire</span>
                <span>${Math.round(chances.legendary * 100)}%</span>
              </li>
            </ul>
          </div>
          <button 
            class="btn-open-pack" 
            ${!canBuy ? 'disabled' : ''}
            onclick="openPack('${pack.id}', ${pack.price})"
          >
            ${canBuy ? '✨ Ouvrir Pack' : '❌ Pas assez'}
          </button>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error('Erreur :', error);
    document.getElementById('packsContent').innerHTML = '<h2>❌ Erreur de chargement</h2>';
  }
}

// ── Ouvre un pack ──────────────────────────────
async function openPack(packType, price) {
  const token = getToken();
  const user = getUser();
  const btn = event.target;

  // Animation du bouton
  btn.textContent = '⏳ Ouverture...';
  btn.disabled = true;

  try {
    const response = await fetch('/api/packs/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ packType })
    });

    const data = await response.json();

    if (!response.ok) {
      btn.textContent = '❌ Erreur';
      setTimeout(() => {
        btn.textContent = '✨ Ouvrir Pack';
        btn.disabled = false;
      }, 1500);
      showNotification(data.message, 'error', 4000);
      return;
    }

    // Mettre à jour les tokens de l'user
    user.tokens = data.tokensRemaining;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Animer la mise à jour des tokens
    const tokensDisplay = document.getElementById('tokensDisplay');
    tokensDisplay.style.animation = 'none';
    setTimeout(() => {
      tokensDisplay.textContent = data.tokensRemaining;
      tokensDisplay.style.animation = 'tokenUpdate 0.6s ease-out';
    }, 10);

    // Animation succès
    btn.textContent = '✅ Pack ouvert!';
    btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';

    // Afficher les cartes obtenues avec meilleure présentation
    const cardsText = data.cards.map((c, i) => {
      const rarityEmoji = { 
        'common': '🟩',
        'uncommon': '🟦',
        'rare': '🟪',
        'legendary': '🟨'
      }[c.rarity] || '📦';
      return `${i + 1}. ${rarityEmoji} ${c.pokemonName} (${c.rarity})`;
    }).join('\n');

    // Afficher une modal de succès
    showPackOpenedModal(data.message, data.cards);

    // Reset et reload après un court délai
    setTimeout(() => {
      loadPacks();
    }, 1200);

  } catch (error) {
    console.error('Erreur :', error);
    btn.textContent = '❌ Erreur serveur';
    setTimeout(() => {
      btn.textContent = '✨ Ouvrir Pack';
      btn.disabled = false;
    }, 1500);
    showNotification('Une erreur serveur s\'est produite', 'error', 4000);
  }
}

// ── Au chargement ──────────────────────────────
updateAuthUI();
loadPacks();
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadPacks();
});

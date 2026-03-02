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

// ── Fonction de notification moderne ────────
function showNotification(message, type = 'success', duration = 4000) {
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

  const notification = document.createElement('div');
  const colors = {
    success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.5)' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.5)' }
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
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 20px ${color.border};
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 320px;
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const icon = document.createElement('span');
  icon.textContent = icons[type] || '💬';
  icon.style.fontSize = '1.3rem';
  icon.style.flexShrink = '0';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  notification.appendChild(icon);
  notification.appendChild(text);
  container.appendChild(notification);
  container.style.pointerEvents = 'auto';

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
      notification.remove();
      if (container.children.length === 0) container.style.pointerEvents = 'none';
    }, 300);
  }, duration);

  if (!document.querySelector('#notif-animations')) {
    const style = document.createElement('style');
    style.id = 'notif-animations';
    style.textContent = `
      @keyframes slideInRight { from { opacity: 0; transform: translateX(400px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(400px); } }
    `;
    document.head.appendChild(style);
  }
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

// ── Charge le profil de l'utilisateur ────────
async function loadProfile() {
  const token = getToken();
  
  try {
    const response = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erreur API');
    
    const profile = await response.json();
    
    // Mettre à jour les tokens dans localStorage
    const user = getUser();
    if (user) {
      user.tokens = profile.tokens;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    const container = document.getElementById('profileContent');

    let html = `
      <h2>👤 Profil de ${profile.username}</h2>
      <div class="profile-card">
        <img src="${profile.avatar}" alt="${profile.username}" class="profile-avatar"/>
        <div class="profile-info">
          <p><strong>Pseudo :</strong> ${profile.username}</p>
          <p><strong>Email :</strong> ${profile.email}</p>
          <p><strong>Tokens :</strong> ⚡ ${profile.tokens}</p>
          <p><strong>Crédits :</strong> ${new Date(profile.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div class="stats-section">
        <h3>📊 Statistiques</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Victoires</span>
            <span class="stat-value">${profile.stats.wins}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Défaites</span>
            <span class="stat-value">${profile.stats.losses}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Égalités</span>
            <span class="stat-value">${profile.stats.draws}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Cartes</span>
            <span class="stat-value">${profile.inventory.length}</span>
          </div>
        </div>
      </div>

      <div class="daily-reward-section">
        <h3>🎁 Récompense Quotidienne</h3>
        <p>Jour ${profile.dailyLoginStreak} / Séquence active</p>
        <button class="btn-claim-daily" onclick="claimDailyReward()">Réclamer la récompense</button>
      </div>
    `;

    container.innerHTML = html;

  } catch (error) {
    console.error('Erreur :', error);
    document.getElementById('profileContent').innerHTML = '<h2>❌ Erreur de chargement</h2>';
  }
}

// ── Réclamer la récompense quotidienne ──────
async function claimDailyReward() {
  const token = getToken();

  try {
    const response = await fetch('/api/users/claim-daily-reward', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      showNotification(data.message, 'success', 4000);
      setTimeout(() => loadProfile(), 500);
    } else {
      const error = await response.json();
      showNotification(error.message || 'Erreur serveur', 'error', 4000);
    }
  } catch (error) {
    console.error('Erreur :', error);
    showNotification('Erreur serveur', 'error', 4000);
  }
}

// ── Au chargement ──────────────────────────────
updateAuthUI();
loadProfile();
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadProfile();
});

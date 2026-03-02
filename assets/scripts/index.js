// ===== VÉRIFICATION DE CONNEXION =====
/* (DÉSACTIVÉ TEMPORAIREMENT)
(async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'pages/Login.html';
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'pages/Login.html';
    }
  } catch (err) {
    console.error('Erreur d\'authentification');
    window.location.href = 'pages/Login.html';
  }
})();
*/

// ===== ÉTOILES DE FOND =====
(function generateStars() {
  const container = document.getElementById("stars");
  for (let i = 0; i < 120; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      --d: ${Math.random() * 3 + 2}s;
      --delay: ${Math.random() * 3}s;
    `;
    container.appendChild(star);
  }
})();

// ===== ANIMATION POKEBALL =====
const wrapper = document.getElementById("pokeballWrapper");
const pokeball = document.getElementById("pokeball");
const centerBtn = document.getElementById("centerBtn");
const flashOverlay = document.getElementById("flashOverlay");
const hint = document.getElementById("hint");

let isAnimating = false;

function spawnParticles() {
  const colors = ["#ffcb05", "#ff6b35", "#fff", "#4facfe", "#ff3860"];
  const rect = pokeball.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const angle = ((Math.PI * 2) / 20) * i + Math.random() * 0.5;
    const dist = 80 + Math.random() * 120;
    p.style.cssText = `
      left: ${cx - 4}px;
      top: ${cy - 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
      --dur: ${0.5 + Math.random() * 0.5}s;
    `;
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }
}

function triggerAnimation() {
  if (isAnimating) return;
  isAnimating = true;

  hint.style.opacity = "0";

  // Étape 1 : Shake (0ms)
  wrapper.classList.add("shake");

  // Étape 2 : Glow après le shake (500ms)
  setTimeout(() => {
    wrapper.classList.remove("shake");
    wrapper.classList.add("glow");
    spawnParticles();
  }, 500);

  // Étape 3 : Deuxième shake (900ms)
  setTimeout(() => {
    wrapper.classList.add("shake");
    spawnParticles();
  }, 900);

  // Étape 4 : Spin final (1400ms)
  setTimeout(() => {
    wrapper.classList.remove("shake");
    wrapper.classList.add("spin");
    spawnParticles();
  }, 1400);

  // Étape 5 : Flash blanc (1700ms)
  setTimeout(() => {
    flashOverlay.classList.add("active");
  }, 1700);

  // Étape 6 : Redirection (2100ms)
  setTimeout(() => {
    window.location.href = "pages/PokeCards.html";
  }, 2100);
}

centerBtn.addEventListener("click", triggerAnimation);

// Clic sur toute la pokeball aussi
wrapper.addEventListener("click", (e) => {
  // Évite double déclenchement si on a cliqué sur le bouton
  if (e.target === centerBtn) return;
  triggerAnimation();
});

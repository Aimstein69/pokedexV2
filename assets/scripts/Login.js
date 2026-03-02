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
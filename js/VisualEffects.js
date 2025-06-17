// js/VisualEffects.js

/**
 * Visual Effects Class
 * Handles all visual effects like damage numbers, explosions, and animations
 */
class VisualEffects {
  constructor(duckArea) {
    this.duckArea = duckArea;
    this.explosionColors = [
      "#ff6b6b",
      "#ffa726",
      "#ffee58",
      "#66bb6a",
      "#42a5f5",
      "#ab47bc",
    ];
  }

  /**
   * Create floating damage number effect
   */
  createDamageNumber(damage, x, y, isCrit = false) {
    const damageEl = document.createElement("div");
    damageEl.className = isCrit ? "damage-number crit" : "damage-number";
    damageEl.textContent = `-${damage.toLocaleString()}`;
    damageEl.style.left = x + "px";
    damageEl.style.top = y + "px";
    this.duckArea.appendChild(damageEl);

    if (isCrit) {
      this.createCritText(x, y);
      setTimeout(() => damageEl.remove(), 2000);
    } else {
      setTimeout(() => damageEl.remove(), 1800);
    }
  }

  /**
   * Create "CRIT!" text effect for critical hits
   */
  createCritText(x, y) {
    const critText = document.createElement("div");
    critText.className = "crit-text";
    critText.textContent = "CRIT!";
    critText.style.left = x - 40 + "px";
    critText.style.top = y - 60 + "px";
    this.duckArea.appendChild(critText);

    setTimeout(() => critText.remove(), 1500);
  }

  /**
   * Create floating coin reward effect
   */
  createCoinEffect(coins, x, y) {
    const coinEl = document.createElement("div");
    coinEl.className = "coin-effect";
    coinEl.textContent = `+${coins.toLocaleString()}💰`;
    coinEl.style.left = x + "px";
    coinEl.style.top = y + "px";
    this.duckArea.appendChild(coinEl);

    setTimeout(() => coinEl.remove(), 2200);
  }

  /**
   * Create explosion effect for duck death with coin shower
   */
  createExplosion(coinReward = 0) {
    const explosion = document.createElement("div");
    explosion.className = "explosion";

    // Create multiple explosion particles
    for (let i = 0; i < 30; i++) {
      const particle = this.createExplosionParticle(i);
      explosion.appendChild(particle);
    }

    this.duckArea.appendChild(explosion);
    setTimeout(() => explosion.remove(), 1200);

    // Create coin shower effect if coins were earned
    if (coinReward > 0) {
      this.createCoinShower(coinReward);
    }
  }

  /**
   * Create a shower of coins for duck death
   */
  createCoinShower(coinAmount) {
    const centerX = this.duckArea.offsetWidth / 2;
    const centerY = this.duckArea.offsetHeight / 2;

    // Create main coin reward display
    const mainCoin = document.createElement("div");
    mainCoin.className = "main-coin-reward";
    mainCoin.textContent = `+${coinAmount.toLocaleString()}💰`;
    mainCoin.style.left = centerX - 60 + "px";
    mainCoin.style.top = centerY - 80 + "px";
    this.duckArea.appendChild(mainCoin);

    setTimeout(() => mainCoin.remove(), 2500);

    // Create multiple smaller coin effects around the main one
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 80 + Math.random() * 40;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      const smallCoin = document.createElement("div");
      smallCoin.className = "small-coin-effect";
      smallCoin.textContent = "💰";
      smallCoin.style.left = x + "px";
      smallCoin.style.top = y + "px";
      this.duckArea.appendChild(smallCoin);

      setTimeout(() => smallCoin.remove(), 2000 + Math.random() * 500);
    }
  }

  /**
   * Create individual explosion particle
   */
  createExplosionParticle(index) {
    const particle = document.createElement("div");
    particle.className = "explosion-particle";
    particle.style.backgroundColor = this.getRandomExplosionColor();

    // Calculate particle trajectory
    const angle = (Math.PI * 2 * index) / 30;
    const distance = 100 + Math.random() * 150;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.setProperty("--dx", dx + "px");
    particle.style.setProperty("--dy", dy + "px");

    return particle;
  }

  /**
   * Get random color for explosion particles
   */
  getRandomExplosionColor() {
    return this.explosionColors[
      Math.floor(Math.random() * this.explosionColors.length)
    ];
  }

  /**
   * Add shake animation to duck
   */
  shakeDuck(duck) {
    duck.classList.add("shake");
    setTimeout(() => duck.classList.remove("shake"), 400);
  }

  /**
   * Create screen shake effect for major hits
   */
  createScreenShake(intensity = 1) {
    const container = document.querySelector(".game-container");
    if (!container) return;

    const shakeClass = `shake-${intensity}`;
    container.classList.add(shakeClass);

    setTimeout(() => {
      container.classList.remove(shakeClass);
    }, 300);
  }

  /**
   * Create impact ripple effect at click position
   */
  createImpactRipple(x, y) {
    const ripple = document.createElement("div");
    ripple.className = "impact-ripple";
    ripple.style.left = x - 25 + "px";
    ripple.style.top = y - 25 + "px";
    this.duckArea.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Create boss entrance effect
   */
  createBossEntranceEffect() {
    const bossEntrance = document.createElement("div");
    bossEntrance.className = "boss-entrance";
    bossEntrance.innerHTML = "👹 BOSS APPROACHES 👹";
    document.body.appendChild(bossEntrance);

    setTimeout(() => bossEntrance.remove(), 3000);
  }

  /**
   * Create level up effect
   */
  createLevelUpEffect() {
    const levelUp = document.createElement("div");
    levelUp.className = "level-up-effect";
    levelUp.innerHTML = "🎉 LEVEL UP! 🎉";
    this.duckArea.appendChild(levelUp);

    setTimeout(() => levelUp.remove(), 2000);
  }

  /**
   * Animate coin counter increase
   */
  animateCoinIncrease(coinElement, oldValue, newValue) {
    const duration = 500;
    const startTime = performance.now();
    const difference = newValue - oldValue;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = oldValue + difference * easeOut;

      coinElement.textContent = Math.floor(currentValue).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        coinElement.textContent = newValue.toLocaleString();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Create purchase success effect
   */
  createPurchaseEffect(buttonElement) {
    const effect = document.createElement("div");
    effect.className = "purchase-effect";
    effect.innerHTML = "✨ PURCHASED! ✨";

    const rect = buttonElement.getBoundingClientRect();
    effect.style.left = rect.left + rect.width / 2 + "px";
    effect.style.top = rect.top + "px";
    effect.style.position = "fixed";

    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1500);
  }

  /**
   * Clear all active effects (useful for cleanup)
   */
  clearAllEffects() {
    const effects = this.duckArea.querySelectorAll(
      ".damage-number, .coin-effect, .explosion, .crit-text"
    );
    effects.forEach((effect) => effect.remove());
  }
}

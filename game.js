let gameState = {
  coins: 0,
  currentDuck: 1,
  ducksKilled: 0,
  clickDamage: 1,
  weapon: {
    name: "Finger",
    damage: 1,
    icon: "👆",
  },
  upgradePrice: 5, // Reduced from 10 for faster early progression
  currentHP: 1,
  maxHP: 1,
  hasKnife: false,
  hasGun: false,
  knifeLevel: 0,
  gunLevel: 0,
  duckUpgradeLevel: 0,
  duckUpgradePrice: 75, // Increased slightly to balance new economy
  duckHPMultiplier: 1,
  duckCoinMultiplier: 1,
  hasAutoClicker: false,
  autoClickerDamage: 1,
  autoClickerUpgradePrice: 20,
  autoClickerInterval: null,
  achievements: new Set(),
  // New boss and crit system
  isBoss: false,
  bossPhase: "normal", // 'normal' or 'enraged'
  critChance: 8, // Base 8% crit chance
  critMultiplier: 3,
  bossesKilled: 0,
};

const achievements = [
  {
    id: "first_kill",
    icon: "🎯",
    title: "First Blood",
    description: "Kill your first duck",
    requirement: () => gameState.ducksKilled >= 1,
  },
  {
    id: "quick_start",
    icon: "⚡",
    title: "Quick Start",
    description: "Kill 3 ducks in first minute",
    requirement: () => gameState.ducksKilled >= 3,
  },
  {
    id: "coin_collector",
    icon: "💰",
    title: "Coin Collector",
    description: "Earn 50 coins",
    requirement: () => gameState.coins >= 50,
  },
  {
    id: "weapon_master",
    icon: "⚔️",
    title: "Weapon Master",
    description: "Buy your first weapon",
    requirement: () => gameState.hasKnife || gameState.hasGun,
  },
  {
    id: "duck_hunter",
    icon: "🏹",
    title: "Duck Hunter",
    description: "Kill 10 ducks",
    requirement: () => gameState.ducksKilled >= 10,
  },
  {
    id: "first_boss",
    icon: "👹",
    title: "Boss Slayer",
    description: "Defeat your first boss duck",
    requirement: () => gameState.bossesKilled >= 1,
  },
  {
    id: "automation",
    icon: "🤖",
    title: "Automation",
    description: "Buy auto clicker",
    requirement: () => gameState.hasAutoClicker,
  },
  {
    id: "power_player",
    icon: "💪",
    title: "Power Player",
    description: "Upgrade damage 5 times",
    requirement: () => gameState.clickDamage >= 6,
  },
  {
    id: "elite_hunter",
    icon: "👑",
    title: "Elite Hunter",
    description: "Kill 25 ducks",
    requirement: () => gameState.ducksKilled >= 25,
  },
  {
    id: "boss_hunter",
    icon: "🔥",
    title: "Boss Hunter",
    description: "Defeat 5 boss ducks",
    requirement: () => gameState.bossesKilled >= 5,
  },
];

const elements = {
  coins: document.getElementById("coins"),
  duckNumber: document.getElementById("duckNumber"),
  duckTitle: document.getElementById("duckTitle"),
  bossIndicator: document.getElementById("bossIndicator"),
  bossPhase: document.getElementById("bossPhase"),
  weaponIcon: document.getElementById("weaponIcon"),
  weaponName: document.getElementById("weaponName"),
  weaponDamage: document.getElementById("weaponDamage"),
  ducksKilled: document.getElementById("ducksKilled"),
  bossesKilled: document.getElementById("bossesKilled"),
  autoClickerDamageDisplay: document.getElementById("autoClickerDamageDisplay"),
  currentHP: document.getElementById("currentHP"),
  maxHP: document.getElementById("maxHP"),
  hpBar: document.getElementById("hpBar"),
  duck: document.getElementById("duck"),
  duckArea: document.getElementById("duckArea"),
  upgradeClick: document.getElementById("upgradeClick"),
  upgradePrice: document.getElementById("upgradePrice"),
  buyKnife: document.getElementById("buyKnife"),
  buyGun: document.getElementById("buyGun"),
  upgradeDuck: document.getElementById("upgradeDuck"),
  duckUpgradePrice: document.getElementById("duckUpgradePrice"),
  buyAutoClicker: document.getElementById("buyAutoClicker"),
  achievementGrid: document.getElementById("achievementGrid"),
  notificationContainer: document.getElementById("notificationContainer"),
};

function updateDisplay() {
  elements.coins.textContent = gameState.coins.toLocaleString();
  elements.duckNumber.textContent = gameState.currentDuck;
  elements.weaponIcon.textContent = gameState.weapon.icon;
  elements.weaponName.textContent = gameState.weapon.name;
  elements.weaponDamage.textContent = gameState.weapon.damage;
  elements.ducksKilled.textContent = gameState.ducksKilled;
  elements.bossesKilled.textContent = gameState.bossesKilled;
  elements.autoClickerDamageDisplay.textContent = gameState.hasAutoClicker
    ? gameState.autoClickerDamage
    : 0;
  elements.currentHP.textContent = gameState.currentHP;
  elements.maxHP.textContent = gameState.maxHP;
  elements.upgradePrice.textContent = gameState.upgradePrice;
  elements.duckUpgradePrice.textContent = gameState.duckUpgradePrice;

  // Update boss display
  if (gameState.isBoss) {
    elements.bossIndicator.style.display = "inline";
    elements.duck.classList.add("boss");
    if (gameState.bossPhase === "enraged") {
      elements.duck.classList.add("enraged");
      elements.bossPhase.style.display = "inline";
      elements.bossPhase.textContent = " - ENRAGED!";
    } else {
      elements.duck.classList.remove("enraged");
      elements.bossPhase.style.display = "none";
    }
  } else {
    elements.bossIndicator.style.display = "none";
    elements.bossPhase.style.display = "none";
    elements.duck.classList.remove("boss", "enraged");
  }

  const progress =
    ((gameState.maxHP - gameState.currentHP) / gameState.maxHP) * 100;
  elements.hpBar.style.width = progress + "%";

  // Boss HP bar gets red color
  if (gameState.isBoss) {
    elements.hpBar.style.background =
      "linear-gradient(90deg, #ff1744, #d50000)";
    elements.hpBar.style.boxShadow = "0 0 20px rgba(255, 23, 68, 0.6)";
  } else {
    elements.hpBar.style.background =
      "linear-gradient(90deg, #ff6b6b, #ffa726)";
    elements.hpBar.style.boxShadow = "0 0 20px rgba(255, 107, 107, 0.5)";
  }

  // Update shop button states
  elements.upgradeClick.disabled = gameState.coins < gameState.upgradePrice;
  elements.buyKnife.disabled = gameState.coins < 50 || gameState.hasKnife;
  elements.buyGun.disabled = gameState.coins < 1000 || gameState.hasGun;
  elements.upgradeDuck.disabled = gameState.coins < gameState.duckUpgradePrice;
  elements.buyAutoClicker.disabled =
    gameState.coins < 25 || gameState.hasAutoClicker;

  // Update button text for owned items
  if (gameState.hasKnife) {
    elements.buyKnife.innerHTML = `
            <div class="button-content">
                <div class="button-title">🔪 Combat Knife</div>
                <div class="button-description">OWNED - Level ${gameState.knifeLevel}</div>
            </div>
            <div class="button-price">✓</div>
        `;
  }
  if (gameState.hasGun) {
    elements.buyGun.innerHTML = `
            <div class="button-content">
                <div class="button-title">🔫 Tactical Gun</div>
                <div class="button-description">OWNED - Level ${gameState.gunLevel}</div>
            </div>
            <div class="button-price">✓</div>
        `;
  }
  if (gameState.hasAutoClicker) {
    elements.buyAutoClicker.innerHTML = `
            <div class="button-content">
                <div class="button-title">🤖 Auto Striker</div>
                <div class="button-description">ACTIVE - Level ${gameState.autoClickerDamage}</div>
            </div>
            <div class="button-price">✓</div>
        `;
  }

  checkAchievements();
}

function checkAchievements() {
  achievements.forEach((achievement) => {
    if (
      !gameState.achievements.has(achievement.id) &&
      achievement.requirement()
    ) {
      gameState.achievements.add(achievement.id);
      showAchievementUnlocked(achievement);
    }
  });
  updateAchievementDisplay();
}

function updateAchievementDisplay() {
  elements.achievementGrid.innerHTML = "";
  achievements.forEach((achievement) => {
    const isUnlocked = gameState.achievements.has(achievement.id);
    const achievementElement = document.createElement("div");
    achievementElement.className = `achievement ${
      isUnlocked ? "unlocked" : ""
    }`;
    achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;
    elements.achievementGrid.appendChild(achievementElement);
  });
}

function showNotification(message, type = "default", duration = 3000) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = message;

  elements.notificationContainer.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);
}

function showAchievementUnlocked(achievement) {
  showNotification(
    `🏆 ${achievement.icon} ${achievement.title} Unlocked!`,
    "achievement",
    3000
  );
}

function showBossDefeat() {
  showNotification(
    `👹💥 BOSS DEFEATED! 🎁 Epic Rewards Earned!`,
    "boss-defeat",
    3000
  );
}

function showLevelComplete() {
  const bonusCoins = Math.floor(
    gameState.currentDuck * gameState.duckCoinMultiplier
  );
  showNotification(
    `🦆💥 Duck #${
      gameState.currentDuck
    } Eliminated! +${bonusCoins.toLocaleString()} Coins`,
    "level-complete",
    2500
  );
}

function createDamageNumber(damage, x, y, isCrit = false) {
  const damageEl = document.createElement("div");
  damageEl.className = isCrit ? "damage-number crit" : "damage-number";
  damageEl.textContent = `-${damage.toLocaleString()}`;
  damageEl.style.left = x + "px";
  damageEl.style.top = y + "px";
  elements.duckArea.appendChild(damageEl);

  if (isCrit) {
    // Add CRIT text
    const critText = document.createElement("div");
    critText.className = "crit-text";
    critText.textContent = "CRIT!";
    critText.style.left = x - 40 + "px";
    critText.style.top = y - 60 + "px";
    elements.duckArea.appendChild(critText);

    setTimeout(() => critText.remove(), 1500);
    setTimeout(() => damageEl.remove(), 2000);
  } else {
    setTimeout(() => damageEl.remove(), 1800);
  }
}

function createCoinEffect(coins, x, y) {
  const coinEl = document.createElement("div");
  coinEl.className = "coin-effect";
  coinEl.textContent = `+${coins.toLocaleString()}💰`;
  coinEl.style.left = x + "px";
  coinEl.style.top = y + "px";
  elements.duckArea.appendChild(coinEl);

  setTimeout(() => coinEl.remove(), 2200);
}

function createExplosion() {
  const explosion = document.createElement("div");
  explosion.className = "explosion";

  const colors = [
    "#ff6b6b",
    "#ffa726",
    "#ffee58",
    "#66bb6a",
    "#42a5f5",
    "#ab47bc",
  ];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "explosion-particle";
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    const angle = (Math.PI * 2 * i) / 30;
    const distance = 100 + Math.random() * 150;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.setProperty("--dx", dx + "px");
    particle.style.setProperty("--dy", dy + "px");

    explosion.appendChild(particle);
  }

  elements.duckArea.appendChild(explosion);
  setTimeout(() => explosion.remove(), 1200);
}

function checkBossPhase() {
  if (gameState.isBoss && gameState.bossPhase === "normal") {
    // Enter enraged phase at 30% HP
    if (gameState.currentHP <= Math.floor(gameState.maxHP * 0.3)) {
      gameState.bossPhase = "enraged";
      updateDisplay();
    }
  }
}

function autoClickerAttack() {
  if (gameState.currentHP <= 0 || !gameState.hasAutoClicker) return;

  const damage = gameState.autoClickerDamage;
  gameState.currentHP = Math.max(0, gameState.currentHP - damage);
  gameState.coins += 1;

  const duckRect = elements.duck.getBoundingClientRect();
  const areaRect = elements.duckArea.getBoundingClientRect();
  const centerX = duckRect.left + duckRect.width / 2 - areaRect.left;
  const centerY = duckRect.top + duckRect.height / 2 - areaRect.top;

  createDamageNumber(damage, centerX, centerY);
  createCoinEffect(1, centerX - 50, centerY - 30);

  elements.duck.classList.add("shake");
  setTimeout(() => elements.duck.classList.remove("shake"), 200);

  checkBossPhase();
  updateDisplay();

  if (gameState.currentHP <= 0) {
    setTimeout(nextDuck, 400);
  }
}

function nextDuck() {
  createExplosion();

  if (gameState.isBoss) {
    showBossDefeat();
    gameState.bossesKilled++;
  } else {
    showLevelComplete();
  }

  // Award coins for killing duck (with multiplier)
  const baseBonusCoins = gameState.currentDuck;
  let bonusCoins = Math.floor(baseBonusCoins * gameState.duckCoinMultiplier);

  // Boss bonus (3x normal reward)
  if (gameState.isBoss) {
    bonusCoins *= 3;
  }

  gameState.coins += bonusCoins;
  gameState.ducksKilled++;

  elements.duck.style.opacity = "0";

  setTimeout(() => {
    gameState.currentDuck++;

    // Check if next duck is a boss (every 10th duck)
    gameState.isBoss = gameState.currentDuck % 10 === 0;
    gameState.bossPhase = "normal";

    // Calculate HP - bosses have 3x HP
    let baseHP = Math.max(
      1,
      Math.floor(gameState.currentDuck * 0.8 * gameState.duckHPMultiplier)
    );
    if (gameState.isBoss) {
      baseHP *= 3;
      elements.duck.textContent = "👹"; // Boss emoji
    } else {
      elements.duck.textContent = "🦆"; // Regular duck
    }

    gameState.maxHP = baseHP;
    gameState.currentHP = gameState.maxHP;

    elements.duck.style.opacity = "1";
    updateDisplay();
  }, 600);
}

function attackDuck(e) {
  if (gameState.currentHP <= 0) return;

  const areaRect = elements.duckArea.getBoundingClientRect();

  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
    e.preventDefault();
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const x = clientX - areaRect.left;
  const y = clientY - areaRect.top;

  // Check for critical hit
  let baseCritChance = gameState.critChance;
  if (gameState.isBoss) {
    baseCritChance = 15; // Higher crit chance against bosses
  }

  const isCrit = Math.random() * 100 < baseCritChance;
  const baseDamage = gameState.weapon.damage;
  const damage = isCrit ? baseDamage * gameState.critMultiplier : baseDamage;

  gameState.currentHP = Math.max(0, gameState.currentHP - damage);

  // Enhanced coin rewards - bonus for early ducks to jumpstart progression
  let coinReward = Math.ceil(baseDamage / 10);
  if (gameState.ducksKilled < 10) {
    coinReward += 2; // Extra coins for first 10 ducks
  }
  if (isCrit) {
    coinReward *= 2; // Double coins on crit
  }
  gameState.coins += coinReward;

  createDamageNumber(damage, x, y, isCrit);
  createCoinEffect(coinReward, x - 50, y - 30);

  elements.duck.classList.add("shake");
  setTimeout(() => elements.duck.classList.remove("shake"), 400);

  checkBossPhase();
  updateDisplay();

  if (gameState.currentHP <= 0) {
    setTimeout(nextDuck, 400);
  }
}

// Shop functions
elements.upgradeClick.onclick = () => {
  if (gameState.coins >= gameState.upgradePrice) {
    gameState.coins -= gameState.upgradePrice;
    gameState.clickDamage++;

    // Only update weapon damage if currently using finger
    if (gameState.weapon.name === "Finger") {
      gameState.weapon.damage = gameState.clickDamage;
    }

    gameState.upgradePrice = Math.floor(gameState.upgradePrice * 1.3); // Gentler scaling
    updateDisplay();
  }
};

elements.buyKnife.onclick = () => {
  if (gameState.coins >= 50 && !gameState.hasKnife) {
    gameState.coins -= 50;
    gameState.hasKnife = true;
    gameState.knifeLevel = 1;
    gameState.weapon = {
      name: "Knife",
      damage: 20,
      icon: "🔪",
    };
    updateDisplay();
  }
};

elements.buyGun.onclick = () => {
  if (gameState.coins >= 1000 && !gameState.hasGun) {
    gameState.coins -= 1000;
    gameState.hasGun = true;
    gameState.gunLevel = 1;
    gameState.weapon = {
      name: "Gun",
      damage: 200,
      icon: "🔫",
    };
    updateDisplay();
  }
};

elements.upgradeDuck.onclick = () => {
  if (gameState.coins >= gameState.duckUpgradePrice) {
    gameState.coins -= gameState.duckUpgradePrice;
    gameState.duckUpgradeLevel++;
    gameState.duckHPMultiplier *= 2;
    gameState.duckCoinMultiplier *= 1.5;
    gameState.duckUpgradePrice *= 2;

    if (gameState.currentHP > 0) {
      const newMaxHP = Math.max(
        1,
        Math.floor(gameState.currentDuck * 0.8 * gameState.duckHPMultiplier)
      );
      const hpRatio = gameState.currentHP / gameState.maxHP;
      gameState.maxHP = newMaxHP;
      gameState.currentHP = Math.floor(newMaxHP * hpRatio);
    }

    updateDisplay();
  }
};

elements.buyAutoClicker.onclick = () => {
  if (gameState.coins >= 25 && !gameState.hasAutoClicker) {
    gameState.coins -= 25;
    gameState.hasAutoClicker = true;
    gameState.autoClickerDamage = 1;

    gameState.autoClickerInterval = setInterval(autoClickerAttack, 1000);

    updateDisplay();
  }
};

elements.duck.addEventListener("click", attackDuck);
elements.duck.addEventListener("touchstart", attackDuck);
elements.duck.addEventListener("contextmenu", (e) => e.preventDefault());

// Initialize
updateDisplay();
updateAchievementDisplay();

// Test notification on start
setTimeout(() => {
  showNotification(
    "🎮 Welcome to Duck Destroyer! Start clicking!",
    "level-complete",
    3000
  );
}, 1000);

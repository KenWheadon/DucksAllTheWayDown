// js/UIManager.js

/**
 * UI Element Manager Class
 * Handles all DOM element updates and display management
 */
class UIManager {
  constructor() {
    this.elements = this.initializeElements();
  }

  /**
   * Initialize all DOM element references
   */
  initializeElements() {
    return {
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
      autoClickerDamageDisplay: document.getElementById(
        "autoClickerDamageDisplay"
      ),
      currentHP: document.getElementById("currentHP"),
      maxHP: document.getElementById("maxHP"),
      hpBar: document.getElementById("hpBar"),
      duck: document.getElementById("duck"),
      duckArea: document.getElementById("duckArea"),
      upgradeClick: document.getElementById("upgradeClick"),
      upgradePrice: document.getElementById("upgradePrice"),
      buyKnife: document.getElementById("buyKnife"),
      knifeDescription: document.getElementById("knifeDescription"),
      knifePrice: document.getElementById("knifePrice"),
      buyGun: document.getElementById("buyGun"),
      gunDescription: document.getElementById("gunDescription"),
      gunPrice: document.getElementById("gunPrice"),
      upgradeDuck: document.getElementById("upgradeDuck"),
      duckUpgradePrice: document.getElementById("duckUpgradePrice"),
      buyAutoClicker: document.getElementById("buyAutoClicker"),
      autoClickerDescription: document.getElementById("autoClickerDescription"),
      autoClickerPrice: document.getElementById("autoClickerPrice"),
      achievementGrid: document.getElementById("achievementGrid"),
      notificationContainer: document.getElementById("notificationContainer"),
      eliteLevelDisplay: document.getElementById("eliteLevelDisplay"),
      eliteLevelNumber: document.getElementById("eliteLevelNumber"),
      eliteMultiplierText: document.getElementById("eliteMultiplierText"),
    };
  }

  /**
   * Update all display elements with current game state
   */
  updateDisplay(gameState) {
    this.updateBasicStats(gameState);
    this.updateEliteLevelDisplay(gameState);
    this.updateBossDisplay(gameState);
    this.updateHPBar(gameState);
    this.updateShopButtons(gameState);
    this.updateWeaponButtonDisplay(gameState);
    this.updateAutoClickerButtonDisplay(gameState);
  }

  /**
   * Update basic stat displays
   */
  updateBasicStats(gameState) {
    this.elements.coins.textContent = gameState.coins.toLocaleString();
    this.elements.duckNumber.textContent = gameState.currentDuck;
    this.elements.weaponIcon.textContent = gameState.weapon.icon;
    this.elements.weaponName.textContent = gameState.weapon.name;
    this.elements.weaponDamage.textContent = gameState.weapon.damage;
    this.elements.ducksKilled.textContent = gameState.ducksKilled;
    this.elements.bossesKilled.textContent = gameState.bossesKilled;
    this.elements.autoClickerDamageDisplay.textContent =
      gameState.hasAutoClicker ? gameState.autoClickerDamage : 0;
    this.elements.currentHP.textContent = gameState.currentHP;
    this.elements.maxHP.textContent = gameState.maxHP;
    this.elements.upgradePrice.textContent = gameState.upgradePrice;
    this.elements.duckUpgradePrice.textContent = gameState.duckUpgradePrice;
  }

  /**
   * Update elite level display
   */
  updateEliteLevelDisplay(gameState) {
    if (gameState.duckUpgradeLevel > 0) {
      this.elements.eliteLevelDisplay.style.display = "block";
      this.elements.eliteLevelNumber.textContent = gameState.duckUpgradeLevel;
      const hpMult = Math.pow(2, gameState.duckUpgradeLevel);
      const coinMult = Math.pow(1.5, gameState.duckUpgradeLevel).toFixed(1);
      this.elements.eliteMultiplierText.textContent = `${hpMult}x HP • ${coinMult}x Coins`;
    } else {
      this.elements.eliteLevelDisplay.style.display = "none";
    }
  }

  /**
   * Update boss-related display elements
   */
  updateBossDisplay(gameState) {
    if (gameState.isBoss) {
      this.elements.bossIndicator.style.display = "inline";
      this.elements.duck.classList.add("boss");

      if (gameState.bossPhase === "enraged") {
        this.elements.duck.classList.add("enraged");
        this.elements.bossPhase.style.display = "inline";
        this.elements.bossPhase.textContent = " - ENRAGED!";
      } else {
        this.elements.duck.classList.remove("enraged");
        this.elements.bossPhase.style.display = "none";
      }
    } else {
      this.elements.bossIndicator.style.display = "none";
      this.elements.bossPhase.style.display = "none";
      this.elements.duck.classList.remove("boss", "enraged");
    }
  }

  /**
   * Update HP bar display and styling
   */
  updateHPBar(gameState) {
    const progress =
      ((gameState.maxHP - gameState.currentHP) / gameState.maxHP) * 100;
    this.elements.hpBar.style.width = progress + "%";

    // Boss HP bars have different styling
    if (gameState.isBoss) {
      this.elements.hpBar.style.background =
        "linear-gradient(90deg, #ff1744, #d50000)";
      this.elements.hpBar.style.boxShadow = "0 0 20px rgba(255, 23, 68, 0.6)";
    } else {
      this.elements.hpBar.style.background =
        "linear-gradient(90deg, #ff6b6b, #ffa726)";
      this.elements.hpBar.style.boxShadow = "0 0 20px rgba(255, 107, 107, 0.5)";
    }
  }

  /**
   * Update shop button states (enabled/disabled)
   */
  updateShopButtons(gameState) {
    this.elements.upgradeClick.disabled =
      gameState.coins < gameState.upgradePrice;
    this.elements.buyKnife.disabled = gameState.coins < gameState.knifePrice;
    this.elements.buyGun.disabled = gameState.coins < gameState.gunPrice;
    this.elements.upgradeDuck.disabled =
      gameState.coins < gameState.duckUpgradePrice;
    this.elements.buyAutoClicker.disabled =
      gameState.coins < gameState.autoClickerPrice;
  }

  /**
   * Update weapon button descriptions and prices
   */
  updateWeaponButtonDisplay(gameState) {
    // Update knife button
    if (gameState.knifeLevel > 0) {
      const damage =
        20 + (gameState.knifeLevel - 1) * 15 + gameState.clickDamage - 1;
      this.elements.knifeDescription.textContent = `Level ${gameState.knifeLevel} • ${damage} damage`;
      this.elements.knifePrice.textContent = `${gameState.knifePrice}💰`;
    } else {
      this.elements.knifeDescription.textContent = "20 damage per hit";
      this.elements.knifePrice.textContent = "50💰";
    }

    // Update gun button
    if (gameState.gunLevel > 0) {
      const damage =
        200 + (gameState.gunLevel - 1) * 150 + (gameState.clickDamage - 1) * 10;
      this.elements.gunDescription.textContent = `Level ${gameState.gunLevel} • ${damage} damage`;
      this.elements.gunPrice.textContent = `${gameState.gunPrice}💰`;
    } else {
      this.elements.gunDescription.textContent = "200 damage per shot";
      this.elements.gunPrice.textContent = "1000💰";
    }
  }

  /**
   * Update auto clicker button display
   */
  updateAutoClickerButtonDisplay(gameState) {
    if (gameState.autoClickerLevel > 0) {
      this.elements.autoClickerDescription.textContent = `Level ${gameState.autoClickerLevel} • ${gameState.autoClickerDamage} DPS`;
      this.elements.autoClickerPrice.textContent = `${gameState.autoClickerPrice}💰`;
    } else {
      this.elements.autoClickerDescription.textContent = "1 damage per second";
      this.elements.autoClickerPrice.textContent = "25💰";
    }
  }

  /**
   * Fade out duck for death animation
   */
  fadeOutDuck() {
    this.elements.duck.style.opacity = "0";
  }

  /**
   * Fade in duck after respawn
   */
  fadeInDuck() {
    this.elements.duck.style.opacity = "1";
  }

  /**
   * Get duck element for event binding
   */
  getDuckElement() {
    return this.elements.duck;
  }

  /**
   * Get duck area element for effects
   */
  getDuckArea() {
    return this.elements.duckArea;
  }
}

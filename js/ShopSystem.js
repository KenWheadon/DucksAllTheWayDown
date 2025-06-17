// js/ShopSystem.js

/**
 * Shop System Class
 * Handles all shop purchases and upgrades
 */
class ShopSystem {
  constructor(gameState, uiManager, notificationSystem, visualEffects) {
    this.gameState = gameState;
    this.uiManager = uiManager;
    this.notificationSystem = notificationSystem;
    this.visualEffects = visualEffects;
    this.onDuckDefeated = null;
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for all shop buttons
   */
  setupEventListeners() {
    this.uiManager.elements.upgradeClick.onclick = () => this.upgradeDamage();
    this.uiManager.elements.buyKnife.onclick = () => this.buyKnife();
    this.uiManager.elements.buyGun.onclick = () => this.buyGun();
    this.uiManager.elements.upgradeDuck.onclick = () => this.upgradeDuck();
    this.uiManager.elements.buyAutoClicker.onclick = () =>
      this.buyAutoClicker();
  }

  /**
   * Upgrade base damage
   */
  upgradeDamage() {
    if (!this.canAfford(this.gameState.upgradePrice)) return;

    this.purchase(this.gameState.upgradePrice);
    this.gameState.clickDamage++;
    this.updateWeaponDamage();
    this.gameState.upgradePrice = Math.floor(this.gameState.upgradePrice * 1.5);

    this.notificationSystem.showUpgrade(
      "Damage Enhancement",
      this.gameState.clickDamage - 1
    );
    this.visualEffects.createPurchaseEffect(
      this.uiManager.elements.upgradeClick
    );
  }

  /**
   * Buy or upgrade knife
   */
  buyKnife() {
    if (!this.canAfford(this.gameState.knifePrice)) return;

    this.purchase(this.gameState.knifePrice);

    if (this.gameState.knifeLevel === 0) {
      // First purchase
      this.gameState.hasKnife = true;
      this.gameState.knifeLevel = 1;
      this.gameState.weapon = {
        name: "Knife",
        damage: this.calculateKnifeDamage(),
        icon: "🔪",
      };
      this.notificationSystem.showWeaponPurchased("Combat Knife", "🔪");
    } else {
      // Upgrade existing knife
      this.gameState.knifeLevel++;
      this.gameState.weapon.damage = this.calculateKnifeDamage();
      this.notificationSystem.showUpgrade(
        "Combat Knife",
        this.gameState.knifeLevel
      );
    }

    this.gameState.knifePrice = Math.floor(this.gameState.knifePrice * 2);
    this.visualEffects.createPurchaseEffect(this.uiManager.elements.buyKnife);
  }

  /**
   * Buy or upgrade gun
   */
  buyGun() {
    if (!this.canAfford(this.gameState.gunPrice)) return;

    this.purchase(this.gameState.gunPrice);

    if (this.gameState.gunLevel === 0) {
      // First purchase
      this.gameState.hasGun = true;
      this.gameState.gunLevel = 1;
      this.gameState.weapon = {
        name: "Gun",
        damage: this.calculateGunDamage(),
        icon: "🔫",
      };
      this.notificationSystem.showWeaponPurchased("Tactical Gun", "🔫");
    } else {
      // Upgrade existing gun
      this.gameState.gunLevel++;
      this.gameState.weapon.damage = this.calculateGunDamage();
      this.notificationSystem.showUpgrade(
        "Tactical Gun",
        this.gameState.gunLevel
      );
    }

    this.gameState.gunPrice = Math.floor(this.gameState.gunPrice * 2);
    this.visualEffects.createPurchaseEffect(this.uiManager.elements.buyGun);
  }

  /**
   * Upgrade duck difficulty and rewards
   */
  upgradeDuck() {
    if (!this.canAfford(this.gameState.duckUpgradePrice)) return;

    this.purchase(this.gameState.duckUpgradePrice);
    this.gameState.duckUpgradeLevel++;
    this.gameState.duckHPMultiplier *= 2;
    this.gameState.duckCoinMultiplier *= 1.5;
    this.gameState.duckUpgradePrice *= 2;

    // Update current duck if alive
    this.updateCurrentDuckStats();

    this.notificationSystem.showUpgrade(
      "Elite Ducks",
      this.gameState.duckUpgradeLevel
    );
    this.visualEffects.createPurchaseEffect(
      this.uiManager.elements.upgradeDuck
    );
  }

  /**
   * Buy or upgrade auto clicker
   */
  buyAutoClicker() {
    if (!this.canAfford(this.gameState.autoClickerPrice)) return;

    this.purchase(this.gameState.autoClickerPrice);

    if (this.gameState.autoClickerLevel === 0) {
      // First purchase - activate auto clicker
      this.gameState.hasAutoClicker = true;
      this.gameState.autoClickerLevel = 1;
      this.gameState.autoClickerDamage = 1;
      this.notificationSystem.showAutoClickerActivated();
      this.startAutoClickerInterval();
    } else {
      // Upgrade existing auto clicker
      this.gameState.autoClickerLevel++;
      this.gameState.autoClickerDamage = this.gameState.autoClickerLevel * 2;
      this.notificationSystem.showUpgrade(
        "Auto Striker",
        this.gameState.autoClickerLevel
      );
    }

    this.gameState.autoClickerPrice = Math.floor(
      this.gameState.autoClickerPrice * 2
    );
    this.visualEffects.createPurchaseEffect(
      this.uiManager.elements.buyAutoClicker
    );
  }

  /**
   * Start auto clicker interval
   */
  startAutoClickerInterval() {
    if (this.gameState.autoClickerInterval) {
      clearInterval(this.gameState.autoClickerInterval);
    }

    this.gameState.autoClickerInterval = setInterval(() => {
      this.autoClickerAttack();
    }, 1000);
  }

  /**
   * Auto clicker attack method
   */
  autoClickerAttack() {
    if (this.gameState.currentHP <= 0 || !this.gameState.hasAutoClicker) return;

    const damage = this.gameState.autoClickerDamage;
    const coinReward = this.gameState.calculateCoinReward(damage, false);

    this.gameState.currentHP = Math.max(0, this.gameState.currentHP - damage);
    this.gameState.coins += coinReward;

    // Create visual effects at duck center
    const duckRect = this.uiManager.elements.duck.getBoundingClientRect();
    const areaRect = this.uiManager.elements.duckArea.getBoundingClientRect();
    const centerX = duckRect.left + duckRect.width / 2 - areaRect.left;
    const centerY = duckRect.top + duckRect.height / 2 - areaRect.top;

    this.visualEffects.createDamageNumber(damage, centerX, centerY);
    this.visualEffects.createCoinEffect(coinReward, centerX - 50, centerY - 30);
    this.visualEffects.shakeDuck(this.uiManager.elements.duck);

    if (this.gameState.checkBossPhase()) {
      this.notificationSystem.showBossEnraged();
    }

    if (this.gameState.currentHP <= 0 && this.onDuckDefeated) {
      setTimeout(() => this.onDuckDefeated(), 400);
    }
  }

  /**
   * Set callback for duck defeated
   */
  setDuckDefeatedCallback(callback) {
    this.onDuckDefeated = callback;
  }

  /**
   * Check if player can afford a purchase
   */
  canAfford(price) {
    return this.gameState.coins >= price;
  }

  /**
   * Execute a purchase (deduct coins)
   */
  purchase(price) {
    this.gameState.coins -= price;
  }

  /**
   * Update weapon damage based on current upgrades
   */
  updateWeaponDamage() {
    if (this.gameState.weapon.name === "Finger") {
      this.gameState.weapon.damage = this.gameState.clickDamage;
    } else if (this.gameState.weapon.name === "Knife") {
      this.gameState.weapon.damage = this.calculateKnifeDamage();
    } else if (this.gameState.weapon.name === "Gun") {
      this.gameState.weapon.damage = this.calculateGunDamage();
    }
  }

  /**
   * Calculate knife damage based on level and upgrades
   */
  calculateKnifeDamage() {
    return (
      20 + (this.gameState.knifeLevel - 1) * 15 + this.gameState.clickDamage - 1
    );
  }

  /**
   * Calculate gun damage based on level and upgrades
   */
  calculateGunDamage() {
    return (
      200 +
      (this.gameState.gunLevel - 1) * 150 +
      (this.gameState.clickDamage - 1) * 10
    );
  }

  /**
   * Update current duck stats after duck upgrade
   */
  updateCurrentDuckStats() {
    if (this.gameState.currentHP > 0) {
      const duckStats = this.gameState.calculateDuckStats(
        this.gameState.currentDuck
      );
      const hpRatio = this.gameState.currentHP / this.gameState.maxHP;
      this.gameState.maxHP = duckStats.hp;
      this.gameState.currentHP = Math.floor(this.gameState.maxHP * hpRatio);
    }
  }

  /**
   * Stop auto clicker (for cleanup)
   */
  stopAutoClicker() {
    if (this.gameState.autoClickerInterval) {
      clearInterval(this.gameState.autoClickerInterval);
      this.gameState.autoClickerInterval = null;
    }
  }
}

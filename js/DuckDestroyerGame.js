// js/DuckDestroyerGame.js

/**
 * Main Game Class
 * Orchestrates all game systems and handles core game loop
 */
class DuckDestroyerGame {
  constructor() {
    this.initializeSystems();
    this.initializeGame();
  }

  /**
   * Initialize all game systems
   */
  initializeSystems() {
    this.gameState = new GameState();
    this.uiManager = new UIManager();
    this.achievementSystem = new AchievementSystem();
    this.visualEffects = new VisualEffects(this.uiManager.getDuckArea());
    this.notificationSystem = new NotificationSystem();
    this.shopSystem = new ShopSystem(
      this.gameState,
      this.uiManager,
      this.notificationSystem,
      this.visualEffects
    );

    // FIX: Set up shop system callback for duck defeats
    this.shopSystem.setDuckDefeatedCallback(() => this.nextDuck());
  }

  /**
   * Initialize the game
   */
  initializeGame() {
    this.setupInitialDuck();
    this.setupEventListeners();
    this.startGameLoop();
    this.showWelcomeMessage();
  }

  /**
   * Set up the initial duck stats
   */
  setupInitialDuck() {
    const duckStats = this.gameState.calculateDuckStats(
      this.gameState.currentDuck
    );
    this.gameState.maxHP = duckStats.hp;
    this.gameState.currentHP = this.gameState.maxHP;
    this.gameState.isBoss = duckStats.isBoss;
  }

  /**
   * Set up event listeners for user interactions
   */
  setupEventListeners() {
    const duck = this.uiManager.getDuckElement();
    duck.addEventListener("click", (e) => this.attackDuck(e));
    duck.addEventListener("touchstart", (e) => this.attackDuck(e));
    duck.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  /**
   * Start the main game loop
   */
  startGameLoop() {
    this.updateDisplay();
    this.achievementSystem.updateAchievementDisplay(this.gameState);
    this.startAutoClicker();
  }

  /**
   * Show welcome message after brief delay
   */
  showWelcomeMessage() {
    setTimeout(() => {
      this.notificationSystem.showWelcomeMessage();
    }, 1000);
  }

  /**
   * Handle duck attack (click/touch)
   */
  attackDuck(e) {
    if (this.gameState.currentHP <= 0) return;

    const attackInfo = this.getAttackInfo(e);
    const damage = this.calculateDamage();
    const coinReward = this.gameState.calculateCoinReward(
      damage.base,
      damage.isCrit
    );

    this.applyDamage(damage.total);
    this.awardCoins(coinReward);
    this.createVisualEffects(attackInfo.x, attackInfo.y, damage, coinReward);
    this.handlePostAttack();
  }

  /**
   * Get attack position information from event
   */
  getAttackInfo(e) {
    const areaRect = this.uiManager.getDuckArea().getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - areaRect.left,
      y: clientY - areaRect.top,
    };
  }

  /**
   * Calculate damage including critical hits
   */
  calculateDamage() {
    const baseDamage = this.gameState.weapon.damage;
    const critChance = this.gameState.getCurrentCritChance();
    const isCrit = Math.random() * 100 < critChance;
    const totalDamage = isCrit
      ? baseDamage * this.gameState.critMultiplier
      : baseDamage;

    return {
      base: baseDamage,
      total: totalDamage,
      isCrit: isCrit,
    };
  }

  /**
   * Apply damage to current duck
   */
  applyDamage(damage) {
    this.gameState.currentHP = Math.max(0, this.gameState.currentHP - damage);
  }

  /**
   * Award coins to player
   */
  awardCoins(amount) {
    this.gameState.coins += amount;
  }

  /**
   * Create visual effects for attack
   */
  createVisualEffects(x, y, damage, coinReward) {
    this.visualEffects.createDamageNumber(damage.total, x, y, damage.isCrit);
    this.visualEffects.createCoinEffect(coinReward, x - 50, y - 30);
    this.visualEffects.shakeDuck(this.uiManager.getDuckElement());

    if (damage.isCrit) {
      this.notificationSystem.showCriticalHit();
    }
  }

  /**
   * Handle post-attack logic
   */
  handlePostAttack() {
    if (this.gameState.checkBossPhase()) {
      this.notificationSystem.showBossEnraged();
    }

    this.updateDisplay();

    if (this.gameState.currentHP <= 0) {
      setTimeout(() => this.nextDuck(), 400);
    }
  }

  /**
   * Progress to next duck
   */
  nextDuck() {
    this.handleDuckDeath();
    this.awardLevelCompletionBonus();
    this.updateStats();
    this.createDeathEffects();
    this.respawnDuck();
  }

  /**
   * Handle duck death logic
   */
  handleDuckDeath() {
    if (this.gameState.isBoss) {
      this.gameState.bossesKilled++;
    }
    this.gameState.ducksKilled++;
  }

  /**
   * Award level completion bonus
   */
  awardLevelCompletionBonus() {
    const bonusCoins = this.gameState.getLevelCompletionReward();
    this.gameState.coins += bonusCoins;
  }

  /**
   * Update game statistics
   */
  updateStats() {
    // Could add more complex stat tracking here
  }

  /**
   * Create visual effects for duck death
   */
  createDeathEffects() {
    this.visualEffects.createExplosion();
    this.notificationSystem.showLevelComplete(this.gameState);
    this.uiManager.fadeOutDuck();
  }

  /**
   * Respawn duck with new stats
   */
  respawnDuck() {
    setTimeout(() => {
      this.gameState.currentDuck++;
      this.setupNewDuck();
      this.uiManager.fadeInDuck();
      this.updateDisplay();
      this.checkForBossAnnouncement();
    }, 1000);
  }

  /**
   * Set up new duck with calculated stats
   */
  setupNewDuck() {
    const duckStats = this.gameState.calculateDuckStats(
      this.gameState.currentDuck
    );
    this.gameState.maxHP = duckStats.hp;
    this.gameState.currentHP = this.gameState.maxHP;
    this.gameState.isBoss = duckStats.isBoss;
    this.gameState.bossPhase = "normal";
  }

  /**
   * Check if next duck is a boss and announce it
   */
  checkForBossAnnouncement() {
    if (this.gameState.isBoss) {
      this.notificationSystem.showBossApproaching(this.gameState.currentDuck);
      this.visualEffects.createBossEntranceEffect();
    }
  }

  /**
   * Auto clicker attack logic
   */
  autoClickerAttack() {
    // FIX: Delegate to shop system to avoid duplication
    this.shopSystem.autoClickerAttack();
  }

  /**
   * Start auto clicker if available
   */
  startAutoClicker() {
    // FIX: Delegate to shop system
    if (this.gameState.hasAutoClicker) {
      this.shopSystem.startAutoClickerInterval();
    }
  }

  /**
   * Stop auto clicker
   */
  stopAutoClicker() {
    if (this.gameState.autoClickerInterval) {
      clearInterval(this.gameState.autoClickerInterval);
      this.gameState.autoClickerInterval = null;
    }
  }

  /**
   * Update all displays
   */
  updateDisplay() {
    this.uiManager.updateDisplay(this.gameState);
    this.achievementSystem.checkAchievements(
      this.gameState,
      this.notificationSystem
    );
  }

  /**
   * Save game state (placeholder for future implementation)
   */
  saveGame() {
    const saveData = {
      gameState: this.gameState,
      timestamp: Date.now(),
    };
    // Could implement localStorage saving here
    return saveData;
  }

  /**
   * Load game state (placeholder for future implementation)
   */
  loadGame(saveData) {
    if (saveData && saveData.gameState) {
      Object.assign(this.gameState, saveData.gameState);
      this.updateDisplay();
      if (this.gameState.hasAutoClicker) {
        this.startAutoClicker();
      }
    }
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.stopAutoClicker();
    this.gameState = new GameState();
    this.setupInitialDuck();
    this.updateDisplay();
    this.achievementSystem.updateAchievementDisplay(this.gameState);
    this.notificationSystem.showSuccess("Game Reset!");
  }

  /**
   * Get game statistics
   */
  getStats() {
    return {
      totalDucks: this.gameState.ducksKilled,
      totalBosses: this.gameState.bossesKilled,
      totalCoins: this.gameState.coins,
      currentDPS: this.gameState.hasAutoClicker
        ? this.gameState.autoClickerDamage
        : 0,
      weaponDamage: this.gameState.weapon.damage,
      achievementProgress: this.achievementSystem.getProgress(this.gameState),
    };
  }
}

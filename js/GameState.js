// js/GameState.js

/**
 * Game State Management Class
 * Handles all game data and core game logic calculations
 */
class GameState {
  constructor() {
    this.coins = 0;
    this.currentDuck = 1;
    this.ducksKilled = 0;
    this.clickDamage = 1;
    this.weapon = {
      name: "Finger",
      damage: 1,
      icon: "👆",
    };
    this.upgradePrice = 10;
    this.currentHP = 1;
    this.maxHP = 1;

    // Weapon states
    this.hasKnife = false;
    this.hasGun = false;
    this.knifeLevel = 0;
    this.gunLevel = 0;
    this.knifePrice = 50;
    this.gunPrice = 1000;

    // Duck upgrade system
    this.duckUpgradeLevel = 0;
    this.duckUpgradePrice = 50;
    this.duckHPMultiplier = 1;
    this.duckCoinMultiplier = 1;

    // Auto clicker system
    this.hasAutoClicker = false;
    this.autoClickerLevel = 0;
    this.autoClickerDamage = 1;
    this.autoClickerPrice = 25;
    this.autoClickerInterval = null;

    // Achievement and combat systems
    this.achievements = new Set();
    this.isBoss = false;
    this.bossPhase = "normal";
    this.critChance = 8;
    this.critMultiplier = 3;
    this.bossesKilled = 0;
  }

  /**
   * Check if a duck number represents a boss
   */
  isBossDuck(duckNumber) {
    return duckNumber % 10 === 0;
  }

  /**
   * Calculate HP and boss status for a given duck number
   */
  calculateDuckStats(duckNumber) {
    const baseHP = duckNumber;
    let hp = Math.floor(baseHP * this.duckHPMultiplier);

    if (this.isBossDuck(duckNumber)) {
      hp = Math.floor(hp * 5); // Bosses have 5x HP
    }

    return {
      hp: Math.max(1, hp),
      isBoss: this.isBossDuck(duckNumber),
    };
  }

  /**
   * Check and update boss phase based on current HP
   * Returns true if boss became enraged
   */
  checkBossPhase() {
    if (this.isBoss && this.bossPhase === "normal") {
      // Enter enraged phase at 30% HP
      if (this.currentHP <= Math.floor(this.maxHP * 0.3)) {
        this.bossPhase = "enraged";
        return true; // Boss became enraged
      }
    }
    return false;
  }

  /**
   * Calculate coin reward for an attack
   */
  calculateCoinReward(baseDamage, isCrit = false) {
    let coinReward = Math.ceil(baseDamage / 10);

    // Bonus coins for early game
    if (this.ducksKilled < 10) {
      coinReward += 2;
    }

    // Critical hit bonus
    if (isCrit) {
      coinReward *= 2;
    }

    // Boss bonus
    if (this.isBoss) {
      coinReward *= 2;
    }

    return coinReward;
  }

  /**
   * Calculate critical hit chance based on current state
   */
  getCurrentCritChance() {
    let baseCritChance = this.critChance;

    // Higher crit chance against enraged bosses
    if (this.isBoss && this.bossPhase === "enraged") {
      baseCritChance = 20;
    }

    return baseCritChance;
  }

  /**
   * Get level completion reward
   */
  getLevelCompletionReward() {
    const baseReward = this.currentDuck;
    return Math.floor(baseReward * this.duckCoinMultiplier);
  }
}

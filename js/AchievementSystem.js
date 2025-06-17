// js/AchievementSystem.js

/**
 * Achievement System Class
 * Manages achievement definitions, checking, and display
 */
class AchievementSystem {
  constructor() {
    this.achievements = this.initializeAchievements();
  }

  /**
   * Initialize all achievement definitions
   */
  initializeAchievements() {
    return [
      {
        id: "first_kill",
        icon: "🎯",
        title: "First Blood",
        description: "Kill your first duck",
        requirement: (gameState) => gameState.ducksKilled >= 1,
      },
      {
        id: "quick_start",
        icon: "⚡",
        title: "Quick Start",
        description: "Kill 3 ducks in first minute",
        requirement: (gameState) => gameState.ducksKilled >= 3,
      },
      {
        id: "coin_collector",
        icon: "💰",
        title: "Coin Collector",
        description: "Earn 50 coins",
        requirement: (gameState) => gameState.coins >= 50,
      },
      {
        id: "weapon_master",
        icon: "⚔️",
        title: "Weapon Master",
        description: "Buy your first weapon",
        requirement: (gameState) => gameState.hasKnife || gameState.hasGun,
      },
      {
        id: "duck_hunter",
        icon: "🏹",
        title: "Duck Hunter",
        description: "Kill 10 ducks",
        requirement: (gameState) => gameState.ducksKilled >= 10,
      },
      {
        id: "first_boss",
        icon: "👹",
        title: "Boss Slayer",
        description: "Defeat your first boss duck",
        requirement: (gameState) => gameState.bossesKilled >= 1,
      },
      {
        id: "automation",
        icon: "🤖",
        title: "Automation",
        description: "Buy auto clicker",
        requirement: (gameState) => gameState.hasAutoClicker,
      },
      {
        id: "power_player",
        icon: "💪",
        title: "Power Player",
        description: "Upgrade damage 5 times",
        requirement: (gameState) => gameState.clickDamage >= 6,
      },
      {
        id: "elite_hunter",
        icon: "👑",
        title: "Elite Hunter",
        description: "Kill 25 ducks",
        requirement: (gameState) => gameState.ducksKilled >= 25,
      },
      {
        id: "boss_hunter",
        icon: "🔥",
        title: "Boss Hunter",
        description: "Defeat 5 boss ducks",
        requirement: (gameState) => gameState.bossesKilled >= 5,
      },
    ];
  }

  /**
   * Check for newly unlocked achievements and trigger notifications
   */
  checkAchievements(gameState, notificationSystem) {
    const newlyUnlocked = [];

    this.achievements.forEach((achievement) => {
      if (
        !gameState.achievements.has(achievement.id) &&
        achievement.requirement(gameState)
      ) {
        gameState.achievements.add(achievement.id);
        newlyUnlocked.push(achievement);
        notificationSystem.showAchievementUnlocked(achievement);
      }
    });

    // Update display if any achievements were unlocked
    if (newlyUnlocked.length > 0) {
      this.updateAchievementDisplay(gameState);
    }

    return newlyUnlocked;
  }

  /**
   * Update the achievement grid display
   */
  updateAchievementDisplay(gameState) {
    const achievementGrid = document.getElementById("achievementGrid");
    if (!achievementGrid) return;

    achievementGrid.innerHTML = "";

    this.achievements.forEach((achievement) => {
      const achievementElement = this.createAchievementElement(
        achievement,
        gameState
      );
      achievementGrid.appendChild(achievementElement);
    });
  }

  /**
   * Create a single achievement display element
   */
  createAchievementElement(achievement, gameState) {
    const isUnlocked = gameState.achievements.has(achievement.id);
    const achievementElement = document.createElement("div");
    achievementElement.className = `achievement ${
      isUnlocked ? "unlocked" : ""
    }`;

    // Responsive layout for very small screens
    if (window.innerWidth <= 360) {
      achievementElement.innerHTML =
        this.createMobileAchievementHTML(achievement);
    } else {
      achievementElement.innerHTML =
        this.createDesktopAchievementHTML(achievement);
    }

    return achievementElement;
  }

  /**
   * Create HTML for mobile achievement layout
   */
  createMobileAchievementHTML(achievement) {
    return `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
  }

  /**
   * Create HTML for desktop achievement layout
   */
  createDesktopAchievementHTML(achievement) {
    return `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;
  }

  /**
   * Get achievement by ID
   */
  getAchievementById(id) {
    return this.achievements.find((achievement) => achievement.id === id);
  }

  /**
   * Get all unlocked achievements for a game state
   */
  getUnlockedAchievements(gameState) {
    return this.achievements.filter((achievement) =>
      gameState.achievements.has(achievement.id)
    );
  }

  /**
   * Get achievement progress (how many unlocked vs total)
   */
  getProgress(gameState) {
    const unlocked = this.getUnlockedAchievements(gameState).length;
    const total = this.achievements.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  }
}

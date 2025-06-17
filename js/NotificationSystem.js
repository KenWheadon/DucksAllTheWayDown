// js/NotificationSystem.js

/**
 * Notification System Class
 * Handles all types of notifications and pop-up messages
 */
class NotificationSystem {
  constructor() {
    this.container = document.getElementById("notificationContainer");
    this.activeNotifications = new Set();
  }

  /**
   * Show a general notification
   */
  showNotification(message, type = "default", duration = 3000) {
    const notification = this.createNotificationElement(message, type);
    this.displayNotification(notification, duration);
  }

  /**
   * Create notification DOM element
   */
  createNotificationElement(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    return notification;
  }

  /**
   * Display notification and handle cleanup
   */
  displayNotification(notification, duration) {
    this.container.appendChild(notification);
    this.activeNotifications.add(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
        this.activeNotifications.delete(notification);
      }
    }, duration);
  }

  /**
   * Show achievement unlocked notification
   */
  showAchievementUnlocked(achievement) {
    const achievementEl = document.createElement("div");
    achievementEl.className = "level-complete";
    achievementEl.innerHTML = `🏆 Achievement Unlocked!<br>${achievement.icon} ${achievement.title}`;
    document.body.appendChild(achievementEl);

    setTimeout(() => achievementEl.remove(), 2500);
  }

  /**
   * Show level completion notification
   */
  showLevelComplete(gameState) {
    const baseReward = gameState.currentDuck;
    const multipliedReward = Math.floor(
      baseReward * gameState.duckCoinMultiplier
    );

    let message = `🦆💥 Duck #${gameState.currentDuck} Eliminated!`;
    if (gameState.isBoss) {
      message = `👹💥 BOSS DEFEATED!`;
    }

    const levelEl = document.createElement("div");
    levelEl.className = "level-complete";
    levelEl.innerHTML = `${message}<br>+${multipliedReward.toLocaleString()} Bonus Coins!`;
    document.body.appendChild(levelEl);

    setTimeout(() => levelEl.remove(), 2000);
  }

  /**
   * Show boss enraged notification
   */
  showBossEnraged() {
    this.showNotification(
      "👹 BOSS ENRAGED! Higher crit chance!",
      "boss-defeat",
      2000
    );
  }

  /**
   * Show boss approaching notification
   */
  showBossApproaching(duckNumber) {
    this.showNotification(
      `⚠️ Boss Duck #${duckNumber} Approaching!`,
      "boss-defeat",
      3000
    );
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    this.showNotification(
      "🎮 Welcome to Duck Destroyer! Start clicking!",
      "level-complete",
      3000
    );
  }

  /**
   * Show milestone notifications
   */
  showMilestone(message, type = "level-complete") {
    this.showNotification(message, type, 4000);
  }

  /**
   * Show error notification
   */
  showError(message) {
    this.showNotification(`❌ ${message}`, "error", 2000);
  }

  /**
   * Show success notification
   */
  showSuccess(message) {
    this.showNotification(`✅ ${message}`, "level-complete", 2000);
  }

  /**
   * Show upgrade notification
   */
  showUpgrade(upgradeName, level) {
    const message =
      level > 1
        ? `🔧 ${upgradeName} upgraded to level ${level}!`
        : `🔧 ${upgradeName} purchased!`;
    this.showNotification(message, "level-complete", 2000);
  }

  /**
   * Show weapon purchased notification
   */
  showWeaponPurchased(weaponName, weaponIcon) {
    this.showNotification(
      `${weaponIcon} ${weaponName} equipped!`,
      "weapon-purchase",
      2500
    );
  }

  /**
   * Show auto clicker notification
   */
  showAutoClickerActivated() {
    this.showNotification("🤖 Auto Striker activated!", "level-complete", 2500);
  }

  /**
   * Show critical hit notification (brief flash)
   */
  showCriticalHit() {
    // Brief screen flash effect
    const flash = document.createElement("div");
    flash.className = "crit-flash";
    flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 23, 68, 0.3);
            pointer-events: none;
            z-index: 999;
            animation: critFlash 0.2s ease-out;
        `;

    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
  }

  /**
   * Clear all active notifications
   */
  clearAllNotifications() {
    this.activeNotifications.forEach((notification) => {
      if (notification.parentNode) {
        notification.remove();
      }
    });
    this.activeNotifications.clear();
  }

  /**
   * Show combo notification for multiple quick kills
   */
  showCombo(comboCount) {
    if (comboCount >= 3) {
      this.showNotification(`🔥 ${comboCount}x COMBO!`, "boss-defeat", 1500);
    }
  }

  /**
   * Show DPS notification
   */
  showDPSUpdate(dps) {
    this.showNotification(`⚡ DPS: ${dps.toLocaleString()}`, "default", 1000);
  }
}

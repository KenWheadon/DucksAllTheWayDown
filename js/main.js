// js/main.js

/**
 * Main entry point for Duck Destroyer game
 * Initializes the game when DOM is loaded
 */

// Global game instance
let game;

/**
 * Initialize the game when DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Initialize the main game
    game = new DuckDestroyerGame();

    // Set up any global event listeners
    setupGlobalEventListeners();

    // Set up performance monitoring (optional)
    setupPerformanceMonitoring();

    console.log("🦆 Duck Destroyer initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize Duck Destroyer:", error);
    showFallbackError();
  }
});

/**
 * Set up global event listeners for the entire game
 */
function setupGlobalEventListeners() {
  // Handle window resize for responsive design
  window.addEventListener("resize", debounce(handleWindowResize, 250));

  // Handle visibility change (pause/resume when tab is hidden/shown)
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Handle keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);

  // Prevent context menu on right-click for better mobile experience
  document.addEventListener("contextmenu", function (e) {
    if (e.target.closest(".duck")) {
      e.preventDefault();
    }
  });
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
  if (game && game.achievementSystem) {
    // Refresh achievement display for responsive layout
    game.achievementSystem.updateAchievementDisplay(game.gameState);
  }
}

/**
 * Handle page visibility changes (tab switching)
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden - could pause auto-clicker or reduce performance
    console.log("Game paused (tab hidden)");
  } else {
    // Page is visible again
    console.log("Game resumed (tab visible)");
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
  // Only handle shortcuts if no input is focused
  if (
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA"
  ) {
    return;
  }

  switch (e.key.toLowerCase()) {
    case " ": // Spacebar - attack duck
      e.preventDefault();
      if (game && game.uiManager) {
        const duckElement = game.uiManager.getDuckElement();
        const rect = duckElement.getBoundingClientRect();
        const fakeEvent = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          preventDefault: () => {},
        };
        game.attackDuck(fakeEvent);
      }
      break;

    case "1": // Quick buy damage upgrade
      e.preventDefault();
      if (game && game.shopSystem) {
        game.shopSystem.upgradeDamage();
        game.updateDisplay();
      }
      break;

    case "2": // Quick buy knife
      e.preventDefault();
      if (game && game.shopSystem) {
        game.shopSystem.buyKnife();
        game.updateDisplay();
      }
      break;

    case "3": // Quick buy gun
      e.preventDefault();
      if (game && game.shopSystem) {
        game.shopSystem.buyGun();
        game.updateDisplay();
      }
      break;

    case "r": // Reset game (with confirmation)
      e.preventDefault();
      confirmReset();
      break;

    case "s": // Show stats
      e.preventDefault();
      showGameStats();
      break;
  }
}

/**
 * Confirm game reset
 */
function confirmReset() {
  if (
    confirm(
      "Are you sure you want to reset the game? All progress will be lost!"
    )
  ) {
    if (game) {
      game.resetGame();
    }
  }
}

/**
 * Show game statistics in console
 */
function showGameStats() {
  if (game) {
    const stats = game.getStats();
    console.table(stats);
    if (game.notificationSystem) {
      game.notificationSystem.showNotification(
        "📊 Stats logged to console (F12)",
        "default",
        2000
      );
    }
  }
}

/**
 * Set up performance monitoring
 */
function setupPerformanceMonitoring() {
  // Monitor frame rate for performance issues
  let lastTime = performance.now();
  let frameCount = 0;

  function checkPerformance() {
    frameCount++;
    const now = performance.now();

    if (now - lastTime >= 5000) {
      // Check every 5 seconds
      const fps = Math.round((frameCount * 1000) / (now - lastTime));

      if (fps < 30) {
        console.warn(`Low FPS detected: ${fps}fps`);
        // Could reduce visual effects or pause auto-clicker here
      }

      frameCount = 0;
      lastTime = now;
    }

    requestAnimationFrame(checkPerformance);
  }

  // Start monitoring
  requestAnimationFrame(checkPerformance);
}

/**
 * Show fallback error message if game fails to initialize
 */
function showFallbackError() {
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
  errorDiv.innerHTML = `
        <h2>🚨 Game Failed to Load</h2>
        <p>There was an error initializing Duck Destroyer.</p>
        <p>Please refresh the page or check the console for details.</p>
        <button onclick="location.reload()" style="
            background: white;
            color: red;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">Refresh Page</button>
    `;
  document.body.appendChild(errorDiv);
}

/**
 * Utility function to debounce frequent events
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utility function to throttle frequent events
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Global error handler
 */
window.addEventListener("error", function (e) {
  console.error("Global error caught:", e.error);
  if (game && game.notificationSystem) {
    game.notificationSystem.showError("An unexpected error occurred");
  }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener("unhandledrejection", function (e) {
  console.error("Unhandled promise rejection:", e.reason);
  if (game && game.notificationSystem) {
    game.notificationSystem.showError("An unexpected error occurred");
  }
});

/**
 * Expose game instance to global scope for debugging
 */
window.DuckDestroyer = {
  game: () => game,
  stats: () => (game ? game.getStats() : null),
  reset: () => (game ? game.resetGame() : null),
  save: () => (game ? game.saveGame() : null),
  load: (data) => (game ? game.loadGame(data) : null),
};

/**
 * Development helpers (only in development)
 */
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  // Add development shortcuts
  window.dev = {
    addCoins: (amount) => {
      if (game) {
        game.gameState.coins += amount;
        game.updateDisplay();
        console.log(`Added ${amount} coins`);
      }
    },
    skipToDuck: (duckNumber) => {
      if (game) {
        game.gameState.currentDuck = duckNumber;
        const duckStats = game.gameState.calculateDuckStats(duckNumber);
        game.gameState.maxHP = duckStats.hp;
        game.gameState.currentHP = game.gameState.maxHP;
        game.gameState.isBoss = duckStats.isBoss;
        game.updateDisplay();
        console.log(`Skipped to duck #${duckNumber}`);
      }
    },
    unlockAllAchievements: () => {
      if (game) {
        game.achievementSystem.achievements.forEach((achievement) => {
          game.gameState.achievements.add(achievement.id);
        });
        game.achievementSystem.updateAchievementDisplay(game.gameState);
        console.log("All achievements unlocked");
      }
    },
    maxWeapons: () => {
      if (game) {
        game.gameState.coins = 999999;
        for (let i = 0; i < 10; i++) {
          game.shopSystem.buyKnife();
          game.shopSystem.buyGun();
          game.shopSystem.upgradeDamage();
        }
        game.updateDisplay();
        console.log("Maxed out weapons");
      }
    },
  };

  console.log(
    "Development mode enabled. Use window.dev for debugging helpers."
  );
}

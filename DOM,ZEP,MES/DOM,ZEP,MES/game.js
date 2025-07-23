// ✅ Use this full code to replace your existing JS
// ELEMENTS
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const catchSound = document.getElementById('catch-sound');
const crashSound = document.getElementById('crash-sound');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const gameContainer = document.querySelector('.game-container');
const heartImages = document.querySelectorAll('.heart');

const pizzaRewardBox = document.getElementById("dominosReward");
const meeshoRewardBox = document.getElementById("meeshoReward");
const zeptoRewardBox = document.getElementById("zeptoReward");
const jobRewardBox = document.getElementById("jobReward");

const pizzaContinueBtn = document.getElementById("dominosContinueBtn");
const meeshoContinueBtn = document.getElementById("meeshoContinueBtn");
const zeptoContinueBtn = document.getElementById("zeptoContinueBtn");
const jobContinueBtn = document.getElementById("jobContinueBtn");

const levelIndicator = document.getElementById("level-indicator");
const levelImage = document.getElementById("levelImage");
const restartBtn = document.getElementById("restartBtn");

// GAME STATE
let lives = 3;
let score = 0;
let basketSpeed = 30;
let fallInterval = 1500;
let basketX;
let gameEnded = false;
let consecutiveCatches = 0;
let diamondCount = 0;
let gamePaused = true;
let currentLevel = 0;
let bombCount = 0;
let dropStep = 0; // for diamond pattern loop

let pizzaDropped = false;
let jobDropped = false;
let meeshoDropped = false;
let zeptoDropped = false;

function resetLevelCounts() {
  bombCount = 0;
  pizzaDropped = false;
  jobDropped = false;
  meeshoDropped = false;
  zeptoDropped = false;
}

function showLevelImage(level, callback) {
  gamePaused = true;
  levelImage.src = `level ${level}.png`;
  levelIndicator.style.display = "block";
  setTimeout(() => {
    levelIndicator.style.display = "none";
    gamePaused = false;
    if (callback) callback();
  }, 1500);
}

window.onload = () => {
  gameContainer.style.display = "block";
  basketX = window.innerWidth / 2 - basket.offsetWidth / 2;
  basket.style.left = basketX + "px";

  currentLevel = 1;
  resetLevelCounts();
  showLevelImage(1, () => {
    gamePaused = false;
    setInterval(() => {
      if (!gameEnded && !gamePaused) createItem();
    }, fallInterval);
  });

  if (restartBtn) {
    restartBtn.addEventListener("click", () => location.reload());
  }
};

function moveBasket(e) {
  if (e.key === 'ArrowLeft') move('left');
  else if (e.key === 'ArrowRight') move('right');
}

function move(direction) {
  if (gameEnded || gamePaused) return;
  const containerWidth = gameContainer.clientWidth;
  const basketWidth = basket.offsetWidth;
  if (direction === 'left') {
    basketX = Math.max(0, basketX - basketSpeed);
  } else if (direction === 'right') {
    basketX = Math.min(containerWidth - basketWidth, basketX + basketSpeed);
  }
  basket.style.left = basketX + 'px';
}

document.addEventListener('keydown', moveBasket);
['click', 'touchstart'].forEach(eventType => {
  leftBtn?.addEventListener(eventType, () => move('left'));
  rightBtn?.addEventListener(eventType, () => move('right'));
});

function checkLevelTransition() {
  const levels = [180, 150, 120, 100, 70, 40, 20];
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i] && currentLevel < 8 - i) {
      currentLevel = 8 - i;
      resetLevelCounts();
      showLevelImage(currentLevel);
      break;
    }
  }
}


function createItem() {
  if (gameEnded || gamePaused) return;

  const itemsToDrop = Math.floor(Math.random() * 2) + 1; // 1 to 2 items


  for (let i = 0; i < itemsToDrop; i++) {
    // Drop from random horizontal position (with more spacing)
    const posX = Math.random() * (window.innerWidth - 80); // wider spacing
    const offsetY = Math.floor(Math.random() * 60); // slight vertical random offset
    const posY = 0 + offsetY;

    const item = document.createElement('div');
    item.classList.add('falling-item');

    let type = 'diamond';
    let image = 'diamond.png';
    diamondCount++;

    const dropPizzaNow = (currentLevel === 3 || currentLevel === 4) && !pizzaDropped;
    const rand = Math.random();

    // ✅ Bomb logic
    const maxBombs = currentLevel === 1 ? 0 : (currentLevel === 2 ? 1 : 5);
    if (bombCount < maxBombs && rand < 0.15) {
      type = 'bomb';
      image = 'bomb 1.png';
      bombCount++;
    }

    // ✅ Rewards logic
    else if (dropPizzaNow && rand < 0.3) {
      type = 'pizza';
      image = 'dominos.png';
      pizzaDropped = true;
    } else if (score >= 120 && score < 150 && !jobDropped && rand < 0.08) {
      type = 'job';
      image = 'job.png';
      jobDropped = true;
    } else if (score >= 150 && score < 180 && !meeshoDropped && rand < 0.08) {
      type = 'meesho';
      image = 'meesho.png';
      meeshoDropped = true;
    } else if (score >= 180 && score < 200 && !zeptoDropped && rand < 0.08) {
      type = 'zepto';
      image = 'zepto.png';
      zeptoDropped = true;
    }

    item.dataset.type = type;
    item.style.backgroundImage = `url('${image}')`;
    item.style.left = posX + 'px';
    item.style.top = posY + 'px';
    gameContainer.appendChild(item);

    // 🎯 Slower speeds than before
    let speed = ['pizza', 'job', 'meesho', 'zepto'].includes(type)
  ? 7  // reward items drop slightly faster
  : type === 'diamond'
    ? (currentLevel === 1 ? 1.9 : 2.5)
    : score < 20
      ? 2
      : score < 40
      ? 3
      : score < 70
      ? 4
      : 5;

    function fall() {
      if (gameEnded || gamePaused) {
        item.remove();
        return;
      }

      const top = parseFloat(item.style.top);
      if (top + item.offsetHeight < window.innerHeight) {
        item.style.top = top + speed + 'px';
        item.style.zIndex = '5';

        if (isCaught(item)) {
          if (type === 'diamond') {
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
            catchSound.play();
            item.remove();
            checkLevelTransition();

            consecutiveCatches++;
            if (consecutiveCatches === 5 && lives < 3) {
              heartImages[lives].src = "red heart.png";
              lives++;
              consecutiveCatches = 0;
            }

            if (score % 20 === 0 && lives < 10) {
              heartImages[lives].src = "red heart.png";
              lives++;
            }
          } else if (type === 'bomb') {
            crashSound.play();
            item.remove();
            gameEnded = true;
            gameOver();
            return;
          } else {
            catchSound.play();
            item.remove();
            gamePaused = true;
            gameContainer.style.display = "none";

            let caught = JSON.parse(localStorage.getItem("caughtOffers") || "[]");
            if (type === 'pizza') {
              caught.push({ type: "dominos", label: "Dominos Job Reward", value: "5% OFF" });
              pizzaRewardBox.style.display = "flex";
            } else if (type === 'meesho') {
              caught.push({ type: "meesho", label: "Meesho Trend Offer", value: "7% OFF" });
              meeshoRewardBox.style.display = "flex";
            } else if (type === 'zepto') {
              caught.push({ type: "zepto", label: "Zepto Grocery Deal", value: "10% OFF" });
              zeptoRewardBox.style.display = "flex";
            } else if (type === 'job') {
              caught.push({ type: "job", label: "Career Boost Deal", value: "Flat 15% OFF" });
              jobRewardBox.style.display = "flex";
            }
            localStorage.setItem("caughtOffers", JSON.stringify(caught));
          }
          return;
        }

        requestAnimationFrame(fall);
      } else {
        item.remove();
        if (type === 'diamond') {
          lives--;
          if (lives >= 0 && heartImages[lives]) {
            heartImages[lives].src = "grey heart.png";
          }
          consecutiveCatches = 0;
          if (lives === 0) {
            gameEnded = true;
            gameOver();
          }
        }
      }
    }

    fall();
  }
}






function isCaught(item) {
  const itemRect = item.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();
  const verticalOffset = 8;
  const horizontalBuffer = 35;

  return (
    itemRect.bottom >= basketRect.top + verticalOffset &&
    itemRect.right - horizontalBuffer >= basketRect.left &&
    itemRect.left + horizontalBuffer <= basketRect.right
  );
}

function gameOver() {
  gameContainer.style.display = "none";
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreText = document.getElementById("finalScoreText");
  gameOverScreen.style.display = "flex";
  finalScoreText.textContent = "Your score: " + score;
}

// Reward continue buttons
pizzaContinueBtn.onclick = () => {
  pizzaRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};
meeshoContinueBtn.onclick = () => {
  meeshoRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};
zeptoContinueBtn.onclick = () => {
  zeptoRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};
jobContinueBtn.onclick = () => {
  jobRewardBox.style.display = 'none';
  gameContainer.style.display = 'block';
  gamePaused = false;
};

window.addEventListener('resize', () => {
  if (!gameEnded && gameContainer.style.display !== 'none') {
    basketX = Math.min(window.innerWidth - basket.offsetWidth, basketX);
    basket.style.left = basketX + 'px';
  }
});
